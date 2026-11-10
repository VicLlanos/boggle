/* ===== GAME DASHBOARD → MATCHMAKING ===== */
const GAME_META = {
  boggle:  { title:'🎲 Boggle', sub:'Find words on a 4×4 grid.' },
  scatter: { title:'✍️ Scattergories', sub:'One letter, a sheet of categories.' },
  hangman: { title:'🪢 Hangman Race', sub:'Solve the word before the others.' },
  draw:    { title:'🎨 Sketch Race', sub:'One draws, everyone guesses.' },
  board:   { title:'🐍 Snakes & Trivia', sub:'Roll, answer, dodge the snakes.' },
  spy:     { title:'🕵️ Spy Word', sub:'Find the spy in 5 rounds.' },
  chain:   { title:'🔗 Word Chain', sub:'Chain words. Last one standing wins.' }
};

function openMatchmaking(game){
  selectedGame = game;
  if(game === 'hangman') hangPrefetch();   // warm up fresh puzzles as soon as Hangman is chosen
  const meta = GAME_META[game] || GAME_META.boggle;
  $('matchGameTitle').textContent = meta.title;
  $('matchGameSub').textContent = meta.sub;
  if(profile){
    $('matchAv').textContent = profile.avatar || '🦊';
    $('matchName').textContent = profile.name || '—';
  }
  show('screen-match');
  listenOpenRooms(game);
}

function listenOpenRooms(gameType){
  if(lobbyIndexRef){ lobbyIndexRef.off(); lobbyIndexRef = null; }
  const list = $('openRoomsList');
  list.innerHTML = '<div class="none-words" style="padding:8px">Looking for rooms…</div>';
  lobbyIndexRef = db.ref('lobbyIndex/'+gameType);
  lobbyIndexRef.on('value', snap => {
    const data = snap.val() || {};
    const now = srvNow();
    const rooms = Object.values(data).filter(r=>{
      const age = now-(r.seen||0);
      if(age>180000) db.ref('lobbyIndex/'+gameType+'/'+r.code).remove().catch(()=>{}); // clean up ghosts
      return age<=60000;                                     // host heartbeat missing = offline
    }).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    if(!rooms.length){
      list.innerHTML = '<div class="none-words" style="padding:8px">No open rooms — create one!</div>';
      return;
    }
    list.innerHTML = rooms.map(r => {
      const n = r.players || 1;
      const cap = maxPlayersFor(gameType); const full = n >= cap;
      return `<button type="button" class="btn-room-join" data-code="${esc(r.code)}" ${full?'disabled':''}
        style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 14px;border-radius:14px;border:2px solid ${full?'#DFE6E9':'#D6CFFF'};background:${full?'#F8F9FA':'#F3F0FF'};font-family:inherit;cursor:${full?'not-allowed':'pointer'}">
        <span style="font-weight:900;letter-spacing:3px;color:var(--violet-d)">${esc(r.code)}</span>
        <span style="font-size:.85rem;font-weight:700;color:#636E72">${esc(r.hostName||'Host')} · ${n}/${cap}</span>
        <span style="font-size:.8rem;font-weight:800;color:${full?'#B2BEC3':'var(--mint)'}">${full?'Full':'Join'}</span>
      </button>`;
    }).join('');
    list.querySelectorAll('.btn-room-join:not([disabled])').forEach(btn=>{
      btn.onclick = () => joinRoomByCode(btn.dataset.code);
    });
  });
}

document.querySelectorAll('.game-card').forEach(card=>{
  card.onclick = () => {
    snd('tap');
    if(card.dataset.game==='town'){openTown();return}
    openMatchmaking(card.dataset.game);
  };
});
