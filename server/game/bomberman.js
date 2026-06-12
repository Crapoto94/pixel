// =====================================================================
//  BOMBERMAN multijoueur — moteur de jeu.
//  - Grille classique (murs indestructibles + blocs cassables).
//  - Chacun pose des bombes qui explosent en croix ; on meurt dans le souffle.
//  - Dernier en vie = vainqueur. Jusqu'à 8 joueurs (coins + milieux).
// =====================================================================

const DIRS = { up: { dr: -1, dc: 0 }, down: { dr: 1, dc: 0 }, left: { dr: 0, dc: -1 }, right: { dr: 0, dc: 1 } };
const COLORS = ['#2effd5', '#ffe600', '#ff2e88', '#7a5cff', '#38ff9c', '#ff9a3c', '#3a7bff', '#ff5bd0'];

export class BombermanGame {
  constructor(players, opts = {}) {
    this.W = 15; this.H = 13;
    this.tickMs = 130;
    this.fuse = 20;        // ticks avant explosion (~2,6 s)
    this.blastMs = 480;    // durée d'un souffle (mortel)
    this.range = 2;        // portée des bombes
    this.startTime = Date.now();
    this.duration = (opts.seconds || 180) * 1000;
    this.status = 'playing';
    this.elimCount = 0;
    this.buildGrid();
    const cx = Math.floor(this.W / 2), cy = Math.floor(this.H / 2);
    const spawns = [
      { r: 1, c: 1 }, { r: 1, c: this.W - 2 }, { r: this.H - 2, c: 1 }, { r: this.H - 2, c: this.W - 2 },
      { r: 1, c: cx }, { r: this.H - 2, c: cx }, { r: cy, c: 1 }, { r: cy, c: this.W - 2 },
    ];
    this.players = players.slice(0, 8).map((p, i) => {
      const s = spawns[i % spawns.length];
      this.clearSpawn(s.r, s.c);
      return { id: p.id, name: p.name, r: s.r, c: s.c, color: COLORS[i % COLORS.length], alive: true, maxBombs: 1, range: this.range, elimOrder: 0 };
    });
    this.bombs = [];
    this.blasts = [];
    this.startCount = this.players.length;
  }

  buildGrid() {
    this.grid = Array.from({ length: this.H }, () => Array(this.W).fill(' '));
    for (let r = 0; r < this.H; r++) for (let c = 0; c < this.W; c++) {
      if (r === 0 || c === 0 || r === this.H - 1 || c === this.W - 1) this.grid[r][c] = 'W';
      else if (r % 2 === 0 && c % 2 === 0) this.grid[r][c] = 'W';
      else if (Math.random() < 0.72) this.grid[r][c] = 'B';
    }
  }

  clearSpawn(r, c) {
    for (const [rr, cc] of [[r, c], [r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (rr > 0 && rr < this.H - 1 && cc > 0 && cc < this.W - 1 && this.grid[rr][cc] === 'B') this.grid[rr][cc] = ' ';
    }
  }

  player(id) { return this.players.find((p) => p.id === id); }

  move(id, dir) {
    if (this.status !== 'playing') return;
    const p = this.player(id);
    if (!p || !p.alive || !DIRS[dir]) return;
    const d = DIRS[dir];
    const nr = p.r + d.dr, nc = p.c + d.dc;
    if (nr < 0 || nr >= this.H || nc < 0 || nc >= this.W) return;
    if (this.grid[nr][nc] !== ' ') return;        // mur ou bloc bloque (bombes traversables)
    p.r = nr; p.c = nc;
    const now = Date.now();
    if (this.blasts.some((b) => b.r === nr && b.c === nc && b.until > now)) this.kill(p);
  }

  placeBomb(id) {
    if (this.status !== 'playing') return;
    const p = this.player(id);
    if (!p || !p.alive) return;
    if (this.bombs.filter((b) => b.owner === p.id).length >= p.maxBombs) return;
    if (this.bombs.some((b) => b.r === p.r && b.c === p.c)) return;
    this.bombs.push({ r: p.r, c: p.c, owner: p.id, fuse: this.fuse, range: p.range });
  }

  kill(p) { if (p.alive) { p.alive = false; p.elimOrder = ++this.elimCount; } }

  detonate(initial, now) {
    const queue = [...initial];
    const done = new Set();
    const cells = new Set();
    while (queue.length) {
      const b = queue.pop();
      if (done.has(b)) continue;
      done.add(b);
      this.bombs = this.bombs.filter((x) => x !== b);
      cells.add(b.r + ',' + b.c);
      for (const d of Object.values(DIRS)) {
        for (let i = 1; i <= b.range; i++) {
          const rr = b.r + d.dr * i, cc = b.c + d.dc * i;
          if (rr < 0 || rr >= this.H || cc < 0 || cc >= this.W) break;
          const cell = this.grid[rr][cc];
          if (cell === 'W') break;
          cells.add(rr + ',' + cc);
          if (cell === 'B') { this.grid[rr][cc] = ' '; break; } // détruit le bloc et stoppe
          const hit = this.bombs.find((x) => x.r === rr && x.c === cc);
          if (hit && !done.has(hit)) queue.push(hit); // réaction en chaîne
        }
      }
    }
    for (const key of cells) { const [r, c] = key.split(',').map(Number); this.blasts.push({ r, c, until: now + this.blastMs }); }
    for (const p of this.players) { if (p.alive && cells.has(p.r + ',' + p.c)) this.kill(p); }
  }

  tick() {
    if (this.status !== 'playing') return;
    const now = Date.now();
    if (now - this.startTime > this.duration) return this.end();
    this.blasts = this.blasts.filter((b) => b.until > now);
    const explode = [];
    for (const b of this.bombs) { b.fuse--; if (b.fuse <= 0) explode.push(b); }
    if (explode.length) this.detonate(explode, now);
    const alive = this.players.filter((p) => p.alive);
    if ((this.startCount > 1 && alive.length <= 1) || alive.length === 0) this.end();
  }

  end() { if (this.status === 'playing') { this.status = 'done'; this.endedAt = Date.now(); } }

  ranking() {
    return this.players.slice().sort((a, b) =>
      (b.alive ? 1 : 0) - (a.alive ? 1 : 0) || b.elimOrder - a.elimOrder
    ).map((p) => ({ id: p.id, name: p.name, alive: p.alive }));
  }

  publicState() {
    return {
      type: 'bomberman', status: this.status, w: this.W, h: this.H,
      grid: this.grid.map((row) => row.join('')),
      bombs: this.bombs.map((b) => ({ r: b.r, c: b.c })),
      blasts: this.blasts.map((b) => ({ r: b.r, c: b.c })),
      players: this.players.map((p) => ({ id: p.id, name: p.name, r: p.r, c: p.c, color: p.color, alive: p.alive })),
      ranking: this.status !== 'playing' ? this.ranking() : null,
    };
  }
}
