import rss from '@astrojs/rss';
import { tousLesCrus, estSpeciale, lienCru, resume } from '../lib/crus';

export async function GET(context) {
  const crus = await tousLesCrus();
  return rss({
    title: 'IA Espresso',
    description: 'Les nouvelles de l’IA générative (texte, images, vidéos), un cru chaque matin.',
    site: context.site,
    items: crus.map((c) => ({
      title: `${estSpeciale(c) ? 'Édition spéciale · ' : ''}${c.data.mot} · ${c.data.titre}`,
      pubDate: c.data.date,
      description: resume(c, 400),
      link: lienCru(c),
      categories: c.data.themes,
    })),
    customData: '<language>fr-fr</language>',
  });
}
