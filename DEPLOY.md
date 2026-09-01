# Deploying

The site is a static Astro build published to GitHub Pages by GitHub Actions. Pushing to
`main` deploys. There is no manual build-and-upload step.

- **Workflow:** `.github/workflows/deploy.yml`
- **Live URL:** <https://emihiggins.github.io>
- **Required repo name:** `emihiggins.github.io` — exactly this, see [Why the repo name
  matters](#why-the-repo-name-matters)

---

## Moving this project to another machine

The archive you were sent has no `node_modules/`, `dist/`, or `.astro/` — those are
regenerated from the committed `package-lock.json`. Git history is included.

```sh
# 1. Unpack, then from inside the project directory:
npm install          # ~2-3 min, restores the exact locked dependency tree

# 2. Confirm it works before touching GitHub
npm run build        # must exit "Complete!" with 11 pages
npm run dev          # http://localhost:4321
```

Requires **Node 22.12 or newer** (`.nvmrc` pins 22). Check with `node -v`.

If git history didn't survive the transfer (no `.git/` directory), initialize it:

```sh
git init -b main
git add -A
git commit -m "Initial commit"
```

---

## First-time setup

### 1. Set the commit identity for this repo

Do this **before** the first commit. If your global git email is a work address, it will
otherwise be baked into public commit history.

```sh
git config user.name "Emi Higgins"
git config user.email "emaliahiggins5@gmail.com"
git config user.email          # verify
```

### 2. Push to the repo

`emihiggins/emihiggins.github.io` already exists, is public and empty, and `origin`
already points at it. So this step is just:

```sh
git push -u origin main
```

If `gh` is authenticated to more than one host — a personal account and a work
enterprise host — it can silently target the wrong one. Prefix any `gh` command with
`GH_HOST=github.com` to force it, and check what you have with `gh auth status`.

The repo must stay **public** unless you have GitHub Pro — Pages on private repos is a
paid feature.

### 3. Switch Pages to GitHub Actions

**This is the step that's easy to miss, and nothing publishes without it.**

Repo → **Settings** → **Pages** → under *Build and deployment*, set **Source** to
**GitHub Actions**.

The default is "Deploy from a branch". Left on that default, the workflow will run and go
green while the site stays a 404, because Pages is looking for committed HTML on a branch
instead of the artifact the workflow uploaded.

### 4. Watch the first deploy

```sh
gh run watch          # or: gh run list
```

Two jobs, `build` then `deploy`, roughly 1–2 minutes total. When both are green the site
is at <https://emihiggins.github.io>. First-ever deploy can take a few extra minutes for
DNS to settle.

---

## Routine deploys

```sh
git add -A
git commit -m "Add project: whatever"
git push
```

That's it. To redeploy without a code change (`workflow_dispatch` is enabled):

```sh
gh workflow run deploy.yml
```

---

## Why the repo name matters

`emihiggins.github.io` is a GitHub **user site**, served from the domain root. Any other
repo name makes it a **project site**, served from a subpath like
`emihiggins.github.io/some-repo/`.

That distinction controls one config value. `astro.config.mjs` currently sets:

```js
site: 'https://emihiggins.github.io',
// deliberately no `base`
```

Adding a `base` to a user site breaks every internal link and asset path. Conversely, if
you ever rename the repo to something else, you **must** add `base: '/new-repo-name'` or
you get a styleless page with dead navigation. This is the single most common way an
Astro Pages deploy fails.

---

## Adding a custom domain later

1. Create a `public/CNAME` file containing only the bare domain, e.g. `emihiggins.com`.
   It must live in `public/` so Astro copies it into `dist/`.
2. At your DNS provider, point the apex at GitHub:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (and a `CNAME` record for `www` → `emihiggins.github.io`).
3. Update `site` in `astro.config.mjs` to the new domain, or canonical URLs, the sitemap,
   and RSS links will all keep pointing at the old one.
4. Repo → Settings → Pages → Custom domain, then tick **Enforce HTTPS** once the
   certificate is issued.

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Workflow green, site 404s | Pages Source still set to "Deploy from a branch" (step 3) |
| Page loads unstyled, links dead | A `base` was added to `astro.config.mjs`, or the repo isn't named `emihiggins.github.io` |
| `Error: Get Pages site failed` | Pages was never enabled; do step 3 |
| Build fails, `does not match collection schema` | Bad frontmatter in a `src/content/**` Markdown file — the error names the file and field. This is intentional; malformed content fails loudly instead of rendering blank |
| A new post doesn't appear | `draft: true` in its frontmatter. Drafts render in `npm run dev` and are stripped from production builds |
| Build fails only in Actions | Node version drift. The workflow pins 22; match it locally with `nvm use` |
| Pushed to a branch other than `main` | The workflow only triggers on `main` |

To reproduce exactly what gets deployed:

```sh
npm run build && npm run preview
```

`npm run dev` differs from the built output in two ways that matter: drafts are visible,
and `dist/` isn't what's being served.
