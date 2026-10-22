import { getCollection, type CollectionEntry } from 'astro:content';
import { marked } from 'marked';
import { typo } from './typo.mjs';

export type Cru = CollectionEntry<'crus'> | CollectionEntry<'speciales'>;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const lien = (chemin: string) => BASE + chemin;

export const estSpeciale = (c: Cru) => c.collection === 'speciales';

const parDate = (a: Cru, b: Cru) =>
  b.data.date.getTime() - a.data.date.getTime() || Number(estSpeciale(a)) - Number(estSpeciale(b));

// Les crus quotidiens seuls, du plus récent au plus ancien.
export async function crusQuotidiens(): Promise<Cru[]> {
  return (await getCollection('crus')).sort(parDate);
}

// Les éditions spéciales seules, de la plus récente à la plus ancienne.
export async function editionsSpeciales(): Promise<Cru[]> {
  return (await getCollection('speciales')).sort(parDate);
}

// Tout ensemble ; le même jour, le cru quotidien passe avant l'édition spéciale.
export async function tousLesCrus(): Promise<Cru[]> {
  return [...(await getCollection('crus')), ...(await getCollection('speciales'))].sort(parDate);
}

export function slugMot(mot: string): string {
  return mot
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const slugCru = (c: Cru) => `${c.id}-${estSpeciale(c) ? 'speciale-' : ''}${slugMot(c.data.mot)}`;
export const lienCru = (c: Cru) => lien(`/crus/${slugCru(c)}/`);

const formatLong = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const formatMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const dateLongue = (d: Date) => majuscule(formatLong.format(d));
export const dateCourte = (d: Date) => d.toISOString().slice(0, 10).split('-').reverse().join('/');
export const dateIso = (d: Date) => d.toISOString().slice(0, 10);
export const moisAnnee = (d: Date) => majuscule(formatMois.format(d));

export function minutesLecture(c: Cru): number {
  const texte = (c.body || '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  const mots = texte.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(mots / 230));
}

export const chapeauHtml = (c: Cru) => marked.parse(typo(c.data.chapeau), { async: false }) as string;

export function texteBrut(markdown: string): string {
  return markdown
    .replace(/\*\*|__|\*/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function premierePhrase(c: Cru): string {
  const premier = texteBrut(c.data.chapeau.split(/\n\s*\n/)[0]);
  const m = premier.match(/^.+?[.!?](?=\s|$)/);
  return typo(m ? m[0] : premier);
}

export function resume(c: Cru, max = 158): string {
  const t = texteBrut(c.data.chapeau);
  if (t.length <= max) return t;
  const coupe = t.slice(0, max);
  return coupe.slice(0, coupe.lastIndexOf(' ')) + '…';
}
