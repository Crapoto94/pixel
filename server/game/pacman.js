// =====================================================================
//  PAC-MAN multijoueur — moteur de jeu.
//  - Tous les personnages sont pilotés par des HUMAINS (pas d'IA) :
//    2 joueurs = Mr & Mrs Pac-Man, les autres = fantômes.
//  - Labyrinthe CLASSIQUE (28×31, 244 pastilles) + tunnel latéral (wrap).
//  - Chaque joueur a SES 3 vies (affichées en bas) ; à 0 → ÉLIMINÉ, mais la
//    partie continue. Score individuel → vainqueur désigné à la fin.
//  - Les fantômes ne peuvent PAS faire demi-tour (tout droit, gauche, droite).
// =====================================================================

const DIRS = {
  up:    { dr: -1, dc: 0 },
  down:  { dr: 1, dc: 0 },
  left:  { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

const GHOST_COLORS = ['#ff2e88', '#2effd5', '#ff9a3c', '#7a5cff', '#38ff9c', '#ff5bd0'];

// Labyrinthe classique Pac-Man : '#' mur, '.' gomme, 'o' super-gomme,
// '=' porte de la maison des fantômes (franchissable), ' ' couloir vide.
const CLASSIC_MAZE = [
  '############################',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#o####.#####.##.#####.####o#',
  '#.####.#####.##.#####.####.#',
  '#..........................#',
  '#.####.##.########.##.####.#',
  '#.####.##.########.##.####.#',
  '#......##....##....##......#',
  '######.##### ## #####.######',
  '######.##### ## #####.######',
  '######.##          ##.######',
  '######.## ###==### ##.######',
  '######.## #      # ##.######',
  '          #      #          ',
  '######.## #      # ##.######',
  '######.## ######## ##.######',
  '######.##          ##.######',
  '######.##### ## #####.######',
  '######.##### ## #####.######',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#.####.#####.##.#####.####.#',
  '#o..##................##..o#',
  '###.##.##.########.##.##.###',
  '###.##.##.########.##.##.###',
  '#......##....##....##......#',
  '#.##########.##.##########.#',
  '#.##########.##.##########.#',
  '#..........................#',
  '############################',
];

export class PacmanGame {
  constructor(players, opts = {}) {
    this.buildMaze();
    this.duration = (opts.seconds || 150) * 1000;
    this.tickMs = 220;             // un peu plus lent que l'original (party-friendly)
    this.tunnelRows = new Set([14]); // rangée du tunnel gauche↔droite

    // --- Rôles : 2 Pac-Man (Mr/Mrs), le reste en fantômes ---
    let mrId = opts.mrId, mrsId = opts.mrsId;
    if (!mrId || !mrsId) {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      mrId = mrId || (shuffled[0] && shuffled[0].id);
      mrsId = mrsId || (shuffled.find((p) => p.id !== mrId) || {}).id;
    }

    const pacStarts = { mr: { r: 23, c: 13 }, mrs: { r: 23, c: 14 } };
    // Maison des fantômes (intérieur) + au-dessus de la porte
    const ghostStartsPool = [
      { r: 14, c: 13 }, { r: 14, c: 14 }, { r: 14, c: 12 }, { r: 14, c: 15 },
      { r: 13, c: 13 }, { r: 13, c: 14 }, { r: 15, c: 13 }, { r: 15, c: 14 },
    ];

    let gi = 0;
    this.entities = players.map((p) => {
      let role = 'ghost', start;
      if (p.id === mrId) { role = 'mr'; start = pacStarts.mr; }
      else if (p.id === mrsId) { role = 'mrs'; start = pacStarts.mrs; }
      else { start = ghostStartsPool[gi % ghostStartsPool.length]; gi++; }
      return {
        id: p.id, name: p.name, role,
        r: start.r, c: start.c, start: { ...start },
        dir: null, nextDir: null, invUntil: 0, color: null, step: 0,
        lives: 3, score: 0, eliminated: false, // ← vies & score INDIVIDUELS
      };
    });
    let ci = 0;
    this.entities.forEach((e) => { if (e.role === 'ghost') e.color = GHOST_COLORS[ci++ % GHOST_COLORS.length]; });

    this.maxLives = 3;
    this.scorePac = 0;          // score cumulé de l'équipe Pac (gommes) pour le HUD
    this.frightenedUntil = 0;
    this.startTime = Date.now();
    this.status = 'playing';    // playing | pacwin | ghostwin | timeup
    this.tickCount = 0;
    this.events = [];           // effets transitoires (capture / fantôme mangé / élimination)
  }

  // --- Parse le labyrinthe classique en grilles mur / gomme / super-gomme ---
  buildMaze() {
    const M = CLASSIC_MAZE;
    this.H = M.length;
    this.W = M[0].length;
    this.wall = []; this.dot = []; this.power = [];
    for (let r = 0; r < this.H; r++) {
      const wr = [], dr = [], pr = [];
      for (let c = 0; c < this.W; c++) {
        const ch = M[r][c];
        wr.push(ch === '#');
        dr.push(ch === '.');
        pr.push(ch === 'o');
      }
      this.wall.push(wr); this.dot.push(dr); this.power.push(pr);
    }
    this.dotsLeft = this.dot.flat().filter(Boolean).length + this.power.flat().filter(Boolean).length;
  }

  wrapC(c) { return (c + this.W) % this.W; }
  isWall(r, c) {
    if (r < 0 || r >= this.H) return true;
    c = this.wrapC(c);
    return this.wall[r][c];
  }
  ent(id) { return this.entities.find((e) => e.id === id); }

  // Les fantômes ne peuvent PAS faire demi-tour (tout droit, gauche ou droite).
  setDir(id, dir) {
    const e = this.ent(id);
    if (!e || e.eliminated || !DIRS[dir]) return;
    if (e.role === 'ghost' && e.dir && OPPOSITE[dir] === e.dir) return; // demi-tour interdit
    e.nextDir = dir;
  }

  canMove(e, dir) {
    const d = DIRS[dir];
    return !this.isWall(e.r + d.dr, e.c + d.dc);
  }

  respawn(e) {
    e.r = e.start.r; e.c = e.start.c; e.dir = null; e.nextDir = null;
  }

  tick() {
    if (this.status !== 'playing') return;
    const now = Date.now();
    this.events = this.events.filter((ev) => now - ev.at < 900);
    if (now - this.startTime > this.duration) return this.end('timeup');
    const frightened = now < this.frightenedUntil;

    for (const e of this.entities) {
      if (e.eliminated) continue;
      if (e.role === 'ghost' && frightened) { e.step = (e.step + 1) % 2; if (e.step === 0) continue; }
      if (e.nextDir && this.canMove(e, e.nextDir)) e.dir = e.nextDir;
      if (e.dir && this.canMove(e, e.dir)) {
        const d = DIRS[e.dir];
        e.r += d.dr;
        e.c = this.wrapC(e.c + d.dc); // tunnel : on ressort de l'autre côté
      }
      if (e.role === 'mr' || e.role === 'mrs') this.eat(e);
    }

    this.collisions(now, frightened);
    if (this.status !== 'playing') return;
    if (this.dotsLeft <= 0) return this.end('pacwin');
    this.tickCount++;
  }

  eat(e) {
    if (this.dot[e.r][e.c]) { this.dot[e.r][e.c] = false; e.score += 10; this.scorePac += 10; this.dotsLeft--; }
    if (this.power[e.r][e.c]) {
      this.power[e.r][e.c] = false; e.score += 50; this.scorePac += 50; this.dotsLeft--;
      this.frightenedUntil = Date.now() + 7000;
    }
  }

  collisions(now, frightened) {
    const pacs = this.entities.filter((e) => (e.role === 'mr' || e.role === 'mrs') && !e.eliminated);
    const ghosts = this.entities.filter((e) => e.role === 'ghost' && !e.eliminated);
    for (const pac of pacs) {
      for (const g of ghosts) {
        if (g.eliminated || pac.eliminated) continue;
        if (g.r === pac.r && g.c === pac.c) {
          if (frightened) {
            // Pac mange le fantôme → le FANTÔME perd une vie, renvoyé à la maison
            this.events.push({ type: 'ghost_eaten', r: g.r, c: g.c, at: now });
            pac.score += 200; this.scorePac += 200;
            g.lives--;
            this.respawn(g);
            if (g.lives <= 0) { g.eliminated = true; this.events.push({ type: 'eliminated', r: g.r, c: g.c, at: now, name: g.name }); }
          } else if (now > pac.invUntil) {
            // Fantôme attrape un Pac → le PAC perd une vie
            this.events.push({ type: 'pac_caught', r: pac.r, c: pac.c, at: now });
            g.score += 100;
            pac.lives--;
            this.respawn(pac);
            pac.invUntil = now + 1800;
            if (pac.lives <= 0) { pac.eliminated = true; this.events.push({ type: 'eliminated', r: pac.r, c: pac.c, at: now, name: pac.name }); }
          }
        }
      }
    }
    // Fin si plus aucun Pac OU plus aucun fantôme en jeu
    const pacsLeft = this.entities.filter((e) => (e.role === 'mr' || e.role === 'mrs') && !e.eliminated).length;
    const ghostsLeft = this.entities.filter((e) => e.role === 'ghost' && !e.eliminated).length;
    if (pacsLeft === 0) return this.end('ghostwin');
    if (ghostsLeft === 0) return this.end('pacwin');
  }

  end(result) { if (this.status === 'playing') { this.status = result; this.endedAt = Date.now(); } }

  // Classement final par score individuel (vainqueur en tête)
  ranking() {
    return this.entities
      .map((e) => ({ id: e.id, name: e.name, role: e.role, score: e.score, lives: e.lives, eliminated: e.eliminated }))
      .sort((a, b) => b.score - a.score);
  }

  publicState(meId = null) {
    const grid = [];
    for (let r = 0; r < this.H; r++) {
      let row = '';
      for (let c = 0; c < this.W; c++) {
        if (this.wall[r][c]) row += '#';
        else if (this.power[r][c]) row += 'o';
        else if (this.dot[r][c]) row += '.';
        else row += ' ';
      }
      grid.push(row);
    }
    const now = Date.now();
    const frightened = now < this.frightenedUntil;
    const me = meId ? this.ent(meId) : null;
    const ended = this.status !== 'playing';
    return {
      w: this.W, h: this.H, grid,
      entities: this.entities.map((e) => ({
        id: e.id, name: e.name, role: e.role, r: e.r, c: e.c, dir: e.dir,
        color: e.color, inv: e.invUntil > now,
        lives: e.lives, score: e.score, eliminated: e.eliminated,
      })),
      events: this.events.map((ev) => ({ type: ev.type, r: ev.r, c: ev.c, at: ev.at, age: now - ev.at, name: ev.name || null })),
      frightened, frightenedMs: frightened ? this.frightenedUntil - now : 0,
      maxLives: this.maxLives,
      scorePac: this.scorePac,
      dotsLeft: this.dotsLeft,
      timeLeft: Math.max(0, Math.ceil((this.duration - (now - this.startTime)) / 1000)),
      status: this.status,
      ranking: ended ? this.ranking() : null,
      me: me ? { id: me.id, role: me.role, color: me.color, lives: me.lives, eliminated: me.eliminated } : null,
    };
  }
}
