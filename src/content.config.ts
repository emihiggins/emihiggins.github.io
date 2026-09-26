import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { devtoLoader } from './lib/devto';

const linkSchema = z.object({
  label: z.string(),
  url: z.url(),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    status: z.enum(['active', 'shipped', 'archived']),
    /** Which homepage section it lands in. */
    kind: z.enum(['oss', 'side']).default('side'),
    summary: z.string(),
    stack: z.array(z.string()).default([]),
    links: z.array(linkSchema).default([]),
    draft: z.boolean().default(false),
  }),
});

/** Written on DEV, pulled in at build time. See src/lib/devto.ts. */
const posts = defineCollection({
  loader: devtoLoader(),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    /** The post on dev.to, where comments and reactions live. */
    url: z.url(),
    /** dev.to's own URL unless a canonical was set there. */
    canonical: z.url(),
  }),
});

const blueprints = defineCollection({
  loader: glob({ base: './src/content/blueprints', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    /** The project this rebuilds. Matches a `projects` entry id where one exists. */
    project: z.string().optional(),
    /** Rough wall-clock time to work through the whole thing, e.g. '~2 hours'. */
    time: z.string().optional(),
    stack: z.array(z.string()).default([]),
    links: z.array(linkSchema).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, posts, blueprints };
