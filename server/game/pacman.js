// =====================================================================
//  PAC-MAN multijoueur — moteur de jeu.
//  - Tous les personnages sont pilotés par des HUMAINS (pas d'IA) :
//    2 joueurs = Mr & Mrs Pac-Man, les autres = fantômes.
//  - Labyrinthe généré (grille de piliers) : toujours valide & connexe.
//  - Boucle de tick côté serveur ; la borne et les téléphones affichent.
// =====================================================================

const DIRS = {
  up:    { dr: -1, dc: 0 },
  down:  { dr: 1, dc: 0 },
  left:  { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

const GHOST_COLORS = ['#ff2e88', '#2effd5', '#ff9a3c', '#7a5cff', '#38ff9c', '#ff5bd0'];

export class PacmanGame {
  constructor(players, opts = {}) {
    this.W = 19;
    this.H = 21;
    this.duration = (opts.seconds || 120) * 1000;
    this.tickMs = 150;
    this.buildMaze();

    // --- Rôles : 2 Pac-Man (Mr/Mrs), le reste en fantômes ---
    const ids = players.map((p) => p.id);
    let mrId = opts.mrId, mrsId = opts.mrsId;
    if (!mrId || !mrsId) {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      mrId = mrId || (shuffled[0] && shuffled[0].id);
      mrsId = mrsId || (shuffled.find((p) => p.id !== mrId) || {}).id;
    }

    const pacStarts = [{ r: 1, c: 9 }, { r: this.H - 2, c: 9 }];
    const ghostStartsPool = [
      { r: 9, c: 9 }, { r: 11, c: 9 }, { r: 9, c: 7 }, { r: 11, c: 11 },
      { r: 9, c: 11 }, { r: 11, c: 7 }, { r: 7, c: 9 }, { r: 13, c: 9 },
    ];

    let gi = 0;
    this.entities = players.map((p) => {
      let role = 'ghost';
      let start;
      if (p.id === mrId) { role = 'mr'; start = pacStarts[0]; }
      else if (p.id === mrsId) { role = 'mrs'; start = pacStarts[1]; }
      else { start = ghostStartsPool[gi % ghostStartsPool.length]; gi++; }
      return {
        id: p.id, name: p.name, role,
        r: start.r, c: start.c, start: { ...start },
        dir: null, nextDir: null,
        lives: role === 'ghost' ? null : 3,
        invUntil: 0, color: null, step: 0,
      };
    });
    // couleurs des fantômes
    let ci = 0;
    this.entities.forEach((e) => { if (e.role === 'ghost') e.color = GHOST_COLORS[ci++ % GHOST_COLORS.length]; });

    this.scorePac = 0;
    this.frightenedUntil = 0;
    this.startTime = Date.now();
    this.status = 'playing'; // playing | pacwin | ghostwin
    this.tickCount = 0;
  }

  // --- Génération du labyrinthe (bordure + piliers sur cases paires) ---
  buildMaze() {
    const { W, H } = this;
    this.wall = Array.from({ length: H }, () => Array(W).fill(false));
    this.dot = Array.from({ length: H }, () => Array(W).fill(false));
    this.power = Array.from({ length: H }, () => Array(W).fill(false));
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const border = r === 0 || c === 0 || r === H - 1 || c === W - 1;
        const pillar = r % 2 === 0 && c % 2 === 0;
        if (border || pillar) { this.wall[r][c] = true; }
        else { this.dot[r][c] = true; }
      }
    }
    // super-gommes dans les 4 coins
    const corners = [[1, 1], [1, W - 2], [H - 2, 1], [H - 2, W - 2]];
    for (const [r, c] of corners) { this.power[r][c] = true; this.dot[r][c] = false; }
    // on retire les pac-gommes des cases de départ (centre + haut/bas centre)
    const clears = [[1, 9], [H - 2, 9], [9, 9], [11, 9], [10, 9]];
    for (const [r, c] of clears) { this.dot[r][c] = false; }
    this.dotsLeft = this.dot.flat().filter(Boolean).length
      + this.power.flat().filter(Boolean).length;
  }

  isWall(r, c) {
    if (r < 0 || c < 0 || r >= this.H || c >= this.W) return true;
    return this.wall[r][c];
  }

  ent(id) { return this.entities.find((e) => e.id === id); }

  setDir(id, dir) {
    const e = this.ent(id);
    if (e && DIRS[dir]) e.nextDir = dir;
  }

  // --- Un pas de simulation ---
  tick() {
    if (this.status !== 'playing') return;
    const now = Date.now();
    if (now - this.startTime > this.duration) { return this.end(this.dotsLeft > 0 ? 'ghostwin' : 'pacwin'); }
    const frightened = now < this.frightenedUntil;

    for (const e of this.entities) {
      // fantômes effrayés : 1 case sur 2 (plus lents)
      if (e.role === 'ghost' && frightened) { e.step = (e.step + 1) % 2; if (e.step === 0) continue; }
      // tourner si possible
      if (e.nextDir && this.canMove(e, e.nextDir)) e.dir = e.nextDir;
      // avancer
      if (e.dir && this.canMove(e, e.dir)) {
        const d = DIRS[e.dir];
        e.r += d.dr; e.c += d.dc;
      }
      // Pac mange
      if (e.role === 'mr' || e.role === 'mrs') this.eat(e);
    }

    this.collisions(now, frightened);
    if (this.dotsLeft <= 0) return this.end('pacwin');
    this.tickCount++;
  }

  canMove(e, dir) {
    const d = DIRS[dir];
    return !this.isWall(e.r + d.dr, e.c + d.dc);
  }

  eat(e) {
    if (this.dot[e.r][e.c]) { this.dot[e.r][e.c] = false; this.scorePac += 10; this.dotsLeft--; }
    if (this.power[e.r][e.c]) {
      this.power[e.r][e.c] = false; this.scorePac += 50; this.dotsLeft--;
      this.frightenedUntil = Date.now() + 7000; // 7 s de mode effrayé
    }
  }

  collisions(now, frightened) {
    const pacs = this.entities.filter((e) => e.role === 'mr' || e.role === 'mrs');
    const ghosts = this.entities.filter((e) => e.role === 'ghost');
    for (const pac of pacs) {
      for (const g of ghosts) {
        if (g.r === pac.r && g.c === pac.c) {
          if (frightened) {
            // Pac mange le fantôme → renvoyé au centre
            g.r = g.start.r; g.c = g.start.c; g.dir = null; g.nextDir = null;
            this.scorePac += 200;
          } else if (now > pac.invUntil) {
            // Fantôme attrape Pac
            pac.lives--;
            pac.r = pac.start.r; pac.c = pac.start.c; pac.dir = null; pac.nextDir = null;
            pac.invUntil = now + 1800;
            if (pacs.every((p) => p.lives <= 0)) { return this.end('ghostwin'); }
          }
        }
      }
    }
  }

  end(result) { this.status = result; this.endedAt = Date.now(); }

  // --- Vue envoyée aux clients (borne + téléphones) ---
  publicState(meId = null) {
    // grille compacte : '#' mur · '.' gomme · 'o' super-gomme · ' ' vide
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
    return {
      w: this.W, h: this.H, grid,
      entities: this.entities.map((e) => ({
        id: e.id, name: e.name, role: e.role, r: e.r, c: e.c, dir: e.dir,
        lives: e.lives, color: e.color,
        inv: e.invUntil > now,
      })),
      frightened,
      frightenedMs: frightened ? this.frightenedUntil - now : 0,
      scorePac: this.scorePac,
      dotsLeft: this.dotsLeft,
      timeLeft: Math.max(0, Math.ceil((this.duration - (now - this.startTime)) / 1000)),
      status: this.status,
      me: me ? { id: me.id, role: me.role, lives: me.lives, color: me.color } : null,
    };
  }
}
