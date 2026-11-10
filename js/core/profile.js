async function loadProfile(uid,name){
  const ref=db.ref('users/'+uid);
  let local = null;
  try{ local = JSON.parse(localStorage.getItem('wa_profile_'+uid)||'null'); }catch(e){ local=null; }
  let snap=null;
  try{ snap=await ref.once('value'); }catch(e){ console.warn('profile read failed', e); }
  let needsResync=false;
  if(snap && snap.exists()){
    profile=snap.val()||{};
    if(!profile.name) profile.name = name || 'Player';
    if(!profile.avatar) profile.avatar = (local&&local.avatar) || AVATARS[Math.floor(Math.random()*AVATARS.length)];
    // Cloud is the source of truth. Local cache only wins if it is NEWER
    // (meaning an earlier cloud write failed and never synced).
    if(local && (local.updatedAt||0) > (profile.updatedAt||0)){
      ['name','avatar','title','bio'].forEach(k=>{ if(local[k]!=null) profile[k]=local[k]; });
      profile.updatedAt = local.updatedAt;
      needsResync=true;
    }
  }else{
    profile={name:name||'Player',xp:0,level:1,wordsFound:0,attempts:0,correct:0,streak:0,bestScore:0,avatar:(local&&local.avatar)||AVATARS[Math.floor(Math.random()*AVATARS.length)],title:(local&&local.title)||'Newcomer',bio:(local&&local.bio)||'',createdAt:srvNow(),updatedAt:(local&&local.updatedAt)||0};
    if(snap){ try{ await ref.set(profile); }catch(e){ console.warn('profile create failed', e); } }
  }
  if(profile.bio==null) profile.bio='';
  if(!profile.title) profile.title='Newcomer';
  if(String(profile.name||'').trim().toLowerCase()==='koyvic') profile.title='Founder';
  cacheProfileLocal(uid);
  if(needsResync){ pushCosmeticsToCloud(uid).catch(()=>{}); }
  return profile;
}
function cacheProfileLocal(uid){
  try{ localStorage.setItem('wa_profile_'+uid, JSON.stringify({name:profile.name,avatar:profile.avatar,title:profile.title,bio:profile.bio||'',updatedAt:profile.updatedAt||0})); }catch(e){}
}
// Writes name/avatar/title/bio to users/<uid>. Tries one atomic update first; if the
// database rules reject it, writes each field on its own so one rejected field
// (e.g. bio not whitelisted in rules) can't block the others. Returns {ok, failed[]}.
async function pushCosmeticsToCloud(uid){
  const data={name:profile.name,avatar:profile.avatar,title:profile.title,bio:profile.bio||'',updatedAt:profile.updatedAt||srvNow()};
  const ref=db.ref('users/'+uid);
  try{ await ref.update(data); return {ok:true,failed:[]}; }
  catch(e){ console.warn('users/ atomic update failed', e && e.code, e); }
  const failed=[];
  for(const k of Object.keys(data)){
    try{ await ref.child(k).set(data[k]); }
    catch(e){ failed.push(k); console.warn('users/'+k+' write failed', e && e.code); }
  }
  return {ok:failed.length===0,failed};
}
// Mirror cosmetics into the room entry so everyone in the room sees them
function roomCosmetics(){
  return {name:profile.name,avatar:profile.avatar||'🦊',title:profile.title||'Newcomer',bio:profile.bio||''};
}
async function saveProfile(u){
  if(!user||!profile)return;
  Object.assign(profile,u);
  profile.level=levelFromXp(profile.xp||0).level;
  const payload={...u,level:profile.level};
  try{
    await db.ref('users/'+user.uid).update(payload);
  }catch(e){
    console.warn('saveProfile firebase failed', e);
    throw e;
  }
  cacheProfileLocal(user.uid);
  refreshStats();
}
function refreshStats(){
  if(!profile)return;
  const nameEl=$('lobbyName'); if(nameEl) nameEl.textContent=profile.name;
  const chip=$('btnOpenProfile'); if(chip) chip.title=(profile.title?profile.title+' · ':'')+'Edit profile';
  const lvlEl=$('lobbyLvl'); if(lvlEl) lvlEl.textContent='LV'+profile.level;
  const avEl=$('lobbyAv'); if(avEl) avEl.textContent=profile.avatar||'🦊';
  const mx=$('matchName'); if(mx) mx.textContent=profile.name;
  const ma=$('matchAv'); if(ma) ma.textContent=profile.avatar||'🦊';
  const stXp=$('stXp'); if(stXp) stXp.textContent=profile.xp||0;
  const a=profile.attempts||0,c=profile.correct||0;
  const stAcc=$('stAcc'); if(stAcc) stAcc.textContent=a?Math.round(c/a*100)+'%':'—';
  const stW=$('stWords'); if(stW) stW.textContent=profile.wordsFound||0;
  const stS=$('stStreak'); if(stS) stS.textContent=profile.streak||0;
}

const PROFILE_TITLES = ['Newcomer','Word Rookie','Letter Ace','Vocabulary Pro','Arena Champion','Puzzle Master','Speed Typist','Clue Captain','Sketch Star','Spy Hunter'];
const FOUNDER_NAME = 'koyvic'; // exclusive Founder title

/* Theme customization and cloud theme synchronization removed. */

let profDraft = { name:'', avatar:'🦊', title:'Newcomer', bio:'' };

function isFounderName(name){
  return String(name||'').trim().toLowerCase() === FOUNDER_NAME;
}

function openProfileEditor(){
  if(!profile || !user){ toast('Sign in to edit your profile'); return; }
  const nm = profile.name || 'Player';
  profDraft = {
    name: nm,
    avatar: profile.avatar || '🦊',
    title: isFounderName(nm) ? 'Founder' : (profile.title || 'Newcomer'),
    bio: profile.bio || ''
  };
  if(isFounderName(nm)) profile.title = 'Founder';
  const nameIn = $('profNameInput');
  const bioIn = $('profBioInput');
  if(nameIn) nameIn.value = profDraft.name;
  if(bioIn) bioIn.value = profDraft.bio;
  renderProfPreview();
  renderProfAvatars();
  renderProfTitles();
  const ov = $('profileOverlay');
  if(ov){ ov.classList.add('on'); ov.setAttribute('aria-hidden','false'); }
}

function closeProfileEditor(){
  const ov = $('profileOverlay');
  if(ov){ ov.classList.remove('on'); ov.setAttribute('aria-hidden','true'); }
}

function renderProfPreview(){
  const av = $('profPreviewAv'); if(av) av.textContent = profDraft.avatar || '🦊';
  const nm = $('profPreviewName'); if(nm) nm.textContent = (profDraft.name || 'Player').trim() || 'Player';
  const tl = $('profPreviewTitle');
  if(tl){
    const t = isFounderName(profDraft.name) ? 'Founder' : (profDraft.title || 'Newcomer');
    tl.textContent = t;
    tl.style.color = t === 'Founder' ? '#B8860B' : '#636E72';
  }
  const bp = $('profPreviewBio'); if(bp) bp.textContent = profDraft.bio || '';
}

function renderProfAvatars(){
  const grid = $('profAvatarGrid');
  if(!grid) return;
  grid.innerHTML = '';
  AVATARS.forEach(a => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'avatar-opt' + (a === profDraft.avatar ? ' on' : '');
    btn.textContent = a;
    btn.setAttribute('data-av', a);
    btn.setAttribute('aria-label', 'Avatar ' + a);
    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      profDraft.avatar = a;
      renderProfAvatars();
      renderProfPreview();
    });
    grid.appendChild(btn);
  });
}

function renderProfTitles(){
  const row = $('profTitleRow');
  if(!row) return;
  row.innerHTML = '';
  const founder = isFounderName(profDraft.name);
  // Founder chip only for koyvic
  const titles = founder ? ['Founder', ...PROFILE_TITLES] : PROFILE_TITLES.slice();
  titles.forEach(t => {
    if(t === 'Founder' && !founder) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'title-chip' + (t === profDraft.title || (founder && t === 'Founder' && profDraft.title === 'Founder') ? ' on' : '');
    btn.textContent = t;
    if(t === 'Founder'){
      btn.style.borderColor = '#F0C14B';
      btn.style.background = 'linear-gradient(180deg,#FFF6D5,#FFEAA7)';
      btn.style.color = '#6D4C00';
    }
    if(founder && t === 'Founder'){
      btn.classList.add('on');
      btn.disabled = true;
      btn.title = 'Exclusive founder title';
    }
    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      if(founder){
        // Founder always keeps Founder title
        profDraft.title = 'Founder';
      } else if(t === 'Founder'){
        return;
      } else {
        profDraft.title = t;
      }
      renderProfTitles();
      renderProfPreview();
    });
    row.appendChild(btn);
  });
  if(founder) profDraft.title = 'Founder';
}

async function saveProfileEditor(){
  if(!user){ toast('Not signed in'); return; }
  if(!profile){ profile = { name:'Player', xp:0, avatar:'🦊', title:'Newcomer', bio:'' }; }
  const nameIn = $('profNameInput');
  const bioIn = $('profBioInput');
  let name = (nameIn && nameIn.value ? nameIn.value : '').trim().replace(/\s+/g,' ');
  if(name.length < 2){ toast('Name needs at least 2 characters'); return; }
  if(name.length > 16) name = name.slice(0,16);
  const bio = (bioIn && bioIn.value ? bioIn.value : '').trim().slice(0,48);
  const avatar = profDraft.avatar || profile.avatar || '🦊';
  let title = isFounderName(name) ? 'Founder' : (profDraft.title || profile.title || 'Newcomer');
  if(title === 'Founder' && !isFounderName(name)) title = 'Newcomer';
  const btn = $('btnProfSave');
  if(btn){ btn.disabled = true; btn.textContent = 'Saving…'; }
  // Update local state immediately so UI never feels broken
  profile.name = name;
  profile.avatar = avatar;
  profile.title = title;
  profile.bio = bio;
  profile.updatedAt = srvNow();
  refreshStats();
  cacheProfileLocal(user.uid);
  try{
    if(user.updateProfile){ await user.updateProfile({ displayName: name }); }
  }catch(e){ console.warn('auth profile update failed', e); }
  profile.level = levelFromXp(profile.xp||0).level;
  const res = await pushCosmeticsToCloud(user.uid);
  const remoteOk = res.ok;
  if(roomId){
    try{ await db.ref('rooms/'+roomId+'/players/'+user.uid).update(roomCosmetics()); }
    catch(e){ console.warn('room player update failed', e); }
  }
  if(btn){ btn.disabled = false; btn.textContent = 'Save'; }
  closeProfileEditor();
  if(remoteOk){
    toast(isFounderName(name) ? 'Profile saved · Founder' : 'Profile saved');
    snd('ok');
  } else {
    toast('Saved on this device, but cloud rejected: '+res.failed.join(', ')+' — update Firebase rules for users/$uid');
    snd('ok');
  }
}

(function bindProfileButtons(){
  const sv=$('btnProfSave'), cn=$('btnProfCancel'), ov=$('profileOverlay');
  if(sv) sv.addEventListener('click', function(e){ e.preventDefault(); saveProfileEditor(); });
  if(cn) cn.addEventListener('click', function(e){ e.preventDefault(); closeProfileEditor(); });
  if(ov) ov.addEventListener('click', function(e){ if(e.target===ov) closeProfileEditor(); });
})();
document.addEventListener('click', function(e){
  var t = e.target;
  if(t && t.closest && t.closest('#btnOpenProfile')){
    e.preventDefault();
    openProfileEditor();
    return;
  }
});
document.addEventListener('input', function(e){
  if(e.target && e.target.id === 'profBioInput'){ profDraft.bio = e.target.value; renderProfPreview(); }
  if(e.target && e.target.id === 'profNameInput'){
    profDraft.name = e.target.value;
    if(isFounderName(profDraft.name)){
      profDraft.title = 'Founder';
      renderProfTitles();
    } else if(profDraft.title === 'Founder'){
      profDraft.title = 'Newcomer';
      renderProfTitles();
    }
    renderProfPreview();
  }
});
