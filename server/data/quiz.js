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

  // ---- BLIND-TEST (le MJ lance l'extrait, réponses sur smartphone) --
  // Mélange thèmes de jeux vidéo + metal/rock (clin d'œil Hellfest).
  blindtest: [
    { prompt: '🎵 EXTRAIT #1 — Quel jeu ?', play: 'Thème principal de SUPER MARIO BROS.',
      choices: ['Sonic', 'Super Mario Bros.', 'Donkey Kong', 'Kirby'], answer: 1, points: 100, media: 'audio' },
    { prompt: '🎵 EXTRAIT #2 — Quel jeu ?', play: 'Thème de TETRIS (Korobeiniki)',
      choices: ['Tetris', 'Pac-Man', 'Snake', 'Bomberman'], answer: 0, points: 100, media: 'audio' },
    { prompt: '🎵 EXTRAIT #3 — Quel jeu ?', play: 'Thème principal de ZELDA',
      choices: ['Final Fantasy', 'Zelda', 'Dragon Quest', 'Chrono Trigger'], answer: 1, points: 100, media: 'audio' },
    { prompt: '🎸 EXTRAIT #4 — Quel groupe ?', play: 'METALLICA — Enter Sandman (riff intro)',
      choices: ['Iron Maiden', 'Metallica', 'Megadeth', 'Slayer'], answer: 1, points: 100, media: 'audio' },
    { prompt: '🎸 EXTRAIT #5 — Quel groupe ?', play: 'AC/DC — Thunderstruck (intro)',
      choices: ['Guns N’ Roses', 'AC/DC', 'Aerosmith', 'Kiss'], answer: 1, points: 100, media: 'audio' },
    { prompt: '🎸 EXTRAIT #6 — Quel groupe ?', play: 'RAMMSTEIN — Du Hast',
      choices: ['Rammstein', 'Nightwish', 'Sabaton', 'Gojira'], answer: 0, points: 150, media: 'audio' },
    { prompt: '🎵 EXTRAIT #7 — Quel jeu ?', play: 'Jingle de victoire de FINAL FANTASY',
      choices: ['Zelda', 'Final Fantasy', 'Pokémon', 'Mario Kart'], answer: 1, points: 150, media: 'audio' },
    { prompt: '🎸 EXTRAIT #8 — Quel groupe ?', play: 'IRON MAIDEN — The Trooper (riff)',
      choices: ['Judas Priest', 'Motörhead', 'Iron Maiden', 'Black Sabbath'], answer: 2, points: 150, media: 'audio' },
    { prompt: '🎵 EXTRAIT #9 — Quel jeu ?', play: 'Green Hill Zone — SONIC',
      choices: ['Sonic', 'Rayman', 'Crash Bandicoot', 'Mega Man'], answer: 0, points: 100, media: 'audio' },
    { prompt: '🎸 EXTRAIT #10 — Quel groupe ?', play: 'SYSTEM OF A DOWN — Chop Suey!',
      choices: ['Korn', 'Linkin Park', 'System of a Down', 'Limp Bizkit'], answer: 2, points: 150, media: 'audio' },
  ],
};

export function deckLength(deck) {
  return (QUESTIONS[deck] || []).length;
}
