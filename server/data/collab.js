// =====================================================================
//  Énigmes collaboratives — données.
// =====================================================================

// --- Séquence musicale : palette de notes (chacune attribuée à un joueur) ---
//  freq = fréquence jouée (Web Audio). La mélodie référence ces index.
export const NOTE_PALETTE = [
  { label: 'DO',  freq: 523.25, color: '#ff2e88' },
  { label: 'RÉ',  freq: 587.33, color: '#ff9a3c' },
  { label: 'MI',  freq: 659.25, color: '#ffe600' },
  { label: 'FA',  freq: 698.46, color: '#38ff9c' }, // souvent en leurre
  { label: 'SOL', freq: 783.99, color: '#2effd5' },
  { label: 'LA',  freq: 880.00, color: '#7a5cff' },
];

// La mélodie à reconstituer (index dans NOTE_PALETTE).
//  MI SOL LA SOL MI DO RÉ MI  (jingle d'arcade mystère)
export const MELODY = [2, 4, 5, 4, 2, 0, 1, 2];

// --- Mosaïque de téléphones : mot révélé quand les écrans sont alignés ---
export const MOSAIC_DEFAULT_WORD = 'KONAMI';
