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
