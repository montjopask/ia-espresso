// Contrôle des crus avant chaque construction du site.
// Si un cru est mal formé, la construction s'arrête et le site en ligne reste sur la version précédente.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const DOSSIER = 'src/content/crus';
const THEMES = ['modeles', 'agents', 'creativite', 'raisonnement', 'code', 'memoire', 'recherche', 'infrastructure', 'entreprise', 'ethique'];

const erreurs = [];
const mots = new Map();
const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith('.md')).sort();

for (const fichier of fichiers) {
  const ici = (msg) => erreurs.push(`${fichier} : ${msg}`);
  const brut = readFileSync(join(DOSSIER, fichier), 'utf8');
  const m = brut.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { ici('en-tête YAML absent ou mal fermé'); continue; }
  let fm;
  try { fm = yaml.load(m[1]); } catch (e) { ici(`en-tête YAML illisible (${e.message.split('\n')[0]})`); continue; }
  const corps = m[2];

  if (!/^\d{4}-\d{2}-\d{2}\.md$/.test(fichier)) ici('le nom du fichier doit être AAAA-MM-JJ.md');
  const date = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date);
  if (`${date}.md` !== fichier) ici(`la date (${date}) ne correspond pas au nom du fichier`);
  if (!fm.titre || String(fm.titre).length < 3) ici('titre absent');
  if (!fm.chapeau || String(fm.chapeau).trim().length < 20) ici('chapeau absent ou trop court');

  const mot = String(fm.mot || '');
  if (!/^\p{L}[\p{L}’'-]*$/u.test(mot)) ici(`mot du jour invalide (« ${mot} ») : un seul mot attendu`);
  const cle = mot.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (mots.has(cle)) ici(`mot du jour « ${mot} » déjà pris par ${mots.get(cle)}`);
  else mots.set(cle, fichier);

  const themes = Array.isArray(fm.themes) ? fm.themes : [];
  if (themes.length < 1 || themes.length > 4) ici('il faut entre un et quatre thèmes');
  for (const t of themes) if (!THEMES.includes(t)) ici(`thème inconnu « ${t} »`);

  if (!/^## /m.test(corps)) ici('aucune section ## dans le corps');
  if (/google\.com\/url\?q=/.test(brut)) ici('lien encore enveloppé par Google');
  if (/&#\d+;|&#39;|&amp;#/.test(brut)) ici('entité HTML non décodée');
  if (/<\/?(table|td|tr|span|div)\b/i.test(corps)) ici('reste de HTML de courriel dans le corps');
  if (/· · ·/.test(corps)) ici('séparateur « · · · » à retirer');
}

if (fichiers.length === 0) erreurs.push('aucun cru trouvé');

// Liens vagues : une page d'accueil, un profil X, un index de blog ou un forum entier au lieu de la source précise.
// Signalés sans bloquer la publication.
const avertissements = [];
for (const fichier of fichiers) {
  const brut = readFileSync(join(DOSSIER, fichier), 'utf8');
  for (const [, texte, url] of brut.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) {
    let u;
    try { u = new URL(url); } catch { avertissements.push(`${fichier} : lien illisible « ${url} »`); continue; }
    const morceaux = u.pathname.split('/').filter(Boolean);
    const hote = u.hostname.replace(/^www\./, '');
    const vague =
      (morceaux.length === 0 && !u.search) ||
      (/^(x|twitter)\.com$/.test(hote) && !morceaux.includes('status')) ||
      (hote.endsWith('reddit.com') && !morceaux.includes('comments')) ||
      (morceaux.length <= 2 && ['blog', 'news', 'newsroom', 'research', 'press', 'category'].includes(morceaux.at(-1)));
    if (vague) avertissements.push(`${fichier} : lien vague « ${texte} » → ${url}`);
  }
}
if (avertissements.length) console.warn(`\nLiens à préciser :\n- ${avertissements.join('\n- ')}\n`);

if (erreurs.length) {
  console.error(`\n${erreurs.length} problème(s) dans les crus :\n- ${erreurs.join('\n- ')}\n`);
  process.exit(1);
}
console.log(`${fichiers.length} crus vérifiés, aucun problème.`);
