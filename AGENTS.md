# myWebpage

Job-focused personal portfolio. Vite + React 19. Dark single-page landing: centered portrait with project icons around it. Clicking an icon flies it to the top-right and opens a detail panel (description, YouTube, PDFs, links).

Repo: https://github.com/AllanHadzimahovic/myWebpage  
Local path: `/Users/Allan/Documents/myWebpage`

## Run

```bash
cd /Users/Allan/Documents/myWebpage && npm run dev
```

App: http://127.0.0.1:5173/  
Use `&&` after `cd` — `npm` must run inside this folder (not `~`).

## Layout (keep this vibe)

- Dark background (`#0b0d12`)
- Portrait: `public/me.jpg` (circular crop in CSS)
- Project markers scattered around the portrait
- No milo.gg clone; milo-inspired clarity only (e.g. white edge on icons)

## Key files

| Path | Role |
|------|------|
| `src/App.jsx` | Landing stage, icon fly-to-corner animation, open/close panel |
| `src/App.css` | Layout, marker/sticker styles, panel |
| `src/ProjectPanel.jsx` | Expanded project page (About / Video / Documents / Links) |
| `src/data/projects.js` | All project content + marker positions |
| `public/me.jpg` | Center portrait |
| `public/projects/` | Project icons (`project-N.png` stickers or `.svg` placeholders) |

## Project data (`src/data/projects.js`)

Each entry supports:

- `id`, `title`, `icon`, `x` / `y` (% on stage), `size`
- `sticker: true` — die-cut icon; **no** rounded rectangle CSS frame
- `summary`, `description`, `youtubeId`, `pdfs[]`, `links[]`

Placeholder slots are `project-1` … `project-6` today; add more entries if needed.

## Stickers

User-wide skill: `/image-to-sticker` (`~/.grok/skills/image-to-sticker/`).

```bash
python3 ~/.grok/skills/image-to-sticker/scripts/make_sticker.py \
  "<SRC.png>" \
  "public/projects/project-N.png"
```

Then set in `projects.js`:

```js
icon: '/projects/project-N.png',
sticker: true,
size: 72, // stickers often need to be a bit larger than square markers
```

`App.jsx` / `App.css`: `sticker: true` → `is-sticker` class (transparent button, silhouette outline comes from the PNG).

## Detail panel

- Open: click marker → icon animates to top-right → panel expands
- Close: Close button or Escape
- Content is driven only by `projects.js` (and files under `public/`)

## Git / GitHub

Project skill: `/git-push` (`.grok/skills/git-push/`).

- Remote: `origin` → `AllanHadzimahovic/myWebpage`
- Prefer `gh auth setup-git` if push 403s (wrong macOS keychain user)
- No force-push unless explicitly requested

## Conventions

- Keep the landing minimal: portrait + project markers; don’t reintroduce a multi-section marketing site unless asked
- Prefer editing `projects.js` for content over hardcoding copy in components
- Verify UI in the browser after visual changes (desktop + mobile)
