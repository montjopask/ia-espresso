import type { APIRoute } from 'astro';
import { Resvg } from '@resvg/resvg-js';
import { join } from 'node:path';
import { tousLesCrus, slugCru, dateCourte, type Cru } from '../../lib/crus';

// Images de partage (1200 × 630), fabriquées une fois par cru au moment de la construction du site.
const POLICES = ['Fraunces-Italic-500.ttf', 'Fraunces-600.ttf', 'EncodeSans-400.ttf', 'EncodeSansCondensed-600.ttf'].map((f) =>
  join(process.cwd(), 'og-fonts', f),
);

export async function getStaticPaths() {
  const crus = await tousLesCrus();
  return [
    { params: { slug: 'accueil' }, props: { cru: undefined } },
    ...crus.map((cru) => ({ params: { slug: slugCru(cru) }, props: { cru } })),
  ];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function couper(texte: string, max: number): string[] {
  const lignes: string[] = [];
  let ligne = '';
  for (const mot of texte.split(/\s+/)) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (essai.length > max && ligne) {
      lignes.push(ligne);
      ligne = mot;
    } else ligne = essai;
  }
  if (ligne) lignes.push(ligne);
  return lignes;
}

function dessin(cru?: Cru): string {
  const mot = cru ? cru.data.mot : 'Espresso';
  const titre = cru ? cru.data.titre : 'Les nouvelles de l’IA générative, le temps d’une tasse';
  const date = cru ? dateCourte(cru.data.date) : 'Un cru chaque matin';
  const taille = Math.min(200, Math.floor(1050 / (mot.length * 0.52)));
  let lignes = couper(titre, 44);
  if (lignes.length > 3) {
    lignes = lignes.slice(0, 3);
    lignes[2] = lignes[2].replace(/\s*\S*$/, '') + '…';
  }
  const corps = 'M30 44 H90 V60 C90 81 77 93 60 93 C43 93 30 81 30 60 Z';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#121016"/>
  <g transform="translate(64 40) scale(0.7)">
    <clipPath id="c"><path d="${corps}"/></clipPath>
    <g clip-path="url(#c)"><rect x="28" y="51" width="64" height="44" fill="#4b2915"/><rect x="28" y="50" width="64" height="3.4" fill="#c99a62"/></g>
    <g fill="none" stroke="#e8dccb" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="${corps}"/><path d="M90 52 C104 52 106 75 89 75"/><path d="M18 100 Q60 106 102 100"/>
    </g>
  </g>
  <text x="160" y="104" font-size="42" font-family="OG Fraunces"><tspan font-weight="600" fill="#a790ee">IA</tspan><tspan font-style="italic" font-weight="500" fill="#ece6dc"> Espresso</tspan></text>
  <text x="1128" y="98" text-anchor="end" font-family="OG Encode Cond" font-weight="600" font-size="24" letter-spacing="3" fill="#8d859a">${esc(date.toUpperCase())}</text>
  <text x="70" y="${cru ? 372 : 380}" font-family="OG Fraunces" font-style="italic" font-weight="500" font-size="${taille}" letter-spacing="-3" fill="#ece6dc">${esc(mot)}</text>
  ${lignes
    .map((l, i) => `<text x="74" y="${458 + i * 52}" font-family="OG Encode" font-size="38" fill="#b5adbf">${esc(l)}</text>`)
    .join('\n  ')}
</svg>`;
}

export const GET: APIRoute = ({ props }) => {
  const png = new Resvg(dessin(props.cru as Cru | undefined), {
    fitTo: { mode: 'width', value: 1200 },
    font: { fontFiles: POLICES, loadSystemFonts: false, defaultFontFamily: 'OG Encode' },
  })
    .render()
    .asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
