async function updateLobbyIndex(code, room){
  if(!room || room.status !== 'lobby'){
    await db.ref('lobbyIndex/'+(room?.gameType||selectedGame)+'/'+code).remove().catch(()=>{});
    return;
  }
  const n = Object.keys(room.players||{}).length;
  await db.ref('lobbyIndex/'+room.gameType+'/'+code).set({
    code,
    hostName: room.players?.[room.hostUid]?.name || 'Host',
    players: n,
    createdAt: room.createdAt || srvNow(),
    gameType: room.gameType,
    seen: srvNow()
  }).catch(()=>{});
}

$('btnHost').onclick=async()=>{
  if(!user||!profile)return;
  $('btnHost').disabled=true;
  try{
    const code=randCode();
    const gameType=selectedGame;
    if(gameType==='hangman') hangPrefetch();   // start fetching fresh puzzles while players join
    const room={
      code,hostUid:user.uid,status:'lobby',gameType,
      createdAt:srvNow(),maxPlayers:maxPlayersFor(gameType),
      board:null,endsAt:null,letter:null,categories:null,
      hangCategory:null,hangWord:null,hangRevealed:null,hangTiles:null,
      players:{[user.uid]:{uid:user.uid,name:profile.name,avatar:profile.avatar||'🦊',title:profile.title||(String(profile.name||'').toLowerCase()==='koyvic'?'Founder':'Newcomer'),bio:profile.bio||'',score:0,words:{},answers:{},hangSolved:false,hangWrong:0,isHost:true}}
    };
    await db.ref('rooms/'+code).set(room);
    await updateLobbyIndex(code, room);
    if(lobbyIndexRef){lobbyIndexRef.off();lobbyIndexRef=null}
    attachRoom(code,true);
  }catch(e){toast('Could not create: '+e.message)}
  $('btnHost').disabled=false;
};

async function joinRoomByCode(code){
  code = (code||'').trim().toUpperCase();
  if(code.length!==4){toast('Invalid room');return}
  try{
    const snap=await db.ref('rooms/'+code).once('value');
    if(!snap.exists()){toast('Room not found');return}
    const room=snap.val();
    if(room.status!=='lobby'){toast('Game already started');return}
    try{ if(room.hostUid&&room.hostUid!==user.uid){ const pr=(await db.ref('presence/'+room.hostUid).once('value')).val(); if(pr&&pr.online===false){toast('That host is offline right now');return} } }catch(e){}
    if(room.gameType && room.gameType !== selectedGame){
      toast('That room is for a different game');
      return;
    }
    const n=Object.keys(room.players||{}).length;
    const cap=room.maxPlayers||maxPlayersFor(room.gameType||selectedGame);if(n>=cap&&!(room.players||{})[user.uid]){toast('Room full (max '+cap+')');return}
    if(!(room.players||{})[user.uid]){
      await db.ref('rooms/'+code+'/players/'+user.uid).set({
        uid:user.uid,
        name:profile.name,
        avatar:profile.avatar||'🦊',
        title:profile.title||(String(profile.name||'').toLowerCase()==='koyvic'?'Founder':'Newcomer'),
        bio:profile.bio||'',
        score:0,words:{},answers:{},hangSolved:false,hangWrong:0,isHost:false
      });
    }else{
      await db.ref('rooms/'+code+'/players/'+user.uid).update(roomCosmetics()).catch(()=>{});
    }
    const snap2 = await db.ref('rooms/'+code).once('value');
    await updateLobbyIndex(code, snap2.val());
    if(lobbyIndexRef){lobbyIndexRef.off();lobbyIndexRef=null}
    attachRoom(code, room.hostUid===user.uid);
  }catch(e){toast('Join failed: '+e.message)}
}


/* ===== Presence accuracy: hide rooms/players that go offline ===== */
let discKey='',discN=-1;
function armDisconnect(force){
  if(!roomId||!roomData||!user)return;
  const live=roomData.status!=='lobby',key=roomId+'|'+(live?'live':'lobby')+'|'+(isHost?1:0);
  const gt=roomData.gameType||selectedGame;
  if(!live&&isHost){const n=Object.keys(roomData.players||{}).length;if(n!==discN){discN=n;updateLobbyIndex(roomId,roomData)}}
  if(key===discKey&&!force)return;discKey=key;
  const me=db.ref('rooms/'+roomId+'/players/'+user.uid),idx=db.ref('lobbyIndex/'+gt+'/'+roomId);
  me.onDisconnect().cancel();idx.onDisconnect().cancel();me.child('online').onDisconnect().cancel();
  if(!live){
    if(isHost)idx.onDisconnect().remove();      // room vanishes from the list the moment the host drops
    else me.onDisconnect().remove();            // a joiner who drops frees their slot
  }else{
    me.child('online').set(true).catch(()=>{});
    me.child('online').onDisconnect().set(false);
  }
}
setInterval(()=>{ // host heartbeat keeps the room listed while they are really here
  if(user&&roomId&&roomData&&roomData.status==='lobby'&&roomData.hostUid===user.uid)updateLobbyIndex(roomId,roomData);
},20000);
db.ref('.info/connected').on('value',async s=>{ // after a network blip, come back as if nothing happened
  if(!s.val()||!roomId||!user||!roomData||!profile)return;
  discKey='';
  try{
    const snap=await db.ref('rooms/'+roomId).once('value');
    if(snap.exists()&&snap.val().status==='lobby'){
      const r=snap.val();
      if(!(r.players||{})[user.uid])await db.ref('rooms/'+roomId+'/players/'+user.uid).set(Object.assign({uid:user.uid,name:profile.name,avatar:profile.avatar||'🦊',score:0,words:{},answers:{},isHost:false},roomCosmetics()));
      if(r.hostUid===user.uid)updateLobbyIndex(roomId,r);
    }
  }catch(e){}
  armDisconnect(true);
});
function attachRoom(code,host){if(roomId)db.ref('rooms/'+roomId).off();_roomSig='';roomId=code;isHost=host;$('roomCodeDisplay').textContent=code;db.ref('rooms/'+code).on('value',onRoom);socialAttach(code);show('screen-room')}

function renderPlayers(){const players=Object.values(roomData.players||{});const cap=roomData.maxPlayers||maxPlayersFor(roomData.gameType);let h='';players.forEach(p=>{const title=p.title||(String(p.name||'').toLowerCase()==='koyvic'?'Founder':'');const titleHtml=(title?`<span class="ptitle${title==='Founder'?' founder':''}">${esc(title)}</span>`:'')+(p.bio?`<span class="pbio">${esc(p.bio)}</span>`:'');const rdy=!!p.ready&&roomData.status==='lobby';h+=`<div class="pslot ${p.uid===user.uid?'you':''} ${p.uid===roomData.hostUid?'host':''} ${rdy?'ready':''}" data-uid="${esc(p.uid)}"><div class="av">${p.avatar||'🎮'}</div><div class="nm"><span class="pname">${esc(p.name||'Player')}${p.uid===user.uid?' (you)':''}</span>${titleHtml}</div><div class="bdg">${(p.online===false&&roomData.status!=='lobby')?'OFFLINE':(p.uid===roomData.hostUid?(rdy?'HOST ✓':'HOST'):(rdy?'READY ✓':'PLAYER'))}</div></div>`});for(let i=players.length;i<cap;i++){h+=`<div class="pslot empty"><div class="av">➕</div><div class="nm">Open slot</div><div class="bdg">OPEN</div></div>`}$('playerList').innerHTML=h;
  const gt=roomData.gameType||'boggle';
  $('roomGameLabel').textContent=gt==='chain'?'Word Chain · 2–6 players · last one standing':(gt==='board'?'Solo or up to 5 players · Snakes & Trivia':'Max 3 players · ')+(gt==='scatter'?'Scattergories':gt==='hangman'?'Hangman Race':gt==='draw'?'Sketch Race (max 6)':gt==='spy'?'Spy Word (3–6)':'Boggle');
}

function leaveRoom(){
  try{ if(typeof chainOnLeave==='function') chainOnLeave(); }catch(e){}   // Word Chain: leaving mid-game = eliminated
  try{ if(typeof drawDetachListeners==='function') drawDetachListeners(); }catch(e){}  // Sketch Race: stop stroke/guess listeners
  _roomSig='';
  socialDetach();
  if(roomId&&user){try{const _g=(roomData&&roomData.gameType)||selectedGame,_p='rooms/'+roomId+'/players/'+user.uid;db.ref(_p).onDisconnect().cancel();db.ref(_p+'/online').onDisconnect().cancel();db.ref('lobbyIndex/'+_g+'/'+roomId).onDisconnect().cancel()}catch(e){}}
  discKey='';discN=-1;
  if(roomId&&user){
    const code = roomId;
    const gt = roomData?.gameType || selectedGame;
    db.ref('rooms/'+code+'/players/'+user.uid).remove().catch(()=>{});
    // Update or remove lobby index
    db.ref('rooms/'+code).once('value').then(s=>{
      if(!s.exists()){ db.ref('lobbyIndex/'+gt+'/'+code).remove().catch(()=>{}); return; }
      const room = s.val();
      const n = Object.keys(room.players||{}).length;
      if(n===0 || (isHost && room.status==='lobby')){
        db.ref('rooms/'+code).remove().catch(()=>{});
        db.ref('lobbyIndex/'+gt+'/'+code).remove().catch(()=>{});
      } else if(room.status==='lobby'){
        updateLobbyIndex(code, room);
      }
    });
  }
  if(roomId)db.ref('rooms/'+roomId).off();
  roomId=null;roomData=null;isHost=false;
  clearInterval(timerInterval);stopBoardFx();
  show('screen-lobby');
}
$('btnLeaveRoom').onclick=leaveRoom;
// Every game screen has its own "Leave game" button (class .game-leave-btn) placed in the page flow
document.addEventListener('click',e=>{
  const b=e.target&&e.target.closest&&e.target.closest('.game-leave-btn');
  if(!b) return;
  if(confirm('Leave this game? Your current round progress may be lost.')) leaveRoom();
});
