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

  // ===================================================================
  //  PAC-MAN — couche audio « fichier OU synthèse ».
  //  Si un fichier existe dans /static/sfx/<nom>.mp3 (ou .wav), il est joué ;
  //  sinon on retombe sur une recréation 8-bit synthétisée (zéro fichier,
  //  hors-ligne). Déposez vos propres sons dans server/public/static/sfx/.
  // ===================================================================
  const PAC_NAMES = ['intro', 'chomp', 'eatghost', 'death', 'power', 'fruit', 'extend', 'win', 'lose'];
  const pacFiles = {}; // nom -> { ok:bool|null, el:Audio }
  function pacTryLoad(name) {
    if (pacFiles[name]) return;
    const rec = { ok: null, el: null };
    pacFiles[name] = rec;
    const tryExt = (exts) => {
      if (!exts.length) { rec.ok = false; return; }
      const el = new Audio();
      el.preload = 'auto';
      el.addEventListener('canplaythrough', () => { rec.ok = true; rec.el = el; }, { once: true });
      el.addEventListener('error', () => tryExt(exts.slice(1)), { once: true });
      el.src = '/static/sfx/' + name + '.' + exts[0];
      el.load();
    };
    tryExt(['mp3', 'ogg', 'wav']);
  }
  function pacPreload() { PAC_NAMES.forEach(pacTryLoad); }
  // Joue le fichier s'il est dispo, sinon la version synthétisée (synth()).
  function pacPlay(name, synth, vol = 0.5) {
    const rec = pacFiles[name];
    if (rec && rec.ok && rec.el) {
      try { const c = rec.el.cloneNode(); c.volume = vol; c.play(); return; } catch (_) { /* fallback */ }
    }
    try { synth(); } catch (_) {}
  }

  // --- Recréations 8-bit (style Pac-Man, non extraites de l'original) ---
  let _waka = 0;
  const pac = {
    preload: pacPreload,
    // « waka-waka » : on alterne deux blips (montant / descendant) à chaque gomme
    chomp() {
      pacPlay('chomp', () => {
        _waka ^= 1;
        if (_waka) slide(420, 190, 0.07, 'square', 0.12);
        else slide(190, 420, 0.07, 'square', 0.12);
      }, 0.35);
    },
    // super-gomme / mode fantômes bleus
    power() { pacPlay('power', () => seq([[330,0.08],[392,0.08],[494,0.08],[392,0.08],[330,0.12]], 'square', 0.18)); },
    // Pac mange un fantôme (montée rapide « bweeoop »)
    eatGhost() { pacPlay('eatghost', () => { slide(280, 1000, 0.22, 'square', 0.22); tone(1245, 0.2, 0.12, 'square', 0.2); }); },
    // un Pac se fait attraper (jingle de mort caractéristique)
    death() { pacPlay('death', () => { slide(660, 110, 0.55, 'square', 0.25);
      seq([[0,0.1],[523,0.1],[0,0.05],[415,0.1],[0,0.05],[330,0.1],[0,0.05],[262,0.22]], 'square', 0.2); }); },
    // bonus fruit
    fruit() { pacPlay('fruit', () => seq([[784,0.08],[988,0.08],[1319,0.16]], 'square', 0.2)); },
    // vie supplémentaire
    extend() { pacPlay('extend', () => seq([[523,0.1],[784,0.1],[1047,0.24]], 'square', 0.22)); },
    // intro / coup d'envoi (arpège, pas la mélodie originale)
    intro() { pacPlay('intro', () => seq([[262,0.12],[392,0.12],[523,0.12],[659,0.12],[523,0.12],[659,0.12],[784,0.3]], 'square', 0.2)); },
    win() { pacPlay('win', () => seq([[523,0.12],[659,0.12],[784,0.12],[1047,0.12],[1319,0.45]], 'square', 0.24)); },
    lose() { pacPlay('lose', () => seq([[392,0.14],[330,0.14],[262,0.14],[196,0.36]], 'sawtooth', 0.24)); },
  };

  // ===================================================================
  //  Boucle musicale chiptune (style plateforme 8-bit) — pour le briefing.
  //  Mélodie ORIGINALE, jouée en boucle ; vol bas pour rester en fond.
  // ===================================================================
  const BRIEF_TUNE = [ // [freq Hz, durée s]  (sib/do/mi/sol… arpèges sautillants)
    [392,0.16],[523,0.16],[659,0.16],[784,0.24],[659,0.16],[784,0.16],[880,0.30],
    [784,0.16],[659,0.16],[587,0.16],[659,0.16],[523,0.30],[0,0.18],
    [440,0.16],[523,0.16],[659,0.16],[698,0.24],[659,0.16],[523,0.16],[587,0.30],[0,0.24],
  ];
  let _loopTimer = null;
  function loopStop() { if (_loopTimer) { clearTimeout(_loopTimer); _loopTimer = null; } }
  function loopStart(notes, vol = 0.12) {
    loopStop();
    const tune = notes || BRIEF_TUNE;
    const total = tune.reduce((s, n) => s + n[1], 0);
    const run = () => { seq(tune, 'square', vol); _loopTimer = setTimeout(run, total * 1000); };
    run();
  }

  return {
    unlock,
    pac, pacPreload,
    briefMusic(v) { loopStart(null, v); }, // démarre la boucle du briefing
    briefMusicStop: loopStop,
    coin()   { seq([[988, 0.08], [1319, 0.18]], 'square', 0.22); },
    // cliquet de la roue des gages (clic sec et bref)
    tick()   { tone(2000, 0, 0.015, 'square', 0.12); },
    start()  { seq([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.28]], 'square', 0.22); },
    level()  { seq([[392, 0.08], [523, 0.08], [659, 0.2]], 'square', 0.22); },
    correct(){ seq([[659, 0.09], [988, 0.18]], 'square', 0.22); },
    wrong()  { seq([[196, 0.18], [147, 0.28]], 'sawtooth', 0.2); },
    buzz()   { slide(1200, 500, 0.18, 'square', 0.25); },
    gage()   { seq([[440, 0.07], [415, 0.07], [392, 0.07], [330, 0.22]], 'square', 0.22); },
    twist()  { seq([[523, 0.1], [622, 0.1], [740, 0.1], [988, 0.34]], 'square', 0.25); },
    win()    { seq([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.12], [1319, 0.45]], 'square', 0.24); },
    vote()   { seq([[330, 0.12], [330, 0.12], [262, 0.28]], 'triangle', 0.22); },
    // sons des 6 pads colorés (jeu des enfants)
    pad(i)   { const f = [392, 466, 523, 587, 659, 784][i % 6]; tone(f, 0, 0.32, 'square', 0.22); },
    padOk()  { seq([[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.22]], 'square', 0.22); },
    // note libre (séquence musicale) — freq en Hz, départ optionnel
    note(freq, start, dur) { tone(freq, start || 0, dur || 0.34, 'square', 0.22); },
    // 🟡 PAC-MAN : jingle de mort (descente caractéristique) quand on perd une vie
    pacDeath() {
      slide(660, 110, 0.55, 'square', 0.25);
      seq([[0, 0.1], [523, 0.1], [0, 0.05], [415, 0.1], [0, 0.05], [330, 0.1], [0, 0.05], [262, 0.22]], 'square', 0.2);
    },
    // 🟡 PAC-MAN : un joueur est ÉLIMINÉ (3 vies perdues)
    pacOut() { seq([[330, 0.12], [262, 0.12], [196, 0.12], [147, 0.34]], 'sawtooth', 0.24); },
  };
})();
