// =====================================================================
//  2048 multijoueur — moteur de jeu.
//  - Chaque joueur a sa propre grille 4×4 et glisse (haut/bas/gauche/droite).
//  - Score = somme des fusions. Éliminé quand plus aucun coup possible.
//  - La BORNE montre les 2 meilleurs (score). Vainqueur = meilleur score.
//  - Même esprit "chacun sa grille + top-2 sur la borne" que Tetris.
// =====================================================================

const N = 4;

function emptyBoard() { return Array.from({ length: N }, () => Array(N).fill(0)); }

export class Game2048 {
  constructor(players, opts = {}) {
    this.duration = (opts.seconds || 180) * 1000;
    this.tickMs = 1000; // sert juste au chrono + diffusion
    this.startTime = Date.now();
    this.status = 'playing';
    this.elimCount = 0;
    this.players = players.map((p) => {
      const pl = { id: p.id, name: p.name, board: emptyBoard(), score: 0, best: 0, eliminated: false, elimOrder: 0 };
      this.addTile(pl); this.addTile(pl);
      return pl;
    });
    this.startCount = this.players.length;
  }

  addTile(pl) {
    const empties = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!pl.board[r][c]) empties.push([r, c]);
    if (!empties.length) return false;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    pl.board[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  // glisse une ligne vers la gauche : renvoie [nouvelleLigne, gain, bouge?]
  slideRow(row) {
    const vals = row.filter((x) => x);
    const out = []; let gain = 0;
    for (let i = 0; i < vals.length; i++) {
      if (i + 1 < vals.length && vals[i] === vals[i + 1]) { out.push(vals[i] * 2); gain += vals[i] * 2; i++; }
      else out.push(vals[i]);
    }
    while (out.length < N) out.push(0);
    const moved = out.some((v, i) => v !== row[i]);
    return [out, gain, moved];
  }

  move(id, dir) {
    if (this.status !== 'playing') return;
    const pl = this.players.find((p) => p.id === id);
    if (!pl || pl.eliminated) return;
    let b = pl.board, moved = false, gained = 0;
    const rotate = (m) => m[0].map((_, c) => m.map((row) => row[c]).reverse()); // 90° horaire
    let times = { left: 0, up: 3, right: 2, down: 1 }[dir];
    if (times == null) return;
    for (let k = 0; k < times; k++) b = rotate(b);
    const nb = [];
    for (const row of b) { const [nr, g, mv] = this.slideRow(row); nb.push(nr); gained += g; if (mv) moved = true; }
    let res = nb;
    for (let k = 0; k < (4 - times) % 4; k++) res = rotate(res);
    if (moved) {
      pl.board = res; pl.score += gained;
      pl.best = Math.max(pl.best, ...res.flat());
      this.addTile(pl);
      if (this.isStuck(pl)) { pl.eliminated = true; pl.elimOrder = ++this.elimCount; }
    }
  }

  isStuck(pl) {
    const b = pl.board;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (!b[r][c]) return false;
      if (c + 1 < N && b[r][c] === b[r][c + 1]) return false;
      if (r + 1 < N && b[r][c] === b[r + 1][c]) return false;
    }
    return true;
  }

  tick() {
    if (this.status !== 'playing') return;
    if (Date.now() - this.startTime > this.duration) return this.end();
    const alive = this.players.filter((p) => !p.eliminated);
    if ((this.startCount > 1 && alive.length <= 1) || alive.length === 0) this.end();
  }

  end() { if (this.status === 'playing') { this.status = 'done'; this.endedAt = Date.now(); } }

  ranking() {
    return this.players.slice().sort((a, b) =>
      (b.eliminated ? 0 : 1) - (a.eliminated ? 0 : 1) || b.score - a.score || b.best - a.best
    ).map((p) => ({ id: p.id, name: p.name, score: p.score, best: p.best, eliminated: p.eliminated }));
  }

  publicState() {
    return {
      type: '2048', status: this.status,
      timeLeft: Math.max(0, Math.ceil((this.duration - (Date.now() - this.startTime)) / 1000)),
      players: this.players.map((p) => ({
        id: p.id, name: p.name, board: p.board, score: p.score, best: p.best, eliminated: p.eliminated,
      })),
      ranking: this.status !== 'playing' ? this.ranking() : null,
    };
  }
}
