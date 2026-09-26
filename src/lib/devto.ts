import type { Loader } from 'astro/loaders';

/**
 * DEV (dev.to) username whose published articles become the log. Posts are
 * written on DEV and pulled in at build time, so a new post only shows up
 * here after the next deploy.
 */
export const DEV_USERNAME = 'emalia';

export const DEV_PROFILE_URL = `https://dev.to/${DEV_USERNAME}`;

const API = 'https://dev.to/api';
/**
 * DEV's CDN caches the article list for hours to days and isn't purged when a
 * post is published, so a fixed URL can return a stale list missing new posts.
 * The cache key ignores unknown query params and `Cache-Control`, but not
 * `per_page`, so each build picks its own page size to get a fresh response.
 */
const PER_PAGE = 500 + Math.floor(Math.random() * 501);

const headers = {
  Accept: 'application/vnd.forem.api-v1+json',
  'User-Agent': 'emihiggins.github.io build',
};

interface ArticleSummary {
  id: number;
}

interface Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  published_at: string;
  edited_at: string | null;
  tag_list: string[] | string;
  url: string;
  canonical_url: string;
  body_html: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retries 429s with backoff; DEV rate-limits bursts of requests from one IP. */
async function getJson<T>(url: string): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers });
    if (res.status === 429 && attempt < 5) {
      const retryAfter = Number(res.headers.get('retry-after'));
      await sleep(retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt);
      continue;
    }
    if (!res.ok) throw new Error(`dev.to ${res.status} ${res.statusText}: ${url}`);
    return res.json() as Promise<T>;
  }
}

/**
 * Loads every published article for DEV_USERNAME. The list endpoint omits the
 * body, so each article is fetched once more by id for `body_html`.
 *
 * A failed request throws and fails the build on purpose: a failed deploy
 * leaves the last good site live, where carrying on would publish an empty log.
 */
export function devtoLoader(): Loader {
  return {
    name: 'devto',
    load: async ({ store, parseData, logger }) => {
      const summaries: ArticleSummary[] = [];
      for (let page = 1; ; page++) {
        const batch = await getJson<ArticleSummary[]>(
          `${API}/articles?username=${DEV_USERNAME}&per_page=${PER_PAGE}&page=${page}`,
        );
        summaries.push(...batch);
        if (batch.length < PER_PAGE) break;
      }

      // Sequential, to stay well under DEV's rate limit.
      const articles: Article[] = [];
      for (const { id } of summaries) {
        articles.push(await getJson<Article>(`${API}/articles/${id}`));
      }

      store.clear();
      for (const article of articles) {
        const data = await parseData({
          id: article.slug,
          data: {
            title: article.title,
            date: article.published_at,
            summary: article.description,
            tags: Array.isArray(article.tag_list)
              ? article.tag_list
              : article.tag_list.split(',').map((t) => t.trim()).filter(Boolean),
            url: article.url,
            canonical: article.canonical_url,
          },
        });
        store.set({ id: article.slug, data, rendered: { html: article.body_html } });
      }

      logger.info(`Loaded ${articles.length} post(s) from dev.to/${DEV_USERNAME}`);
    },
  };
}
