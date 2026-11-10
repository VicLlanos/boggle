/* ===== FRIENDS: presence · requests · friend list ===== */
let friendsData={}, reqIn={}, reqOut={}, presenceMap={}, friendProfiles={}, fLis={}, fCore=[], fTab='list', presStatus=null, friendsReady=false;
const TS=()=>firebase.database.ServerValue.TIMESTAMP;
function presenceSet(fields){ if(!user) return; db.ref('presence/'+user.uid).update(fields).catch(()=>{}); }
function myUsernameKey(){ return user&&user.email?user.email.split('@')[0]:''; }
function friendsInit(){
  friendsTeardown();
  if(!user) return;
  const uid=user.uid;
  friendsReady=false;
  // Make sure my username can be found by friends (older accounts may lack a mapping)
  const key=myUsernameKey();
  if(key) db.ref('usernames/'+key).transaction(cur=>cur===null?uid:undefined).catch(()=>{});
  // Presence
  const con=db.ref('.info/connected');
  const pr=db.ref('presence/'+uid);
  con.on('value',s=>{
    if(s.val()!==true) return;
    pr.onDisconnect().set({online:false,last:TS()}).then(()=>{
      pr.set({online:true,last:TS(),room:rxCode||null,game:rxCode?selectedGame:null,status:rxCode?(roomData&&roomData.status)||'lobby':null});
    }).catch(()=>{});
  });
  fCore.push(()=>con.off());
  // Friends
  const fr=db.ref('friends/'+uid);
  fr.on('value',s=>{
    const next=s.val()||{};
    const prev=friendsData; friendsData=next;
    Object.keys(next).forEach(fid=>{ if(!fLis[fid]) watchFriend(fid); });
    Object.keys(fLis).forEach(fid=>{ if(!next[fid]) unwatchFriend(fid); });
    if(friendsReady) Object.keys(next).forEach(fid=>{ if(!prev[fid]){ const p=friendProfiles[fid]; toast('🎉 You and '+((p&&p.name)||'a new friend')+' are now friends'); } });
    friendsRender();
  },e=>console.warn('friends read blocked',e&&e.code));
  fCore.push(()=>fr.off());
  // Incoming requests
  const ri=db.ref('friendRequests/'+uid);
  ri.on('value',s=>{
    const prev=reqIn; reqIn=s.val()||{};
    if(friendsReady) Object.keys(reqIn).forEach(f=>{ if(!prev[f]){ const r=reqIn[f]||{}; liveToast(esc(r.avatar||'👤')+' '+esc(r.name||'Someone')+' sent you a friend request'); snd('ok'); } });
    friendsRender();
  },e=>console.warn('requests read blocked',e&&e.code));
  fCore.push(()=>ri.off());
  // Outgoing requests
  const ro=db.ref('friendSent/'+uid);
  ro.on('value',s=>{ reqOut=s.val()||{}; friendsRender(); },()=>{});
  fCore.push(()=>ro.off());
  setTimeout(()=>{ friendsReady=true; },2500);
  friendsRender();
}
function watchFriend(fid){
  const u=db.ref('users/'+fid), p=db.ref('presence/'+fid);
  u.on('value',s=>{ friendProfiles[fid]=s.val()||friendProfiles[fid]||{name:'Friend'}; friendsRender(); },()=>{ friendProfiles[fid]=friendProfiles[fid]||{name:'Friend'}; friendsRender(); });
  p.on('value',s=>{ presenceMap[fid]=s.val()||null; friendsRender(); },()=>{});
  fLis[fid]=()=>{ u.off(); p.off(); };
}
function unwatchFriend(fid){ if(fLis[fid]){ fLis[fid](); delete fLis[fid]; } delete friendProfiles[fid]; delete presenceMap[fid]; }
function friendsTeardown(){
  fCore.forEach(f=>{ try{f();}catch(e){} }); fCore=[];
  Object.keys(fLis).forEach(unwatchFriend);
  friendsData={}; reqIn={}; reqOut={}; presenceMap={}; friendProfiles={}; friendsReady=false;
  closeFriends(); friendsRender();
}
async function friendsGoOffline(){
  if(!user) return;
  await db.ref('presence/'+user.uid).set({online:false,last:TS()}).catch(()=>{});
}
function ago(ts){
  if(!ts) return '';
  const m=Math.max(0,Math.round((srvNow()-ts)/60000));
  if(m<1) return 'just now'; if(m<60) return m+'m ago';
  const h=Math.round(m/60); if(h<24) return h+'h ago';
  return Math.round(h/24)+'d ago';
}
function gameLabel(g){ const m=GAME_META&&GAME_META[g]; return m?m.title:'a game'; }
function friendStatus(fid){
  const p=presenceMap[fid];
  if(p&&p.online){
    if(p.room){
      return p.status==='lobby'||!p.status
        ? {online:true,text:'🟢 In lobby · '+gameLabel(p.game)+' · '+p.room,activity:'In lobby · '+gameLabel(p.game)}
        : {online:true,text:'🟢 Playing now · '+gameLabel(p.game),activity:'Playing now · '+gameLabel(p.game)};
    }
    return {online:true,text:'🟢 Online'};
  }
  return {online:false,text:'Offline'+(p&&p.last?' · '+ago(p.last):'')};
}
function joinableRoom(fid){
  const p=presenceMap[fid];
  return (p&&p.online&&p.room&&(p.status==='lobby'||!p.status)&&!roomId)?p:null;
}
function friendList(){
  return Object.keys(friendsData).map(fid=>{
    const prof=friendProfiles[fid]||{name:'Friend'};
    return {uid:fid,prof,st:friendStatus(fid)};
  }).sort((a,b)=>(b.st.online-a.st.online)||String(a.prof.name||'').localeCompare(String(b.prof.name||'')));
}
function friendsRender(){
  const list=friendList();
  const online=list.filter(f=>f.st.online);
  const reqN=Object.keys(reqIn).length;
  const cnt=$('fsCount'); if(cnt) cnt.textContent=online.length+' online';
  const bd=$('fsBadge'); if(bd){ bd.textContent=reqN; bd.classList.toggle('on',reqN>0); }
  const tb=$('frReqBadge'); if(tb){ tb.textContent=reqN; tb.style.display=reqN?'inline':'none'; }
  if($('friendsOverlay').classList.contains('on') && fTab!=='add') renderFriendsBody();
  if(pcUid){ renderPcActions(); const st=$('pcStatus'); const info=friendsData[pcUid]?friendStatus(pcUid):null; if(st){ st.textContent=info?info.text:''; st.classList.toggle('on',!!(info&&info.online)); } }
}
function renderFriendsBody(){
  const body=$('frBody'); if(!body) return;
  document.querySelectorAll('.fr-tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===fTab));
  if(fTab==='list'){
    const list=friendList();
    if(!list.length){ body.innerHTML='<div class="fr-empty">No friends yet.<br>Use the <b>Add</b> tab, or tap a player in a room and press “Add friend”.</div>'; return; }
    body.innerHTML='<div class="fr-list">'+list.map(f=>{
      const j=joinableRoom(f.uid);
      return '<div class="fr-item" data-uid="'+esc(f.uid)+'"><div class="fr-av">'+esc(f.prof.avatar||'🎮')+'<i class="dot'+(f.st.online?' on':'')+'"></i></div><div class="mid"><div class="n">'+esc(f.prof.name||'Friend')+'</div><div class="st'+(f.st.online?' on':'')+'">'+esc(f.st.text)+'</div></div>'+(j?'<button type="button" class="fr-btn ok" data-fa="join" data-uid="'+esc(f.uid)+'">Join</button>':'')+'</div>';
    }).join('')+'</div>';
  } else if(fTab==='req'){
    const inc=Object.keys(reqIn), out=Object.keys(reqOut);
    let h='';
    h+='<div class="fr-sub">Received ('+inc.length+')</div>';
    h+=inc.length?'<div class="fr-list">'+inc.map(f=>{const r=reqIn[f]||{};return '<div class="fr-item" data-uid="'+esc(f)+'"><div class="fr-av">'+esc(r.avatar||'👤')+'</div><div class="mid"><div class="n">'+esc(r.name||'Player')+'</div><div class="st">wants to be friends</div></div><button type="button" class="fr-btn ok" data-fa="accept" data-uid="'+esc(f)+'">Accept</button><button type="button" class="fr-btn ghost" data-fa="decline" data-uid="'+esc(f)+'">✕</button></div>';}).join('')+'</div>':'<div class="fr-empty">No pending requests.</div>';
    h+='<div class="fr-sub">Sent ('+out.length+')</div>';
    h+=out.length?'<div class="fr-list">'+out.map(f=>'<div class="fr-item" data-uid="'+esc(f)+'"><div class="fr-av">⏳</div><div class="mid"><div class="n">Pending…</div><div class="st">waiting for them to accept</div></div><button type="button" class="fr-btn ghost" data-fa="cancel" data-uid="'+esc(f)+'">Cancel</button></div>').join('')+'</div>':'<div class="fr-empty">No requests sent.</div>';
    body.innerHTML=h;
  } else {
    body.innerHTML='<div class="fr-add"><p class="sub" style="margin:0 0 8px">Type their <b>login username</b> to send a friend request.</p><input type="text" id="frAddInput" maxlength="30" placeholder="username" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="btn btn-primary" id="frAddBtn">Send request</button><div class="fr-msg" id="frAddMsg"></div><p class="sub" style="margin:8px 0 0">Your username: <b>@'+esc(myUsernameKey()||'—')+'</b> — share it so friends can find you.</p></div>';
  }
}
function setFrMsg(t,kind){ const m=$('frAddMsg'); if(m){ m.textContent=t; m.className='fr-msg'+(kind?' '+kind:''); } }
function openFriends(tab){ fTab=tab||'list'; const ov=$('friendsOverlay'); ov.classList.add('on'); ov.setAttribute('aria-hidden','false'); renderFriendsBody(); }
function closeFriends(){ const ov=$('friendsOverlay'); if(ov){ ov.classList.remove('on'); ov.setAttribute('aria-hidden','true'); } }

async function sendFriendRequest(toUid,toName){
  if(!user||!profile) return false;
  if(toUid===user.uid){ setFrMsg("That's you!",'err'); return false; }
  if(friendsData[toUid]){ setFrMsg('You are already friends.','ok'); return false; }
  if(reqOut[toUid]){ setFrMsg('Request already sent.','err'); return false; }
  if(reqIn[toUid]){ return acceptFriend(toUid); }
  const up={};
  up['friendRequests/'+toUid+'/'+user.uid]={name:profile.name||'Player',avatar:profile.avatar||'🦊',at:srvNow()};
  up['friendSent/'+user.uid+'/'+toUid]=true;
  try{ await db.ref().update(up); toast('Friend request sent'+(toName?' to '+toName:'')); snd('ok'); return true; }
  catch(e){ console.warn('send request failed',e); toast('Could not send request — check Firebase rules for friendRequests'); setFrMsg('Could not send (database rules?)','err'); return false; }
}
async function acceptFriend(fromUid){
  const up={};
  up['friends/'+user.uid+'/'+fromUid]=true;
  up['friends/'+fromUid+'/'+user.uid]=true;
  up['friendRequests/'+user.uid+'/'+fromUid]=null;
  up['friendSent/'+fromUid+'/'+user.uid]=null;
  up['friendRequests/'+fromUid+'/'+user.uid]=null;
  up['friendSent/'+user.uid+'/'+fromUid]=null;
  try{ await db.ref().update(up); snd('ok'); return true; }
  catch(e){ console.warn('accept failed',e); toast('Could not accept — check Firebase rules for friends'); return false; }
}
async function declineFriend(fromUid){
  const up={}; up['friendRequests/'+user.uid+'/'+fromUid]=null; up['friendSent/'+fromUid+'/'+user.uid]=null;
  try{ await db.ref().update(up); }catch(e){ toast('Could not decline'); }
}
async function cancelFriend(toUid){
  const up={}; up['friendRequests/'+toUid+'/'+user.uid]=null; up['friendSent/'+user.uid+'/'+toUid]=null;
  try{ await db.ref().update(up); }catch(e){ toast('Could not cancel'); }
}
async function removeFriend(fid){
  const up={}; up['friends/'+user.uid+'/'+fid]=null; up['friends/'+fid+'/'+user.uid]=null;
  try{ await db.ref().update(up); toast('Friend removed'); }catch(e){ toast('Could not remove friend'); }
}
async function addFriendByUsername(){
  const inp=$('frAddInput'); if(!inp) return;
  const name=inp.value.trim().toLowerCase().replace(/^@/,'');
  if(name.length<3){ setFrMsg('Enter a username (3+ characters).','err'); return; }
  const btn=$('frAddBtn'); if(btn) btn.disabled=true;
  setFrMsg('Searching…');
  try{
    const snap=await db.ref('usernames/'+name).once('value');
    const uid=snap.val();
    if(!uid){ setFrMsg('No player found with that username.','err'); }
    else if(await sendFriendRequest(uid,name)){ setFrMsg('Request sent to @'+name+' ✓','ok'); inp.value=''; }
  }catch(e){ console.warn(e); setFrMsg('Search failed — check Firebase rules for usernames.','err'); }
  if(btn) btn.disabled=false;
}
function joinFriendRoom(fid){
  const p=joinableRoom(fid);
  if(roomId){ toast('Leave your current room first'); return; }
  if(!p){ toast('They are not in an open lobby'); return; }
  closeFriends(); closePlayerCard();
  selectedGame=p.game||selectedGame;
  joinRoomByCode(p.room);
}
(function bindFriends(){
  const ov=$('friendsOverlay');
  $('btnOpenFriends').addEventListener('click',()=>openFriends('list'));
  $('frClose').addEventListener('click',closeFriends);
  ov.addEventListener('click',function(e){
    const t=e.target;
    if(t===ov){ closeFriends(); return; }
    const tab=t.closest('.fr-tab'); if(tab){ fTab=tab.dataset.tab; renderFriendsBody(); return; }
    if(t.id==='frAddBtn'){ addFriendByUsername(); return; }
    const act=t.closest('[data-fa]');
    if(act){
      e.stopPropagation();
      const uid=act.dataset.uid, a=act.dataset.fa;
      if(a==='accept') acceptFriend(uid); else if(a==='decline') declineFriend(uid);
      else if(a==='cancel') cancelFriend(uid); else if(a==='join') joinFriendRoom(uid);
      return;
    }
    const item=t.closest('.fr-item[data-uid]');
    if(item) showPlayerCard(item.dataset.uid, friendProfiles[item.dataset.uid]||(reqIn[item.dataset.uid]&&{name:reqIn[item.dataset.uid].name,avatar:reqIn[item.dataset.uid].avatar})||null);
  });
  ov.addEventListener('keydown',function(e){ if(e.key==='Enter'&&e.target.id==='frAddInput'){ e.preventDefault(); addFriendByUsername(); } });
  // Friend actions on the profile card (works for room players and friends)
  $('pcActions').addEventListener('click',async function(e){
    const b=e.target.closest('[data-fa]'); if(!b||!pcUid) return;
    const uid=pcUid, a=b.dataset.fa;
    const roomP=roomData&&roomData.players&&roomData.players[uid];
    if(a==='add') await sendFriendRequest(uid,(roomP&&roomP.name)||'');
    else if(a==='accept') await acceptFriend(uid);
    else if(a==='decline') await declineFriend(uid);
    else if(a==='cancel') await cancelFriend(uid);
    else if(a==='remove'){ if(confirm('Remove this friend?')) await removeFriend(uid); }
    else if(a==='join') joinFriendRoom(uid);
    else if(a==='visit'){ const fp=friendProfiles[uid]||{}; window.visitTown(uid,fp.name,fp.avatar); }
    renderPcActions();
  });
})();
