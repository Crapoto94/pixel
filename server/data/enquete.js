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
//   3 QUI A VOULU PARLER ? — docs répartis : démasquer le faux mail . DSI-312
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

  // Texte affiché sur CHAQUE téléphone pendant le briefing en slides.
  phoneBrief: "🔪 MEURTRE À SAINT-MAUR\nRegardez la borne 📺",

  // Briefing d'OUVERTURE en SLIDES (défilent sur la BORNE, ambiance mystérieuse),
  //  AVANT l'acte 1. `sec` = durée d'affichage de la slide (12 s chacune).
  briefingSlides: [
    { title: "DOSSIER 94100", text: "SAINT-MAUR-DES-FOSSÉS. Une nuit d'hiver. La boucle de la Marne dort sous le givre. À l'Hôtel de Ville, une seule fenêtre reste allumée : la salle des mariages.", sec: 10 },
    { title: "03 h 12 — L'APPEL", text: "Un agent de sécurité pousse la lourde porte de la salle des mariages. Ce qu'il découvre le fera trembler jusqu'au matin… et vous tiendra éveillés toute la nuit.", sec: 10 },
    { title: "LA VICTIME", text: "Nathalie NEVES, directrice des finances de la mairie. Étendue au sol, élégante jusque dans la mort, le visage tourné vers la table d'honneur. Comme si elle attendait encore quelqu'un.", sec: 10 },
    { title: "CINQUANTE COUPES", text: "Autour d'elle, cinquante coupes de champagne. Toutes brisées. Une seule, intacte, encore pleine. Un toast funèbre. Personne ne porte cinquante coupes par hasard. C'est un message.", sec: 10 },
    { title: "AUCUNE EFFRACTION", text: "Portes verrouillées de l'intérieur. Fenêtres closes. Aucune trace de lutte. Le meurtrier connaissait les lieux. Il connaissait les codes. Il était… de la maison.", sec: 10 },
    { title: "LES PARAPHEURS PERDUS", text: "Dans le tiroir de la victime : des magazines municipaux annotés au stylo rouge, et trois mots griffonnés à la hâte — « les parapheurs perdus ». Une dette que quelqu'un est venu réclamer.", sec: 10 },
    { title: "LE SCANDALE", text: "Des années durant, un marché de communication de la mairie aurait été truqué. Fausses factures. Bons de commande réécrits après signature. Des centaines de milliers d'euros évaporés dans l'encre.", sec: 10 },
    { title: "LE RÉSEAU", text: "Qui falsifiait ? Qui payait ? Qui couvrait ? Et qui, un soir de trop, a voulu parler ? La mort de Nathalie Neves ne cache pas un crime. Elle en cache toute une chaîne.", sec: 10 },
    { title: "LA BRIGADE, C'EST VOUS", text: "Cette nuit, vous êtes les enquêteurs. Sept regards, sept mémoires. Aucun de vous ne détient la vérité entière — mais chacun en tient un fragment. Seuls, vous êtes aveugles. Ensemble, redoutables.", sec: 10 },
    { title: "LA MÉTHODE", text: "Rien ne vous sera donné en clair. La BORNE affiche les DOCUMENTS — articles, registres, plans, e-mails. Vos téléphones gardent vos PIÈCES À CONVICTION. Croisez. Déduisez. Tapez le code de chaque acte.", sec: 10 },
    { title: "HUIT ACTES", text: "Huit actes vous séparent du nom du meurtrier. Huit verrous. Huit vérités. Au bout du couloir : un dossier refermé… ou une affaire enterrée à jamais.", sec: 10 },
    { title: "L'ENQUÊTE COMMENCE", text: "Inspecteurs, prenez place. La nuit sera longue. Le premier dossier s'ouvre maintenant. ACTE 1 — La revue de presse.", sec: 10 },
  ],

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
      // Les pièces ci-dessous NE s'affichent PAS d'emblée : ce sont des indices
      // révélés UN PAR UN par le MJ (bouton « Donner un indice »).
      fragmentsHidden: true,
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
        hideHeader: true, // la borne n'affiche PAS l'en-tête « 📄 … — — », juste le contenu
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
    //  ACTE 3 — QUI A VOULU PARLER ? → DOCUMENTS répartis (DSI-312)
    //  La borne n'affiche QUE l'énigme. Les documents (journal des badges,
    //  e-mails, annuaire) sont à OUVRIR sur les téléphones des joueurs.
    // ===============================================================
    {
      num: 3,
      key: 'a3',
      kind: 'docs',
      title: 'QUI A VOULU PARLER ?',
      place: "Direction des Systèmes d'Information — messagerie & contrôle d'accès",
      // Documents À VISUALISER, répartis entre les joueurs (un par téléphone).
      docs: [
        {
          id: 'journal',
          label: 'JOURNAL DES BADGES',
          title: '🔑 JOURNAL DES BADGES — nuit de JEUDI',
          body:
            "Entrées / sorties enregistrées (badge nominatif) :\n\n" +
            "07 h 52   Carla LENOIR (Finances) ......... ENTRÉE\n" +
            "08 h 05   Frédéric ERZEN (DGS) ............ ENTRÉE\n" +
            "08 h 30   Frédéric COUPAYE (DSI) .......... ENTRÉE\n" +
            "09 h 14   Sophie MARAIS (RH) .............. ENTRÉE\n" +
            "12 h 40   Carla LENOIR ................... SORTIE\n" +
            "13 h 31   Carla LENOIR ................... ENTRÉE\n" +
            "17 h 58   Sophie MARAIS (RH) .............. SORTIE\n" +
            "18 h 20   Frédéric COUPAYE (DSI) .......... SORTIE\n" +
            "19 h 03   Frédéric ERZEN (DGS) ............ SORTIE — aucun retour cette nuit\n" +
            "21 h 10   Agent de sécurité (ronde) ...... ENTRÉE puis SORTIE\n" +
            "22 h 05   Carla LENOIR ................... SORTIE\n\n" +
            "Aucune autre entrée n'a été enregistrée après 22 h 05.",
        },
        {
          id: 'mail1',
          label: "E-MAIL D'ALERTE n°1",
          title: "📧 E-MAIL D'ALERTE n°1",
          body:
            "De : « F. »   —   poste 4312\n" +
            "Reçu : MARDI, 18 h 42\n" +
            "Objet : bons de commande\n\n" +
            "« Les MONTANTS des bons sont RÉÉCRITS après signature. J'ai conservé des copies datées. Il faut que ça remonte. »",
        },
        {
          id: 'mail2',
          label: "E-MAIL D'ALERTE n°2",
          title: "📧 E-MAIL D'ALERTE n°2",
          body:
            "De : « F. »   —   poste 4207\n" +
            "Reçu : JEUDI, 23 h 11\n" +
            "Objet : RAS\n\n" +
            "« Je signale de vagues anomalies sur les bons. Rien de grave, sans doute une erreur de saisie. Je m'en occupe. »",
        },
        {
          id: 'annuaire',
          label: 'ANNUAIRE INTERNE',
          title: '📇 ANNUAIRE INTERNE — postes & étages',
          body:
            "Plages de postes téléphoniques par direction :\n\n" +
            "40xx → 1er étage → Accueil & État civil\n" +
            "41xx → 1er étage → Direction des Finances (N. NEVES)\n" +
            "42xx → 2e étage → Direction Générale des Services (DGS)\n" +
            "43xx → 3e étage → Systèmes d'Information (DSI)\n" +
            "44xx → 3e étage → Ressources Humaines (RH)\n" +
            "45xx → 4e étage → Services techniques\n" +
            "46xx → sous-sol → Archives & reprographie\n\n" +
            "MATRICULE d'un agent = code de sa direction (DGS, DSI, RH…) + les 3 chiffres de son poste.",
        },
      ],
      scene:
        "Deux signalements anonymes, signés « F. », dorment dans la messagerie. L'un est sincère, " +
        "l'autre a été planté par le coupable pour se faire passer pour lanceur d'alerte. Vos " +
        "documents sont sur vos téléphones : ouvrez-les, lisez-les à voix haute, recoupez.",
      riddle:
        "Un seul des deux e-mails d'alerte est sincère ; l'autre est un FAUX. Donnez le MATRICULE " +
        "du VRAI lanceur d'alerte : code du service (DGS ou DSI) suivi des 3 chiffres de son poste. " +
        "(ex. de format : DSI-000)",
      answer: 'DSI-312',
      hints: [
        "Le mail VAGUE de 23 h sent l'écran de fumée. Surtout : à quelle heure son auteur a-t-il QUITTÉ les lieux d'après les badges ?",
        "Mail 2 part du poste 4207 (42xx → 2ᵉ étage → DGS) à 23 h 11 — mais le seul badge de ce service, celui d'Erzen, indique une SORTIE à 19 h 03, sans retour. Mail 2 = FAUX.",
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
      // Pas de pièces « explicatives » : tout se déduit des DOCUMENTS ci-dessus.
      fragments: [],
    },

    // ===============================================================
    //  ACTE 4 — LA TABLE DES COMPTES → ÉLIMINER les homonymes (LEJARRE)
    //  Tous les docs sont sur les TÉLÉPHONES. La table est globale (visible
    //  par tous). Les 4 autres docs sont répartis un par joueur.
    // ===============================================================
    {
      num: 4,
      key: 'a4',
      kind: 'logic',
      fragmentsHidden: true,
      title: 'LE FALSIFICATEUR EN CHEF',
      place: "Direction des Finances — régie comptable & salle des serveurs",
      article: {
        source: "TABLE DES COMPTES ADMIN & PRESTATAIRES — restaurée",
        date: "—",
        hideOnBorne: true,
        body: "→ documents sur les téléphones",
      },
      docs: [
        // ── Doc global : visible par TOUS les joueurs ──
        {
          id: 'comptes',
          label: '📋 TABLE DES COMPTES',
          title: '💼 TABLE DES COMPTES ADMIN & PRESTATAIRES — restaurée',
          global: true,
          body:
            "Comptes actifs et archivés — Direction des Finances & prestataires :\n\n" +
            "Carla LENOIR ......... Comptable titulaire ......... AD-114  Marché public ........ EN POSTE\n" +
            "Christophe LAVAL ..... Responsable marchés ......... AD-115  Marché public ........ EN POSTE\n" +
            "Céline LEFEBVRE ...... Assistante comptable ......... AD-116  Marché public ........ Contrat terminé\n" +
            "Kevin LARENNE ........ Stagiaire BTS (6 mois) ....... AD-207  Temporaire ........... Parti — fin de stage\n" +
            "Sté NOVERIA .......... Maintenance informatique ...... AD-300  Marché public ........ Actif\n" +
            "Claude LERMITE ....... Consultant audit externe ...... AD-410  Marché public ........ Mission terminée\n" +
            "Cameron LYLE ......... Stagiaire RH (Licence 3) ...... AD-445  Temporaire ........... Parti — fin de stage\n" +
            "Camus LEJARRE ........ Prestataire systèmes & réseaux  AD-666  ⚠️ HORS MARCHÉ ...... PARTI sans préavis\n\n" +
            "⚠️  Journal serveur : les journaux d'audit ont été PURGÉS nuit du 24 par le compte AD-666.",
        },
        // ── Docs répartis : un par joueur (round-robin) ──
        {
          id: 'log_connexions',
          label: '🖥️ LOG DES CONNEXIONS',
          title: '🖥️ LOG SYSTÈME — Serveur FINSERV-01 (nuit du 23 au 24)',
          body:
            "23 h 12 — AD-114 (C. LENOIR) ............. Connexion FIN-COMPTA\n" +
            "23 h 47 — AD-114 (C. LENOIR) ............. Déconnexion\n" +
            "00 h 03 — AD-666 (identité masquée) ...... Connexion ADMIN\n" +
            "00 h 17 — AD-666 ......................... PURGE : journal_audit_T3.log [SUPPRIMÉ]\n" +
            "00 h 18 — AD-666 ......................... PURGE : journal_audit_T4.log [SUPPRIMÉ]\n" +
            "00 h 19 — AD-666 ......................... PURGE : journal_audit_T5.log [SUPPRIMÉ]\n" +
            "00 h 20 — AD-666 ......................... Déconnexion\n\n" +
            "⚠️  Aucun badge nominatif enregistré dans les locaux après 22 h 05\n" +
            "    (registre contrôle d'accès). Qui utilisait AD-666 depuis l'extérieur ?",
        },
        {
          id: 'repertoire',
          label: '📇 RÉPERTOIRE PRESTATAIRES',
          title: '📇 RÉPERTOIRE DES PRESTATAIRES — noms en L (extrait RH)',
          body:
            "LARENNE Kevin ....... Stagiaire fin d'études — BTS Comptabilité\n" +
            "                      Durée : 6 mois — Départ normal en juillet 2013\n\n" +
            "LAVAL Christophe .... Responsable coordination marchés publics\n" +
            "                      Toujours en poste — aucune irrégularité signalée\n\n" +
            "LEFEBVRE Céline ..... Assistante comptable (remplacement congé maternité)\n" +
            "                      Contrat terminé — départ prévu, aucune anomalie\n\n" +
            "LEJARRE Camus ....... Technicien systèmes & réseaux — « prestataire libre »\n" +
            "                      Compte AD-666 créé sur dérogation DGS (hors marché)\n" +
            "                      Départ non planifié — 29 juillet 2013\n\n" +
            "LENOIR Carla ........ Comptable titulaire, référente bons de commande\n" +
            "                      En poste — dernière revue annuelle : satisfaisante\n\n" +
            "LERMITE Claude ...... Consultant audit informatique (mission ponctuelle)\n" +
            "                      Mission terminée — rapport remis, aucun incident\n\n" +
            "LYLE Cameron ........ Stagiaire RH — Licence 3\n" +
            "                      Départ normal en fin de stage",
        },
        {
          id: 'bon_commande',
          label: '📄 BON DE COMMANDE FALSIFIÉ',
          title: '📄 BON DE COMMANDE n° BC-2013-047 (pièce à conviction)',
          body:
            "MAIRIE DE SAINT-MAUR-DES-FOSSÉS — Direction des Finances\n\n" +
            "N°      : BC-2013-047\n" +
            "Date    : 14 mars 2013\n" +
            "Objet   : Production « Saint-Maur Le Mag » n° 52 — 20 000 ex.\n" +
            "Fournisseur : Idéepôle (filiale Bygmalion)\n\n" +
            "┌─────────────────────────────────────────────────────┐\n" +
            "│ Montant INITIAL signé par le DGS :   36 000,00 €   │\n" +
            "│                                [barré, encre rouge] │\n" +
            "│ Montant RÉÉCRIT (autre écriture) :   58 500,00 €   │\n" +
            "└─────────────────────────────────────────────────────┘\n\n" +
            "Signataire d'origine : F. ERZEN — DGS\n" +
            "Visa comptable       : N. NEVES\n\n" +
            "→ Écart : 22 500 € — qui a réécrit ce montant après signature ?",
        },
      ],
      scene:
        "Erzen savait gonfler des montants, pas pirater un logiciel. Un « falsificateur en chef » " +
        "a ouvert la compta et effacé les logs, puis a filé. Plusieurs noms commencent par L dans " +
        "la TABLE — et vos documents individuels contiennent les éléments pour éliminer les innocents.",
      riddle:
        "Qui est le falsificateur en chef ? Lisez vos documents à voix haute et recoupez : " +
        "un seul nom est HORS marché, a purgé les logs la nuit du 24, et a disparu sans préavis. (nom de famille)",
      answer: 'LEJARRE',
      hints: [
        "Dans la table, repérez le seul compte créé HORS marché public (colonne statut).",
        "Le log des connexions montre que AD-666 a purgé 3 fichiers à minuit — depuis l'extérieur (aucun badge dans les locaux après 22 h 05). Le VPN était encore actif.",
        "Réponse : LEJARRE (fiche prestataire + compte AD-666 + départ précipité).",
      ],
      humor:
        "Note de l'inspecteur : Lejarre a fui si vite qu'il a laissé son mug « World's Best " +
        "Falsificateur » encore tiède, et 14 pizzas facturées au budget « fournitures de bureau ».",
      reveal:
        "ACTE 4 — Le falsificateur en chef est Camus LEJARRE : compte AD-666 créé hors marché sur " +
        "dérogation d'Erzen, accès VPN jamais révoqué, logs purgés à distance la nuit du 24, puis " +
        "cavale au petit matin. Le réseau est complet : ERZEN + NEVES + LEJARRE. Reste le tueur.",
      fragments: [
        { label: "Pièce D1 — le compte", text: "Le falsificateur opérait depuis un compte admin créé HORS marché public, sur dérogation du DGS. (Lequel, dans la table ?)" },
        { label: "Pièce D2 — la purge", text: "C'est CE compte qui a purgé les journaux d'audit dans la nuit du 24 — depuis l'extérieur des locaux." },
        { label: "Pièce D3 — le VPN", text: "Son accès VPN n'avait jamais été révoqué. Il pouvait se connecter de n'importe où, même depuis chez lui." },
        { label: "Pièce D4 — la cavale", text: "Il est parti un mardi matin avec ses cartons, sans préavis. Son bureau était vide avant 9 h." },
        { label: "Pièce D5 — homonymes", text: "Plusieurs noms commencent par L dans la table. Éliminez les marchés réguliers, les stagaires partis normalement, et les missions terminées sans incident." },
        { label: "Pièce D6 — témoin", text: "« Il faisait disparaître une ligne comptable comme un lapin. Techniquement brillant — et parfaitement discret. »" },
      ],
    },

    // ===============================================================
    //  ACTE 5 — LE PLAN → ORDONNER puis LIRE la lettre (G)
    // ===============================================================
    {
      num: 5,
      key: 'a5',
      kind: 'map',
      title: 'LE DERNIER PARCOURS — TRACEUR GPS',
      place: "Boucle de la Marne — du RER de Champigny à La Varenne",
      // Les pièces (repères/méthode) sont des indices révélés UN PAR UN par le MJ.
      fragmentsHidden: true,
      // Le traceur GPS est sur les TÉLÉPHONES (doc global), la borne n'affiche que la carte.
      article: {
        source: "TRACEUR GPS de N. NEVES — 10 derniers points",
        date: "Soir du crime",
        hideOnBorne: true,
        body:
          "• Place des Molènes ............. 21 h 53\n" +
          "• RER Champigny–Saint-Maur ...... 21 h 04\n" +
          "• Collège Louis Blanc ........... 21 h 46\n" +
          "• Infocom94 ..................... 22 h 01\n" +
          "• Mairie ........................ 21 h 21\n" +
          "• Impasse de la Ferme ........... 22 h 17\n" +
          "• L'atelier du golfeur .......... 21 h 29\n" +
          "• La Varenne–Chennevières ....... 22 h 09\n" +
          "• Stade Chéron .................. 21 h 12\n" +
          "• Place Adamville ............... 21 h 38",
      },
      docs: [
        {
          id: 'gps',
          label: '📍 TRACEUR GPS',
          title: '📍 TRACEUR GPS de N. NEVES — Soir du crime (10 derniers points)',
          global: true,
          body:
            "Points enregistrés (ordre BRUT du traceur — À REMETTRE dans l'ordre des heures) :\n\n" +
            "• Place des Molènes ............. 21 h 53\n" +
            "• RER Champigny–Saint-Maur ...... 21 h 04\n" +
            "• Collège Louis Blanc ........... 21 h 46\n" +
            "• Infocom94 ..................... 22 h 01\n" +
            "• Mairie ........................ 21 h 21\n" +
            "• Impasse de la Ferme ........... 22 h 17\n" +
            "• L'atelier du golfeur .......... 21 h 29\n" +
            "• La Varenne–Chennevières ....... 22 h 09\n" +
            "• Stade Chéron .................. 21 h 12\n" +
            "• Place Adamville ............... 21 h 38",
        },
      ],
      scene:
        "Le traceur GPS de la directrice a gardé en mémoire ses 10 derniers arrêts, cette nuit-là. " +
        "Son tout dernier parcours dessine une LETTRE — votre CLÉ pour la fin de l'enquête. " +
        "À vous de le faire réapparaître.",
      map: {
        instruction: "Reliez les 10 points DANS L'ORDRE DES HEURES (GPS) : quelle lettre se dessine ?",
        river: true,
        // Ordre chronologique (= ordre du tableau) → le tracé dessine un « G ».
        landmarks: [
          { name: "RER Champigny–Saint-Maur (21h04)", short: "RER Champigny–St-Maur", x: 70, y: 22, lbl: 't' },
          { name: "Stade Chéron (21h12)", short: "Stade Chéron", x: 46, y: 14, lbl: 't' },
          { name: "Mairie (21h21)", short: "Mairie", x: 24, y: 24, lbl: 'l' },
          { name: "L'atelier du golfeur (21h29)", short: "Atelier du golfeur", x: 15, y: 50, lbl: 'l' },
          { name: "Place Adamville (21h38)", short: "Place Adamville", x: 24, y: 76, lbl: 'l' },
          { name: "Collège Louis Blanc (21h46)", short: "Collège Louis Blanc", x: 50, y: 85, lbl: 'b' },
          { name: "Place des Molènes (21h53)", short: "Place des Molènes", x: 78, y: 76, lbl: 'b' },
          { name: "Infocom94 (22h01)", short: "Infocom94", x: 87, y: 52, lbl: 'r' },
          { name: "La Varenne–Chennevières (22h09)", short: "La Varenne–Chenneviè.", x: 70, y: 52, lbl: 't' },
          { name: "Impasse de la Ferme (22h17)", short: "Impasse de la Ferme", x: 58, y: 52, lbl: 'b' },
        ],
        letter: 'G',
      },
      riddle:
        "Triez les 10 points GPS par heure, reliez-les dans l'ordre sur le plan : quelle LETTRE " +
        "dessine le dernier parcours de Nathalie NEVES ? (1 lettre)",
      answer: 'G',
      hints: [
        "Remettez ces 10 points dans l'ordre des heures",
        "puis reliez-les sur le plan de la borne.",
        "Cette barre vers l'intérieur transforme un « C » en… G. Réponse : G.",
      ],
      humor:
        "Note de l'inspecteur : 10 arrêts en 1 h 13, dont un « atelier du golfeur ». La victime " +
        "peaufinait son swing avant de mourir. On respecte le professionnalisme.",
      reveal:
        "ACTE 5 — Remis dans l'ordre des heures, le dernier parcours dessine un G. Gardez cette " +
        "lettre : elle décodera le message final. Et elle pointe déjà une initiale parmi les suspects…",
      fragments: [
        { label: "Repère — départ & fin", text: "Le 1ᵉʳ point (21 h 04) est le RER Champigny–Saint-Maur ; le DERNIER (22 h 17), l'Impasse de la Ferme." },
        { label: "Méthode", text: "Reliez les points dans l'ordre des HEURES — pas dans l'ordre de la liste affichée." },
        { label: "Forme", text: "Le tracé fait une grande boucle ouverte… puis une petite barre qui RENTRE vers le centre." },
        { label: "La clé", text: "La lettre obtenue est une INITIALE qu'on retrouvera chez un suspect (acte 6) et qui sert de clé (acte 8)." },
      ],
    },

    // ===============================================================
    //  ACTE 6 — LES SUSPECTS → ÉLIMINER les alibis (GUILLAUME)
    // ===============================================================
    {
      num: 6,
      key: 'a6',
      kind: 'logic',
      title: 'LA NUIT DES SUSPECTS',
      place: "Boucle de la Marne — nuit du crime",
      // La table des alibis n'apparaît PAS sur la borne : chaque joueur détient
      // un fait brut sur un suspect ; l'alibi (ou son absence) est à DÉDUIRE.
      article: {
        source: "TABLEAU DES ALIBIS — nuit du crime",
        date: "Nuit du crime",
        hideOnBorne: true,
        body:
          "Cinq suspects, cinq mobiles. Chacun des enquêteurs détient un fait sur l'un d'eux ; à la " +
          "table de recouper ce qui tient debout et ce qui s'effondre.",
      },
      scene:
        "Cinq hommes en voulaient à la mairie. Cette nuit-là, chacun jure être ailleurs… mais un " +
        "seul ment. À vous de confronter leurs emplois du temps : lequel ne tient pas debout ?",
      riddle:
        "Un seul suspect n'a aucun emploi du temps vérifiable cette nuit-là — et il pouvait entrer " +
        "dans les archives. Qui est le meurtrier ? (son prénom)",
      answer: 'GUILLAUME',
      hints: [
        "Le meurtrier est entré dans les archives sans rien forcer : il en connaissait le code. Qui, parmi eux, avait encore un accès valide ?",
        "Recoupe chaque fait : un paiement, un tampon de passeport, une scène de théâtre, des caméras… trois de ces emplois du temps sont vérifiables ailleurs. Un quatrième suspect n'a tout simplement pas le bon profil d'accès.",
        "Il reste un ancien DSI dont personne ne peut dire où il était. Réponse : GUILLAUME.",
      ],
      humor:
        "Note de l'inspecteur : cinq suspects, cinq sourires gênés. L'un d'eux ment avec un aplomb " +
        "qui force presque le respect.",
      reveal:
        "ACTE 6 — Par élimination : GUILLAUME. Trois suspects étaient vérifiables ailleurs (La Rochelle, " +
        "scène du Théâtre, étranger), l'adjoint n'avait pas accès aux archives — restait l'ancien DSI " +
        "au badge jamais désactivé, sans le moindre emploi du temps. C'est lui. Reste à comprendre les 50 verres.",
      fragments: [
        { label: "Au sujet de BLAISE", text: "Sa carte bancaire a réglé un dîner à La Rochelle à 22 h 41. (Saint-Maur est à 450 km.)" },
        { label: "Au sujet de MARC", text: "À l'heure du crime, une photo le montre micro en main sur la scène du Théâtre de Saint-Maur, salle comble." },
        { label: "Au sujet de DJALAL", text: "Son passeport porte un tampon d'entrée à l'étranger daté de l'avant-veille. Aucun retour enregistré depuis." },
        { label: "Au sujet de VINCENT", text: "VINCENT est l'ADJOINT au maire (jamais à la DSI). Les caméras des marchés de Noël l'ont filmé sans interruption de 20 h à 23 h." },
        { label: "Au sujet de GUILLAUME", text: "Ancien responsable des systèmes d'information, parti il y a quelques mois pour « convenances personnelles ». Cette nuit-là, son téléphone était injoignable à partir de 19 h 30. Un voisin croit l'avoir vu rentrer tard — mais ne peut ni préciser l'heure ni le jurer. Aucun ticket, aucun paiement, aucune caméra n'atteste où il se trouvait." },
        { label: "La porte des archives", text: "Le meurtrier est entré dans le local d'archives sans forcer : il en connaissait le code. Seuls les anciens de la DSI au badge non désactivé l'ont encore." },
        { label: "Note de la DSI", text: "À un départ, le badge est coupé sous 48 h… sauf oubli. Un seul oubli a été signalé : celui d'un agent parti dans la précipitation." },
      ],
    },

    // ===============================================================
    //  ACTE 7 — LES LIASSES → ADDITIONNER (50)
    // ===============================================================
    {
      num: 7,
      key: 'a7',
      kind: 'count',
      title: 'Des verres et des bons',
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
        "cinquante verres cassés. Tu l'as ? C'est bon ?",
      answer: '50',
      hints: [
        "Le total doit être un MULTIPLE DE 10 (rapport du légiste). Si ce n'est pas le cas, recomptez.",
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
    //  ACTE 8 — LE MESSAGE CODÉ → CÉSAR, clé = G (PARAPHEURS)
    //  César +7 : PARAPHEURS → WHYHWOLBYZ  (S + 7 = Z)
    // ===============================================================
    {
      num: 8,
      key: 'a8',
      kind: 'cipher',
      fragmentsHidden: true,
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
        ciphertext: 'WHYHWOLBYZ',
        keyLetter: 'G',
        shift: 7,
        plain: 'PARAPHEURS',
        help: "Clé = la lettre du plan. Trouvez son rang dans l'alphabet, puis reculez CHAQUE lettre d'autant.",
      },
      scene:
        "Vous tenez le coupable (Guillaume), les complices (Erzen, Neves, Lejarre), le compte (50) " +
        "et la date (2013). Le décalage n'est pas donné : c'est le rang de la lettre du plan. " +
        "Décodez le mot — il nomme l'objet du mobile et clôt le dossier.",
      riddle:
        "Décodez « WHYHWOLBYZ ». La clé est la lettre du plan (acte 5) ; son rang dans l'alphabet = " +
        "le décalage à reculer. Quel mot obtenez-vous ?",
      answer: 'PARAPHEURS',
      hints: [
        "La lettre du plan était G. G est la 7ᵉ lettre → reculez chaque lettre de 7 rangs.",
        "W−7=P · H−7=A · Y−7=R · H−7=A · W−7=P · O−7=H · L−7=E · B−7=U · Y−7=R · Z−7=S",
        "Réponse : PARAPHEURS.",
      ],
      humor:
        "Note de l'inspecteur : Guillaume chiffre ses messages au poil… mais son mot de passe wifi " +
        "reste « azerty1234 ». Le génie a ses angles morts.",
      reveal:
        "DOSSIER CLOS — Le meurtrier est GUILLAUME, ancien DSI. Mobile : la VENGEANCE des PARAPHEURS " +
        "perdus. Il avait retrouvé dans une benne les parapheurs contenant les bons qu'il avait " +
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
