// =====================================================================
//  Bouton « plein écran » injecté automatiquement (coin haut-droit).
//  Inclure via <script src="/static/fullscreen.js"></script>.
// =====================================================================
(function () {
  function el() { return document.documentElement; }
  function isFs() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function enter() {
    const e = el();
    (e.requestFullscreen || e.webkitRequestFullscreen || function () {}).call(e);
  }
  function exit() {
    (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
  }

  const btn = document.createElement('button');
  btn.id = 'fsbtn';
  btn.textContent = '⛶';
  btn.title = 'Plein écran';
  btn.setAttribute('aria-label', 'Plein écran');
  btn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    isFs() ? exit() : enter();
  });

  document.addEventListener('fullscreenchange', function () {
    btn.textContent = isFs() ? '✕' : '⛶';
  });

  function mount() { if (document.body && !document.getElementById('fsbtn')) document.body.appendChild(btn); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
