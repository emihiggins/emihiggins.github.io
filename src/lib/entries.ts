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

export interface IndexRow {
  date: Date;
  kind: 'proj' | 'log';
  title: string;
  href: string;
  summary: string;
}

/** The merged homepage index: projects and log entries in one dated stream. */
export async function getIndexRows(): Promise<IndexRow[]> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);

  const rows: IndexRow[] = [
    ...projects.map((p) => ({
      date: p.data.date,
      kind: 'proj' as const,
      title: p.data.title,
      href: `/projects/${p.id}/`,
      summary: p.data.summary,
    })),
    ...posts.map((p) => ({
      date: p.data.date,
      kind: 'log' as const,
      title: p.data.title,
      href: `/log/${p.id}/`,
      summary: p.data.summary,
    })),
  ];

  return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** 2026-08 — the list format. */
export const yearMonth = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

/** 2026-08-06 — the single-entry format. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
