// =====================================================================
//  Génère les QR codes (PNG) à imprimer : un par joueur + la BORNE.
//  Usage : npm run qr
//  Sortie : server/qr/*.png  +  un récap dans la console.
// =====================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { CONFIG, PLAYERS } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'qr');
fs.mkdirSync(OUT, { recursive: true });

// Option : --rotate régénère des tokens aléatoires et te les affiche
const rotate = process.argv.includes('--rotate');
function newToken(name) {
  const slug = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  return `PXL-${slug}-${crypto.randomInt(1000, 9999)}`;
}

const opts = { width: 800, margin: 2, color: { dark: '#0a0118', light: '#ffffff' } };

console.log('\n🎯 GÉNÉRATION DES QR CODES — PIXEL PANIC\n');
console.log(`Base URL : ${CONFIG.publicUrl}\n`);

for (const p of PLAYERS) {
  const token = rotate ? newToken(p.name) : p.token;
  const url = `${CONFIG.publicUrl}/j/${token}`;
  const file = path.join(OUT, `joueur-${p.id}.png`);
  await QRCode.toFile(file, url, opts);
  console.log(`  👤 ${p.name.padEnd(12)} ${url}`);
  if (rotate) console.log(`     ⚠️  nouveau token : ${token}  (reporte-le dans config.js)`);
}

await QRCode.toFile(path.join(OUT, 'borne.png'), `${CONFIG.publicUrl}/borne`, opts);
await QRCode.toFile(path.join(OUT, 'gm.png'), `${CONFIG.publicUrl}/gm`, opts);
console.log(`\n  📺 BORNE  ${CONFIG.publicUrl}/borne`);
console.log(`  🎛️  GM     ${CONFIG.publicUrl}/gm`);
console.log(`\n✅ Images dans : ${OUT}\n`);
