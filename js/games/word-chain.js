/* =====================================================================
   WORD CHAIN  ·  2–6 players · elimination · last player standing wins
   - A random category is picked (same animated reel as Sketch Race).
   - The system says the first word (always from that category).
   - Each player must say a word from the category that STARTS with the LAST letter of the previous word.
   - Words are checked by the same fact-checker Scattergories uses (built-in lists + Wikidata + Datamuse).
   - Valid word -> "Pass to next player". Run out of time (or get voted out) -> eliminated (can keep watching).
   - A word can never be used twice in one game (a new game resets the list).
   - Undecided ("maybe") words can be challenged by anyone -> everyone votes eject / keep.
   All game state lives in ONE node (rooms/<code>/chain) and every change is a transaction, so
   two phones can never step on each other.
   ===================================================================== */
const CHAIN_MIN_PLAYERS = 2, CHAIN_TURN_SECONDS = 20, CHAIN_GRACE = 1500, CHAIN_PASS_MS = 12000, CHAIN_VOTE_SECONDS = 25, CHAIN_SPIN_MS = 4800;

// Sketch Race category -> which Scattergories fact-check categories can confirm a word for it
const CHAIN_VERIFY = {
  animals:['An animal'], food:['A food','A drink'], fruitveg:['A fruit or vegetable'],
  home:['Something you find in a house'], school:['Something you find at school'], sports:['A sport or game'],
  vehicles:['A type of transport'], nature:['A plant or flower','A type of weather','Something in a forest'],
  music:['A musical instrument'], fantasy:[], space:[], jobs:['A job or occupation'],
  movies:['A movie or TV show'], songs:['A song title'], tvshows:['A movie or TV show'], actors:['An actor or actress'], singers:['A singer or band'], videogames:['A video game'], cartoons:['A cartoon character'], books:['A book or novel'],
  clothes:['Something you wear'], places:['A type of building','A city','A country'], toys:['A toy'],
  tools:['A tool'], body:['A body part'], party:['Things at a party','A holiday or celebration'],
  camping:['Something you take on a trip'], ocean:['Something in the ocean','A sea creature','Something you find at the beach']
};

let chainInt = null, chainBusy = false, chainSeenLog = 0, chainFired = {key:'',at:0};
let chainTurnKey = '', chainSpinKey = '', chainPrevWords = -1, chainPrevPhase = '', chainWasOut = false, chainLastTick = -1;
const CHAIN_CATSEEN_KEY = 'chainSeenCatsV1';
let CHAIN_CATSEEN = [];
try{ CHAIN_CATSEEN = JSON.parse(localStorage.getItem(CHAIN_CATSEEN_KEY) || '[]') || []; }catch(e){ CHAIN_CATSEEN = []; }

/* ---------- small helpers ---------- */
function chNorm(s){ return String(s||'').toUpperCase().replace(/['’`]/g,'').replace(/[^A-Z ]/g,' ').replace(/\s+/g,' ').trim(); }
function chLastLetter(s){ const m = String(s||'').toUpperCase().match(/[A-Z]/g); return m && m.length ? m[m.length-1] : 'A'; }
function chKey(s){ return chNorm(s).replace(/ /g,''); }
function chWords(c){ return Array.isArray(c.words) ? c.words.filter(Boolean) : Object.values(c.words||{}).filter(Boolean); }
function chOrder(c){ return Array.isArray(c.order) ? c.order.filter(Boolean) : Object.values(c.order||{}).filter(Boolean); }
function chAlive(c){ const out = c.out||{}; return chOrder(c).filter(u => !out[u]); }
function chName(c,uid){ const p = (roomData&&roomData.players||{})[uid]; const n = (c.names||{})[uid]||{}; return (p&&p.name) || n.n || 'Player'; }
function chP(c,uid){ const p = (roomData&&roomData.players||{})[uid]; const n = (c.names||{})[uid]||{}; return {name:(p&&p.name)||n.n||'Player', avatar:(p&&p.avatar)||n.a||'🙂'}; }
function chNextAlive(c,fromUid){
  const ord = chOrder(c), out = c.out||{}, i = ord.indexOf(fromUid);
  for(let k=1;k<=ord.length;k++){ const u = ord[((i+k)%ord.length+ord.length)%ord.length]; if(!out[u]) return u; }
  return null;
}
function chLastValidLetter(c){
  const w = chWords(c);
  for(let i=w.length-1;i>=0;i--){ if(!w[i].bad) return chLastLetter(w[i].w); }
  return 'A';
}
// A word counts as used if the same word (or its plural / singular) was already played this game
function chUsed(c,word){
  const k = chKey(word), set = new Set(chWords(c).map(w => chKey(w.w)));
  return set.has(k) || set.has(k+'S') || set.has(k+'ES') || (k.endsWith('S') && set.has(k.slice(0,-1))) || (k.endsWith('ES') && set.has(k.slice(0,-2)));
}
function chLog(c,txt){ c.logN = (c.logN||0)+1; c.log = (Array.isArray(c.log)?c.log:Object.values(c.log||{})).concat([{id:c.logN,t:String(txt).slice(0,160)}]).slice(-12); }
function chEliminate(c,uid,reason,now){ c.out = c.out||{}; if(c.out[uid]) return; const place = chAlive(c).length; c.out[uid] = {at:now,r:reason,p:place}; }
function chBeginTurn(c,uid,now){
  c.turn = uid; c.phase = 'answer'; c.letter = chLastValidLetter(c);
  c.deadline = now + CHAIN_TURN_SECONDS*1000; c.turnNo = (c.turnNo||0)+1;
  c.chk = null; c.challenge = null; c.passDeadline = null; c.pauseLeft = null;
}
function chCheckWinner(c,now){
  const al = chAlive(c);
  if(al.length > 1) return false;
  c.phase = 'over'; c.winner = al[0] || null; c.overAt = now;
  c.deadline = null; c.passDeadline = null; c.challenge = null; c.chk = null;
  chLog(c, c.winner ? '👑 '+chName(c,c.winner)+' is the last one standing!' : '🏁 Everyone left — game over');
  return true;
}
function chVoteDecided(c){
  const ch = c.challenge; if(!ch) return true;
  const v = Array.isArray(ch.voters) ? ch.voters : Object.values(ch.voters||{}), n = v.length;
  if(!n) return true;
  let ej = 0, kp = 0;
  v.forEach(u => { const x = (ch.votes||{})[u]; if(x==='eject') ej++; else if(x==='keep') kp++; });
  if(ej*2 > n) return true;               // eject already has a majority
  if((n-kp)*2 <= n) return true;          // eject can no longer reach a majority
  return (ej+kp) >= n;                    // everybody voted
}
function chResolve(c,now){
  const ch = c.challenge; if(!ch) return;
  const v = Array.isArray(ch.voters) ? ch.voters : Object.values(ch.voters||{}), n = v.length;
  let ej = 0; v.forEach(u => { if((ch.votes||{})[u]==='eject') ej++; });
  const w = c.words[ch.idx], eject = ej*2 > n;
  if(eject){
    if(w) w.bad = true;
    chLog(c, '⚖️ Voted out: '+chName(c,ch.target)+' — “'+(w?w.w:'')+'” rejected ('+ej+'/'+n+')');
    chEliminate(c, ch.target, 'ejected', now);
    c.challenge = null;
    if(chCheckWinner(c,now)) return;
    const holder = c.turn;
    if(holder===ch.target || (c.out||{})[holder]) chBeginTurn(c, chNextAlive(c,holder), now);
    else chBeginTurn(c, holder, now);       // same player, but the letter is rolled back to the last valid word
  }else{
    if(w) w.v = 'kept';
    chLog(c, '✅ “'+(w?w.w:'')+'” stays — '+chName(c,ch.target)+' is safe');
    const res = ch.resume || {}; c.challenge = null;
    if((c.out||{})[c.turn]){ chBeginTurn(c, chNextAlive(c,c.turn), now); return; }
    c.phase = res.phase || 'answer';
    if(c.phase==='answer') c.deadline = now + (res.left || CHAIN_TURN_SECONDS*1000);
    else c.passDeadline = now + (res.pass || 5000);
  }
}

/* ---------- one atomic write helper ---------- */
function chainTx(fn){
  const rid = roomId;
  if(!rid || !user) return Promise.resolve({committed:false});
  return db.ref('rooms/'+rid+'/chain').transaction(cur => {
    if(cur===null || cur===undefined) return null;
    try{
      const c = JSON.parse(JSON.stringify(cur));
      c.words = chWords(c).slice(); c.order = chOrder(c).slice(); c.out = c.out||{};
      c.log = Array.isArray(c.log) ? c.log : Object.values(c.log||{});
      const r = fn(c, srvNow());
      return r===false ? undefined : c;
    }catch(e){ console.warn('chain tx fn', e); return undefined; }
  }, undefined, false).catch(e => { console.warn('chain tx', e); return {committed:false}; });
}

/* ---------- category + first word ---------- */
function pickChainCategory(){
  const recent = new Set(CHAIN_CATSEEN.slice(-6));
  if(roomData && roomData.chain && roomData.chain.cat) recent.add(roomData.chain.cat.id);
  let pool = DRAW_CATS.filter(c => !recent.has(c.id));
  if(!pool.length) pool = DRAW_CATS.slice();
  const cat = pool[drawRandInt(pool.length)];
  CHAIN_CATSEEN = CHAIN_CATSEEN.filter(x => x !== cat.id); CHAIN_CATSEEN.push(cat.id);
  try{ localStorage.setItem(CHAIN_CATSEEN_KEY, JSON.stringify(CHAIN_CATSEEN.slice(-30))); }catch(e){}
  return cat;
}
// The opening word ALWAYS comes from the chosen category, and ends in a letter players can realistically continue from
function pickChainFirstWord(cat){
  const dc = drawCatById(cat.id) || cat;
  const all = (dc.easy||[]).concat(dc.hard||[]);
  const starts = {}; all.forEach(w => { starts[w[0]] = (starts[w[0]]||0)+1; });
  let pool = (dc.easy||[]).filter(w => w.length >= 3 && w.length <= 12 && (starts[chLastLetter(w)]||0) >= 3);
  if(!pool.length) pool = all.filter(w => (starts[chLastLetter(w)]||0) >= 2);
  if(!pool.length) pool = all;
  return pool[drawRandInt(pool.length)];
}

/* ---------- word judge (bank first, then the Scattergories fact-checker) ---------- */
const CHAIN_BANKS = {};
function chainBank(catId){
  if(!CHAIN_BANKS[catId]){
    const dc = drawCatById(catId), s = new Set();
    if(dc) (dc.easy||[]).concat(dc.hard||[]).forEach(w => s.add(w.replace(/ /g,'')));
    CHAIN_BANKS[catId] = s;
  }
  return CHAIN_BANKS[catId];
}
function chainInBank(cat,word){
  const s = chainBank(cat.id), k = chKey(word);
  return s.has(k) || s.has(k+'S') || s.has(k+'ES') || (k.endsWith('S') && s.has(k.slice(0,-1))) || (k.endsWith('ES') && s.has(k.slice(0,-2)));
}
async function chainJudge(cat,word){
  if(chainInBank(cat,word)) return {v:'ok', note:'In the '+cat.name+' list'};
  const names = (CHAIN_VERIFY[cat.id]||[]).length ? CHAIN_VERIFY[cat.id] : [cat.name];   // unknown category text = "is it a real word / name?"
  const tasks = names.map(n => ScatVerify.check(n, word.toLowerCase()).catch(() => ({v:'maybe',note:'The fact-checker is unreachable, so this is undecided.',offline:1})));
  const res = await Promise.race([Promise.all(tasks), new Promise(r => setTimeout(() => r(null), 7000))]);
  if(!res) return {v:'maybe', note:'The fact-checker took too long, so this one is undecided.'};
  const ok = res.find(r => r && r.v==='ok');
  if(ok) return {v:'ok', note:ok.note||''};
  if(res.every(r => r && r.v==='no')) return {v:'no', note:res[0].note||''};
  const m = res.find(r => r && r.v==='maybe') || res[0] || {};
  return {v:'maybe', note:m.note||'The system could not confirm this word.'};
}

/* ---------- actions ---------- */
function chMsg(text,kind){ const m = $('chMsg'); if(!m) return; m.textContent = text||''; m.className = 'ch-msg'+(kind?' '+kind:''); }
async function chainSubmit(){
  const c = roomData && roomData.chain; if(!c || !user || chainBusy) return;
  if(c.phase!=='answer' || c.turn!==user.uid) return;
  const input = $('chInput'), word = chNorm(input.value);
  if(word.length < 2){ chMsg('Type a word first ✍️','bad'); return; }
  if(word[0] !== c.letter){ chMsg('It has to start with “'+c.letter+'”.','bad'); snd('bad'); return; }
  if(chUsed(c,word)){ chMsg('“'+word+'” was already used this game.','bad'); snd('bad'); return; }
  const turnNo = c.turnNo, cat = c.cat, me = user.uid;
  chainBusy = true; chMsg('🔎 Checking…',''); renderChain();
  try{
    // 1) reserve the turn so the clock cannot eliminate me while the fact-checker is working
    const r1 = await chainTx((c2,now) => {
      if(c2.phase!=='answer' || c2.turn!==me || c2.turnNo!==turnNo) return false;
      if(now > c2.deadline + CHAIN_GRACE) return false;
      c2.pauseLeft = Math.max(5000, c2.deadline - now);
      c2.phase = 'checking'; c2.chk = {u:me, until:now+9000};
      return true;
    });
    if(!r1.committed){ chMsg('Too slow — the clock ran out!','bad'); return; }
    // 2) judge the word
    let verdict;
    try{ verdict = await chainJudge(cat, word); }
    catch(e){ verdict = {v:'maybe', note:'The checker hit a problem, so this one is undecided.'}; }
    if(verdict.v==='no'){
      await chainTx((c2,now) => {
        if(c2.phase!=='checking' || c2.turn!==me || c2.turnNo!==turnNo) return false;
        c2.phase = 'answer'; c2.deadline = now + (c2.pauseLeft||5000); c2.chk = null; c2.pauseLeft = null; return true;
      });
      chMsg('❌ '+(verdict.note || 'That doesn’t fit the category.')+' Try another word!','bad'); snd('bad');
      return;
    }
    // 3) commit the word
    const r2 = await chainTx((c2,now) => {
      if(c2.phase!=='checking' || c2.turn!==me || c2.turnNo!==turnNo) return false;
      if(chUsed(c2,word)){ c2.phase = 'answer'; c2.deadline = now + (c2.pauseLeft||5000); c2.chk = null; return true; }
      c2.words.push({w:word, u:me, v:verdict.v, n:String(verdict.note||'').slice(0,160)});
      chBeginTurn(c2, chNextAlive(c2,me), now);   // automatic: straight on to the next player still in the game
      return true;
    });
    if(r2.committed){ input.value = ''; chMsg(verdict.v==='ok' ? '✅ '+(verdict.note||'Accepted!')+' — next player is up!' : '⚠️ Accepted, but undecided — others may challenge.', verdict.v==='ok'?'good':''); snd(verdict.v==='ok'?'ok':'tap'); }
    else chMsg('Too slow — the clock ran out!','bad');
  }finally{
    chainBusy = false; renderChain();
  }
}
function chainPass(){
  const me = user && user.uid; if(!me) return;
  snd('tap');
  chainTx((c,now) => {
    if(c.phase!=='passing' || c.turn!==me) return false;
    chBeginTurn(c, chNextAlive(c,me), now); return true;
  });
}
function chainAutoPassTx(turnNo){
  return chainTx((c,now) => {
    if(c.phase!=='passing' || c.turnNo!==turnNo || now < c.passDeadline) return false;
    chBeginTurn(c, chNextAlive(c,c.turn), now); return true;
  });
}
function chainTimeoutTx(turnNo){
  return chainTx((c,now) => {
    if(c.turnNo!==turnNo) return false;
    if(c.phase==='answer'){ if(now < c.deadline + CHAIN_GRACE) return false; }
    else if(c.phase==='checking'){ if(!c.chk || now < c.chk.until) return false; }
    else return false;
    const uid = c.turn;
    chLog(c, '⏰ '+chName(c,uid)+' ran out of time and is out!');
    chEliminate(c, uid, 'time', now);
    if(chCheckWinner(c,now)) return true;
    chBeginTurn(c, chNextAlive(c,uid), now);
    return true;
  });
}
async function chainChallenge(){
  const c = roomData && roomData.chain; if(!c || !user) return;
  const me = user.uid, words = chWords(c), last = words[words.length-1];
  if(!last || last.v!=='maybe' || last.ch || last.bad || last.u==='sys') return;
  // jury = every player still in the room except the accused (eliminated spectators can vote too)
  const eligible = Object.values(roomData.players||{}).filter(p => p && p.uid!==last.u && p.online!==false).map(p => p.uid);
  if(!eligible.includes(me)) eligible.push(me);
  if(eligible.length < 2){ toast('Nobody else is here to vote on a challenge'); return; }
  snd('tap');
  const r = await chainTx((c2,now) => {
    if(c2.phase!=='answer' && c2.phase!=='passing') return false;
    const idx = c2.words.length-1, w = c2.words[idx];
    if(!w || w.v!=='maybe' || w.ch || w.bad || w.u==='sys' || w.u===me) return false;
    if(c2.out[me] || c2.out[w.u]) return false;
    w.ch = true; c2.chN = (c2.chN||0)+1;
    const votes = {}; votes[me] = 'eject';
    c2.challenge = {by:me, idx, target:w.u, voters:eligible, votes, until:now+CHAIN_VOTE_SECONDS*1000,
      resume:{phase:c2.phase, left:c2.phase==='answer'?Math.max(4000,c2.deadline-now):0, pass:c2.phase==='passing'?Math.max(5000,c2.passDeadline-now):0}};
    c2.phase = 'vote'; c2.deadline = null; c2.passDeadline = null;
    chLog(c2, '🚨 '+chName(c2,me)+' challenged “'+w.w+'”');
    if(chVoteDecided(c2)) chResolve(c2,now);
    return true;
  });
  if(!r.committed) toast('Too late — the game already moved on');
}
function chainVote(choice){
  const me = user && user.uid; if(!me) return;
  snd('tap');
  chainTx((c,now) => {
    if(c.phase!=='vote' || !c.challenge) return false;
    const ch = c.challenge, v = Array.isArray(ch.voters) ? ch.voters : Object.values(ch.voters||{});
    if(!v.includes(me)) return false;
    ch.votes = ch.votes||{}; if(ch.votes[me]) return false;
    ch.votes[me] = choice;
    if(chVoteDecided(c)) chResolve(c,now);
    return true;
  });
}
function chainVoteTimeoutTx(){
  return chainTx((c,now) => {
    if(c.phase!=='vote' || !c.challenge || now < c.challenge.until) return false;
    chResolve(c,now); return true;
  });
}
function chainSendChat(text){
  const c = roomData && roomData.chain; if(!c || !user || !roomId) return;
  text = String(text||'').trim().slice(0,120); if(!text) return;
  db.ref('rooms/'+roomId+'/chainChat').push({u:user.uid, n:(profile&&profile.name)||'Player', t:text, ch:c.chN||0, at:srvNow()}).catch(()=>{});
}
// Called from leaveRoom(): leaving mid-game = eliminated (so nobody waits on an empty seat)
function chainOnLeave(){
  if(!roomData || roomData.gameType!=='chain' || !roomData.chain || !roomId || !user) return;
  const me = user.uid, c0 = roomData.chain;
  if(c0.phase==='over' || !chOrder(c0).includes(me)) return;
  if((c0.out||{})[me] && c0.phase!=='vote') return;
  chainTx((c,now) => {
    if(c.phase==='over') return false;
    const alreadyOut = !!c.out[me];
    let wasTarget = false;
    if(c.phase==='vote' && c.challenge){
      const ch = c.challenge;
      ch.voters = (Array.isArray(ch.voters) ? ch.voters : Object.values(ch.voters||{})).filter(u => u!==me);
      if(ch.votes) delete ch.votes[me];
      wasTarget = ch.target===me;
    }
    if(alreadyOut){ if(c.phase==='vote' && chVoteDecided(c)) chResolve(c,now); return true; }
    const wasTurn = c.turn===me;
    chLog(c, '🚪 '+chName(c,me)+' left the game');
    chEliminate(c, me, 'left', now);
    if(chCheckWinner(c,now)) return true;
    if(c.phase==='vote' && c.challenge){
      if(wasTarget){
        const w = c.words[c.challenge.idx]; if(w) w.bad = true;
        const holder = c.turn; c.challenge = null;
        chBeginTurn(c, (holder===me || c.out[holder]) ? chNextAlive(c,holder) : holder, now);
      }else if(chVoteDecided(c)) chResolve(c,now);
    }else if(wasTurn){
      chBeginTurn(c, chNextAlive(c,me), now);
    }
    return true;
  });
}

/* ---------- category reel (same look as Sketch Race, own text) ---------- */
function maybeShowChainSpin(){
  const c = roomData && roomData.chain; if(!c || !c.spinAt || !c.cat) return;
  const key = roomId+'|'+c.gid;
  if(chainSpinKey === key) return;
  chainSpinKey = key;
  const total = c.spinMs || CHAIN_SPIN_MS, left = total - (srvNow() - c.spinAt);
  if(left < 700) return;
  runChainCatSpin(c.cat, left, chWords(c)[0] ? chWords(c)[0].w : '');
}
function runChainCatSpin(cat, ms, firstWord){
  const old = document.getElementById('chainCatOverlay'); if(old) old.remove();
  const ov = document.createElement('div');
  ov.id = 'chainCatOverlay'; ov.className = 'dcat-ov';
  ov.innerHTML = '<div class="dcat-card"><div class="dcat-title">🔗 Choosing your category…</div>'
    + '<div class="dcat-reel"><div class="dcat-emoji" id="chcEmoji">🎲</div><div class="dcat-name" id="chcName">Get ready!</div></div>'
    + '<div class="dcat-sub" id="chcSub">Every word this game must fit the category that lands</div></div>';
  document.body.appendChild(ov);
  const emojiEl = ov.querySelector('#chcEmoji'), nameEl = ov.querySelector('#chcName'), subEl = ov.querySelector('#chcSub'), reel = ov.querySelector('.dcat-reel');
  const t0 = Date.now(), revealAt = Math.max(900, ms - 1700);
  let delay = 70, lastId = '', done = false;
  const step = () => {
    if(done || !document.body.contains(ov)) return;
    const el = Date.now() - t0;
    if(el >= revealAt){
      done = true;
      emojiEl.textContent = cat.emoji; nameEl.textContent = cat.name;
      reel.classList.remove('spin'); reel.classList.add('land');
      ov.querySelector('.dcat-title').textContent = '✨ Your category is…';
      subEl.textContent = firstWord ? 'The system starts with “'+firstWord+'” — next word must start with “'+chLastLetter(firstWord)+'”' : 'Good luck!';
      try{ snd('big'); }catch(e){}
      setTimeout(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 400); }, Math.max(700, ms - (Date.now() - t0)));
      return;
    }
    let c2, guard = 0;
    do{ c2 = DRAW_CATS[Math.floor(Math.random()*DRAW_CATS.length)]; guard++; }while((c2.id===lastId || c2.id===cat.id) && guard < 12);
    lastId = c2.id; emojiEl.textContent = c2.emoji; nameEl.textContent = c2.name;
    reel.classList.add('spin');
    try{ snd('tick'); }catch(e){}
    delay = Math.min(360, delay*1.1 + 4);
    setTimeout(step, delay);
  };
  step();
}

/* ---------- screen ---------- */
function enterChain(){
  const c = roomData && roomData.chain; if(!c) return;
  roundEnded = false; chainBusy = false; chainTurnKey = ''; chainPrevWords = -1; chainPrevPhase = ''; chainWasOut = false; chainLastTick = -1;
  chainSeenLog = (Array.isArray(c.log) ? c.log : Object.values(c.log||{})).reduce((m,l) => Math.max(m, l&&l.id||0), 0);
  const inp = $('chInput'); if(inp) inp.value = '';
  chMsg('','');
  const sb = $('btnSoundChain'); if(sb){ sb.textContent = soundOn ? '🔊' : '🔇'; }
  show('screen-chain');
  try{ const names = CHAIN_VERIFY[c.cat&&c.cat.id] || []; ScatVerify.warm(names); }catch(e){}
  renderChain();
  maybeShowChainSpin();
  clearInterval(chainInt); chainInt = setInterval(chainTick, 250); chainTick();
  snd('go');
}

function renderChain(){
  if(!roomData || !roomData.chain || !user) return;
  const c = roomData.chain, me = user.uid, out = c.out||{}, order = chOrder(c), words = chWords(c);
  const over = c.phase==='over', meIn = order.includes(me), meOut = !!out[me] || !meIn;
  const alive = chAlive(c), last = words[words.length-1];
  const isMe = c.turn===me, holder = c.turn ? chP(c,c.turn) : {name:'',avatar:''};

  // header + roster + meta
  $('chCatChip').textContent = c.cat ? c.cat.emoji+' '+c.cat.name : '🔗 Word Chain';
  $('chRoster').innerHTML = order.map(uid => {
    const p = chP(c,uid), isOut = !!out[uid], turn = !over && !isOut && c.turn===uid && c.phase!=='vote', win = over && c.winner===uid;
    return `<div class="ch-p${uid===me?' me':''}${isOut?' out':''}${turn?' turn':''}${win?' win':''}"><span class="av">${esc(p.avatar)}</span><span class="nm">${esc(p.name)}</span><span>${win?'👑':isOut?'💀':turn?'🎯':''}</span></div>`;
  }).join('');
  const validCount = words.filter(w => !w.bad && w.u!=='sys').length;
  $('chMeta').textContent = '🔗 '+validCount+' word'+(validCount===1?'':'s')+' so far · 🧍 '+alive.length+' still in';

  // word trail
  const shown = words.slice(-8), startIdx = words.length - shown.length;
  const trail = $('chTrail');
  trail.innerHTML = (startIdx>0 ? '<div class="ch-more">… '+startIdx+' earlier word'+(startIdx>1?'s':'')+'</div>' : '') + shown.map((w,i) => {
    const sys = w.u==='sys', isLast = i===shown.length-1;
    const t = String(w.w||''), a = t.charAt(0), mid = t.slice(1,-1), z = t.slice(-1);
    const flag = w.bad ? '<span class="flag">🚫 rejected</span>' : w.v==='kept' ? '<span class="flag">⚖️ kept</span>' : w.v==='maybe' ? '<span class="flag">⚠️ undecided</span>' : '';
    return `<div class="ch-w${sys?' sys':''}${isLast&&!w.bad?' new':''}${w.v==='maybe'&&!w.bad?' maybe':''}${w.v==='kept'?' kept':''}${w.bad?' bad':''}"><span class="who">${sys?'🤖':esc(chP(c,w.u).avatar)}</span><span class="wd"><b>${esc(a)}</b>${esc(mid)}<i>${esc(z)}</i></span>${flag}</div>`;
  }).join('');
  trail.scrollTop = trail.scrollHeight;

  // undecided note under the trail
  const un = $('chUndecided');
  if(last && last.v==='maybe' && !last.bad && !last.ch && !over){
    un.style.display = 'block';
    un.innerHTML = '⚠️ <b>Undecided:</b> '+esc(last.n || 'The system couldn’t confirm this word.')+(last.u!==me && !meOut ? ' Think it doesn’t belong? Challenge it below.' : '');
  }else un.style.display = 'none';

  // letter tile + banner
  const tileLetter = (c.phase==='answer'||c.phase==='checking') ? c.letter : chLastLetter(last ? last.w : 'A');
  const lt = $('chLetter');
  if(lt.textContent !== tileLetter){ lt.textContent = tileLetter; lt.classList.remove('pop'); void lt.offsetWidth; lt.classList.add('pop'); }
  $('chTurn').style.display = over ? 'none' : 'flex';
  let banner = '', sub = '';
  if(c.phase==='answer'){
    banner = isMe ? '🎯 Your turn!' : '⏳ '+holder.name+'’s turn';
    sub = isMe ? 'Say a '+(c.cat?c.cat.name:'')+' word starting with “'+c.letter+'”' : 'Waiting for '+holder.name+'… (next word starts with “'+c.letter+'”)';
  }else if(c.phase==='checking'){
    banner = isMe ? '🔎 Checking your word…' : '🔎 '+holder.name+' answered — checking…'; sub = 'Hang tight';
  }else if(c.phase==='passing'){
    banner = isMe ? '✅ Nice one!' : '✅ '+holder.name+' got it'; sub = isMe ? 'Pass the turn — next word starts with “'+tileLetter+'”' : 'Passing to the next player…';
  }else if(c.phase==='vote'){
    banner = '⚖️ Challenge!'; sub = 'Vote below — a majority is needed to eject';
  }
  $('chBanner').textContent = banner; $('chSub').textContent = sub;

  // answer form / pass / challenge
  const showForm = !over && !meOut && isMe && (c.phase==='answer' || c.phase==='checking');
  $('chForm').style.display = showForm ? 'flex' : 'none';
  const canType = showForm && c.phase==='answer' && !chainBusy;
  $('chInput').disabled = !canType; $('btnChainSend').disabled = !canType;
  const key = (c.turnNo||0)+'|'+(c.chN||0);
  if(showForm && c.phase==='answer' && key!==chainTurnKey){
    chainTurnKey = key; $('chInput').value = ''; chMsg('','');
    snd('go'); try{ if(navigator.vibrate) navigator.vibrate(60); }catch(e){}
    setTimeout(() => { try{ $('chInput').focus(); }catch(e){} }, 120);
  }
  if(!showForm && !chainBusy && c.phase!=='checking' && !(last && last.u===me && c.turn!==me && !meOut && c.phase==='answer')) chMsg('','');   // the author keeps their ✅ note while the next player is up
  const jurySize = last ? Object.values(roomData.players||{}).filter(p => p && p.uid!==last.u && p.online!==false).length : 0;
  const canChal = !over && !meOut && (c.phase==='answer' || c.phase==='passing') && last && last.v==='maybe' && !last.ch && !last.bad && last.u!=='sys' && last.u!==me && !out[last.u] && jurySize >= 2;
  $('btnChainChallenge').style.display = canChal ? 'flex' : 'none';
  if(last && last.v==='maybe' && !last.ch && !last.bad && last.u!=='sys' && last.u!==me && !meOut && !over && jurySize < 2) un.innerHTML += ' <i>(Only two of you are here, so there’s nobody to vote — undecided words get the benefit of the doubt.)</i>';

  // challenge vote panel
  const vp = $('chVote');
  if(c.phase==='vote' && c.challenge){
    const ch = c.challenge, w = words[ch.idx] || {w:'',n:''}, voters = Array.isArray(ch.voters) ? ch.voters : Object.values(ch.voters||{}), votes = ch.votes||{};
    const tp = chP(c,ch.target), bp = chP(c,ch.by);
    vp.style.display = 'flex';
    $('chVoteInfo').innerHTML = `<div class="ch-vq"><b>${esc(bp.name)}</b> challenged <b>${esc(tp.name)}</b>’s word</div><div class="ch-vword">${esc(w.w)}</div><div class="ch-vnote">${esc(w.n||'')}</div>`;
    let ej = 0, kp = 0; voters.forEach(u => { if(votes[u]==='eject') ej++; else if(votes[u]==='keep') kp++; });
    const myVote = votes[me], canVote = voters.includes(me) && !myVote;
    $('chVoteBtns').innerHTML = canVote ? `<button type="button" class="ch-vbtn eject" data-v="eject">🚪 Eject ${esc(tp.name)}</button><button type="button" class="ch-vbtn keep" data-v="keep">✅ Keep ${esc(tp.name)}</button>` : '';
    let stat = '🚪 Eject '+ej+' · ✅ Keep '+kp+' · waiting on '+Math.max(0,voters.length-ej-kp)+' · need '+(Math.floor(voters.length/2)+1)+' to eject';
    if(myVote) stat = 'You voted to '+(myVote==='eject'?'eject':'keep')+'. ' + stat;
    else if(me===ch.target) stat = 'It’s your word — the others decide. Make your case in the chat! 😅 · ' + stat;
    else if(!voters.includes(me)) stat = 'You can watch and chat. · ' + stat;
    $('chVoteStat').textContent = stat;
    const chat = Object.values(roomData.chainChat||{}).filter(m => m && m.ch===(c.chN||0)).sort((a,b) => (a.at||0)-(b.at||0)).slice(-20);
    const cl = $('chChatList'), atBottom = cl.scrollTop + cl.clientHeight >= cl.scrollHeight - 8;
    cl.innerHTML = chat.map(m => `<div><b>${esc(m.n||'Player')}:</b> ${esc(m.t||'')}</div>`).join('');
    if(atBottom) cl.scrollTop = cl.scrollHeight;
  }else vp.style.display = 'none';

  // eliminated banner
  const ob = $('chOutBanner');
  if(!over && meOut && meIn){
    ob.style.display = 'block';
    ob.innerHTML = '💀 You’re out!<br><span style="font-weight:700;opacity:.85">Keep watching until the last player standing is declared — or leave and play a different game.</span>';
  }else ob.style.display = 'none';

  // game over
  const ov = $('chOver');
  if(over){
    ov.style.display = 'block';
    $('chOverTitle').textContent = c.winner ? (c.winner===me ? '🏆 You’re the last one standing!' : '👑 '+chP(c,c.winner).name+' wins!') : '🏁 Game over';
    const rows = order.map(uid => ({uid, place: uid===c.winner ? 1 : ((out[uid]&&out[uid].p)||99), why: uid===c.winner ? 'Last one standing' : ({time:'Ran out of time',ejected:'Voted out',left:'Left the game'}[out[uid]&&out[uid].r]||'Out')})).sort((a,b) => a.place-b.place);
    $('chStand').innerHTML = rows.map(r => `<div><span>${r.place===1?'👑':r.place+'.'} ${esc(chP(c,r.uid).avatar)} ${esc(chP(c,r.uid).name)}${r.uid===me?' (you)':''}</span><span>${esc(r.why)}</span></div>`).join('') + `<div><span>🔗 Words played</span><span>${validCount}</span></div>`;
    const hostGone = !(roomData.players||{})[roomData.hostUid];
    const canAgain = isHostNow() || hostGone;
    $('btnChainAgain').style.display = canAgain ? 'flex' : 'none';
    $('chOverWait').style.display = canAgain ? 'none' : 'block';
  }else ov.style.display = 'none';

  // feed (last few events) + toast for fresh ones
  const log = (Array.isArray(c.log) ? c.log : Object.values(c.log||{})).filter(Boolean);
  $('chFeed').innerHTML = log.slice(-4).reverse().map(l => esc(l.t)).join('<br>');
  const fresh = log.filter(l => l.id > chainSeenLog);
  if(fresh.length){ chainSeenLog = Math.max(chainSeenLog, ...fresh.map(l => l.id)); if(chainPrevPhase) toast(fresh[fresh.length-1].t); }

  // leave button wording
  const lb = $('btnChainLeave');
  lb.textContent = over ? '← Back to lobby' : (meOut ? '🎮 Leave & play another game' : 'Leave game');
  lb.classList.toggle('big', meOut || over);

  // sounds
  if(chainPrevWords >= 0){
    if(words.length > chainPrevWords && last && last.u!==me && last.u!=='sys') snd('opp');
    if(c.phase==='vote' && chainPrevPhase!=='vote') snd('shake');
    if(meOut && !chainWasOut && meIn) snd('bad');
    if(over && chainPrevPhase!=='over') snd(c.winner===me ? 'win' : 'go');
  }
  chainPrevWords = words.length; chainPrevPhase = c.phase; chainWasOut = meOut;
}

function chainTick(){
  if(!roomData || roomData.gameType!=='chain' || !roomId || !user){ clearInterval(chainInt); chainInt = null; return; }
  const c = roomData.chain; if(!c) return;
  const now = srvNow(), me = user.uid, TURN = CHAIN_TURN_SECONDS*1000;
  const ring = $('chTimerRing'), tx = $('chTimerText');
  let ms = 0, tot = TURN, txt = '', low = false;
  if(c.phase==='answer'){
    ms = Math.min(TURN, Math.max(0, c.deadline - now)); txt = (c.deadline - now > TURN) ? CHAIN_TURN_SECONDS : Math.ceil(ms/1000); low = ms > 0 && ms <= 5000;
  }else if(c.phase==='checking'){ ms = Math.min(TURN, c.pauseLeft || TURN); txt = '🔎'; }
  else if(c.phase==='passing'){ tot = CHAIN_PASS_MS; ms = Math.max(0, c.passDeadline - now); txt = Math.ceil(ms/1000); }
  else if(c.phase==='vote' && c.challenge){ tot = CHAIN_VOTE_SECONDS*1000; ms = Math.max(0, c.challenge.until - now); txt = Math.ceil(ms/1000); }
  else{ ms = 0; txt = '🏁'; }
  ring.style.setProperty('--pct', (tot ? ms/tot*100 : 0)+'%');
  tx.textContent = txt; ring.classList.toggle('low', low);
  if(low && c.turn===me){ const s = Math.ceil(ms/1000); if(s!==chainLastTick){ chainLastTick = s; snd('tick'); } } else chainLastTick = -1;

  // Anyone can close an expired phase (it is idempotent) — the player on the clock first, then the host, then everyone else
  const delay = c.turn===me ? 0 : (isHostNow() ? 700 : 1500 + (String(me).charCodeAt(0)%10)*150);
  const key = c.phase+'|'+(c.turnNo||0)+'|'+(c.chN||0);
  const due = (t) => {
    if(now < t + delay) return false;
    if(chainFired.key===key && now - chainFired.at < 4000) return false;
    chainFired = {key, at:now}; return true;
  };
  if(c.phase==='answer' && due(c.deadline + CHAIN_GRACE)) chainTimeoutTx(c.turnNo);
  else if(c.phase==='checking' && c.chk && due(c.chk.until)) chainTimeoutTx(c.turnNo);
  else if(c.phase==='passing' && due(c.passDeadline)) chainAutoPassTx(c.turnNo);
  else if(c.phase==='vote' && c.challenge && due(c.challenge.until)) chainVoteTimeoutTx();
}

/* ---------- wiring ---------- */
(function chainWire(){
  const on = (id, ev, fn) => { const el = $(id); if(el) el.addEventListener(ev, fn); };
  on('btnChainSend','click', chainSubmit);
  on('chInput','keydown', e => { if(e.key==='Enter'){ e.preventDefault(); chainSubmit(); } });
  on('btnChainChallenge','click', chainChallenge);
  on('chVoteBtns','click', e => { const b = e.target.closest && e.target.closest('button[data-v]'); if(b) chainVote(b.getAttribute('data-v')); });
  on('btnChainChat','click', () => { const i = $('chChatInput'); chainSendChat(i.value); i.value = ''; });
  on('chChatInput','keydown', e => { if(e.key==='Enter'){ e.preventDefault(); const i = $('chChatInput'); chainSendChat(i.value); i.value = ''; } });
  on('chQuick','click', e => { const b = e.target.closest && e.target.closest('button[data-q]'); if(b) chainSendChat(b.getAttribute('data-q')); });
  on('btnSoundChain','click', () => { toggleSound(); const b = $('btnSoundChain'); if(b) b.textContent = soundOn ? '🔊' : '🔇'; });
  on('btnChainLeave','click', () => {
    const c = roomData && roomData.chain;
    const playing = !!(c && c.phase!=='over' && user && chOrder(c).includes(user.uid) && !(c.out||{})[user.uid]);
    if(playing && !confirm('Leave the game? You will be eliminated.')) return;
    leaveRoom();
  });
  on('btnChainAgain','click', async () => {
    if(!roomData || !roomId || !user) return;
    const hostGone = !(roomData.players||{})[roomData.hostUid];
    if(hostGone){
      try{ await db.ref('rooms/'+roomId).update({hostUid:user.uid}); roomData.hostUid = user.uid; isHost = true; }
      catch(e){ toast('Could not take over as host'); return; }
    }
    if(!isHostNow()) return;
    isHost = true;
    beginRound();
  });
})();
