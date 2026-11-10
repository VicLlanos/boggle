// Signature of everything in a Sketch Race room EXCEPT the stroke stream (see onRoom)
let _roomSig='';
function onRoom(snap){
  if(!snap.exists()){toast('Room closed');leaveRoom();return}
  const prevStatus=roomData?roomData.status:null;
  const _raw=snap.val();
  // Sketch Race streams every pen stroke through this node. If ONLY strokes changed there is nothing to
  // re-render, so keep the data fresh and skip the expensive full UI pass (this was a main source of lag).
  if(_raw&&_raw.gameType==='draw'&&roomData){
    let sig=null;
    try{ const {drawStrokes:_ignored,...rest}=_raw; sig=JSON.stringify(rest); }catch(e){}
    if(sig!==null&&sig===_roomSig){ roomData=_raw; return; }
    _roomSig=sig===null?'':sig;
  }else{ _roomSig=''; }
  roomData=_raw;
  const st=roomData.status;
  const gt = roomData.gameType || 'boggle';

  renderPlayers();
  socialRoomUpdate();
  isHost=roomData.hostUid===user.uid;
  armDisconnect();
  const start=$('btnStart');
  start.style.display=(isHost&&st==='lobby')?'flex':'none';
  $('waitingMsg').style.display=(isHost&&st==='lobby')?'none':'block';
  $('waitingMsg').textContent=isHost?'':'Waiting for host…';

  // New round starting — reset local round state for ALL players
  // (Scattergories goes straight to 'playing', Boggle uses 'shaking' first)
  if((st==='shaking' || st==='playing') && (prevStatus==='results' || prevStatus==='lobby' || prevStatus===null || roundEnded)){
    roundEnded = false;
  }
  if(st==='shaking') roundEnded = false;

  // Hangman / Sketch: only rebuild UI when the puzzle itself changes (new level)
  const hangSig = gt==='hangman' ? ((roomData.hangLevel||0)+'|'+(roomData.hangWord||'')+'|'+(roomData.startedAt||'')) : '';
  const hangPuzzleChanged = gt==='hangman' && hangSig && hangSig !== window._lastHangSig;
  const drawSig = gt==='draw' ? ((roomData.drawLevel||0)+'|'+(roomData.drawWord||'')+'|'+(roomData.startedAt||'')) : '';
  const drawPuzzleChanged = gt==='draw' && drawSig && drawSig !== window._lastDrawSig;

  if(st==='shaking'||st==='playing'){
    if(gt==='hangman'){
      if(hangPuzzleChanged || prevStatus==='results' || prevStatus==='lobby' || prevStatus===null){
        window._lastHangSig = hangSig;
        roundEnded = false;
        enterHangman(true);
      } else {
        checkHangRaceWinner();
        renderHangScores();
        updateHangLevelBar();
      }
    } else if(gt==='draw'){
      if(drawPuzzleChanged || prevStatus==='results' || prevStatus==='lobby' || prevStatus===null){
        window._lastDrawSig = drawSig;
        roundEnded = false;
        enterDraw(true);
      } else {
        checkDrawRaceWinner();
        renderDrawScores();
        updateDrawLevelBar();
      }
    } else if(gt==='board'){
      bgEnter();
    } else if(gt==='spy'){
      const spySig = ((roomData.spyWord||'')+'|'+(roomData.startedAt||''));
      const spyChanged = spySig && spySig !== window._lastSpySig;
      if(spyChanged || prevStatus==='results' || prevStatus==='lobby' || prevStatus===null){
        window._lastSpySig = spySig;
        roundEnded = false;
        enterSpy(true);
      } else {
        checkSpyState();
      }
    } else if(gt==='chain'){
      const chainGid = roomData.chain ? roomData.chain.gid : '';
      if(chainGid && (chainGid !== window._lastChainGid || prevStatus==='results' || prevStatus==='lobby' || prevStatus===null)){
        window._lastChainGid = chainGid;
        roundEnded = false;
        enterChain();
      } else {
        renderChain();
      }
    } else if(!roundEnded || prevStatus==='results' || prevStatus==='lobby'){
      roundEnded = false;
      if(gt==='scatter') enterScatter();
      else enterGame();
    }
  }

  if(prevStatus==='shaking'&&st==='playing'&&!roundEnded&&gt==='boggle'&&$('screen-game').classList.contains('active')){
    settleBoard(roomData.board);
    startTimer();
  }

  if(st==='results'){
    if(!roundEnded)finishLocalRound();
    if(prevStatus!=='results'||$('screen-results').classList.contains('active'))showResults();
  }
}
