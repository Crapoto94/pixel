// =====================================================================
//  PIXEL PANIC — moteur de sons 8-bit (Web Audio API, zéro fichier).
//  Les navigateurs bloquent l'audio tant que l'utilisateur n'a pas
//  interagi : appelle SFX.unlock() au premier tap (cf. borne.html).
// =====================================================================
window.SFX = (function () {
  let ctx = null;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function unlock() {
    const c = ac();
    if (c.state === 'suspended') c.resume();
    // petit "tick" silencieux pour amorcer certains navigateurs mobiles
    tone(1, 0, 0.01, 'sine', 0.0001);
  }

  // une note
  function tone(freq, start, dur, type = 'square', vol = 0.2) {
    const c = ac();
    const t0 = c.currentTime + start;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }
  // une séquence : [[freq, durée], ...] (freq null = silence)
  function seq(notes, type = 'square', vol = 0.2) {
    let t = 0;
    for (const [f, d] of notes) {
      if (f) tone(f, t, d, type, vol);
      t += d;
    }
  }
  // glissando (montée/descente) pour effets "power-up" / "buzz"
  function slide(f1, f2, dur, type = 'square', vol = 0.2) {
    const c = ac();
    const t0 = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }

  return {
    unlock,
    coin()   { seq([[988, 0.08], [1319, 0.18]], 'square', 0.22); },
    start()  { seq([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.28]], 'square', 0.22); },
    level()  { seq([[392, 0.08], [523, 0.08], [659, 0.2]], 'square', 0.22); },
    correct(){ seq([[659, 0.09], [988, 0.18]], 'square', 0.22); },
    wrong()  { seq([[196, 0.18], [147, 0.28]], 'sawtooth', 0.2); },
    buzz()   { slide(1200, 500, 0.18, 'square', 0.25); },
    gage()   { seq([[440, 0.07], [415, 0.07], [392, 0.07], [330, 0.22]], 'square', 0.22); },
    twist()  { seq([[523, 0.1], [622, 0.1], [740, 0.1], [988, 0.34]], 'square', 0.25); },
    win()    { seq([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.12], [1319, 0.45]], 'square', 0.24); },
    vote()   { seq([[330, 0.12], [330, 0.12], [262, 0.28]], 'triangle', 0.22); },
  };
})();
