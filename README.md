# emihiggins.github.io

Personal site: a dated archive of projects, plus a log. Astro, static output, **zero
client-side JavaScript**.

Live at <https://emihiggins.github.io>. Deployment is documented in
**[DEPLOY.md](./DEPLOY.md)** — including first-time setup and moving the project to a new
machine.

## Quick start

```sh
npm install
npm run dev      # http://localhost:4321
```

Node 22.12+ (`.nvmrc` pins 22).

| Command | What |
| --- | --- |
| `npm run dev` | Dev server with hot reload. **Drafts are visible here.** |
| `npm run build` | Static build into `dist/`. Drafts excluded. |
| `npm run preview` | Serve `dist/` exactly as deployed — use this to verify before pushing |
| `npm run check` | Typecheck `.astro` + `.ts` |

## Adding a project

Create `src/content/projects/<slug>.md`. The filename becomes the URL:
`/projects/<slug>/`.

```yaml
---
title: my-thing
date: 2026-08-06        # drives ordering everywhere; YYYY-MM-DD
status: shipped         # active | shipped | archived
summary: One line, shown in list views.
stack:
  - TypeScript
links:
  - label: source
    url: https://github.com/emihiggins/my-thing
draft: false            # optional; true = visible in dev, absent from the build
---

Markdown body. Headings start at `##` — the layout supplies the `<h1>`.
```

## Adding a log post

Create `src/content/posts/<slug>.md` → `/log/<slug>/`.

```yaml
---
title: On something
date: 2026-08-31
summary: One line, shown in list views and the RSS feed.
tags:
  - notes
draft: false
---
```

Only `date` and the two required strings matter for it to show up. Posts appear on
`/log/`, in the merged homepage index tagged `[log]`, and in `/rss.xml`.

Both schemas are enforced by zod in `src/content.config.ts`, so a typo in frontmatter
**fails the build** with the offending file and field named, rather than rendering a
blank page.

## Structure

| Path | What |
| --- | --- |
| `src/content/projects/`, `src/content/posts/` | All content. Markdown, one file per entry |
| `src/content.config.ts` | Collection schemas (zod). The contract for frontmatter |
| `src/lib/entries.ts` | Draft filtering, date sorting, the merged index query. Change ordering here, not in pages |
| `src/layouts/Base.astro` | Shell: `<head>`, masthead, nav, footer |
| `src/layouts/Entry.astro` | Single project / post page, incl. the metadata block |
| `src/components/EntryList.astro` | The dated `YYYY-MM [kind] title` list |
| `src/pages/` | Routes. `[...slug].astro` files generate one page per content entry |
| `src/styles/global.css` | All styling. Custom properties; dark mode is one media query |
| `public/` | Copied to `dist/` verbatim — favicon, and `CNAME` if you add a domain |

## Design constraints

These are deliberate. Breaking one is a decision, not a cleanup:

- **No client-side JavaScript.** `grep -r '<script' dist/` should return nothing. If a
  page needs a script, the design went wrong somewhere.
- **No webfonts.** System monospace stack only, so there are no font requests.
- **Dark mode is CSS-only** — a single `prefers-color-scheme` block flipping custom
  properties. No toggle, no localStorage, no flash of the wrong theme.
- **Rules are text.** The `═` and `─` characters are literal glyphs in the markup, not
  CSS borders.
- **Three dependencies**: `astro`, `@astrojs/rss`, `@astrojs/sitemap`. Plus `zod`, which
  Astro requires for content schemas.
