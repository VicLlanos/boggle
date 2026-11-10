// --------- SHAKE MECHANIC + BEGIN ROUND ---------
async function beginRound(){
  if(!isHost||!roomData)return;
  const gameType = roomData.gameType || 'boggle';

  // Room is no longer open for joining
  db.ref('lobbyIndex/'+gameType+'/'+roomId).remove().catch(()=>{});

  if(gameType === 'scatter'){
    const letter = randomLetter(false);
    const seed = roomId + '_' + srvNow();
    const categories = generateCategories(seed, 12);
    const updates={status:'playing',letter,categories,board:null,endsAt:srvNow()+ROUND_SECONDS*1000,startedAt:srvNow(),endedAt:null,rejected:null,challenges:null,forgiven:null};
    Object.keys(roomData.players||{}).forEach(uid=>{
      updates['players/'+uid+'/verdicts']=null;
      updates['players/'+uid+'/score']=0;
      updates['players/'+uid+'/words']={};
      updates['players/'+uid+'/answers']={};
    });
    resetRoundState();
    try{
      await db.ref('rooms/'+roomId).update(updates);
    }catch(e){
      toast('Could not start: '+e.message);
    }
    return;
  }

  if(gameType === 'hangman'){
    let prevLevel = roomData.hangLevel || 0;
    // If previous series already finished (level >= 5), start a fresh series at 1
    if(prevLevel >= HANG_MAX_LEVELS) prevLevel = 0;
    const level = prevLevel + 1;
    const puzzle = await pickHangmanPuzzle(roomId + '_' + srvNow() + '_' + level);
    const updates={
      status:'playing',
      hangLevel: level,
      hangMaxLevels: HANG_MAX_LEVELS,
      hangCategory: puzzle.category,
      hangWord: puzzle.word,
      hangHint: puzzle.hint,
      hangRevealed: puzzle.revealed,
      hangTiles: puzzle.tiles,
      board:null,letter:null,categories:null,
      endsAt: srvNow() + 45000,
      startedAt: srvNow(),
      endedAt:null
    };
    Object.keys(roomData.players||{}).forEach(uid=>{
      // Fresh series at level 1: clear wins. Later levels: keep wins, reset per-level flags
      if(level === 1) updates['players/'+uid+'/hangWins']=0;
      updates['players/'+uid+'/score']=0;
      updates['players/'+uid+'/words']={};
      updates['players/'+uid+'/answers']={};
      updates['players/'+uid+'/hangSolved']=false;
      updates['players/'+uid+'/hangWrong']=0;
    });
    if(level === 1) updates.hangHistory = [];
    resetRoundState();
    try{
      await db.ref('rooms/'+roomId).update(updates);
    }catch(e){
      toast('Could not start: '+e.message);
    }
    return;
  }


  if(gameType === 'board'){
    const ids=Object.keys(roomData.players||{});
    if(ids.length<1){return}   // solo play is allowed: 1–5 players
    const order=ids.slice().sort(()=>Math.random()-.5),pos={};ids.forEach(i=>pos[i]=0);
    const up={status:'playing',bg:{order,turn:order[0],pos,n:0,t:srvNow(),ev:null,used:null,winner:null},board:null,letter:null,categories:null,hangWord:null,drawWord:null,endsAt:srvNow()+36e5,startedAt:srvNow(),endedAt:null};
    ids.forEach(i=>{up['players/'+i+'/score']=0;up['players/'+i+'/words']={};up['players/'+i+'/answers']={}});
    try{await db.ref('rooms/'+roomId).update(up)}catch(e){toast('Could not start: '+e.message)}
    return;
  }
  if(gameType === 'chain'){
    const ids = Object.keys(roomData.players || {});
    if(ids.length < CHAIN_MIN_PLAYERS){ toast('Word Chain needs at least 2 players'); return; }
    const cat = pickChainCategory();
    const first = pickChainFirstWord(cat);              // always a word from the shuffled category
    const now = srvNow();
    const order = ids.slice();
    for(let i=order.length-1;i>0;i--){ const j = drawRandInt(i+1); const t = order[i]; order[i] = order[j]; order[j] = t; }
    const names = {};
    ids.forEach(u => { const p = roomData.players[u] || {}; names[u] = {n:p.name||'Player', a:p.avatar||'🙂'}; });
    const chain = {
      gid: now+'_'+Math.floor(Math.random()*1e6),
      cat: {id:cat.id, name:cat.name, emoji:cat.emoji},
      spinAt: now, spinMs: CHAIN_SPIN_MS,
      order, names, out: {},
      words: [{w:first, u:'sys', v:'ok', n:'Starting word'}],
      letter: chLastLetter(first), turn: order[0], phase: 'answer',
      deadline: now + CHAIN_SPIN_MS + CHAIN_TURN_SECONDS*1000,
      turnNo: 1, chN: 0, logN: 1,
      log: [{id:1, t:'🔗 Word Chain — category: '+cat.name+' · first word: '+first}]
    };
    const updates = {
      status:'playing', chain, chainChat:null,
      board:null, letter:null, categories:null, hangWord:null, drawWord:null,
      endsAt:null, startedAt:now, endedAt:null
    };
    ids.forEach(u => { updates['players/'+u+'/score'] = 0; updates['players/'+u+'/words'] = {}; updates['players/'+u+'/answers'] = {}; });
    resetRoundState();
    try{ await db.ref('rooms/'+roomId).update(updates); }
    catch(e){ toast('Could not start: '+e.message); }
    return;
  }

  if(gameType === 'spy'){
    const playerIds = Object.keys(roomData.players || {});
    if(playerIds.length < 3){ toast('Spy Word needs at least 3 players'); return; }
    // One game = one word + one spy, debated over SPY_MAX_ROUNDS rounds. Spy rotates each new game.
    const gameNo = (roomData.spyGameNo || 0) + 1;
    const round = 1;
    const spyUid = playerIds[(gameNo - 1) % playerIds.length];
    // 1) shuffle/choose a category first (animated reel for everyone), 2) then pick the secret word FROM that category
    const sCat = pickDrawCategory();
    const word = pickDrawWordCat(((gameNo - 1) % 10) + 1, sCat);
    drawRememberWord(word);
    const SPY_SPIN_MS = DRAW_SPIN_MS;
    const order = playerIds.slice();
    // shuffle clue order lightly
    for(let i=order.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); const t=order[i]; order[i]=order[j]; order[j]=t; }
    const updates = {
      status: 'playing',
      spyRound: 1,
      spyGameNo: gameNo,
      spyEvicted: null,
      spyTally: null,
      spyCategory: {id: sCat.id, name: sCat.name, emoji: sCat.emoji},
      spySpinAt: srvNow(),
      spySpinMs: SPY_SPIN_MS,
      spyMaxRounds: SPY_MAX_ROUNDS,
      spyWord: word,
      spyUid: spyUid,
      spyPhase: 'clues',
      spyClues: null,
      spyVotes: null,
      spyGuess: null,
      spyTurnOrder: order,
      spyTurnIdx: 0,
      board: null, letter: null, categories: null,
      hangWord: null, drawWord: null,
      endsAt: srvNow() + SPY_CLUE_SECONDS * 1000 + SPY_SPIN_MS,
      startedAt: srvNow(),
      endedAt: null
    };
    Object.keys(roomData.players||{}).forEach(uid => {
      updates['players/'+uid+'/spyScore'] = 0;
      updates['players/'+uid+'/score'] = 0;
      updates['players/'+uid+'/words'] = {};
      updates['players/'+uid+'/answers'] = {};
    });
    updates.spyHistory = [];
    resetRoundState();
    try{
      await db.ref('rooms/'+roomId).update(updates);
    }catch(e){ toast('Could not start: '+e.message); }
    return;
  }

  if(gameType === 'draw'){
    let prevLevel = roomData.drawLevel || 0;
    if(prevLevel >= DRAW_MAX_LEVELS) prevLevel = 0;
    const level = prevLevel + 1;
    // Rotate drawer among players
    const playerIds = Object.keys(roomData.players || {});
    if(!playerIds.length){ toast('Need at least one player'); return; }
    const drawerIdx = (level - 1) % playerIds.length;
    const drawerUid = playerIds[drawerIdx];
    // New game (level 1): pick a random category (the animated cycle plays for everyone); later levels keep that category
    const newGame = level === 1;
    let dCat = newGame ? null : drawCatById(roomData.drawCategory && roomData.drawCategory.id);
    if(!dCat) dCat = pickDrawCategory();
    const word = pickDrawWordCat(level, dCat);
    drawRememberWord(word);
    const prevUsed = Array.isArray(roomData.drawUsedWords) ? roomData.drawUsedWords.slice() : [];
    if(word && !prevUsed.includes(word)) prevUsed.push(word);
    const seenWords = (Array.isArray(roomData.drawSeenWords) ? roomData.drawSeenWords.slice() : []).filter(w => w !== word);
    seenWords.push(word);
    const spinMs = newGame ? DRAW_SPIN_MS : 0;
    const updates = {
      status: 'playing',
      drawLevel: level,
      drawMaxLevels: DRAW_MAX_LEVELS,
      drawWord: word,
      drawDrawerUid: drawerUid,
      drawUsedWords: level === 1 ? [word] : prevUsed,
      drawSeenWords: seenWords.slice(-200),
      drawCategory: {id: dCat.id, name: dCat.name, emoji: dCat.emoji},
      drawSpinAt: newGame ? srvNow() : null,
      drawSpinMs: newGame ? DRAW_SPIN_MS : null,
      drawStrokes: [],
      drawGuesses: null,
      board: null, letter: null, categories: null,
      hangCategory: null, hangWord: null,
      endsAt: srvNow() + spinMs + DRAW_SECONDS * 1000,
      startedAt: srvNow(),
      endedAt: null
    };
    Object.keys(roomData.players||{}).forEach(uid => {
      if(level === 1) updates['players/'+uid+'/drawWins'] = 0;
      updates['players/'+uid+'/score'] = 0;
      updates['players/'+uid+'/words'] = {};
      updates['players/'+uid+'/answers'] = {};
      updates['players/'+uid+'/drawSolved'] = false;
    });
    if(level === 1) updates.drawHistory = [];
    resetRoundState();
    try{
      await db.ref('rooms/'+roomId).update(updates);
    }catch(e){
      toast('Could not start: '+e.message);
    }
    return;
  }

  // Original Boggle path
  const board=scrambleBoard();
  const updates={status:'shaking',board,endsAt:null,startedAt:null,endedAt:null,letter:null,categories:null};
  Object.keys(roomData.players||{}).forEach(uid=>{updates['players/'+uid+'/score']=0;updates['players/'+uid+'/words']={};updates['players/'+uid+'/answers']={}});
  resetRoundState();
  try{
    await db.ref('rooms/'+roomId).update(updates);
  }catch(e){
    toast('Could not start: '+e.message);
    return;
  }
  clearTimeout(shakeTimeout);
  shakeTimeout=setTimeout(async()=>{
    if(roomData&&roomData.status==='shaking'){
      const now=srvNow();
      try{
        await db.ref('rooms/'+roomId).update({status:'playing',endsAt:now+ROUND_SECONDS*1000+SETTLE_TOTAL,startedAt:now});
      }catch(e){toast('Could not begin the round')}
    }
  },SHAKE_SECONDS*1000);
}
$('btnStart').onclick=beginRound;
