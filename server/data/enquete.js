// =====================================================================
//  L'AFFAIRE DES PARAPHEURS PERDUS — enquête collaborative (Cold Case).
//  Escape-game en 8 actes, ~1 h, table + smartphones.
//
//  ⚠️  FICTION. Décor RÉEL (affaire Bygmalion/Idéepôle, magazine « Saint-Maur
//  Le Mag », monuments) — sources citées. Meurtre, victime, DGS « Erzen » et
//  suspects (prénoms des invités) INVENTÉS pour le jeu.
//
//  PRINCIPE DE DIFFICULTÉ — aucun code n'est écrit en clair nulle part :
//   • L'information-clé est dans l'ARTICLE / le DOCUMENT affiché et imprimé.
//   • Les PIÈCES À CONVICTION (sur les téléphones) ne donnent que des
//     CONTRAINTES : il faut les recouper avec le document, puis DÉDUIRE.
//   • Les indices « hints » sont une roue de secours révélée par le MJ.
//
//  Chaîne :
//   1 REVUE DE PRESSE — déduire l'année (perquisition − 1) ............ 2013
//   2 L'ORGANIGRAMME — recomposer le nom (ER + ZEN) ................. ERZEN
//   3 LES DEUX FRÉDÉRIC — démasquer le faux mail, matricule du vrai . DSI-312
//   4 LA TABLE DES COMPTES — éliminer les homonymes C.L. .......... LEJARRE
//   5 LE PLAN — ordonner le parcours, lire la lettre ................... G
//   6 LES SUSPECTS — éliminer les alibis ...................... GUILLAUME
//   7 LES LIASSES — additionner (multiple de 10) ..................... 50
//   8 LE MESSAGE CODÉ — César, clé = G ........................ PARAPHEUR
// =====================================================================

export const ENQUETE = {
  title: "DOSSIER 94100 — L'AFFAIRE DES PARAPHEURS PERDUS",
  pitch:
    "Saint-Maur-des-Fossés. La directrice des finances de la mairie, Nathalie NEVES, est " +
    "retrouvée morte dans la salle des mariages de l'Hôtel de Ville, entourée de 50 verres de " +
    "champagne brisés. Pas d'effraction. Juste un toast funèbre. Rien ne vous sera donné : tout " +
    "se déduit. Croisez les articles, les documents et vos pièces à conviction.",

  // Briefing affiché AVANT l'acte 1 : le contexte commun à toute la table.
  briefing:
    "📍 Saint-Maur-des-Fossés — Hôtel de Ville, salle des mariages.\n" +
    "🔴 LES FAITS : Nathalie NEVES, directrice des finances de la mairie, est retrouvée morte au " +
    "petit matin, entourée de 50 coupes de champagne brisées. Aucune effraction : le tueur " +
    "connaissait les lieux… et les codes.\n" +
    "🧩 LE CONTEXTE : derrière ce meurtre resurgit une vieille affaire de FAUSSES FACTURES — un " +
    "marché de communication de la mairie truqué pendant des années.\n" +
    "🎯 VOTRE MISSION : démasquer le MEURTRIER et reconstituer le RÉSEAU de fraude — qui " +
    "falsifiait ? qui payait ? qui couvrait ? qui a voulu parler ?\n" +
    "🔍 MÉTHODE : rien n'est donné en clair. La BORNE affiche les DOCUMENTS (articles, registres, " +
    "plans, e-mails…). Chacun détient des PIÈCES À CONVICTION sur son téléphone. Croisez, " +
    "déduisez, et tapez le code de chaque acte. 8 actes vous séparent de la vérité.",

  acts: [
    // ===============================================================
    //  ACTE 1 — REVUE DE PRESSE → DÉDUIRE l'année (2013)
    // ===============================================================
    {
      num: 1,
      key: 'a1',
      kind: 'press',
      title: 'LA REVUE DE PRESSE',
      place: "Hôtel de Ville de Saint-Maur — salle des mariages",
      sources: [
        {
          source: "Europe 1",
          date: "procès en appel",
          title: "Fausses factures Bygmalion : 3 ans d'inéligibilité pour l'ex-maire de Saint-Maur",
          url: "https://www.europe1.fr/societe/fausses-factures-avec-bygmalion-trois-ans-dineligibilite-pour-lex-ministre-henri-plagnol-3497876",
          summary:
            "L'ancien maire a dirigé la ville de 2008 à 2014. Condamné pour complicité de " +
            "détournement de fonds publics : 1 an avec sursis, 3 ans d'inéligibilité, 8 000 € " +
            "d'amende. Préjudice remboursé à la ville : 230 000 €.",
        },
        {
          source: "Compte-rendu d'audience — parquet de Créteil",
          date: "faits & procédure",
          title: "Le marché de communication Idéepôle (filiale de Bygmalion)",
          url: "https://www.lehelloco.fr/bygmalion-que-sest-il-passe-a-saint-maur/",
          summary:
            "Idéepôle éditait le MAGAZINE municipal. Le marché démarre en DÉCEMBRE 2009. La " +
            "Brigade de répression de la délinquance économique PERQUISITIONNE l'Hôtel de Ville " +
            "en 2014. Sur une soixantaine de factures, 6 sont contestées (~280 000 €).",
        },
        {
          source: "Saint-Maur Le Mag — kiosque municipal",
          date: "n° d'archive",
          title: "Le magazine de la ville (48 p., 20 000 ex.) — édité par Idéepôle",
          url: "https://www.saint-maur.com/kiosque",
          summary: "Chaque bon de commande gonflé renvoie à un numéro précis du magazine.",
        },
      ],
      scene:
        "Sur la table : une coupe pleine, 50 coupes en miettes, et une pile de « Saint-Maur Le " +
        "Mag » annotés au stylo rouge. L'année du dernier méfait n'est imprimée nulle part. " +
        "Mais la presse donne des points de repère. Reliez-les.",
      riddle:
        "En quelle ANNÉE a été émise la DERNIÈRE fausse facture ? (Elle n'est écrite nulle part : " +
        "déduisez-la à partir de l'article et de vos pièces. 4 chiffres.)",
      answer: '2013',
      hints: [
        "L'article donne l'année de la PERQUISITION (lisez-le). Une pièce dit combien de temps AVANT la dernière facture a été émise.",
        "Perquisition = 2014. La dernière fausse facture a été émise un an plus tôt. 2014 − 1 = ?",
        "Réponse : 2013.",
      ],
      humor:
        "Note de l'inspecteur : 50 verres brisés, mais la coupe pleine intacte. Soit un message, " +
        "soit la directrice était radine même pour son dernier toast.",
      reveal:
        "ACTE 1 — La dernière fausse facture date de 2013 (un an avant la perquisition de 2014). " +
        "La directrice validait les paiements ; au-dessus d'elle, une signature « F. E. ». Le DGS.",
      fragments: [
        { label: "Pièce A1 — recoupement", text: "La DERNIÈRE fausse facture a été émise exactement UN AN avant la perquisition (dont l'année est dans l'article)." },
        { label: "Pièce A2 — durée", text: "Le marché Idéepôle a duré 42 mois pile. (Il démarre en décembre 2009 — comptez.)" },
        { label: "Pièce A3 — remboursement", text: "Le préjudice a été remboursé l'année qui a SUIVI la dernière fausse facture, soit l'année de la perquisition." },
        { label: "Pièce A4 — contexte", text: "6 factures sur ~60 étaient truquées. (Vous chercherez lesquelles plus tard.)" },
        { label: "Pièce A5 — méthode", text: "Trois chemins mènent à la même année : la perquisition −1, OU décembre 2009 + 42 mois. Vérifiez qu'ils concordent." },
      ],
    },

    // ===============================================================
    //  ACTE 2 — L'ORGANIGRAMME → RECOMPOSER le nom (ERZEN)
    // ===============================================================
    {
      num: 2,
      key: 'a2',
      kind: 'text',
      title: 'LE SYSTÈME DES FAUSSES FACTURES',
      place: "Direction Générale des Services — 2ᵉ étage",
      article: {
        source: "ORGANIGRAMME + COUPURE DE PRESSE AGRAFÉE",
        date: "—",
        body:
          "MAIRE › DIRECTEUR GÉNÉRAL DES SERVICES : Frédéric ERZEN (signature « F. E. ») › " +
          "Direction des Finances (Nathalie NEVES) · Systèmes d'Information (DSI) · Services techniques.\n" +
          "Mention manuscrite : « les bons étaient RÉÉCRITS après signature, puis couverts par de " +
          "FAUSSES FACTURES — exactement comme dans CE scandale national ».",
      },
      scene:
        "Erzen n'improvisait rien : il copiait une MÉCANIQUE déjà vue dans la presse — entreprise-" +
        "écran et fausses factures pour masquer des dépassements d'une campagne présidentielle " +
        "française. Le mot de passe du dossier, c'est le NOM de ce scandale.",
      riddle:
        "Quel est le nom (9 lettres) du scandale de fausses factures qu'Erzen imite ? Il n'est pas " +
        "écrit en entier : déduisez-le de vos pièces… et de votre culture.",
      answer: 'BYGMALION',
      hints: [
        "Ce nom est calqué sur un MYTHE grec : un sculpteur tombe amoureux de sa statue, qu'une déesse change en femme vivante.",
        "Le mythe s'appelle PYGMALION (la pièce derrière « My Fair Lady »). Le scandale n'en change qu'UNE lettre.",
        "Remplacez le P initial par un B → réponse : BYGMALION.",
      ],
      humor:
        "Note de l'inspecteur : Erzen avait renommé son tableur de faux « pas_un_scandale_promis." +
        "xlsx ». On l'a ouvert juste après « NE_PAS_OUVRIR_vacances.jpg ».",
      reveal:
        "ACTE 2 — Erzen avait monté un mini-« BYGMALION » municipal : fausses factures pour couvrir " +
        "les bons réécrits, Neves validait les paiements. Mais Erzen ne savait pas pirater la compta : " +
        "quelqu'un l'a aidé. Et un AGENT de la DSI avait justement tenté d'alerter… il porte le MÊME " +
        "prénom que le DGS : deux Frédéric. Méfiance.",
      // Acte volontairement PEU assisté : pas de pièces à conviction. À déduire
      // depuis l'organigramme, la scène et sa culture (roue de secours = indices MJ).
      fragments: [],
    },

    // ===============================================================
    //  ACTE 3 — LE REGISTRE → RETROUVER le bon signalement (COUPAYE)
    // ===============================================================
    {
      num: 3,
      key: 'a3',
      kind: 'logic',
      title: 'L\'AMALGAME DES DEUX FRÉDÉRIC',
      place: "Direction des Systèmes d'Information — messagerie & contrôle d'accès",
      article: {
        source: "TROIS DOCUMENTS À SUPERPOSER",
        date: "—",
        body:
          "📧 E-MAILS D'ALERTE « BONS DE COMMANDE » (deux signalements, deux « Frédéric ») :\n" +
          "   • MAIL 1 — de « F. » · poste 4312 · envoyé MARDI 18 h 42 :\n" +
          "       « Les MONTANTS des bons sont RÉÉCRITS après signature. »\n" +
          "   • MAIL 2 — de « F. » · poste 4207 · envoyé JEUDI 23 h 11 :\n" +
          "       « Je signale de vagues anomalies sur les bons. Rien de grave. »\n" +
          "\n" +
          "📇 ANNUAIRE INTERNE :\n" +
          "   • Postes 42xx → 2ᵉ étage → Direction Générale des Services (DGS)\n" +
          "   • Postes 43xx → 3ᵉ étage → Direction des Systèmes d'Information (DSI)\n" +
          "\n" +
          "🔑 JOURNAL DES BADGES — nuit de JEUDI :\n" +
          "   • Frédéric ERZEN (DGS) : entrée 08 h 05 — SORTIE 19 h 03 — aucun retour.\n" +
          "   • Frédéric COUPAYE (DSI) : entrée 08 h 30 — sortie 18 h 20.",
      },
      scene:
        "Deux « Frédéric » brouillent la piste : Frédéric ERZEN (DGS, coupable) et Frédéric " +
        "COUPAYE (agent DSI). Chacun aurait « alerté » sur les bons… mais l'un des deux mails est " +
        "un FAUX, planté par le coupable pour se faire passer pour lanceur d'alerte. Démasquez le " +
        "faux en recoupant son heure d'envoi avec le journal des badges, puis identifiez le VRAI " +
        "lanceur d'alerte par son matricule.",
      riddle:
        "Un seul des deux mails est sincère ; l'autre est un FAUX (recoupez son heure d'envoi avec " +
        "le journal des badges). Donnez le MATRICULE du VRAI lanceur d'alerte : code du service " +
        "(DGS ou DSI) suivi des 3 chiffres de son poste. (ex. de format : DSI-000)",
      answer: 'DSI-312',
      hints: [
        "Le mail VAGUE de 23 h sent l'écran de fumée. Surtout : à quelle heure son auteur a-t-il QUITTÉ les lieux d'après les badges ?",
        "Mail 2 part du poste 4207 (42xx → 2ᵉ étage → DGS = Erzen) à 23 h 11 — mais le badge d'Erzen indique une SORTIE à 19 h 03, sans retour. Mail 2 = FAUX.",
        "Reste le mail 1 : poste 4312 → 43xx → 3ᵉ étage → DSI. Matricule = DSI + 312 → DSI-312 (Frédéric COUPAYE).",
      ],
      humor:
        "Note de l'inspecteur : Erzen a fignolé son faux mail au mot près… mais a oublié qu'on " +
        "badge aussi à la SORTIE. Le crime parfait, à quatre heures près.",
      reveal:
        "ACTE 3 — Le faux lanceur d'alerte, c'est le DGS Frédéric ERZEN : un mail planté à 23 h, " +
        "alors que son badge l'avait vu partir à 19 h. Le vrai chevalier blanc est l'agent DSI " +
        "Frédéric COUPAYE (matricule DSI-312, poste 4312), dont la signature a été imitée. " +
        "Innocent. Reste le VRAI complice technique d'Erzen — celui qui a ouvert la compta et " +
        "purgé les traces.",
      fragments: [
        { label: "Pièce C1 — règle RH", text: "Le MATRICULE d'un agent = le code de son service (DGS ou DSI) suivi des 3 chiffres de son poste téléphonique." },
        { label: "Pièce C2 — crédibilité", text: "Un vrai signalement cite un fait PRÉCIS (« montants réécrits après signature »). Le vague (« anomalies, rien de grave ») est un écran de fumée." },
        { label: "Pièce C3 — métadonnées", text: "Vérifie l'HEURE : un mail ne peut pas partir d'un bureau APRÈS que le badge de son occupant l'a vu quitter les lieux." },
        { label: "Pièce C4 — anti-amalgame", text: "Les deux suspects se prénomment Frédéric. Ne te fie pas au prénom : seuls comptent le POSTE et l'ÉTAGE." },
        { label: "Pièce C5 — le piège", text: "Le coupable a pu PLANTER un faux mail d'alerte pour se faire passer pour lanceur d'alerte. Le vrai, c'est celui qui RESTE crédible." },
      ],
    },

    // ===============================================================
    //  ACTE 4 — LA TABLE DES COMPTES → ÉLIMINER les homonymes (LEJARRE)
    // ===============================================================
    {
      num: 4,
      key: 'a4',
      kind: 'logic',
      title: 'LE FALSIFICATEUR EN CHEF',
      place: "Direction des Finances — régie comptable & salle des serveurs",
      article: {
        source: "TABLE DES COMPTES ADMIN & PRESTATAIRES — restaurée",
        date: "—",
        body:
          "Carla LENOIR ...... comptable titulaire ... compte AD-114 (marché régulier) ... EN POSTE\n" +
          "Kevin LARENNE ..... stagiaire BTS ......... compte AD-207 (temporaire) ........ parti en fin de stage\n" +
          "Camus LEJARRE ..... prestataire info ...... compte AD-666 (HORS MARCHÉ) ....... PARTI sans préavis\n" +
          "Sté NOVERIA ....... maintenance ........... compte AD-300 (marché régulier) ... actif\n" +
          "Indice serveur : les journaux d'audit ont été PURGÉS la nuit du 24 par le compte AD-666.",
      },
      scene:
        "Erzen savait gonfler des montants, pas pirater un logiciel. Un « falsificateur en chef » " +
        "a ouvert la compta et effacé les logs, puis a filé se mettre au vert. Plusieurs noms " +
        "partagent les initiales C.L. dans la TABLE : démêlez avec vos pièces.",
      riddle:
        "Qui est le falsificateur en chef ? Trois personnes ont les initiales C.L. : éliminez les " +
        "innocents grâce à vos pièces et à la table. (nom de famille)",
      answer: 'LEJARRE',
      hints: [
        "Cherchez le compte HORS MARCHÉ qui a PURGÉ les logs la nuit du 24 (c'est dans la table).",
        "Lenoir est en poste, Larenne (stagiaire) est parti normalement. Reste le prestataire hors marché qui a fui.",
        "Réponse : LEJARRE.",
      ],
      humor:
        "Note de l'inspecteur : Lejarre a fui si vite qu'il a laissé son mug « World's Best " +
        "Falsificateur » encore tiède, et 14 pizzas facturées au budget « fournitures de bureau ».",
      reveal:
        "ACTE 4 — Le falsificateur en chef est Camus LEJARRE : prestataire fantôme (compte AD-666, " +
        "hors marché), il a purgé les logs la nuit du 24 puis s'est volatilisé à la campagne. Le " +
        "réseau est complet : ERZEN + NEVES + LEJARRE. Reste le tueur. Suivez la ville.",
      fragments: [
        { label: "Pièce D1 — le compte", text: "Le falsificateur opérait depuis un compte admin créé HORS marché public. (Lequel, dans la table ?)" },
        { label: "Pièce D2 — la purge", text: "C'est CE compte qui a purgé les journaux d'audit la nuit du 24." },
        { label: "Pièce D3 — la cavale", text: "L'homme a quitté la mairie sans préavis et est « parti se mettre au vert »." },
        { label: "Pièce D4 — homonyme 1", text: "Carla LENOIR a aussi les initiales C.L. … mais elle est TOUJOURS en poste. Écartez-la." },
        { label: "Pièce D5 — homonyme 2", text: "Kevin LARENNE (initiales inversées) n'était qu'un stagiaire BTS, parti normalement. Écartez-le." },
        { label: "Pièce D6 — témoin", text: "« Le magicien des chiffres : il faisait disparaître une ligne comptable comme un lapin. »" },
      ],
    },

    // ===============================================================
    //  ACTE 5 — LE PLAN → ORDONNER puis LIRE la lettre (G)
    // ===============================================================
    {
      num: 5,
      key: 'a5',
      kind: 'map',
      title: 'LE PARCOURS DANS LA VILLE',
      place: "Boucle de la Marne — sites remarquables de Saint-Maur",
      scene:
        "Dernière tournée de la directrice : sept sites publics, SANS numéros. Vos pièces ne " +
        "donnent pas l'ordre tout cuit — elles donnent des contraintes (« X précède Y », « Z est " +
        "le dernier »…). Reconstituez l'ordre, tracez le parcours : il dessine une LETTRE, votre CLÉ.",
      map: {
        instruction: "Déduisez l'ordre des 7 sites à partir des contraintes, puis tracez : quelle lettre ?",
        river: true,
        // Ordre du parcours = index du tableau (1er site = index 0) → dessine un « G ».
        // lbl = côté étiquette ; short = libellé compact (le nom complet reste dans les indices).
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
        "Une fois l'ordre des 7 sites déduit, le tracé dessine une lettre. Tapez CETTE LETTRE.",
      answer: 'G',
      hints: [
        "Placez d'abord les extrêmes : départ = siège du maire ; fin = Villa Médicis ; la gare juste avant la fin.",
        "Au centre : Théâtre → Conservatoire en 2-3 ; puis Église → Abbaye en 4-5. Reliez : ça fait un crochet.",
        "Le tracé dessine un G — une initiale qui revient. Réponse : G.",
      ],
      humor:
        "Note de l'inspecteur : la directrice notait ses tournées au dos de tickets de parking. " +
        "L'un mène à un kebab. On a vérifié. Par conscience professionnelle.",
      reveal:
        "ACTE 5 — Le parcours dessine un G. Gardez cette lettre : elle décodera le dernier message. " +
        "Et elle pointe déjà une initiale parmi les suspects…",
      fragments: [
        { label: "Contrainte 1", text: "Le parcours COMMENCE au siège du maire (en haut à droite du plan)." },
        { label: "Contrainte 2", text: "La Villa Médicis est le tout DERNIER arrêt." },
        { label: "Contrainte 3", text: "La Gare RER vient JUSTE AVANT la Villa Médicis." },
        { label: "Contrainte 4", text: "Le Théâtre est le 2ᵉ arrêt, et le Conservatoire le suit IMMÉDIATEMENT." },
        { label: "Contrainte 5", text: "L'Abbaye (Tour Rabelais) est l'AVANT-AVANT-DERNIER arrêt (5ᵉ sur 7)." },
        { label: "Contrainte 6", text: "L'Église Saint-Nicolas vient JUSTE AVANT l'Abbaye." },
      ],
    },

    // ===============================================================
    //  ACTE 6 — LES SUSPECTS → ÉLIMINER les alibis (GUILLAUME)
    // ===============================================================
    {
      num: 6,
      key: 'a6',
      kind: 'logic',
      title: 'LES QUATRE DSI (ET L\'ADJOINT)',
      place: "Boucle de la Marne — nuit du crime",
      article: {
        source: "TABLEAU DES ALIBIS — nuit du crime",
        date: "Nuit du crime",
        body:
          "Cinq mobiles : quatre anciens DSI (BLAISE, GUILLAUME, MARC, DJALAL) et l'adjoint VINCENT, " +
          "« celui qui a les dents qui rayent le parquet ».\n" +
          "Contrainte clé : le tueur est entré dans le local d'archives SANS effraction — il en " +
          "connaissait le code. Donc un ANCIEN DSI dont le badge n'a jamais été désactivé.",
      },
      scene:
        "Un seul n'a pas d'alibi. Chacun de vous tient l'alibi de quelqu'un. Éliminez ceux qui " +
        "sont couverts ; celui qui reste, et qui pouvait ouvrir les archives, est le tueur. " +
        "(La lettre du plan vous a déjà soufflé son initiale.)",
      riddle:
        "Après élimination des alibis : qui est le seul ancien DSI sans alibi, au badge d'archives " +
        "encore actif ? (son prénom)",
      answer: 'GUILLAUME',
      hints: [
        "Barrez ceux qui ont un alibi solide : Blaise, Marc, Djalal, Vincent. Que reste-t-il ?",
        "L'adjoint Vincent a le mobile parfait mais était filmé sur les marchés : couvert. Le tueur est ancien DSI.",
        "Le plan dessinait un G. Réponse : GUILLAUME.",
      ],
      humor:
        "Note de l'inspecteur : Vincent l'adjoint a un alibi béton ET un sourire à 32 dents qui " +
        "rayent le parquet. Les deux sont suspects, un seul est puni par la loi.",
      reveal:
        "ACTE 6 — Par élimination : GUILLAUME. Ancien DSI parti sans bruit après le « ménage » des " +
        "archives, sans alibi, badge actif, initiale G. C'est lui. Reste à comprendre les 50 verres.",
      fragments: [
        { label: "Alibi — BLAISE", text: "BLAISE : retraité à La Rochelle (450 km) la nuit du crime. Couvert." },
        { label: "Alibi — MARC", text: "MARC : animait une soirée au Théâtre de Saint-Maur, 200 témoins. Couvert." },
        { label: "Alibi — DJALAL", text: "DJALAL : en mission à l'étranger, muté. Couvert." },
        { label: "Alibi — VINCENT", text: "VINCENT (adjoint) : filmé toute la soirée sur les marchés de Noël (La Varenne, Adamville). Mobile énorme, mais couvert." },
        { label: "Fiche — GUILLAUME", text: "GUILLAUME : ancien DSI parti discrètement. Pas d'alibi connu. (Fait neutre — à recouper avec la contrainte.)" },
        { label: "Contrainte d'accès", text: "Le tueur connaissait le CODE du local d'archives → forcément un ancien DSI au badge actif." },
      ],
    },

    // ===============================================================
    //  ACTE 7 — LES LIASSES → ADDITIONNER (50)
    // ===============================================================
    {
      num: 7,
      key: 'a7',
      kind: 'count',
      title: 'CINQUANTE BONS, CINQUANTE VERRES',
      place: "Quartier de La Varenne — bennes, rue Saint-Hilaire",
      article: {
        source: "RAPPORT DU LÉGISTE — éclats de verre",
        date: "—",
        body:
          "« Retrouvé dans une benne, près du marché rue Saint-Hilaire : un parapheur jeté avec " +
          "les encombrants, plein de bons signés Guillaume mais aux montants réécrits. »\n" +
          "Le légiste a compté les éclats : un nombre ROND, MULTIPLE DE 10. Autant que de bons " +
          "falsifiés. Chacun de vous détient une liasse — additionnez-les TOUTES.",
      },
      scene:
        "Chaque bon falsifié à son nom = un verre brisé. Personne n'a le total : il est réparti " +
        "en liasses sur vos téléphones. Faites la somme, vérifiez que c'est bien un multiple de 10.",
      riddle:
        "Additionnez toutes les liasses de la table. Combien de bons (= de verres brisés) au total ?",
      answer: '50',
      hints: [
        "Liasses : une douzaine (12), 9, 11, 8 et 10. Faites la somme.",
        "12 + 9 + 11 + 8 + 10 — et ça doit tomber sur un multiple de 10.",
        "Réponse : 50.",
      ],
      humor:
        "Note de l'inspecteur : le légiste a recompté trois fois. À 49 il s'est ouvert une bière, " +
        "à 50 il a compris le message. Corrélation troublante.",
      reveal:
        "ACTE 7 — 50 bons falsifiés à la signature de Guillaume = 50 verres brisés. Un éclat par " +
        "trahison. Le compte est un message. Reste à le décoder avec la lettre du plan.",
      fragments: [
        { label: "Liasse A", text: "Ta liasse : une DOUZAINE de bons falsifiés." },
        { label: "Liasse B", text: "Ta liasse : 9 bons falsifiés." },
        { label: "Liasse C", text: "Ta liasse : 11 bons falsifiés." },
        { label: "Liasse D", text: "Ta liasse : 8 bons falsifiés." },
        { label: "Liasse E", text: "Ta liasse : 10 bons falsifiés." },
        { label: "Vérification", text: "Le total doit être un MULTIPLE DE 10 (rapport du légiste). Si ce n'est pas le cas, recomptez." },
      ],
    },

    // ===============================================================
    //  ACTE 8 — LE MESSAGE CODÉ → CÉSAR, clé = G (PARAPHEUR)
    // ===============================================================
    {
      num: 8,
      key: 'a8',
      kind: 'cipher',
      title: 'LE MESSAGE CODÉ',
      place: "Villa Médicis (La Varenne) — réveillon de la mairie",
      article: {
        source: "DERNIER MESSAGE DE GUILLAUME — chiffré",
        date: "Soir du crime",
        body:
          "Sur le miroir, un seul mot chiffré. La clé n'est pas écrite : c'est la LETTRE que la " +
          "ville vous a dessinée (acte 5). Sa position dans l'alphabet donne le décalage de César.",
      },
      // César : texte = clair décalé de +shift. Clé G = 7ᵉ lettre → reculer de 7.
      cipher: {
        ciphertext: 'WHYHWOLBY',
        keyLetter: 'G',
        shift: 7,
        plain: 'PARAPHEUR',
        help: "Clé = la lettre du plan. Trouvez son rang dans l'alphabet, puis reculez CHAQUE lettre d'autant.",
      },
      scene:
        "Vous tenez le coupable (Guillaume), les complices (Erzen, Neves, Lejarre), le compte (50) " +
        "et la date (2013). Le décalage n'est pas donné : c'est le rang de la lettre du plan. " +
        "Décodez le mot — il nomme l'objet du mobile et clôt le dossier.",
      riddle:
        "Décodez « WHYHWOLBY ». La clé est la lettre du plan (acte 5) ; son rang dans l'alphabet = " +
        "le décalage à reculer. Quel mot obtenez-vous ?",
      answer: 'PARAPHEUR',
      hints: [
        "La lettre du plan était G. G est la 7ᵉ lettre → reculez chaque lettre de 7 rangs.",
        "W − 7 = P ; H − 7 = A ; Y − 7 = R … continuez.",
        "Réponse : PARAPHEUR.",
      ],
      humor:
        "Note de l'inspecteur : Guillaume chiffre ses messages au poil… mais son mot de passe wifi " +
        "reste « azerty1234 ». Le génie a ses angles morts.",
      reveal:
        "DOSSIER CLOS — Le meurtrier est GUILLAUME, ancien DSI. Mobile : la VENGEANCE des parapheurs " +
        "perdus. Il avait retrouvé dans une benne le parapheur contenant les bons qu'il avait " +
        "rédigés, falsifiés par le DGS Frédéric ERZEN — épaulé par le falsificateur en chef Camus " +
        "LEJARRE (en cavale) — et payés par la directrice Nathalie NEVES. 50 bons salis, 50 verres " +
        "brisés. L'affaire Idéepôle aura fait une victime de plus.",
      fragments: [
        { label: "Rappel clé", text: "La clé du chiffre est la LETTRE obtenue sur le plan (acte 5). Retrouvez-la." },
        { label: "Le décalage", text: "Le décalage de César = le RANG de cette lettre dans l'alphabet (A=1, B=2, …)." },
        { label: "Méthode", text: "Pour LIRE, on RECULE chaque lettre du cryptogramme du nombre de rangs trouvé." },
        { label: "Amorce", text: "Les 3 premières lettres décodées donnent : P - A - R …" },
        { label: "Indice titre", text: "Relis le titre du dossier : « L'affaire des ___________ perdus »." },
      ],
    },
  ],

  // Écran final affiché quand les 8 actes sont résolus.
  finale: {
    title: "AFFAIRE RÉSOLUE",
    culprit: "GUILLAUME",
    role: "ancien DSI de la mairie de Saint-Maur-des-Fossés",
    mobile:
      "La vengeance des parapheurs perdus : ses bons de commande, falsifiés par le DGS Frédéric " +
      "Erzen — aidé du falsificateur en chef Camus Lejarre, en cavale — et payés par la directrice " +
      "Nathalie NEVES, retrouvés par hasard dans une benne du quartier de La Varenne.",
    cast:
      "Le réseau : Frédéric ERZEN (DGS, falsifiait) · Camus LEJARRE (technique, en fuite) · " +
      "Nathalie NEVES (finances, victime). Innocenté : Frédéric COUPAYE (lanceur d'alerte). " +
      "Meurtrier : GUILLAUME (ancien DSI trahi).",
    disclaimer:
      "Fiction. L'affaire Bygmalion/Idéepôle, le magazine municipal et les lieux sont réels " +
      "(sources citées) ; le meurtre, les personnages et les suspects sont inventés pour le jeu.",
  },
};
