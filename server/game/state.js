// =====================================================================
//  GameState — l'état partagé de la partie (en mémoire + sauvegarde JSON).
//  Toute mutation passe par une méthode qui appelle this.touch() pour
//  notifier les clients connectés (SSE) et persister sur disque.
// =====================================================================

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { PLAYERS, NPCS, CONFIG } from '../config.js';
import { AVATARS } from '../data/avatars.js';
import { WORLDS, getWorld, normalize } from '../data/worlds.js';
import { pickGage, GAGES } from '../data/gages.js';
import { QUESTIONS } from '../data/quiz.js';
import { PacmanGame } from './pacman.js';
import { TetrisGame } from './tetris.js';
import { TronGame } from './tron.js';
import { Game2048 } from './game2048.js';
import { NOTE_PALETTE, MELODY, MOSAIC_DEFAULT_WORD, pickMosaicWord } from '../data/collab.js';
import { AVATAR_MISSION, SOCIAL_FACTS } from '../data/clues.js';
import { PHOTO_MISSIONS } from '../data/photos.js';
import { SPOTLIGHT_DEFIS } from '../data/spotlight.js';
import { ENQUETE } from '../data/enquete.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAVE_FILE = path.join(__dirname, '..', 'save.json');

// Mosaïque : répartit L lettres en n parts entières aussi égales que possible.
function mosaicSplit(L, n) {
  const base = Math.floor(L / n), rem = L % n;
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
}
// Lettres aléatoires (leurres des lignes incorrectes de la mosaïque).
function randLetters(k) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < k; i++) s += A[Math.floor(Math.random() * 26)];
  return s;
}

export class GameState {
  constructor() {
    this.listeners = new Set(); // callbacks SSE
    this.playlistTracks = []; // titres collectés depuis ytBt — survit au game reset()
    this._autoAdvanceTimer = null; // timer interne non persisté
    this.reset(false);
    this.load();
  }

  // ---- Cycle de vie -------------------------------------------------
  reset(persist = true) {
    if (this.pacmanTimer) { clearInterval(this.pacmanTimer); this.pacmanTimer = null; }
    if (this.tetrisTimer) { clearInterval(this.tetrisTimer); this.tetrisTimer = null; }
    if (this.tronTimer) { clearInterval(this.tronTimer); this.tronTimer = null; }
    if (this.g2048Timer) { clearInterval(this.g2048Timer); this.g2048Timer = null; }
    if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
    if (this._roueTimer) { clearTimeout(this._roueTimer); this._roueTimer = null; }
    this.pacman = null; // partie Pac-Man en cours
    this.tetris = null; // partie Tetris en cours
    this.tron = null;   // partie Tron en cours
    this.g2048 = null;  // partie 2048 en cours
    this.pacRotation = []; // historique des rôles Pac (rotation entre manches)
    this.mosaicCount = 0; // manches de mosaïque jouées (difficulté croissante)
    this.phase = 'lobby'; // lobby | world | bonus | activity | finale | win
    this.worldIndex = 0; // index dans WORLDS
    this.activity = null; // activité BORNE en cours (objet)
    this.currentGage = null; // gage affiché en ce moment
    this.glitchId = null; // id du joueur traître (tiré au sort)
    this.glitchRevealed = false;
    this.heroAwakened = false; // Vincent a-t-il reçu ses pouvoirs ?
    this.kidsDone = false; // les Pixels (enfants) ont-ils réussi leur défi ?
    this.votes = {}; // { voterId: targetId }
    this.clues = {}; // { playerId: { mission, clue } } — réseau d'indices
    this.photos = []; // [{id, playerId, playerName, avatar, missionIdx, missionLabel, url, uploadedAt}]
    this.photoVotes = {}; // { voterId: { belle: photoId|null, rigolote: photoId|null } }
    this.photoPhase = null; // null | 'vote' | 'results'
    this.log = []; // journal d'événements (récents en tête)
    this.players = PLAYERS.map((p) => ({
      ...p,
      connected: false,
      lives: 3,
      coins: 0,
      ready: false,
      eliminated: false,
    }));
    if (persist) this.touch();
  }

  load() {
    try {
      if (fs.existsSync(SAVE_FILE)) {
        const data = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
        Object.assign(this, data);
        this.listeners = new Set(); // ne pas restaurer les listeners
        this.addLog('💾 Partie restaurée depuis la sauvegarde.');
      }
    } catch (e) {
      console.error('Échec du chargement de la sauvegarde:', e.message);
    }
  }

  save() {
    // On exclut ce qui n'est pas sérialisable / éphémère :
    //  - listeners (Set de callbacks SSE)
    //  - pacmanTimer / _autoAdvanceTimer (objets Timer)
    //  - pacman (partie en cours, recréée à chaque manche)
    const { listeners, pacmanTimer, pacman, tetrisTimer, tetris, tronTimer, tron,
      g2048Timer, g2048, _autoAdvanceTimer, _roueTimer, ...data } = this;
    try {
      fs.writeFileSync(SAVE_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Échec de la sauvegarde:', e.message);
    }
  }

  // ---- Notifications SSE -------------------------------------------
  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  touch() {
    this.save();
    this.broadcast();
  }

  // Diffuse aux clients SANS sauvegarder (utilisé par la boucle Pac-Man)
  broadcast() {
    for (const cb of this.listeners) {
      try { cb(); } catch (_) { /* ignore */ }
    }
  }

  addLog(msg) {
    this.log.unshift({ t: Date.now(), msg });
    this.log = this.log.slice(0, 50);
  }

  // ---- Helpers ------------------------------------------------------
  player(id) {
    return this.players.find((p) => p.id === id);
  }
  playerByToken(token) {
    return this.players.find((p) => p.token === token);
  }
  currentWorld() {
    return WORLDS[this.worldIndex] || null;
  }

  // ---- Lobby --------------------------------------------------------
  connectPlayer(id) {
    const p = this.player(id);
    if (p && !p.connected) {
      p.connected = true;
      this.addLog(`🔌 ${p.name} s'est connecté.`);
      this.touch();
    }
  }

  setReady(id, ready = true) {
    const p = this.player(id);
    if (p) {
      p.ready = ready;
      this.touch();
    }
  }

  allReady() {
    const adults = this.players;
    return adults.length > 0 && adults.every((p) => p.ready);
  }

  // ---- Glitch (traître) --------------------------------------------
  assignGlitch(rng = Math.random) {
    const pool = this.players.filter((p) => p.glitchEligible);
    if (pool.length === 0) return;
    const chosen = pool[Math.floor(rng() * pool.length)];
    this.glitchId = chosen.id;
    this.generateClues(rng);
    this.addLog('🐛 Le GLITCH a été désigné secrètement par le serveur.');
    this.touch();
  }

  // Réseau d'indices : chaque joueur reçoit une mission + un indice secret.
  generateClues(rng = Math.random) {
    const shuffle = (arr) => [...arr].sort(() => rng() - 0.5);
    const players = this.players;
    const glitch = this.glitchId;
    // Le pool réel de suspects = les joueurs éligibles (pas le héros ni l'hôte)
    const suspects = players.filter((p) => p.glitchEligible);
    const suspectInno = shuffle(suspects.filter((p) => p.id !== glitch)); // suspects innocents
    const recipients = shuffle(players.filter((p) => p.id !== glitch));   // qui reçoit un indice d'enquête
    this.clues = {};
    players.forEach((p) => {
      this.clues[p.id] = { mission: AVATAR_MISSION[p.avatar] || 'Amuse-toi et marque des points.', clue: null };
    });

    // 1) Indice « réduction » : le Glitch est X ou Y (Y = un VRAI suspect)
    const decoy = suspectInno[0];
    if (recipients[0] && decoy) {
      const pair = shuffle([this.player(glitch).name, decoy.name]);
      this.clues[recipients[0].id].clue = `🕵️ Le GLITCH est soit ${pair[0]}, soit ${pair[1]}. À toi de trancher.`;
    }
    // 2) Indices « disculpation » : nomme un suspect innocent (toujours vrai, fait avancer l'enquête)
    [recipients[1], recipients[2]].forEach((recip, i) => {
      const cleared = suspectInno[(i + 1) % suspectInno.length] || suspectInno[0];
      if (recip && cleared) this.clues[recip.id].clue = `✅ Tu en es témoin : ${cleared.name} n'est PAS le Glitch.`;
    });
    // 3) Le Glitch reçoit une consigne de diversion
    this.clues[glitch].clue = `😈 Tu es le GLITCH. Sème le doute : oriente discrètement les soupçons vers quelqu'un d'autre.`;
    // 4) Les autres reçoivent un indice social (chacun sait un truc sur un autre)
    players.forEach((p, i) => {
      if (this.clues[p.id].clue) return;
      const others = players.filter((q) => q.id !== p.id);
      const target = others[Math.floor(rng() * others.length)];
      const fact = SOCIAL_FACTS[Math.floor(rng() * SOCIAL_FACTS.length)];
      this.clues[p.id].clue = `🔎 Tu sais un truc sur ${target.name} : il/elle ${fact}. Va lui en parler.`;
    });
  }

  // ---- Défis photo -------------------------------------------------
  addPhoto(photo) {
    const idx = this.photos.findIndex(p => p.playerId === photo.playerId && p.missionIdx === photo.missionIdx);
    if (idx >= 0) this.photos.splice(idx, 1, photo); else this.photos.push(photo);
    this.addLog(`📸 ${photo.playerName} — défi photo #${photo.missionIdx + 1} soumis.`);
    this.touch();
  }

  castPhotoVote(voterId, photoId, category) {
    const photo = this.photos.find(p => p.id === photoId);
    if (!photo || photo.playerId === voterId) return false;
    if (category !== 'belle' && category !== 'rigolote') return false;
    if (!this.photoVotes[voterId]) this.photoVotes[voterId] = {};
    this.photoVotes[voterId][category] = photoId;
    this.touch();
    return true;
  }

  setPhotoPhase(phase) {
    this.photoPhase = phase || null;
    if (phase === 'vote') this.addLog('📸 VOTE PHOTO ouvert ! Votez sur vos téléphones.');
    else if (phase === 'results') this.addLog('🏆 PALMARÈS PHOTO — résultats affichés sur la BORNE.');
    this.touch();
  }

  photoResults() {
    const belle = {}, rigolote = {};
    for (const votes of Object.values(this.photoVotes)) {
      if (votes.belle) belle[votes.belle] = (belle[votes.belle] || 0) + 1;
      if (votes.rigolote) rigolote[votes.rigolote] = (rigolote[votes.rigolote] || 0) + 1;
    }
    return { belle, rigolote };
  }

  // ---- Blind-test dynamique (titres collectés via IFrame API) ----------
  addPlaylistTrack(videoId, videoTitle) {
    if (!videoId || !videoTitle) return;
    if (!this.playlistTracks.find(t => t.id === videoId)) {
      this.playlistTracks.push({ id: videoId, title: videoTitle });
    }
  }

  // Petit GET JSON sans dépendance (oEmbed YouTube — endpoint public, pas de clé)
  _getJson(url) {
    return new Promise((resolve) => {
      const req = https.get(url, (res) => {
        if (res.statusCode !== 200) { res.resume(); return resolve(null); }
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(6000, () => { req.destroy(); resolve(null); });
    });
  }

  // Reçoit la liste COMPLÈTE des IDs de la playlist (depuis getPlaylist() côté
  // borne) et récupère chaque titre via l'oEmbed YouTube, par petits lots.
  async ingestPlaylist(ids) {
    const todo = (ids || []).filter((id) => id && !this.playlistTracks.find((t) => t.id === id));
    let added = 0;
    const fetchTitle = async (id) => {
      const url = 'https://www.youtube.com/oembed?format=json&url='
        + encodeURIComponent('https://www.youtube.com/watch?v=' + id);
      const d = await this._getJson(url);
      if (d && d.title) { this.addPlaylistTrack(id, d.title); added++; }
    };
    for (let i = 0; i < todo.length; i += 6) {
      await Promise.all(todo.slice(i, i + 6).map(fetchTitle));
    }
    if (added) {
      this.addLog(`🎵 Blind-test : ${this.playlistTracks.length} titres en mémoire (playlist complète).`);
      this.touch();
    }
    return added;
  }

  // Pioche un titre AU HASARD dans la playlist collectée, ordonne à la borne
  // de jouer cette vidéo précise, et génère le QCM (bon titre + 3 leurres).
  // La manche fait a.total morceaux ; au-delà → décompte final.
  blindtestAsk() {
    const a = this.activity;
    if (!a || a.type !== 'blindtest') return;
    if ((a.asked || 0) >= (a.total || 15)) { this.blindtestFinish(); return; }
    const pool = [...this.playlistTracks];
    if (pool.length < 4) {
      this.addLog('🎵 Blind-test : pas encore assez de titres détectés — patientez quelques secondes…');
      this.touch();
      return;
    }
    // Bonne réponse + 3 leurres, tous tirés de la playlist
    const correct = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const lures = pool.sort(() => Math.random() - 0.5).slice(0, 3).map(t => t.title);
    const choices = [...lures, correct.title].sort(() => Math.random() - 0.5);
    a.asked = (a.asked || 0) + 1;
    a.qIndex = a.asked - 1;
    a.generatedQuestion = {
      prompt: '🎵 Quel est le titre de cette chanson ?',
      choices,
      answer: choices.indexOf(correct.title),
      points: 100,
    };
    a.playVideoId = correct.id;       // la borne charge CETTE vidéo
    a.playRequestedAt = Date.now();   // force le rechargement même si même id
    a.firstCorrectName = null;
    a.sub = 'question';
    a.answers = {};
    this.addLog(`🎵 Blind-test ${a.asked}/${a.total} — nouvelle chanson !`);
    this.touch();
  }

  // Fin de manche : le dernier au classement (score le plus bas) perd une vie.
  blindtestFinish() {
    const a = this.activity;
    if (!a) return;
    if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
    const connected = this.players.filter((p) => p.connected);
    const board = connected
      .map((p) => ({ id: p.id, name: p.name, pts: (a.scores && a.scores[p.id]) || 0 }))
      .sort((x, y) => y.pts - x.pts);
    a.sub = 'final';
    a.finalBoard = board;
    a.loserNames = [];
    a.winnerNames = [];
    if (board.length) {
      const min = Math.min(...board.map((b) => b.pts));
      const max = Math.max(...board.map((b) => b.pts));
      // Vainqueur(s) : meilleur score (à condition d'avoir marqué des points)
      if (max > 0) a.winnerNames = board.filter((b) => b.pts === max).map((b) => b.name);
      // Perdant(s) : score le plus bas (sauf égalité parfaite, on épargne tout le monde)
      if (max !== min) {
        board.filter((b) => b.pts === min).forEach((b) => {
          const p = this.player(b.id);
          if (p && p.lives > 0) { p.lives -= 1; a.loserNames.push(p.name); }
        });
      }
    }
    const win = a.winnerNames.length ? `🏆 Vainqueur : ${a.winnerNames.join(', ')}.` : '';
    const lose = a.loserNames.length ? ` Dernier(s) : ${a.loserNames.join(', ')} — −1 vie 💔` : ' Égalité — personne ne perd de vie.';
    this.addLog(`🏁 Blind-test terminé ! ${win}${lose}`);
    this.touch();
  }

  // ---- Démarrage de partie -----------------------------------------
  startGame() {
    // Le Glitch n'est PAS désigné ici : il s'infiltre à la fin du Monde 1.
    this.phase = 'world';
    this.worldIndex = 0;
    this.addLog('🕹️ INSERT COIN — la partie commence !');
    this.touch();
  }

  // ---- Progression des mondes --------------------------------------
  submitCode(playerId, code) {
    const world = this.currentWorld();
    if (!world || this.phase === 'finale' || this.phase === 'win') {
      return { ok: false, reason: 'Aucun monde actif.' };
    }
    if (world.resoluParVote) {
      return { ok: false, reason: 'Ce monde se résout par un VOTE, pas un code.' };
    }
    const ok = normalize(code) === world.codeNormalise;
    const p = this.player(playerId);
    if (ok) {
      this.addLog(`✅ ${p ? p.name : '?'} a validé le code du Monde ${world.num} !`);
      this.completeWorld();
      return { ok: true };
    }
    this.addLog(`❌ Code refusé pour le Monde ${world.num}.`);
    this.touch();
    return { ok: false, reason: 'Code incorrect.' };
  }

  completeWorld() {
    const world = this.currentWorld();
    if (!world) return;
    // Récompense : tous les joueurs connectés gagnent une pièce
    this.players.forEach((p) => { if (p.connected) p.coins += 1; });

    // Le Glitch s'infiltre à la fin du Monde 1 (désignation différée et secrète)
    if (world.id === 'w1' && !this.glitchId) this.assignGlitch();
    // Twist du monde
    if (world.id === 'w4') this.awakenHero();
    if (world.twist) this.addLog(`🌀 ${world.twist}`);

    // Avancer
    if (world.isFinale) {
      this.phase = 'win';
      this.addLog('🏆 YOU WIN ! La réalité a redémarré.');
    } else {
      this.worldIndex += 1;
      const next = this.currentWorld();
      if (next) {
        this.addLog(`📦 COLIS ${next.colis} débloqué — PIXELS, livrez le colis !`);
      }
    }
    this.touch();
  }

  awakenHero() {
    this.heroAwakened = true;
    const v = this.players.find((p) => p.isHero);
    if (v) this.addLog(`👑 ${v.name} est désormais le GAME MASTER !`);
  }

  // ---- Gages --------------------------------------------------------
  drawGage(pool = null, targetId = null) {
    const g = pickGage(pool);
    this.currentGage = {
      ...g,
      targetId,
      targetName: targetId ? (this.player(targetId)?.name ?? null) : null,
      at: Date.now(),
    };
    const who = targetId ? this.player(targetId)?.name : 'la table';
    this.addLog(`🎲 GAGE « ${g.titre} » pour ${who}.`);
    this.touch();
    return this.currentGage;
  }

  clearGage() {
    this.currentGage = null;
    this.touch();
  }

  loseLife(playerId) {
    const p = this.player(playerId);
    if (p && p.lives > 0) {
      p.lives -= 1;
      this.addLog(`💔 ${p.name} perd une vie (${p.lives} restantes).`);
      this.touch();
    }
  }

  // ---- Votes (suspicion / élimination du Glitch) -------------------
  startVote() {
    this.votes = {};
    this.phase = 'vote';
    this.addLog('🗳️ VOTE ouvert : qui est le GLITCH ?');
    this.touch();
  }

  castVote(voterId, targetId) {
    this.votes[voterId] = targetId;
    this.touch();
  }

  tallyVotes() {
    const counts = {};
    for (const target of Object.values(this.votes)) {
      counts[target] = (counts[target] || 0) + 1;
    }
    let top = null;
    let max = -1;
    for (const [id, n] of Object.entries(counts)) {
      if (n > max) { max = n; top = id; }
    }
    const found = top === this.glitchId;
    this.glitchRevealed = true;
    this.addLog(found
      ? `🎯 Le groupe a démasqué le GLITCH : ${this.player(this.glitchId)?.name} !`
      : `😈 Raté ! Le GLITCH (${this.player(this.glitchId)?.name}) a survécu.`);
    this.phase = 'world';
    this.touch();
    return { found, top, counts };
  }

  // ---- Activités BORNE (reaction, buzzer, spotlight, roue...) -------
  startActivity(type, opts = {}) {
    if (type === 'pacman') return this.startPacman(opts);
    if (type === 'tetris') return this.startTetris(opts);
    if (type === 'tron') return this.startTron(opts);
    if (type === '2048') return this.startG2048(opts);
    this.activity = {
      type,
      startedAt: Date.now(),
      state: 'running',
      data: opts,
      buzzes: [], // [{id, name, t}]
      scores: {},
    };
    // Mosaïque de téléphones : difficulté croissante.
    //  1ʳᵉ manche → KONAMI, 1 ligne. Suivantes → mot vidéoludique, 2/3/4 lignes
    //  dont UNE SEULE correcte (les autres = leurres) : il faut placer les
    //  téléphones EN QUINCONCE pour aligner les lignes colorées.
    if (type === 'mosaic') {
      const players = this.players.filter((p) => p.connected);
      const n = Math.max(1, players.length);
      this.mosaicCount = (this.mosaicCount || 0) + 1;
      const round = this.mosaicCount;
      let word, rows;
      if (round === 1) { word = MOSAIC_DEFAULT_WORD; rows = 1; }
      else {
        rows = Math.min(round, 4); // 2, 3, 4, puis reste 4
        word = (opts.word && opts.word.trim()) ? opts.word : pickMosaicWord(n);
      }
      word = (word || MOSAIC_DEFAULT_WORD).toUpperCase().replace(/[^A-Z]/g, '') || 'KONAMI';
      // Découpe en n segments de LETTRES ENTIÈRES (jamais au milieu d'une lettre)
      const sizes = mosaicSplit(word.length, n);
      const segs = [];
      let off = 0;
      for (let k = 0; k < n; k++) { segs.push(word.slice(off, off + sizes[k])); off += sizes[k]; }
      // Position horizontale (slice) mélangée + ligne correcte décalée (quinconce)
      const orderIdx = [...Array(n).keys()].sort(() => Math.random() - 0.5);
      const slices = {}, bands = {}, correctRow = {};
      players.forEach((p, i) => {
        const sl = orderIdx[i];
        slices[p.id] = sl;
        const seg = segs[sl] || '';
        const cr = sl % rows;
        correctRow[p.id] = cr;
        const arr = [];
        for (let r = 0; r < rows; r++) arr.push(r === cr ? seg : randLetters(seg.length || 2));
        bands[p.id] = arr;
      });
      this.activity.word = word;
      this.activity.n = n;
      this.activity.rows = rows;
      this.activity.round = round;
      this.activity.slices = slices;
      this.activity.bands = bands;
      this.activity.correctRow = correctRow;
      this.activity.reveal = false; // la ligne colorée n'apparaît que si le MJ le demande
    }
    // Séquence musicale collaborative : attribution des notes aux joueurs
    if (type === 'music_seq') {
      const players = this.players.filter((p) => p.connected);
      const distinct = [...new Set(MELODY)]; // notes indispensables d'abord
      const decoys = NOTE_PALETTE.map((_, i) => i).filter((i) => !distinct.includes(i));
      const order = [...distinct, ...decoys];
      const owners = {};
      order.forEach((paletteIdx, i) => {
        const owner = players[i % Math.max(1, players.length)];
        if (owner) owners[paletteIdx] = owner.id;
      });
      this.activity.owners = owners;
      this.activity.step = 0;
      this.activity.revealed = 0;
      // Auto-démo : la borne joue le thème Mario dès le lancement (on l'ENTEND).
      this.activity.demo = { seq: [...MELODY], at: Date.now() };
      this.activity.wrongAt = 0;
      this.activity.status = 'playing';
    }
    // Quiz / blind-test : on initialise le déroulé QCM
    if (type === 'quiz' || type === 'blindtest') {
      const deck = type === 'blindtest' ? 'blindtest' : (opts.deck || 'videogame');
      this.activity.deck = deck;
      this.activity.qIndex = 0;
      this.activity.sub = 'question'; // question | reveal
      this.activity.answers = {}; // { playerId: { choice, t } }
    }
    // Spotlight : un joueur relève un défi, la salle vote ensuite.
    if (type === 'spotlight') {
      const tid = opts.targetId || null;
      const defi = (opts.defi && opts.defi.trim())
        || SPOTLIGHT_DEFIS[Math.floor(Math.random() * SPOTLIGHT_DEFIS.length)];
      this.activity.data = {
        targetId: tid,
        targetName: tid ? (this.player(tid)?.name || opts.targetName || '?') : (opts.targetName || '?'),
        defi,
      };
      this.activity.sub = 'challenge'; // challenge | vote | result
      this.activity.votes = {};        // { voterId: 'ok' | 'ko' }
      this.activity.verdict = null;    // 'ok' | 'ko'
    }
    // Blind-test : toujours dynamique (titres tirés de la playlist YouTube).
    // La 1ère chanson est lancée quand le GM appuie sur « ❓ ».
    if (type === 'blindtest') {
      this.activity.dynamicBlindtest = true;
      this.activity.generatedQuestion = null;
      this.activity.playVideoId = null;
      this.activity.playRequestedAt = 0;
      this.activity.firstCorrectName = null;
      this.activity.total = 15; // 15 morceaux par séance
      this.activity.asked = 0;  // morceaux déjà joués
    }
    // Enquête collaborative (escape) : 5 actes, indices sur la borne, codes par téléphone
    if (type === 'enquete') {
      this.activity.actIndex = 0;
      this.activity.hints = {};   // { actIndex: nbIndicesRévélés }
      this.activity.frag = {};    // { playerId: [pièces à conviction de l'acte courant] }
      this.activity.attempts = 0;
      this.activity.lastWrong = 0;
      this.activity.done = false;
      this._enqueteDistribute();
    }
    // Roue des gages : segments affichés, la roue tourne et tombe sur un gage,
    // puis décompte, puis vote « meilleur » (+1 vie au gagnant, −1 aux autres).
    if (type === 'roue_des_gages') {
      const pool = opts.pool || null;
      const filtered = pool ? GAGES.filter((g) => g.pool.includes(pool)) : GAGES;
      const src = filtered.length >= 6 ? filtered : GAGES;
      const shuffled = [...src].sort(() => Math.random() - 0.5);
      const options = shuffled.slice(0, Math.min(8, shuffled.length));
      const chosenIndex = Math.floor(Math.random() * options.length);
      this.activity.options = options.map((g) => ({ id: g.id, titre: g.titre, desc: g.desc, alt: g.alt || null }));
      this.activity.chosenIndex = chosenIndex;
      this.activity.gage = this.activity.options[chosenIndex];
      this.activity.sub = 'spin';               // spin | challenge | vote | result
      this.activity.spinAt = Date.now();
      this.activity.challengeSeconds = opts.seconds || 20;
      this.activity.votes = {};                 // voterId -> targetId
      this.activity.winnerIds = [];
      this._scheduleRoue();
    }
    this.phase = 'activity';
    this.addLog(`🎮 Activité BORNE : ${type}.`);
    this.touch();
  }

  // ---- Roue des gages : déroulé minuté --------------------------------
  _scheduleRoue() {
    if (this._roueTimer) { clearTimeout(this._roueTimer); this._roueTimer = null; }
    // 1) La roue tourne ~5 s, puis tombe sur le gage → phase « challenge ».
    this._roueTimer = setTimeout(() => {
      const a = this.activity;
      if (!a || a.type !== 'roue_des_gages') return;
      a.sub = 'challenge';
      a.challengeAt = Date.now();
      this.addLog(`🎰 La roue est tombée sur « ${a.gage.titre} » ! ${a.challengeSeconds} s pour briller.`);
      this.touch();
      // 2) Décompte écoulé → ouverture du vote.
      this._roueTimer = setTimeout(() => {
        const b = this.activity;
        if (!b || b.type !== 'roue_des_gages') return;
        b.sub = 'vote';
        b.votes = {};
        this.addLog('🗳️ Roue : votez pour le MEILLEUR — il gagne une vie, les autres en perdent une !');
        this.touch();
      }, (a.challengeSeconds || 20) * 1000);
    }, 5000);
  }

  roueVote(voterId, targetId) {
    const a = this.activity;
    if (!a || a.type !== 'roue_des_gages' || a.sub !== 'vote') return;
    if (!this.player(targetId)) return;
    a.votes[voterId] = targetId;
    const connected = this.players.filter((p) => p.connected);
    if (Object.keys(a.votes).length >= connected.length) this.roueTally();
    else this.touch();
  }

  roueOpenVote() {
    const a = this.activity;
    if (!a || a.type !== 'roue_des_gages') return;
    if (this._roueTimer) { clearTimeout(this._roueTimer); this._roueTimer = null; }
    a.sub = 'vote';
    a.votes = {};
    this.addLog('🗳️ Roue : vote ouvert (le meilleur gagne une vie) !');
    this.touch();
  }

  roueTally() {
    const a = this.activity;
    if (!a || a.type !== 'roue_des_gages') return;
    if (this._roueTimer) { clearTimeout(this._roueTimer); this._roueTimer = null; }
    const counts = {};
    for (const t of Object.values(a.votes || {})) counts[t] = (counts[t] || 0) + 1;
    let max = -1;
    for (const n of Object.values(counts)) if (n > max) max = n;
    const winners = max > 0 ? Object.keys(counts).filter((id) => counts[id] === max) : [];
    a.winnerIds = winners;
    a.voteCounts = counts;
    a.sub = 'result';
    const connected = this.players.filter((p) => p.connected);
    connected.forEach((p) => {
      if (winners.includes(p.id)) p.lives = Math.min(3, p.lives + 1);
      else if (p.lives > 0) p.lives -= 1;
    });
    const wn = winners.map((id) => this.player(id)?.name).filter(Boolean);
    this.addLog(wn.length
      ? `🏆 Roue : ${wn.join(', ')} gagne(nt) une vie ❤️ ; les autres en perdent une 💔`
      : '🎰 Roue : aucun vote — personne ne bouge.');
    this.touch();
  }

  // ---- Quiz / blind-test : QCM affiché borne, réponse smartphone ----
  quizQuestion() {
    const a = this.activity;
    if (!a || (a.type !== 'quiz' && a.type !== 'blindtest')) return null;
    if (a.dynamicBlindtest) return a.generatedQuestion || null; // null = avant la 1ère chanson
    const list = QUESTIONS[a.deck] || [];
    return list[a.qIndex] || null;
  }

  quizAnswer(playerId, choice) {
    const a = this.activity;
    if (!a || a.sub !== 'question') return;
    if (a.answers[playerId]) return; // déjà répondu, on garde la 1ʳᵉ
    a.answers[playerId] = { choice: Number(choice), t: Date.now() };
    // Auto-révéler quand tous les joueurs connectés ont répondu
    const connected = this.players.filter(p => p.connected).length;
    if (Object.keys(a.answers).length >= connected) {
      this.quizReveal();
    } else {
      this.touch();
    }
  }

  quizReveal() {
    const a = this.activity;
    const q = this.quizQuestion();
    if (!a || !q || a.sub !== 'question') return;
    a.sub = 'reveal';
    // Attribution des points : bonne réponse = points (+ bonus rapidité léger)
    const corrects = Object.entries(a.answers)
      .filter(([, ans]) => ans.choice === q.answer)
      .sort((x, y) => x[1].t - y[1].t);
    corrects.forEach(([pid], i) => {
      const bonus = i === 0 ? 50 : 0;
      const gain = q.points + bonus;
      a.scores[pid] = (a.scores[pid] || 0) + gain;
      const p = this.player(pid);
      if (p) p.coins += Math.round(gain / 50);
    });
    // Le premier à avoir trouvé est mis à l'honneur
    if (corrects.length) {
      const first = this.player(corrects[0][0]);
      a.firstCorrectName = first?.name || null;
      if (first) this.addLog(`🥇 ${first.name} a trouvé en PREMIER — bravo !`);
    } else {
      a.firstCorrectName = null;
    }
    this.addLog(`💡 Réponse : « ${q.choices[q.answer]} » (${corrects.length} bonne(s) réponse(s)).`);
    this.touch();
    // Auto-passage : chanson/question suivante après 13 s (laisse le temps de
    // voir le titre, féliciter, souffler entre deux morceaux)
    if (this._autoAdvanceTimer) clearTimeout(this._autoAdvanceTimer);
    this._autoAdvanceTimer = setTimeout(() => {
      this._autoAdvanceTimer = null;
      this.quizNext();
    }, 13000);
  }

  quizNext() {
    const a = this.activity;
    if (!a) return;
    if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
    if (a.dynamicBlindtest) {
      this.blindtestAsk(); // pioche une autre chanson au hasard dans la playlist
      return;
    }
    const list = QUESTIONS[a.deck] || [];
    if (a.qIndex < list.length - 1) {
      a.qIndex += 1;
      a.sub = 'question';
      a.answers = {};
      this.touch();
    } else {
      this.addLog('🏁 Quiz terminé.');
      this.stopActivity();
    }
  }

  // Vue publique d'une activité (NE FUITE PAS la bonne réponse en phase question)
  activityPublic(forPlayerId = null) {
    const a = this.activity;
    if (!a) return null;
    if (a.type === 'music_seq') return this.musicPublic(forPlayerId);
    if (a.type === 'mosaic') return this.mosaicPublic(forPlayerId);
    if (a.type === 'enquete') return this.enquetePublic(forPlayerId);
    if (a.type !== 'quiz' && a.type !== 'blindtest') return a;
    const q = this.quizQuestion();
    const list = a.dynamicBlindtest ? [] : (QUESTIONS[a.deck] || []);
    const reveal = a.sub === 'reveal';
    return {
      type: a.type,
      state: a.state,
      deck: a.deck,
      sub: a.sub,
      qIndex: a.qIndex,
      total: a.dynamicBlindtest ? (a.total || 15) : list.length,
      asked: a.asked || 0,
      prompt: q ? q.prompt : '',
      choices: q ? q.choices : [],
      media: q ? (q.media || null) : null,
      audioUrl: q && reveal ? (q.audioUrl || null) : null,
      answeredCount: Object.keys(a.answers).length,
      playerCount: this.players.filter((p) => p.connected).length,
      // Seulement à la révélation :
      answer: reveal && q ? q.answer : null,
      answers: reveal ? a.answers : null,
      scores: reveal ? a.scores : null,
      leaderboard: reveal ? this.quizLeaderboard() : null,
      myAnswer: forPlayerId && a.answers[forPlayerId] ? a.answers[forPlayerId].choice : null,
      // Blind-test dynamique
      dynamicBlindtest: a.dynamicBlindtest || false,
      playVideoId: a.playVideoId || null,
      playRequestedAt: a.playRequestedAt || 0,
      firstCorrectName: reveal ? (a.firstCorrectName || null) : null,
      finalBoard: a.sub === 'final' ? (a.finalBoard || []) : null,
      loserNames: a.sub === 'final' ? (a.loserNames || []) : null,
      winnerNames: a.sub === 'final' ? (a.winnerNames || []) : null,
    };
  }

  quizLeaderboard() {
    const a = this.activity;
    const q = this.quizQuestion();
    // Tous les joueurs connectés, qu'ils aient répondu ou non
    const connected = this.players.filter(p => p.connected);
    return connected.map(p => {
      const ans = a.answers?.[p.id];
      const correct = ans != null && q != null && ans.choice === q.answer;
      return { id: p.id, name: p.name, pts: a.scores?.[p.id] || 0, correct, answered: !!ans };
    }).sort((x, y) => y.pts - x.pts || (y.correct ? 1 : 0) - (x.correct ? 1 : 0));
  }

  buzz(playerId) {
    if (!this.activity || this.activity.state !== 'running') return;
    if (this.activity.buzzes.find((b) => b.id === playerId)) return;
    const p = this.player(playerId);
    this.activity.buzzes.push({ id: playerId, name: p?.name, t: Date.now() });
    // Reaction Race : on résout dès que TOUT LE MONDE SAUF UN a buzzé.
    //  - le PREMIER regagne une vie (max 3)
    //  - celui qui n'a PAS buzzé (le plus lent) perd une vie
    if (this.activity.type === 'reaction_race') {
      const connected = this.players.filter(pl => pl.connected);
      const need = Math.max(1, connected.length - 1); // tout le monde sauf un
      if (connected.length >= 2 && this.activity.buzzes.length >= need && !this.activity.resolved) {
        this.activity.resolved = true;
        const sorted = [...this.activity.buzzes].sort((a, b) => a.t - b.t);
        const first = this.player(sorted[0].id);
        // le DERNIER = le seul joueur connecté qui n'a pas buzzé (sinon le plus tardif)
        const buzzed = new Set(this.activity.buzzes.map(b => b.id));
        const nonBuzzer = connected.find(p => !buzzed.has(p.id));
        const last = nonBuzzer || this.player(sorted[sorted.length - 1].id);
        this.activity.firstName = first?.name || null;
        this.activity.lastName = last?.name || null;
        if (last && last.lives > 0) {
          last.lives -= 1;
          this.addLog(`🐢 ${last.name} n'a pas réagi à temps — −1 vie (${last.lives} restante(s)).`);
        }
        if (first) {
          if (first.lives < 3) { first.lives += 1; this.addLog(`⚡ ${first.name} le plus RAPIDE — +1 vie (${first.lives}) !`); }
          else this.addLog(`⚡ ${first.name} le plus RAPIDE ! (déjà au max de vies)`);
        }
      }
    }
    this.touch();
  }

  // ---- Spotlight : défi d'un joueur jugé par la salle ---------------
  spotlightOpenVote() {
    const a = this.activity;
    if (!a || a.type !== 'spotlight') return;
    a.sub = 'vote';
    a.votes = {};
    this.addLog(`🔦 Spotlight : ${a.data.targetName} a relevé le défi — à la salle de juger !`);
    this.touch();
  }

  spotlightVote(voterId, verdict) {
    const a = this.activity;
    if (!a || a.type !== 'spotlight' || a.sub !== 'vote') return;
    if (voterId === a.data.targetId) return; // la cible ne vote pas pour elle-même
    if (verdict !== 'ok' && verdict !== 'ko') return;
    a.votes[voterId] = verdict;
    this.touch();
  }

  spotlightTally() {
    const a = this.activity;
    if (!a || a.type !== 'spotlight') return;
    let ok = 0, ko = 0;
    for (const v of Object.values(a.votes || {})) { if (v === 'ok') ok++; else if (v === 'ko') ko++; }
    const passed = ok >= ko; // égalité = réussi (on est bienveillant)
    a.verdict = passed ? 'ok' : 'ko';
    a.okCount = ok; a.koCount = ko;
    a.sub = 'result';
    const target = this.player(a.data.targetId);
    if (!passed && target && target.lives > 0) {
      target.lives -= 1;
      this.addLog(`💔 ${a.data.targetName} n'a pas convaincu (${ok}👏/${ko}💀) — vie perdue (${target.lives} restante(s)).`);
    } else {
      this.addLog(`👏 ${a.data.targetName} a relevé le défi avec brio ! (${ok}👏/${ko}💀)`);
    }
    this.touch();
  }

  // ---- Enquête collaborative (Cold Case Saint-Maur) ----------------
  // Répartit les pièces à conviction de l'acte courant entre les joueurs
  // connectés (round-robin). Recalculé à chaque changement d'acte.
  _enqueteDistribute() {
    const a = this.activity;
    if (!a || a.type !== 'enquete') return;
    const act = ENQUETE.acts[a.actIndex];
    a.frag = {};
    if (!act) return;
    const players = this.players.filter((p) => p.connected);
    if (!players.length) return;
    (act.fragments || []).forEach((f, i) => {
      const owner = players[i % players.length];
      (a.frag[owner.id] = a.frag[owner.id] || []).push(f);
    });
  }

  // Un joueur propose un code pour l'acte courant.
  submitEnqueteCode(playerId, code) {
    const a = this.activity;
    if (!a || a.type !== 'enquete' || a.done) return { ok: false, reason: 'Pas d\'enquête en cours.' };
    const act = ENQUETE.acts[a.actIndex];
    if (!act) return { ok: false, reason: 'Aucun acte actif.' };
    if (normalize(code) === normalize(act.answer)) {
      const p = this.player(playerId);
      this.addLog(`🕵️ ACTE ${act.num} résolu : « ${act.title} » par ${p ? p.name : '?'} !`);
      a.actIndex += 1;
      a.lastWrong = 0;
      if (a.actIndex >= ENQUETE.acts.length) {
        a.done = true;
        a.frag = {};
        this.addLog('🔓 ENQUÊTE RÉSOLUE — l\'affaire des parapheurs perdus est élucidée !');
      } else {
        this._enqueteDistribute();
      }
      this.touch();
      return { ok: true, solved: true, done: a.done };
    }
    a.lastWrong = Date.now();
    a.attempts = (a.attempts || 0) + 1;
    this.addLog(`🔒 Code refusé (Acte ${act.num}).`);
    this.touch();
    return { ok: false, reason: 'Code incorrect.' };
  }

  // Le GM révèle un indice de plus sur l'acte courant.
  enqueteHint() {
    const a = this.activity;
    if (!a || a.type !== 'enquete') return;
    const act = ENQUETE.acts[a.actIndex];
    if (!act) return;
    a.hints = a.hints || {};
    const cur = a.hints[a.actIndex] || 0;
    if (cur < (act.hints || []).length) {
      a.hints[a.actIndex] = cur + 1;
      this.addLog(`💡 Indice ${cur + 1} révélé (Acte ${act.num}).`);
      this.touch();
    }
  }

  // Le GM force le passage à l'acte suivant (déblocage manuel).
  enqueteSkip() {
    const a = this.activity;
    if (!a || a.type !== 'enquete' || a.done) return;
    const act = ENQUETE.acts[a.actIndex];
    a.actIndex += 1;
    a.lastWrong = 0;
    if (a.actIndex >= ENQUETE.acts.length) {
      a.done = true; a.frag = {};
      this.addLog('🔓 ENQUÊTE débloquée jusqu\'au bout par le GM.');
    } else {
      this._enqueteDistribute();
      this.addLog(`⏭ GM : passage forcé à l'acte ${act ? act.num + 1 : '?'}.`);
    }
    this.touch();
  }

  // Vue publique de l'enquête (NE FUITE PAS la réponse de l'acte courant).
  enquetePublic(forPlayerId = null) {
    const a = this.activity;
    const acts = ENQUETE.acts;
    const idx = a.actIndex;
    const act = acts[idx] || null;
    const nHints = act ? (a.hints?.[idx] || 0) : 0;
    return {
      type: 'enquete',
      title: ENQUETE.title,
      pitch: ENQUETE.pitch,
      total: acts.length,
      actIndex: idx,
      solvedCount: idx,
      done: !!a.done,
      act: act && {
        num: act.num, title: act.title, place: act.place, kind: act.kind || 'text',
        article: act.article || null, sources: act.sources || null,
        map: act.map || null, cipher: act.cipher ? {
          // on n'envoie JAMAIS la solution en clair (plain) aux clients
          ciphertext: act.cipher.ciphertext, keyLetter: act.cipher.keyLetter,
          shift: act.cipher.shift, help: act.cipher.help,
        } : null,
        scene: act.scene, riddle: act.riddle, humor: act.humor || null,
      },
      hintList: act ? (act.hints || []).slice(0, nHints) : [],
      // Le « mur d'enquête » : révélations des actes déjà résolus
      wall: acts.slice(0, idx).map((x) => ({ num: x.num, title: x.title, reveal: x.reveal })),
      lastWrong: a.lastWrong || 0,
      myFragments: forPlayerId ? (a.frag?.[forPlayerId] || []) : [],
      finale: a.done ? ENQUETE.finale : null,
    };
  }

  // Bloc réservé GM : la solution de l'acte courant.
  enqueteMaster() {
    const a = this.activity;
    if (!a || a.type !== 'enquete') return null;
    const act = ENQUETE.acts[a.actIndex];
    return {
      done: !!a.done,
      actIndex: a.actIndex,
      total: ENQUETE.acts.length,
      num: act ? act.num : null,
      title: act ? act.title : null,
      answer: act ? act.answer : null,
      hintsShown: a.hints?.[a.actIndex] || 0,
      hintsTotal: act ? (act.hints || []).length : 0,
      attempts: a.attempts || 0,
    };
  }

  stopActivity() {
    if (this._roueTimer) { clearTimeout(this._roueTimer); this._roueTimer = null; }
    if (this.pacmanTimer) { clearInterval(this.pacmanTimer); this.pacmanTimer = null; }
    if (this.tetrisTimer) { clearInterval(this.tetrisTimer); this.tetrisTimer = null; }
    if (this.tronTimer) { clearInterval(this.tronTimer); this.tronTimer = null; }
    if (this.g2048Timer) { clearInterval(this.g2048Timer); this.g2048Timer = null; }
    if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
    this.pacman = null;
    this.tetris = null;
    this.tron = null;
    this.g2048 = null;
    if (this.activity) this.activity.state = 'done';
    this.phase = 'world';
    this.touch();
  }

  // ---- PAC-MAN multijoueur -----------------------------------------
  startPacman(opts = {}) {
    const players = this.players.filter((p) => p.connected);
    if (players.length < 3) {
      this.addLog('⚠️ Pac-Man : il faut au moins 3 joueurs connectés (2 Pac + 1 fantôme).');
      this.touch();
      return;
    }
    // --- Rotation des rôles : priorité à ceux qui n'ont pas encore été Pac ---
    if (!this.pacRotation) this.pacRotation = [];
    let pool = players.filter((p) => !this.pacRotation.includes(p.id));
    if (pool.length < 2) { this.pacRotation = []; pool = players.slice(); } // nouveau cycle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const mrId = opts.mrId || shuffled[0].id;
    let mrsId = opts.mrsId || (shuffled.find((p) => p.id !== mrId) || {}).id;
    if (!mrsId) { mrsId = (players.find((p) => p.id !== mrId) || {}).id; }
    this.pacRotation.push(mrId, mrsId);
    const mr = this.player(mrId), mrs = this.player(mrsId);

    this.pacman = new PacmanGame(players, { ...opts, mrId, mrsId });
    if (mr && mrs) this.addLog(`🟡 Pac-Man : ${mr.name} (Mr) & ${mrs.name} (Mrs) cette manche.`);
    this.activity = { type: 'pacman', startedAt: Date.now(), state: 'running', data: {} };
    this.phase = 'activity';
    this.addLog('🟡 PAC-MAN lancé ! Mr & Mrs Pac-Man contre les fantômes.');
    if (this.pacmanTimer) clearInterval(this.pacmanTimer);
    this.pacmanTimer = setInterval(() => {
      if (!this.pacman) return;
      this.pacman.tick();
      if (this.pacman.status !== 'playing') {
        clearInterval(this.pacmanTimer); this.pacmanTimer = null;
        const win = this.pacman.ranking()[0];
        this.addLog(win
          ? `🏆 PAC-MAN terminé ! Vainqueur : ${win.name} (${win.score} pts).`
          : '🟡 PAC-MAN terminé.');
        this.save();
      }
      this.broadcast();
    }, this.pacman.tickMs);
    this.touch();
  }

  pacmanDir(playerId, dir) {
    if (this.pacman) this.pacman.setDir(playerId, dir);
    // pas de broadcast ici : le prochain tick rafraîchit (évite le spam réseau)
  }

  // ---- TETRIS multijoueur ------------------------------------------
  startTetris(opts = {}) {
    const players = this.players.filter((p) => p.connected);
    if (players.length < 1) {
      this.addLog('⚠️ Tetris : aucun joueur connecté.');
      this.touch();
      return;
    }
    this.tetris = new TetrisGame(players, opts);
    this.activity = { type: 'tetris', startedAt: Date.now(), state: 'running', data: {} };
    this.phase = 'activity';
    this.addLog('🧱 TETRIS lancé ! Mêmes pièces pour tous, chacun sa grille.');
    if (this.tetrisTimer) clearInterval(this.tetrisTimer);
    this.tetrisTimer = setInterval(() => {
      if (!this.tetris) return;
      this.tetris.tick();
      if (this.tetris.status !== 'playing') {
        clearInterval(this.tetrisTimer); this.tetrisTimer = null;
        const rank = this.tetris.ranking();
        // Vies : le VAINQUEUR gagne une vie (max 3), tous les autres en perdent une.
        rank.forEach((r, i) => {
          const p = this.player(r.id);
          if (!p) return;
          if (i === 0) { if (p.lives < 3) p.lives += 1; }
          else if (p.lives > 0) p.lives -= 1;
        });
        const win = rank[0];
        this.addLog(win
          ? `🏆 TETRIS : ${win.name} gagne (${win.lines} lignes) — +1 vie ❤️ ! Les autres −1 vie 💔.`
          : '🧱 TETRIS terminé.');
        this.save();
      }
      this.broadcast();
    }, this.tetris.tickMs);
    this.touch();
  }

  tetrisMove(playerId, dir) {
    if (this.tetris) { this.tetris.move(playerId, dir); this.broadcast(); }
  }

  // ---- TRON / SNAKE multijoueur ------------------------------------
  startTron(opts = {}) {
    const players = this.players.filter((p) => p.connected);
    if (players.length < 2) { this.addLog('⚠️ Tron : il faut au moins 2 joueurs connectés.'); this.touch(); return; }
    this.tron = new TronGame(players, opts);
    this.activity = { type: 'tron', startedAt: Date.now(), state: 'running', data: {} };
    this.phase = 'activity';
    this.addLog('🟦 TRON lancé ! Laissez une traînée, survivez le dernier.');
    if (this.tronTimer) clearInterval(this.tronTimer);
    this.tronTimer = setInterval(() => {
      if (!this.tron) return;
      this.tron.tick();
      if (this.tron.status !== 'playing') {
        clearInterval(this.tronTimer); this.tronTimer = null;
        this._applyArcadeLives(this.tron.ranking(), 'TRON', (w) => `${w.len} cases`);
        this.save();
      }
      this.broadcast();
    }, this.tron.tickMs);
    this.touch();
  }
  tronMove(playerId, dir) { if (this.tron) this.tron.setDir(playerId, dir); }

  // ---- 2048 multijoueur --------------------------------------------
  startG2048(opts = {}) {
    const players = this.players.filter((p) => p.connected);
    if (players.length < 1) { this.addLog('⚠️ 2048 : aucun joueur connecté.'); this.touch(); return; }
    this.g2048 = new Game2048(players, opts);
    this.activity = { type: '2048', startedAt: Date.now(), state: 'running', data: {} };
    this.phase = 'activity';
    this.addLog('🔢 2048 lancé ! Fusionnez les tuiles, meilleur score gagne.');
    if (this.g2048Timer) clearInterval(this.g2048Timer);
    this.g2048Timer = setInterval(() => {
      if (!this.g2048) return;
      this.g2048.tick();
      if (this.g2048.status !== 'playing') {
        clearInterval(this.g2048Timer); this.g2048Timer = null;
        this._applyArcadeLives(this.g2048.ranking(), '2048', (w) => `${w.score} pts`);
        this.save();
      }
      this.broadcast();
    }, this.g2048.tickMs);
    this.touch();
  }
  g2048Move(playerId, dir) { if (this.g2048) { this.g2048.move(playerId, dir); this.broadcast(); } }

  // Applique les vies de fin de manche arcade : vainqueur +1 (max 3), autres −1.
  _applyArcadeLives(rank, label, detail) {
    rank.forEach((r, i) => {
      const p = this.player(r.id);
      if (!p) return;
      if (i === 0) { if (p.lives < 3) p.lives += 1; }
      else if (p.lives > 0) p.lives -= 1;
    });
    const win = rank[0];
    this.addLog(win
      ? `🏆 ${label} : ${win.name} gagne (${detail(win)}) — +1 vie ❤️ ! Les autres −1 vie 💔.`
      : `${label} terminé.`);
  }

  // ---- Séquence musicale collaborative -----------------------------
  musicPress(playerId, paletteIndex) {
    const a = this.activity;
    if (!a || a.type !== 'music_seq' || a.status !== 'playing') return;
    paletteIndex = Number(paletteIndex);
    if (a.owners[paletteIndex] !== playerId) return; // tu ne possèdes pas cette note
    if (MELODY[a.step] === paletteIndex) {
      a.step += 1;
      if (a.step >= MELODY.length) {
        a.status = 'win';
        this.addLog('🎵 Mélodie reconstituée — BRAVO l\'orchestre !');
      }
    } else {
      a.step = 0;
      a.wrongAt = Date.now();
    }
    this.touch();
  }

  musicDemo() {
    const a = this.activity;
    if (!a || a.type !== 'music_seq') return;
    a.demo = { seq: [...MELODY], at: Date.now() };
    a.step = 0;
    this.addLog('🎶 Démo de la mélodie jouée sur la borne.');
    this.touch();
  }

  musicHint() {
    const a = this.activity;
    if (!a || a.type !== 'music_seq') return;
    a.revealed = Math.min(MELODY.length, (a.revealed || 0) + 1);
    this.addLog(`💡 Indice musical : ${a.revealed} note(s) révélée(s).`);
    this.touch();
  }

  // La mosaïque : chaque joueur ne reçoit QUE son fragment (son index + le mot
  // pour le rendu local). La borne ne reçoit pas le mot (ce serait la solution).
  mosaicPublic(forPlayerId) {
    const a = this.activity;
    // La ligne correcte (et sa couleur) n'est transmise QUE si le MJ a révélé.
    const reveal = !!a.reveal;
    const mine = (forPlayerId && a.slices && a.slices[forPlayerId] != null)
      ? {
          slice: a.slices[forPlayerId],
          n: a.n,
          rows: a.rows || 1,
          bands: (a.bands && a.bands[forPlayerId]) || [a.word || ''],
          // null tant que non révélé → aucune bande colorée côté joueur
          correctRow: reveal ? ((a.correctRow && a.correctRow[forPlayerId]) || 0) : null,
          hue: reveal ? Math.round((a.slices[forPlayerId] / Math.max(1, (a.n || 1) - 1)) * 300) : null,
        }
      : null;
    return {
      type: 'mosaic', n: a.n, rows: a.rows || 1, round: a.round || 1, reveal,
      assigned: Object.keys(a.slices || {}).length, mine,
    };
  }

  // Le MJ révèle (ou masque) la ligne colorée d'aide sur les téléphones.
  mosaicReveal(on = true) {
    const a = this.activity;
    if (!a || a.type !== 'mosaic') return;
    a.reveal = !!on;
    this.addLog(a.reveal ? '🧩 Mosaïque : ligne colorée RÉVÉLÉE par le MJ.' : '🧩 Mosaïque : aide masquée.');
    this.touch();
  }

  musicPublic(forPlayerId) {
    const a = this.activity;
    const len = MELODY.length;
    const slots = [];
    for (let i = 0; i < len; i++) {
      let st = 'hidden', pi = null;
      if (i < a.step) { st = 'done'; pi = MELODY[i]; }
      else if (i < (a.revealed || 0)) { st = 'hint'; pi = MELODY[i]; }
      slots.push({
        st,
        color: pi != null ? NOTE_PALETTE[pi].color : null,
        label: pi != null ? NOTE_PALETTE[pi].label : null,
        freq: pi != null ? NOTE_PALETTE[pi].freq : null,
      });
    }
    const pads = [];
    if (forPlayerId) {
      Object.entries(a.owners).forEach(([pi, owner]) => {
        if (owner === forPlayerId) {
          const n = NOTE_PALETTE[pi];
          pads.push({ index: Number(pi), label: n.label, color: n.color, freq: n.freq });
        }
      });
    }
    return {
      type: 'music_seq', state: a.state, status: a.status,
      len, step: a.step, revealed: a.revealed || 0, wrongAt: a.wrongAt || 0,
      slots,
      demo: a.demo ? {
        at: a.demo.at,
        seq: a.demo.seq.map((pi) => ({ color: NOTE_PALETTE[pi].color, freq: NOTE_PALETTE[pi].freq, label: NOTE_PALETTE[pi].label })),
      } : null,
      pads,
    };
  }

  // Les enfants (Robin & Juliette) ont réussi le « Défi des Pixels »
  markKidsDone() {
    this.kidsDone = true;
    this.addLog('👾 LES PIXELS ont réussi leur défi et réveillent l\'Élu !');
    if (this.activity && this.activity.type === 'pixel_pad') {
      this.activity.state = 'done';
    }
    this.phase = 'world';
    this.touch();
  }

  // ---- Vue publique (envoyée aux clients) --------------------------
  publicState(forToken = null) {
    const me = forToken ? this.playerByToken(forToken) : null;
    const world = this.currentWorld();
    return {
      phase: this.phase,
      deadlineLabel: CONFIG.deadlineLabel,
      world: world && {
        id: world.id, num: world.num, titre: world.titre, colis: world.colis,
        intro: world.intro, enigme: world.enigme, activite: world.activite,
        isTwist: !!world.isTwist, isFinale: !!world.isFinale,
        resoluParVote: !!world.resoluParVote,
      },
      worldCount: WORLDS.length,
      heroAwakened: this.heroAwakened,
      kidsDone: this.kidsDone,
      glitchRevealed: this.glitchRevealed,
      glitchName: this.glitchRevealed ? this.player(this.glitchId)?.name : null,
      currentGage: this.currentGage,
      activity: this.activityPublic(me ? me.id : null),
      pacman: this.pacman ? this.pacman.publicState(me ? me.id : null) : null,
      tetris: this.tetris ? this.tetris.publicState() : null,
      tron: this.tron ? this.tron.publicState() : null,
      g2048: this.g2048 ? this.g2048.publicState() : null,
      photoPhase: this.photoPhase,
      photos: this.photoPhase ? this.photos : [],
      photoResults: this.photoPhase === 'results' ? this.photoResults() : null,
      log: this.log.slice(0, 12),
      players: this.players.map((p) => ({
        id: p.id, name: p.name, avatar: p.avatar, connected: p.connected,
        lives: p.lives, coins: p.coins, ready: p.ready,
      })),
      // Bloc privé (uniquement pour le joueur qui demande via son token)
      me: me && this.privateView(me, world),
    };
  }

  privateView(me, world) {
    const av = AVATARS[me.avatar];
    const isGlitch = me.id === this.glitchId;
    const isHero = !!me.isHero;
    return {
      id: me.id,
      name: me.name,
      avatar: me.avatar,
      avatarInfo: av,
      lives: me.lives,
      coins: me.coins,
      ready: me.ready,
      isHost: !!me.isHost,
      isHero,
      // Le pouvoir Game Master n'apparaît qu'après le réveil au Monde 4
      gameMaster: isHero && this.heroAwakened,
      // Indices perso pour le monde courant
      indices: world && world.indices ? (world.indices[me.avatar] || null) : null,
      // Missions du Glitch (visibles uniquement par lui)
      glitchMission: isGlitch ? this.glitchMissionFor(world) : null,
      // Carnet secret : mission perso + indice sur un autre joueur
      mission: this.clues[me.id] ? this.clues[me.id].mission : null,
      secretClue: this.clues[me.id] ? this.clues[me.id].clue : null,
      // Défis photo
      photoMissions: PHOTO_MISSIONS[me.avatar] || [],
      myPhotos: this.photos.filter(p => p.playerId === me.id).map(p => ({ missionIdx: p.missionIdx, url: p.url })),
      myPhotoVotes: this.photoVotes[me.id] || {},
    };
  }

  glitchMissionFor(world) {
    if (!world) return null;
    const missions = {
      w1: "Sème le doute : accuse discrètement quelqu'un d'autre dès maintenant.",
      w2: "Sabotage : donne une fausse direction dans le labyrinthe sans te griller.",
      w3: "Cache ou 'perds' une pièce du puzzle pendant 3 minutes.",
      w4: "Le Game Master est éveillé. Reste naturel, détourne les soupçons.",
      w5: "C'est l'heure du vote. Fais accuser un innocent. Mens avec panache.",
      w6: "Dernier sabotage : ralentis le boss final d'une bêtise… puis sauve-toi.",
    };
    return missions[world.id] || "Sabote discrètement et survis.";
  }
}
