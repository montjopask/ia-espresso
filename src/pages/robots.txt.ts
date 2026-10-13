import type { APIRoute } from 'astro';
import { lien } from '../lib/crus';

export const GET: APIRoute = ({ site }) => {
  const plan = new URL(lien('/sitemap-index.xml'), site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${plan}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
