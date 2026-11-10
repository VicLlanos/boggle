/* ===== Interactive thumbnails: tilt, ripple, tap reaction, battery-friendly pausing ===== */
(function(){
  var LABELS = {"boggle": "Boggle", "scatter": "Scattergories", "hangman": "Hangman Race", "draw": "Sketch Race", "spy": "Spy Word", "chain": "Word Chain", "board": "Snakes and Trivia", "town": "Island Mayor"};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = Array.prototype.slice.call(document.querySelectorAll('.game-card'));

  function setPos(card, e){
    var r = card.getBoundingClientRect();
    if(!r.width) return;
    var x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    var y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    card.style.setProperty('--ry', ((x - .5) * 14).toFixed(2) + 'deg');
    card.style.setProperty('--rx', ((.5 - y) * 10).toFixed(2) + 'deg');
    card.style.setProperty('--px', ((x - .5) * 2).toFixed(3));
    card.style.setProperty('--py', ((y - .5) * 2).toFixed(3));
    card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
  }
  function rest(card){
    card.classList.remove('tilting');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--px', '0');
    card.style.setProperty('--py', '0');
  }
  function ripple(card, e){
    var t = card.querySelector('.thumb');
    if(!t) return;
    var r = t.getBoundingClientRect();
    var d = document.createElement('span');
    d.className = 'rip';
    d.style.left = (e.clientX - r.left) + 'px';
    d.style.top = (e.clientY - r.top) + 'px';
    t.appendChild(d);
    setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 650);
  }
  function pop(card){
    card.classList.remove('pop');
    void card.offsetWidth;                 // restart the CSS animations
    card.classList.add('pop');
    clearTimeout(card._popT);
    card._popT = setTimeout(function(){ card.classList.remove('pop'); }, 900);
  }

  cards.forEach(function(card){
    var g = card.dataset.game;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    if(LABELS[g]) card.setAttribute('aria-label', 'Play ' + LABELS[g]);
    card.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); card.click(); }
    });
    if(reduce) return;
    card.addEventListener('pointerenter', function(e){
      if(e.pointerType === 'mouse'){ card.classList.add('tilting'); setPos(card, e); }
    });
    card.addEventListener('pointermove', function(e){
      if(e.pointerType === 'mouse' || card.classList.contains('tilting')) setPos(card, e);
    });
    card.addEventListener('pointerdown', function(e){
      card.classList.add('tilting');
      setPos(card, e);
      ripple(card, e);
      pop(card);
    });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(function(ev){
      card.addEventListener(ev, function(){ rest(card); });
    });
  });

  /* pause animations for cards that are scrolled out of view or on a hidden screen */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(list){
      list.forEach(function(en){ en.target.classList.toggle('off', !en.isIntersecting); });
    }, {threshold: 0.05});
    cards.forEach(function(c){ io.observe(c); });
  }

  /* artwork banner on the matchmaking screen (ids are re-suffixed so gradients never collide) */
  function fillMatchThumb(game){
    var title = document.getElementById('matchGameTitle');
    var src = document.querySelector('.game-card[data-game="' + game + '"] .thumb');
    if(!title || !src) return;
    var host = document.getElementById('matchThumb');
    if(!host){
      host = document.createElement('div');
      host.id = 'matchThumb';
      host.setAttribute('aria-hidden', 'true');
      title.parentNode.insertBefore(host, title);
    }
    var svg = src.querySelector('svg').outerHTML.replace(/(id="|url\(#)([A-Za-z0-9_-]+)/g, '$1$2m');
    host.className = 'match-thumb thumb t-' + game;
    host.innerHTML = svg;
  }
  var _open = window.openMatchmaking;
  if(typeof _open === 'function'){
    window.openMatchmaking = function(game){
      var out = _open.apply(this, arguments);
      try{ fillMatchThumb(game); }catch(e){}
      return out;
    };
  }
})();
