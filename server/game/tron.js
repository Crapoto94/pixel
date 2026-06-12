// =====================================================================
//  TRON / SNAKE multijoueur — moteur de jeu.
//  - Chaque joueur pilote une moto-lumière qui laisse une traînée.
//  - On meurt si on percute un mur, sa propre traînée ou celle d'un autre.
//  - Demi-tour interdit. Dernier en vie = vainqueur.
//  - Calqué sur la structure Pac-Man (grille + direction + tick serveur).
// =====================================================================

const DIRS = { up: { dr: -1, dc: 0 }, down: { dr: 1, dc: 0 }, left: { dr: 0, dc: -1 }, right: { dr: 0, dc: 1 } };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
const COLORS = ['#2effd5', '#ffe600', '#ff2e88', '#7a5cff', '#38ff9c', '#ff9a3c', '#3a7bff', '#ff5bd0'];

export class TronGame {
  constructor(players, opts = {}) {
    this.W = opts.w || 48;
    this.H = opts.h || 32;
    this.tickMs = 130;
    this.startTime = Date.now();
    this.status = 'playing'; // playing | done
    this.elimCount = 0;
    this.grid = Array.from({ length: this.H }, () => Array(this.W).fill(0)); // 0 = vide, sinon idx joueur (1..8)
    const cx = Math.floor(this.W / 2), cy = Math.floor(this.H / 2);
    const spots = [
      { r: cy, c: 4, dir: 'right' }, { r: cy, c: this.W - 5, dir: 'left' },
      { r: 4, c: cx, dir: 'down' }, { r: this.H - 5, c: cx, dir: 'up' },
      { r: 4, c: 4, dir: 'right' }, { r: this.H - 5, c: this.W - 5, dir: 'left' },
      { r: 4, c: this.W - 5, dir: 'down' }, { r: this.H - 5, c: 4, dir: 'up' },
    ];
    this.players = players.map((p, i) => {
      const s = spots[i % spots.length];
      return { id: p.id, name: p.name, r: s.r, c: s.c, dir: s.dir, nextDir: s.dir,
        color: COLORS[i % COLORS.length], idx: i + 1, alive: true, len: 0, elimOrder: 0 };
    });
    this.players.forEach((p) => { this.grid[p.r][p.c] = p.idx; });
    this.startCount = this.players.length;
  }

  setDir(id, dir) {
    const p = this.players.find((x) => x.id === id);
    if (!p || !p.alive || !DIRS[dir]) return;
    if (OPP[dir] === p.dir) return; // demi-tour interdit
    p.nextDir = dir;
  }

  tick() {
    if (this.status !== 'playing') return;
    const moves = [];
    for (const p of this.players) {
      if (!p.alive) continue;
      p.dir = p.nextDir;
      const d = DIRS[p.dir];
      moves.push({ p, nr: p.r + d.dr, nc: p.c + d.dc });
    }
    // collisions tête-à-tête (deux motos vers la même case)
    const dest = {};
    for (const m of moves) { const k = m.nr + ',' + m.nc; (dest[k] = dest[k] || []).push(m); }
    for (const m of moves) {
      const { p, nr, nc } = m;
      let dead = false;
      if (nr < 0 || nr >= this.H || nc < 0 || nc >= this.W) dead = true;
      else if (this.grid[nr][nc]) dead = true;
      else if (dest[nr + ',' + nc].length > 1) dead = true;
      if (dead) { p.alive = false; p.elimOrder = ++this.elimCount; }
    }
    for (const m of moves) {
      const { p, nr, nc } = m;
      if (!p.alive) continue;
      p.r = nr; p.c = nc; this.grid[nr][nc] = p.idx; p.len++;
    }
    const alive = this.players.filter((p) => p.alive);
    if ((this.startCount > 1 && alive.length <= 1) || alive.length === 0) this.end();
  }

  end() { if (this.status === 'playing') { this.status = 'done'; this.endedAt = Date.now(); } }

  ranking() {
    return this.players.slice().sort((a, b) =>
      (b.alive ? 1 : 0) - (a.alive ? 1 : 0) || b.len - a.len || b.elimOrder - a.elimOrder
    ).map((p) => ({ id: p.id, name: p.name, len: p.len, alive: p.alive }));
  }

  publicState() {
    return {
      type: 'tron', status: this.status, w: this.W, h: this.H,
      grid: this.grid.map((row) => row.join('')),
      players: this.players.map((p) => ({ id: p.id, name: p.name, color: p.color, idx: p.idx, r: p.r, c: p.c, alive: p.alive, len: p.len })),
      ranking: this.status !== 'playing' ? this.ranking() : null,
    };
  }
}
