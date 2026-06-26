// =====================================================================
//  Briefing affiché sur la BORNE : scénario + attendus par joueur.
// =====================================================================

export const SCENARIO_SLIDES = [
  { title: 'PIXEL PANIC',
    text: "Une vieille borne d'arcade maudite a fusionné avec la réalité. Le monde est devenu un jeu vidéo… qui plante." },
  { title: "L'ÉLU",
    text: "Le bug a désigné un Avatar Légendaire : VINCENT. Tant que le jeu n'est pas terminé, personne ne peut se déconnecter." },
  { title: 'VOTRE MISSION',
    text: "6 MONDES, des énigmes, des défis et une GRANDE ENQUÊTE à élucider. Aidez Vincent à atteindre le BOSS FINAL avant minuit." },
  { title: 'AU PROGRAMME',
    text: "Une GROSSE ENQUÊTE à résoudre tous ensemble (~1 h, comme un escape game), et PLEIN DE MINI-JEUX d'arcade : Pac-Man, Tetris, blind-test, roue des gages, quiz… De quoi en avoir pour la soirée !" },
  { title: "RÈGLE D'OR",
    text: "Votre téléphone = votre manette. La BORNE = l'écran commun. Restez groupés, communiquez, amusez-vous." },
  { title: '📸 DÉFIS PHOTO',
    text: "Tout au long de la soirée, ton téléphone te donne 3 MISSIONS PHOTO secrètes (rubrique « Défis photo »). Réalise-les quand tu veux et envoie tes clichés depuis l'appli. En fin de soirée, GRAND VOTE : la plus BELLE 🏆 et la plus RIGOLOTE 😂 photo !" },
  { title: '⏱️ EN PARALLÈLE',
    text: "Entre les énigmes et les mini-jeux, gardez l'œil ouvert : faites vos défis photo, consultez votre CARNET SECRET (mission + indice perso) et gardez vos VIES ❤️. Tout compte pour le HIGH SCORE final !" },
  { title: '📱 PLEIN ÉCRAN',
    text: "C'est BIEN MIEUX en PLEIN ÉCRAN ! Sur ton téléphone, passe en plein écran (et garde l'écran allumé). Sur la borne aussi : plein écran obligatoire pour l'immersion." },
];

// Ce qu'on attend de chaque avatar (affiché pendant le briefing)
export const AVATAR_BRIEF = {
  player_one:   "Tu es le héros. Laisse-toi guider… un grand pouvoir t'attend au Monde 4.",
  wilsonik:     "Mise sur la vitesse : sur les défis de rapidité, c'est toi qu'on attend devant.",
  riu:          "Mets l'ambiance rock et lance des duels à qui tu veux.",
  zilda:        "Vise juste — précision et réflexes — et garde ton joker anti-gage.",
  super_mariano: "Cultive les indices « nature » et fais grimper le score de l'équipe.",
  lara_croute:  "Explore : tu reçois les indices cachés que les autres ne voient pas.",
  glouton:      "Ne laisse aucun verre orphelin et gobe les énigmes.",
  lorenzo_auditore: "Avance dans l'ombre : observe, attends le bon moment, puis frappe pour l'équipe.",
};
