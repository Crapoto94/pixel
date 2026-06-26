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

  // 🎬 Ambiance sonore SPÉCIFIQUE pendant le BRIEFING (remplace l'ambiance ci-dessus
  //    le temps du briefing, puis l'ambiance normale reprend). Vidéo unique en boucle.
  //    Laisse vide ('') pour garder l'ambiance normale pendant le briefing.
  briefingYoutube: 'https://www.youtube.com/watch?v=lDNGlG71AR8',

  // 🕵️ Ambiance sonore SPÉCIFIQUE pendant L'ENQUÊTE (remplace l'ambiance le temps de
  //    l'enquête, puis l'ambiance normale reprend). Vidéo unique en boucle.
  //    Laisse vide ('') pour garder l'ambiance normale pendant l'enquête.
  enqueteYoutube: 'https://www.youtube.com/watch?v=b0bRw1faiws',

  // 🔓 Musique jouée pendant le débrief et l'attente de la vidéo d'anniversaire.
  debriefYoutube: 'https://www.youtube.com/watch?v=2kbf_Y6taTI',

  // 🎉 Vidéo de FÊTE que le GAME MASTER (Vincent) peut lancer au Monde 4.
  feteYoutube: 'https://www.youtube.com/watch?v=7kyY29BHTZs',

  // 🎬 Vidéo spéciale jouée UNIQUEMENT sur la borne à la fin de l'enquête (post-débrief).
  enqueteFinaleVideo: 'https://www.youtube.com/watch?v=6EEGmdH9Vu0',

  // 🎸 Blind-tests : une playlist YouTube par THÈME (jouées sur la BORNE, shuffle).
  //    Mets soit l'ID de playlist (PL…), soit l'URL complète : on en extrait l'ID.
  //    Laisse '' pour désactiver un thème.
  blindtestPlaylists: {
    rock:     'PLOds7NNqmx4n1SA599PbsgB3UIez9zRXK',                              // 🎸 Rock
    francais: 'https://www.youtube.com/watch?v=Q3Kvu6Kgp88&list=PL4N9oNbOHXBUqAU7etRfVkj8vtznT5Rf2', // 🎤 Chansons françaises
    dessins:  'https://www.youtube.com/watch?v=0WkSpUiOc00&list=PLjYX5fdqGi9ldXrOo8nLlw6NEs3iQamNo', // 📺 Dessins animés
    annees83: 'https://www.youtube.com/watch?v=qeMFqkcPYcg&list=PLDintB9nu_R7TcqqnLx2zeMQD0XDTECF6', // 🕺 Blind-test 83
  },

  // 🟡 Musique jouée pendant le mini-jeu PAC-MAN (vidéo unique, en boucle).
  pacmanYoutube: 'https://www.youtube.com/watch?v=OCsJ6nevK-A&t=10s',
};

// ---------------------------------------------------------------------
//  LES JOUEURS
//  - token : identifiant secret dans l'URL perso /j/<token> (QR code).
//    Garde-les difficiles à deviner. Régénère-les avec `npm run qr`.
//  - avatar : doit correspondre à une clé de data/avatars.
//  - isHero : Vincent uniquement (déclenche le twist du Monde 4).
// ---------------------------------------------------------------------
export const PLAYERS = [
  {
    id: 'vincent',
    name: 'Vincent',
    avatar: 'player_one',
    token: 'PXL-VNCT-7777',
    isHero: true,
  },
  {
    id: 'willy',
    name: 'Willy',
    avatar: 'wilsonik',
    token: 'PXL-WLLY-2310',
  },
  {
    id: 'stephane',
    name: 'Stéphane',
    avatar: 'riu',
    token: 'PXL-STPH-6660',
  },
  {
    id: 'jessica',
    name: 'Jessica',
    avatar: 'zilda',
    token: 'PXL-JSSC-2199',
  },
  {
    id: 'marie-anne',
    name: 'Marie-Anne',
    avatar: 'super_mariano',
    token: 'PXL-MRNN-1985',
  },
  {
    id: 'marc',
    name: 'Marc',
    avatar: 'lara_croute',
    token: 'PXL-MARC-0001',
    isHost: true,
  },
  {
    id: 'lorenzo',
    name: 'Lorenzo',
    avatar: 'lorenzo_auditore',
    token: 'PXL-LRNZ-7000',
  },
];

// Les enfants — PNJ sans smartphone (pas de page perso, juste mentionnés)
export const NPCS = [
  { id: 'robin', name: 'Robin', role: 'Pixel Messager' },
  { id: 'juliette', name: 'Juliette', role: 'Pixel Messager' },
];
