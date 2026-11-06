// Exporte story-anime.html en MP4 : Google Chrome (sans fenêtre) calcule chaque image,
// puis l'outil vidéo de macOS (images-vers-mp4.swift) les assemble. Rien à installer (Node 22+, Chrome, Swift de macOS).
// Usage : node ressources/instagram/export-video.mjs [page.html] [sortie.mp4]
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const page = resolve(process.argv[2] || join(ici, 'story-anime.html'));
const sortie = resolve(process.argv[3] || page.replace(/\.html$/, '.mp4'));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333, IPS = 30;
const travail = mkdtempSync(join(tmpdir(), 'story-'));
const images = join(travail, 'images');
execFileSync('mkdir', ['-p', images]);

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(travail, 'profil')}`,
  '--window-size=1080,1920', '--hide-scrollbars', '--force-device-scale-factor=1', '--allow-file-access-from-files', 'about:blank'
], { stdio: 'ignore' });

const attends = ms => new Promise(r => setTimeout(r, ms));
let cibles;
for (let i = 0; i < 50 && !cibles; i++) {
  try { cibles = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch { await attends(200); }
}
const ws = new WebSocket(cibles.find(c => c.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const attente = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (attente.has(m.id)) { attente.get(m.id)(m); attente.delete(m.id); } };
const cmd = (method, params = {}) => new Promise(r => { const n = ++id; attente.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const js = async expression => {
  const r = await cmd('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 500));
  return r.result?.result?.value;
};

await cmd('Page.enable');
await cmd('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
await cmd('Page.navigate', { url: 'file://' + page + '#export' });
for (let i = 0; i < 100 && !(await js('typeof preparePourExport === "function"')); i++) await attends(200);
const duree = await js('preparePourExport()');
const n = Math.round(duree * IPS);
console.log(`Calcul de ${n} images…`);
for (let i = 0; i < n; i++) {
  await js(`dessine(${i / IPS})`);
  const shot = await cmd('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920, scale: 1 } });
  writeFileSync(join(images, String(i).padStart(5, '0') + '.png'), Buffer.from(shot.result.data, 'base64'));
}
ws.close(); chrome.kill();

console.log('Assemblage de la vidéo…');
execFileSync('swift', [join(ici, 'images-vers-mp4.swift'), images, sortie, String(IPS)], { stdio: 'inherit' });
rmSync(travail, { recursive: true, force: true });
