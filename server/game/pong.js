// =====================================================================
//  PONG BATTLE multijoueur — moteur de jeu.
//  - Arène carrée, jusqu'à 4 joueurs, chacun défend un côté.
//  - Une balle rebondit ; si elle passe derrière ta raquette → tu perds un PV.
//  - Les côtés sans joueur (ou éliminé) deviennent des murs.
//  - Dernier avec des PV = vainqueur.
// =====================================================================

const SIZE = 100;        // arène carrée 100×100 (unités abstraites)
const MARGIN = 4;        // ligne où se trouve la raquette
const PAD = 22;          // longueur de la raquette
const BALLR = 1.8;
const PAD_STEP = 5;      // déplacement par impulsion

// ordre d'attribution des côtés : 2 joueurs = bas/haut (classique), puis g/d
const SIDES = ['bottom', 'top', 'left', 'right'];
const COLORS = { bottom: '#2effd5', top: '#ffe600', left: '#ff2e88', right: '#7a5cff' };

export class PongGame {
  constructor(players, opts = {}) {
    this.tickMs = 50;
    this.startTime = Date.now();
    this.duration = (opts.seconds || 180) * 1000;
    this.status = 'playing';
    this.elimCount = 0;
    this.players = players.slice(0, 4).map((p, i) => ({
      id: p.id, name: p.name, side: SIDES[i], pos: SIZE / 2,
      hp: 3, alive: true, color: COLORS[SIDES[i]], elimOrder: 0,
    }));
    this.startCount = this.players.length;
    this.resetBall();
  }

  bySide(side) { return this.players.find((p) => p.side === side && p.alive); }

  resetBall() {
    this.ball = { x: SIZE / 2, y: SIZE / 2 };
    const ang = Math.random() * Math.PI * 2;
    const sp = 2.0;
    this.ball.vx = Math.cos(ang) * sp;
    this.ball.vy = Math.sin(ang) * sp;
    // évite une trajectoire trop verticale/horizontale (balle "molle")
    if (Math.abs(this.ball.vx) < 0.6) this.ball.vx = (this.ball.vx < 0 ? -1 : 1) * 0.9;
    if (Math.abs(this.ball.vy) < 0.6) this.ball.vy = (this.ball.vy < 0 ? -1 : 1) * 0.9;
  }

  move(id, dir) {
    if (this.status !== 'playing') return;
    const p = this.players.find((x) => x.id === id);
    if (!p || !p.alive) return;
    const step = dir === 'minus' ? -PAD_STEP : dir === 'plus' ? PAD_STEP : 0;
    p.pos = Math.max(PAD / 2, Math.min(SIZE - PAD / 2, p.pos + step));
  }

  // gère le bord (côté) : rebond mur, raquette, ou but encaissé
  edge(side, ballPos, setVel) {
    const pl = this.bySide(side);
    if (!pl) { setVel(); return; } // pas de joueur vivant → mur
    if (Math.abs(ballPos - pl.pos) <= PAD / 2 + BALLR) {
      setVel(); // touché par la raquette → rebond
      // effet selon l'endroit touché
      return;
    }
    // but encaissé
    pl.hp -= 1;
    if (pl.hp <= 0) { pl.alive = false; pl.elimOrder = ++this.elimCount; }
    this.resetBall();
  }

  tick() {
    if (this.status !== 'playing') return;
    if (Date.now() - this.startTime > this.duration) return this.end();
    const b = this.ball;
    b.x += b.vx; b.y += b.vy;
    // léger gain de vitesse au fil du temps
    if (b.y - BALLR <= MARGIN && b.vy < 0) this.edge('top', b.x, () => { b.vy = Math.abs(b.vy); b.y = MARGIN + BALLR; });
    if (b.y + BALLR >= SIZE - MARGIN && b.vy > 0) this.edge('bottom', b.x, () => { b.vy = -Math.abs(b.vy); b.y = SIZE - MARGIN - BALLR; });
    if (b.x - BALLR <= MARGIN && b.vx < 0) this.edge('left', b.y, () => { b.vx = Math.abs(b.vx); b.x = MARGIN + BALLR; });
    if (b.x + BALLR >= SIZE - MARGIN && b.vx > 0) this.edge('right', b.y, () => { b.vx = -Math.abs(b.vx); b.x = SIZE - MARGIN - BALLR; });

    const alive = this.players.filter((p) => p.alive);
    if ((this.startCount > 1 && alive.length <= 1) || alive.length === 0) this.end();
  }

  end() { if (this.status === 'playing') { this.status = 'done'; this.endedAt = Date.now(); } }

  ranking() {
    return this.players.slice().sort((a, b) =>
      (b.alive ? 1 : 0) - (a.alive ? 1 : 0) || b.hp - a.hp || b.elimOrder - a.elimOrder
    ).map((p) => ({ id: p.id, name: p.name, hp: p.hp, alive: p.alive }));
  }

  publicState() {
    return {
      type: 'pong', status: this.status, size: SIZE, margin: MARGIN, pad: PAD, ballr: BALLR,
      ball: { x: this.ball.x, y: this.ball.y },
      players: this.players.map((p) => ({ id: p.id, name: p.name, side: p.side, pos: p.pos, hp: p.hp, alive: p.alive, color: p.color })),
      ranking: this.status !== 'playing' ? this.ranking() : null,
    };
  }
}
