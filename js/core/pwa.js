/* ========== PWA & INSTALL LOGIC ========== */
let deferredPrompt = null;
const btnInstall = $('btnInstall');
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = /android/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (btnInstall && !isStandalone) btnInstall.style.display = 'flex';
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  if (btnInstall) btnInstall.style.display = 'none';
  toast('Installed! Open it from your home screen 🎉');
});

if (btnInstall) {
  btnInstall.onclick = async () => {
    if (isIOS) {
      toast('On iPhone: Tap Share (⬆️) → Add to Home Screen');
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      btnInstall.style.display = 'none';
      if (outcome === 'accepted') toast('Installing…');
    } else {
      toast('Use browser menu (⋮) → Install App');
    }
  };
}

if ((isIOS || isAndroid) && !isStandalone && btnInstall) {
  btnInstall.style.display = 'flex';
}


// Start ambient FX if we land on auth/lobby
if(document.getElementById('screen-auth')?.classList.contains('active') ||
   document.getElementById('screen-lobby')?.classList.contains('active')){
  setTimeout(() => setWordRain(true), 200);
}

if ('serviceWorker' in navigator) {
  const registerSW = () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => { reg.update(); })
      .catch(err => console.warn('SW register failed', err));
  };
  // (files are loaded after first paint, so 'load' may already have fired)
  if (document.readyState === 'complete') registerSW();
  else window.addEventListener('load', registerSW);
}
