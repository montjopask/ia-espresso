// Contrôle visuel du site construit : sur chaque page et à plusieurs largeurs d'écran, le mot du jour
// doit tenir sur sa ligne (ou ses deux lignes), sans lettre rejetée à la ligne ni débordement, et la page
// ne doit pas défiler en largeur.
//   npm run build && npm run controle-visuel
//   npm run controle-visuel -- --captures <dossier>   (enregistre aussi des captures de l'accueil et du dernier cru)
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, normalize } from 'node:path';

const DIST = 'dist';
const LARGEURS_ACCUEIL = [320, 360, 390, 430, 600, 768, 860, 1024, 1280, 1440, 1920, 2560];
const LARGEURS_CRU = [320, 390, 768, 1024, 1440, 2560];

const args = process.argv.slice(2);
const iCaptures = args.indexOf('--captures');
const captures = iCaptures >= 0 ? args[iCaptures + 1] : null;

async function chargerPlaywright() {
  const require = createRequire(import.meta.url);
  for (const nom of ['playwright', '/opt/npm-tools/node_modules/playwright/index.js']) {
    try { return require(nom); } catch { /* suivant */ }
  }
  return null;
}

const pw = await chargerPlaywright();
if (!pw) {
  console.error('Contrôle visuel impossible : Playwright introuvable sur cette machine.');
  process.exit(2);
}
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('Contrôle visuel impossible : lancer d’abord « npm run build ».');
  process.exit(2);
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.xml': 'application/xml' };
const serveur = createServer((req, res) => {
  let chemin = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  let fichier = join(DIST, chemin);
  if (existsSync(fichier) && statSync(fichier).isDirectory()) fichier = join(fichier, 'index.html');
  if (!existsSync(fichier)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(fichier)] ?? 'application/octet-stream' });
  res.end(readFileSync(fichier));
});
await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
const racine = `http://127.0.0.1:${serveur.address().port}`;

const crus = readdirSync(join(DIST, 'crus')).filter((d) => existsSync(join(DIST, 'crus', d, 'index.html'))).sort();
const pages = [
  { chemin: '/', largeurs: LARGEURS_ACCUEIL },
  { chemin: '/archives/', largeurs: LARGEURS_ACCUEIL },
  ...crus.map((d) => ({ chemin: `/crus/${d}/`, largeurs: LARGEURS_CRU })),
];

const navigateur = await pw.chromium.launch();
const onglet = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });
const problemes = [];

for (const { chemin, largeurs } of pages) {
  await onglet.goto(racine + chemin, { waitUntil: 'load' });
  await onglet.evaluate(() => document.fonts.ready);
  for (const largeur of largeurs) {
    await onglet.setViewportSize({ width: largeur, height: 900 });
    await onglet.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
    const releves = await onglet.evaluate(() => {
      const sortie = [];
      if (document.documentElement.scrollWidth > window.innerWidth + 1) {
        sortie.push(`la page défile en largeur (${document.documentElement.scrollWidth} px pour ${window.innerWidth})`);
      }
      for (const mot of document.querySelectorAll('.mot')) {
        if (!mot.getClientRects().length) continue; // élément masqué à cette largeur
        const cadre = mot.closest('.mot-cadre');
        if (!cadre) { sortie.push(`« ${mot.textContent} » est hors de son cadre`); continue; }
        const bord = cadre.getBoundingClientRect().right;
        const lignes = mot.querySelectorAll('.mot-ligne');
        for (const ligne of lignes.length ? lignes : [mot]) {
          const plage = document.createRange();
          plage.selectNodeContents(ligne);
          const rects = [...plage.getClientRects()].filter((r) => r.width > 0);
          const hauts = new Set(rects.map((r) => Math.round(r.top)));
          if (hauts.size > 1) sortie.push(`« ${ligne.textContent} » passe à la ligne`);
          const droite = Math.max(...rects.map((r) => r.right));
          if (droite > bord + 1) sortie.push(`« ${ligne.textContent} » déborde de ${Math.round(droite - bord)} px`);
        }
      }
      return sortie;
    });
    for (const r of releves) problemes.push(`${chemin} à ${largeur} px : ${r}`);
  }
}

if (captures) {
  mkdirSync(captures, { recursive: true });
  const dernier = crus.filter((d) => /^\d{4}-\d{2}-\d{2}-(?!speciale)/.test(d)).pop();
  for (const [nom, chemin, selecteur] of [['accueil', '/', '.une'], ['cru', `/crus/${dernier}/`, '.cru-tete']]) {
    for (const largeur of [390, 1440]) {
      await onglet.setViewportSize({ width: largeur, height: 900 });
      await onglet.goto(racine + chemin, { waitUntil: 'load' });
      await onglet.evaluate(() => document.fonts.ready);
      await onglet.locator(selecteur).first().screenshot({ path: join(captures, `${nom}-${largeur}.png`) });
    }
  }
}

await navigateur.close();
serveur.close();

const nbLargeurs = new Set(pages.flatMap((p) => p.largeurs)).size;
if (problemes.length) {
  console.error(`Contrôle visuel : ${problemes.length} problème(s).`);
  for (const p of problemes) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`Contrôle visuel : ${pages.length} pages, ${nbLargeurs} largeurs d’écran, aucun débordement.${captures ? ` Captures dans ${captures}.` : ''}`);
