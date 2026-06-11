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
