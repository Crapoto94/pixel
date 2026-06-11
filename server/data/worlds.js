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
    intro:
      "La BORNE s'allume dans un grésillement. « SYSTÈME CORROMPU. Avatars détectés. " +
      "Pour réveiller la réalité, reconstituez la SÉQUENCE LÉGENDAIRE. »",
    enigme:
      "Chaque joueur a reçu 2 touches de la manette sur son téléphone. " +
      "Mettez-les en commun et reconstituez le célèbre code à 10 entrées.",
    // Le fameux Konami Code. Chaque joueur détient 2 flèches/lettres (cf. indices).
    code: 'HAUT HAUT BAS BAS GAUCHE DROITE GAUCHE DROITE B A',
    codeNormalise: 'HAUTHAUTBASBASGAUCHEDROITEGAUCHEDROITEBA',
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
      "ALERTE : un GLITCH s'est infiltré parmi les avatars. Il sabotera dans l'ombre. " +
      "Méfiance… (le traître vient de recevoir sa première mission).",
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
    indices: {
      lara_croute: ['Le chemin commence en bas à droite, sous la cerise.'],
      super_mariano: ['Compte les champignons : ils numérotent les cases.'],
    },
    activite: 'blindtest',
    gagePool: 'solo',
    twist:
      "Premier VOTE DE SUSPICION : qui vous semble louche ? (aucune élimination, " +
      "juste pour semer le doute). Le sabotage du Glitch a laissé une trace…",
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
      "Le COLIS 3 contient des pièces de puzzle. Assemblées, elles forment un QR / un code. " +
      "Si une pièce manque… c'est que le GLITCH est passé par là.",
    code: 'PIXEL',
    codeNormalise: 'PIXEL',
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
    indices: {
      player_one: ["Utilise ton pouvoir 'INDICE' pour révéler la lettre manquante aux autres."],
    },
    activite: 'roue_des_gages',
    gagePool: 'vincent',
    twist:
      "Le Glitch PANIQUE : le Game Master peut désormais le démasquer. " +
      "Mission de sabotage RISQUÉE confiée au traître.",
  },
  {
    id: 'w5',
    num: 5,
    titre: 'LA CHASSE AU GLITCH',
    colis: 5,
    intro:
      "Niveau 5. « Le GLITCH est parmi vous depuis le début. Rassemblez les PREUVES " +
      "et démasquez-le par un VOTE. »",
    enigme:
      "Chaque joueur a reçu, au fil de la soirée, un fragment de preuve (dans les colis). " +
      "Recoupez-les façon Cluedo, puis VOTEZ sur vos téléphones.",
    code: 'VOTE', // résolu par le vote, pas par un code tapé
    codeNormalise: 'VOTE',
    resoluParVote: true,
    indices: {
      lara_croute: ['Recoupe les heures notées sur les colis 2, 3 et 4.'],
    },
    activite: 'vote_glitch',
    gagePool: 'collectif',
    twist:
      "Démasqué (ou non), le Glitch révèle qu'il a CACHÉ le dernier code quelque part. " +
      "Chasse express avant le boss final !",
  },
  {
    id: 'w6',
    num: 6,
    titre: 'BOSS FINAL — REBOOT REALITY',
    colis: 6,
    isFinale: true,
    intro:
      "BOSS FINAL. La BORNE elle-même est le boss. « Vous ne sortirez jamais d'ici… " +
      "à moins de me REBOOTER. »",
    enigme:
      "Affrontement collectif : enchaînez les QTE (épreuves rapides) affichées sur la BORNE. " +
      "Tous vos pouvoirs et objets servent ici. VINCENT porte le COUP FINAL.",
    code: 'REBOOT',
    codeNormalise: 'REBOOT',
    indices: {
      player_one: ['Quand la barre de vie du boss est à zéro : scanne la CARTE DORÉE sur la BORNE.'],
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
