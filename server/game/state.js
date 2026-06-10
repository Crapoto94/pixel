// =====================================================================
//  GameState — l'état partagé de la partie (en mémoire + sauvegarde JSON).
//  Toute mutation passe par une méthode qui appelle this.touch() pour
//  notifier les clients connectés (SSE) et persister sur disque.
// =====================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PLAYERS, NPCS, CONFIG } from '../config.js';
import { AVATARS } from '../data/avatars.js';
import { WORLDS, getWorld, normalize } from '../data/worlds.js';
import { pickGage } from '../data/gages.js';
import { QUESTIONS } from '../data/quiz.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAVE_FILE = path.join(__dirname, '..', 'save.json');

export class GameState {
  constructor() {
    this.listeners = new Set(); // callbacks SSE
    this.reset(false);
    this.load();
  }

  // ---- Cycle de vie -------------------------------------------------
  reset(persist = true) {
    this.phase = 'lobby'; // lobby | world | bonus | activity | finale | win
    this.worldIndex = 0; // index dans WORLDS
    this.activity = null; // activité BORNE en cours (objet)
    this.currentGage = null; // gage affiché en ce moment
    this.glitchId = null; // id du joueur traître (tiré au sort)
    this.glitchRevealed = false;
    this.heroAwakened = false; // Vincent a-t-il reçu ses pouvoirs ?
    this.kidsDone = false; // les Pixels (enfants) ont-ils réussi leur défi ?
    this.votes = {}; // { voterId: targetId }
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
    const { listeners, ...data } = this;
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
    this.addLog('🐛 Le GLITCH a été désigné secrètement par le serveur.');
    this.touch();
  }

  // ---- Démarrage de partie -----------------------------------------
  startGame() {
    if (!this.glitchId) this.assignGlitch();
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
    this.activity = {
      type,
      startedAt: Date.now(),
      state: 'running',
      data: opts,
      buzzes: [], // [{id, name, t}]
      scores: {},
    };
    // Quiz / blind-test : on initialise le déroulé QCM
    if (type === 'quiz' || type === 'blindtest') {
      const deck = type === 'blindtest' ? 'blindtest' : (opts.deck || 'videogame');
      this.activity.deck = deck;
      this.activity.qIndex = 0;
      this.activity.sub = 'question'; // question | reveal
      this.activity.answers = {}; // { playerId: { choice, t } }
    }
    this.phase = 'activity';
    this.addLog(`🎮 Activité BORNE : ${type}.`);
    this.touch();
  }

  // ---- Quiz / blind-test : QCM affiché borne, réponse smartphone ----
  quizQuestion() {
    const a = this.activity;
    if (!a || (a.type !== 'quiz' && a.type !== 'blindtest')) return null;
    const list = QUESTIONS[a.deck] || [];
    return list[a.qIndex] || null;
  }

  quizAnswer(playerId, choice) {
    const a = this.activity;
    if (!a || a.sub !== 'question') return;
    if (a.answers[playerId]) return; // déjà répondu, on garde la 1ʳᵉ
    a.answers[playerId] = { choice: Number(choice), t: Date.now() };
    this.touch();
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
    corrects.forEach(([pid, ans], i) => {
      const bonus = i === 0 ? 50 : 0; // premier bon répondeur : bonus speed
      const gain = q.points + bonus;
      a.scores[pid] = (a.scores[pid] || 0) + gain;
      const p = this.player(pid);
      if (p) p.coins += Math.round(gain / 50); // converti en PIÈCES
    });
    this.addLog(`💡 Réponse révélée : « ${q.choices[q.answer]} » (${corrects.length} bonne(s) réponse(s)).`);
    this.touch();
  }

  quizNext() {
    const a = this.activity;
    if (!a) return;
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
    if (a.type !== 'quiz' && a.type !== 'blindtest') return a;
    const q = this.quizQuestion();
    const list = QUESTIONS[a.deck] || [];
    const reveal = a.sub === 'reveal';
    return {
      type: a.type,
      state: a.state,
      deck: a.deck,
      sub: a.sub,
      qIndex: a.qIndex,
      total: list.length,
      prompt: q ? q.prompt : '',
      choices: q ? q.choices : [],
      media: q ? q.media : null,
      audioUrl: q && reveal ? q.audioUrl || null : (q ? q.audioUrl || null : null),
      answeredCount: Object.keys(a.answers).length,
      playerCount: this.players.filter((p) => p.connected).length,
      // Seulement à la révélation :
      answer: reveal && q ? q.answer : null,
      answers: reveal ? a.answers : null,
      scores: reveal ? a.scores : null,
      leaderboard: reveal ? this.quizLeaderboard() : null,
      myAnswer: forPlayerId && a.answers[forPlayerId] ? a.answers[forPlayerId].choice : null,
    };
  }

  quizLeaderboard() {
    const a = this.activity;
    return Object.entries(a.scores || {})
      .map(([pid, pts]) => ({ id: pid, name: this.player(pid)?.name, pts }))
      .sort((x, y) => y.pts - x.pts);
  }

  buzz(playerId) {
    if (!this.activity || this.activity.state !== 'running') return;
    if (this.activity.buzzes.find((b) => b.id === playerId)) return;
    const p = this.player(playerId);
    this.activity.buzzes.push({ id: playerId, name: p?.name, t: Date.now() });
    this.touch();
  }

  stopActivity() {
    if (this.activity) this.activity.state = 'done';
    this.phase = 'world';
    this.touch();
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
