/* ===== HOW TO PLAY (shown before every game) ===== */
const HOWTO = {
  boggle:{ steps:[
    'Everyone gets the same 4×4 grid of letters once the tray is shaken.',
    'Drag or tap through <b>touching letters</b> (including diagonals) to spell words of 3+ letters. A tile can’t be reused inside one word.',
    'Submit as many words as you can before the timer runs out.',
    'Longer words are worth more points, and the highest score at the end wins.'],
    tip:'Look for plurals and endings like -ING and -ED to boost your word count fast.' },
  scatter:{ steps:[
    'Each round shows one <b>letter</b> and a sheet of categories (like “An animal” or “A food”).',
    'Type an answer for each category that <b>starts with that letter</b> — as many as you can before the timer ends.',
    'Answers are fact-checked, so made-up or wrong-category answers don’t count.',
    'Unique answers score best — if you write the same answer as another player, it’s worth less.'],
    tip:'Be creative! Obvious answers are the ones everyone else will write too.' },
  hangman:{ steps:[
    'Everyone races to solve the <b>same hidden word</b>. You’re shown its category and a hint, with some letters already revealed.',
    'Drag the letter tiles into the blanks. A wrong letter costs you — run out of chances and your figure is lost.',
    'Beat the clock and solve it faster than the other players.',
    'Faster solves earn more points over the rounds.'],
    tip:'Use the category and hint first, then think about which letters fit the pattern.' },
  draw:{ steps:[
    'A random <b>category</b> is picked (animals, movies, songs, actors…). Every word in the game comes from it.',
    'Each level, one player is the <b>drawer</b> and secretly sees a word. Everyone else sees only the blanks.',
    'The drawer sketches it — <b>no letters or writing!</b> Guessers type their guesses in the chat as fast as they can.',
    'Guess correctly (and quickly) to score. The drawer role rotates every level, across 10 levels.'],
    tip:'Drawers: start with the simplest, most recognizable shape. Guessers: the category narrows it down!' },
  spy:{ steps:[
    'Everyone gets the secret <b>word</b> from a shown category — except one player, the <b>Spy</b>, who only knows the category.',
    'There are <b>5 rounds</b>. Each round, every player gives <b>one clue word</b> about the secret word. All clues stay visible on screen.',
    'After each round, everyone votes who they think the Spy is. Votes add up across all 5 rounds.',
    'After round 5, the player with the <b>most total votes</b> is evicted and gets <b>one guess</b> at the secret word.',
    'If the evicted player is the Spy and guesses wrong, the <b>civilians win</b>. If the Spy guesses right — or an <b>innocent</b> player was evicted — the <b>Spy wins</b>.'],
    tip:'Civilians: be vague enough that the Spy can’t guess, but specific enough to prove you know. Spy: blend in and study the clues!' },
  chain:{ steps:[
    'A random <b>category</b> is picked and the system says the first word.',
    'On your turn, say a word from that category that <b>starts with the last letter</b> of the previous word.',
    'You have a short time to answer. Run out of time, repeat a word, or give a wrong answer and you’re <b>out</b>.',
    'Doubtful words can be challenged and put to a group vote. The <b>last player standing wins</b>.'],
    tip:'Save words ending in tricky letters (like X or Z) for when you need to trap the next player.' },
  board:{ steps:[
    'Play solo or with up to 5 friends. Everyone starts at the beginning of the board.',
    'On your turn, <b>roll the dice</b> and move forward.',
    'Land on a tile and you may face a <b>trivia question</b>. Answer wrong and you get sent back!',
    'Ladders help you climb and 🐍 snakes slide you down. First to the finish tile wins.'],
    tip:'Take your time on the trivia — one wrong answer can undo a great roll.' },
  town:{ steps:[
    'Build your own island town. Pick a category (Build, Roads or Decor) and a piece, then tap the map to place it.',
    'Use <b>Paint</b> to recolor, <b>Rotate</b> to turn pieces, and <b>Erase</b> to remove them. Undo is always available.',
    'Earn coins and unlock new eras and buildings as your town grows.',
    'Drag to move the camera (or draw roads in ✏️ draw mode), and visit friends’ towns in view-only mode.'],
    tip:'Your town saves automatically — come back anytime to keep building.' }
};
function showHowTo(game, onGo){
  const meta = (typeof GAME_META !== 'undefined' && GAME_META[game]) || {title:'🎮 Game', sub:''};
  const h = HOWTO[game] || HOWTO.boggle;
  const old = document.getElementById('howtoOv'); if(old) old.remove();
  const ov = document.createElement('div');
  ov.id = 'howtoOv'; ov.className = 'howto-ov';
  ov.innerHTML = '<div class="howto-card" role="dialog" aria-modal="true"><div class="howto-head"><div class="t">'+meta.title+'</div><div class="s">How to play</div></div>'
    + '<div class="howto-body"><ol>'+h.steps.map(x=>'<li>'+x+'</li>').join('')+'</ol>'+(h.tip?'<div class="tip">💡 '+h.tip+'</div>':'')+'</div>'
    + '<div class="howto-foot"><button type="button" class="btn btn-mint" id="howtoGo" style="flex:1">'+(onGo?'GOT IT — LET’S PLAY':'GOT IT')+'</button></div></div>';
  document.body.appendChild(ov);
  const close = go => { ov.remove(); if(go && onGo) onGo(); };
  ov.querySelector('#howtoGo').onclick = () => { try{ snd('tap'); }catch(e){} close(true); };
  ov.addEventListener('click', e => { if(e.target === ov) close(false); });
}
function addHowToButton(afterEl, id, getGame){
  if(!afterEl || document.getElementById(id)) return;
  const b = document.createElement('button');
  b.type = 'button'; b.id = id; b.className = 'howto-link'; b.textContent = '📖 How to play';
  b.onclick = () => showHowTo(getGame());
  afterEl.insertAdjacentElement('afterend', b);
}
addHowToButton($('matchGameSub'), 'btnHowToMatch', () => selectedGame);
addHowToButton($('roomGameLabel'), 'btnHowToRoom', () => (roomData && roomData.gameType) || selectedGame);

document.querySelectorAll('.game-card').forEach(card=>{
  card.onclick = () => {
    snd('tap');
    const g = card.dataset.game;
    showHowTo(g, () => { if(g==='town'){ openTown(); return; } openMatchmaking(g); });
  };
});

$('btnBackGames').onclick = () => {
  if(lobbyIndexRef){ lobbyIndexRef.off(); lobbyIndexRef = null; }
  show('screen-lobby');
};
