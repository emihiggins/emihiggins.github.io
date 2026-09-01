import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPosts } from '../lib/entries';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();

  return rss({
    title: 'emi.higgins — log',
    description: 'Notes and writing by Emi Higgins.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/log/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
};
