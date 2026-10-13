export const THEMES = [
  'modeles',
  'agents',
  'creativite',
  'raisonnement',
  'code',
  'memoire',
  'recherche',
  'infrastructure',
  'entreprise',
  'ethique',
] as const;

export type Theme = (typeof THEMES)[number];

export const LIBELLES: Record<Theme, string> = {
  modeles: 'Modèles',
  agents: 'Agents',
  creativite: 'Créativité',
  raisonnement: 'Raisonnement',
  code: 'Code',
  memoire: 'Mémoire',
  recherche: 'Recherche',
  infrastructure: 'Infrastructure',
  entreprise: 'Entreprise',
  ethique: 'Éthique',
};

export const DESCRIPTIONS: Record<Theme, string> = {
  modeles: 'Les nouveaux modèles de langage, leurs versions et ce qu’ils savent faire de plus.',
  agents: 'Les agents qui agissent à notre place, et ce qu’ils font quand on les laisse seuls.',
  creativite: 'Image, vidéo, son, musique, cinéma : tout ce qui se génère et se met en scène.',
  raisonnement: 'Le raisonnement des machines, les mathématiques et les sciences.',
  code: 'La programmation et les outils de développement.',
  memoire: 'La mémoire des modèles, le contexte long et la personnalisation.',
  recherche: 'Les publications, les études et ce qui sort des laboratoires.',
  infrastructure: 'Les puces, les centres de données, l’énergie et la puissance de calcul.',
  entreprise: 'Les stratégies, les produits, le commerce et le travail.',
  ethique: 'La régulation, le droit, la sécurité, la société et l’éducation.',
};
