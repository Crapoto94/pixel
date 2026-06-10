// =====================================================================
//  PIXEL PANIC — Configuration de la partie
//  Modifie ce fichier pour adapter les joueurs, l'URL et les options.
// =====================================================================

export const CONFIG = {
  // Nom de domaine public servi par le reverse-proxy (cf. docs/DEPLOIEMENT-PROXMOX.md)
  publicUrl: 'https://pixel.fbc.fr',

  // Port d'écoute du serveur Node
  port: 8080,

  // Mot de passe d'accès à la page Game Master /gm (à changer !)
  gmPassword: 'marc-borne-2026',

  // Heure « limite » fictive affichée sur la borne (compte à rebours narratif)
  deadlineLabel: 'MINUIT',
};

// ---------------------------------------------------------------------
//  LES JOUEURS
//  - token : identifiant secret dans l'URL perso /j/<token> (QR code).
//    Garde-les difficiles à deviner. Régénère-les avec `npm run qr`.
//  - avatar : doit correspondre à une clé de data/avatars.
//  - glitchEligible : false pour Marc (hôte) et Vincent (héros).
//  - isHero : Vincent uniquement (déclenche le twist du Monde 4).
// ---------------------------------------------------------------------
export const PLAYERS = [
  {
    id: 'vincent',
    name: 'Vincent',
    avatar: 'player_one',
    token: 'PXL-VNCT-7777',
    glitchEligible: false,
    isHero: true,
  },
  {
    id: 'willy',
    name: 'Willy',
    avatar: 'sanique',
    token: 'PXL-WLLY-2310',
    glitchEligible: true,
  },
  {
    id: 'stephane',
    name: 'Stéphane',
    avatar: 'riu',
    token: 'PXL-STPH-6660',
    glitchEligible: true,
  },
  {
    id: 'jessica',
    name: 'Jessica',
    avatar: 'zilda',
    token: 'PXL-JSSC-2199',
    glitchEligible: true,
  },
  {
    id: 'marie-anne',
    name: 'Marie-Anne',
    avatar: 'super_marino',
    token: 'PXL-MRNN-1985',
    glitchEligible: true,
  },
  {
    id: 'marc',
    name: 'Marc',
    avatar: 'lara_croute',
    token: 'PXL-MARC-0001',
    glitchEligible: false,
    isHost: true,
  },
  // ---- Slot optionnel : décommente si le papa/maman de Vincent vient ----
  // {
  //   id: 'parent',
  //   name: 'Parent',
  //   avatar: 'glouton',
  //   token: 'PXL-PRNT-0042',
  //   glitchEligible: true,
  // },
];

// Les enfants — PNJ sans smartphone (pas de page perso, juste mentionnés)
export const NPCS = [
  { id: 'robin', name: 'Robin', role: 'Pixel Messager' },
  { id: 'juliette', name: 'Juliette', role: 'Pixel Messager' },
];
