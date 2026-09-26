import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getBlueprints, getPosts } from '../lib/entries';

export const GET: APIRoute = async (context) => {
  const [posts, blueprints] = await Promise.all([getPosts(), getBlueprints()]);

  /** One feed for everything written: log entries and blueprints, interleaved by date. */
  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/log/${post.id}/`,
    })),
    ...blueprints.map((blueprint) => ({
      title: blueprint.data.title,
      description: blueprint.data.summary,
      pubDate: blueprint.data.date,
      link: `/blueprints/${blueprint.id}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'emi.higgins — log',
    description: 'Notes and writing by Emi Higgins.',
    site: context.site!,
    items,
    customData: '<language>en-us</language>',
  });
};
