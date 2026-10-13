// Typographie française : espaces insécables là où la ligne ne doit jamais se couper.
const NB = ' ';

export function typo(texte) {
  if (!texte) return texte;
  let s = texte
    .replace(/[  ]+([;:!?»%€])/g, NB + '$1')
    .replace(/«[  ]+/g, '«' + NB)
    .replace(/(\d)[  ](\d{3})(?!\d)/g, '$1' + NB + '$2');
  // Deuxième passe pour les grands nombres (1 000 000)
  s = s.replace(/(\d)[  ](\d{3})(?!\d)/g, '$1' + NB + '$2');
  return s;
}
