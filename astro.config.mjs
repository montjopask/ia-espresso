import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rehypeTypo } from './src/lib/rehype-typo.mjs';

// L'adresse du site et le chemin de base sont fournis par GitHub Pages au moment de la fabrication.
// Avec un sous-domaine personnel, BASE_PATH vaut « / ».
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  markdown: {
    smartypants: false,
    rehypePlugins: [rehypeTypo],
  },
});
