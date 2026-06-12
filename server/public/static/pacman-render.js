// =====================================================================
//  Rendu Pac-Man sur <canvas> — partagé par la BORNE et les téléphones.
//  drawPacman(canvas, pm, meId)  où pm = STATE.pacman.
// =====================================================================
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

window.drawPacman = function (canvas, pm, meId, opts) {
  opts = opts || {};
  const ctx = canvas.getContext('2d');
  const W = pm.w, H = pm.h;
  const cell = Math.floor(Math.min(canvas.width / W, canvas.height / H));
  const ox = Math.floor((canvas.width - cell * W) / 2);
  const oy = Math.floor((canvas.height - cell * H) / 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#05010f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- labyrinthe : MURS en traits fins bleus (style arcade classique) ---
  const isW = (r, c) => r >= 0 && r < H && c >= 0 && c < W && pm.grid[r][c] === '#';
  ctx.strokeStyle = '#2a4bff';
  ctx.lineWidth = Math.max(2, cell * 0.15);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#2a4bff';
  ctx.shadowBlur = Math.max(3, cell * 0.18);
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (!isW(r, c)) continue;
      const cx = ox + c * cell + cell / 2, cy = oy + r * cell + cell / 2;
      const up = isW(r - 1, c), down = isW(r + 1, c), left = isW(r, c - 1), right = isW(r, c + 1);
      if (up)    { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - cell / 2 - 0.5); ctx.stroke(); }
      if (down)  { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + cell / 2 + 0.5); ctx.stroke(); }
      if (left)  { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - cell / 2 - 0.5, cy); ctx.stroke(); }
      if (right) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + cell / 2 + 0.5, cy); ctx.stroke(); }
      if (!up && !down && !left && !right) { // mur isolé : petit point
        ctx.fillStyle = '#2a4bff'; ctx.beginPath(); ctx.arc(cx, cy, ctx.lineWidth / 2, 0, 7); ctx.fill();
      }
    }
  }
  ctx.shadowBlur = 0;
  // --- gommes & super-gommes ---
  for (let r = 0; r < H; r++) {
    const row = pm.grid[r];
    for (let c = 0; c < W; c++) {
      const ch = row[c];
      const x = ox + c * cell, y = oy + r * cell;
      if (ch === '.') {
        ctx.fillStyle = '#ffd6a0';
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, Math.max(1.5, cell * 0.08), 0, 7);
        ctx.fill();
      } else if (ch === 'o') {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
        ctx.fillStyle = '#ffe600';
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, cell * (0.22 + 0.05 * pulse), 0, 7);
        ctx.fill();
      }
    }
  }

  // --- personnages ---
  for (const e of pm.entities) {
    if (e.eliminated) continue; // joueur éliminé : retiré du plateau
    const cx = ox + e.c * cell + cell / 2;
    const cy = oy + e.r * cell + cell / 2;
    const rad = cell * 0.42;
    if (e.role === 'mr' || e.role === 'mrs') {
      drawPac(ctx, cx, cy, rad, e, pm);
    } else {
      drawGhost(ctx, cx, cy, rad, e, pm.frightened);
    }
    if (meId && e.id === meId) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, rad + 4, 0, 7);
      ctx.stroke();
    }
    // pastille avec le prénom du joueur (sur la borne)
    if (opts.names && e.name) {
      ctx.shadowBlur = 0;
      const fs = Math.max(9, Math.floor(cell * 0.4));
      ctx.font = `bold ${fs}px Arial`;
      const tw = ctx.measureText(e.name).width;
      const padX = 5, ph = fs + 6, pw = tw + padX * 2;
      let px = cx - pw / 2;
      let py = cy - rad - ph - 2;
      if (py < 2) py = cy + rad + 2;                       // sinon en dessous
      px = Math.max(2, Math.min(canvas.width - pw - 2, px)); // garde dans le cadre
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      roundRect(ctx, px, py, pw, ph, 5); ctx.fill();
      ctx.strokeStyle = e.role === 'ghost' ? (e.color || '#fff') : (e.role === 'mr' ? '#ffe600' : '#ff6db0');
      ctx.lineWidth = 1.5; roundRect(ctx, px, py, pw, ph, 5); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(e.name, px + pw / 2, py + ph / 2 + 1);
    }
  }

  // --- effets : capture d'un Pac (rouge) / fantôme mangé (cyan + "200") ---
  if (pm.events) {
    for (const ev of pm.events) {
      const cx = ox + ev.c * cell + cell / 2;
      const cy = oy + ev.r * cell + cell / 2;
      const t = Math.min(1, ev.age / 600);
      const rr = cell * (0.3 + t * 1.4);
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = ev.type === 'ghost_eaten' ? '#2effd5' : '#ff3b3b';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.stroke();
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        ctx.moveTo(cx + Math.cos(a) * rr * 0.4, cy + Math.sin(a) * rr * 0.4);
        ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (ev.type === 'ghost_eaten') {
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.floor(cell * 0.9)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('200', cx, cy - rr - 2);
      }
    }
  }
};

function drawPac(ctx, cx, cy, rad, e, pm) {
  if (e.inv && Math.floor(Date.now() / 150) % 2 === 0) return; // clignote après capture
  const base = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
  const a = base[e.dir] || 0;
  const mouth = 0.28 * Math.PI * (0.6 + 0.4 * Math.abs(Math.sin(Date.now() / 120)));
  ctx.fillStyle = e.role === 'mr' ? '#ffe600' : '#ff6db0';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, rad, a + mouth, a - mouth + 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  if (e.role === 'mrs') { // petit nœud
    ctx.fillStyle = '#ff2e88';
    ctx.beginPath();
    ctx.arc(cx, cy - rad, rad * 0.35, 0, 7);
    ctx.fill();
  }
}

function drawGhost(ctx, cx, cy, rad, e, frightened) {
  const top = cy - rad;
  ctx.fillStyle = frightened ? '#2a44ff' : (e.color || '#ff2e88');
  ctx.beginPath();
  ctx.arc(cx, cy - rad * 0.1, rad, Math.PI, 0); // dôme
  ctx.lineTo(cx + rad, cy + rad * 0.7);
  // jupe ondulée
  const n = 4;
  for (let i = 0; i < n; i++) {
    const x1 = cx + rad - (2 * rad) * ((i + 0.5) / n);
    const x2 = cx + rad - (2 * rad) * ((i + 1) / n);
    ctx.lineTo(x1, cy + rad * 0.4);
    ctx.lineTo(x2, cy + rad * 0.7);
  }
  ctx.closePath();
  ctx.fill();
  // yeux
  ctx.fillStyle = '#fff';
  const ex = rad * 0.38;
  ctx.beginPath(); ctx.arc(cx - ex, top + rad * 0.7, rad * 0.26, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + ex, top + rad * 0.7, rad * 0.26, 0, 7); ctx.fill();
  ctx.fillStyle = frightened ? '#fff' : '#1b1060';
  ctx.beginPath(); ctx.arc(cx - ex, top + rad * 0.7, rad * 0.12, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + ex, top + rad * 0.7, rad * 0.12, 0, 7); ctx.fill();
}
