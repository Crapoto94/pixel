// =====================================================================
//  PIXEL PANIC — Configuration de la partie
//  Modifie ce fichier pour adapter les joueurs, l'URL et les options.
// =====================================================================

export const CONFIG = {
  // Nom de domaine public servi par le reverse-proxy (cf. docs/DEPLOIEMENT-PROXMOX.md)
  publicUrl: 'https://pixel.fbc.fr',

  // Port d'écoute du serveur Node
  port: 8080,

  // Mot de passe d'accès à la page Game Master /gm.
  //  Laisser vide ('') = AUCUN mot de passe (accès direct).
  gmPassword: '',

  // Heure « limite » fictive affichée sur la borne (compte à rebours narratif)
  deadlineLabel: 'MINUIT',

  // 🎵 Musique d'ambiance de la BORNE (lecture auto en boucle, son seul).
  //    Colle ici un lien YouTube : une vidéo OU une playlist "video game music".
  //    Exemples acceptés :
  //      'https://www.youtube.com/watch?v=XXXXXXXXXXX'
  //      'https://youtu.be/XXXXXXXXXXX'
  //      'https://www.youtube.com/playlist?list=PLxxxxxxxx'   (recommandé : un long mix)
  //    Laisse vide ('') pour aucune ambiance.
  ambianceYoutube: 'https://www.youtube.com/watch?v=hUC9VCLH2xA&list=PL7Hq91kaxf0CHdrNHKvXfxCHhw2vhoPWV',

  // 🎸 Playlist blind-test CLASSIC ROCK (jouée sur la BORNE pendant le blind-test, shuffle).
  //    L'ID de playlist seul suffit (ou laisser vide '').
  blindtestPlaylist: 'RDCLAK5uy_nZiG9ehz_MQoWQxY5yElsLHCcG0tv9PRg',
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
    avatar: 'wilsonik',
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
    avatar: 'super_mariano',
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
