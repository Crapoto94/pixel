// =====================================================================
//  Les 6 MONDES de PIXEL PANIC.
//
//  Chaque monde = une étape narrative pilotée par le serveur :
//   - intro      : texte/cinématique affiché sur la BORNE
//   - colis      : n° d'enveloppe que les Pixels livrent au début du monde
//   - enigme     : énoncé joueur + indices répartis par avatar
//   - code       : LA solution (tapée dans l'appli = "cadenas numérique")
//   - activite   : activité BORNE interactive associée (cf. data/activities.js)
//   - gagePool   : pool de gages que la BORNE peut tirer pour le BONUS STAGE
//   - twist      : rebondissement déclenché à la résolution
//
//  Les codes et indices sont VOLONTAIREMENT éditables : on les affinera
//  ensemble selon ton lieu et ton matériel réel.
// =====================================================================

export const WORLDS = [
  {
    id: 'w1',
    num: 1,
    titre: 'TUTORIEL CORROMPU',
    colis: 1,
    heroOnly: true, // seul le PLAYER ONE (Vincent) peut VALIDER la séquence Konami
    // Vidéo-indice diffusée sur la BORNE quand un joueur demande « un indice ».
    // Clip de 59s sur le code Konami → on le joue en entier (depuis le début).
    hintVideo: { video: 'hIovAaitgsI', start: 0 },
    intro:
      "La BORNE s'allume dans un grésillement. « SYSTÈME CORROMPU. Avatars détectés. " +
      "Pour réveiller la réalité, reconstituez la SÉQUENCE LÉGENDAIRE. »",
    enigme:
      "Chaque joueur a reçu 2 touches de la manette sur son téléphone. " +
      "Mettez-les en commun et reconstituez le célèbre code à 10 entrées.",
    // Le fameux Konami Code. Chaque joueur détient 2 flèches/lettres (cf. indices).
    code: 'HAUT HAUT BAS BAS GAUCHE DROITE GAUCHE DROITE B A',
    codeNormalise: 'HAUTHAUTBASBASGAUCHEDROITEGAUCHEDROITEBA',
    colisContenu: [
      'Une carte « MANETTE » d’arcade (croix ↑ ↓ ← → + boutons A / B) pour visualiser et assembler la séquence.',
      'Une carte-consigne : « Reconstituez la SÉQUENCE LÉGENDAIRE (10 entrées). Seul le PLAYER ONE — Vincent — peut la VALIDER sur la borne. »',
      '(Si pas déjà distribuées à l’accueil) les 6 cartes-avatars + QR de connexion.',
    ],
    indices: {
      wilsonik: ['HAUT', 'HAUT'],
      riu: ['BAS', 'BAS'],
      zilda: ['GAUCHE', 'DROITE'],
      super_mariano: ['GAUCHE', 'DROITE'],
      lara_croute: ['B', 'A'],
      glouton: ['(rien — tu observes)', ''],
      lorenzo_auditore: ['(rien — tu observes)', ''],
    },
    activite: 'reaction_race',
    gagePool: 'collectif',
    twist:
      "Le tutoriel est rétabli. La réalité se recompose pixel par pixel… " +
      "Niveau suivant !",
  },
  {
    id: 'w2',
    num: 2,
    titre: 'LE LABYRINTHE DE GLOUTON',
    colis: 2,
    intro:
      "Niveau 2. Un labyrinthe de pixels s'affiche. « Trouvez le CHEMIN DORÉ. " +
      "L'exploratrice voit ce que les autres ignorent. »",
    enigme:
      "Le COLIS 2 contient un plan de labyrinthe. LARA CROÛTE possède l'indice caché " +
      "(encre UV / carte secrète). Suivez le chemin et lisez le mot/chiffre formé.",
    code: 'GLOUTON',
    codeNormalise: 'GLOUTON',
    colisContenu: [
      'Un PLAN DE LABYRINTHE imprimé (A4) avec des cases numérotées (champignons).',
      'L’indice CACHÉ pour LARA CROÛTE : une carte transparente à superposer (ou écriture à l’encre UV + mini-lampe UV) indiquant le départ « en bas à droite, sous la cerise ».',
      'Le bon chemin doit faire apparaître le mot-code à taper : GLOUTON.',
    ],
    indices: {
      lara_croute: ['Le chemin commence en bas à droite, sous la cerise.'],
      super_mariano: ['Compte les champignons : ils numérotent les cases.'],
    },
    activite: 'blindtest',
    gagePool: 'solo',
    twist:
      "Le labyrinthe s'efface. Une PORTE SONORE se dessine plus loin… " +
      "préparez vos oreilles.",
  },
  {
    id: 'w3',
    num: 3,
    titre: 'LE PIANO GÉANT',
    colis: 3,
    intro:
      "Mi-parcours. Une PORTE SONORE bloque le passage. « Trouvez le MOT DE PASSE " +
      "pour réveiller le grand clavier… »",
    // L'énigme à résoudre pour DÉBLOQUER le piano (devinette « M. et Mme »).
    enigme:
      "Monsieur et Madame ERGEBEL ont un fils. Comment se prénomme-t-il ?",
    pianoWorld: true, // après le mot-code, piano réparti : chaque téléphone a ses touches
    code: 'OCTAVE', // réponse à la devinette → débloque le piano réparti
    codeNormalise: 'OCTAVE',
    colisContenu: [
      'Une carte-énigme : « Monsieur et Madame ERGEBEL ont un fils. Comment se prénomme-t-il ? » (réponse = mot de passe).',
      'Une carte-consigne : « Une fois le piano réveillé, chaque téléphone = un DEMI-CLAVIER. Alignez-les dans l’ordre de la BORNE. »',
      'Une partition simplifiée : MI MI FA SOL… (la BORNE affiche aussi la mélodie note par note).',
    ],
    indices: {
      riu: ['Pense « musique » : ce que couvrent 8 notes blanches d’affilée…'],
      zilda: ['Une fois le piano réveillé, la BORNE indique QUEL téléphone joue la prochaine note.'],
    },
    activite: 'piano',
    gagePool: 'duel',
    twist:
      "La BORNE détecte une ANOMALIE sur le PLAYER ONE : « Pouvoir dormant détecté… » " +
      "Un compte à rebours mystérieux démarre sur Vincent.",
  },
  {
    id: 'w4',
    num: 4,
    titre: 'LE RÉVEIL DU PLAYER ONE',
    colis: 4,
    isTwist: true,
    // Monde « Game Master » : le mot-code GAMEMASTER ne valide PAS le monde —
    // il RÉVEILLE les pouvoirs de Vincent. Pour passer au Monde 5, Vincent doit
    // accomplir toutes ses MISSIONS (cf. heroQuest dans state.js) puis valider.
    heroWorld: true,
    intro:
      "⚡ RÉVÉLATION ⚡ « PLAYER ONE identifié : VINCENT. Tu n'es pas un joueur. " +
      "Tu es le GAME MASTER. Prends le contrôle. »",
    enigme:
      "Vincent reçoit ses POUVOIRS (panneau de contrôle sur son téléphone). " +
      "Pour ouvrir le monde suivant, il doit ANIMER la soirée : lancer une vidéo de fête, " +
      "un blind-test, un quiz, une roue, tous les jeux (Tetris, Pac-Man, Dessine, Pong) et une anecdote.",
    code: 'GAMEMASTER',
    codeNormalise: 'GAMEMASTER',
    colisContenu: [
      'La CARTE DORÉE « PLAYER ONE / GAME MASTER » remise à VINCENT (déclenche ses pouvoirs).',
      'Une carte-consigne expliquant le pouvoir « INDICE » (révéler une lettre/aide aux autres).',
      'Le mot-code GAMEMASTER caché (ex. au dos de la carte dorée).',
    ],
    indices: {
      player_one: ["Utilise ton pouvoir 'INDICE' pour révéler la lettre manquante aux autres."],
    },
    activite: 'roue_des_gages',
    gagePool: 'vincent',
    twist:
      "Les pouvoirs du Game Master sont pleinement actifs. " +
      "Vincent prend les commandes de la soirée !",
  },
  {
    id: 'w5',
    num: 5,
    titre: 'LA GRANDE ENQUÊTE',
    colis: 5,
    // Monde « enquête » : la GRANDE ENQUÊTE se lance automatiquement à l'entrée.
    // C'est sa RÉSOLUTION (tous les actes élucidés) qui ouvre le Monde 6 —
    // il n'y a pas de code de monde à taper.
    enqueteWorld: true,
    intro:
      "Niveau 5. Un dossier clignote sur la BORNE. « Pour ouvrir la dernière porte, " +
      "résolvez LA GRANDE ENQUÊTE — acte après acte. »",
    enigme:
      "Menez l'enquête ensemble : chacun détient des pièces à conviction. Recoupez-les, " +
      "résolvez chaque ACTE en tapant le bon code sur un téléphone. L'enquête complète ouvre la suite.",
    colisContenu: [
      "Le DOSSIER D'ENQUÊTE : les pièces à conviction à répartir entre les joueurs.",
      "Une carte-consigne : « Résolvez chaque ACTE en tapant le bon code sur un téléphone. »",
      "Tout se joue sur la BORNE : suivez les actes dans l'ordre jusqu'au dénouement.",
    ],
    indices: {
      lara_croute: ['Recoupe bien chaque pièce à conviction : tout finit par se relier.'],
    },
    activite: 'enquete',
    gagePool: 'collectif',
    twist:
      "Dernier acte élucidé ! L'affaire est close… mais la BORNE garde un ultime secret. " +
      "Direction le BOSS FINAL.",
  },
  {
    id: 'w6',
    num: 6,
    titre: 'BOSS FINAL — REBOOT REALITY',
    colis: 6,
    isFinale: true,
    // --- Monde 6 spécial : porte « Konami collectif » puis commande en LEET ---
    // 1) TOUS les joueurs doivent saisir la SÉQUENCE LÉGENDAIRE (Konami) sur leur
    //    propre manette (« un pour tous et tous pour un »).
    // 2) La porte ouverte, ils tapent la COMMANDE de redémarrage : REBOOT en LEET.
    konamiGate: true,
    konamiNormalise: 'HAUTHAUTBASBASGAUCHEDROITEGAUCHEDROITEBA',
    nearMiss: 'REBOOT', // mot « presque » : on guide alors vers le LEET
    nearMissMsg: 'Presque… mais il faut la saisir en LEET 🔢',
    intro:
      "BOSS FINAL. La BORNE elle-même est le boss. « Vous ne sortirez jamais d'ici… " +
      "à moins de me REBOOTER. Mais d'abord : prouvez que vous êtes LA TEAM. »",
    enigme:
      "Affrontement final contre la BORNE. À vous de trouver comment forcer le système… " +
      "puis quelle COMMANDE lui rendra la raison.",
    code: 'R38007', // REBOOT en leet-speak (R-3-B-0-0-7)
    codeNormalise: 'R38007',
    colisContenu: [
      'Une carte « MANETTE » d’arcade par joueur (croix ↑ ↓ ← → + boutons A / B) — chacun rejoue la SÉQUENCE LÉGENDAIRE.',
      'Une carte-consigne : « UN POUR TOUS ET TOUS POUR UN — tout le monde saisit le code ! »',
      'Une carte-indice « LEET » : la commande REBOOT doit être tapée en 1337 (E→3, B→8, O→0, T→7).',
      'Le CADEAU / coffre de Vincent à déverrouiller au moment du « YOU WIN ! ».',
    ],
    indices: {
      player_one: ['La BORNE ne comprend pas le langage des humains… seulement celui des vrais hackers.'],
    },
    activite: 'boss_final',
    gagePool: 'collectif',
    twist:
      "YOU WIN ! La réalité redémarre. Le coffre final / cadeau de Vincent se déverrouille. " +
      "Feu d'artifice 8-bit + classement HIGH SCORE.",
  },
];

export function getWorld(id) {
  return WORLDS.find((w) => w.id === id);
}

// Normalise un code saisi pour comparaison tolérante (espaces/casse/accents).
export function normalize(str) {
  return (str || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}
