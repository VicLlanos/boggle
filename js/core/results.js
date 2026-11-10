function computeResults(){
  const gt = roomData?.gameType || 'boggle';
  if(gt === 'scatter') return computeScatterResults();
  if(gt === 'hangman') return computeHangmanResults();
  if(gt === 'draw') return computeDrawResults();
  if(gt === 'spy') return computeSpyResults();
  if(gt === 'board') return computeBoardResults();

  const players=Object.values((roomData&&roomData.players)||{});
  const found={};
  players.forEach(p=>Object.keys(p.words||{}).forEach(w=>{found[w]=(found[w]||0)+1}));
  const rows=players.map(p=>{
    const items=Object.keys(p.words||{}).map(w=>({
      w,
      pts:wordScore(w),
      dupe:found[w]>1,
      with:players.filter(o=>o.uid!==p.uid&&o.words&&o.words[w]).map(o=>o.name)
    })).sort((a,b)=>(a.dupe-b.dupe)||(b.pts-a.pts)||a.w.localeCompare(b.w));
    const raw=items.reduce((s,i)=>s+i.pts,0);
    const final=items.reduce((s,i)=>s+(i.dupe?0:i.pts),0);
    return{p,items,raw,final,lost:raw-final,uniqueN:items.filter(i=>!i.dupe).length,sharedN:items.filter(i=>i.dupe).length};
  });
  rows.sort((a,b)=>(b.final-a.final)||(b.uniqueN-a.uniqueN)||String(a.p.name).localeCompare(String(b.p.name)));
  return rows;
}

function animateScore(el,from,to,delay){
  el.textContent=from;
  if(from===to)return;
  setTimeout(()=>{
    const t0=performance.now(),dur=650;
    const step=now=>{
      const k=Math.min(1,(now-t0)/dur);
      el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));
      if(k<1&&el.isConnected)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },delay);
}

function renderResults(rows){
  const gt = roomData?.gameType || 'boggle';
  const top=rows[0]?.final ?? 0;
  const leaders=rows.filter(r=>r.final===top);
  const shared=new Set();
  rows.forEach(r=>r.items.forEach(i=>{if(i.dupe)shared.add(i.w)}));

  let title;
  if(rows.length===1)title='🎉 Nice round!';
  else if(leaders.length>1)title='🤝 It\'s a tie!';
  else title='👑 '+esc(leaders[0].p.name)+' wins!';
  const sub=shared.size
    ?shared.size+(shared.size===1?' shared answer was':' shared answers were')+' crossed out'
    :'No shared answers this round';

  // ===== SPY WORD: series winner + history =====
  if(gt === 'spy'){
    const hist = Array.isArray(roomData.spyHistory) ? roomData.spyHistory : [];
    const maxR = roomData.spyMaxRounds || SPY_MAX_ROUNDS;
    let hTitle = title;
    const h0 = hist[0];
    if(h0) hTitle = h0.spyWon ? '🕵️ The spy wins!' : '🎉 Civilians win!';
    else hTitle = 'Game over';

    const cards = rows.map((r,i)=>{
      const rank = rows.findIndex(x=>x.final===r.final)+1;
      const isTop = rank===1 && r.final>0;
      const isMe = r.p.uid===user.uid;
      return '<div class="res-card'+(isTop?' win':'')+(isMe?' me':'')+'" style="--i:'+i+'">'
        +'<div class="res-head">'
        +'<div class="rk">'+(isTop?'👑':rank)+'</div>'
        +'<div class="info"><div class="n">'+esc(r.p.avatar||'')+' '+esc(r.p.name)+(isMe?' (you)':'')+'</div>'
        +'<div class="d">'+r.final+' point'+(r.final===1?'':'s')+'</div></div>'
        +'<div class="pts-wrap"><div class="pts">'+r.final+'</div></div>'
        +'</div></div>';
    }).join('');

    let histHtml = '<div class="poss" style="margin-top:12px"><h3>🕵️ Round history</h3>';
    if(!hist.length){
      histHtml += '<div class="psub">No rounds recorded.</div>';
    } else {
      histHtml += hist.map(h => {
        const spyP = (roomData.players||{})[h.spyUid];
        const spyName = spyP ? esc(spyP.name) : 'Spy';
        const evP = (roomData.players||{})[h.evicted]; let outcome = !h.evicted ? 'Votes tied — nobody evicted' : (!h.spyCaught ? (evP?esc(evP.name):'A player')+' was evicted (innocent)' : (h.spyGuessed ? 'Spy caught but guessed the word' : 'Spy caught and guessed wrong'));
        return '<div style="background:#F8F9FA;border-radius:12px;padding:10px 12px;margin:6px 0;border:2px solid #EEF0F2;text-align:left">'
          +'<div style="font-weight:900;color:var(--violet-d)">Spy: '+spyName+'</div>'
          +'<div style="font-size:1.05rem;font-weight:800;letter-spacing:1px;margin:4px 0">'+esc(h.word||'?')+'</div>'
          +'<div style="font-size:.8rem;font-weight:700;color:#636E72">'+outcome+'</div>'
          +'</div>';
      }).join('');
    }
    histHtml += '</div>';

    $('resultsGrid').innerHTML = '<div class="res-banner"><div class="t">'+hTitle+'</div><div class="s">'+maxR+' rounds · catch the spy or fool the room</div></div>'+cards;
    $('possibleWrap').innerHTML = histHtml;
    return;
  }

  // ===== SKETCH RACE: series winner + history =====
  if(gt === 'draw'){
    const hist = Array.isArray(roomData.drawHistory) ? roomData.drawHistory : [];
    const maxL = roomData.drawMaxLevels || DRAW_MAX_LEVELS;
    let hTitle = title;
    if(rows.length===1) hTitle = '🎉 Series complete!';
    else if(leaders.length>1 && top>0) hTitle = '🤝 Tie at '+top+' wins!';
    else if(top>0) hTitle = '👑 '+esc(leaders[0].p.name)+' wins Sketch Race!';
    else hTitle = 'Series over';

    const cards = rows.map((r,i)=>{
      const rank = rows.findIndex(x=>x.final===r.final)+1;
      const isTop = rank===1 && r.final>0;
      const isMe = r.p.uid===user.uid;
      const outcome = isTop ? 'WINNER' : (r.final>0 ? r.final+' wins' : 'No wins');
      return '<div class="res-card'+(isTop?' win':'')+(isMe?' me':'')+'" style="--i:'+i+'">'
        +'<div class="res-head">'
        +'<div class="rk">'+(isTop?'👑':rank)+'</div>'
        +'<div class="info"><div class="n">'+esc(r.p.avatar||'')+' '+esc(r.p.name)+(isMe?' (you)':'')+'</div>'
        +'<div class="d">'+outcome+'</div></div>'
        +'<div class="pts-wrap"><div class="pts">'+r.final+'</div><div style="font-size:.7rem;font-weight:800;color:#636E72">wins</div></div>'
        +'</div></div>';
    }).join('');

    let histHtml = '<div class="poss" style="margin-top:12px"><h3>🎨 Round history</h3>';
    if(!hist.length){
      histHtml += '<div class="psub">No levels recorded.</div>';
    } else {
      histHtml += hist.map(h => {
        const who = h.winnerName ? esc(h.winnerName) : 'Nobody';
        const drawer = (roomData.players||{})[h.drawerUid];
        const drawerName = drawer ? esc(drawer.name) : 'Artist';
        return '<div style="background:#F8F9FA;border-radius:12px;padding:10px 12px;margin:6px 0;border:2px solid #EEF0F2;text-align:left">'
          +'<div style="font-weight:900;color:var(--violet-d)">Level '+h.level+' · drawn by '+drawerName+'</div>'
          +'<div style="font-size:1.05rem;font-weight:800;letter-spacing:1px;margin:4px 0">'+esc(h.word||'?')+'</div>'
          +'<div style="font-size:.8rem;font-weight:700;color:#636E72">Guessed by: '+who+'</div>'
          +'</div>';
      }).join('');
    }
    histHtml += '</div>';

    $('resultsGrid').innerHTML = '<div class="res-banner"><div class="t">'+hTitle+'</div><div class="s">Best of '+maxL+' · first correct guess wins each level</div></div>'+cards;
    $('possibleWrap').innerHTML = histHtml;
    return;
  }

  // ===== HANGMAN: series winner + all answers =====
  if(gt === 'hangman'){
    const hist = Array.isArray(roomData.hangHistory) ? roomData.hangHistory : [];
    const maxL = roomData.hangMaxLevels || HANG_MAX_LEVELS;
    let hTitle = title;
    if(rows.length===1) hTitle = '🎉 Series complete!';
    else if(leaders.length>1 && top>0) hTitle = '🤝 Tie at '+top+' wins!';
    else if(top>0) hTitle = '👑 '+esc(leaders[0].p.name)+' wins the series!';
    else hTitle = 'Series over';

    const cards = rows.map((r,i)=>{
      const rank = rows.findIndex(x=>x.final===r.final)+1;
      const isTop = rank===1 && r.final>0;
      const isMe = r.p.uid===user.uid;
      const outcome = isTop ? 'WINNER' : (r.final>0 ? r.final+' wins' : 'No wins');
      return '<div class="res-card'+(isTop?' win':'')+(isMe?' me':'')+'" style="--i:'+i+'">'
        +'<div class="res-head">'
        +'<div class="rk">'+(isTop?'👑':rank)+'</div>'
        +'<div class="info"><div class="n">'+esc(r.p.avatar||'')+' '+esc(r.p.name)+(isMe?' (you)':'')+'</div>'
        +'<div class="d">'+outcome+(isTop?'':' · lost series')+'</div></div>'
        +'<div class="pts-wrap"><div class="pts">'+r.final+'</div><div style="font-size:.7rem;font-weight:800;color:#636E72">wins</div></div>'
        +'</div></div>';
    }).join('');

    let histHtml = '<div class="poss" style="margin-top:12px"><h3>📋 All answers this series</h3>';
    if(!hist.length){
      histHtml += '<div class="psub">No levels recorded.</div>';
    } else {
      histHtml += hist.map(h => {
        const who = h.winnerName ? esc(h.winnerName) : 'Nobody';
        return '<div style="background:#F8F9FA;border-radius:12px;padding:10px 12px;margin:6px 0;border:2px solid #EEF0F2;text-align:left">'
          +'<div style="font-weight:900;color:var(--violet-d)">Level '+h.level+(h.category?' · '+esc(h.category):'')+'</div>'
          +'<div style="font-size:1.05rem;font-weight:800;letter-spacing:1px;margin:4px 0">'+esc(h.word||'?')+'</div>'
          +'<div style="font-size:.8rem;font-weight:700;color:#636E72">Won by: '+who+'</div>'
          +'</div>';
      }).join('');
    }
    histHtml += '</div>';

    $('resultsGrid').innerHTML = '<div class="res-banner"><div class="t">'+hTitle+'</div><div class="s">Best of '+maxL+' · first to finish wins</div></div>'+cards;
    $('possibleWrap').innerHTML = histHtml;
    return;
  }

  // ===== SCATTERGORIES: summary + unanimous challenge system =====
  if(gt === 'scatter'){
    const cats = roomData.categories || [];
    const letter = roomData.letter || '?';
    const rejected = roomData.rejected || {};
    const challenges = roomData.challenges || {}; // { "uid_cat": { by, votes: {uid: true/false} } }
    const players = Object.values(roomData.players || {});
    const playerCount = players.length;

    // Scoreboard cards
    const cards = rows.map((r,i)=>{
      const rank = rows.findIndex(x=>x.final===r.final)+1;
      const isTop = rank===1;
      const detail = r.uniqueN + ' scored' + (r.lost ? ' · ' + r.lost + ' lost' : '');
      return '<div class="res-card'+(isTop?' win':'')+(r.p.uid===user.uid?' me':'')+'" style="--i:'+i+'">'
        +'<div class="res-head">'
        +'<div class="rk">'+(isTop?'👑':rank)+'</div>'
        +'<div class="info"><div class="n">'+esc(r.p.avatar||'')+' '+esc(r.p.name)+(r.p.uid===user.uid?' (you)':'')+'</div><div class="d">'+detail+'</div></div>'
        +'<div class="pts-wrap"><div class="pts">'+r.final+'</div></div>'
        +'</div></div>';
    }).join('');

    let detailHtml = '<div class="poss" style="margin-top:12px">';
    detailHtml += '<h3>📝 Letter <span style="color:var(--violet-d)">'+esc(letter)+'</span> · Review & Challenge</h3>';
    detailHtml += '<div class="psub" style="margin-bottom:12px">Challenge an answer if it does not fit the category. An answer <b>keeps its point unless it is challenged and rejected</b>. To reject, every other player must vote Reject (in 1v1 the owner must concede). Any Keep vote ends the challenge. Scoring: +1 per answer nobody else wrote; identical answers score 0 for everyone who wrote them.</div>';

    cats.forEach((cat, ci) => {
      detailHtml += '<div style="background:#F8F9FA;border-radius:14px;padding:12px;margin-bottom:10px;border:2px solid #EEF0F2">';
      detailHtml += '<div style="font-weight:900;font-size:.9rem;color:var(--violet-d);margin-bottom:8px">'+(ci+1)+'. '+esc(cat)+'</div>';

      let hasAny = false;
      players.forEach(p => {
        const ans = (p.answers || {})[ci];
        if(!ans || !ans.trim()) return;
        hasAny = true;
        const key = p.uid + '_' + ci;
        const auto = (p.verdicts||{})[ci]==='no' && !(roomData.forgiven||{})[key] && !rejected[key];
        const isRejected = !!rejected[key] || auto;
        const ch = challenges[key] || null;
        const norm = scatNorm(ans);
        const sameCount = players.filter(op => {
          const oa = (op.answers||{})[ci];
          return oa && scatNorm(oa) === norm && !rejected[op.uid+'_'+ci] && !((op.verdicts||{})[ci]==='no' && !(roomData.forgiven||{})[op.uid+'_'+ci]);
        }).length;
        const isDupe = sameCount > 1;

        detailHtml += '<div style="display:flex;align-items:center;gap:8px;margin:8px 0;flex-wrap:wrap">';
        detailHtml += '<span style="font-size:1.15rem">'+(p.avatar||'🎮')+'</span>';
        detailHtml += '<span style="font-weight:800;min-width:60px">'+(p.uid===user.uid?'You':esc(p.name))+'</span>';
        detailHtml += '<span class="wchip '+(isRejected||isDupe?'dupe':'')+'" style="animation:none"><span class="wt">'+(isRejected?'~~':'')+esc(ans.toUpperCase())+(isRejected?'~~':'')+'</span>';
        if(!isRejected && !isDupe) detailHtml += '<b>+1'+((p.verdicts||{})[ci]==='ok'?' ✓':'')+'</b>';
        detailHtml += '</span>';

        if(isRejected){
          detailHtml += '<span style="font-size:.75rem;font-weight:800;color:#E74C3C">'+(auto?'Auto-check: doesn’t fit the category':'Rejected by agreement')+'</span>';
          // Allow re-open only if everyone agrees again (simple restore by any player for now)
          detailHtml += '<button type="button" class="btn-restore" data-key="'+key+'" style="font-size:.7rem;font-weight:800;padding:3px 9px;border-radius:99px;border:2px solid #00B894;background:#fff;color:#00B894;cursor:pointer">Restore</button>';
        } else if(ch){
          // Open challenge – show votes
          const votes = ch.votes || {};
          const jury = players.filter(op => op.uid !== p.uid || players.length < 3);
          const needed = jury.length;
          const agreeCount = jury.filter(op => votes[op.uid] === true).length;
          detailHtml += '<span style="font-size:.72rem;font-weight:700;color:#E17055">Challenge open · '+agreeCount+'/'+needed+' agree to reject</span>';

          // Current user vote buttons
          if(!jury.some(op => op.uid === user.uid)){
            detailHtml += '<span style="font-size:.7rem;font-weight:700;color:#636E72">Others are voting on your answer</span>';
          } else if(votes[user.uid] === undefined){
            detailHtml += '<button type="button" class="btn-vote-yes" data-key="'+key+'" style="font-size:.7rem;font-weight:800;padding:3px 9px;border-radius:99px;border:2px solid #E74C3C;background:#fff;color:#E74C3C;cursor:pointer">'+(p.uid===user.uid?'Concede':'Reject it')+'</button>';
            detailHtml += '<button type="button" class="btn-vote-no" data-key="'+key+'" style="font-size:.7rem;font-weight:800;padding:3px 9px;border-radius:99px;border:2px solid #636E72;background:#fff;color:#636E72;cursor:pointer">'+(p.uid===user.uid?'Defend':'Keep it')+'</button>';
          } else {
            detailHtml += '<span style="font-size:.7rem;font-weight:700;color:#636E72">You voted: '+(votes[user.uid]?'Reject':'Keep')+'</span>';
          }
        } else {
          // No challenge yet – allow starting one (cannot challenge your own answer)
          if(p.uid !== user.uid){
            detailHtml += '<button type="button" class="btn-challenge" data-uid="'+p.uid+'" data-cat="'+ci+'" data-word="'+esc(ans)+'" style="font-size:.7rem;font-weight:800;padding:3px 9px;border-radius:99px;border:2px solid #FF7675;background:#fff;color:#E74C3C;cursor:pointer">Challenge</button>';
          }
        }
        detailHtml += '</div>';
      });

      if(!hasAny) detailHtml += '<div class="none-words">No answers</div>';
      detailHtml += '</div>';
    });

    detailHtml += '</div>';

    $('resultsGrid').innerHTML = '<div class="res-banner"><div class="t">'+title+'</div><div class="s">'+sub+'</div></div>'+cards;
    $('possibleWrap').innerHTML = detailHtml;

    // --- Wire buttons ---
    // Start a challenge
    $('possibleWrap').querySelectorAll('.btn-challenge').forEach(btn => {
      btn.onclick = async () => {
        const uid = btn.dataset.uid;
        const cat = btn.dataset.cat;
        const key = uid + '_' + cat;
        try{
          await db.ref('rooms/'+roomId+'/challenges/'+key).set({
            by: user.uid,
            word: btn.dataset.word,
            catIndex: +cat,
            votes: { [user.uid]: true }, // challenger already votes to reject
            createdAt: srvNow()
          });
          toast('Challenge started – everyone must agree to reject');
          snd('tap');
        }catch(e){ toast('Could not start challenge'); }
      };
    });

    // Vote YES (reject)
    $('possibleWrap').querySelectorAll('.btn-vote-yes').forEach(btn => {
      btn.onclick = async () => {
        const key = btn.dataset.key;
        try{
          await db.ref('rooms/'+roomId+'/challenges/'+key+'/votes/'+user.uid).set(true);
          // Check if unanimous
          const snap = await db.ref('rooms/'+roomId+'/challenges/'+key).once('value');
          const ch = snap.val();
          if(ch && ch.votes){
            const all = Object.values(roomData.players||{}), owner = key.split('_')[0];
            const jury = all.filter(p => p.uid !== owner || all.length < 3);
            const allAgree = jury.length > 0 && jury.every(p => ch.votes[p.uid] === true);
            if(allAgree){
              await db.ref('rooms/'+roomId+'/rejected/'+key).set(true);
              await db.ref('rooms/'+roomId+'/challenges/'+key).remove();
              toast('Everyone agreed – answer rejected');
              snd('bad');
            } else {
              toast('Your vote recorded');
            }
          }
        }catch(e){ toast('Vote failed'); }
      };
    });

    // Vote NO (keep)
    $('possibleWrap').querySelectorAll('.btn-vote-no').forEach(btn => {
      btn.onclick = async () => {
        const key = btn.dataset.key;
        try{
          // Any "Keep" vote immediately closes the challenge and keeps the answer
          await db.ref('rooms/'+roomId+'/challenges/'+key).remove();
          toast('Answer kept – challenge closed');
          snd('ok');
        }catch(e){ toast('Could not close challenge'); }
      };
    });

    // Restore a previously rejected answer (requires starting a new agreement, but for simplicity any player can restore)
    $('possibleWrap').querySelectorAll('.btn-restore').forEach(btn => {
      btn.onclick = async () => {
        const key = btn.dataset.key;
        if(!confirm('Restore this answer? It will get its point back.')) return;
        try{
          await db.ref('rooms/'+roomId+'/rejected/'+key).remove();
          await db.ref('rooms/'+roomId+'/forgiven/'+key).set(true);
          toast('Answer restored');
        }catch(e){ toast('Could not restore'); }
      };
    });
    return;
  }

  // ===== Original Boggle results =====
  const cards=rows.map((r,i)=>{
    const rank=rows.findIndex(x=>x.final===r.final)+1;
    const isTop=rank===1;
    const chips=r.items.map((it,k)=>{
      const d=250+Math.min(k,24)*40;
      const tip=it.dupe?' title="Also found by '+esc((it.with||[]).join(', '))+'"':'';
      return '<span class="wchip'+(it.dupe?' dupe':'')+'" style="--d:'+d+'"'+tip+'><span class="wt">'+esc(it.w.toUpperCase())+'</span>'+(it.dupe?'':'<b>+'+it.pts+'</b>')+'</span>';
    }).join('')||'<span class="none-words">No answers</span>';
    const strikeEnd=250+Math.min(Math.max(r.items.length-1,0),24)*40+450+350;
    const detail=r.uniqueN+' scored'+(r.sharedN?' · '+r.sharedN+' crossed out':'');
    return '<div class="res-card'+(isTop?' win':'')+(r.p.uid===user.uid?' me':'')+'" style="--i:'+i+'">'
      +'<div class="res-head">'
      +'<div class="rk">'+(isTop?'👑':rank)+'</div>'
      +'<div class="info"><div class="n">'+esc(r.p.avatar||'')+' '+esc(r.p.name)+(r.p.uid===user.uid?' (you)':'')+'</div><div class="d">'+detail+'</div></div>'
      +'<div class="pts-wrap"><div class="pts" data-from="'+r.raw+'" data-to="'+r.final+'" data-delay="'+strikeEnd+'">'+r.raw+'</div>'
      +(r.lost?'<div class="lost" style="--ld:'+strikeEnd+'">−'+r.lost+'</div>':'')+'</div>'
      +'</div>'
      +'<div class="wchips">'+chips+'</div>'
      +'</div>';
  }).join('');

  const legend=rows.length>1
    ?'<div class="res-legend"><span class="wchip"><span class="wt">WORD</span><b>+1</b></span> counts <span class="wchip dupe"><span class="wt">WORD</span></span> found by 2+ players, no points</div>'
    :'';

  $('resultsGrid').innerHTML='<div class="res-banner"><div class="t">'+title+'</div><div class="s">'+sub+'</div></div>'+cards+legend;
  $('resultsGrid').querySelectorAll('.pts').forEach(el=>animateScore(el,+el.dataset.from,+el.dataset.to,+el.dataset.delay));
  $('possibleWrap').innerHTML = '';
}

function awardResults(rows,force){
  if(resultsAwarded||!rows||!rows.length||!profile)return;
  if(!force&&!(roomData&&roomData.status==='results'))return;
  const me=rows.find(r=>r.p.uid===user.uid);
  if(!me)return;
  resultsAwarded=true;
  const top=rows[0].final;
  const tied=rows.filter(r=>r.final===top).length>1;
  const won=rows.length>1&&me.final===top&&!tied;
  const lost=rows.length>1&&me.final<top;
  if(won){profile.streak=(profile.streak||0)+1;snd('win')}
  else if(lost)profile.streak=0;
  if(me.final>(profile.bestScore||0))profile.bestScore=me.final;
  profile.xp=(profile.xp||0)+10+(won?25:0);
  saveProfile({streak:profile.streak,bestScore:profile.bestScore,xp:profile.xp});
  updateXpBar();
}

function updateXpBar(){
  const lv=levelFromXp(profile.xp||0);
  $('resLvl').textContent=lv.level;
  $('resXpText').textContent=lv.into+'/'+lv.need;
  $('resXpFill').style.width=Math.min(100,lv.into/lv.need*100)+'%';
}

function showResults(){
  clearInterval(timerInterval);
  if(!$('screen-results').classList.contains('active'))show('screen-results');
  const rows=computeResults();
  if(!rows.length)return;
  const sig=JSON.stringify(rows.map(r=>[r.p.uid,r.final,r.items.map(i=>i.w+(i.dupe?'*':'')+(i.rejected?'x':''))]))+JSON.stringify([roomData.challenges||0,roomData.rejected||0,roomData.forgiven||0]);
  if(sig!==resultsSig){resultsSig=sig;renderResults(rows);if((roomData?.gameType||'boggle')==='boggle')renderPossible(rows)}
  awardResults(rows);
  if(profile)updateXpBar();
}

$('btnBackLobby').onclick=leaveRoom;

$('btnPlayAgain').onclick=async()=>{
  if(isHost){
    resetRoundState();
    const gt = roomData?.gameType || selectedGame;
    // Hangman best-of-5: advance level or start new series
    if(gt === 'hangman'){
      const lvl = roomData.hangLevel || 1;
      if(lvl >= HANG_MAX_LEVELS){
        await db.ref('rooms/'+roomId).update({hangLevel: 0}).catch(()=>{});
        const ups = {};
        Object.keys(roomData.players||{}).forEach(uid=>{ ups['players/'+uid+'/hangWins']=0; });
        await db.ref('rooms/'+roomId).update(ups).catch(()=>{});
      }
    }
    if(gt === 'draw'){
      const lvl = roomData.drawLevel || 1;
      if(lvl >= DRAW_MAX_LEVELS){
        await db.ref('rooms/'+roomId).update({drawLevel: 0}).catch(()=>{});
        const ups = {};
        Object.keys(roomData.players||{}).forEach(uid=>{ ups['players/'+uid+'/drawWins']=0; });
        await db.ref('rooms/'+roomId).update(ups).catch(()=>{});
      }
    }
    if(gt === 'spy'){
      const rnd = roomData.spyRound || 1;
      if(rnd >= SPY_MAX_ROUNDS){
        await db.ref('rooms/'+roomId).update({spyRound: 0, spyHistory: null}).catch(()=>{});
        const ups = {};
        Object.keys(roomData.players||{}).forEach(uid=>{ ups['players/'+uid+'/spyScore']=0; });
        await db.ref('rooms/'+roomId).update(ups).catch(()=>{});
      }
    }
    await beginRound();
  }else{
    toast('Waiting for host to start the next level…');
  }
};
