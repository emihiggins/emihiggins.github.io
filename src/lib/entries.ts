import { getCollection, type CollectionEntry } from 'astro:content';

/** Drafts render in `astro dev` and are stripped from production builds. */
const isPublished = (entry: { data: { draft: boolean } }) =>
  import.meta.env.PROD ? !entry.data.draft : true;

const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.getTime() - a.data.date.getTime();

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  return (await getCollection('projects', isPublished)).sort(byDateDesc);
}

/** dev.to only returns published articles, so there are no drafts to filter. */
export async function getPosts(): Promise<CollectionEntry<'posts'>[]> {
  return (await getCollection('posts')).sort(byDateDesc);
}

export async function getBlueprints(): Promise<CollectionEntry<'blueprints'>[]> {
  return (await getCollection('blueprints', isPublished)).sort(byDateDesc);
}

/** Projects split by the `kind` frontmatter field, each still newest-first. */
export async function getProjectsByKind() {
  const projects = await getProjects();
  return {
    oss: projects.filter((p) => p.data.kind === 'oss'),
    research: projects.filter((p) => p.data.kind === 'research'),
    side: projects.filter((p) => p.data.kind === 'side'),
  };
}

export const projectRow = (p: CollectionEntry<'projects'>) => ({
  date: p.data.date,
  title: p.data.title,
  href: `/projects/${p.id}/`,
  summary: p.data.summary,
  tags: p.data.stack,
});

export const blueprintRow = (b: CollectionEntry<'blueprints'>) => ({
  date: b.data.date,
  title: b.data.title,
  href: `/blueprints/${b.id}/`,
  summary: b.data.summary,
  tags: b.data.stack,
});

/** 2026-08 — the list format. */
export const yearMonth = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

/** 2026-08-06 — the single-entry format. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
