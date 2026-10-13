import { typo } from './typo.mjs';

const IGNORES = new Set(['code', 'pre', 'script', 'style']);

function ajouterClasse(noeud, classe) {
  noeud.properties = noeud.properties || {};
  const actuelle = noeud.properties.className;
  if (Array.isArray(actuelle)) noeud.properties.className = [...actuelle, classe];
  else if (actuelle) noeud.properties.className = [actuelle, classe];
  else noeud.properties.className = [classe];
}

function parcourir(noeud) {
  if (noeud.type === 'text') {
    noeud.value = typo(noeud.value);
    return;
  }
  if (noeud.type === 'element' && IGNORES.has(noeud.tagName)) return;
  if (noeud.children) noeud.children.forEach(parcourir);
  if (noeud.type !== 'element') return;

  if (noeud.tagName === 'p') {
    const enfants = noeud.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
    if (enfants.length === 1 && enfants[0].type === 'text' && /^Score\s*\d+\s*\/\s*100$/.test(enfants[0].value.trim())) {
      ajouterClasse(noeud, 'score');
    } else if (enfants.length === 1 && enfants[0].type === 'element' && enfants[0].tagName === 'strong') {
      ajouterClasse(noeud, 'question');
    }
  }
  if (noeud.tagName === 'blockquote') ajouterClasse(noeud, 'fremissement');
  if (noeud.tagName === 'a' && noeud.properties && /^https?:/.test(String(noeud.properties.href || ''))) {
    noeud.properties.rel = 'noopener';
  }
}

export function rehypeTypo() {
  return (arbre) => parcourir(arbre);
}
