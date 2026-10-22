import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { THEMES } from './lib/themes';

const schema = z.object({
  date: z.coerce.date(),
  titre: z.string().min(3),
  mot: z.string().min(2).regex(/^\p{L}[\p{L}’'-]*$/u, 'Le mot du jour doit être un seul mot'),
  themes: z.array(z.enum(THEMES)).min(1).max(4),
  chapeau: z.string().min(20),
});

// Les crus quotidiens, un par jour.
const crus = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/crus' }),
  schema,
});

// Les éditions spéciales, consacrées à un seul sujet, à côté du cru du jour.
const speciales = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/speciales' }),
  schema,
});

export const collections = { crus, speciales };
