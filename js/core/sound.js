/* ===== SOUND SYSTEM (Web Audio) ===== */
function ensureAudio(){if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ac&&ac.state==='suspended')ac.resume().catch(()=>{})}
function beep(freq,dur,type,vol,slide){
  if(!soundOn)return;try{ensureAudio();if(!ac)return;
    const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
    o.type=type||'sine';o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,slide),t+dur);
    g.gain.setValueAtTime(vol||0.12,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+dur+0.02);
  }catch(e){}}
function snd(kind){
  if(!soundOn)return;
  if(kind==='tap')beep(520+Math.random()*80,.05,'sine',.06);
  else if(kind==='ok'){const st=[0,2,4,7,9,12,14,16],k=st[Math.min(Math.max((typeof combo==='number'?combo:1)-1,0),7)],f=660*Math.pow(2,k/12);beep(f,.08,'triangle',.12);setTimeout(()=>beep(f*1.33,.12,'triangle',.1),60)}
  else if(kind==='big'){beep(523,.1,'triangle',.14);setTimeout(()=>beep(659,.1,'triangle',.12),70);setTimeout(()=>beep(784,.18,'triangle',.1),140)}
  else if(kind==='bad')beep(180,.18,'sawtooth',.08,90);
  else if(kind==='shake'){for(let i=0;i<6;i++)setTimeout(()=>beep(120+Math.random()*40,.06,'square',.05),i*70)}
  else if(kind==='tick')beep(900,.03,'sine',.04);
  else if(kind==='go'){beep(440,.08,'triangle',.1);setTimeout(()=>beep(660,.15,'triangle',.12),90)}
  else if(kind==='win'){beep(523,.12,'triangle',.12);setTimeout(()=>beep(659,.12,'triangle',.11),100);setTimeout(()=>beep(784,.12,'triangle',.1),200);setTimeout(()=>beep(1046,.25,'triangle',.1),320)}
  else if(kind==='opp'){beep(400,.06,'sine',.07);setTimeout(()=>beep(520,.09,'triangle',.08),50)}
}
function toggleSound(){soundOn=!soundOn;try{localStorage.setItem('boggle_snd',soundOn?'1':'0')}catch(e){}const b=$('btnSound');if(b)b.textContent=soundOn?'🔊':'🔇';const b2=$('btnSoundScat');if(b2)b2.textContent=soundOn?'🔊':'🔇';if(soundOn){ensureAudio();snd('tap')}}
