// =====================================================================
//  Banques de questions — QUIZ (culture jeu vidéo) et BLIND-TEST.
//
//  Format d'une question :
//   { prompt, choices:[4], answer:<index 0-3>, points, media, play }
//   - media : null (texte) | 'audio' (blind-test)
//   - play  : pour le BLIND-TEST, l'extrait que le MJ (Marc) doit lancer.
//             Visible UNIQUEMENT sur la page GM (jamais borne/joueurs).
//   - audioUrl (option) : si tu déposes des fichiers dans public/static/audio/,
//             la BORNE peut les jouer toute seule. Sinon Marc lance la musique.
//
//  La bonne réponse n'est JAMAIS envoyée aux joueurs avant la révélation.
// =====================================================================

export const QUESTIONS = {
  // ---- QUIZ culture jeu vidéo -------------------------------------
  videogame: [
    { prompt: 'Dans quel jeu trouve-t-on le champignon « 1-UP » ?',
      choices: ['Sonic', 'Super Mario Bros.', 'Zelda', 'Pac-Man'], answer: 1, points: 100, media: null },
    { prompt: "Comment s'appelle le héros à l'épée de la saga The Legend of Zelda ?",
      choices: ['Zelda', 'Ganon', 'Link', 'Epona'], answer: 2, points: 100, media: null },
    { prompt: 'Combien de fantômes pourchassent Pac-Man ?',
      choices: ['3', '4', '5', '6'], answer: 1, points: 100, media: null },
    { prompt: 'Quelle société a créé la console Mega Drive ?',
      choices: ['Nintendo', 'Sony', 'SEGA', 'Atari'], answer: 2, points: 100, media: null },
    { prompt: 'La séquence « ↑↑↓↓←→←→ B A » est connue sous le nom de…',
      choices: ['Code Konami', 'Code Sega', 'Cheat Mario', 'Glitch 99'], answer: 0, points: 150, media: null },
    { prompt: '« FINISH HIM! » est la phrase culte de quel jeu de combat ?',
      choices: ['Street Fighter', 'Tekken', 'Mortal Kombat', 'Soul Calibur'], answer: 2, points: 100, media: null },
    { prompt: 'Quel Pokémon porte le numéro 1 du Pokédex national ?',
      choices: ['Pikachu', 'Bulbizarre', 'Salamèche', 'Carapuce'], answer: 1, points: 150, media: null },
    { prompt: 'Quel est le nom du grand gorille mascotte de Nintendo ?',
      choices: ['King Kong', 'Donkey Kong', 'Diddy', 'Kongo'], answer: 1, points: 100, media: null },
    { prompt: 'Dans quel jeu construit-on un monde entier en blocs cubiques ?',
      choices: ['Roblox', 'Terraria', 'Minecraft', 'Fortnite'], answer: 2, points: 100, media: null },
    { prompt: 'Dans Among Us, comment appelle-t-on le traître ?',
      choices: ['Le Glitch', "L'Imposteur", 'Le Saboteur', 'Le Bug'], answer: 1, points: 100, media: null },
    { prompt: 'Que signifient les lettres « GTA » ?',
      choices: ['Great Tank Army', 'Grand Theft Auto', 'Global Track Arena', 'Game Time Action'], answer: 1, points: 100, media: null },
    { prompt: 'Quelle est la couleur emblématique de Sonic le hérisson ?',
      choices: ['Rouge', 'Vert', 'Bleu', 'Jaune'], answer: 2, points: 50, media: null },
    { prompt: 'Dans Tetris, comment nomme-t-on la pièce en forme de carré ?',
      choices: ['Pièce I', 'Pièce O', 'Pièce T', 'Pièce L'], answer: 1, points: 150, media: null },
    { prompt: "Quel est le métier d'origine de Mario ?",
      choices: ['Électricien', 'Plombier', 'Charpentier', 'Jardinier'], answer: 1, points: 50, media: null },
  ],

  // ---- QUIZ ANNÉES 80 ---------------------------------------------
  eighties: [
    { prompt: 'Quel casse-tête coloré a été la folie du début des années 80 ?',
      choices: ['Le Tamagotchi', 'Le Rubik’s Cube', 'Le Furby', 'Le Yo-yo'], answer: 1, points: 100, media: null },
    { prompt: 'Quel album de Michael Jackson (1982) est le plus vendu de l’histoire ?',
      choices: ['Bad', 'Thriller', 'Off the Wall', 'Dangerous'], answer: 1, points: 100, media: null },
    { prompt: 'Dans « Retour vers le futur » (1985), quelle voiture sert de machine à voyager ?',
      choices: ['Ferrari', 'DeLorean', 'Cadillac', 'Coccinelle'], answer: 1, points: 100, media: null },
    { prompt: 'Quel baladeur Sony a révolutionné l’écoute nomade dans les années 80 ?',
      choices: ['iPod', 'Walkman', 'Discman', 'MiniDisc'], answer: 1, points: 100, media: null },
    { prompt: 'Quelle console portable Nintendo sort en 1989 ?',
      choices: ['Game Boy', 'Game Gear', 'PSP', 'Lynx'], answer: 0, points: 150, media: null },
    { prompt: 'Quel film de Spielberg (1982) met en scène un extraterrestre qui veut « téléphone maison » ?',
      choices: ['Gremlins', 'E.T.', 'Cocoon', 'Starman'], answer: 1, points: 100, media: null },
    { prompt: 'Quel groupe suédois a marqué les années 70-80 avec « Dancing Queen » ?',
      choices: ['Boney M.', 'ABBA', 'A-ha', 'Europe'], answer: 1, points: 100, media: null },
    { prompt: 'Quel dessin animé met en scène des « Maîtres de l’Univers » avec Musclor ?',
      choices: ['Les Bisounours', 'He-Man (Les Maîtres de l’Univers)', 'Goldorak', 'Cobra'], answer: 1, points: 100, media: null },
  ],

  // ---- QUIZ ANNÉES 90 ---------------------------------------------
  nineties: [
    { prompt: 'Quelle licence de monstres de poche débarque en 1996 sur Game Boy ?',
      choices: ['Digimon', 'Pokémon', 'Yo-kai Watch', 'Tamagotchi'], answer: 1, points: 100, media: null },
    { prompt: 'Quelle sitcom new-yorkaise avec 6 amis démarre en 1994 ?',
      choices: ['Seinfeld', 'Friends', 'Frasier', 'How I Met Your Mother'], answer: 1, points: 100, media: null },
    { prompt: 'Quel système d’exploitation Microsoft sort en 1995 ?',
      choices: ['Windows 98', 'Windows 95', 'Windows XP', 'Windows 3.1'], answer: 1, points: 100, media: null },
    { prompt: 'Quel film de James Cameron (1997) bat des records au box-office ?',
      choices: ['Avatar', 'Titanic', 'Terminator 2', 'Aliens'], answer: 1, points: 100, media: null },
    { prompt: 'Quelle console de Sony arrive en Europe en 1995 ?',
      choices: ['Dreamcast', 'PlayStation', 'Nintendo 64', 'Saturn'], answer: 1, points: 100, media: null },
    { prompt: 'Quel groupe grunge sort « Smells Like Teen Spirit » en 1991 ?',
      choices: ['Pearl Jam', 'Nirvana', 'Soundgarden', 'Oasis'], answer: 1, points: 150, media: null },
    { prompt: 'Quel girls band britannique chante « Wannabe » en 1996 ?',
      choices: ['Destiny’s Child', 'Spice Girls', 'TLC', 'All Saints'], answer: 1, points: 100, media: null },
    { prompt: 'Quel film de 1993 fait revivre des dinosaures dans un parc ?',
      choices: ['Godzilla', 'Jurassic Park', 'King Kong', 'Dinosaure'], answer: 1, points: 100, media: null },
  ],

  // ---- QUIZ ANIMÉS (mangas / dessins animés japonais) --------------
  anime: [
    { prompt: 'Dans « One Piece », quel est le rêve de Luffy ?',
      choices: ['Devenir Hokage', 'Devenir le Roi des Pirates', 'Trouver le Dragon', 'Sauver le monde'], answer: 1, points: 100, media: null },
    { prompt: 'De quel village ninja vient Naruto ?',
      choices: ['Suna (Sable)', 'Konoha (Feuille)', 'Kiri (Brume)', 'Iwa (Roche)'], answer: 1, points: 100, media: null },
    { prompt: 'Qui a créé le manga « Dragon Ball » ?',
      choices: ['Eiichiro Oda', 'Akira Toriyama', 'Masashi Kishimoto', 'Hayao Miyazaki'], answer: 1, points: 150, media: null },
    { prompt: 'À quelle race appartient Son Goku dans Dragon Ball Z ?',
      choices: ['Namek', 'Saiyan', 'Terrien', 'Majin'], answer: 1, points: 100, media: null },
    { prompt: 'Quel studio d’animation a produit « Mon voisin Totoro » ?',
      choices: ['Studio Ghibli', 'Toei Animation', 'Madhouse', 'Pierrot'], answer: 0, points: 100, media: null },
    { prompt: 'De quel type est Pikachu dans Pokémon ?',
      choices: ['Feu', 'Eau', 'Électrik', 'Plante'], answer: 2, points: 50, media: null },
    { prompt: 'Dans « Sailor Moon », l’héroïne se transforme grâce à un objet en forme de…',
      choices: ['Broche', 'Épée', 'Bague', 'Couronne'], answer: 0, points: 150, media: null },
    { prompt: 'Quel anime suit les frères Elric et l’alchimie ?',
      choices: ['Bleach', 'Fullmetal Alchemist', 'Death Note', 'Hunter x Hunter'], answer: 1, points: 150, media: null },
  ],

  // ---- QUIZ CULTURE TERRITORIALE (France & Val-de-Marne) -----------
  territoriale: [
    { prompt: 'Quel est le numéro du département du Val-de-Marne ?',
      choices: ['92', '93', '94', '95'], answer: 2, points: 100, media: null },
    { prompt: 'Quelle ville est la préfecture du Val-de-Marne ?',
      choices: ['Vincennes', 'Créteil', 'Nogent-sur-Marne', 'Ivry-sur-Seine'], answer: 1, points: 150, media: null },
    { prompt: 'Dans quelle région se trouve le Val-de-Marne ?',
      choices: ['Hauts-de-France', 'Île-de-France', 'Normandie', 'Centre-Val de Loire'], answer: 1, points: 100, media: null },
    { prompt: 'Combien la France métropolitaine compte-t-elle de régions depuis 2016 ?',
      choices: ['13', '18', '22', '27'], answer: 0, points: 150, media: null },
    { prompt: 'Combien y a-t-il de départements en France (outre-mer compris) ?',
      choices: ['96', '101', '110', '115'], answer: 1, points: 150, media: null },
    { prompt: 'Qui élit le maire d’une commune ?',
      choices: ['Les habitants directement', 'Le conseil municipal', 'Le préfet', 'Le président'], answer: 1, points: 100, media: null },
    { prompt: 'Comment appelle-t-on une commune, un département ou une région ?',
      choices: ['Une administration', 'Une collectivité territoriale', 'Une préfecture', 'Un canton'], answer: 1, points: 100, media: null },
    { prompt: 'Quelle rivière donne son nom au Val-de-Marne ?',
      choices: ['La Seine', 'La Marne', 'L’Oise', 'L’Yerres'], answer: 1, points: 100, media: null },
  ],

  // ---- QUIZ SAINT-MAUR-DES-FOSSÉS (sources : Wikipédia, Val-de-Marne Tourisme) ----
  saintmaur: [
    { prompt: 'Saint-Maur-des-Fossés est entourée par une boucle de quelle rivière ?',
      choices: ['La Seine', 'La Marne', 'L’Oise', 'La Bièvre'], answer: 1, points: 100, media: null },
    { prompt: 'Quels sont les codes postaux de Saint-Maur-des-Fossés ?',
      choices: ['94100 et 94210', '93100 et 93210', '92100 et 92210', '75012 et 75013'], answer: 0, points: 150, media: null },
    { prompt: 'En quelle année la ville prend-elle le nom de « Saint-Maur-des-Fossés » ?',
      choices: ['639', '1137', '1281', '1789'], answer: 2, points: 200, media: null },
    { prompt: 'Quel vestige médiéval de l’abbaye (1360) subsiste encore à Saint-Maur ?',
      choices: ['La Tour Rabelais', 'Le Donjon de Vincennes', 'La Tour Eiffel', 'Le Beffroi'], answer: 0, points: 200, media: null },
    { prompt: 'À la mort de quel roi l’abbaye de Saint-Maur fut-elle fondée (639) ?',
      choices: ['Clovis', 'Dagobert', 'Charlemagne', 'Louis IX'], answer: 1, points: 200, media: null },
    { prompt: 'La forme de la ville, cernée par la rivière, en fait surtout une…',
      choices: ['Île', 'Presqu’île (boucle)', 'Vallée', 'Colline'], answer: 1, points: 100, media: null },
    { prompt: 'Saint-Maur-des-Fossés appartient à quel département ?',
      choices: ['Seine-Saint-Denis', 'Hauts-de-Seine', 'Val-de-Marne', 'Essonne'], answer: 2, points: 100, media: null },
    { prompt: 'Vers quel fleuve la Marne se jette-t-elle juste après la boucle de Saint-Maur ?',
      choices: ['La Loire', 'La Seine', 'Le Rhône', 'La Garonne'], answer: 1, points: 100, media: null },
  ],

  // ---- BLIND-TEST — CLASSIC ROCK (pour plaire à tout le monde) -------
  //  yt    : lien/ID YouTube de l'extrait (Marc colle ses liens — voir
  //          docs/MUSIQUE-YOUTUBE.md). Laissé '' => mode manuel (MJ lance).
  //  start : seconde de départ de l'extrait (le "moment qui tue").
  //  La BORNE joue le son seul (vidéo masquée). `play` = aide-mémoire MJ.
  blindtest: [
    { prompt: '🎸 EXTRAIT #1 — Quel groupe ?', play: 'AC/DC — Highway to Hell',
      choices: ['AC/DC', 'Led Zeppelin', 'Deep Purple', 'The Who'], answer: 0, points: 100, media: 'audio', yt: '', start: 0 },
    { prompt: '🎸 EXTRAIT #2 — Quel titre ?', play: 'Queen — Bohemian Rhapsody',
      choices: ['We Will Rock You', 'Bohemian Rhapsody', 'Don’t Stop Me Now', 'Somebody to Love'], answer: 1, points: 100, media: 'audio', yt: '', start: 0 },
    { prompt: '🎸 EXTRAIT #3 — Quel titre ?', play: 'Survivor — Eye of the Tiger',
      choices: ['Eye of the Tiger', 'The Final Countdown', 'Jump', 'Livin’ on a Prayer'], answer: 0, points: 100, media: 'audio', yt: '', start: 0 },
    { prompt: '🎸 EXTRAIT #4 — Quel groupe ?', play: 'Deep Purple — Smoke on the Water (riff)',
      choices: ['Black Sabbath', 'Deep Purple', 'Cream', 'Rainbow'], answer: 1, points: 100, media: 'audio', yt: '', start: 0 },
    { prompt: '🎸 EXTRAIT #5 — Quel groupe ?', play: 'The Beatles — Hey Jude',
      choices: ['The Rolling Stones', 'The Beatles', 'The Kinks', 'The Beach Boys'], answer: 1, points: 100, media: 'audio', yt: '', start: 0 },
    { prompt: '🎸 EXTRAIT #6 — Quel titre ?', play: 'Eagles — Hotel California',
      choices: ['Hotel California', 'Sweet Home Alabama', 'Free Bird', 'More Than a Feeling'], answer: 0, points: 150, media: 'audio', yt: '', start: 0 },
    { prompt: '🎸 EXTRAIT #7 — Quel groupe ?', play: 'The Rolling Stones — (I Can’t Get No) Satisfaction',
      choices: ['The Doors', 'The Rolling Stones', 'The Animals', 'Creedence'], answer: 1, points: 100, media: 'audio', yt: '', start: 0 },
    { prompt: '🎸 EXTRAIT #8 — Quel titre ?', play: 'Bon Jovi — Livin’ on a Prayer',
      choices: ['You Give Love a Bad Name', 'Livin’ on a Prayer', 'It’s My Life', 'Always'], answer: 1, points: 150, media: 'audio', yt: '', start: 0 },
    { prompt: '🎸 EXTRAIT #9 — Quel titre ?', play: 'Toto — Africa',
      choices: ['Africa', 'Rosanna', 'Hold the Line', 'Carrie'], answer: 0, points: 100, media: 'audio', yt: '', start: 0 },
    { prompt: '🎸 EXTRAIT #10 — Quel groupe ?', play: 'Dire Straits — Sultans of Swing',
      choices: ['Dire Straits', 'Fleetwood Mac', 'Supertramp', 'Pink Floyd'], answer: 0, points: 150, media: 'audio', yt: '', start: 0 },
  ],
};

export function deckLength(deck) {
  return (QUESTIONS[deck] || []).length;
}
