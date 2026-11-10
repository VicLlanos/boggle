/* ===== SPY WORD ===== */
let spyLocalDone = false;

function isSpy(){
  return !!(roomData && user && roomData.spyUid === user.uid);
}

function enterSpy(force){
  if(!force && $('screen-spy').classList.contains('active') && !roundEnded){
    renderSpyUI();
    return;
  }
  resetRoundState();
  roundEnded = false;
  spyLocalDone = false;
  const sb = $('btnSoundSpy');
  if(sb){ sb.textContent = soundOn ? '🔊' : '🔇'; sb.onclick = toggleSound; }
  show('screen-spy');
  renderSpyUI();
  startSpyTimer();
  boardReady = true;
  snd('go');
}

function renderSpyScores(){
  const host = $('spyScoreBoard');
  if(!host || !roomData) return;
  const players = Object.values(roomData.players || {});
  host.innerHTML = players.map(p => {
    const spyMark = p.uid === roomData.spyUid && roomData.spyPhase === 'reveal' ? ' 🕵️' : '';
    return `<div class="sc${p.uid===user.uid?' me':''}"><div class="n">${esc(p.avatar||'')} ${esc(p.name)}${spyMark}</div><div class="s">${p.spyScore||0}</div></div>`;
  }).join('');
}

const SPY_VOTE_SECONDS=60, SPY_GUESS_SECONDS=30;
let _spyAdvKey='';

function spyTally(){
  const t={}, V=(roomData&&roomData.spyVotes)||{};
  Object.keys(V).forEach(k=>Object.values(V[k]||{}).forEach(v=>{ t[v]=(t[v]||0)+1; }));
  return t;
}
function spyKick(){
  if(!isHost || !roomData) return;
  const k=roomData.spyPhase+'|'+(roomData.spyRound||1)+'|'+(roomData.startedAt||'');
  if(_spyAdvKey===k) return;
  _spyAdvKey=k;
  spyAdvance().catch(()=>{ _spyAdvKey=''; });
}
async function spyAdvance(){
  const ph=roomData.spyPhase, r=roomData.spyRound||1, maxR=roomData.spyMaxRounds||SPY_MAX_ROUNDS;
  const ref=db.ref('rooms/'+roomId);
  if(ph==='clues') return ref.update({ spyPhase:'vote', endsAt: srvNow()+SPY_VOTE_SECONDS*1000 });
  if(ph==='vote'){
    if(r<maxR) return ref.update({ spyRound:r+1, spyPhase:'clues', endsAt: srvNow()+SPY_CLUE_SECONDS*1000 });
    // Final round done: the player with the most votes over ALL rounds is evicted
    const tally=spyTally(), players=roomData.players||{};
    let top=null, topN=0, tied=false;
    Object.keys(tally).forEach(u=>{
      if(!players[u]) return;
      if(tally[u]>topN){ topN=tally[u]; top=u; tied=false; }
      else if(tally[u]===topN) tied=true;
    });
    if(!top || tied) return resolveSpyGame(true);
    return ref.update({ spyPhase:'guess', spyEvicted:top, spyTally:tally, spyGuess:null, endsAt: srvNow()+SPY_GUESS_SECONDS*1000 });
  }
  if(ph==='guess') return resolveSpyGame(false);
}

function renderSpyUI(){
  if(!roomData || !user) return;
  const round = roomData.spyRound || 1;
  const maxR = roomData.spyMaxRounds || SPY_MAX_ROUNDS;
  const phase = roomData.spyPhase || 'clues';
  const word = (roomData.spyWord || '').toUpperCase();
  const meSpy = isSpy();
  const rk = 'r'+round;
  const players = roomData.players || {};
  const nPlayers = Object.keys(players).length;
  const banner = $('spyRoleBanner'), roleText = $('spyRoleText');
  const evicted = roomData.spyEvicted;
  const evName = evicted && players[evicted] ? players[evicted].name : 'A player';

  maybeShowSpyCatSpin();
  const sc0 = roomData.spyCategory;
  if($('spyCatChip')) $('spyCatChip').textContent = sc0 ? ('Category: '+sc0.emoji+' '+sc0.name) : '';
  if($('spyRoundLabel')) $('spyRoundLabel').textContent = 'Round '+round+' / '+maxR;
  if($('spyScoreLabel')) $('spyScoreLabel').textContent = 'Your points: '+((players[user.uid]?.spyScore)||0);

  if(meSpy && phase !== 'reveal'){
    banner.className = 'spy-role-banner spy';
    roleText.textContent = 'You are the SPY';
    banner.querySelector('.lbl').textContent = 'Blend in — you do not know the word';
  } else if(phase === 'reveal'){
    banner.className = 'spy-role-banner civilian';
    roleText.textContent = word || '—';
    banner.querySelector('.lbl').textContent = meSpy ? 'You were the spy · the word was' : 'The secret word was';
  } else {
    banner.className = 'spy-role-banner civilian';
    roleText.textContent = word || '—';
    banner.querySelector('.lbl').textContent = 'Secret word — give clues, find the spy';
  }

  // Every clue from every round stays on screen (helps the spy)
  const allClues = roomData.spyClues || {};
  let html = '';
  for(let r=1;r<=round;r++){
    const rc = allClues['r'+r] || {};
    const es = Object.keys(rc).map(uid => ({ uid, word: rc[uid].word || rc[uid], at: rc[uid].at || 0, name: players[uid]?.name || 'Player', avatar: players[uid]?.avatar || '🎮' })).sort((a,b)=>a.at-b.at);
    html += '<div class="spy-rhead">Round '+r+'</div>' + (es.length
      ? es.map(c => `<div class="spy-clue${c.uid===user.uid?' mine':''}"><span>${esc(c.avatar)} ${esc(c.name)}</span><b>${esc(String(c.word).toUpperCase())}</b></div>`).join('')
      : '<div class="none-words" style="font-size:.85rem">No clues yet…</div>');
  }
  const list = $('spyClueList');
  if(list){ const atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 30; list.innerHTML = html; if(atEnd) list.scrollTop = list.scrollHeight; }

  const clueForm = $('spyClueForm'), voteArea = $('spyVoteArea'), guessBox = $('spyGuessBox');
  const btnNext = $('btnSpyNext'), phaseLabel = $('spyPhaseLabel'), status = $('spyStatus');
  const grid = $('spyVoteGrid'), vTitle = $('spyVoteTitle');
  if(btnNext) btnNext.style.display = 'none';
  if(guessBox) guessBox.style.display = 'none';
  if(grid) grid.style.display = ''; if(vTitle) vTitle.style.display = '';

  if(phase === 'clues'){
    phaseLabel.textContent = 'Round '+round+' · Clue phase — one word only (not the secret word)';
    const nClues = Object.keys(allClues[rk] || {}).length;
    if(clueForm) clueForm.style.display = (allClues[rk]||{})[user.uid] ? 'none' : 'flex';
    if(voteArea) voteArea.style.display = 'none';
    status.textContent = nClues + ' / ' + nPlayers + ' clues in';
    if(isHost && nClues >= nPlayers && nPlayers >= 3) spyKick();
  } else if(phase === 'vote'){
    phaseLabel.textContent = 'Round '+round+' · Vote — who is the spy? (votes add up over all rounds)';
    if(clueForm) clueForm.style.display = 'none';
    if(voteArea) voteArea.style.display = 'block';
    renderSpyVoteGrid();
    const nVotes = Object.keys((roomData.spyVotes||{})[rk] || {}).length;
    status.textContent = nVotes + ' / ' + nPlayers + ' votes';
    if(isHost && nVotes >= nPlayers) spyKick();
  } else if(phase === 'guess'){
    phaseLabel.textContent = 'Final result of the votes — ' + evName + ' is evicted!';
    if(clueForm) clueForm.style.display = 'none';
    if(voteArea) voteArea.style.display = 'block';
    if(grid) grid.style.display = 'none'; if(vTitle) vTitle.style.display = 'none';
    const mineToGuess = evicted === user.uid && !roomData.spyGuess;
    if(guessBox) guessBox.style.display = mineToGuess ? 'block' : 'none';
    status.textContent = evicted === user.uid
      ? (roomData.spyGuess ? 'Guess sent…' : 'You were voted out! Guess the secret word.')
      : evName + ' was voted out and is guessing the secret word…';
    if(isHost && roomData.spyGuess) spyKick();
  } else if(phase === 'reveal'){
    phaseLabel.textContent = 'Reveal';
    if(clueForm) clueForm.style.display = 'none';
    if(voteArea) voteArea.style.display = 'none';
    if(btnNext){ btnNext.textContent = 'SEE FINAL RESULTS'; btnNext.dataset.mode = 'results'; btnNext.style.display = 'flex'; }
  }
  renderSpyScores();
}

function renderSpyVoteGrid(){
  const grid = $('spyVoteGrid');
  if(!grid || !roomData) return;
  const players = Object.values(roomData.players || {});
  const myVote = ((roomData.spyVotes || {})['r'+(roomData.spyRound||1)] || {})[user.uid];
  grid.innerHTML = players.map(p => {
    const on = myVote === p.uid ? ' on' : '';
    return `<button type="button" class="spy-vote-btn${on}" data-vote="${p.uid}">${esc(p.avatar||'')} ${esc(p.name)}${p.uid===user.uid?' (you)':''}</button>`;
  }).join('');
}

function startSpyTimer(){
  clearInterval(timerInterval);
  const tick = () => {
    if(!roomData || !roomData.endsAt) return;
    const left = Math.max(0, Math.ceil((roomData.endsAt - srvNow())/1000));
    const el = $('spyTimerText'); if(el) el.textContent = left;
    const ring = $('spyTimerRing');
    if(ring){
      const total = roomData.spyPhase === 'vote' ? SPY_VOTE_SECONDS : roomData.spyPhase === 'guess' ? SPY_GUESS_SECONDS : SPY_CLUE_SECONDS;
      ring.style.setProperty('--pct', Math.max(0, left/total*100)+'%');
      ring.classList.toggle('low', left <= 15);
    }
    if(left <= 0 && !roundEnded && isHost && roomData.spyPhase !== 'reveal') spyKick();
  };
  tick();
  timerInterval = setInterval(tick, 250);
}

async function submitSpyClue(){
  if(roundEnded || !roomData || roomData.spyPhase !== 'clues') return;
  const rk = 'r'+(roomData.spyRound||1), all = roomData.spyClues || {};
  if((all[rk]||{})[user.uid]) return;
  const input = $('spyClueInput');
  let clue = (input?.value || '').trim().toUpperCase().replace(/[^A-Z]/g,'');
  if(!clue || clue.length < 2){ toast('Enter a one-word clue'); return; }
  const secret = (roomData.spyWord||'').toUpperCase().replace(/[^A-Z]/g,'');
  if(clue === secret || (roomData.spyWord||'').toUpperCase().split(/[^A-Z]+/).includes(clue)){ toast('You cannot say the secret word!'); return; }
  const used = Object.keys(all).some(k => all[k] && all[k][user.uid] && String(all[k][user.uid].word||'').toUpperCase() === clue);
  if(used){ toast('You already used that clue'); return; }
  try{
    await db.ref('rooms/'+roomId+'/spyClues/'+rk+'/'+user.uid).set({ word: clue, at: srvNow() });
    if(input) input.value = '';
    $('spyClueForm').style.display = 'none';
    snd('ok');
    toast('Clue submitted');
  }catch(e){ toast('Could not send clue'); }
}

async function submitSpyVote(targetUid){
  if(roundEnded || !roomData || roomData.spyPhase !== 'vote') return;
  try{
    await db.ref('rooms/'+roomId+'/spyVotes/r'+(roomData.spyRound||1)+'/'+user.uid).set(targetUid);
    snd('tap');
    renderSpyVoteGrid();
  }catch(e){ toast('Vote failed'); }
}

async function submitSpyGuess(){
  // Only the evicted player (spy or not) gets exactly one guess
  if(roundEnded || !roomData || roomData.spyPhase !== 'guess' || roomData.spyEvicted !== user.uid || roomData.spyGuess) return;
  const input = $('spyGuessInput');
  const guess = (input?.value || '').trim().toUpperCase().replace(/[^A-Z ]/g,'');
  if(!guess || guess.length < 2){ toast('Type your guess'); return; }
  const secret = (roomData.spyWord||'').toUpperCase().replace(/[^A-Z ]/g,'');
  const correct = guess === secret || guess.replace(/\s+/g,'') === secret.replace(/\s+/g,'');
  try{
    $('spyGuessBox').style.display = 'none';
    await db.ref('rooms/'+roomId+'/spyGuess').set({ guess, correct, at: srvNow() });
    snd(correct ? 'win' : 'bad');
  }catch(e){ toast('Guess failed'); $('spyGuessBox').style.display = 'block'; }
}

async function resolveSpyGame(noEviction){
  if(!isHost || !roomData || roomData.spyPhase === 'reveal') return;
  const spyUid = roomData.spyUid, players = roomData.players || {};
  const ev = noEviction ? null : (roomData.spyEvicted || null);
  const g = roomData.spyGuess;
  const spyCaught = ev === spyUid;
  const spyGuessed = !!(g && g.correct);
  // Spy wins if an innocent was evicted (guess irrelevant), or if the caught spy guessed the word
  const spyWon = !spyCaught || (spyCaught && spyGuessed);
  const sc = {};
  if(spyWon) sc['players/'+spyUid+'/spyScore'] = (players[spyUid]?.spyScore||0) + 2;
  else Object.keys(players).forEach(u => { if(u !== spyUid) sc['players/'+u+'/spyScore'] = (players[u]?.spyScore||0) + 1; });
  const entry = { round: roomData.spyMaxRounds || SPY_MAX_ROUNDS, word: roomData.spyWord, spyUid, evicted: ev, spyCaught, spyGuessed, spyWon, guess: g ? g.guess : null, topAccused: ev };
  try{
    await db.ref('rooms/'+roomId).update({ ...sc, spyHistory: [entry], spyEvicted: ev, spyPhase: 'reveal', endsAt: srvNow() + 999999 });
  }catch(e){ console.warn(e); _spyAdvKey=''; }
}

function checkSpyState(){
  if(!roomData || roomData.gameType !== 'spy') return;
  renderSpyUI();
  if(roomData.spyPhase === 'reveal'){
    roundEnded = true;
    clearInterval(timerInterval);
    const last = (roomData.spyHistory || [])[0];
    const status = $('spyStatus');
    if(last && status){
      const pl = roomData.players || {};
      const spyName = pl[last.spyUid] ? pl[last.spyUid].name : 'The spy';
      const evName = last.evicted && pl[last.evicted] ? pl[last.evicted].name : '';
      if(!last.evicted) status.textContent = 'Votes were tied — nobody was evicted. ' + spyName + ' (the spy) wins!';
      else if(!last.spyCaught) status.textContent = evName + ' was innocent! ' + spyName + ' was the spy and wins!';
      else if(last.spyGuessed) status.textContent = spyName + ' was caught but guessed the word — the spy wins!';
      else status.textContent = spyName + ' was caught and guessed wrong — civilians win!';
    }
  }
}

document.addEventListener('click', e => {
  if(e.target?.id === 'btnSpyClue') submitSpyClue();
  if(e.target?.id === 'btnSpyGuess') submitSpyGuess();
  const voteBtn = e.target?.closest?.('[data-vote]');
  if(voteBtn) submitSpyVote(voteBtn.dataset.vote);
  if(e.target?.id === 'btnSpyNext'){
    const mode = e.target.dataset.mode || 'next';
    e.target.disabled = true;
    if(mode === 'results'){
      if(isHost) db.ref('rooms/'+roomId).update({ status:'results', endedAt: srvNow() }).catch(()=>{});
      showResults();
      e.target.disabled = false;
      return;
    }
    if(isHost){
      resetRoundState();
      beginRound().catch(()=>toast('Could not start next round')).finally(()=>{ e.target.disabled = false; });
    } else {
      toast('Waiting for host…');
      e.target.disabled = false;
    }
  }
});
document.addEventListener('keydown', e => {
  if(e.target?.id === 'spyClueInput' && e.key === 'Enter'){ e.preventDefault(); submitSpyClue(); }
  if(e.target?.id === 'spyGuessInput' && e.key === 'Enter'){ e.preventDefault(); submitSpyGuess(); }
});

function computeSpyResults(){
  const players = Object.values((roomData&&roomData.players)||{});
  const hist = Array.isArray(roomData.spyHistory) ? roomData.spyHistory : [];
  const maxR = roomData.spyMaxRounds || SPY_MAX_ROUNDS;
  const rows = players.map(p => {
    const score = p.spyScore || 0;
    const items = hist.map(h => {
      const wasSpy = h.spyUid === p.uid;
      let note = (h.word||'?');
      if(wasSpy) note += h.spyWon ? ' · spy won' : ' · spy caught';
      else note += h.spyWon ? ' · spy won' : ' · civilians won';
      return { w: note, pts: 0, dupe: false, cat: h.word || '' };
    });
    if(!items.length) items.push({ w: score ? (score+' pts') : 'No points yet', pts: score, dupe: score===0 });
    return { p, items, raw: items.length, final: score, lost: 0, uniqueN: score, sharedN: 0, level: roomData.spyRound||1, maxL: maxR };
  });
  rows.sort((a,b)=>(b.final-a.final)||String(a.p.name).localeCompare(String(b.p.name)));
  return rows;
}
