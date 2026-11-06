// Largeur des signes du mot du jour, en em : Fraunces italique, axe opsz 144, graisse 460,
// interlettrage de -0,025 em compris. Mesurée dans Chromium le 06/11/2026 ; la somme des signes
// dépasse de 0,5 % environ la largeur réelle (l'approche entre lettres la réduit), ce qui joue en sécurité.
const LARGEURS: Record<string, number> = {
  a: 0.443, b: 0.4465, c: 0.368, d: 0.4405, e: 0.3695, f: 0.2265, g: 0.4135, h: 0.46, i: 0.2275,
  j: 0.2, k: 0.454, l: 0.2115, m: 0.7015, n: 0.4665, o: 0.4215, p: 0.434, q: 0.421, r: 0.3505,
  s: 0.34, t: 0.2485, u: 0.466, v: 0.4315, w: 0.646, x: 0.452, y: 0.3895, z: 0.3915,
  A: 0.534, B: 0.5815, C: 0.574, D: 0.652, E: 0.5565, F: 0.5225, G: 0.6295, H: 0.689, I: 0.317,
  J: 0.306, K: 0.624, L: 0.485, M: 0.758, N: 0.578, O: 0.665, P: 0.5775, Q: 0.6665, R: 0.5985,
  S: 0.501, T: 0.498, U: 0.5845, V: 0.5155, W: 0.835, X: 0.5555, Y: 0.502, Z: 0.529,
  œ: 0.65, æ: 0.6155, Œ: 0.908, Æ: 0.8655, "'": 0.1105, '’': 0.127, '-': 0.238, ' ': 0.1305,
};
// Signe absent de la table : compté large, par prudence.
const INCONNU = 0.76;

// Largeur d'un texte en em ; une lettre accentuée vaut sa lettre de base.
export function largeurEm(texte: string): number {
  let l = 0;
  for (const c of texte.normalize('NFC')) l += LARGEURS[c] ?? LARGEURS[c.normalize('NFD')[0]] ?? INCONNU;
  return l;
}

// Un mot composé (trait d'union) ou de deux mots se coupe en deux lignes dans les grands formats
// quand la coupe agrandit nettement la lettre : on garde la coupure qui équilibre le mieux les lignes.
export function lignesMot(mot: string): string[] {
  const total = largeurEm(mot);
  let meilleure: string[] = [mot];
  let plusLongue = total;
  for (let i = 1; i < mot.length; i++) {
    const avant = mot[i - 1];
    if (avant !== '-' && avant !== ' ') continue;
    const lignes = [mot.slice(0, i).trimEnd(), mot.slice(i).trimStart()];
    const l = Math.max(...lignes.map(largeurEm));
    if (l < plusLongue) { plusLongue = l; meilleure = lignes; }
  }
  return total >= 5 && total / plusLongue >= 1.4 ? meilleure : [mot];
}
