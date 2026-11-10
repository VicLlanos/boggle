/* ===== Ambient falling words (login + dashboard) ===== */
const RAIN_WORDS = [
  'PLAY!','DRAW','GUESS','RACE','WIN','COMBO','SCORE','LEVEL UP','STREAK',
  'BOGGLE','SKETCH','HANGMAN','SCATTER','SPY','SNAKES','ISLAND','MAYOR',
  'ARENA','PARTY','EPIC','LUCKY','BUILD','CITY','TRIVIA','VOTE',
  'APPLE','HOUSE','ROBOT','DRAGON','CASTLE','PIZZA','ROCKET','NINJA',
  'CAT','DOG','SUN','MOON','STAR','FISH','BOOK','CAKE','TREE','CLOUD',
  'GO!','NICE','FAST','SMART','WOW','YES!','BOOM','FIRE','COOL','FUN'
];
let wordRainOn = false;
let wordRainTimer = null;

function setWordRain(on){
  const host = $('wordRain');
  if(!host) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    host.innerHTML = '';
    wordRainOn = false;
    clearInterval(wordRainTimer);
    return;
  }
  if(on === wordRainOn) return;
  wordRainOn = on;
  clearInterval(wordRainTimer);
  if(!on){
    // fade existing then clear
    host.querySelectorAll('span').forEach(s => { s.style.transition = 'opacity .4s'; s.style.opacity = '0'; });
    setTimeout(() => { if(!wordRainOn) host.innerHTML = ''; }, 450);
    return;
  }
  // seed a few immediately
  for(let i=0;i<8;i++) spawnFallingWord(true);
  wordRainTimer = setInterval(() => {
    if(!wordRainOn) return;
    spawnFallingWord(false);
    while(host.children.length > 22) host.removeChild(host.firstChild);
  }, 550);
}

function spawnFallingWord(instant){
  const host = $('wordRain');
  if(!host || !wordRainOn) return;
  const span = document.createElement('span');
  const w = RAIN_WORDS[Math.floor(Math.random()*RAIN_WORDS.length)];
  span.textContent = w;
  const left = 2 + Math.random()*90;
  const size = 0.95 + Math.random()*1.05; // rem — larger, more readable
  const dur = 8 + Math.random()*7;
  const delay = instant ? -(Math.random()*dur*0.7) : 0;
  const rot = (Math.random()*28 - 14).toFixed(1);
  span.style.left = left + '%';
  span.style.fontSize = size + 'rem';
  span.style.setProperty('--rot', rot + 'deg');
  span.style.animationDuration = dur + 's';
  span.style.animationDelay = delay + 's';
  // Bold playful chip colors
  const skins = [
    {c:'#6D4C00', bg:'rgba(253,203,110,.92)', bd:'rgba(253,203,110,1)'},      // gold
    {c:'#004D40', bg:'rgba(85,239,196,.88)', bd:'rgba(0,184,148,.9)'},       // mint
    {c:'#6C3483', bg:'rgba(253,121,168,.9)', bd:'rgba(253,121,168,1)'},      // pink
    {c:'#2D3436', bg:'rgba(255,255,255,.9)', bd:'rgba(255,255,255,1)'},      // white
    {c:'#4834D4', bg:'rgba(162,155,254,.92)', bd:'rgba(108,92,231,.95)'},    // violet
    {c:'#6D4C00', bg:'rgba(255,234,167,.95)', bd:'rgba(253,203,110,1)'},     // soft gold
    {c:'#fff', bg:'rgba(108,92,231,.85)', bd:'rgba(162,155,254,1)'},         // purple solid
    {c:'#004D40', bg:'rgba(0,184,148,.85)', bd:'rgba(85,239,196,1)'}          // mint solid
  ];
  const sk = skins[Math.floor(Math.random()*skins.length)];
  span.style.color = sk.c;
  span.style.setProperty('--bg', sk.bg);
  span.style.setProperty('--bd', sk.bd);
  host.appendChild(span);
  span.addEventListener('animationend', () => span.remove());
}
