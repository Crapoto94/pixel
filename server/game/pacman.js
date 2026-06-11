// =====================================================================
//  PAC-MAN multijoueur — moteur de jeu.
//  - Tous les personnages sont pilotés par des HUMAINS (pas d'IA) :
//    2 joueurs = Mr & Mrs Pac-Man, les autres = fantômes.
//  - Labyrinthe à blocs + chambre centrale + TUNNELS latéraux (wrap).
//  - Vies d'ÉQUIPE partagées (KO à 3 captures). Effets quand on est mangé.
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
    this.tunnelRows = new Set([9]); // rangée(s) avec tunnel gauche↔droite
    this.buildMaze();

    // --- Rôles : 2 Pac-Man (Mr/Mrs), le reste en fantômes ---
    let mrId = opts.mrId, mrsId = opts.mrsId;
    if (!mrId || !mrsId) {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      mrId = mrId || (shuffled[0] && shuffled[0].id);
      mrsId = mrsId || (shuffled.find((p) => p.id !== mrId) || {}).id;
    }

    const pacStarts = { mr: { r: 1, c: 9 }, mrs: { r: this.H - 2, c: 9 } };
    const ghostStartsPool = [
      { r: 9, c: 9 }, { r: 9, c: 7 }, { r: 9, c: 11 }, { r: 9, c: 5 },
      { r: 9, c: 13 }, { r: 7, c: 9 }, { r: 11, c: 9 }, { r: 5, c: 9 },
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
      };
    });
    let ci = 0;
    this.entities.forEach((e) => { if (e.role === 'ghost') e.color = GHOST_COLORS[ci++ % GHOST_COLORS.length]; });

    this.teamLives = 3;        // ❤ partagées par l'équipe Pac (KO à 0)
    this.scorePac = 0;
    this.frightenedUntil = 0;
    this.startTime = Date.now();
    this.status = 'playing';   // playing | pacwin | ghostwin
    this.tickCount = 0;
    this.events = [];          // effets visuels transitoires (capture / fantôme mangé)
  }

  // --- Labyrinthe : blocs 3×3 séparés par des couloirs (look "Pac-Man") ---
  buildMaze() {
    const { W, H } = this;
    this.wall = Array.from({ length: H }, () => Array(W).fill(false));
    this.dot = Array.from({ length: H }, () => Array(W).fill(false));
    this.power = Array.from({ length: H }, () => Array(W).fill(false));
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const border = r === 0 || c === 0 || r === H - 1 || c === W - 1;
        const corridor = (r % 4 === 1) || (c % 4 === 1);
        const isW = border || !corridor;
        this.wall[r][c] = isW;
        if (!isW) this.dot[r][c] = true;
      }
    }
    // TUNNELS : on ouvre les bords sur les rangées-tunnel (wrap gauche↔droite)
    for (const r of this.tunnelRows) {
      this.wall[r][0] = false; this.wall[r][W - 1] = false;
      this.dot[r][0] = false; this.dot[r][W - 1] = false;
    }
    // Chambre centrale + départs : on enlève les gommes
    const clears = [[9, 9], [9, 7], [9, 11], [9, 5], [9, 13], [7, 9], [11, 9], [1, 9], [H - 2, 9]];
    for (const [r, c] of clears) { if (!this.wall[r][c]) this.dot[r][c] = false; }
    // Super-gommes dans les 4 coins
    const corners = [[1, 1], [1, W - 2], [H - 2, 1], [H - 2, W - 2]];
    for (const [r, c] of corners) { if (!this.wall[r][c]) { this.power[r][c] = true; this.dot[r][c] = false; } }
    this.dotsLeft = this.dot.flat().filter(Boolean).length + this.power.flat().filter(Boolean).length;
  }

  wrapC(c) { return (c + this.W) % this.W; }
  isWall(r, c) {
    if (r < 0 || r >= this.H) return true;
    c = this.wrapC(c);
    return this.wall[r][c];
  }
  ent(id) { return this.entities.find((e) => e.id === id); }
  setDir(id, dir) { const e = this.ent(id); if (e && DIRS[dir]) e.nextDir = dir; }

  canMove(e, dir) {
    const d = DIRS[dir];
    return !this.isWall(e.r + d.dr, e.c + d.dc);
  }

  tick() {
    if (this.status !== 'playing') return;
    const now = Date.now();
    this.events = this.events.filter((ev) => now - ev.at < 600);
    if (now - this.startTime > this.duration) return this.end(this.dotsLeft > 0 ? 'ghostwin' : 'pacwin');
    const frightened = now < this.frightenedUntil;

    for (const e of this.entities) {
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
    if (this.dotsLeft <= 0) return this.end('pacwin');
    this.tickCount++;
  }

  eat(e) {
    if (this.dot[e.r][e.c]) { this.dot[e.r][e.c] = false; this.scorePac += 10; this.dotsLeft--; }
    if (this.power[e.r][e.c]) {
      this.power[e.r][e.c] = false; this.scorePac += 50; this.dotsLeft--;
      this.frightenedUntil = Date.now() + 7000;
    }
  }

  collisions(now, frightened) {
    const pacs = this.entities.filter((e) => e.role === 'mr' || e.role === 'mrs');
    const ghosts = this.entities.filter((e) => e.role === 'ghost');
    for (const pac of pacs) {
      for (const g of ghosts) {
        if (g.r === pac.r && g.c === pac.c) {
          if (frightened) {
            // Pac mange le fantôme → renvoyé au centre (effet "fantôme mangé")
            this.events.push({ type: 'ghost_eaten', r: g.r, c: g.c, at: now });
            g.r = g.start.r; g.c = g.start.c; g.dir = null; g.nextDir = null;
            this.scorePac += 200;
          } else if (now > pac.invUntil) {
            // Fantôme attrape un Pac → -1 vie d'ÉQUIPE (effet "capture")
            this.events.push({ type: 'pac_caught', r: pac.r, c: pac.c, at: now });
            this.teamLives--;
            pac.r = pac.start.r; pac.c = pac.start.c; pac.dir = null; pac.nextDir = null;
            pac.invUntil = now + 1800;
            if (this.teamLives <= 0) return this.end('ghostwin');
          }
        }
      }
    }
  }

  end(result) { this.status = result; this.endedAt = Date.now(); }

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
    return {
      w: this.W, h: this.H, grid,
      entities: this.entities.map((e) => ({
        id: e.id, name: e.name, role: e.role, r: e.r, c: e.c, dir: e.dir,
        color: e.color, inv: e.invUntil > now,
      })),
      events: this.events.map((ev) => ({ type: ev.type, r: ev.r, c: ev.c, at: ev.at, age: now - ev.at })),
      frightened, frightenedMs: frightened ? this.frightenedUntil - now : 0,
      teamLives: this.teamLives,
      scorePac: this.scorePac,
      dotsLeft: this.dotsLeft,
      timeLeft: Math.max(0, Math.ceil((this.duration - (now - this.startTime)) / 1000)),
      status: this.status,
      me: me ? { id: me.id, role: me.role, color: me.color } : null,
    };
  }
}
