// =====================================================================
//  L'AFFAIRE DES PARAPHEURS PERDUS — enquête collaborative (Cold Case).
//  Une énigme « escape » en 6 actes, jouable ~1 h, table + smartphones.
//
//  ⚠️  FICTION. Le décor s'appuie sur des FAITS PUBLICS et RÉELS survenus à
//  Saint-Maur-des-Fossés (affaire Bygmalion / Idéepôle, magazine municipal
//  « Saint-Maur Le Mag », monuments de la ville) — sources citées sur la
//  borne. Mais le meurtre, la victime, le DGS « Erzen » et les suspects
//  (prénoms des invités de la soirée) sont entièrement INVENTÉS pour le jeu.
//
//  Mécaniques demandées :
//   • La BORNE affiche de VRAIS articles de presse (titre, source, date, URL) ;
//     les indices sont planqués dans ces bulletins.
//   • Un acte « PLAN DE LA VILLE » : relier des sites publics remarquables dans
//     le bon ordre dessine une LETTRE (G) — la CLÉ d'un acte ultérieur.
//   • Un acte « MESSAGE CODÉ » : la lettre du parcours sert de clé de César
//     pour décoder le mobile.
//
//  Chaîne de résolution :
//   ACTE 1 — REVUE DE PRESSE → l'année où l'affaire éclate ............ 2013
//   ACTE 2 — L'ORGANIGRAMME → le DGS (Frédéric) qui falsifiait ....... ERZEN
//   ACTE 3 — L'AMALGAME DES DEUX FRÉDÉRIC → le chevalier blanc ..... COUPAYE
//   ACTE 4 — LE PLAN DE LA VILLE → le tracé dessine la lettre-clé ........ G
//   ACTE 5 — LES QUATRE DSI → le seul sans alibi ................. GUILLAUME
//   ACTE 6 — CINQUANTE BONS → 50 bons = 50 verres brisés ............... 50
//   ACTE 7 — LE MESSAGE CODÉ (clé = G) → le mobile ............. PARAPHEUR
// =====================================================================

export const ENQUETE = {
  title: "DOSSIER 94100 — L'AFFAIRE DES PARAPHEURS PERDUS",
  pitch:
    "Saint-Maur-des-Fossés. La directrice des finances de la mairie, Solène Vasseur, " +
    "est retrouvée morte dans la salle des mariages de l'Hôtel de Ville, entourée de " +
    "50 verres de champagne brisés. Pas d'effraction. Juste un toast funèbre. À vous de " +
    "remonter le fil — des marchés publics truqués jusqu'à un parapheur oublié dans une " +
    "poubelle de la ville.",

  acts: [
    // ===============================================================
    //  ACTE 1 — REVUE DE PRESSE (vrais articles)
    // ===============================================================
    {
      num: 1,
      key: 'a1',
      kind: 'press',
      title: 'LA REVUE DE PRESSE',
      place: "Hôtel de Ville de Saint-Maur — salle des mariages",
      // Vrais articles / faits publics affichés sur la borne (avec sources & URL)
      sources: [
        {
          source: "Europe 1",
          date: "procès en appel",
          title: "Fausses factures Bygmalion : 3 ans d'inéligibilité pour l'ex-maire de Saint-Maur",
          url: "https://www.europe1.fr/societe/fausses-factures-avec-bygmalion-trois-ans-dineligibilite-pour-lex-ministre-henri-plagnol-3497876",
          summary:
            "L'ancien maire (à la tête de la ville de 2008 à 2014) est condamné pour " +
            "complicité de détournement de fonds publics : 1 an de prison avec sursis, " +
            "3 ans d'inéligibilité, 8 000 € d'amende.",
        },
        {
          source: "Compte-rendu d'audience — parquet de Créteil",
          date: "faits 2009–2013",
          title: "Le marché de communication Idéepôle / Bygmalion",
          url: "https://www.lehelloco.fr/bygmalion-que-sest-il-passe-a-saint-maur/",
          summary:
            "Idéepôle, filiale de Bygmalion, éditait le MAGAZINE municipal et les supports " +
            "de com'. Entre 2009 et 2013, la ville lui paie une soixantaine de factures ; " +
            "6 sont contestées, pour près de 280 000 €. Préjudice réglé à la ville : 230 000 €.",
        },
        {
          source: "Saint-Maur Le Mag — kiosque municipal",
          date: "n° d'archive",
          title: "Le magazine de la ville (48 p., 20 000 ex.) — celui qu'éditait Idéepôle",
          url: "https://www.saint-maur.com/kiosque",
          summary:
            "Chaque bon de commande gonflé renvoie à un numéro précis du magazine. " +
            "C'est en recoupant ces bulletins que le pot aux roses a été découvert.",
        },
      ],
      scene:
        "Sur la table de la défunte : une coupe encore pleine et 50 autres en miettes. À côté, " +
        "une pile de « Saint-Maur Le Mag » annotés au stylo rouge, et une facture à demi brûlée " +
        "au nom d'« IDÉEPÔLE ». La directrice fêtait quelque chose. Pas un anniversaire : la fin " +
        "tranquille d'une affaire que tout le monde croyait enterrée.",
      riddle:
        "Lisez la revue de presse et recoupez vos pièces : en quelle ANNÉE l'affaire des " +
        "fausses factures a-t-elle éclaté au grand jour (dernière facture truquée) ? (4 chiffres)",
      answer: '2013',
      hints: [
        "Le marché Idéepôle court « de 2009 à 20██ ». La fraude s'arrête l'année où elle est découverte.",
        "C'est l'actuel maire qui, cette année-là, met la main sur le contrat litigieux.",
        "Réponse : 2013.",
      ],
      reveal:
        "ACTE 1 — Tout s'arrête en 2013, quand le contrat Idéepôle est découvert. La directrice " +
        "des finances validait les paiements. Mais une signature revenait AU-DESSUS de la sienne : " +
        "celle du Directeur Général des Services. Initiales relevées sur les bons : « F. E. »",
      fragments: [
        { label: "Pièce A1 — scellé n°1", text: "Marge d'un « Saint-Maur Le Mag » : dernière facture truquée datée de 2013." },
        { label: "Pièce A2 — note du parquet", text: "Enquête du parquet de CRÉTEIL. 6 factures contestées sur une soixantaine." },
        { label: "Pièce A3 — coupure Europe 1", text: "Ex-maire condamné : 3 ans d'inéligibilité, 8 000 € d'amende, 1 an avec sursis." },
        { label: "Pièce A4 — facture brûlée", text: "Agence : IDÉEPÔLE (filiale de Bygmalion). Objet : édition du MAGAZINE municipal." },
        { label: "Pièce A5 — chiffrage", text: "Préjudice réglé à la ville : 230 000 €. Mandat du maire de l'époque : 2008 → 2014." },
      ],
    },

    // ===============================================================
    //  ACTE 2 — L'ORGANIGRAMME (le DGS Erzen)
    // ===============================================================
    {
      num: 2,
      key: 'a2',
      kind: 'text',
      title: 'LE DGS QUI RÉÉCRIVAIT',
      place: "Direction Générale des Services — 2ᵉ étage",
      article: {
        source: "ORGANIGRAMME INTERNE — caviardé",
        date: "—",
        body:
          "MAIRE › DIRECTEUR GÉNÉRAL DES SERVICES (F. E████) › Direction des Finances " +
          "(Solène VASSEUR) · Direction des Systèmes d'Information (DSI) · Services techniques. " +
          "Mention manuscrite en marge : « les bons de commande étaient RÉÉCRITS après " +
          "signature des services ».",
      },
      scene:
        "La mécanique se dessine : un agent rédige un bon de commande honnête ; le DGS le " +
        "récupère, GONFLE les montants, et la directrice des finances le paie sans broncher. " +
        "Le DGS a un nom, presque effacé sur l'organigramme. Recollez-le.",
      riddle:
        "Recomposez le NOM de famille du DGS qui falsifiait les bons (celui qui couvrait la " +
        "directrice). 5 lettres.",
      answer: 'ERZEN',
      hints: [
        "Ses initiales sur les bons : « F. E. ». Le F, c'est son prénom : Frédéric.",
        "L'annuaire interne (une pièce de conviction) donne le nom complet.",
        "Réponse : ERZEN.",
      ],
      reveal:
        "ACTE 2 — Le DGS, Frédéric ERZEN, réécrivait les montants ; la directrice Vasseur validait " +
        "ses faux. Deux complices. Mais les bons étaient RÉDIGÉS plus bas, à la DSI. Et là, un " +
        "prénom trouble l'enquête : un AUTRE Frédéric y travaillait. Lequel des deux a trempé ?",
      fragments: [
        { label: "Pièce B1 — annuaire interne", text: "DGS de la mairie (2010–2016) : Frédéric ERZEN. Bureau au 2ᵉ étage." },
        { label: "Pièce B2 — graphologie", text: "Sur les bons, les montants gonflés sont d'une AUTRE main que celle qui les a rédigés." },
        { label: "Pièce B3 — témoignage compta", text: "« C'est ERZEN qui rapportait les bons corrigés. Mme Vasseur signait les yeux fermés. »" },
        { label: "Pièce B4 — leurre", text: "Un certain M. EVANO a travaillé à l'accueil. Aucun lien avec les finances. (fausse piste)" },
        { label: "Pièce B5 — post-it retrouvé", text: "« E-R-Z-E-N. Penser à détruire le double. » — écriture d'Erzen." },
      ],
    },

    // ===============================================================
    //  ACTE 3 — L'AMALGAME DES DEUX FRÉDÉRIC (le chevalier blanc)
    // ===============================================================
    {
      num: 3,
      key: 'a3b',
      kind: 'logic',
      title: 'L\'AMALGAME DES DEUX FRÉDÉRIC',
      place: "Direction des Systèmes d'Information — open space",
      article: {
        source: "DOSSIER RH — deux fiches mélangées",
        date: "—",
        body:
          "Deux Frédéric dans le dossier. Frédéric ERZEN, le DGS qui falsifiait. Et Frédéric " +
          "COUPAYE, simple agent de la DSI. Mêmes initiales, même prénom : les enquêteurs les " +
          "ont d'abord confondus et ont cru Coupaye complice. Les pièces, elles, racontent " +
          "autre chose.",
      },
      scene:
        "Tout accuse Coupaye : même prénom qu'Erzen, même service, son nom dans les paraphes. " +
        "Trop facile. Recoupez vos pièces : l'une d'elles fait basculer le portrait. Coupaye " +
        "n'est pas un complice — c'est le CHEVALIER BLANC de l'histoire. Innocentez-le pour " +
        "avancer.",
      riddle:
        "Deux Frédéric : l'un falsifie (le DGS), l'autre a tenté d'alerter et s'est fait broyer. " +
        "Qui est le CHEVALIER BLANC à mettre hors de cause ? (nom de famille)",
      answer: 'COUPAYE',
      hints: [
        "Le complice falsificateur, c'est ERZEN (acte précédent). L'amalgame, c'est l'AUTRE Frédéric.",
        "Coupaye a déposé un signalement interne en 2012… ignoré, puis placardisé. Un lanceur d'alerte, pas un voleur.",
        "Le chevalier blanc : Frédéric COUPAYE.",
      ],
      reveal:
        "ACTE 3 — Piège déjoué : Frédéric COUPAYE n'a jamais trempé. Agent de la DSI, il avait " +
        "ALERTÉ en interne dès 2012 sur les bons réécrits — on l'a fait taire, muté, oublié. " +
        "C'est même lui qui a laissé la trace qui vous guide. Reste à trouver QUI, à la DSI, a " +
        "vraiment rédigé puis vengé ces bons. Suivez la dernière tournée de la directrice…",
      fragments: [
        { label: "Pièce C1 — amalgame", text: "Sur un brouillon : « Frédéric, DSI ». Mais DEUX Frédéric y bossaient : Erzen (DGS) et Coupaye (agent). Ne pas confondre !" },
        { label: "Pièce C2 — fausse piste", text: "Le nom de COUPAYE apparaît au bas de plusieurs bons → il semble complice. (mais voir C4 et C5…)" },
        { label: "Pièce C3 — RH", text: "Frédéric COUPAYE : agent DSI, muté brutalement fin 2012, puis « placardisé » sans explication." },
        { label: "Pièce C4 — signalement", text: "Registre interne : COUPAYE a déposé une ALERTE en 2012 — « montants des bons modifiés après signature ». Restée sans suite." },
        { label: "Pièce C5 — graphologie", text: "La signature de Coupaye sur les bons est IMITÉE : ce n'est pas sa main. On s'est servi de son nom." },
        { label: "Pièce C6 — témoin", text: "« Coupaye ? Le seul honnête de l'étage. Il a voulu parler, ça lui a coûté sa carrière. »" },
      ],
    },

    // ===============================================================
    //  ACTE 4 — LE PLAN DE LA VILLE (le tracé dessine une lettre = clé)
    // ===============================================================
    {
      num: 4,
      key: 'a4',
      kind: 'map',
      title: 'LE PARCOURS DANS LA VILLE',
      place: "Boucle de la Marne — sites remarquables de Saint-Maur",
      scene:
        "Dans le carnet de la directrice, une dernière tournée d'inspection, sept sites publics " +
        "de Saint-Maur, sans numéros. Reliez-les DANS L'ORDRE de vos indices sur le plan : le " +
        "tracé du parcours dessine une LETTRE. Cette lettre est une CLÉ — gardez-la, elle " +
        "servira plus tard.",
      // Plan stylisé : sites RÉELS placés pour que le parcours 1→7 dessine un « G ».
      // (Géographie volontairement schématique — c'est un plan d'arcade.)
      map: {
        instruction: "Reliez les 7 sites dans l'ordre de vos indices. Quelle lettre obtenez-vous ?",
        river: true,
        // Ordre du parcours = index du tableau (1er site = index 0).
        // lbl = côté de l'étiquette (r=droite, l=gauche, t=haut, b=bas)
        // short = libellé compact pour le plan (le nom complet reste dans les indices)
        landmarks: [
          { name: "Hôtel de Ville", short: "Hôtel de Ville", x: 72, y: 24, lbl: 'l' },
          { name: "Théâtre de Saint-Maur", short: "Théâtre", x: 40, y: 16, lbl: 't' },
          { name: "Conservatoire à rayonnement régional", short: "Conservatoire", x: 22, y: 42, lbl: 'r' },
          { name: "Église Saint-Nicolas (Vieux Saint-Maur)", short: "Église St-Nicolas", x: 28, y: 78, lbl: 'r' },
          { name: "Abbaye / Tour Rabelais", short: "Abbaye (T. Rabelais)", x: 64, y: 85, lbl: 'b' },
          { name: "Gare de Saint-Maur–Créteil (RER A)", short: "Gare St-Maur–Créteil", x: 84, y: 56, lbl: 'l' },
          { name: "Villa Médicis (La Varenne)", short: "Villa Médicis", x: 54, y: 55, lbl: 't' },
        ],
        letter: 'G',
      },
      riddle:
        "Reliés dans le bon ordre, les 7 sites tracent une lettre. Tapez CETTE LETTRE.",
      answer: 'G',
      hints: [
        "Départ Hôtel de Ville (en haut), puis Théâtre, Conservatoire… on descend par la gauche.",
        "On remonte par la droite (la gare) puis on rentre vers le centre (Villa Médicis) : c'est un crochet.",
        "Le tracé dessine un G — comme une certaine initiale. Réponse : G.",
      ],
      reveal:
        "ACTE 4 — Le parcours dessine un G. Une initiale qui revient… La lettre G est votre CLÉ : " +
        "notez-la, elle décodera le dernier message. Et elle pointe déjà un suspect.",
      fragments: [
        { label: "Étape 1", text: "Le parcours DÉMARRE à l'Hôtel de Ville (en haut à droite du plan)." },
        { label: "Étape 2", text: "2ᵉ arrêt : le Théâtre de Saint-Maur (en haut, vers la gauche)." },
        { label: "Étape 3", text: "3ᵉ arrêt : le Conservatoire à rayonnement régional (à gauche)." },
        { label: "Étape 4", text: "4ᵉ arrêt : l'Église Saint-Nicolas, dans le Vieux Saint-Maur (en bas à gauche)." },
        { label: "Étape 5", text: "5ᵉ arrêt : l'Abbaye / Tour Rabelais (en bas à droite)." },
        { label: "Étape 6", text: "6ᵉ arrêt : la Gare de Saint-Maur–Créteil, RER A (on remonte par la droite)." },
        { label: "Étape 7", text: "DERNIER arrêt : la Villa Médicis à La Varenne (on rentre vers le centre)." },
      ],
    },

    // ===============================================================
    //  ACTE 5 — LES QUATRE DSI (et l'adjoint Vincent)
    // ===============================================================
    {
      num: 5,
      key: 'a5d',
      kind: 'logic',
      title: 'LES QUATRE DSI (ET L\'ADJOINT)',
      place: "Boucle de la Marne — nuit du crime",
      article: {
        source: "FICHE SUSPECTS — service enquête",
        date: "Nuit du crime",
        body:
          "Cinq personnes avaient un mobile. Quatre anciens DSI — BLAISE, GUILLAUME, MARC, " +
          "DJALAL — et l'adjoint VINCENT, « celui qui a les dents qui rayent le parquet », qui " +
          "convoitait le pouvoir. Un seul n'a PAS d'alibi. Et le plan a déjà soufflé son initiale…",
      },
      scene:
        "Le tueur connaissait le code du local d'archives où dormaient les vieux parapheurs : " +
        "forcément un ancien DSI. Croisez vos alibis (chacun en détient un) et éliminez. " +
        "Souvenez-vous de la lettre du parcours.",
      riddle:
        "Après élimination : qui est le seul suspect sans alibi, ancien DSI, badge d'archives " +
        "encore actif ? (son prénom)",
      answer: 'GUILLAUME',
      hints: [
        "L'adjoint Vincent est un mobile parfait… mais il était filmé sur les marchés de Noël. Trop voyant.",
        "Blaise (retraité à La Rochelle), Marc (au Théâtre de Saint-Maur), Djalal (muté à l'étranger) : couverts.",
        "Le parcours dessinait un G. Réponse : GUILLAUME.",
      ],
      reveal:
        "ACTE 5 — GUILLAUME. Ancien DSI, parti sans bruit après le « ménage » dans les archives. " +
        "Pas d'alibi, badge actif, et l'initiale que la ville elle-même dessinait. Reste à " +
        "comprendre POURQUOI il a brisé exactement 50 verres.",
      fragments: [
        { label: "Alibi — BLAISE", text: "BLAISE : retraité à La Rochelle depuis 2019. À 450 km la nuit du crime. ✅ hors de cause." },
        { label: "Alibi — MARC", text: "MARC : animait une soirée au Théâtre de Saint-Maur. 200 témoins. ✅ hors de cause." },
        { label: "Alibi — DJALAL", text: "DJALAL : muté à la DSI d'une ville étrangère, à l'étranger ce soir-là. ✅ hors de cause." },
        { label: "Suspect — VINCENT (adjoint)", text: "VINCENT « les dents qui rayent le parquet » : voulait le poste. MAIS filmé toute la soirée sur les marchés de Noël (La Varenne, Adamville). Mobile énorme, alibi béton. 🟠 fausse piste." },
        { label: "Faille — GUILLAUME", text: "GUILLAUME : ancien DSI parti discrètement. AUCUN alibi. Badge du local d'archives JAMAIS désactivé. 🔴" },
        { label: "Recoupement", text: "Le tueur a ouvert le local sans effraction → il connaissait le code → un ancien DSI. Et le plan disait : G." },
      ],
    },

    // ===============================================================
    //  ACTE 6 — CINQUANTE BONS, CINQUANTE VERRES
    // ===============================================================
    {
      num: 6,
      key: 'a6c',
      kind: 'count',
      title: 'CINQUANTE BONS, CINQUANTE VERRES',
      place: "Quartier de La Varenne — bennes, rue Saint-Hilaire",
      article: {
        source: "CARNET DE GUILLAUME — saisi",
        date: "—",
        body:
          "« Je l'ai retrouvé dans une benne, près du marché de la rue Saint-Hilaire. Un vieux " +
          "parapheur jeté avec les encombrants. Dedans, MES bons de commande — ceux que J'AVAIS " +
          "rédigés. Sauf que les montants n'étaient plus les miens. On s'est servi de ma " +
          "signature pour couvrir leurs vols. Bon après bon. Je les ai comptés. »",
      },
      scene:
        "Guillaume a gardé chaque bon falsifié à son nom. Chacun de vous tient une liasse. " +
        "Additionnez-les TOUTES. Le total dira combien de fois sa signature a été salie — et " +
        "pourquoi il y avait exactement ce nombre de verres brisés autour du corps.",
      riddle:
        "Faites la SOMME de toutes les liasses de bons falsifiés détenues par la table. Combien " +
        "de bons au total ?",
      answer: '50',
      hints: [
        "Chaque joueur a une liasse (12, 9, 11, 8, 10…). Additionnez-les toutes.",
        "Le total est rond, et correspond EXACTEMENT au nombre de verres brisés.",
        "Réponse : 50.",
      ],
      reveal:
        "ACTE 6 — 50 bons falsifiés à la signature de Guillaume. 50 trahisons. 50 verres brisés " +
        "autour de la directrice : un éclat pour chaque bon maquillé en son nom. Le compte est un " +
        "message. Reste à le décoder.",
      fragments: [
        { label: "Liasse A", text: "Tu détiens une liasse de 12 bons de commande falsifiés." },
        { label: "Liasse B", text: "Tu détiens une liasse de 9 bons de commande falsifiés." },
        { label: "Liasse C", text: "Tu détiens une liasse de 11 bons de commande falsifiés." },
        { label: "Liasse D", text: "Tu détiens une liasse de 8 bons de commande falsifiés." },
        { label: "Liasse E", text: "Tu détiens une liasse de 10 bons de commande falsifiés." },
        { label: "Indice scène", text: "Le légiste a compté les éclats : autant de verres brisés que de bons falsifiés." },
      ],
    },

    // ===============================================================
    //  ACTE 7 — LE MESSAGE CODÉ (clé = la lettre du parcours, G)
    // ===============================================================
    {
      num: 7,
      key: 'a7',
      kind: 'cipher',
      title: 'LE MESSAGE CODÉ',
      place: "Villa Médicis (La Varenne) — réveillon de la mairie",
      article: {
        source: "DERNIER MESSAGE DE GUILLAUME — chiffré",
        date: "Soir du crime",
        body:
          "Sur le miroir de la salle, Guillaume a laissé un seul mot, chiffré. Il faut une clé " +
          "pour le lire. La clé, c'est la lettre que la ville vous a dessinée.",
      },
      // Chiffre de César : texte = plain décalé de +shift. La clé G = 7ᵉ lettre → reculer de 7.
      cipher: {
        ciphertext: 'WHYHWOLBY',
        keyLetter: 'G',
        shift: 7,
        plain: 'PARAPHEUR',
        help: "Clé = G, la 7ᵉ lettre de l'alphabet. Recule CHAQUE lettre de 7 rangs (W→P, H→A…).",
      },
      scene:
        "Vous tenez le coupable (Guillaume), les complices (Erzen + la directrice), le compte (50) " +
        "et la date (2013). Décodez le dernier mot avec la clé G : il nomme l'objet qui a tout " +
        "déclenché, et clôt le dossier.",
      riddle:
        "Décodez « WHYHWOLBY » avec la clé G (recul de 7 lettres). Quel mot obtenez-vous ?",
      answer: 'PARAPHEUR',
      hints: [
        "W reculé de 7 → P. H reculé de 7 → A. Continuez…",
        "C'est un classeur rigide où l'on range les documents À SIGNER. Relis le titre du dossier.",
        "Réponse : PARAPHEUR.",
      ],
      reveal:
        "DOSSIER CLOS — Le meurtrier est GUILLAUME, ancien DSI. Mobile : la VENGEANCE des " +
        "parapheurs perdus. Il avait retrouvé dans une benne le parapheur contenant les bons de " +
        "commande qu'il avait rédigés, falsifiés par le DGS Frédéric ERZEN avec la complicité de la " +
        "directrice Solène VASSEUR. 50 bons salis, 50 verres brisés. L'affaire Idéepôle aura fait " +
        "une victime de plus — des années après.",
      fragments: [
        { label: "Rappel clé", text: "La clé est la lettre du parcours sur le plan : G (7ᵉ lettre de l'alphabet)." },
        { label: "Décodeur", text: "César : pour lire, recule chaque lettre de 7 rangs. Ex : W(23) → P(16)." },
        { label: "Amorce", text: "Les 3 premières lettres décodées donnent : P - A - R …" },
        { label: "Indice titre", text: "Relis le titre du dossier : « L'affaire des ___________ perdus »." },
        { label: "Synthèse", text: "Coupable : Guillaume · Complices : Erzen + Vasseur · Compte : 50 · Année : 2013." },
      ],
    },
  ],

  // Écran final affiché quand les 6 actes sont résolus.
  finale: {
    title: "AFFAIRE RÉSOLUE",
    culprit: "GUILLAUME",
    role: "ancien DSI de la mairie de Saint-Maur-des-Fossés",
    mobile:
      "La vengeance des parapheurs perdus : ses bons de commande, falsifiés par le DGS Frédéric " +
      "Erzen et payés par la directrice Solène Vasseur, retrouvés par hasard dans une benne du " +
      "quartier de La Varenne.",
    disclaimer:
      "Fiction. L'affaire Bygmalion/Idéepôle, le magazine municipal et les lieux sont réels " +
      "(sources citées) ; le meurtre, les personnages et les suspects sont inventés pour le jeu.",
  },
};
