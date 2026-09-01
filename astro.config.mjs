// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// User site (emihiggins.github.io) -> served from the domain root.
// Do NOT add `base` here; that is only for project-repo Pages sites and
// would break every internal link.
export default defineConfig({
  site: 'https://emihiggins.github.io',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
