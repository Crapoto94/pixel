// =====================================================================
//  Énigmes collaboratives — données.
// =====================================================================

// --- Séquence musicale : palette de notes (chacune attribuée à un joueur) ---
//  freq = fréquence jouée (Web Audio). La mélodie référence ces index.
//  Palette calée sur le thème principal de SUPER MARIO BROS (overworld).
export const NOTE_PALETTE = [
  { label: 'MI',   freq: 329.63, color: '#ff2e88' }, // 0 — E4
  { label: 'SOL',  freq: 392.00, color: '#ff6b3c' }, // 1 — G4
  { label: 'LA',   freq: 440.00, color: '#ffb03c' }, // 2 — A4
  { label: 'LA♯',  freq: 466.16, color: '#ffe600' }, // 3 — A#4
  { label: 'SI',   freq: 493.88, color: '#b6ff3c' }, // 4 — B4
  { label: 'DO•',  freq: 523.25, color: '#38ff9c' }, // 5 — C5
  { label: 'MI•',  freq: 659.25, color: '#2effd5' }, // 6 — E5
  { label: 'FA•',  freq: 698.46, color: '#3c9cff' }, // 7 — F5
  { label: 'SOL•', freq: 783.99, color: '#7a5cff' }, // 8 — G5
  { label: 'LA•',  freq: 880.00, color: '#c45cff' }, // 9 — A5
];

// La mélodie à reconstituer = thème de Super Mario Bros (~20 notes).
//  MI MI MI DO MI SOL (sol grave) | DO SOL(g) MI LA SI LA♯ LA SOL(g) | MI SOL LA FA SOL
export const MELODY = [
  6, 6, 6, 5, 6, 8, 1,
  5, 1, 0, 2, 4, 3, 2, 1,
  6, 8, 9, 7, 8,
];

// --- Piano réparti : chaque téléphone affiche un DEMI-OCTAVE (6 demi-tons) ---
//  Alignés côte à côte, les téléphones forment un grand clavier continu.
//  2 téléphones = 1 octave ; 4 téléphones = 2 octaves.
export const PIANO_KEYS_PER_PHONE = 6;   // un demi-octave = 6 demi-tons (réf. historique)
export const PIANO_BASE_MIDI = 60;       // DO4 (C4) = première touche à gauche
const PIANO_NAMES = ['DO', 'DO♯', 'RE', 'RE♯', 'MI', 'FA', 'FA♯', 'SOL', 'SOL♯', 'LA', 'LA♯', 'SI'];
const PIANO_WHITE_PC = new Set([0, 2, 4, 5, 7, 9, 11]); // touches blanches
// Mélodie par défaut : thème SUPER MARIO BROS (overworld), section A complète,
//  ramenée sur UNE octave (offsets en demi-tons depuis DO4).
//  MI MI MI DO MI SOL | DO SOL MI LA SI LA♯ LA | SOL MI SOL LA FA SOL | MI DO RE SI
export const PIANO_MELODY = [
  4, 4, 4, 0, 4, 7,
  0, 7, 4, 9, 11, 10, 9,
  7, 4, 7, 9, 5, 7,
  4, 0, 2, 11,
];
// Rythme de la mélodie, en croches, aligné note à note sur PIANO_MELODY
//  (1 = croche, 2 = noire, 3 = noire pointée). Donne le « groove » Mario.
export const PIANO_BEAT = 0.28; // durée d'une croche (s)
export const PIANO_RHYTHM = [
  1, 2, 2, 1, 1, 2,
  2, 1, 2, 1, 1, 1, 2,
  2, 1, 2, 1, 1, 2,
  2, 1, 1, 3,
];

// Construit la séquence de démo {off, freq, name, dur(s)} jouée par la borne et
// surlignée sur les téléphones. La durée de chaque note suit le rythme de Mario.
export function pianoDemoSeq(melody, baseMidi = PIANO_BASE_MIDI, rhythm = PIANO_RHYTHM) {
  return melody.map((off, i) => {
    const n = pianoNoteInfo(off, baseMidi);
    const beats = rhythm && rhythm[i] ? rhythm[i] : 1;
    return { off, freq: n.freq, name: n.name, dur: +(beats * PIANO_BEAT).toFixed(3) };
  });
}

// Répartition des touches entre les N téléphones connectés.
//  Objectif : chaque joueur possède une plage CONTIGUË et y a AU MOINS une note
//  de la séquence à jouer. On part des notes distinctes de la mélodie, on les
//  découpe en N groupes contigus, puis on étend chaque groupe en une plage de
//  touches (notes leurres comprises). Les téléphones alignés forment un clavier
//  continu de DO4 à la dernière note utilisée.
//  → renvoie [{ lo, hi }] (offsets absolus inclusifs), un par téléphone.
export function pianoKeyLayout(n, melody = PIANO_MELODY) {
  const distinct = [...new Set(melody)].sort((a, b) => a - b);
  const maxOff = distinct[distinct.length - 1];
  const M = distinct.length;
  if (n <= 1) return [{ lo: 0, hi: maxOff }];
  const K = Math.min(n, M); // nb de téléphones pouvant recevoir une note distincte
  const groups = [];
  for (let g = 0; g < K; g++) {
    groups.push(distinct.slice(Math.floor((g * M) / K), Math.floor(((g + 1) * M) / K)));
  }
  const segs = [];
  for (let g = 0; g < K; g++) {
    const lo = g === 0 ? 0 : segs[g - 1].hi + 1;
    const hi = g === K - 1 ? maxOff : groups[g + 1][0] - 1;
    segs.push({ lo, hi });
  }
  // Surnuméraires (plus de joueurs que de notes distinctes) : ils partagent le
  // dernier segment et peuvent donc aider sur la même note.
  const layout = [];
  for (let i = 0; i < n; i++) layout.push(segs[Math.min(i, K - 1)]);
  return layout;
}

// Infos d'une touche à partir de son offset ABSOLU sur le clavier réparti.
export function pianoNoteInfo(offset, baseMidi = PIANO_BASE_MIDI) {
  const midi = baseMidi + offset;
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1; // convention MIDI : 60 = DO4
  return {
    midi, pc, octave,
    name: PIANO_NAMES[pc],
    label: PIANO_NAMES[pc] + octave, // ex. « DO4 »
    white: PIANO_WHITE_PC.has(pc),
    freq: 440 * Math.pow(2, (midi - 69) / 12),
  };
}

// --- Mosaïque de téléphones : mot révélé quand les écrans sont alignés ---
//  La 1ʳᵉ manche est toujours KONAMI. Les suivantes piochent un titre/héros de
//  jeu vidéo connu, de longueur adaptée au nombre de joueurs (≥ 2 lettres par
//  téléphone). Pas d'espaces : on ne coupe jamais au milieu d'une lettre.
export const MOSAIC_DEFAULT_WORD = 'KONAMI';

export const MOSAIC_WORDS = [
  'TETRIS', 'PACMAN', 'BOWSER', 'GALAGA', 'CONTRA', 'TEKKEN',           // 6
  'PIKACHU', 'METROID', 'STARFOX', 'MEGAMAN', 'FROGGER', 'PINBALL',     // 7
  'GAUNTLET', 'ARKANOID', 'NINTENDO',                                   // 8
  'CENTIPEDE', 'ASTEROIDS', 'GOLDENEYE',                                // 9
  'DONKEYKONG', 'EARTHBOUND',                                           // 10
  'CASTLEVANIA',                                                        // 11
  'FINALFANTASY', 'MORTALKOMBAT', 'RESIDENTEVIL', 'DOUBLEDRAGON', 'SECRETOFMANA', // 12
  'STREETFIGHTER', 'SPACEINVADERS', 'CHRONOTRIGGER', 'PRINCEOFPERSIA',  // 13
  'SUPERMARIOBROS', 'METALGEARSOLID', 'ASSASSINSCREED', 'ANIMALCROSSING', 'GRANDTHEFTAUTO', 'CRASHBANDICOOT', // 14
  'THELEGENDOFZELDA', 'SONICTHEHEDGEHOG',                               // 16
];

// Choisit un mot dont la longueur tient dans [2n, 3n] (≥ 2 lettres par joueur).
// À défaut, le mot dont la longueur est la plus proche de 2,5·n.
export function pickMosaicWord(n, rng = Math.random) {
  const lo = 2 * n, hi = 3 * n;
  const fit = MOSAIC_WORDS.filter((w) => w.length >= lo && w.length <= hi);
  if (fit.length) return fit[Math.floor(rng() * fit.length)];
  const target = 2.5 * n;
  return [...MOSAIC_WORDS].sort((a, b) => Math.abs(a.length - target) - Math.abs(b.length - target))[0];
}
