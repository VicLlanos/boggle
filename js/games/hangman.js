/* ===== HANGMAN RACE – built-in OFFLINE fallback bank (live puzzles are generated below) ===== */
// Each entry: [WORD, HINT]. WORD is a real item from the category (single word, A-Z only); HINT describes that word, never the game.
const HANG_BANKS = {
  "Movies": [
    ["INCEPTION","Thief enters people's dreams to plant an idea"],["INTERSTELLAR","Astronauts travel through a wormhole to save humanity"],["GLADIATOR","Betrayed Roman general fights in the arena"],
    ["CASABLANCA","Classic wartime romance set in Morocco"],["PSYCHO","Hitchcock thriller set at the Bates Motel"],["TITANIC","Doomed ocean liner and a Jack and Rose love story"],
    ["AVATAR","Blue-skinned Na'vi on the moon Pandora"],["JAWS","Spielberg shark thriller: you're gonna need a bigger boat"],["SHREK","Green ogre, a talking donkey and Princess Fiona"],
    ["FROZEN","Sisters Elsa and Anna and a snowman named Olaf"],["COCO","Boy visits the Land of the Dead on Day of the Dead"],["PARASITE","Poor family infiltrates a rich household; Korean Best Picture winner"],
    ["JOKER","Arthur Fleck becomes Batman's nemesis"],["ENCANTO","Madrigal family and a magical house in Colombia"],["MOANA","Polynesian teen sails to restore the heart of Te Fiti"],
    ["ROCKY","Philadelphia boxer who goes the distance"],["VERTIGO","Hitchcock film about a detective afraid of heights"],["GREASE","Danny and Sandy at Rydell High"]
  ],
  "Songs": [
    ["HAPPY BIRTHDAY","Sung with a cake and candles"],["LET IT GO","Elsa's big song in Frozen"],["BABY SHARK","Doo doo doo doo doo doo catchy kids song"],
    ["YELLOW SUBMARINE","Beatles song about a colorful vessel"],["BOHEMIAN RHAPSODY","Queen's six-minute rock opera"],["BILLIE JEAN","Michael Jackson hit: she is not my lover"],
    ["SHAPE OF YOU","Ed Sheeran hit about a gym and a girl"],["BAD GUY","Billie Eilish whispery hit"],["DESPACITO","Luis Fonsi and Daddy Yankee mega hit"],
    ["SHAKE IT OFF","Taylor Swift song about haters"],["UPTOWN FUNK","Bruno Mars and Mark Ronson funk hit"],["HOTEL CALIFORNIA","Eagles song about a place you can never leave"]
  ],
  "TV Shows": [
    ["FRIENDS","Six pals in New York and a coffee shop called Central Perk"],["SPONGEBOB","Yellow sponge living in Bikini Bottom"],["THE SIMPSONS","Yellow cartoon family from Springfield"],
    ["STRANGER THINGS","Kids, the Upside Down and Eleven"],["SQUID GAME","Deadly children's games for a cash prize"],["THE OFFICE","Mockumentary at Dunder Mifflin"],
    ["BLUEY","Aussie blue heeler puppy and her family"],["PAW PATROL","Pups led by Ryder"],["BREAKING BAD","Chemistry teacher turns drug kingpin"],
    ["GAME OF THRONES","Dragons, Westeros and the Iron Throne"],["WEDNESDAY","Addams Family daughter at Nevermore Academy"],["MONEY HEIST","Masked robbers in Dali masks"]
  ],
  "Actors": [
    ["TOM HOLLAND","Actor who plays Spider-Man"],["ZENDAYA","Actress from Euphoria and Dune"],["WILL SMITH","Fresh Prince who became Hollywood star"],
    ["KEANU REEVES","Neo in The Matrix and John Wick"],["EMMA WATSON","Hermione in Harry Potter"],["LEONARDO DICAPRIO","Jack in Titanic"],
    ["MARGOT ROBBIE","Barbie in the 2023 movie"],["TOM CRUISE","Stars in Mission Impossible and Top Gun"],["SCARLETT JOHANSSON","Black Widow in the Avengers"],
    ["ROBERT DOWNEY JR","Played Iron Man"],["JACKIE CHAN","Martial arts star of Rush Hour"],["ANGELINA JOLIE","Star of Maleficent and Tomb Raider"]
  ],
  "Animals": [
    ["ELEPHANT","Largest land animal, long trunk"],["GIRAFFE","Tallest animal, long neck"],["DOLPHIN","Smart sea mammal that clicks"],
    ["PENGUIN","Flightless bird that loves ice"],["KANGAROO","Hops and has a pouch"],["TIGER","Big striped cat"],
    ["ZEBRA","Horse-like with black and white stripes"],["PANDA","Black and white bear that eats bamboo"],["OCTOPUS","Sea animal with eight arms"],
    ["EAGLE","Large bird of prey"],["SHARK","Ocean predator with sharp teeth"],["RABBIT","Soft animal with long ears"],
    ["TURTLE","Shell on its back, moves slowly"],["CAMEL","Desert animal with humps"],["WHALE","Largest animal in the ocean"]
  ],
  "Science": [
    ["GRAVITY","What keeps us on Earth"],["PLANET","Earth is one of these"],["OXYGEN","Gas we breathe"],
    ["ATOM","Tiny building block of matter"],["MAGNET","Attracts iron and steel"],["ROBOT","Machine that can move and work"],
    ["TELESCOPE","Tool for looking at stars"],["VOLCANO","Mountain that can erupt"],["FOSSIL","Old bones turned to stone"],
    ["ENERGY","Power that makes things work"],["WATER","H2O, covers most of Earth"],["CLOUD","White or gray shape in the sky"],
    ["RAINBOW","Colors in the sky after rain"],["COMET","Icy space rock with a tail"],["GALAXY","Huge group of stars like the Milky Way"]
  ],
  "Geography": [
    ["EGYPT","Land of pyramids and the Sphinx"],["SAHARA","World's largest hot desert, in northern Africa"],["AMAZON","Giant South American rainforest and river"],
    ["EVEREST","Tallest mountain above sea level"],["KILIMANJARO","Africa's highest peak, in Tanzania"],["NILE","Longest river in Africa, flows north to the Mediterranean"],
    ["ICELAND","Island nation of geysers, glaciers and volcanoes"],["AUSTRALIA","Country and continent home to kangaroos"],["BRAZIL","Largest country in South America"],
    ["ANTARCTICA","Frozen continent at the South Pole"],["MADAGASCAR","Large island off Africa's east coast, home of lemurs"],["VENICE","Italian city built on canals"],
    ["SINGAPORE","Island city-state in Southeast Asia"],["PHILIPPINES","Archipelago of over 7,000 islands in Southeast Asia"],["MANILA","Capital city of the Philippines"],
    ["SWITZERLAND","Alpine country famous for chocolate and neutrality"],["GREENLAND","World's largest island, mostly covered in ice"]
  ],
  "Mythology": [
    ["MINOTAUR","Bull-headed man in a labyrinth"],["MEDUSA","Snake hair, turns to stone"],["CERBERUS","Three-headed guard dog"],
    ["PEGASUS","Winged horse"],["PHOENIX","Bird reborn from ashes"],["CYCLOPS","One-eyed giant"],
    ["SPHINX","Riddle guardian, lion body"],["CHIMERA","Lion-goat-serpent hybrid"],["HYDRA","Many-headed serpent"],
    ["ICARUS","Flew too close to the sun"],["ORPHEUS","Music that charmed the underworld"],["ACHILLES","Heel was his weakness"],
    ["ODYSSEUS","Long journey home from Troy"],["THOR","Norse god of thunder"],["ANUBIS","Egyptian jackal-headed god"]
  ],
  "Music": [
    ["BEYONCE","Singer of Halo and Single Ladies"],["ADELE","British singer behind Hello and Rolling in the Deep"],["MADONNA","Queen of Pop known for Like a Prayer"],
    ["METALLICA","Heavy metal band behind Enter Sandman"],["NIRVANA","Grunge band led by Kurt Cobain"],["COLDPLAY","British band behind Yellow and Viva la Vida"],
    ["MOZART","Child prodigy who composed The Magic Flute"],["BEETHOVEN","Deaf composer of the Ninth Symphony"],["ELVIS","The King of Rock and Roll"],
    ["ABBA","Swedish group behind Dancing Queen"],["QUEEN","Rock band fronted by Freddie Mercury"],["RIHANNA","Barbados-born singer of Umbrella"],
    ["SHAKIRA","Colombian star behind Hips Don't Lie"],["EMINEM","Rapper known as Slim Shady"],["THRILLER","Michael Jackson's best-selling album"],
    ["BTS","K-pop group with seven members and a fan base called ARMY"]
  ],
  "Literature": [
    ["HAMLET","Danish prince in Shakespeare's tragedy: to be or not to be"],["MACBETH","Scottish general driven by witches' prophecy and ambition"],["DRACULA","Bram Stoker's vampire count from Transylvania"],
    ["FRANKENSTEIN","Mary Shelley's novel about a scientist's monstrous creation"],["ODYSSEY","Homer's epic about a long voyage home"],["HOBBIT","Bilbo Baggins' adventure with dwarves and a dragon"],
    ["MATILDA","Roald Dahl's girl with telekinetic powers"],["EMMA","Jane Austen's matchmaking heroine"],["DUNE","Frank Herbert's sci-fi epic on a desert planet"],
    ["ILIAD","Homer's epic about the Trojan War"],["ULYSSES","James Joyce novel set in a single day in Dublin"],["DICKENS","Author of Oliver Twist and A Christmas Carol"],
    ["TOLKIEN","Author who created Middle-earth"],["SHAKESPEARE","Bard of Avon who wrote Romeo and Juliet"],["HEMINGWAY","Author of The Old Man and the Sea"]
  ],
  "Technology": [
    ["PYTHON","Popular programming language named after a comedy group"],["JAVASCRIPT","Language that makes web pages interactive"],["ANDROID","Google's mobile operating system with a green robot"],
    ["LINUX","Open-source operating system with a penguin mascot"],["GOOGLE","Search giant founded by Larry Page and Sergey Brin"],["NETFLIX","Streaming service that began by mailing DVDs"],
    ["TESLA","Electric car maker led by Elon Musk"],["WINDOWS","Microsoft's best-known operating system"],["FACEBOOK","Social network created by Mark Zuckerberg"],
    ["INSTAGRAM","Photo-sharing app owned by Meta"],["YOUTUBE","Video platform bought by Google in 2006"],["BLUETOOTH","Short-range wireless tech named after a Viking king"],
    ["WIKIPEDIA","Free online encyclopedia anyone can edit"],["ALEXA","Amazon's voice assistant"],["PLAYSTATION","Sony's gaming console"]
  ]
};
const HANG_USED = {};

const HANG_MAX_LEVELS = 5;

/* ===== DYNAMIC PUZZLES =====
   Every puzzle is generated live: a random Wikipedia category is walked down to a random
   sub-category, a well-known single-word article is picked from it, the category name becomes
   the CATEGORY and the article's own description (with the answer masked) becomes the HINT.
   Only the host fetches; everyone else just reads the puzzle from the room.
   The small built-in bank above is used ONLY if the network is unreachable. */
const HANG_USED_KEY = 'hangUsedWordsV2';
let HANG_RECENT = [];
try{ HANG_RECENT = JSON.parse(localStorage.getItem(HANG_USED_KEY) || '[]') || []; }catch(e){ HANG_RECENT = []; }
function hangRememberWord(w){
  HANG_RECENT.push(w);
  if(HANG_RECENT.length > 400) HANG_RECENT = HANG_RECENT.slice(-400);
  try{ localStorage.setItem(HANG_USED_KEY, JSON.stringify(HANG_RECENT)); }catch(e){}
}

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
// Broad starting points only – the actual category (and every answer) is discovered live below them.
const HANG_ROOTS = [
  'Films by genre','Television series by genre','Video games by genre','Disney animated films','Pixar films',
  'Mammals','Birds','Fish','Reptiles','Insects','Dinosaurs','Plants','Fruits','Vegetables','Spices','Desserts','Cheeses',
  'Countries in Africa','Countries in Asia','Countries in Europe','Capitals in Europe','Islands','Mountains','Rivers','Deserts','Lakes','Volcanoes',
  'Musical instruments','Musical groups by genre','Albums by genre','Music genres',
  'Greek mythology','Norse mythology','Egyptian mythology','Japanese mythology','Mythological creatures','Legendary creatures',
  'Solar System','Constellations','Chemical elements','Minerals',
  'Programming languages','Operating systems','Social media','Video game consoles','Mobile phones',
  'Summer Olympic sports','Board games','Card games','Toys','Dances','Novels by genre','Children\'s literature','Shakespearean characters','Marvel Comics characters','Inventions'
];
// Keep it family friendly and skip maintenance / list pages
const HANG_BLOCK = /(\bsex|porn|erotic|nude|nudity|adult film|\brape|abuse|suicid|murder|\bkill|massacre|genocide|terror|nazi|holocaust|slaver|prostitut|\bdrugs?\b|cocaine|heroin|\bdeath|\bdead\b|\bdied\b|victim|crime|criminal|shooting|assault|fetish|fascis|racis|\bwar crimes?)/i;
const HANG_BADCAT = /(wikipedia|articles|stubs?\b|redirects?|disambiguation|templates?|^category:lists? |lists? of|navigational|\busers?\b|portal|maintenance|categories|\bby (year|decade|century|date))/i;

function hangPlain(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function hangNorm(title){
  const bare = hangPlain(String(title||'').replace(/\s*\([^)]*\)\s*/g,'')).trim().toUpperCase();
  return /^[A-Z]{4,12}$/.test(bare) ? bare : '';
}
const hangSleep = ms => new Promise(r => setTimeout(r, ms));
const hangPick = arr => arr[Math.floor(Math.random() * arr.length)];

async function wikiGet(params, ms){
  const url = WIKI_API + '?' + new URLSearchParams(Object.assign({format:'json',formatversion:'2',origin:'*'}, params));
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms || 3000);
  try{
    const r = await fetch(url, {signal: ctl.signal});
    if(!r.ok) throw new Error('wiki http ' + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

const HANG_SUBCACHE = new Map();
async function hangSubcats(cat){
  if(HANG_SUBCACHE.has(cat)) return HANG_SUBCACHE.get(cat);
  const d = await wikiGet({action:'query',list:'categorymembers',cmtitle:'Category:'+cat,cmtype:'subcat',cmlimit:'100'});
  const subs = ((d.query && d.query.categorymembers) || [])
    .map(m => String(m.title||'').replace(/^Category:/,''))
    .filter(t => t && !HANG_BLOCK.test(t) && !HANG_BADCAT.test(t));
  HANG_SUBCACHE.set(cat, subs);
  return subs;
}

async function hangPagesFor(cat, prefix){
  const p = {action:'query',generator:'categorymembers',gcmtitle:'Category:'+cat,gcmtype:'page',gcmnamespace:'0',gcmlimit:'20',
             prop:'extracts|description|pageviews',exintro:'1',explaintext:'1',exsentences:'2',exlimit:'max',pvipdays:'30'};
  if(prefix) p.gcmstartsortkeyprefix = prefix;   // random starting letter = different slice every time
  const d = await wikiGet(p);
  return (d.query && d.query.pages) || [];
}

// Hint = the article's own short description (or first sentence) with the answer masked out
function hangBuildHint(title, word, desc, ext){
  const bare = hangPlain(String(title).replace(/\s*\([^)]*\)\s*/g,'')).trim();
  const re = new RegExp(bare.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\w*', 'gi');
  let h = hangPlain(desc || '').trim();
  if(h.length < 10){
    const clean = hangPlain(ext || '').replace(/\s*\([^)]*\)/g,'').replace(/\s+/g,' ').trim();
    const m = clean.match(/^.*?[.!?](?=\s|$)/);
    h = m ? m[0] : clean;
  }
  h = h.replace(re, '_____').replace(/\s+/g,' ').trim();
  if(h.length > 140){ h = h.slice(0,140); h = h.slice(0, h.lastIndexOf(' ')) + '…'; }
  if(h.length < 10) return '';
  // the hint must still say something useful once the answer is masked out
  const meaningful = h.replace(/_____/g,' ').split(/[^A-Za-z0-9]+/).filter(w => w.length >= 3 && !/^(the|and|for|with|was|are|its|that|this|from|has|had|have|his|her)$/i.test(w));
  if(meaningful.length < 2) return '';
  if(h.toUpperCase().replace(/[^A-Z]/g,'').includes(word)) return '';   // never leak the answer
  return h.charAt(0).toUpperCase() + h.slice(1);
}

function hangCandidate(pg){
  const word = hangNorm(pg.title);
  if(!word || HANG_RECENT.includes(word)) return null;
  const desc = String(pg.description || '').trim();
  const ext = String(pg.extract || '').trim();
  if(!desc && ext.length < 40) return null;
  if(/may refer to|disambiguation/i.test(desc + ' ' + ext.slice(0,80))) return null;
  if(HANG_BLOCK.test(pg.title + ' ' + desc)) return null;
  // only reasonably well-known articles, so puzzles stay fair
  const views = Object.values(pg.pageviews || {}).filter(v => typeof v === 'number');
  const avg = views.length ? views.reduce((a,b)=>a+b,0) / views.length : 0;
  if(avg < 60) return null;
  const hint = hangBuildHint(pg.title, word, desc, ext);
  if(!hint || HANG_BLOCK.test(hint)) return null;
  return {word, hint};
}

async function hangTryCategory(cat){
  const letters = 'ABCDEFGHIJKLMNOPRSTUVW';
  let pages = await hangPagesFor(cat, letters[Math.floor(Math.random() * letters.length)]);
  if(!pages.length) pages = await hangPagesFor(cat, '');
  const cands = pages.map(hangCandidate).filter(Boolean);
  if(!cands.length) return null;
  const c = hangPick(cands);
  // Human-readable category from root only (never use a country/page title as the category)
  const label = (HANG_ROOTS.find(r => cat.toLowerCase().includes(r.toLowerCase())) || cat.split(/[/]/).pop() || 'General')
    .replace(/_/g,' ');
  const nice = label.charAt(0).toUpperCase() + label.slice(1);
  // Never allow category name == answer (e.g. "Liberia" / "LIBERIA")
  if(hangNorm(nice) === c.word || nice.toUpperCase() === c.word) return null;
  if(c.word.length < 4 || c.word.length > 14) return null;
  return {category: nice, word: c.word, hint: c.hint};
}

async function hangDynamicPuzzle(deadline){
  let netFails = 0;
  for(let attempt = 0; attempt < 5 && srvNow() < deadline && netFails < 2; attempt++){
    try{
      let cat = hangPick(HANG_ROOTS);
      const depth = 1 + Math.floor(Math.random() * 2);
      for(let d = 0; d < depth; d++){
        const subs = await hangSubcats(cat);
        if(!subs.length) break;
        cat = hangPick(subs);
      }
      let res = await hangTryCategory(cat);
      if(!res){                       // nothing usable here – look one level deeper
        const subs = await hangSubcats(cat);
        if(subs.length) res = await hangTryCategory(hangPick(subs));
      }
      if(res) return res;
    }catch(e){ netFails++; await hangSleep(150); }   // two network failures in a row = offline, give up quickly
  }
  return null;
}

// Stock of ready-to-play puzzles. Filled in the background by several parallel workers and
// saved on this device, so a round can start instantly (even in a later session).
const HANG_POOL_KEY = 'hangPoolV1';
const HANG_TARGET = 8;
let HANG_QUEUE = [];
try{
  HANG_QUEUE = (JSON.parse(localStorage.getItem(HANG_POOL_KEY) || '[]') || [])
    .filter(q => q && q.word && q.hint && q.category && !HANG_RECENT.includes(q.word));
}catch(e){ HANG_QUEUE = []; }
function hangSavePool(){ try{ localStorage.setItem(HANG_POOL_KEY, JSON.stringify(HANG_QUEUE.slice(0, 20))); }catch(e){} }
let hangWorkers = 0;
async function hangWorker(){
  hangWorkers++;
  try{
    for(let i = 0; i < 4 && HANG_QUEUE.length < HANG_TARGET; i++){
      const r = await hangDynamicPuzzle(srvNow() + 6000);
      if(!r) break;
      if(HANG_QUEUE.some(q => q.word === r.word) || HANG_RECENT.includes(r.word)) continue;
      HANG_QUEUE.push(r);
      hangSavePool();
    }
  }catch(e){} finally { hangWorkers--; }
}
function hangPrefetch(){
  // up to 3 requests in parallel until the stock is full
  const need = Math.min(3, HANG_TARGET - HANG_QUEUE.length) - hangWorkers;
  for(let i = 0; i < need; i++) hangWorker();
}

// Turn (category, word, hint) into the room data: ~35-40% of letters revealed + letter tiles
function buildHangPuzzle(category, word, hint, rand){
  rand = rand || Math.random;
  const chars = word.split('');
  const positions = chars.map((_,i)=>i).filter(i=>/[A-Z]/.test(chars[i]));
  // Reveal ~50% of the letters (always leave at least one blank to solve)
  const revealRatio = 0.50;
  const revealCount = Math.min(positions.length - 1, Math.max(1, Math.round(positions.length * revealRatio)));
  for(let i=positions.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]]}
  const revealSet = new Set(positions.slice(0, revealCount));
  const revealed = chars.map((ch,i)=> revealSet.has(i) ? ch : (ch==='-'||ch===' '?' ':'_'));

  const needed = [];
  chars.forEach((ch,i)=>{ if(!revealSet.has(i) && /[A-Z]/.test(ch)) needed.push(ch); });
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const decoys = [];
  while(decoys.length < Math.min(6, Math.max(3, 10-needed.length))){
    const d = alphabet[Math.floor(rand()*26)];
    if(!needed.includes(d) && !decoys.includes(d)) decoys.push(d);
  }
  const tiles = [...needed, ...decoys];
  for(let i=tiles.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[tiles[i],tiles[j]]=[tiles[j],tiles[i]]}
  return { category, word, hint, revealed, tiles };
}

// Offline-only fallback (small built-in bank above)
function pickLocalHangmanPuzzle(seedStr){
  let seed = 0;
  for(let i=0;i<seedStr.length;i++) seed = (seed*31 + seedStr.charCodeAt(i)) >>> 0;
  const rand = seededRandom(seed || srvNow());
  const cats = Object.keys(HANG_BANKS);
  let category = cats[Math.floor(rand()*cats.length)];
  let entries = HANG_BANKS[category].filter(([w]) => !HANG_USED[category+'|'+w] && !HANG_RECENT.includes(w));
  if(!entries.length){
    Object.keys(HANG_USED).forEach(k=>{ if(k.startsWith(category+'|')) delete HANG_USED[k]; });
    entries = [...HANG_BANKS[category]];
  }
  const [word, hint] = entries[Math.floor(rand()*entries.length)];
  HANG_USED[category+'|'+word] = true;
  hangRememberWord(word);
  return buildHangPuzzle(category, word, hint, rand);
}

async function pickHangmanPuzzle(seedStr){
  // Prefer the curated local bank (clear categories, fair difficulty).
  // Dynamic queue is only a supplement and must pass safety checks.
  hangPrefetch();
  const local = pickLocalHangmanPuzzle(seedStr);
  // Occasionally try a dynamic puzzle if one is already ready and safe
  let dyn = null;
  while(HANG_QUEUE.length && !dyn){
    const c = HANG_QUEUE.shift();
    if(!c || !c.word || !c.category) continue;
    if(HANG_RECENT.includes(c.word)) continue;
    if(hangNorm(c.category) === c.word) continue; // category must not be the answer
    if(c.word.length < 4 || c.word.length > 12) continue;
    dyn = c;
  }
  hangSavePool();
  hangPrefetch();
  if(dyn && Math.random() < 0.25){
    hangRememberWord(dyn.word);
    return buildHangPuzzle(dyn.category, dyn.word, dyn.hint);
  }
  return local;
}

/* ===== HANGMAN RACE UI ===== */
let hangSlots = [];
let hangTrayTiles = [];
let hangWrong = 0;
const HANG_MAX_WRONG = 5;
function enterHangman(force){
  // When force=true (new level), always rebuild the full puzzle UI
  if(!force && $('screen-hangman').classList.contains('active') && !roundEnded){
    renderHangScores();
    updateHangLevelBar();
    return;
  }
  resetRoundState();
  roundEnded = false;
  hangWrong = 0;
  const sb = $('btnSoundHang');
  if(sb){ sb.textContent = soundOn ? '🔊' : '🔇'; sb.onclick = toggleSound; }
  show('screen-hangman');

  $('hangCategory').textContent = roomData.hangCategory || '—';
  $('hangHint').textContent = 'Hint: ' + (roomData.hangHint || '—');
  $('hangMsg').textContent = 'Tap letters to fill the blanks';
  $('hangMsg').style.color = '#636E72';
  const btnSub = $('btnHangSubmit');
  const btnNext = $('btnHangNext');
  if(btnSub){ btnSub.style.display = 'flex'; btnSub.disabled = false; }
  if(btnNext){ btnNext.style.display = 'none'; btnNext.disabled = false; }
  updateHangFigure(0, true);
  updateHangLevelBar();

  const revealed = roomData.hangRevealed || [];
  hangSlots = revealed.map(ch => ch === '_' ? null : ch);
  hangTrayTiles = (roomData.hangTiles || []).map((ch,i)=>({id:i, ch, used:false}));

  renderHangSlots();
  renderHangTray();
  renderHangScores();
  startHangTimer();
  boardReady = true;
  snd('go');
}

function updateHangLevelBar(){
  const lvl = roomData.hangLevel || 1;
  const max = roomData.hangMaxLevels || HANG_MAX_LEVELS;
  if($('hangLevelLabel')) $('hangLevelLabel').textContent = 'Level '+lvl+' / '+max;
  const me = roomData.players?.[user.uid];
  const wins = me?.hangWins || 0;
  if($('hangSeriesScore')) $('hangSeriesScore').textContent = 'Your wins: '+wins;
}

/* ---------- Rope climber + balloon pit ----------
   Wrong guess 0 = gripping the rope with both hands, 1-2 = slipping,
   3 = one hand lets go, 4 = hanging on by one hand, 5 = falls into the balloon pit. */
const HANG_REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const HANG_BASE = {bodyY:0,rot:0,Lgrip:1,Rgrip:1,LropeY:36,RropeY:36,Lfx:76,Lfy:40,Rfx:110,Rfy:40,bendL:16,bendR:16,
  brow:-0.8,curve:0.8,open:0,sweat:0,eyeW:2.4,slip:0,legAmp:1.5,stars:0,flail:0};
const HANG_STAGES = [
  Object.assign({}, HANG_BASE),
  Object.assign({}, HANG_BASE, {bodyY:5,LropeY:39,RropeY:39,bendL:12,bendR:12,brow:0,curve:0.2,sweat:0.4,eyeW:2.6,slip:0.6,legAmp:3}),
  Object.assign({}, HANG_BASE, {bodyY:11,LropeY:44,RropeY:44,bendL:8,bendR:8,brow:0.5,curve:-0.3,open:0.2,sweat:0.8,eyeW:2.8,slip:0.9,legAmp:5}),
  Object.assign({}, HANG_BASE, {bodyY:17,LropeY:49,RropeY:49,Rgrip:0,Rfx:112,Rfy:44,bendL:4,bendR:3,brow:0.9,curve:-0.8,open:0.5,sweat:1,eyeW:3,slip:1,legAmp:9,flail:1}),
  Object.assign({}, HANG_BASE, {bodyY:22,LropeY:53,RropeY:53,Rgrip:0,Rfx:113,Rfy:42,bendL:1.5,bendR:3,brow:1,curve:-1,open:0.8,sweat:1,eyeW:3.2,slip:1,legAmp:14,flail:1}),
  // landed in the balloons, cheering
  Object.assign({}, HANG_BASE, {bodyY:74,Lgrip:0,Rgrip:0,Lfx:81,Lfy:38,Rfx:105,Rfy:38,bendL:3,bendR:3,brow:-0.3,curve:0.9,open:0.5,eyeW:2.4,legAmp:0,stars:1,flail:0.4})
];
const HANG_SAVED = Object.assign({}, HANG_BASE, {bodyY:-3,bendL:18,bendR:18,brow:-0.2,curve:1,open:0.4,eyeW:2.3,legAmp:4,stars:1});
const HANG_EASE = {
  out:p=>1-(1-p)*(1-p),
  in:p=>p*p,
  io:p=>p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2
};
let HS = Object.assign({}, HANG_STAGES[0]);
let hangTween = null, hangRaf = 0, hangStageNow = -1, hangBalloonsBuilt = false;

function buildHangBalloons(){
  if(hangBalloonsBuilt) return;
  const back = $('hangBalloonsBack'), front = $('hangBalloonsFront');
  if(!back || !front) return;
  const colors = ['#FF7675','#FDCB6E','#55EFC4','#74B9FF','#A29BFE','#FD79A8'];
  let n = 0;
  const make = (xs, cy) => xs.map(cx => {
    const c = colors[(n++) % colors.length];
    const d = ((n * 0.37) % 1).toFixed(2);
    return '<g class="bl" style="--d:'+d+'s">'
      + '<ellipse cx="'+cx+'" cy="'+cy+'" rx="8" ry="9" fill="'+c+'"/>'
      + '<ellipse cx="'+(cx-2.8)+'" cy="'+(cy-3.2)+'" rx="1.7" ry="2.6" fill="#fff" opacity=".5" transform="rotate(-20 '+(cx-2.8)+' '+(cy-3.2)+')"/>'
      + '<path d="M'+(cx-1.5)+' '+(cy+8.6)+' L'+cx+' '+(cy+11)+' L'+(cx+1.5)+' '+(cy+8.6)+'Z" fill="'+c+'"/>'
      + '</g>';
  }).join('');
  back.innerHTML  = make([38,52,66,80,94,108,120], 135);
  front.innerHTML = make([48,64,80,96,112], 139) + make([40,56,72,88,104,118], 145);
  hangBalloonsBuilt = true;
}

function hangKick(){
  if(!hangRaf) hangRaf = requestAnimationFrame(hangFrame);
}
function hangSet(target){
  hangTween = null;
  Object.assign(HS, target);
  hangKick();
}
function hangTo(target, dur, easeFn, done){
  if(HANG_REDUCED) dur = 0;
  hangTween = {from:Object.assign({}, HS), to:target, t0:performance.now(), dur:dur, ease:easeFn||HANG_EASE.io, done:done};
  hangKick();
}
function hangFrame(now){
  hangRaf = 0;
  const scr = $('screen-hangman');
  if(!scr || !scr.classList.contains('active')){ return; } // loop restarts via hangKick()
  if(hangTween){
    const tw = hangTween;
    const p = tw.dur > 0 ? Math.min(1, (now - tw.t0) / tw.dur) : 1;
    const e = tw.ease(p);
    for(const k in tw.to){ HS[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e; }
    if(p >= 1){ hangTween = null; if(tw.done) tw.done(); }
  }
  renderHangFigure(now / 1000);
  hangRaf = requestAnimationFrame(hangFrame);
}

function renderHangFigure(t){
  const s = HS;
  const body = $('hangBody');
  if(!body) return;
  const lerp = (a,b,k) => a + (b - a) * k;
  const f = n => n.toFixed(2);
  body.setAttribute('transform', 'translate(0 '+f(s.bodyY)+') rotate('+f(s.rot)+' 93 70)');

  // hands: blend between "holding the rope" and "free in the air"
  const wob = HANG_REDUCED ? 0 : 1;
  const fwL = (1 - s.Lgrip) * s.flail * wob, fwR = (1 - s.Rgrip) * s.flail * wob;
  const Lx = lerp(s.Lfx + Math.sin(t*9)*3*fwL, 91.6, s.Lgrip);
  const Ly = lerp(s.Lfy + Math.cos(t*8)*3*fwL, s.LropeY - s.bodyY, s.Lgrip);
  const Rx = lerp(s.Rfx + Math.sin(t*10+1)*3.5*fwR, 94.4, s.Rgrip);
  const Ry = lerp(s.Rfy + Math.cos(t*9+1)*3.5*fwR, s.RropeY - s.bodyY, s.Rgrip);
  const SLx = 89.5, SRx = 96.5, Sy = 64.5;
  $('hArmL').setAttribute('d', 'M'+SLx+' '+Sy+' Q'+f((SLx+Lx)/2 - s.bendL)+' '+f((Sy+Ly)/2)+' '+f(Lx)+' '+f(Ly));
  $('hArmR').setAttribute('d', 'M'+SRx+' '+Sy+' Q'+f((SRx+Rx)/2 + s.bendR)+' '+f((Sy+Ry)/2)+' '+f(Rx)+' '+f(Ry));
  $('hHandL').setAttribute('cx', f(Lx)); $('hHandL').setAttribute('cy', f(Ly));
  $('hHandR').setAttribute('cx', f(Rx)); $('hHandR').setAttribute('cy', f(Ry));

  // friction marks beside the gripping hand
  const hs = $('hSlip');
  hs.setAttribute('opacity', f(s.slip * 0.85 * (0.6 + 0.4*Math.sin(t*12))));
  const gy = Math.min(Ly, Ry);
  $('hSlip1').setAttribute('y1', f(gy - 7)); $('hSlip1').setAttribute('y2', f(gy - 3));
  $('hSlip2').setAttribute('y1', f(gy - 9)); $('hSlip2').setAttribute('y2', f(gy - 4));

  // legs kick harder the closer he is to falling
  const amp = HANG_REDUCED ? 0 : s.legAmp;
  const freq = 4 + amp * 0.45;
  $('hLegL').setAttribute('transform', 'rotate('+f(-3 + Math.sin(t*freq)*amp)+' 91.5 80)');
  $('hLegR').setAttribute('transform', 'rotate('+f(3 + Math.sin(t*freq+2.3)*amp)+' 94.5 80)');

  // face
  const bo = 46.5;
  $('hBrowL').setAttribute('y1', f(bo + s.brow*1.2)); $('hBrowL').setAttribute('y2', f(bo - s.brow*2));
  $('hBrowR').setAttribute('y1', f(bo + s.brow*1.2)); $('hBrowR').setAttribute('y2', f(bo - s.brow*2));
  $('hEyeWL').setAttribute('r', f(s.eyeW)); $('hEyeWR').setAttribute('r', f(s.eyeW));
  $('hMouth').setAttribute('d', 'M89.8 57 Q93 '+f(57 + s.curve*3.2)+' 96.2 57');
  $('hMouth').setAttribute('opacity', f(Math.max(0, 1 - s.open*2)));
  const mo = $('hMouthO');
  mo.setAttribute('ry', f(s.open*3.2)); mo.setAttribute('rx', f(2.2 + s.open*0.8));
  mo.setAttribute('opacity', s.open > 0.12 ? '1' : '0');
  const sw = $('hSweat');
  sw.setAttribute('opacity', f(s.sweat));
  sw.setAttribute('transform', 'translate(0 '+f(HANG_REDUCED ? 0 : ((t*2.2)%1)*3)+')');

  // stars circle his head when he's happy
  const st = $('hStars');
  st.setAttribute('opacity', f(s.stars));
  st.setAttribute('transform', 'rotate('+f(HANG_REDUCED ? 0 : t*120)+' 93 52)');
}

function hangFall(){
  hangStageNow = 5;
  const scene = $('hangScene');
  // 1) grip gives out
  hangTo({Lgrip:0,Rgrip:0,bodyY:HS.bodyY+3,brow:1,open:1,eyeW:3.4,curve:-1,slip:0,sweat:0,
          Lfx:76,Lfy:42,Rfx:112,Rfy:42,bendL:2,bendR:2,flail:1,legAmp:16}, 260, HANG_EASE.out, () => {
    // 2) drop into the pit
    hangTo({bodyY:100,rot:35}, 430, HANG_EASE.in, () => {
      if(scene) scene.classList.add('landed');   // balloons bounce, rope swings
      // 3) bounce up out of the balloons
      hangTo({bodyY:58,rot:-14,brow:-0.3,curve:0.9,open:0.5,eyeW:2.4,stars:1,legAmp:0,
              Lfx:81,Lfy:38,Rfx:105,Rfy:38,flail:0.4}, 380, HANG_EASE.out, () => {
        // 4) settle among the balloons
        hangTo({bodyY:74,rot:0}, 500, HANG_EASE.io);
      });
    });
  });
}

function hangSaved(){
  hangStageNow = -2;
  const scene = $('hangScene');
  if(scene) scene.classList.remove('landed');
  hangTo(HANG_SAVED, 500, HANG_EASE.out);
}

function updateHangFigure(wrong, immediate){
  buildHangBalloons();
  const scene = $('hangScene');
  const stage = Math.min(Math.max(wrong,0), HANG_MAX_WRONG);
  const prev = hangStageNow;
  if(stage < HANG_MAX_WRONG){
    hangStageNow = stage;
    if(scene) scene.classList.remove('landed');
    if(immediate || prev === -1 || prev === HANG_MAX_WRONG) hangSet(HANG_STAGES[stage]);
    else hangTo(HANG_STAGES[stage], 650, HANG_EASE.io);
  } else if(prev !== HANG_MAX_WRONG){
    if(immediate){
      hangStageNow = HANG_MAX_WRONG;
      hangSet(HANG_STAGES[HANG_MAX_WRONG]);
      if(scene) scene.classList.add('landed');
    } else {
      hangFall();
    }
  }
  if(wrong >= HANG_MAX_WRONG){
    $('hangStatus').textContent = 'Fell into the balloon pit!';
    $('hangStatus').style.color = '#E74C3C';
  } else if(wrong > 0){
    $('hangStatus').textContent = (HANG_MAX_WRONG - wrong) + ' chances left';
    $('hangStatus').style.color = '#E17055';
  } else {
    $('hangStatus').textContent = 'Save him!';
    $('hangStatus').style.color = '#636E72';
  }
}

function renderHangSlots(){
  const host = $('hangSlots');
  host.innerHTML = '';
  hangSlots.forEach((ch, i) => {
    const slot = document.createElement('div');
    const locked = roomData.hangRevealed && roomData.hangRevealed[i] && roomData.hangRevealed[i] !== '_';
    slot.style.cssText = 'width:36px;height:44px;border-radius:10px;display:grid;place-items:center;font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:1.2rem;border:2px solid '+(locked?'#A29BFE':'#DFE6E9')+';background:'+(locked?'#F3F0FF':(ch?'#FFF9E6':'#F8F9FA'))+';color:var(--violet-d);cursor:'+(locked?'default':'pointer');
    slot.textContent = ch || '';
    slot.dataset.idx = i;
    if(!locked){
      slot.onclick = () => {
        if(hangSlots[i]){
          // return tile to tray
          const t = hangTrayTiles.find(x=>x.used && x.ch===hangSlots[i]);
          if(t) t.used = false;
          hangSlots[i] = null;
          renderHangSlots();
          renderHangTray();
        }
      };
    }
    host.appendChild(slot);
  });
}

function renderHangTray(){
  const host = $('hangTray');
  host.innerHTML = '';
  hangTrayTiles.forEach(t => {
    if(t.used) return;
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.textContent = t.ch;
    tile.style.cssText = 'width:42px;height:42px;border-radius:12px;border:none;background:linear-gradient(180deg,#A29BFE,var(--violet));color:#fff;font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:1.15rem;box-shadow:0 4px 0 var(--violet-d);cursor:pointer';
    tile.onclick = () => {
      const empty = hangSlots.findIndex((s,i)=> s===null && roomData.hangRevealed[i]==='_');
      if(empty < 0) return;
      hangSlots[empty] = t.ch;
      t.used = true;
      renderHangSlots();
      renderHangTray();
      snd('tap');
    };
    host.appendChild(tile);
  });
}

function renderHangScores(){
  const host = $('hangScoreBoard');
  if(!host||!roomData) return;
  const players = Object.values(roomData.players||{});
  host.innerHTML = players.map(p=>{
    const solved = p.hangSolved;
    const wrong = p.hangWrong||0;
    return `<div class="sc${p.uid===user.uid?' me':''}"><div class="n">${esc(p.avatar||'')} ${esc(p.name)}</div><div class="s">${solved?'✓':wrong+'✗'}</div></div>`;
  }).join('');
}

function startHangTimer(){
  clearInterval(timerInterval);
  const tick=()=>{
    if(!roomData||!roomData.endsAt)return;
    const left=Math.max(0,Math.ceil((roomData.endsAt-srvNow())/1000));
    const el=$('hangTimerText'); if(el) el.textContent=left;
    const ring=$('hangTimerRing');
    if(ring){
      const pct=Math.max(0,left/45*100);
      ring.style.setProperty('--pct',pct+'%');
      ring.classList.toggle('low',left<=10);
    }
    if(left<=0 && !roundEnded) finishHangRound();
  };
  tick();
  timerInterval=setInterval(tick,250);
}

async function finishHangRound(winnerUid){
  if(roundEnded) return;
  roundEnded = true;
  clearInterval(timerInterval);
  const players = Object.values(roomData.players||{});
  const winner = winnerUid
    ? players.find(p => p.uid === winnerUid)
    : players.find(p => p.hangSolved);
  const me = roomData.players?.[user.uid];

  const answer = (roomData.hangWord || '').toUpperCase();
  const lvl = roomData.hangLevel || 1;
  const maxL = roomData.hangMaxLevels || HANG_MAX_LEVELS;
  const cat = roomData.hangCategory || '';

  // Always show the correct answer so everyone can learn it
  if(winner){
    const name = winner.uid === user.uid ? 'You' : (winner.name || 'Someone');
    $('hangMsg').innerHTML =
      '<div style="margin-bottom:4px">'+name+' won level '+lvl+'!</div>'+
      '<div style="font-size:.8rem;font-weight:700;color:#636E72">'+esc(cat)+'</div>'+
      '<div>Answer: <b>'+esc(answer)+'</b></div>';
    $('hangMsg').style.color = '#00B894';
    if(winner.uid === user.uid) hangSaved();
  } else {
    updateHangFigure(HANG_MAX_WRONG);
    $('hangMsg').innerHTML =
      '<div style="margin-bottom:4px">Time\'s up — nobody solved level '+lvl+'</div>'+
      '<div style="font-size:.8rem;font-weight:700;color:#636E72">'+esc(cat)+'</div>'+
      '<div>Answer: <b>'+esc(answer)+'</b></div>';
    $('hangMsg').style.color = '#E74C3C';
  }
  // Fill the letter slots with the real answer for a clear visual reveal
  if(answer && $('hangSlots')){
    const chars = answer.replace(/[-\s]/g,'').split('');
    const slots = $('hangSlots').children;
    let ci = 0;
    for(let i=0;i<slots.length && ci<chars.length;i++){
      slots[i].textContent = chars[ci++];
      slots[i].style.background = '#E8FFF6';
      slots[i].style.borderColor = '#00B894';
      slots[i].style.color = '#00695C';
    }
  }

  // Save this level into series history (host writes once)
  if(isHost && answer){
    const entry = {
      level: lvl,
      category: cat,
      word: answer,
      winnerUid: winner ? winner.uid : null,
      winnerName: winner ? winner.name : null
    };
    try{
      const hist = Array.isArray(roomData.hangHistory) ? roomData.hangHistory.slice() : [];
      if(!hist.some(h => h.level === lvl && h.word === answer)){
        hist.push(entry);
        await db.ref('rooms/'+roomId+'/hangHistory').set(hist);
      }
    }catch(e){}
  }

  // Award +1 win for this level only (cap by level index so one answer never equals 5 wins)
  let myWins = me?.hangWins || 0;
  if(winner && winner.uid === user.uid){
    myWins = Math.min(lvl, (me.hangWins || 0) + 1);
    try{ await db.ref('rooms/'+roomId+'/players/'+user.uid).update({hangWins: myWins, score: myWins}); }catch(e){}
  }

  // Series ends only after level 5 is finished — not after a single early win
  const seriesDone = lvl >= maxL;

  const btnSub = $('btnHangSubmit');
  const btnNext = $('btnHangNext');
  if(btnSub) btnSub.style.display = 'none';
  if(btnNext){
    if(seriesDone){
      btnNext.textContent = 'SEE FINAL RESULTS';
      btnNext.dataset.mode = 'results';
    } else {
      btnNext.textContent = 'NEXT LEVEL →';
      btnNext.dataset.mode = 'next';
    }
    btnNext.style.display = 'flex';
  }

  // Championship line only on the final level
  if(seriesDone && winner && winner.uid === user.uid){
    $('hangMsg').innerHTML =
      '<div style="margin-bottom:4px">🏆 Series complete — you have '+myWins+' win'+(myWins===1?'':'s')+'!</div>'+
      '<div style="font-size:.8rem;font-weight:700;color:#636E72">'+esc(cat)+'</div>'+
      '<div>Answer: <b>'+esc(answer)+'</b></div>';
  }
}

// If another player solves first, end the level for everyone
function checkHangRaceWinner(){
  if(roundEnded || !roomData || roomData.gameType !== 'hangman') return;
  if(roomData.status !== 'playing') return;
  const winner = Object.values(roomData.players||{}).find(p => p.hangSolved);
  if(winner) finishHangRound(winner.uid);
}

// Next level / final results button (solo or multiplayer)
document.addEventListener('click', async e => {
  if(e.target?.id !== 'btnHangNext') return;
  const mode = e.target.dataset.mode || 'next';
  e.target.disabled = true;
  if(mode === 'results'){
    if(isHost){
      try{ await db.ref('rooms/'+roomId).update({status:'results',endedAt:srvNow()}); }catch(err){}
    }
    showResults();
    e.target.disabled = false;
    return;
  }
  // Next level — host starts it; solo player is always host
  if(isHost){
    resetRoundState();
    try{
      await beginRound();
    }catch(err){ toast('Could not start next level'); }
  } else {
    toast('Waiting for host to start the next level…');
  }
  e.target.disabled = false;
});

document.addEventListener('click', async e => {
  if(e.target?.id !== 'btnHangSubmit') return;
  if(roundEnded || !roomData) return;
  if(roomData.players?.[user.uid]?.hangSolved) return;
  if(hangWrong >= HANG_MAX_WRONG){
    $('hangMsg').textContent = 'No chances left';
    $('hangMsg').style.color = '#E74C3C';
    return;
  }
  const guess = hangSlots.map(c=>c||'').join('');
  const answer = (roomData.hangWord||'').replace(/[-\s]/g,'');
  if(guess.length !== answer.length || hangSlots.some(c=>!c)){
    $('hangMsg').textContent = 'Fill every blank first';
    $('hangMsg').style.color = '#E17055';
    return;
  }
  if(guess === answer){
    $('hangMsg').textContent = 'Saved! ✓ You won the level!';
    $('hangMsg').style.color = '#00B894';
    hangSaved();
    $('hangStatus').textContent = 'Rescued!';
    $('hangStatus').style.color = '#00B894';
    snd('win');
    try{
      await db.ref('rooms/'+roomId+'/players/'+user.uid).update({hangSolved:true, score:1});
    }catch(e){}
    // Race: first correct answer ends the level
    finishHangRound(user.uid);
  } else {
    hangWrong++;
    updateHangFigure(hangWrong);
    $('hangMsg').textContent = 'Wrong — try again!';
    $('hangMsg').style.color = '#E74C3C';
    snd('bad');
    try{
      await db.ref('rooms/'+roomId+'/players/'+user.uid).update({hangWrong});
    }catch(e){}
    if(hangWrong >= HANG_MAX_WRONG){
      $('hangMsg').textContent = 'No chances left';
    }
  }
});

function computeHangmanResults(){
  const players = Object.values((roomData&&roomData.players)||{});
  const level = roomData.hangLevel || 1;
  const maxL = roomData.hangMaxLevels || HANG_MAX_LEVELS;
  const hist = Array.isArray(roomData.hangHistory) ? roomData.hangHistory : [];
  const rows = players.map(p=>{
    const wins = p.hangWins || 0;
    // Build items from history: which levels this player won
    const items = hist.map(h => {
      const mine = h.winnerUid === p.uid;
      return {
        w: 'L'+h.level+': '+(h.word||'?')+(mine?' ✓':''),
        pts: mine ? 1 : 0,
        dupe: !mine,
        cat: h.category || ''
      };
    });
    if(!items.length){
      items.push({w: wins ? (wins+' level win'+(wins>1?'s':'')) : 'No wins yet', pts: wins, dupe: wins===0});
    }
    return {p, items, raw: items.length, final: wins, lost: Math.max(0, hist.length - wins), uniqueN: wins, sharedN:0, level, maxL};
  });
  rows.sort((a,b)=>(b.final-a.final)||String(a.p.name).localeCompare(String(b.p.name)));
  return rows;
}
