// =====================================================================
//  PIXEL PANIC — serveur principal (Express + SSE)
//  Lance avec : npm install && npm start
// =====================================================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import multer from 'multer';
import QRCode from 'qrcode';
import { CONFIG, PLAYERS, NPCS } from './config.js';
import { AVATARS } from './data/avatars.js';
import { SCENARIO_SLIDES, AVATAR_BRIEF } from './data/briefing.js';
import { PHOTO_MISSIONS } from './data/photos.js';
import { SPOTLIGHT_DEFIS } from './data/spotlight.js';
import { ENQUETE } from './data/enquete.js';
import { WORLDS } from './data/worlds.js';
import { GameState } from './game/state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dossier uploads (photos joueurs)
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
mkdirSync(UPLOADS_DIR, { recursive: true });
const photoUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `ph_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter(req, file, cb) { cb(null, /^image\//.test(file.mimetype)); },
});

const app = express();
const game = new GameState();

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public', 'static')));
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Pages -----------------------------------------------------------
app.get('/', (req, res) => res.redirect('/borne'));
app.get('/borne', (req, res) => res.sendFile(path.join(__dirname, 'public', 'borne.html')));
app.get('/gm', (req, res) => res.sendFile(path.join(__dirname, 'public', 'gm.html')));
app.get('/print', (req, res) => res.sendFile(path.join(__dirname, 'public', 'print.html')));
app.get('/print-enquete', (req, res) => res.sendFile(path.join(__dirname, 'public', 'print-enquete.html')));

// Données complètes de l'enquête pour la page d'impression du MJ (cartes +
// fiche solution). Réservé à l'organisateur — contient les réponses.
app.get('/api/enquete/full', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ enquete: ENQUETE });
});

// Données pour la page d'impression (cartes-avatars + QR + colis)
app.get('/api/print', async (req, res) => {
  const players = [];
  for (const p of PLAYERS) {
    const joinUrl = `${CONFIG.publicUrl}/j/${p.token}`;
    let qr = null;
    try { qr = await QRCode.toDataURL(joinUrl, { margin: 1, width: 260, color: { dark: '#160a2e', light: '#ffffff' } }); } catch (_) {}
    players.push({
      id: p.id, name: p.name, avatar: p.avatar,
      avatarInfo: AVATARS[p.avatar] || null,
      isHero: !!p.isHero, joinUrl, qr,
    });
  }
  const colis = WORLDS.map((w) => ({
    num: w.colis, titre: w.titre, enigme: w.enigme,
    code: w.resoluParVote ? null : w.code, contenu: w.colisContenu || [],
  }));
  res.json({ players, npcs: NPCS, colis, publicUrl: CONFIG.publicUrl });
});

// Données du briefing affiché sur la BORNE (scénario + attendus par joueur)
app.get('/api/briefing', (req, res) => {
  const players = PLAYERS.map((p) => {
    const a = AVATARS[p.avatar] || {};
    return {
      name: p.name, avatar: p.avatar, avatarName: a.name, emoji: a.emoji,
      color: a.color, brief: AVATAR_BRIEF[p.avatar] || '', isHero: !!p.isHero,
    };
  });
  res.json({ scenario: SCENARIO_SLIDES, players });
});
app.get('/j/:token', (req, res) => res.sendFile(path.join(__dirname, 'public', 'joueur.html')));

// Config YouTube exposée publiquement (IDs de playlists, pas de secret)
app.get('/api/ytconfig', (req, res) => {
  function extractList(url) {
    const m = (url || '').match(/[?&]list=([^&]+)/);
    return m ? m[1] : (url || '');
  }
  function extractVideo(url) {
    const m = (url || '').match(/[?&]v=([^&]+)/) || (url || '').match(/youtu\.be\/([^?&]+)/);
    const t = (url || '').match(/[?&]t=(\d+)/);
    return { id: m ? m[1] : '', start: t ? parseInt(t[1], 10) : 0 };
  }
  // Blind-tests : map { theme: listId } (on extrait l'ID de chaque URL/ID)
  const btSrc = CONFIG.blindtestPlaylists || {};
  const blindtest = {};
  for (const theme of Object.keys(btSrc)) {
    const id = extractList(btSrc[theme]);
    if (id) blindtest[theme] = id;
  }
  res.set('Cache-Control', 'no-store');
  res.json({
    ambiance: extractList(CONFIG.ambianceYoutube),
    briefing: extractVideo(CONFIG.briefingYoutube),
    blindtest,
    pacman: extractVideo(CONFIG.pacmanYoutube),
  });
});

// --- État courant (repli en polling si le SSE est bufferisé par un proxy) ---
app.get('/api/state', (req, res) => {
  const token = req.query.token || null;
  if (token) {
    const p = game.playerByToken(token);
    if (p) game.connectPlayer(p.id);
  }
  res.set('Cache-Control', 'no-store');
  res.json(game.publicState(token));
});

// --- Flux temps réel (SSE) ------------------------------------------
// La borne s'abonne sans token ; un joueur s'abonne avec ?token=...
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  const token = req.query.token || null;
  if (token) {
    const p = game.playerByToken(token);
    if (p) game.connectPlayer(p.id);
  }

  const send = () => {
    res.write(`data: ${JSON.stringify(game.publicState(token))}\n\n`);
  };
  send(); // état initial
  const unsubscribe = game.subscribe(send);
  const ping = setInterval(() => res.write(': ping\n\n'), 20000);

  req.on('close', () => {
    clearInterval(ping);
    unsubscribe();
  });
});

// --- API joueur ------------------------------------------------------
function requirePlayer(req, res) {
  const token = req.body.token || req.query.token;
  const p = token && game.playerByToken(token);
  if (!p) { res.status(403).json({ error: 'Token invalide.' }); return null; }
  return p;
}

app.post('/api/ready', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.setReady(p.id, req.body.ready !== false);
  res.json({ ok: true });
});

app.post('/api/code', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  res.json(game.submitCode(p.id, req.body.code || ''));
});

// Monde 6 : un joueur saisit la SÉQUENCE LÉGENDAIRE (Konami) sur sa manette
app.post('/api/w6/konami', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  res.json(game.submitW6Konami(p.id, req.body.code || ''));
});

// Vidéo-indice : un joueur demande un indice → la borne diffuse la vidéo du monde
app.post('/api/hint', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  res.json(game.requestHintVideo(p.id));
});
// La borne signale la fin de la vidéo-indice (pas de token : c'est la borne)
app.post('/api/hint/clear', (req, res) => {
  game.clearHintVideo();
  res.json({ ok: true });
});

app.post('/api/buzz', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.buzz(p.id);
  res.json({ ok: true });
});

app.post('/api/vote', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.castVote(p.id, req.body.targetId);
  res.json({ ok: true });
});

app.post('/api/answer', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.quizAnswer(p.id, req.body.choice);
  res.json({ ok: true });
});

// --- Photos joueurs --------------------------------------------------
app.post('/api/photo/upload', photoUpload.single('photo'), (req, res) => {
  const token = req.body?.token;
  const p = token && game.playerByToken(token);
  if (!p) return res.status(403).json({ error: 'Token invalide.' });
  if (!req.file) return res.status(400).json({ error: 'Aucune image reçue.' });
  const missionIdx = parseInt(req.body.missionIdx || '0', 10);
  const missions = PHOTO_MISSIONS[p.avatar] || [];
  const mission = missions[missionIdx] || null;
  const photo = {
    id: `ph_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    playerId: p.id,
    playerName: p.name,
    avatar: p.avatar,
    missionIdx,
    missionLabel: mission?.label || `Défi #${missionIdx + 1}`,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    uploadedAt: Date.now(),
  };
  game.addPhoto(photo);
  res.json({ ok: true, photo });
});

app.post('/api/photo/vote', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  const { photoId, category } = req.body;
  const ok = game.castPhotoVote(p.id, photoId, category);
  res.json({ ok });
});

// Ouvre le vote photo (appelé par la BORNE à la fin de la vidéo finale, sans token)
app.post('/api/photo/openvote', (req, res) => {
  game.setPhotoPhase('vote');
  res.json({ ok: true });
});

// --- Blind-test dynamique : collecte de titres via IFrame API ---------
// La BORNE poste chaque titre détecté (onStateChange PLAYING)
app.post('/api/blindtest/addtrack', (req, res) => {
  const { theme, videoId, videoTitle } = req.body || {};
  game.addPlaylistTrack(theme, videoId, videoTitle);
  res.json({ ok: true, total: game.themeTrackCount(theme) });
});

// La BORNE poste TOUS les IDs d'une playlist (getPlaylist) → titrage via oEmbed
app.post('/api/blindtest/playlist', async (req, res) => {
  const theme = req.body?.theme || 'rock';
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const added = await game.ingestPlaylist(theme, ids);
  res.json({ ok: true, total: game.themeTrackCount(theme), added });
});

// --- Spotlight : vote de la salle (réussi / raté) --------------------
app.post('/api/spotlight/vote', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.spotlightVote(p.id, req.body.verdict);
  res.json({ ok: true });
});

// Liste des défis Spotlight (pour le menu déroulant du GM)
app.get('/api/spotlight/defis', (req, res) => {
  res.json({ defis: SPOTLIGHT_DEFIS });
});

// Défi des enfants joué directement sur la BORNE (pas de token)
app.post('/api/kids/done', (req, res) => {
  game.markKidsDone();
  res.json({ ok: true });
});

// Pac-Man : le joueur envoie une direction (up/down/left/right)
app.post('/api/pacman/dir', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.pacmanDir(p.id, req.body.dir);
  res.json({ ok: true });
});

// Tetris multijoueur : le joueur envoie une action (left/right/rotate/down/drop)
app.post('/api/tetris/move', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.tetrisMove(p.id, req.body.dir);
  res.json({ ok: true });
});

// Tron / Snake : direction (up/down/left/right)
app.post('/api/tron/move', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.tronMove(p.id, req.body.dir);
  res.json({ ok: true });
});

// 2048 : glissement (up/down/left/right)
app.post('/api/2048/move', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.g2048Move(p.id, req.body.dir);
  res.json({ ok: true });
});

// Pong : déplacement de la raquette (minus/plus le long du côté)
app.post('/api/pong/move', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.pongMove(p.id, req.body.dir);
  res.json({ ok: true });
});

// Mosaïque : un joueur propose la réponse (le mot reconstitué)
app.post('/api/mosaic/guess', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  res.json(game.mosaicGuess(p.id, req.body.text || ''));
});

// Dessine-moi : le dessinateur envoie ses traits ; les autres devinent
app.post('/api/draw/update', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.drawUpdate(p.id, req.body.strokes);
  res.json({ ok: true });
});
app.post('/api/draw/guess', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  res.json(game.drawGuess(p.id, req.body.text || ''));
});

// Roue des gages : un joueur vote pour le meilleur
app.post('/api/roue/vote', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.roueVote(p.id, req.body.targetId);
  res.json({ ok: true });
});

// Enquête collaborative : un joueur propose un code pour l'acte courant
app.post('/api/enquete/code', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  res.json(game.submitEnqueteCode(p.id, req.body.code || ''));
});

// Séquence musicale : le joueur joue une de ses notes
app.post('/api/music/press', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.musicPress(p.id, req.body.index);
  res.json({ ok: true });
});

// Piano réparti : le joueur appuie sur une touche de son demi-octave
app.post('/api/piano/press', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.pianoPress(p.id, req.body.off);
  res.json({ ok: true });
});

// Piano réparti : un joueur demande à la BORNE de rejouer la mélodie
app.post('/api/piano/replay', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.pianoDemo();
  res.json({ ok: true });
});

// --- API Game Master (Vincent éveillé OU Marc l'hôte) ---------------
app.post('/api/gm/gage', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  const allowed = p.isHost || (p.isHero && game.heroAwakened);
  if (!allowed) return res.status(403).json({ error: 'Pouvoir non débloqué.' });
  res.json(game.drawGage(req.body.pool || null, req.body.targetId || null));
});

// Extrait l'ID vidéo d'une URL/ID YouTube (pour la vidéo de fête du Game Master).
function ytVideoId(url) {
  const m = (url || '').match(/[?&]v=([^&]+)/) || (url || '').match(/youtu\.be\/([^?&]+)/);
  return m ? m[1] : (url || '');
}

// Pouvoirs « Game Master » de Vincent : lancer les activités-missions du Monde 4
// et valider le monde une fois toutes les missions accomplies.
app.post('/api/gm/hero', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  const allowed = p.isHost || (p.isHero && game.heroAwakened);
  if (!allowed) return res.status(403).json({ error: 'Pouvoir non débloqué.' });
  const { action, payload = {} } = req.body || {};
  if (action === 'validate') return res.json(game.heroValidateWorld());
  if (action === 'stop') { game.stopActivity(); return res.json({ ok: true }); }
  if (action === 'launch') {
    const allowedTypes = ['videoshow', 'blindtest', 'quiz', 'roue_des_gages', 'tetris', 'pacman', 'draw', 'pong', 'anecdote'];
    const type = payload.type;
    if (!allowedTypes.includes(type)) return res.status(400).json({ error: 'Activité non autorisée.' });
    let opts = payload.opts || {};
    if (type === 'videoshow') {
      // Vidéo de FÊTE (id côté serveur, le téléphone ne le connaît pas).
      opts = {
        video: ytVideoId(CONFIG.feteYoutube) || '7kyY29BHTZs',
        topLabel: '🎉 SOIRÉE !', chyron: 'Le GAME MASTER lance la fête ! 🎶',
        footer: 'Tout le monde danse 💃🕺', skipIntro: true,
      };
    } else if (type === 'blindtest' && !opts.theme) {
      opts = { theme: 'rock' };
    } else if (type === 'quiz' && !opts.deck) {
      opts = { deck: 'videogame' };
    } else if (type === 'roue_des_gages' && !opts.pool) {
      opts = { pool: 'vincent' };
    }
    game.startActivity(type, opts);
    return res.json({ ok: true });
  }
  return res.status(400).json({ error: 'Action inconnue.' });
});

// --- API GM console (Marc) — protégée par mot de passe --------------
function requireGM(req, res) {
  if (!CONFIG.gmPassword) return true; // pas de mot de passe configuré = accès libre
  const pwd = req.body.password || req.query.password;
  if (pwd !== CONFIG.gmPassword) { res.status(403).json({ error: 'Mot de passe GM invalide.' }); return false; }
  return true;
}

app.get('/api/gm/state', (req, res) => {
  if (!requireGM(req, res)) return;
  // Bloc réservé GM : quelle musique lancer + la bonne réponse
  const q = game.quizQuestion();
  const quizMaster = q ? {
    sub: game.activity?.sub,
    qIndex: game.activity?.qIndex,
    prompt: q.prompt,
    play: q.play || null,
    bonneReponse: q.choices[q.answer],
  } : null;
  const cw = game.currentWorld();
  res.json({
    ...game.publicState(),
    glitchId: game.glitchId, // l'hôte a le droit de savoir
    glitchName: game.player(game.glitchId)?.name || null,
    votes: game.votes,
    quizMaster,
    enqueteMaster: game.enqueteMaster(),
    mosaicWord: game.activity && game.activity.type === 'mosaic' ? game.activity.word : null,
    playlistTrackCount: game.themeTrackCount(game.activity?.type === 'blindtest' ? game.activity.theme : null),
    // Mot secret du Dessine-moi (l'hôte le voit pour animer)
    drawWord: game.activity?.type === 'draw' ? game.activity.word : null,
    // Solution du monde courant (l'hôte doit pouvoir débloquer/aider)
    worldCode: cw ? cw.code : null,
    worldResoluParVote: cw ? !!cw.resoluParVote : false,
    worldIndices: cw ? cw.indices || null : null,
  });
});

app.post('/api/gm/action', (req, res) => {
  if (!requireGM(req, res)) return;
  const { action, payload = {} } = req.body;
  switch (action) {
    case 'start': game.startGame(); break;
    case 'assignGlitch': game.assignGlitch(); break;
    case 'completeWorld': game.completeWorld({ celebrate: false }); break;
    case 'startActivity': game.startActivity(payload.type, payload.opts || {}); break;
    case 'stopActivity': game.stopActivity(); break;
    case 'quizReveal': game.quizReveal(); break;
    case 'quizNext': game.quizNext(); break;
    case 'musicDemo': game.musicDemo(); break;
    case 'musicHint': game.musicHint(); break;
    case 'pianoDemo': game.pianoDemo(); break;
    case 'drawGage': game.drawGage(payload.pool || null, payload.targetId || null); break;
    case 'clearGage': game.clearGage(); break;
    case 'startVote': game.startVote(); break;
    case 'tallyVotes': return res.json({ ok: true, result: game.tallyVotes() });
    case 'loseLife': game.loseLife(payload.playerId); break;
    case 'reset': game.reset(); break;
    case 'setPhotoPhase': game.setPhotoPhase(payload.phase ?? null); break;
    case 'blindtestAsk': game.blindtestAsk(); break;
    case 'spotlightOpenVote': game.spotlightOpenVote(); break;
    case 'spotlightTally': game.spotlightTally(); break;
    case 'drawNext': game.drawNext(); break;
    case 'drawReveal': game.drawReveal(); break;
    case 'roueOpenVote': game.roueOpenVote(); break;
    case 'roueTally': game.roueTally(); break;
    case 'mosaicReveal': game.mosaicReveal(payload.on !== false); break;
    case 'clearHint': game.clearHintVideo(); break;
    case 'enqueteHint': game.enqueteHint(); break;
    case 'enqueteSkip': game.enqueteSkip(); break;
    default: return res.status(400).json({ error: 'Action inconnue: ' + action });
  }
  res.json({ ok: true });
});

app.listen(CONFIG.port, () => {
  console.log(`\n🕹️  PIXEL PANIC en ligne`);
  console.log(`   Borne   : http://localhost:${CONFIG.port}/borne`);
  console.log(`   GM      : http://localhost:${CONFIG.port}/gm`);
  console.log(`   Joueur  : http://localhost:${CONFIG.port}/j/<token>`);
  console.log(`   Public  : ${CONFIG.publicUrl}\n`);
});
