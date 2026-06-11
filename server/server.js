// =====================================================================
//  PIXEL PANIC — serveur principal (Express + SSE)
//  Lance avec : npm install && npm start
// =====================================================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import { GameState } from './game/state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const game = new GameState();

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public', 'static')));

// --- Pages -----------------------------------------------------------
app.get('/', (req, res) => res.redirect('/borne'));
app.get('/borne', (req, res) => res.sendFile(path.join(__dirname, 'public', 'borne.html')));
app.get('/gm', (req, res) => res.sendFile(path.join(__dirname, 'public', 'gm.html')));
app.get('/j/:token', (req, res) => res.sendFile(path.join(__dirname, 'public', 'joueur.html')));

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

// Séquence musicale : le joueur joue une de ses notes
app.post('/api/music/press', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  game.musicPress(p.id, req.body.index);
  res.json({ ok: true });
});

// --- API Game Master (Vincent éveillé OU Marc l'hôte) ---------------
app.post('/api/gm/gage', (req, res) => {
  const p = requirePlayer(req, res); if (!p) return;
  const allowed = p.isHost || (p.isHero && game.heroAwakened);
  if (!allowed) return res.status(403).json({ error: 'Pouvoir non débloqué.' });
  res.json(game.drawGage(req.body.pool || null, req.body.targetId || null));
});

// --- API GM console (Marc) — protégée par mot de passe --------------
function requireGM(req, res) {
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
  res.json({
    ...game.publicState(),
    glitchId: game.glitchId, // l'hôte a le droit de savoir
    glitchName: game.player(game.glitchId)?.name || null,
    votes: game.votes,
    quizMaster,
  });
});

app.post('/api/gm/action', (req, res) => {
  if (!requireGM(req, res)) return;
  const { action, payload = {} } = req.body;
  switch (action) {
    case 'start': game.startGame(); break;
    case 'assignGlitch': game.assignGlitch(); break;
    case 'completeWorld': game.completeWorld(); break;
    case 'startActivity': game.startActivity(payload.type, payload.opts || {}); break;
    case 'stopActivity': game.stopActivity(); break;
    case 'quizReveal': game.quizReveal(); break;
    case 'quizNext': game.quizNext(); break;
    case 'musicDemo': game.musicDemo(); break;
    case 'musicHint': game.musicHint(); break;
    case 'drawGage': game.drawGage(payload.pool || null, payload.targetId || null); break;
    case 'clearGage': game.clearGage(); break;
    case 'startVote': game.startVote(); break;
    case 'tallyVotes': return res.json({ ok: true, result: game.tallyVotes() });
    case 'loseLife': game.loseLife(payload.playerId); break;
    case 'reset': game.reset(); break;
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
