import { getCollection, type CollectionEntry } from 'astro:content';

/** Drafts render in `astro dev` and are stripped from production builds. */
const isPublished = (entry: { data: { draft: boolean } }) =>
  import.meta.env.PROD ? !entry.data.draft : true;

const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.getTime() - a.data.date.getTime();

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  return (await getCollection('projects', isPublished)).sort(byDateDesc);
}

export async function getPosts(): Promise<CollectionEntry<'posts'>[]> {
  return (await getCollection('posts', isPublished)).sort(byDateDesc);
}

/** Projects split by the `kind` frontmatter field, each still newest-first. */
export async function getProjectsByKind() {
  const projects = await getProjects();
  return {
    oss: projects.filter((p) => p.data.kind === 'oss'),
    side: projects.filter((p) => p.data.kind === 'side'),
  };
}

export const projectRow = (p: CollectionEntry<'projects'>) => ({
  date: p.data.date,
  title: p.data.title,
  href: `/projects/${p.id}/`,
  summary: p.data.summary,
});

/** 2026-08 — the list format. */
export const yearMonth = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

/** 2026-08-06 — the single-entry format. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
