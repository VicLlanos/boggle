/* ===== SOCIAL LAYER (reactions · ready-up · profile cards) ===== */
const RX_EMOJIS=['👏','🔥','😂','😮','💀','🎉','😤','🧠'];
let rxRef=null,rxSeen={},rxLast=0,rxCode=null;
function socialAttach(code){
  socialDetach();
  rxCode=code;
  presenceSet({room:code,game:selectedGame,status:'lobby'});
  const fab=$('rxFab'); if(fab) fab.classList.add('on');
  const ref=db.ref('rooms/'+code+'/reactions');
  rxRef=ref;
  // Record what is already there so only NEW reactions animate
  ref.once('value').then(snap=>{
    if(rxRef!==ref) return;
    snap.forEach(c=>{ rxSeen[c.key]=true; });
    ref.on('child_added',c=>{
      if(rxSeen[c.key]) return;
      rxSeen[c.key]=true;
      const v=c.val()||{};
      showReaction(v.uid,v.e);
    });
  }).catch(()=>{});
}
function socialDetach(){
  if(rxRef){ try{rxRef.off();}catch(e){} }
  rxRef=null; rxSeen={}; rxCode=null; presStatus=null; socialRoomUpdate._pk='';
  presenceSet({room:null,game:null,status:null});
  const fab=$('rxFab'); if(fab) fab.classList.remove('on');
  const tr=$('rxTray'); if(tr) tr.classList.remove('on');
}
function showReaction(uid,emoji){
  const layer=$('rxLayer'); if(!layer||!emoji||RX_EMOJIS.indexOf(emoji)<0) return;
  const p=(roomData&&roomData.players&&roomData.players[uid])||{};
  const el=document.createElement('div');
  el.className='rx-float';
  el.style.left=(8+Math.random()*74)+'%';
  el.innerHTML='<span class="e">'+emoji+'</span><span class="w">'+esc(p.avatar||'')+' '+esc(uid===(user&&user.uid)?'You':(p.name||'Player'))+'</span>';
  layer.appendChild(el);
  setTimeout(()=>el.remove(),2500);
}
function sendReaction(emoji){
  if(!roomId||!user) return;
  const now=srvNow();
  if(now-rxLast<500) return; // anti-spam
  rxLast=now;
  const ref=db.ref('rooms/'+roomId+'/reactions').push();
  ref.set({uid:user.uid,e:emoji,at:now}).catch(()=>{});
  setTimeout(()=>{ ref.remove().catch(()=>{}); },5000);
}
function socialRoomUpdate(){
  if(!roomData||!user) return;
  const me=(roomData.players||{})[user.uid]||{};
  const st=roomData.status, lobby=st==='lobby';
  if(st!==presStatus){
    presStatus=st;
  }
  const _pk=(roomId||'')+'|'+(roomData.gameType||selectedGame||'')+'|'+st;
  if(_pk!==socialRoomUpdate._pk){
    socialRoomUpdate._pk=_pk;
    presenceSet({room:roomId||null,game:roomData.gameType||selectedGame||null,status:st});
  }
  const rb=$('btnReady');
  if(rb){
    rb.style.display=(lobby&&!isHostNow())?'flex':'none';
    rb.classList.toggle('on',!!me.ready);
    rb.textContent=me.ready?'✅ Ready — tap to undo':"✋ I'm ready";
  }
  // Host: show how many others are ready
  const start=$('btnStart');
  if(start&&lobby&&isHostNow()){
    const others=Object.values(roomData.players||{}).filter(p=>p.uid!==roomData.hostUid);
    const n=others.filter(p=>p.ready).length;
    start.textContent=others.length?('▶ START GAME · '+n+'/'+others.length+' ready'):'▶ START GAME';
  }
  // Clear my ready flag once a game begins so it doesn't carry into the next lobby
  if(!lobby&&me.ready){
    db.ref('rooms/'+roomId+'/players/'+user.uid+'/ready').set(false).catch(()=>{});
  }
}
function isHostNow(){ return !!roomData&&!!user&&roomData.hostUid===user.uid; }
let pcUid=null;
function paintCard(p){
  const title=p.title||(String(p.name||'').toLowerCase()===FOUNDER_NAME?'Founder':'');
  $('pcAv').textContent=p.avatar||'🎮';
  $('pcName').textContent=p.name||'Player';
  const pt=$('pcTitle'); pt.textContent=title; pt.classList.toggle('founder',title==='Founder');
  $('pcBio').textContent=p.bio||'';
  $('pcBio').style.display=p.bio?'block':'none';
  const st=$('pcStatus'); const info=pcUid&&friendsData[pcUid]?friendStatus(pcUid):null;
  st.textContent=info?info.text:''; st.classList.toggle('on',!!(info&&info.online));
}
async function showPlayerCard(uid,base){
  pcUid=uid;
  const p=base||((roomData&&roomData.players&&roomData.players[uid])||null)||friendProfiles[uid]||((user&&uid===user.uid)?profile:null)||{name:'Player'};
  paintCard(p);
  $('pcStats').innerHTML='';
  const ov=$('pcardOverlay'); ov.classList.add('on'); ov.setAttribute('aria-hidden','false');
  renderPcActions();
  // Fresh data + stats live on users/<uid>; optional if rules block reads
  try{
    const snap=await db.ref('users/'+uid).once('value');
    const u=snap.val(); if(!u||pcUid!==uid||!ov.classList.contains('on')) return;
    paintCard({name:u.name||p.name,avatar:u.avatar||p.avatar,title:u.title||p.title,bio:(u.bio!=null?u.bio:p.bio)});
    const a=u.attempts||0,c=u.correct||0;
    const lvl=levelFromXp(u.xp||0).level;
    $('pcStats').innerHTML=
      '<div><b>LV'+lvl+'</b><span>Level</span></div>'+
      '<div><b>'+(a?Math.round(c/a*100)+'%':'—')+'</b><span>Accuracy</span></div>'+
      '<div><b>'+(u.wordsFound||0)+'</b><span>Words</span></div>'+
      '<div><b>'+(u.bestScore||0)+'</b><span>Best</span></div>'+
      '<div><b>'+(u.streak||0)+'</b><span>Streak</span></div>'+
      '<div><b>'+(u.xp||0)+'</b><span>XP</span></div>';
  }catch(e){ /* stats unavailable */ }
}
function renderPcActions(){
  const box=$('pcActions'); if(!box) return;
  if(!pcUid||!user||pcUid===user.uid){ box.innerHTML=''; return; }
  let h='';
  if(friendsData[pcUid]){
    const j=joinableRoom(pcUid);
    if(j) h+='<button type="button" class="fr-btn ok" data-fa="join">🚪 Join their room ('+esc(j.room)+')</button>';
    h+='<button type="button" class="fr-btn" data-fa="visit">🏝️ Visit town</button>';
    h+='<button type="button" class="fr-btn danger" data-fa="remove">Remove friend</button>';
  }
  else if(reqIn[pcUid]) h='<button type="button" class="fr-btn ok" data-fa="accept">✅ Accept friend request</button><button type="button" class="fr-btn ghost" data-fa="decline">Decline</button>';
  else if(reqOut[pcUid]) h='<button type="button" class="fr-btn ghost" data-fa="cancel">⏳ Request sent — tap to cancel</button>';
  else h='<button type="button" class="fr-btn" data-fa="add">➕ Add friend</button>';
  box.innerHTML=h;
}
function closePlayerCard(){ const ov=$('pcardOverlay'); pcUid=null; if(ov){ov.classList.remove('on');ov.setAttribute('aria-hidden','true');} }
(function bindSocial(){
  const tray=$('rxTray'), fab=$('rxFab');
  if(tray){
    tray.innerHTML=RX_EMOJIS.map(e=>'<button type="button" data-e="'+e+'">'+e+'</button>').join('');
    tray.addEventListener('click',function(ev){
      const b=ev.target.closest&&ev.target.closest('button[data-e]'); if(!b) return;
      sendReaction(b.getAttribute('data-e'));
    });
  }
  if(fab) fab.addEventListener('click',function(){ tray.classList.toggle('on'); });
  const rb=$('btnReady');
  if(rb) rb.addEventListener('click',function(){
    if(!roomId||!user||!roomData) return;
    const cur=!!((roomData.players||{})[user.uid]||{}).ready;
    db.ref('rooms/'+roomId+'/players/'+user.uid+'/ready').set(!cur).catch(()=>toast('Could not update ready status'));
  });
  const pl=$('playerList');
  if(pl) pl.addEventListener('click',function(ev){
    const slot=ev.target.closest&&ev.target.closest('.pslot[data-uid]'); if(!slot) return;
    showPlayerCard(slot.getAttribute('data-uid'));
  });
  const ov=$('pcardOverlay'), cl=$('pcClose');
  if(cl) cl.addEventListener('click',closePlayerCard);
  if(ov) ov.addEventListener('click',function(ev){ if(ev.target===ov) closePlayerCard(); });
})();
