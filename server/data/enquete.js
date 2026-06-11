// =====================================================================
//  L'AFFAIRE DES PARAPHEURS PERDUS — enquête collaborative (Cold Case).
//  Une énigme « escape » en 5 actes, jouable ~1 h, table + smartphones.
//
//  ⚠️  FICTION. Le décor (lieux, l'affaire Bygmalion/Idéepôle) s'appuie sur
//  des faits PUBLICS et réels survenus à Saint-Maur-des-Fossés, mais le
//  meurtre, la victime, le DGS « Erzen » et les suspects (prénoms des
//  invités de la soirée) sont entièrement INVENTÉS pour le jeu.
//
//  Déroulé : la BORNE affiche un « mur d'enquête » (articles, organigramme,
//  scène de crime) + un indice/énigme par acte. Chaque joueur reçoit sur son
//  téléphone des PIÈCES À CONVICTION (fragments). En les recoupant à voix
//  haute, la table déduit un CODE. Le bon code débloque l'acte suivant et
//  révèle un nouveau morceau de vérité sur le mur.
//
//  Chaîne de résolution :
//   ACTE 1 — QUAND ?  → l'année où la fraude s'arrête .............. 2013
//   ACTE 2 — QUI COUVRAIT ? → le DGS qui falsifiait les bons ....... ERZEN
//   ACTE 3 — QUI A TUÉ ? → le seul DSI sans alibi ............... GUILLAUME
//   ACTE 4 — COMBIEN ? → 50 bons falsifiés = 50 verres brisés ........ 50
//   ACTE 5 — POURQUOI ? → l'objet retrouvé dans la poubelle .... PARAPHEUR
// =====================================================================

export const ENQUETE = {
  title: "DOSSIER 94100 — L'AFFAIRE DES PARAPHEURS PERDUS",
  pitch:
    "Saint-Maur-des-Fossés. La directrice des finances de la mairie, Solène Vasseur, " +
    "est retrouvée morte dans la salle des mariages de l'Hôtel de Ville, entourée de " +
    "50 verres de champagne brisés. Pas d'effraction. Pas de cri. Juste un toast funèbre. " +
    "À vous de remonter le fil — des marchés publics truqués jusqu'à un parapheur oublié " +
    "dans une poubelle de la ville.",

  acts: [
    // ---------------------------------------------------------------
    {
      num: 1,
      key: 'a1',
      title: 'LE TOAST BRISÉ',
      place: "Hôtel de Ville de Saint-Maur — salle des mariages",
      article: {
        source: "ARCHIVES PRESSE — faits réels",
        date: "2014",
        body:
          "En juin 2014, la Brigade de répression de la délinquance économique " +
          "perquisitionne l'Hôtel de Ville de Saint-Maur-des-Fossés. En cause : un " +
          "marché de communication confié à l'agence Idéepôle, filiale de Bygmalion, " +
          "courant de décembre 2009 à juin 20██. Le parquet de Créteil soupçonne un " +
          "système de fausses factures. Préjudice estimé : 2██ 000 € d'argent public.",
      },
      scene:
        "Sur la table de la défunte : une coupe de champagne encore pleine, et 50 autres " +
        "réduites en miettes. À côté, une facture à demi brûlée au nom d'« IDÉEPÔLE ». " +
        "La directrice fêtait quelque chose. Pas un anniversaire : la fin tranquille d'une " +
        "affaire que tout le monde croyait enterrée.",
      riddle:
        "Le marché truqué s'est arrêté net. Recoupez vos pièces : en quelle ANNÉE " +
        "a été émise la toute dernière fausse facture ? (4 chiffres)",
      answer: '2013',
      hints: [
        "La perquisition, c'est 2014. La fraude, elle, s'arrête JUSTE avant.",
        "Le marché court « de décembre 2009 à juin 20██ ». Une pièce de conviction donne l'année manquante.",
        "Réponse : 2013.",
      ],
      reveal:
        "ACTE 1 — La dernière fausse facture date de JUIN 2013. La directrice des finances " +
        "validait les paiements. Mais une signature revenait AU-DESSUS de la sienne : celle " +
        "du Directeur Général des Services. Initiales relevées sur les bons : « M. E. »",
      fragments: [
        { label: "Pièce A1 — scellé n°1", text: "Dernière facture Idéepôle retrouvée : datée de JUIN 2013." },
        { label: "Pièce A2 — note du parquet", text: "Enquête ouverte par le parquet de CRÉTEIL. Préjudice : 215 000 €." },
        { label: "Pièce A3 — PV de perquisition", text: "Perquisition à l'Hôtel de Ville en JUIN 2014 (un an APRÈS la dernière facture)." },
        { label: "Pièce A4 — facture brûlée", text: "Agence : IDÉEPÔLE, filiale de Bygmalion. Marché de communication." },
        { label: "Pièce A5 — détail compta", text: "Les fausses factures s'échelonnent de DÉC. 2009 jusqu'à l'arrêt brutal du robinet." },
      ],
    },

    // ---------------------------------------------------------------
    {
      num: 2,
      key: 'a2',
      title: 'LE DGS QUI RÉÉCRIVAIT',
      place: "Direction Générale des Services — 2ᵉ étage",
      article: {
        source: "ORGANIGRAMME INTERNE — caviardé",
        date: "—",
        body:
          "MAIRE › DIRECTEUR GÉNÉRAL DES SERVICES (M. E████) › Direction des Finances " +
          "(Solène VASSEUR) · Direction des Systèmes d'Information (DSI) · Services techniques. " +
          "Mention manuscrite en marge : « les bons de commande étaient RÉÉCRITS après " +
          "signature des services ».",
      },
      scene:
        "La mécanique se dessine : un agent rédige un bon de commande honnête ; le DGS le " +
        "récupère, GONFLE les montants, et la directrice des finances le paie sans broncher. " +
        "Le DGS a un nom. Il est presque effacé sur l'organigramme. Recollez-le.",
      riddle:
        "Recomposez le NOM de famille du DGS qui falsifiait les bons (celui qui couvrait " +
        "la directrice). 5 lettres.",
      answer: 'ERZEN',
      hints: [
        "Ses initiales sur les bons : « M. E. ». Le M, c'est son prénom : Mathieu.",
        "L'annuaire interne (une pièce de conviction) donne le nom complet.",
        "Réponse : ERZEN.",
      ],
      reveal:
        "ACTE 2 — Le DGS, Mathieu ERZEN, réécrivait les montants après coup ; la directrice " +
        "Vasseur validait ses faux. Deux complices, donc. Mais les bons de commande, à " +
        "l'origine, étaient RÉDIGÉS plus bas dans la hiérarchie — par un Directeur des " +
        "Systèmes d'Information. Or, en dix ans, la mairie en a connu QUATRE…",
      fragments: [
        { label: "Pièce B1 — annuaire interne", text: "DGS de la mairie (2010–2016) : Mathieu ERZEN. Bureau au 2ᵉ étage." },
        { label: "Pièce B2 — graphologie", text: "Sur les bons, les montants gonflés sont d'une AUTRE main que celle qui les a rédigés." },
        { label: "Pièce B3 — témoignage compta", text: "« C'est ERZEN qui rapportait les bons corrigés. Mme Vasseur signait les yeux fermés. »" },
        { label: "Pièce B4 — leurre", text: "Un certain M. EVANO a travaillé à l'accueil. Aucun lien avec les finances. (fausse piste)" },
        { label: "Pièce B5 — post-it retrouvé", text: "« E-R-Z-E-N. Penser à détruire le double. » — écriture d'Erzen." },
      ],
    },

    // ---------------------------------------------------------------
    {
      num: 3,
      key: 'a3',
      title: 'LES QUATRE DSI (ET L\'ADJOINT)',
      place: "Boucle de la Marne — Saint-Maur, nuit du crime",
      article: {
        source: "FICHE SUSPECTS — service enquête",
        date: "Nuit du crime",
        body:
          "Cinq personnes avaient un mobile contre la directrice. Quatre anciens DSI — " +
          "BLAISE, GUILLAUME, MARC, DJALAL — et l'adjoint VINCENT, « celui qui a les dents " +
          "qui rayent le parquet », qui convoitait ouvertement le pouvoir. Un seul n'a PAS " +
          "d'alibi pour la nuit du crime.",
      },
      scene:
        "Le tueur connaissait le code du local d'archives où dormaient les vieux parapheurs : " +
        "forcément un ancien DSI. Croisez vos alibis (chacun en détient un) et éliminez. " +
        "Il n'en restera qu'un.",
      riddle:
        "Après élimination : qui est le SEUL suspect sans alibi, ancien DSI, badge d'archives " +
        "encore actif ? (son prénom)",
      answer: 'GUILLAUME',
      hints: [
        "L'adjoint Vincent est un mobile parfait… mais il était filmé sur les marchés de Noël. Trop voyant pour être coupable.",
        "Blaise (retraité à La Rochelle), Marc (au Théâtre de Saint-Maur), Djalal (muté à l'étranger) : tous couverts.",
        "Réponse : GUILLAUME.",
      ],
      reveal:
        "ACTE 3 — GUILLAUME. Ancien DSI, parti sans bruit après le « ménage » dans les " +
        "archives. Pas d'alibi, badge toujours actif. C'est LUI. Reste l'essentiel : pourquoi " +
        "un homme discret réduit-il 50 verres en miettes autour d'un corps ?",
      fragments: [
        { label: "Alibi — BLAISE", text: "BLAISE : retraité à La Rochelle depuis 2019. À 450 km de Saint-Maur la nuit du crime. ✅ hors de cause." },
        { label: "Alibi — MARC", text: "MARC : animait une soirée au Théâtre de Saint-Maur. 200 témoins. ✅ hors de cause." },
        { label: "Alibi — DJALAL", text: "DJALAL : muté à la DSI d'une ville étrangère, à l'étranger ce soir-là. ✅ hors de cause." },
        { label: "Suspect — VINCENT (adjoint)", text: "VINCENT « les dents qui rayent le parquet » : voulait le poste. MAIS filmé toute la soirée sur les marchés de Noël (La Varenne, Adamville). Mobile énorme, alibi béton. 🟠 fausse piste idéale." },
        { label: "Faille — GUILLAUME", text: "GUILLAUME : ancien DSI parti discrètement. AUCUN alibi. Badge du local d'archives JAMAIS désactivé. 🔴" },
        { label: "Recoupement", text: "Le tueur a ouvert le local d'archives sans effraction → il connaissait le code → un ancien DSI." },
      ],
    },

    // ---------------------------------------------------------------
    {
      num: 4,
      key: 'a4',
      title: 'CINQUANTE BONS, CINQUANTE VERRES',
      place: "Quartier de La Varenne — bennes, rue Saint-Hilaire",
      article: {
        source: "CARNET DE GUILLAUME — saisi",
        date: "—",
        body:
          "« Je l'ai retrouvé dans une benne, près du marché de la rue Saint-Hilaire. Un " +
          "vieux parapheur jeté avec les encombrants. Dedans, MES bons de commande — ceux " +
          "que J'AVAIS rédigés. Sauf que les montants n'étaient plus les miens. On s'est " +
          "servi de ma signature pour couvrir leurs vols. Bon après bon. Je les ai comptés. »",
      },
      scene:
        "Guillaume a gardé chaque bon falsifié à son nom. Chacun de vous tient une liasse. " +
        "Additionnez-les TOUS. Le total dira combien de fois sa signature a été salie — et " +
        "pourquoi il y avait exactement ce nombre de verres brisés autour du corps.",
      riddle:
        "Faites la SOMME de toutes les liasses de bons falsifiés détenues par la table. " +
        "Combien de bons au total ?",
      answer: '50',
      hints: [
        "Chaque joueur a une liasse (12, 9, 11, 8, 10…). Additionnez-les toutes.",
        "Le total est rond. Et il correspond EXACTEMENT au nombre de verres brisés.",
        "Réponse : 50.",
      ],
      reveal:
        "ACTE 4 — 50 bons de commande falsifiés à la signature de Guillaume. 50 trahisons. " +
        "50 verres brisés autour de la directrice : un éclat pour chaque bon qu'on a maquillé " +
        "en son nom. Le compte est un message. Reste à nommer l'objet qui a tout déclenché.",
      fragments: [
        { label: "Liasse A", text: "Tu détiens une liasse de 12 bons de commande falsifiés." },
        { label: "Liasse B", text: "Tu détiens une liasse de 9 bons de commande falsifiés." },
        { label: "Liasse C", text: "Tu détiens une liasse de 11 bons de commande falsifiés." },
        { label: "Liasse D", text: "Tu détiens une liasse de 8 bons de commande falsifiés." },
        { label: "Liasse E", text: "Tu détiens une liasse de 10 bons de commande falsifiés." },
        { label: "Indice scène", text: "Le légiste a compté les éclats : exactement autant de verres brisés que de bons falsifiés." },
      ],
    },

    // ---------------------------------------------------------------
    {
      num: 5,
      key: 'a5',
      title: 'LE PARAPHEUR DE LA VENGEANCE',
      place: "Villa Médicis (La Varenne) — réveillon de la mairie",
      article: {
        source: "RECONSTITUTION — service enquête",
        date: "Soir du crime",
        body:
          "Guillaume confronte la directrice au réveillon donné à la Villa Médicis. Il pose " +
          "sur la table l'OBJET retrouvé dans la benne : le classeur à signature contenant " +
          "ses bons falsifiés. Il exige des aveux. Elle ricane, lève sa coupe. Alors, un par " +
          "un, il brise les verres — un pour chaque bon. Cinquante.",
      },
      scene:
        "Vous tenez le coupable (Guillaume), les complices (Erzen + la directrice), le compte " +
        "(50) et la date (2013). Il ne manque qu'un mot : le NOM de l'objet retrouvé dans la " +
        "poubelle, celui qui a transformé un fonctionnaire trahi en justicier. Nommez-le pour " +
        "clore le dossier.",
      riddle:
        "Quel OBJET, oublié dans une poubelle de Saint-Maur, contenait les bons falsifiés et " +
        "a déclenché la vengeance ? (un mot — c'est le mobile)",
      answer: 'PARAPHEUR',
      hints: [
        "C'est un classeur rigide dans lequel on range des documents À SIGNER.",
        "Le titre du dossier en parle au pluriel : « L'affaire des … perdus ».",
        "Réponse : PARAPHEUR.",
      ],
      reveal:
        "DOSSIER CLOS — Le meurtrier est GUILLAUME, ancien DSI. Mobile : la VENGEANCE des " +
        "parapheurs perdus. Il avait retrouvé dans une benne le parapheur contenant les bons " +
        "de commande qu'il avait rédigés, falsifiés par le DGS Mathieu ERZEN avec la " +
        "complicité de la directrice Solène VASSEUR. 50 bons salis, 50 verres brisés. " +
        "L'affaire Idéepôle aura fait une victime de plus — vingt ans après.",
      fragments: [
        { label: "Définition", text: "Objet de bureau : grand classeur à rabats où l'on présente des documents à signer." },
        { label: "Indice titre", text: "Relis le titre du dossier : « L'affaire des ___________ perdus »." },
        { label: "Témoin éboueur", text: "« J'ai vu un homme fouiller la benne et repartir avec un gros classeur noir sous le bras. »" },
        { label: "Note Guillaume", text: "« Tout est parti de ce classeur dans la poubelle. Sans lui, je n'aurais jamais su. »" },
        { label: "Synthèse", text: "Coupable : Guillaume · Complices : Erzen + Vasseur · Compte : 50 · Année : 2013." },
      ],
    },
  ],

  // Écran final affiché quand les 5 actes sont résolus.
  finale: {
    title: "AFFAIRE RÉSOLUE",
    culprit: "GUILLAUME",
    role: "ancien DSI de la mairie de Saint-Maur-des-Fossés",
    mobile:
      "La vengeance des parapheurs perdus : ses bons de commande, falsifiés par le DGS " +
      "Mathieu Erzen et payés par la directrice Solène Vasseur, retrouvés par hasard dans " +
      "une benne du quartier de La Varenne.",
    disclaimer:
      "Fiction. L'affaire Bygmalion/Idéepôle et les lieux sont réels ; le meurtre, les " +
      "personnages et les suspects sont inventés pour le jeu.",
  },
};
