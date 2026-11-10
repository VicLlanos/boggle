function updateComboUI(){
  const b=$('comboBadge');if(!b)return;
  if(combo>=2){b.textContent='×'+combo;b.classList.add('on')}else b.classList.remove('on');
  const w=$('currentWord');if(w)w.classList.toggle('combo',combo>=2);
}
function bumpCombo(){
  combo++;clearTimeout(comboTimer);
  comboTimer=setTimeout(()=>{combo=0;updateComboUI()},3500);
  updateComboUI();
}
function resetCombo(){combo=0;clearTimeout(comboTimer);updateComboUI()}

/* Path trail drawing */
function drawPathTrail(){
  const svg=$('pathSvg'),board=$('board');
  if(!svg||!board)return;
  svg.innerHTML='';
  if(path.length<2)return;
  const br=board.getBoundingClientRect(),wrap=$('boardWrap').getBoundingClientRect();
  const pts=path.map(p=>{
    const t=document.querySelector(`.tile[data-r="${p.r}"][data-c="${p.c}"]`);
    if(!t)return null;
    const r=t.getBoundingClientRect();
    return {x:r.left+r.width/2-wrap.left,y:r.top+r.height/2-wrap.top};
  }).filter(Boolean);
  if(pts.length<2)return;
  let d=`M ${pts[0].x} ${pts[0].y}`;
  for(let i=1;i<pts.length;i++)d+=` L ${pts[i].x} ${pts[i].y}`;
  const pathEl=document.createElementNS('http://www.w3.org/2000/svg','path');
  pathEl.setAttribute('d',d);
  pathEl.setAttribute('fill','none');
  pathEl.setAttribute('stroke','rgba(232,67,147,.8)');
  pathEl.setAttribute('stroke-width','6');
  pathEl.setAttribute('stroke-linecap','round');
  pathEl.setAttribute('stroke-linejoin','round');
  pathEl.setAttribute('filter','drop-shadow(0 0 4px rgba(232,67,147,.5))');
  svg.appendChild(pathEl);
}

/* Spark particles on good finds */
function spark(x,y,color){
  const layer=$('fxLayer');if(!layer)return;
  for(let i=0;i<8;i++){
    const p=document.createElement('div');
    const ang=Math.random()*Math.PI*2,dist=20+Math.random()*40;
    p.style.cssText=`position:absolute;left:${x}px;top:${y}px;width:6px;height:6px;border-radius:50%;background:${color||'#FDCB6E'};pointer-events:none;transition:transform .55s cubic-bezier(.2,.8,.2,1),opacity .55s;opacity:1`;
    layer.appendChild(p);
    requestAnimationFrame(()=>{p.style.transform=`translate(${Math.cos(ang)*dist}px,${Math.sin(ang)*dist-15}px) scale(0)`;p.style.opacity='0'});
    setTimeout(()=>p.remove(),600);
  }
}

function scrambleBoard(){const dice=[...DICE];for(let i=dice.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[dice[i],dice[j]]=[dice[j],dice[i]]}return dice.map(d=>{const f=d[Math.floor(Math.random()*6)];return f==='Q'?'Qu':f})}
function neighbors(r,c){const o=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(nr>=0&&nr<4&&nc>=0&&nc<4)o.push([nr,nc])}return o}
function pathToWord(grid,p){return p.map(({r,c})=>{const ch=grid[r*4+c];return ch==='Qu'?'QU':ch}).join('').toLowerCase()}

// --------- ROUND STATE & BOARD EFFECTS ---------
const LAND_STEP=70;
const SETTLE_TOTAL=600;
const LETTER_POOL='EEEEAAAIIOOUTTNNRRSSLLDDGBCMPFHVWYKJXZ';

function randLetter(not){let l;do{l=LETTER_POOL[Math.floor(Math.random()*LETTER_POOL.length)]}while(l===not);return l}
function canPlay(){return !!roomData&&roomData.status==='playing'&&boardReady&&!roundEnded}
function setWordBar(msg,hint,cls){const w=$('currentWord');w.textContent=msg;w.classList.toggle('hint',!!hint);w.classList.remove('pulse','go');if(cls)w.classList.add(cls)}
function resetRoundState(){roundEnded=false;localWords=new Set();path=[];selecting=false;resultsAwarded=false;resultsSig='';boardReady=false;seenWords={};prevScores={};possSel=null;resetCombo();scatAnswers={}}
function stopLetterScramble(){clearInterval(scrambleInt);scrambleInt=null}
function stopShakeCountdown(){clearInterval(shakeCd);shakeCd=null;const r=$('timerRing');if(r)r.classList.remove('prep')}
function clearSettleTimers(){settleTimers.forEach(clearTimeout);settleTimers=[]}
function setShaking(on){const b=$('board'),w=$('boardWrap');if(b)b.classList.toggle('shaking',!!on);if(w)w.classList.toggle('shaking',!!on)}
function stopRattle(){clearInterval(rattleInt);rattleInt=null}
function stopBoardFx(){stopLetterScramble();stopShakeCountdown();clearSettleTimers();clearTimeout(shakeTimeout);stopRattle();setShaking(false)}

// Letters on every tile keep changing while the box is shaking.
function startLetterScramble(){
  stopLetterScramble();
  const tiles=[...$('board').querySelectorAll('.tile')];
  const tick=()=>tiles.forEach(t=>{
    if(t.dataset.locked==='1')return;
    if(Math.random()<.75)t.textContent=randLetter(t.textContent);
  });
  tick();
  scrambleInt=setInterval(tick,85);
}

// Gold countdown ring during the shake (3…2…1)
function startShakeCountdown(){
  stopShakeCountdown();
  const ring=$('timerRing'),end=srvNow()+SHAKE_SECONDS*1000;
  ring.classList.remove('low');
  ring.classList.add('prep');
  const tick=()=>{
    const ms=Math.max(0,end-srvNow());
    $('timerText').textContent=Math.max(1,Math.ceil(ms/1000));
    ring.style.setProperty('--pct',(ms/(SHAKE_SECONDS*1000)*100)+'%');
  };
  tick();
  shakeCd=setInterval(tick,50);
}

// Shake is over: stop rattling, keep flipping letters, then lock them in wave by wave.
function settleBoard(grid){
  const b=$('board'),tiles=[...b.querySelectorAll('.tile')];
  boardReady=false;
  stopShakeCountdown();
  clearSettleTimers();
  setShaking(false);
  stopRattle();
  let maxDelay=0;
  tiles.forEach((t,i)=>{
    const r=+t.dataset.r,c=+t.dataset.c,delay=(r+c)*LAND_STEP;
    maxDelay=Math.max(maxDelay,delay);
    settleTimers.push(setTimeout(()=>{
      t.dataset.locked='1';
      t.textContent=grid[i];
      t.classList.remove('land');void t.offsetWidth;t.classList.add('land');
      settleTimers.push(setTimeout(()=>t.classList.remove('land'),700));
    },delay));
  });
  settleTimers.push(setTimeout(()=>{
    stopLetterScramble();
    boardReady=true;
    setWordBar('GO!',false,'go');
    snd('go');
    settleTimers.push(setTimeout(()=>{if(!roundEnded&&!path.length)setWordBar('Drag letters to spell',true)},700));
  },maxDelay+160));
}

// Used when someone enters mid-round (no shake to watch): letters just drop in.
function landTiles(){
  const tiles=[...$('board').querySelectorAll('.tile')];
  tiles.forEach(t=>{
    t.dataset.locked='1';
    t.style.animationDelay=((+t.dataset.r)+(+t.dataset.c))*60+'ms';
    t.classList.add('land');
  });
  clearSettleTimers();
  settleTimers.push(setTimeout(()=>tiles.forEach(t=>{t.classList.remove('land');t.style.animationDelay=''}),1100));
  boardReady=true;
}

function enterGame(){
  const gt = roomData.gameType || 'boggle';
  if(gt === 'scatter'){
    enterScatter();
    return;
  }

  if($('screen-game').classList.contains('active')&&!roundEnded){
    renderScores();
    return;
  }

  resetRoundState();
  stopLetterScramble();
  stopShakeCountdown();
  clearSettleTimers();
  $('wordTags').innerHTML='';
  $('wordCount').textContent='0';
  $('timerRing').classList.remove('low');
  const sb=$('btnSound');if(sb){sb.textContent=soundOn?'🔊':'🔇';sb.onclick=toggleSound}
  show('screen-game');

  const b=$('board');
  renderScores();
  if(roomData.status==='shaking'){
    renderBoard(roomData.board,true);
    setShaking(true);
    setWordBar('Shaking the box…',true,'pulse');
    startLetterScramble();
    startShakeCountdown();
    snd('shake');
    try{if(navigator.vibrate)navigator.vibrate([60,40,60,40,60,40,60])}catch(e){}
    stopRattle();
    rattleInt=setInterval(()=>{snd('shake');try{if(navigator.vibrate)navigator.vibrate([50,30,50,30,50])}catch(e){}},480);
  }else{
    renderBoard(roomData.board,false);
    setShaking(false);
    setWordBar('Drag letters to spell',true);
    landTiles();
    startTimer();
  }
}

function renderBoard(grid,hidden){
  const board=$('board');
  board.innerHTML='';
  if(!grid||grid.length!==16)return;
  for(let i=0;i<16;i++){
    const r=Math.floor(i/4),c=i%4;
    const t=document.createElement('div');
    t.className='tile';
    t.dataset.r=r;
    t.dataset.c=c;
    t.style.setProperty('--ax',(2+Math.random()*2).toFixed(1)+'px');
    t.style.setProperty('--ay',(2+Math.random()*2).toFixed(1)+'px');
    t.style.setProperty('--ar',((Math.random()<.5?-1:1)*(5+Math.random()*9)).toFixed(1)+'deg');
    t.style.setProperty('--sd',(.26+Math.random()*.22).toFixed(2)+'s');
    t.style.setProperty('--sdl',(-Math.random()*.4).toFixed(2)+'s');
    t.textContent=hidden?randLetter():grid[i];
    board.appendChild(t);
  }
  bindTiles();
}

function renderScores(){
  const players=Object.values(roomData.players||{});
  const boardEl=$('scoreBoard');
  boardEl.innerHTML=players.map(p=>{
    const isMe=p.uid===user.uid;
    const score=p.score||0;
    const prev=prevScores[p.uid]||0;
    const pulse=score>prev?' pulse':'';
    if(score!==prev)prevScores[p.uid]=score;
    return `<div class="sc ${isMe?'me':''}${pulse}" data-uid="${p.uid}"><div class="n">${p.name}${isMe?' · you':''}</div><div class="s">${score}</div></div>`;
  }).join('');

  if(roomData.status==='playing'&&!roundEnded){
    players.forEach(p=>{
      if(p.uid===user.uid)return;
      const words=p.words||{};
      Object.keys(words).forEach(w=>{
        const key=p.uid+':'+w;
        if(!seenWords[key]){
          seenWords[key]=1;
          if(Object.keys(seenWords).length>1){
            const msgs=[
              `${p.avatar||'🎮'} ${p.name} found a word!`,
              `${p.avatar||'🎮'} ${p.name} scored!`,
              `🔥 ${p.name} just scored!`,
              `${p.avatar||'🎮'} ${p.name} locked in a word`
            ];
            liveToast(msgs[Math.floor(Math.random()*msgs.length)]);
            snd('opp');
            const chip=boardEl.querySelector(`.sc[data-uid="${p.uid}"]`);
            if(chip){
              chip.classList.remove('pulse');
              void chip.offsetWidth;
              chip.classList.add('pulse');
            }
          }
        }
      });
    });
  }
}

function startTimer(){
  clearInterval(timerInterval);
  let lastShown=-1;
  const tick=()=>{
    if(!roomData||!roomData.endsAt)return;
    const left=Math.max(0,Math.ceil((roomData.endsAt-srvNow())/1000));
    const shown=Math.min(left,ROUND_SECONDS);
    $('timerText').textContent=shown;
    $('timerRing').style.setProperty('--pct',(shown/ROUND_SECONDS*100)+'%');
    $('timerRing').classList.toggle('low',left<=30&&left>0);document.body.classList.toggle('urgent',left<=10&&left>0);
    if(left<=10&&left>0&&shown!==lastShown)snd('tick');
    lastShown=shown;
    if(left<=0&&!roundEnded)endRound()
  };
  tick();
  timerInterval=setInterval(tick,250);
}
function bindTiles(){const board=$('board');const tiles=[...board.querySelectorAll('.tile')];const at=(x,y,k=.4)=>{let best=null,bd=1e9;for(const t of tiles){const r=t.getBoundingClientRect();const d=Math.hypot(x-(r.left+r.width/2),y-(r.top+r.height/2));if(d<r.width*k&&d<bd){best=t;bd=d}}return best};const start=(x,y)=>{if(!canPlay())return;const t=at(x,y,.55);if(!t)return;selecting=true;path=[{r:+t.dataset.r,c:+t.dataset.c}];updatePath()};const move=(x,y)=>{if(!selecting||roundEnded)return;const t=at(x,y);if(!t)return;const r=+t.dataset.r,c=+t.dataset.c;const last=path[path.length-1];if(last.r===r&&last.c===c)return;if(path.length>=2){const prev=path[path.length-2];if(prev.r===r&&prev.c===c){path.pop();updatePath();return}}if(!neighbors(last.r,last.c).some(([nr,nc])=>nr===r&&nc===c))return;if(path.some(p=>p.r===r&&p.c===c))return;path.push({r,c});updatePath()};const end=()=>{if(!selecting)return;selecting=false;if(path.length>=MIN_LEN)submitPath();else{clearPath();path=[];$('currentWord').textContent='Drag letters to spell';$('currentWord').classList.add('hint')}};board.ontouchstart=e=>{e.preventDefault();const t=e.touches[0];start(t.clientX,t.clientY)};board.ontouchmove=e=>{e.preventDefault();const t=e.touches[0];move(t.clientX,t.clientY)};board.ontouchend=e=>{e.preventDefault();end()};board.onmousedown=e=>{e.preventDefault();start(e.clientX,e.clientY)};window.onmousemove=e=>{if(selecting)move(e.clientX,e.clientY)};window.onmouseup=()=>end()}
function updatePath(){
  document.querySelectorAll('.tile').forEach(t=>t.classList.remove('on','path'));
  path.forEach((p,i)=>{const t=document.querySelector(`.tile[data-r="${p.r}"][data-c="${p.c}"]`);if(t)t.classList.add(i===path.length-1?'on':'path')});
  const w=pathToWord(roomData.board,path);
  const bar=$('currentWord');
  bar.textContent=w?w.toUpperCase():'…';
  bar.classList.toggle('hint',!w);
  bar.classList.toggle('big',w&&w.length>=6);
  drawPathTrail();
  if(path.length>1)snd('tap');
  try{if(navigator.vibrate&&path.length>1)navigator.vibrate(8)}catch(e){}
}
function clearPath(){
  document.querySelectorAll('.tile').forEach(t=>t.classList.remove('on','path','ok','bad'));
  const svg=$('pathSvg');if(svg)svg.innerHTML='';
}

async function submitPath(){
  const word=pathToWord(roomData.board,path);
  const tiles=path.map(p=>document.querySelector(`.tile[data-r="${p.r}"][data-c="${p.c}"]`));
  const pathCopy=[...path];
  path=[];
  if(roundEnded||!roomData)return;
  const w=word.toLowerCase();
  if(w.length<MIN_LEN)return;
  
  if(!dictReady){
    toast('Loading dictionary... ⏳');
    clearPath();
    setWordBar('Drag letters to spell',true);
    return;
  }

  profile.attempts=(profile.attempts||0)+1;
  if(localWords.has(w)){
    toast('Already found!');
    snd('bad');
    tiles.forEach(t=>t&&t.classList.add('bad'));
    setTimeout(clearPath,400);
    await saveProfile({attempts:profile.attempts});
    setWordBar('Drag letters to spell',true);
    return;
  }
  
  if(!isValidWord(w)){
    toast(isRude(w)?'Let’s keep it friendly 🙂':'Not a word');
    snd('bad');
    resetCombo();
    tiles.forEach(t=>t&&t.classList.add('bad'));
    setTimeout(clearPath,400);
    await saveProfile({attempts:profile.attempts});
    setWordBar('Drag letters to spell',true);
    return;
  }
  
  bumpCombo();
  const mult=Math.min(4,Math.max(1,combo));
  const base=wordScore(w);
  const pts=base*mult;
  
  localWords.add(w);
  profile.correct=(profile.correct||0)+1;
  profile.wordsFound=(profile.wordsFound||0)+1;
  profile.xp=(profile.xp||0)+pts*3+2+(mult>1?5:0);
  await saveProfile({attempts:profile.attempts,correct:profile.correct,wordsFound:profile.wordsFound,xp:profile.xp});
  const myRef=db.ref('rooms/'+roomId+'/players/'+user.uid);
  const me=(await myRef.once('value')).val()||{};
  const words=me.words||{};
  words[w]=pts;
  const score=Object.values(words).reduce((a,b)=>a+b,0);
  await myRef.update({words,score});
  tiles.forEach(t=>t&&t.classList.add('ok'));
  setTimeout(clearPath,400);
  
  if(base>=5||mult>=3)snd('big');else snd('ok');
  try{if(navigator.vibrate)navigator.vibrate(mult>=2?[12,30,18]:15)}catch(e){}
  
  if(tiles.length){
    const last=tiles[tiles.length-1];
    if(last){
      const r=last.getBoundingClientRect(),wrap=$('boardWrap').getBoundingClientRect();
      spark(r.left+r.width/2-wrap.left,r.top+r.height/2-wrap.top,mult>=3?'#FDCB6E':'#55EFC4');
    }
  }
  
  const tag=document.createElement('span');
  tag.className='tag';
  tag.textContent=w.toUpperCase()+' +'+pts+(mult>1?' ×'+mult:'');
  $('wordTags').prepend(tag);
  $('wordCount').textContent=localWords.size;
  setWordBar('Drag letters to spell',true);
  const fs=document.createElement('div');
  fs.className='float-pts';
  fs.textContent=(mult>1?'×'+mult+' ':'')+'+'+pts;
  $('boardWrap').appendChild(fs);
  setTimeout(()=>fs.remove(),1000);
  toast((w.length>=8?'🤩 INCREDIBLE! ':w.length>=6?'🔥 Awesome! ':w.length>=5?'👏 Nice! ':'')+w.toUpperCase()+' · +'+pts+(mult>1?' (combo ×'+mult+')':''));
}

function finishLocalRound(){
  roundEnded=true;
  clearInterval(timerInterval);
  stopBoardFx();
  selecting=false;
  path=[];
  clearPath();
  $('timerRing')?.classList.remove('low');
  $('scatTimerRing')?.classList.remove('low');
  // Final save of scatter answers
  if((roomData?.gameType||'boggle')==='scatter') saveScatAnswers(true);
}

async function endRound(){
  if(roundEnded)return;
  finishLocalRound();
  if(isHost&&roomData){
    const rid=roomId;
    // For scatter, also compute final scores server-side style (client does it)
    setTimeout(()=>{db.ref('rooms/'+rid).update({status:'results',endedAt:srvNow()}).catch(()=>{})},900);
  }
  setTimeout(showResults,350);
  setTimeout(()=>{if($('screen-results').classList.contains('active'))awardResults(computeResults(),true)},6000);
}

/* ---------- Boggle scoring ---------- */

/* ---------- Possible words (Boggle only) ---------- */
function waitForDict(ms){return new Promise(res=>{const t0=srvNow();(function chk(){if(dictReady||srvNow()-t0>ms)res();else setTimeout(chk,150)})()})}

async function findAllWords(grid){
  await waitForDict(8000);
  const letters=grid.map(g=>String(g).toLowerCase());
  const avail=new Set(),starts=new Set();
  letters.forEach(t=>{for(const ch of t)avail.add(ch);starts.add(t[0])});
  const nbr=[];
  for(let i=0;i<16;i++)nbr.push(neighbors(Math.floor(i/4),i%4).map(([r,c])=>r*4+c));
  const used=new Array(16).fill(0),trail=[];
  let w='';
  const dfs=(i,pos)=>{
    const t=letters[i];
    if(!w.startsWith(t,pos))return false;
    const np=pos+t.length;
    trail.push(i);
    if(np===w.length)return true;
    used[i]=1;
    for(const j of nbr[i]){if(!used[j]&&dfs(j,np))return true}
    used[i]=0;trail.pop();return false;
  };
  const out=[];
  let n=0;
  for(const word of DICT){
    if(++n%25000===0)await new Promise(r=>setTimeout(r,0));
    const L=word.length;
    if(L<MIN_LEN||L>17||!starts.has(word[0]))continue;
    let ok=true;
    for(let k=1;k<L;k++){if(!avail.has(word[k])){ok=false;break}}
    if(!ok)continue;
    if(isRude(word))continue;
    w=word;
    for(let s=0;s<16;s++){
      if(letters[s][0]!==word[0])continue;
      trail.length=0;used.fill(0);
      if(dfs(s,0)){if(trail.length>=MIN_LEN)out.push({w:word,path:trail.slice()});break}
    }
  }
  return out;
}

const POSS_FILTERS=[['all','All'],['mymiss','Missed by you'],['nobody','Nobody found'],['matched','Matched'],['mine','Yours']];
const POSS_PASS={
  all:()=>true,
  mymiss:i=>i.st==='other'||i.st==='miss',
  nobody:i=>i.st==='miss',
  matched:i=>i.fs.length>1,
  mine:i=>i.st==='mine'||i.st==='shared'
};

function applyHl(){
  const host=$('possibleWrap');if(!host)return;
  host.querySelectorAll('.mt').forEach(t=>t.classList.remove('hl','hl0'));
  host.querySelectorAll('.pw.sel').forEach(x=>x.classList.remove('sel'));
  const lab=host.querySelector('.mt-word');
  if(!possSel){if(lab){lab.textContent='Tap a word to see its path';lab.classList.add('hint')}return}
  const path=possPaths[possSel];
  if(path)path.forEach((idx,k)=>{const t=host.querySelector('.mt[data-i="'+idx+'"]');if(t)t.classList.add(k===0?'hl0':'hl')});
  host.querySelectorAll('.pw[data-w]').forEach(x=>{if(x.dataset.w===possSel)x.classList.add('sel')});
  if(lab){lab.textContent=possSel.toUpperCase();lab.classList.remove('hint')}
}

function renderPossible(rows){
  const gt = roomData?.gameType || 'boggle';
  if(gt === 'scatter') return; // handled in renderResults

  const host=$('possibleWrap');
  if(!host||!roomData||!roomData.board||roomData.board.length!==16||!user)return;
  const sig=roomData.board.join(',');

  if(solvedCache.sig!==sig||!solvedCache.list){
    host.innerHTML='<div class="poss"><h3>🔎 All possible words</h3><div class="psub searching">Searching the board for every word…</div></div>';
    if(solveBusy!==sig){
      solveBusy=sig;
      findAllWords(roomData.board.slice()).then(list=>{
        solvedCache={sig,list};solveBusy='';
        if(roomData&&roomData.board&&roomData.board.join(',')===sig&&$('screen-results').classList.contains('active'))renderPossible(computeResults());
      }).catch(e=>{
        solveBusy='';console.warn('Word search failed',e);
        const h=$('possibleWrap');
        if(h)h.innerHTML='<div class="poss"><h3>🔎 All possible words</h3><div class="psub">Could not build the word list this round.</div></div>';
      });
    }
    return;
  }

  const players=Object.values(roomData.players||{});
  const fm={};
  players.forEach(p=>Object.keys(p.words||{}).forEach(w=>{(fm[w]=fm[w]||[]).push(p)}));
  const list=solvedCache.list.slice();
  const have=new Set(list.map(x=>x.w));
  Object.keys(fm).forEach(w=>{if(!have.has(w))list.push({w,path:null})});

  possPaths={};
  const items=list.map(x=>{
    const fs=fm[x.w]||[];
    const mine=fs.some(p=>p.uid===user.uid);
    const st=!fs.length?'miss':mine?(fs.length>1?'shared':'mine'):'other';
    possPaths[x.w]=x.path;
    return{w:x.w,fs,st};
  });

  const total=items.length;
  const nMine=items.filter(i=>i.st==='mine'||i.st==='shared').length;
  const nMatched=items.filter(i=>i.fs.length>1).length;
  const nOther=items.filter(i=>i.st==='other').length;
  const nNobody=items.filter(i=>i.st==='miss').length;
  const pct=total?Math.round(nMine/total*100):0;

  const pass=POSS_PASS[possFilter]||POSS_PASS.all;
  const shown=items.filter(pass).sort((a,b)=>(b.w.length-a.w.length)||a.w.localeCompare(b.w));
  const groups={};
  shown.forEach(i=>{(groups[i.w.length]=groups[i.w.length]||[]).push(i)});
  const lens=Object.keys(groups).map(Number).sort((a,b)=>b-a);

  const chip=i=>{
    const av=i.fs.map(p=>esc(p.avatar||'🎮')).join('');
    const tip=i.fs.length?'Found by '+esc(i.fs.map(p=>p.uid===user.uid?'you':p.name).join(', ')):'Nobody found this one';
    return '<button type="button" class="pw '+i.st+'" data-w="'+esc(i.w)+'" title="'+tip+'"><span class="pt">'+esc(i.w.toUpperCase())+'</span>'+(av?'<span class="pa">'+av+'</span>':'')+'</button>';
  };
  const listHtml=lens.length
    ?lens.map(L=>'<div class="pg"><div class="pg-h">'+L+' letters <span>'+groups[L].length+'</span></div><div class="pg-w">'+groups[L].map(chip).join('')+'</div></div>').join('')
    :'<div class="none-words" style="padding:8px">Nothing in this filter</div>';

  const mini=roomData.board.map((t,i)=>'<div class="mt" data-i="'+i+'">'+esc(t)+'</div>').join('');
  const filters=POSS_FILTERS.map(f=>'<button type="button" class="pf'+(possFilter===f[0]?' on':'')+'" data-f="'+f[0]+'">'+f[1]+'</button>').join('');

  host.innerHTML='<div class="poss">'
    +'<h3>🔎 All possible words · '+total+'</h3>'
    +'<div class="psub">Every word hiding on this board. Tap one to see its path.</div>'
    +'<div class="poss-top">'
      +'<div class="mini-wrap"><div class="mini-board">'+mini+'</div><div class="mt-word hint">Tap a word to see its path</div></div>'
      +'<div class="poss-stats">'
        +'<div class="pstat"><span>You found</span><b>'+nMine+' / '+total+'</b></div>'
        +'<div class="pbar"><i style="width:'+pct+'%"></i></div>'
        +'<div class="pstat"><span>Matched (2+ players)</span><b>'+nMatched+'</b></div>'
        +'<div class="pstat"><span>Only others found</span><b>'+nOther+'</b></div>'
        +'<div class="pstat"><span>Nobody found</span><b>'+nNobody+'</b></div>'
      +'</div>'
    +'</div>'
    +'<div class="pfilters">'+filters+'</div>'
    +'<div class="plegend"><span class="pw mine">You found</span><span class="pw shared">Matched with others</span><span class="pw other">You missed</span><span class="pw miss">Nobody found</span></div>'
    +'<div class="plist">'+listHtml+'</div>'
    +'</div>';
  applyHl();
}

$('possibleWrap').addEventListener('click',e=>{
  const f=e.target.closest('[data-f]');
  if(f){possFilter=f.dataset.f;renderPossible(computeResults());return}
  const b=e.target.closest('.pw[data-w]');
  if(b){possSel=possSel===b.dataset.w?null:b.dataset.w;snd('tap');applyHl()}
});

document.body.addEventListener('touchmove',e=>{if(selecting)e.preventDefault()},{passive:false});
