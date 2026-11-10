/* ===== STATE ===== */
const AVATARS=['🦊','🐸','🐯','🐼','🦉','🐙','🦄','🐲','🐰','🐨','🦁','🐶','🐱','🐭','🐹','🐻','🐷','🐔','🐧','🐦','🦋','🐝','🐢','🐬','🐳','🌸','🔥','⚡','🌟','💎','🎮','🎯','🚀','🎨','🕵️','🎲'];
let user=null,profile=null,roomId=null,roomData=null,isHost=false,localWords=new Set(),path=[],selecting=false,timerInterval=null,roundEnded=false,authMode='login';
let resultsAwarded=false,resultsSig='',boardReady=false,scrambleInt=null,shakeCd=null,shakeTimeout=null,settleTimers=[];
let combo=0,comboTimer=null,soundOn=true,ac=null,seenWords={};
let prevScores={};
let rattleInt=null,possFilter='all',possSel=null,possPaths={},solvedCache={sig:'',list:null},solveBusy='';
let selectedGame = 'boggle'; // 'boggle' | 'scatter' | 'hangman' | 'draw' | 'spy'
let scatAnswers = {}; // local answers for scatter
let scatVerdicts = {}; // auto-check result per category: 'ok' | 'maybe' | 'no'
let lobbyIndexRef = null;
let hangAnswers = {}; // hangman local state
let scatSaveTimer = null;

try{soundOn=localStorage.getItem('boggle_snd')!=='0'}catch(e){}
const $=id=>document.getElementById(id);
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2400)}
function liveToast(msg){
  const t=$('liveFeed');
  if(!t)return;
  t.innerHTML='<span class="spark">✨</span> '+msg;
  t.classList.add('show');
  clearTimeout(liveToast._t);
  liveToast._t=setTimeout(()=>t.classList.remove('show'),2200);
}
const GAME_SCREEN_IDS=['screen-game','screen-scatter','screen-hangman','screen-draw','screen-board','screen-spy','screen-chain','screen-town'];
function show(id){
  document.body.classList.toggle('in-town',id==='screen-town');
  // Decorative animated/blurred blobs are paused during gameplay (big GPU saving on phones)
  document.body.classList.toggle('in-game',GAME_SCREEN_IDS.indexOf(id)>-1);
  document.body.classList.remove('urgent');
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $(id).classList.add('active');
  // Ambient falling words only on auth + lobby (immersive, not distracting in-game)
  const rain = id === 'screen-auth' || id === 'screen-lobby';
  setWordRain(rain);
}
