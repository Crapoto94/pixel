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
import { PongGame } from './pong.js';
import { NOTE_PALETTE, MELODY, MOSAIC_DEFAULT_WORD, pickMosaicWord,
  PIANO_KEYS_PER_PHONE, PIANO_BASE_MIDI, PIANO_MELODY, pianoNoteInfo,
  pianoDemoSeq, pianoKeyLayout } from '../data/collab.js';
import { AVATAR_MISSION, SOCIAL_FACTS } from '../data/clues.js';
import { PHOTO_MISSIONS } from '../data/photos.js';
import { ANECDOTES } from '../data/anecdotes.js';
import { SPOTLIGHT_DEFIS } from '../data/spotlight.js';
import { DRAW_WORDS } from '../data/draw_words.js';
import { ENQUETE } from '../data/enquete.js';
import { SCENARIO_SLIDES } from '../data/briefing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAVE_FILE = path.join(__dirname, '..', 'save.json');

// Enquête : on ne peut demander un indice qu'au bout de 3 min sur un acte non résolu.
const ENQUETE_HINT_LOCK_MS = 3 * 60 * 1000;

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
    this.playlistTracks = {}; // { theme: [{id,title}] } collectés depuis la borne — survit au reset()
    this._autoAdvanceTimer = null; // timer interne non persisté
    this.reset(false);
    this.load();
    // Compat : anciens saves où playlistTracks était un tableau (rock seul).
    if (Array.isArray(this.playlistTracks)) this.playlistTracks = { rock: this.playlistTracks };
    if (!this.playlistTracks || typeof this.playlistTracks !== 'object') this.playlistTracks = {};
  }

  // ---- Cycle de vie -------------------------------------------------
  reset(persist = true) {
    if (this.pacmanTimer) { clearInterval(this.pacmanTimer); this.pacmanTimer = null; }
    if (this.tetrisTimer) { clearInterval(this.tetrisTimer); this.tetrisTimer = null; }
    if (this.tronTimer) { clearInterval(this.tronTimer); this.tronTimer = null; }
    if (this.g2048Timer) { clearInterval(this.g2048Timer); this.g2048Timer = null; }
    if (this.pongTimer) { clearInterval(this.pongTimer); this.pongTimer = null; }
    if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
    if (this._roueTimer) { clearTimeout(this._roueTimer); this._roueTimer = null; }
    if (this._briefTimer) { clearTimeout(this._briefTimer); this._briefTimer = null; }
    if (this._drawTimer) { clearTimeout(this._drawTimer); this._drawTimer = null; }
    if (this._celebrateTimer) { clearTimeout(this._celebrateTimer); this._celebrateTimer = null; }
    if (this._enqueteBriefTimer) { clearTimeout(this._enqueteBriefTimer); this._enqueteBriefTimer = null; }
    this.pacman = null; // partie Pac-Man en cours
    this.tetris = null; // partie Tetris en cours
    this.tron = null;   // partie Tron en cours
    this.g2048 = null;  // partie 2048 en cours
    this.pong = null;   // partie Pong en cours
    this.pacRotation = []; // historique des rôles Pac (rotation entre manches)
    this.mosaicCount = 0; // manches de mosaïque jouées (difficulté croissante)
    this.phase = 'lobby'; // lobby | world | bonus | activity | finale | win
    this.worldIndex = 0; // index dans WORLDS
    this.activity = null; // activité BORNE en cours (objet)
    this.currentGage = null; // gage affiché en ce moment
    this.heroAwakened = false; // Vincent a-t-il reçu ses pouvoirs ?
    this.heroQuest = null;     // Monde 4 : checklist des missions du Game Master (cf. awakenHero) — reset() le remet à null ici
    this.kidsDone = false; // les Pixels (enfants) ont-ils réussi leur défi ?
    // --- Monde 6 : porte « Konami collectif » ---
    this.w6Konami = {};  // { playerId: true } — qui a saisi la SÉQUENCE LÉGENDAIRE
    this.w6Hint = false; // indice « un pour tous et tous pour un » (dès le 1er code saisi)
    this.w6Reboot = false; // quelqu'un a tapé REBOOT → on guide vers le LEET
    // Vidéo-indice diffusée sur la borne à la demande d'un joueur (ex. Monde 1)
    this.hintVideo = null; // { video, start, at } ou null
    // --- Monde 3 : piano réparti intégré au monde (un demi-octave/téléphone) ---
    this.pianoUnlocked = false; // le mot-code (OCTAVE) débloque le piano
    this.pianoStep = 0;
    this.pianoStatus = 'playing';
    this.pianoDemoAt = 0;
    this.pianoWrongAt = 0; // horodatage de la dernière erreur (→ on repart de zéro)
    this.clues = {}; // { playerId: { mission, clue } } — carnet secret (mission perso + indice social)
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
      g2048Timer, g2048, pongTimer, pong,
      _autoAdvanceTimer, _roueTimer, _briefTimer, _drawTimer, _celebrateTimer, _enqueteBriefTimer, ...data } = this;
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

  // ---- Carnet secret (mission perso + indice social) ---------------
  // Chaque joueur reçoit une mission fun et un petit indice social (« tu sais
  // un truc sur X »). Pas d'enquête sur les joueurs : juste de quoi animer la table.
  generateClues(rng = Math.random) {
    const players = this.players;
    this.clues = {};
    players.forEach((p) => {
      const others = players.filter((q) => q.id !== p.id);
      const target = others[Math.floor(rng() * others.length)];
      const fact = SOCIAL_FACTS[Math.floor(rng() * SOCIAL_FACTS.length)];
      this.clues[p.id] = {
        mission: AVATAR_MISSION[p.avatar] || 'Amuse-toi et marque des points.',
        clue: target ? `🔎 Tu sais un truc sur ${target.name} : il/elle ${fact}. Va lui en parler.` : null,
      };
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
  // Les titres sont rangés par THÈME (rock / francais / dessins / …).
  themePool(theme) {
    theme = theme || 'rock';
    if (!this.playlistTracks[theme]) this.playlistTracks[theme] = [];
    return this.playlistTracks[theme];
  }
  themeTrackCount(theme) {
    return theme ? this.themePool(theme).length : 0;
  }
  addPlaylistTrack(theme, videoId, videoTitle) {
    if (!videoId || !videoTitle) return;
    const pool = this.themePool(theme);
    if (!pool.find(t => t.id === videoId)) pool.push({ id: videoId, title: videoTitle });
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
  async ingestPlaylist(theme, ids) {
    const pool = this.themePool(theme);
    const todo = (ids || []).filter((id) => id && !pool.find((t) => t.id === id));
    let added = 0;
    const fetchTitle = async (id) => {
      const url = 'https://www.youtube.com/oembed?format=json&url='
        + encodeURIComponent('https://www.youtube.com/watch?v=' + id);
      const d = await this._getJson(url);
      if (d && d.title) { this.addPlaylistTrack(theme, id, d.title); added++; }
    };
    for (let i = 0; i < todo.length; i += 6) {
      await Promise.all(todo.slice(i, i + 6).map(fetchTitle));
    }
    if (added) {
      this.addLog(`🎵 Blind-test (${theme}) : ${pool.length} titres en mémoire.`);
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
    const pool = [...this.themePool(a.theme)];
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
    if (this._briefTimer) { clearTimeout(this._briefTimer); this._briefTimer = null; }
    this.activity = null; // on quitte le briefing pour de bon : aucun retour en arrière
    this.generateClues(); // carnet secret : mission perso + indice social pour chacun
    this.phase = 'world';
    this.worldIndex = 0;
    this.addLog('🕹️ INSERT COIN — la partie commence !');
    // Le 1er colis n'était jamais réclamé : la borne le demande au lancement.
    const w1 = this.currentWorld();
    if (w1) this.addLog(`📦 COLIS ${w1.colis} — PIXELS, livrez le premier colis !`);
    this.touch();
  }

  // ---- Progression des mondes --------------------------------------
  submitCode(playerId, code) {
    const world = this.currentWorld();
    if (!world || this.phase === 'finale' || this.phase === 'win') {
      return { ok: false, reason: 'Aucun monde actif.' };
    }
    if (world.enqueteWorld) {
      return { ok: false, reason: 'Ce monde se résout en élucidant LA GRANDE ENQUÊTE sur la borne.' };
    }
    const p = this.player(playerId);
    // Énigme réservée au PLAYER ONE : seul le héros (Vincent) peut valider.
    if (world.heroOnly && !(p && p.isHero)) {
      return { ok: false, reason: 'Seul le PLAYER ONE peut valider cette séquence. Donne-lui tes touches !' };
    }
    // Monde à « porte Konami » (Monde 6) : la commande n'est acceptée qu'une fois
    // que TOUS les joueurs ont saisi la SÉQUENCE LÉGENDAIRE sur leur manette.
    if (world.konamiGate) {
      if (!this.w6GateComplete()) {
        return { ok: false, reason: 'Séquence légendaire incomplète : tout le monde doit la saisir d\'abord !' };
      }
      // « Presque » : quelqu'un tape REBOOT en clair → on l'oriente vers le LEET.
      if (world.nearMiss && normalize(code) === normalize(world.nearMiss)) {
        this.w6Reboot = true;
        this.addLog(`🔢 ${p ? p.name : '?'} a tapé REBOOT… presque ! Il faut le LEET.`);
        this.touch();
        return { ok: false, reason: world.nearMissMsg || 'Presque… essaie en LEET.' };
      }
    }
    // Monde « Game Master » (Monde 4) : le mot-code RÉVEILLE les pouvoirs de
    // Vincent — il ne valide PAS le monde. Vincent valide ensuite via ses missions.
    if (world.heroWorld) {
      if (this.heroAwakened) {
        return { ok: false, reason: 'Pouvoirs déjà actifs — accomplis tes missions de Game Master !' };
      }
      if (normalize(code) === world.codeNormalise) {
        this.awakenHero();
        this.touch();
        return { ok: true };
      }
      this.addLog(`❌ Mot refusé (Monde ${world.num}).`);
      this.touch();
      return { ok: false, reason: 'Mot incorrect.' };
    }
    // Monde « piano » (Monde 3) : le mot-code DÉBLOQUE le piano réparti
    // (il ne valide PAS le monde : c'est la mélodie jouée qui le valide).
    if (world.pianoWorld) {
      if (this.pianoUnlocked) {
        return { ok: false, reason: 'Piano déjà débloqué — jouez la mélodie sur vos téléphones !' };
      }
      if (normalize(code) === world.codeNormalise) {
        this.pianoUnlocked = true;
        this.pianoStep = 0;
        this.pianoStatus = 'playing';
        this.pianoWrongAt = 0;
        this.pianoDemoAt = Date.now(); // la BORNE joue la mélodie à reproduire dès le réveil
        this.addLog(`🎹 ${p ? p.name : '?'} a trouvé « ${world.code} » — le PIANO RÉPARTI se réveille ! Écoutez la mélodie…`);
        this.touch();
        return { ok: true };
      }
      this.addLog(`❌ Mot refusé (Monde ${world.num}).`);
      this.touch();
      return { ok: false, reason: 'Mot incorrect.' };
    }
    const ok = normalize(code) === world.codeNormalise;
    if (ok) {
      this.addLog(`✅ ${p ? p.name : '?'} a validé le code du Monde ${world.num} !`);
      this.completeWorld();
      return { ok: true };
    }
    this.addLog(`❌ Code refusé pour le Monde ${world.num}.`);
    this.touch();
    return { ok: false, reason: 'Code incorrect.' };
  }

  // ---- Monde 6 : porte « Konami collectif » ------------------------
  // Tous les joueurs connectés doivent avoir saisi la SÉQUENCE LÉGENDAIRE.
  w6GateComplete() {
    const connected = this.players.filter((p) => p.connected);
    return connected.length > 0 && connected.every((p) => this.w6Konami[p.id]);
  }

  // Un joueur saisit la séquence Konami sur SA manette (Monde 6).
  submitW6Konami(playerId, code) {
    const world = this.currentWorld();
    if (!world || !world.konamiGate) {
      return { ok: false, reason: 'Pas de séquence à saisir ici.' };
    }
    if (normalize(code) !== world.konamiNormalise) {
      this.addLog('❌ Séquence légendaire refusée (Monde 6).');
      this.touch();
      return { ok: false, reason: 'Séquence incorrecte.' };
    }
    const p = this.player(playerId);
    if (!this.w6Konami[playerId]) {
      this.w6Konami[playerId] = true;
      this.w6Hint = true; // « un pour tous et tous pour un » dès le 1er code validé
      this.addLog(`🎮 ${p ? p.name : '?'} a saisi la SÉQUENCE LÉGENDAIRE !`);
      if (this.w6GateComplete()) {
        this.addLog('🤝 UN POUR TOUS ET TOUS POUR UN — porte ouverte ! Tapez la commande de redémarrage (en LEET).');
      }
    }
    this.touch();
    return { ok: true, gateComplete: this.w6GateComplete() };
  }

  // ---- Vidéo-indice (diffusée sur la borne à la demande) -----------
  // Un joueur clique « Un indice » : on diffuse la vidéo configurée sur le
  // monde courant (ex. Monde 1) sur la BORNE, sans interrompre le jeu.
  requestHintVideo(playerId) {
    const world = this.currentWorld();
    if (!world || !world.hintVideo) return { ok: false, reason: 'Aucun indice vidéo ici.' };
    const p = this.player(playerId);
    this.hintVideo = { ...world.hintVideo, at: Date.now() };
    this.addLog(`💡 ${p ? p.name : '?'} demande un indice — vidéo sur la BORNE.`);
    this.touch();
    return { ok: true };
  }

  clearHintVideo() {
    if (!this.hintVideo) return;
    this.hintVideo = null;
    this.touch();
  }

  // opts.celebrate : true = danse des canards (réussite JOUEURS), false = passage
  //  direct sans danse (le MJ fait avancer manuellement).
  completeWorld(opts = {}) {
    const celebrate = opts.celebrate !== false;
    const world = this.currentWorld();
    if (!world) return;
    // Récompense : tous les joueurs connectés gagnent une pièce
    this.players.forEach((p) => { if (p.connected) p.coins += 1; });

    // Twist du monde
    if (world.id === 'w4') this.awakenHero();
    if (world.twist) this.addLog(`🌀 ${world.twist}`);

    // Finale : pas de danse, on enchaîne sur l'écran de victoire.
    if (world.isFinale) {
      this.phase = 'win';
      this.addLog('🏆 YOU WIN ! La réalité a redémarré.');
      this.touch();
      return;
    }
    // Passage forcé par le MJ : pas de danse, on enchaîne directement.
    if (!celebrate) {
      this.addLog(`⏭ Monde ${world.num} validé par le MJ (passage direct).`);
      this._advanceWorld();
      return;
    }
    // Réussite JOUEURS → célébration : 10 s de la danse des canards, PUIS suite.
    this.addLog(`✅ Monde ${world.num} réussi — petite danse de la victoire ! 🦆`);
    this.startActivity('videoshow', {
      video: '7kyY29BHTZs',
      topLabel: '🎉 BRAVO !',
      chyron: 'NIVEAU RÉUSSI 🎉<br>Cela mérite bien une petite danse !',
      footer: 'Dansez la danse des canards 🦆',
      skipIntro: true,
    });
    if (this._celebrateTimer) clearTimeout(this._celebrateTimer);
    this._celebrateTimer = setTimeout(() => {
      this._celebrateTimer = null;
      this._advanceWorld();
    }, 10000);
  }

  // Avance au monde suivant (coupe toute activité, réinitialise l'état piano).
  _advanceWorld() {
    this.activity = null;          // coupe une éventuelle vidéo de célébration
    this.heroQuest = null;         // la quête Game Master ne concerne que le Monde 4
    this.pianoUnlocked = false;    // le piano du monde suivant repart verrouillé
    this.pianoStep = 0; this.pianoStatus = 'playing'; this.pianoDemoAt = 0; this.pianoWrongAt = 0;
    this.worldIndex += 1;
    const next = this.currentWorld();
    if (next) this.addLog(`📦 COLIS ${next.colis} débloqué — PIXELS, livrez le colis !`);
    this.phase = 'world';
    // Monde « enquête » (Monde 5) : LA GRANDE ENQUÊTE se lance d'elle-même ;
    // sa résolution validera le monde (cf. submitEnqueteCode / enqueteSkip).
    if (next && next.enqueteWorld) {
      this.addLog('🕵️ LA GRANDE ENQUÊTE commence — résolvez tous les actes pour ouvrir la dernière porte !');
      this.startActivity('enquete');
    }
    this.touch();
  }

  awakenHero() {
    if (this.heroAwakened) return; // déjà éveillé : on ne réinitialise pas la quête
    this.heroAwakened = true;
    // Checklist des missions à accomplir pour ouvrir le Monde 5.
    this.heroQuest = {
      video: false,      // lancer une vidéo de fête
      blindtest: false,  // lancer un blind-test
      quiz: false,       // lancer un quiz
      roue: false,       // lancer une roue des gages
      anecdote: false,   // lancer une anecdote
      games: { tetris: false, pacman: false, draw: false, pong: false }, // tous les jeux
    };
    const v = this.players.find((p) => p.isHero);
    if (v) this.addLog(`👑 ${v.name} est désormais le GAME MASTER ! Accomplis tes missions pour ouvrir le Monde 5.`);
  }

  // Enregistre l'accomplissement d'une mission du Game Master quand une activité
  // est lancée au Monde 4. (Appelé en tête de startActivity.)
  _recordHeroMission(type) {
    if (!this.heroAwakened || !this.heroQuest) return;
    if (this.currentWorld()?.id !== 'w4') return;
    const q = this.heroQuest;
    if (type === 'videoshow') q.video = true;
    else if (type === 'blindtest') q.blindtest = true;
    else if (type === 'quiz') q.quiz = true;
    else if (type === 'roue_des_gages') q.roue = true;
    else if (type === 'anecdote') q.anecdote = true;
    else if (Object.prototype.hasOwnProperty.call(q.games, type)) q.games[type] = true;
  }

  // Toutes les missions du Game Master sont-elles accomplies ?
  heroQuestComplete() {
    const q = this.heroQuest;
    if (!q) return false;
    return q.video && q.blindtest && q.quiz && q.roue && q.anecdote
      && Object.values(q.games).every(Boolean);
  }

  // Vincent valide le Monde 4 (possible seulement une fois la quête terminée).
  heroValidateWorld() {
    const w = this.currentWorld();
    if (!w || !w.heroWorld) return { ok: false, reason: 'Pas le monde du Game Master.' };
    if (!this.heroQuestComplete()) {
      return { ok: false, reason: 'Termine d\'abord TOUTES tes missions de Game Master.' };
    }
    this.addLog('👑 Game Master : toutes les missions accomplies — passage au Monde 5 !');
    this.completeWorld({ celebrate: false });
    return { ok: true };
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

  // ---- Activités BORNE (reaction, buzzer, spotlight, roue...) -------
  startActivity(type, opts = {}) {
    // Toute nouvelle activité annule un éventuel auto-lancement du briefing.
    if (this._briefTimer) { clearTimeout(this._briefTimer); this._briefTimer = null; }
    // Monde 4 : coche la mission correspondante du Game Master (avant les early-returns des jeux).
    this._recordHeroMission(type);
    if (type === 'pacman') return this.startPacman(opts);
    if (type === 'tetris') return this.startTetris(opts);
    if (type === 'tron') return this.startTron(opts);
    if (type === '2048') return this.startG2048(opts);
    if (type === 'pong') return this.startPong(opts);
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
        rows = Math.min(round, 3); // 2 puis 3 lignes max (4 en quinconce = trop dur)
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
      this.activity.solved = false;
      this.activity.solvedBy = null;
      this.activity.failed = false;
      this.activity.wrongCount = 0;
      this.activity.maxWrong = 3; // après 3 erreurs, la borne révèle la réponse
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
    // Piano réparti : chaque téléphone connecté = un demi-octave aligné.
    if (type === 'piano') {
      const players = this.players.filter((p) => p.connected);
      this.activity.order = players.map((p) => p.id); // ordre gauche → droite
      this.activity.keysPerPhone = PIANO_KEYS_PER_PHONE;
      this.activity.baseMidi = PIANO_BASE_MIDI;
      this.activity.melody = (opts.melody && opts.melody.length) ? opts.melody.slice() : [...PIANO_MELODY];
      this.activity.step = 0;
      this.activity.status = 'playing';
      this.activity.demo = null;
      this.activity.wrongAt = 0;
    }
    // Quiz / blind-test : on initialise le déroulé QCM
    if (type === 'quiz' || type === 'blindtest') {
      const deck = type === 'blindtest' ? 'blindtest' : (opts.deck || 'videogame');
      this.activity.deck = deck;
      this.activity.qIndex = 0;
      this.activity.sub = 'question'; // question | reveal
      this.activity.answers = {}; // { playerId: { choice, t } }
    }
    // Dessine-moi : un joueur dessine, les autres devinent (rotation des dessinateurs).
    if (type === 'draw') {
      this.activity.scores = {};       // { playerId: points }
      this.activity.round = 0;
      this.activity.order = this.players.filter((p) => p.connected).map((p) => p.id);
      this.activity.drawerPos = -1;
      this.activity.turns = 0;         // nb de tours déjà joués dans la session
      this.activity.maxTurns = this.activity.order.length; // chacun dessine une fois
      this._drawNewRound();
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
    // La 1ère chanson démarre automatiquement (si les titres sont déjà collectés ;
    // sinon le GM dispose d'un bouton de secours « Lancer la 1ère chanson »).
    if (type === 'blindtest') {
      this.activity.theme = opts.theme || 'rock'; // rock | francais | dessins
      this.activity.dynamicBlindtest = true;
      this.activity.generatedQuestion = null;
      this.activity.playVideoId = null;
      this.activity.playRequestedAt = 0;
      this.activity.firstCorrectName = null;
      this.activity.total = 15; // 15 morceaux par séance
      this.activity.asked = 0;  // morceaux déjà joués
      this.blindtestAsk();      // pioche et lance la 1ère chanson tout de suite
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
      // Briefing d'OUVERTURE en slides (sur la borne, 12 s/slide) AVANT l'acte 1 ;
      // pendant ce temps les téléphones affichent « MEURTRE À SAINT-MAUR ».
      this.activity.sub = 'briefing';
      this.activity.briefAt = Date.now();
      const totalMs = (ENQUETE.briefingSlides || []).reduce((s, sl) => s + (sl.sec || 8), 0) * 1000;
      if (this._enqueteBriefTimer) clearTimeout(this._enqueteBriefTimer);
      this._enqueteBriefTimer = setTimeout(() => {
        this._enqueteBriefTimer = null;
        this.enqueteStartActs();
      }, totalMs || 1000);
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
    // Diffusion vidéo : tout le monde (borne + téléphones) joue une vidéo
    // YouTube avec un bandeau (danse des canards, anecdotes, etc.).
    if (type === 'videoshow') {
      this.activity.video = opts.video || '7kyY29BHTZs';
      this.activity.topLabel = opts.topLabel || '📺 VIDÉO';
      this.activity.chyron = opts.chyron || '';
      this.activity.footer = opts.footer || '';
      this.activity.skipIntro = opts.skipIntro || false; // true = pas de sting, la vidéo démarre direct
    }
    // Hero-quiz (Anecdote 3) : la borne joue une vidéo, puis VINCENT devine.
    //  Bonne réponse → écran « BRAVO VINCENT » (feux d'artifice + musique).
    if (type === 'heroquiz') {
      this.activity.video = opts.video || '';
      this.activity.topLabel = opts.topLabel || '💡 ANECDOTE';
      this.activity.question = opts.question || 'Qui est-ce ?';
      this.activity.hintLabel = opts.hintLabel || '';
      this.activity.answer = opts.answer || '';        // gardé côté serveur (jamais envoyé)
      this.activity.celebrateVideo = opts.celebrateVideo || '';
      this.activity.sub = 'play';                      // play → win
      this.activity.lastWrong = 0;
    }
    // Anecdote : la borne affiche un prompt (souvenir / histoire) à raconter.
    if (type === 'anecdote') {
      const an = (opts.anecdote && opts.anecdote.titre)
        ? opts.anecdote
        : ANECDOTES[Math.floor(Math.random() * ANECDOTES.length)];
      this.activity.anecdote = an;
      this.addLog(`📖 Anecdote lancée : « ${an.titre} ».`);
    }
    // Briefing : les slides défilent en boucle sur la borne et le briefing
    // RESTE affiché jusqu'à ce que le GM clique « ▶ DÉMARRER ». Pas d'auto-
    // démarrage (sinon la partie repartait toute seule / revenait au briefing).
    // (rien à planifier ici)
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
    if (a.type === 'piano') return this.pianoPublic(forPlayerId);
    if (a.type === 'heroquiz') return {
      type: 'heroquiz', state: a.state, sub: a.sub,
      video: a.video, topLabel: a.topLabel, question: a.question, hintLabel: a.hintLabel,
      celebrateVideo: a.sub === 'win' ? a.celebrateVideo : null,
      wonAt: a.wonAt || 0, lastWrong: a.lastWrong || 0,
    };
    if (a.type === 'mosaic') return this.mosaicPublic(forPlayerId);
    if (a.type === 'enquete') return this.enquetePublic(forPlayerId);
    if (a.type === 'draw') return this._drawPublic(forPlayerId);
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
      theme: a.theme || null,
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
    a.docDist = {};
    if (!act) return;
    a.fragRevealed = 0; // pièces déjà dévoilées (acts « fragmentsHidden » : 1 par indice MJ)
    a.actStartedAt = Date.now(); // début de l'acte → sert au verrou de 3 min des indices
    const players = this.players.filter((p) => p.connected);
    if (!players.length) return;
    (act.fragments || []).forEach((f, i) => {
      const owner = players[i % players.length];
      // _i = rang global de la pièce (sert à la révélation progressive par le MJ)
      (a.frag[owner.id] = a.frag[owner.id] || []).push({ ...f, _i: i });
    });
    // Documents À VISUALISER (journal, mails, annuaire…) : un par joueur, à ouvrir
    // sur SON téléphone. Répartis en décalé pour qu'aucun joueur n'ait tout.
    (act.docs || []).forEach((d, i) => {
      const owner = players[i % players.length];
      (a.docDist[owner.id] = a.docDist[owner.id] || []).push(d);
    });
  }

  // Fin du briefing en slides → on ouvre l'ACTE 1 (auto en fin de slides, ou via le MJ).
  enqueteStartActs() {
    const a = this.activity;
    if (!a || a.type !== 'enquete' || a.sub !== 'briefing') return;
    if (this._enqueteBriefTimer) { clearTimeout(this._enqueteBriefTimer); this._enqueteBriefTimer = null; }
    a.sub = 'acts';
    this._enqueteDistribute();
    this.addLog(`🕵️ Briefing terminé — ACTE 1 : « ${ENQUETE.acts[0]?.title || ''} ».`);
    this.touch();
  }

  // Un joueur propose un code pour l'acte courant.
  submitEnqueteCode(playerId, code) {
    const a = this.activity;
    if (!a || a.type !== 'enquete' || a.done) return { ok: false, reason: 'Pas d\'enquête en cours.' };
    if (a.sub === 'briefing') return { ok: false, reason: 'Le briefing est en cours — regardez la borne.' };
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
        this._enqueteMaybeCompleteWorld(); // Monde 5 : la résolution ouvre le Monde 6
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

  // GM bypasse le verrou 3 min : l'indice devient disponible immédiatement.
  enqueteHintUnlock() {
    const a = this.activity;
    if (!a || a.type !== 'enquete') return;
    a.actStartedAt = Date.now() - ENQUETE_HINT_LOCK_MS;
    this.addLog('⚡ GM : verrou 3 min levé — indices disponibles maintenant.');
    this.touch();
  }

  // Combien de temps reste-t-il avant de pouvoir demander un indice (ms) ?
  enqueteHintLockRemaining() {
    const a = this.activity;
    if (!a || a.type !== 'enquete') return 0;
    return Math.max(0, ENQUETE_HINT_LOCK_MS - (Date.now() - (a.actStartedAt || 0)));
  }

  // Le GM (Marc OU Vincent éveillé) révèle un indice de plus sur l'acte courant.
  // Verrou : indisponible pendant les 3 premières minutes de l'acte.
  enqueteHint() {
    const a = this.activity;
    if (!a || a.type !== 'enquete') return;
    if (a.sub === 'briefing') return;
    const act = ENQUETE.acts[a.actIndex];
    if (!act) return;
    if (this.enqueteHintLockRemaining() > 0) {
      const s = Math.ceil(this.enqueteHintLockRemaining() / 1000);
      this.addLog(`⏳ Indices verrouillés encore ${s}s (3 min par acte).`);
      this.touch();
      return;
    }
    // Actes « fragmentsHidden » (ex. Acte 1) : « Donner un indice » dévoile la
    // PIÈCE suivante sur le téléphone du joueur qui la détient (une par une).
    if (act.fragmentsHidden) {
      const total = (act.fragments || []).length;
      if ((a.fragRevealed || 0) < total) {
        a.fragRevealed = (a.fragRevealed || 0) + 1;
        this.addLog(`💡 Indice ${a.fragRevealed}/${total} dévoilé (Acte ${act.num}) — sur le téléphone du joueur concerné.`);
        this.touch();
      }
      return;
    }
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
    // Pendant le briefing en slides : « passer » = ouvrir directement l'acte 1.
    if (a.sub === 'briefing') { this.enqueteStartActs(); return; }
    const act = ENQUETE.acts[a.actIndex];
    a.actIndex += 1;
    a.lastWrong = 0;
    if (a.actIndex >= ENQUETE.acts.length) {
      a.done = true; a.frag = {};
      this.addLog('🔓 ENQUÊTE débloquée jusqu\'au bout par le GM.');
      this._enqueteMaybeCompleteWorld(); // Monde 5 : la résolution ouvre le Monde 6
    } else {
      this._enqueteDistribute();
      this.addLog(`⏭ GM : passage forcé à l'acte ${act ? act.num + 1 : '?'}.`);
    }
    this.touch();
  }

  // Si l'enquête résolue est CELLE du Monde 5 (enqueteWorld), on valide le monde
  // (petite célébration puis passage au Monde 6).
  _enqueteMaybeCompleteWorld() {
    if (this.currentWorld()?.enqueteWorld) this.completeWorld({ celebrate: true });
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
      // Briefing d'ouverture en slides (sub='briefing') puis les actes (sub='acts').
      sub: a.sub || 'acts',
      briefSlides: ENQUETE.briefingSlides || [],
      briefAt: a.briefAt || 0,
      phoneBrief: ENQUETE.phoneBrief || '🔪 MEURTRE À SAINT-MAUR\nRegardez la borne 📺',
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
        // Acte à DOCUMENTS répartis : la borne n'affiche QUE l'énigme ; les
        // documents (journal, mails, annuaire…) sont à ouvrir sur les téléphones.
        hasDocs: !!(act.docs && act.docs.length),
        // Pièces dévoilées une par une par le MJ (sinon affichées d'emblée).
        fragmentsHidden: !!act.fragmentsHidden,
      },
      hintList: act ? (act.hints || []).slice(0, nHints) : [],
      // Le « mur d'enquête » : révélations des actes déjà résolus
      wall: acts.slice(0, idx).map((x) => ({ num: x.num, title: x.title, reveal: x.reveal })),
      lastWrong: a.lastWrong || 0,
      // Pièces du joueur. Pour un acte « fragmentsHidden », on ne renvoie que
      // celles déjà dévoilées par le MJ (rang _i < fragRevealed).
      myFragments: forPlayerId
        ? (a.frag?.[forPlayerId] || []).filter((f) => !(act && act.fragmentsHidden) || (f._i ?? 0) < (a.fragRevealed || 0))
        : [],
      // Nb de pièces du joueur encore À VENIR (pour afficher « le MJ va révéler… »).
      myFragmentsPending: (forPlayerId && act && act.fragmentsHidden)
        ? (a.frag?.[forPlayerId] || []).filter((f) => (f._i ?? 0) >= (a.fragRevealed || 0)).length
        : 0,
      // Indices : verrou de 3 min par acte + nb encore révélables (pour Vincent/MJ).
      hintUnlockAt: (a.actStartedAt || 0) + ENQUETE_HINT_LOCK_MS,
      hintsLeft: act
        ? (act.fragmentsHidden
            ? Math.max(0, (act.fragments || []).length - (a.fragRevealed || 0))
            : Math.max(0, (act.hints || []).length - (a.hints?.[a.actIndex] || 0)))
        : 0,
      // Documents que CE joueur détient + docs globaux (global:true) visibles par tous.
      myDocs: (() => {
        if (!forPlayerId) return [];
        const priv = a.docDist?.[forPlayerId] || [];
        const privIds = new Set(priv.map(d => d.id));
        const globals = act ? (act.docs || []).filter(d => d.global && !privIds.has(d.id)) : [];
        return [...priv, ...globals];
      })(),
      finale: a.done ? ENQUETE.finale : null,
    };
  }

  // Bloc réservé GM : la solution de l'acte courant.
  enqueteMaster() {
    const a = this.activity;
    if (!a || a.type !== 'enquete') return null;
    const act = ENQUETE.acts[a.actIndex];
    const fragHidden = !!(act && act.fragmentsHidden);
    return {
      done: !!a.done,
      sub: a.sub || 'acts',
      actIndex: a.actIndex,
      total: ENQUETE.acts.length,
      num: act ? act.num : null,
      title: act ? act.title : null,
      answer: act ? act.answer : null,
      // Acte « fragmentsHidden » : le bouton « Donner un indice » dévoile les
      // PIÈCES une par une → on remonte ce compteur (sinon les hints classiques).
      fragmentsHidden: fragHidden,
      hintsShown: fragHidden ? (a.fragRevealed || 0) : (a.hints?.[a.actIndex] || 0),
      hintsTotal: fragHidden ? ((act.fragments || []).length) : (act ? (act.hints || []).length : 0),
      hintUnlockAt: (a.actStartedAt || 0) + ENQUETE_HINT_LOCK_MS,
      hintLockRemaining: this.enqueteHintLockRemaining(),
      attempts: a.attempts || 0,
    };
  }

  stopActivity() {
    if (this._briefTimer) { clearTimeout(this._briefTimer); this._briefTimer = null; }
    if (this._roueTimer) { clearTimeout(this._roueTimer); this._roueTimer = null; }
    if (this.pacmanTimer) { clearInterval(this.pacmanTimer); this.pacmanTimer = null; }
    if (this.tetrisTimer) { clearInterval(this.tetrisTimer); this.tetrisTimer = null; }
    if (this.tronTimer) { clearInterval(this.tronTimer); this.tronTimer = null; }
    if (this.g2048Timer) { clearInterval(this.g2048Timer); this.g2048Timer = null; }
    if (this.pongTimer) { clearInterval(this.pongTimer); this.pongTimer = null; }
    if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
    if (this._drawTimer) { clearTimeout(this._drawTimer); this._drawTimer = null; }
    if (this._celebrateTimer) { clearTimeout(this._celebrateTimer); this._celebrateTimer = null; }
    if (this._enqueteBriefTimer) { clearTimeout(this._enqueteBriefTimer); this._enqueteBriefTimer = null; }
    this.pacman = null;
    this.tetris = null;
    this.tron = null;
    this.g2048 = null;
    this.pong = null;
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

  // ---- PONG BATTLE -------------------------------------------------
  startPong(opts = {}) {
    const players = this.players.filter((p) => p.connected);
    if (players.length < 2) { this.addLog('⚠️ Pong : il faut au moins 2 joueurs connectés.'); this.touch(); return; }
    this.pong = new PongGame(players, opts);
    this.activity = { type: 'pong', startedAt: Date.now(), state: 'running', data: {} };
    this.phase = 'activity';
    const sides = this.pong.players.map((p) => p.name).join(', ');
    this.addLog(`🏓 PONG lancé ! ${sides} défendent leur côté.`);
    if (this.pongTimer) clearInterval(this.pongTimer);
    this.pongTimer = setInterval(() => {
      if (!this.pong) return;
      this.pong.tick();
      if (this.pong.status !== 'playing') {
        clearInterval(this.pongTimer); this.pongTimer = null;
        this._applyArcadeLives(this.pong.ranking(), 'PONG', (w) => `${w.hp} PV`);
        this.save();
      }
      this.broadcast();
    }, this.pong.tickMs);
    this.touch();
  }
  pongMove(playerId, dir) { if (this.pong) this.pong.move(playerId, dir); }

  // ---- DESSINE-MOI (Pictionary) ------------------------------------
  _drawNewRound() {
    const a = this.activity;
    if (!a || a.type !== 'draw') return;
    if (this._drawTimer) { clearTimeout(this._drawTimer); this._drawTimer = null; }
    if (this._celebrateTimer) { clearTimeout(this._celebrateTimer); this._celebrateTimer = null; }
    const connected = this.players.filter((p) => p.connected).map((p) => p.id);
    a.order = (a.order || []).filter((id) => connected.includes(id));
    connected.forEach((id) => { if (!a.order.includes(id)) a.order.push(id); });
    a.maxTurns = a.order.length;
    if (!a.order.length) { a.drawerId = null; a.phase = 'draw'; return; }
    // Session terminée : chacun a dessiné une fois → classement final
    if ((a.turns || 0) >= a.maxTurns) {
      a.phase = 'end'; a.drawerId = null; a.strokes = [];
      const win = (this._drawPublic(null).leaderboard || [])[0];
      this.addLog(win ? `🎨 Session Dessine-moi terminée ! Vainqueur : ${win.name} (${win.pts} pts).` : '🎨 Session Dessine-moi terminée.');
      this.touch();
      return;
    }
    a.drawerPos = ((a.drawerPos ?? -1) + 1) % a.order.length;
    a.drawerId = a.order[a.drawerPos];
    a.turns = (a.turns || 0) + 1;
    const w = DRAW_WORDS[Math.floor(Math.random() * DRAW_WORDS.length)];
    a.word = w.word; a.category = w.cat;
    a.strokes = []; a.guessed = {}; a.phase = 'draw'; a.winnerName = null; a.round = (a.round || 0) + 1;
    this.addLog(`🎨 Dessine-moi (${a.turns}/${a.maxTurns}) : à ${this.player(a.drawerId)?.name || '?'} de dessiner (${w.cat}) !`);
    this.touch();
  }

  // Programme le passage AUTOMATIQUE au dessinateur suivant après la révélation.
  _drawScheduleNext(ms = 7000) {
    if (this._drawTimer) clearTimeout(this._drawTimer);
    this._drawTimer = setTimeout(() => { this._drawTimer = null; this._drawNewRound(); }, ms);
  }

  drawUpdate(playerId, strokes) {
    const a = this.activity;
    if (!a || a.type !== 'draw' || a.phase !== 'draw' || playerId !== a.drawerId) return;
    if (!Array.isArray(strokes)) return;
    a.strokes = strokes.slice(0, 500);
    this.broadcast();
  }

  drawGuess(playerId, text) {
    const a = this.activity;
    if (!a || a.type !== 'draw' || a.phase !== 'draw') return { ok: false };
    if (playerId === a.drawerId) return { ok: false };
    const p = this.player(playerId);
    if (normalize(text) && normalize(text) === normalize(a.word)) {
      a.phase = 'reveal';
      a.winnerName = p?.name || null;
      a.scores[playerId] = (a.scores[playerId] || 0) + 100;
      if (a.drawerId) a.scores[a.drawerId] = (a.scores[a.drawerId] || 0) + 50;
      this.addLog(`🎨 ${p?.name} a trouvé « ${a.word} » ! (+100, dessinateur +50)`);
      this._drawScheduleNext();   // dessinateur suivant automatiquement
      this.touch();
      return { ok: true, correct: true };
    }
    this.touch();
    return { ok: true, correct: false };
  }

  drawNext() {
    if (this._drawTimer) { clearTimeout(this._drawTimer); this._drawTimer = null; }
    if (this._celebrateTimer) { clearTimeout(this._celebrateTimer); this._celebrateTimer = null; }
    this._drawNewRound();
  }
  drawReveal() {
    const a = this.activity;
    if (!a || a.type !== 'draw' || a.phase !== 'draw') return;
    a.phase = 'reveal';
    this.addLog(`🎨 Mot révélé : « ${a.word} ».`);
    this._drawScheduleNext();   // dessinateur suivant automatiquement
    this.touch();
  }

  _drawPublic(forPlayerId) {
    const a = this.activity;
    const reveal = a.phase === 'reveal';
    const isDrawer = !!(forPlayerId && forPlayerId === a.drawerId);
    return {
      type: 'draw', state: a.state, phase: a.phase, round: a.round,
      turns: a.turns || 0, maxTurns: a.maxTurns || 0,
      drawerId: a.drawerId, drawerName: this.player(a.drawerId)?.name || '?',
      category: a.category, wordLen: (a.word || '').length,
      strokes: a.strokes || [], winnerName: a.winnerName || null,
      word: (reveal || isDrawer) ? a.word : null,
      iAmDrawer: isDrawer,
      leaderboard: Object.entries(a.scores || {}).map(([id, pts]) => ({ id, name: this.player(id)?.name, pts })).sort((x, y) => y.pts - x.pts),
    };
  }

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

  // ---- Piano réparti (un demi-octave par téléphone) ----------------
  // Le piano existe sous 2 formes : comme ACTIVITÉ (lancée par le MJ) OU intégré
  // au MONDE 3 (les joueurs ont directement leurs touches). Mêmes rendus.

  // Le monde courant est-il un monde « piano intégré » en cours ?
  //  NB : en phase « monde » aucune activité ne s'affiche, donc on n'exige PAS
  //  this.activity == null (sinon une activité « done » bloquerait le piano).
  pianoWorldActive() {
    const w = this.currentWorld();
    return !!(w && w.pianoWorld && this.phase === 'world');
  }
  // Ordre des téléphones (gauche → droite) = joueurs connectés, ordre stable.
  pianoOrder() {
    return this.players.filter((p) => p.connected).map((p) => p.id);
  }

  // Un joueur appuie sur une touche (offset = position absolue sur le clavier).
  pianoPress(playerId, offset) {
    offset = Number(offset);
    // 1) Piano INTÉGRÉ au Monde 3
    if (this.pianoWorldActive()) {
      if (this.pianoStatus !== 'playing') return;
      const order = this.pianoOrder();
      const idx = order.indexOf(playerId);
      if (idx < 0) return;
      const seg = pianoKeyLayout(order.length, PIANO_MELODY)[idx];
      if (offset < seg.lo || offset > seg.hi) return; // pas ta zone de touches
      if (PIANO_MELODY[this.pianoStep] === offset) {
        this.pianoStep += 1;
        if (this.pianoStep >= PIANO_MELODY.length) {
          this.pianoStatus = 'win';
          this.addLog('🎹 Mélodie complète — la PORTE SONORE s\'ouvre !');
          this.touch();
          this.completeWorld(); // la mélodie réussie valide le monde
          return;
        }
        this.touch();
      } else {
        // Mauvaise note → toute la séquence repart de zéro.
        this.pianoStep = 0;
        this.pianoWrongAt = Date.now();
        this.addLog('🎹 Fausse note ! La séquence repart du début — réécoutez bien.');
        this.touch();
      }
      return;
    }
    // 2) Piano en tant qu'ACTIVITÉ (lancée par le MJ)
    const a = this.activity;
    if (!a || a.type !== 'piano' || a.status !== 'playing') return;
    const idx = a.order.indexOf(playerId);
    if (idx < 0) return;
    const seg = pianoKeyLayout(a.order.length, a.melody)[idx];
    if (offset < seg.lo || offset > seg.hi) return;
    if (a.melody[a.step] === offset) {
      a.step += 1;
      if (a.step >= a.melody.length) {
        a.status = 'win';
        this.addLog('🎹 Mélodie jouée en entier — BRAVO l\'orchestre réparti !');
      }
      this.touch();
    } else {
      // Mauvaise note → on repart de zéro.
      a.step = 0;
      a.wrongAt = Date.now();
      this.touch();
    }
  }

  // Rejoue la mélodie en démo sur la BORNE (monde OU activité). Ne réinitialise
  // PAS la progression des joueurs : on ré-écoute juste la séquence.
  pianoDemo() {
    if (this.pianoWorldActive()) {
      this.pianoDemoAt = Date.now();
      this.addLog('🎶 La borne rejoue la mélodie (piano).');
      this.touch();
      return;
    }
    const a = this.activity;
    if (!a || a.type !== 'piano') return;
    a.demo = {
      at: Date.now(),
      seq: pianoDemoSeq(a.melody, a.baseMidi),
    };
    a.step = 0;
    this.addLog('🎶 Démo de la mélodie jouée sur la borne (piano).');
    this.touch();
  }

  // Constructeur partagé : vue piano (placement + partition + touches joueur).
  buildPianoView({ order, melody, step, status, demo, wrongAt }, forPlayerId) {
    const base = PIANO_BASE_MIDI;
    // Répartition adaptative : chaque téléphone reçoit une plage contiguë avec
    // au moins une note de la séquence (cf. pianoKeyLayout).
    const layout = pianoKeyLayout(order.length, melody);
    const segOf = (off) => layout.findIndex((s) => off >= s.lo && off <= s.hi);
    const rangeLabel = (i) => {
      const lo = pianoNoteInfo(layout[i].lo, base), hi = pianoNoteInfo(layout[i].hi, base);
      return layout[i].lo === layout[i].hi ? lo.label : `${lo.label}–${hi.label}`;
    };
    const placement = order.map((id, i) => ({
      pos: i + 1, name: this.player(id)?.name || '?', range: rangeLabel(i),
    }));
    const slots = melody.map((off, i) => {
      const n = pianoNoteInfo(off, base);
      let st = 'todo';
      if (i < step) st = 'done';
      else if (i === step && status === 'playing') st = 'next';
      return { st, name: n.name, freq: n.freq };
    });
    let nextPos = -1, nextName = null;
    if (status === 'playing' && step < melody.length) {
      const off = melody[step];
      nextPos = segOf(off) + 1;
      nextName = pianoNoteInfo(off, base).name;
    }
    const idx = forPlayerId ? order.indexOf(forPlayerId) : -1;
    const myKeys = [];
    if (idx >= 0) {
      const seg = layout[idx];
      for (let off = seg.lo; off <= seg.hi; off++) {
        const n = pianoNoteInfo(off, base);
        myKeys.push({ off, name: n.name, label: n.label, white: n.white, freq: n.freq,
          next: status === 'playing' && melody[step] === off });
      }
    }
    return {
      type: 'piano', status,
      len: melody.length, step,
      nPhones: order.length, placement, slots, nextPos, nextName,
      myPos: idx, myKeys,
      demo: demo || null,
      wrongAt: wrongAt || 0,
    };
  }

  // Vue publique du piano ACTIVITÉ.
  pianoPublic(forPlayerId) {
    const a = this.activity;
    return this.buildPianoView({ order: a.order, melody: a.melody, step: a.step, status: a.status,
      demo: a.demo ? { at: a.demo.at, seq: a.demo.seq } : null, wrongAt: a.wrongAt }, forPlayerId);
  }

  // Vue publique du piano INTÉGRÉ au Monde 3 (ou null si pas en piano-monde).
  pianoWorldPublic(forPlayerId) {
    const demo = this.pianoDemoAt
      ? { at: this.pianoDemoAt, seq: pianoDemoSeq(PIANO_MELODY, PIANO_BASE_MIDI) }
      : null;
    return this.buildPianoView({ order: this.pianoOrder(), melody: PIANO_MELODY,
      step: this.pianoStep, status: this.pianoStatus, demo, wrongAt: this.pianoWrongAt }, forPlayerId);
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
    const done = a.solved || a.failed;
    return {
      type: 'mosaic', n: a.n, rows: a.rows || 1, round: a.round || 1, reveal,
      assigned: Object.keys(a.slices || {}).length, mine,
      solved: !!a.solved, solvedBy: a.solvedBy || null, failed: !!a.failed,
      wrongCount: a.wrongCount || 0, maxWrong: a.maxWrong || 3,
      answer: done ? (a.word || '') : null, // mot révélé seulement à la réussite/échec
    };
  }

  // Un joueur propose la réponse de la mosaïque.
  mosaicGuess(playerId, text) {
    const a = this.activity;
    if (!a || a.type !== 'mosaic' || a.solved || a.failed) return { ok: false };
    const p = this.player(playerId);
    if (normalize(text) === normalize(a.word)) {
      a.solved = true; a.solvedBy = p?.name || null;
      this.addLog(`🧩 Mosaïque RÉSOLUE par ${p?.name || '?'} : « ${a.word} » !`);
      this.touch();
      return { ok: true, correct: true };
    }
    a.wrongCount = (a.wrongCount || 0) + 1;
    if (a.wrongCount >= (a.maxWrong || 3)) {
      a.failed = true; a.reveal = true;
      this.addLog(`🧩 Mosaïque : ${a.wrongCount} erreurs — réponse révélée : « ${a.word} ».`);
    } else {
      this.addLog(`🧩 Mosaïque : mauvaise réponse (${a.wrongCount}/${a.maxWrong || 3}).`);
    }
    this.touch();
    return { ok: true, correct: false, wrong: a.wrongCount };
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

  // ---- Hero-quiz (Anecdote 3) : seul VINCENT peut répondre -----------
  heroQuizAnswer(playerId, text) {
    const a = this.activity;
    if (!a || a.type !== 'heroquiz') return { ok: false, reason: 'Pas de question en cours.' };
    if (a.sub === 'win') return { ok: false, reason: 'Déjà gagné !' };
    const p = this.player(playerId);
    if (!(p && p.isHero)) return { ok: false, reason: 'Réservé à VINCENT (Player One).' };
    if (normalize(text) === normalize(a.answer)) {
      a.sub = 'win';
      a.wonAt = Date.now();
      this.addLog('🎆 BRAVO VINCENT — bonne réponse à l\'anecdote !');
      this.touch();
      return { ok: true };
    }
    a.lastWrong = Date.now();
    this.addLog('❌ Anecdote : réponse de Vincent refusée.');
    this.touch();
    return { ok: false, reason: 'Pas tout à fait… réessaie.' };
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
        enqueteWorld: !!world.enqueteWorld, heroOnly: !!world.heroOnly,
        konamiGate: !!world.konamiGate,
        hintVideo: !!world.hintVideo,
        pianoWorld: !!world.pianoWorld,
      },
      // Monde 3 : piano réparti — exposé seulement une fois le mot-code trouvé.
      piano: (this.pianoWorldActive() && this.pianoUnlocked) ? this.pianoWorldPublic(me ? me.id : null) : null,
      // Vidéo-indice en cours de diffusion sur la borne (ou null)
      hintVideo: this.hintVideo,
      // Progression de la porte « Konami collectif » (Monde 6)
      w6: world && world.konamiGate ? {
        doneCount: this.players.filter((p) => p.connected && this.w6Konami[p.id]).length,
        total: this.players.filter((p) => p.connected).length,
        gateComplete: this.w6GateComplete(),
        hint: this.w6Hint,
        rebootHint: this.w6Reboot,
      } : null,
      worldCount: WORLDS.length,
      heroAwakened: this.heroAwakened,
      kidsDone: this.kidsDone,
      currentGage: this.currentGage,
      activity: this.activityPublic(me ? me.id : null),
      pacman: this.pacman ? this.pacman.publicState(me ? me.id : null) : null,
      tetris: this.tetris ? this.tetris.publicState() : null,
      tron: this.tron ? this.tron.publicState() : null,
      g2048: this.g2048 ? this.g2048.publicState() : null,
      pong: this.pong ? this.pong.publicState() : null,
      photoPhase: this.photoPhase,
      photos: this.photoPhase ? this.photos : [],
      photoResults: this.photoPhase === 'results' ? this.photoResults() : null,
      log: this.log.slice(0, 12),
      players: this.players.map((p) => ({
        id: p.id, name: p.name, avatar: p.avatar, connected: p.connected,
        lives: p.lives, coins: p.coins, ready: p.ready,
        // Avancement des défis photo (le GM suit qui a pris combien de photos).
        photoCount: this.photos.filter((ph) => ph.playerId === p.id).length,
        photoTotal: (PHOTO_MISSIONS[p.avatar] || []).length,
      })),
      // Bloc privé (uniquement pour le joueur qui demande via son token)
      me: me && this.privateView(me, world),
    };
  }

  privateView(me, world) {
    const av = AVATARS[me.avatar];
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
      // Quête du Game Master (Monde 4) : checklist + état d'avancement.
      heroQuest: (isHero && this.heroAwakened && world && world.heroWorld) ? this.heroQuest : null,
      heroQuestComplete: (isHero && world && world.heroWorld) ? this.heroQuestComplete() : false,
      // Indices perso pour le monde courant
      indices: world && world.indices ? (world.indices[me.avatar] || null) : null,
      // Monde 6 : ai-je déjà saisi la SÉQUENCE LÉGENDAIRE sur ma manette ?
      konamiDone: !!this.w6Konami[me.id],
      // Carnet secret : mission perso + indice sur un autre joueur
      mission: this.clues[me.id] ? this.clues[me.id].mission : null,
      secretClue: this.clues[me.id] ? this.clues[me.id].clue : null,
      // Défis photo
      photoMissions: PHOTO_MISSIONS[me.avatar] || [],
      myPhotos: this.photos.filter(p => p.playerId === me.id).map(p => ({ missionIdx: p.missionIdx, url: p.url })),
      myPhotoVotes: this.photoVotes[me.id] || {},
    };
  }
}
