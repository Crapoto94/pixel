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
    },
    activite: 'reaction_race',
    gagePool: 'collectif',
    twist:
      "BRAVO ! Vous avez réveillé la BORNE. La réalité peut maintenant s'étendre… " +
      "Prochain colis en approche !",
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
      "Le labyrinthe est vaincu ! Mais l'aventure ne fait que commencer… " +
      "Cap sur le prochain défi !",
  },
  {
    id: 'w3',
    num: 3,
    titre: 'BOSS DE MI-PARCOURS & SABOTAGE',
    colis: 3,
    intro:
      "Mi-parcours. Un mini-boss bloque le passage. « Assemblez les FRAGMENTS. " +
      "Mais attention : tout n'est peut-être pas là… »",
    enigme:
      "Le COLIS 3 contient des pièces de puzzle. Assemblées, elles forment un QR / un code.",
    code: 'PIXEL',
    codeNormalise: 'PIXEL',
    colisContenu: [
      'Des PIÈCES DE PUZZLE qui, assemblées, forment un visuel (ou un QR) révélant le mot-code : PIXEL.',
      'Une carte « cible » pour ZILDA (repère la pièce centrale).',
    ],
    indices: {
      riu: ['Les bords rouges vont ensemble.'],
      zilda: ['La pièce centrale porte une cible.'],
    },
    activite: 'spotlight',
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
    intro:
      "⚡ RÉVÉLATION ⚡ « PLAYER ONE identifié : VINCENT. Tu n'es pas un joueur. " +
      "Tu es le GAME MASTER. Prends le contrôle. »",
    enigme:
      "Vincent reçoit ses POUVOIRS (panneau de contrôle sur son téléphone). " +
      "Première énigme qu'il MÈNE : il doit utiliser un pouvoir pour aider le groupe à avancer.",
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
      "Vincent a éveillé son pouvoir ! L'équipe est plus forte que jamais. " +
      "En route pour l'avant-dernier monde !",
  },
  {
    id: 'w5',
    num: 5,
    titre: 'DOSSIER 94100',
    colis: 5,
    intro:
      "Niveau 5. La BORNE bascule en mode ENQUÊTE. « L'affaire des parapheurs perdus " +
      "attend toujours sa conclusion. Ouvrez les yeux, croisez les pièces, traquez le vrai coupable. »",
    enigme:
      "Une enquête policière en 8 actes. Chaque acte se résout en entrant un code " +
      "sur votre téléphone. Croisez les pièces à conviction, lisez les documents sur la BORNE, " +
      "éliminez les suspects, décodez le message final.",
    code: '',
    codeNormalise: '',
    colisContenu: [
      'Aucun colis physique — l\'enquête se déroule entièrement sur les téléphones + la BORNE.',
    ],
    indices: {
      lara_croute: ['Ouvre l\'enquête sur ton téléphone — tous les indices sont dans les actes.'],
    },
    activite: 'enquete',
    gagePool: 'collectif',
    twist:
      "L'affaire est résolue ! Le verrou du dernier monde se brise. " +
      "Préparez-vous pour le BOSS FINAL !",
  },
  {
    id: 'w6',
    num: 6,
    titre: 'BOSS FINAL — REBOOT REALITY',
    colis: 6,
    isFinale: true,
    intro:
      "BOSS FINAL. La BORNE elle-même est le boss. « Vous ne sortirez jamais d'ici… " +
      "à moins de me REBOOTER. Entrez le CODE KONAMI sur la BORNE pour tout reboot. »",
    enigme:
      "Le Konami Code est la clé du reboot. Chaque joueur a une manette sur son téléphone. " +
      "Appuyez sur les touches dans l'ordre : ↑ ↑ ↓ ↓ ← → ← → B A. La BORNE affiche la progression. " +
      "Si une erreur se glisse, la séquence se réinitialise.",
    code: '',
    codeNormalise: '',
    colisContenu: [
      'Aucun colis — le boss se bat à coup de Konami Code !',
    ],
    indices: {},
    activite: 'boss_final',
    gagePool: 'collectif',
    twist:
      "YOU WIN ! La réalité redémarre. Feu d'artifice 8-bit + classement HIGH SCORE.",
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
