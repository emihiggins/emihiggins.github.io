# Personal Portfolio

A single-page, bento-grid portfolio. Plain HTML/CSS/JS — no build step, no dependencies.

## Structure

```
index.html        # all page content + markup
css/styles.css    # all styling; design tokens (colors/fonts) live in :root at the top
js/main.js        # footer year + stat count-up animation (site works without JS too)
assets/           # avatar.svg, favicon.svg — replace with your own; drop resume.pdf here
```

## Make it yours

Search `index.html` for **`EDIT ME`** — every spot that needs your content is marked:

- Name, one-line pitch, and bio (hero card)
- Stats, "Currently" status, skills chips
- Projects — duplicate a `<article class="card card--project ...">` block per project
- Experience — one `<li>` per role in the timeline
- Contact links (email, GitHub, LinkedIn)
- Page `<title>` and meta description (top of `index.html`)

To **re-theme**, change `--accent` (and optionally the pastel tints) in `css/styles.css`.

Add your résumé as `assets/resume.pdf` (the "Download résumé" button already points there),
and replace `assets/avatar.svg` with a real photo (`avatar.jpg`) — update the `src` in the hero card if you change the filename.

## Preview locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repo on GitHub and push this folder:
   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git branch -M main
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** / **`/ (root)`** → Save
3. Wait ~1 minute. Your site is live at `https://<you>.github.io/<repo>/`.

> Tip: to host at `https://<you>.github.io` (no `/repo` path), name the repo exactly `<you>.github.io`.

### Custom domain (optional)
Add a file named `CNAME` at the root containing your domain (e.g. `yourname.com`),
then configure the domain's DNS per GitHub's Pages docs.
