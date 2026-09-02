# myWebpage

Job-focused personal portfolio. Vite 8 + React 19 (+ Three.js for STL). Dark single-page landing: centered portrait with die-cut project stickers. Most stickers fly to the top-right and open a detail panel; some open external links or share a panel with sibling stickers.

Repo: https://github.com/AllanHadzimahovic/myWebpage  
Local path: `/Users/Allan/Documents/myWebpage`

## Run

```bash
cd /Users/Allan/Documents/myWebpage && npm run dev
```

App is usually http://127.0.0.1:5173/ (or the next free port Vite prints).  
Always `cd` into this folder first — `npm` from `~` will fail.

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | oxlint |

## Layout (keep this vibe)

- Dark background (`#0b0d12`)
- Portrait: `public/me.jpg` (circular crop in CSS)
- Stickers scattered across the full landing viewport (`x`/`y` %, optional `rotate`)
- Milo-inspired clarity (white silhouette on stickers), not a milo.gg clone
- Landing stays minimal: portrait + stickers — no multi-section marketing site unless asked

## Key files

| Path | Role |
|------|------|
| `src/App.jsx` | Markers, group fly-to-corner, `externalUrl` / `miniGame` clicks, panel open/close |
| `src/App.css` | Landing, stickers, panel, galleries, code viewer, language grid |
| `src/VolleyballGame.jsx` | Volleyball landing mini-game (countdown, net, rally) |
| `src/ProjectPanel.jsx` | Detail panel sections (order matters — see below) |
| `src/ProjectGallery.jsx` | Carousel: images and/or YouTube slides |
| `src/CodeViewer.jsx` | Scrollable source from a URL (e.g. `.ino`) |
| `src/ModelViewer.jsx` | Three.js STL/GLB viewer |
| `src/UnityPlayer.jsx` | Unity WebGL iframe embed |
| `src/WebEmbed.jsx` | External web-app iframe (+ fullscreen / new tab) |
| `src/ContactComposer.jsx` | Email / WhatsApp / LinkedIn contact UI |
| `src/data/projects.js` | **Source of truth** for all markers + panel content |
| `public/me.jpg` | Center portrait |
| `public/projects/project-N.png` | Landing stickers (wired via `icon`) |
| `public/projects/prusa/` | Chess Machine gallery (+ Maternity Foundation still) |
| `public/projects/languages/` | SQL / JS / Python / C++ stickers (panel grid only) |
| `public/files/` | PDFs, ZIP downloads, `code/Combined_Code.ino` |
| `public/models/New-Assembly.stl` | Chess Machine 3D viewer |
| `public/games/unity/` | Real Balloons Unity WebGL build (~69MB, uncompressed — works on Vite/GitHub Pages without Content-Encoding) |
| `vite.config.js` | React plugin + exact 404s for missing `/games/*` files |

Extra files under `public/projects/` (webp/avif/source logos) are raw material — only `project-N.png` (and paths referenced in `projects.js`) are live.

## Project map (current)

17 markers in `projects.js`:

| id | Marker label | Panel / behavior |
|----|--------------|------------------|
| `project-1` | LEGO | Own panel — embedded PDF case study |
| `project-2` | Volleyball | Landing mini-game (`miniGame: 'volleyball'`) — no panel |
| `project-3` | Email | Contact composer (`allanh@live.dk`) |
| `project-4` | Polaroid | Own panel (placeholder) |
| `project-5` | WhatsApp | Contact composer (`4542319931`) |
| `project-6` | LinkedIn | `externalUrl` → linkedin.com/in/allanprojectmanager (no fly-in) |
| `project-7` | Unity | **Real Balloons** — playable Unity WebGL |
| `project-8` | Azure | Shared group `ms-cloud` (canonical panel) |
| `project-9` | Power Automate | `ms-cloud` → `linkTo: project-8` |
| `project-10` | Microsoft Learn | Own panel (placeholder) |
| `project-11` | Prusa | Shared group `htmaa-chess` → **Chess Machine** (richest panel) |
| `project-12` | Arduino | Shared group `arduino-terminal` (canonical) — embeds Sibanye.school |
| `project-13` | Raspberry Pi | `htmaa-chess` → `linkTo: project-11` |
| `project-14` | Terminal | `arduino-terminal` → `linkTo: project-12` |
| `project-15` | GitHub | `externalUrl` → github.com/AllanHadzimahovic (no fly-in) |
| `project-16` | Maternity Foundation | Own panel (placeholder; also a secondary gallery on Chess Machine) |
| `project-17` | Programming (rubber duck) | Language stickers grid (SQL, JS, Python, C++) |

## Project data fields (`src/data/projects.js`)

- `id`, `title`, `icon`, `x` / `y` (% of landing), `size`, optional `rotate`
- `sticker: true` — die-cut PNG; **no** rounded CSS frame (`is-sticker`)
- `markerTitle` — landing label when `title` is the shared panel name
- `groupId` + optional `linkTo` — several stickers open one panel; all group icons fly to top-right together
- `externalUrl` — open URL in new tab; no fly-in / panel
- `miniGame: 'volleyball'` — skip panel; open landing mini-game (`VolleyballGame.jsx`)
- `summary`, `description`, `youtubeId` (standalone Video section if set)
- `gallery` — primary carousel; items: `{ src, alt? }` or `{ type:'youtube', youtubeId, alt? }`
- `gallerySecondary` + `gallerySecondaryHeading` — second carousel below primary
- `languageStickers: [{ title, src }]` — grid inside the panel
- `pdfs: [{ title, url, filename?, embed? }]` — embed under Documents; also listed in Downloads
- `code: [{ title, url, language? }]` — scrollable code viewer (+ download)
- `files: [{ title, url, filename? }]` — Downloads section
- `links: [{ title, url }]` — external links list
- `model3d: { title?, src, allowUpload?, note? }` — keep `allowUpload: false` for portfolio
- `unityWebGL: { title?, src, note? }` — e.g. `/games/unity/index.html`
- `webEmbed: { heading?, title?, src, note? }` — iframe for an external web app (+ Open in new tab)
- `contact` — drives `ContactComposer`:
  - email: `{ channel: 'email', to }`
  - whatsapp: `{ channel: 'whatsapp', phone }` (digits; country code included)
  - linkedin: `{ channel: 'linkedin', profileUrl }`

Prefer editing `projects.js` over hardcoding copy in components.

## Detail panel section order

Rough order in `ProjectPanel.jsx`: Contact (if any) → About → Languages → Video → 3D → Unity Play → Web embed → Gallery → Gallery secondary → Documents (PDF embeds) → Code → Downloads → Links.

## Stickers

User-wide skill: `/image-to-sticker` (`~/.grok/skills/image-to-sticker/`).

```bash
python3 ~/.grok/skills/image-to-sticker/scripts/make_sticker.py \
  "<SRC>" \
  "public/projects/project-N.png"
```

Typical landing size ~`108` (was 72; +50% look). Language logos for exact text: build SVG/HTML in code, rasterize, then stickerize — don’t rely on image models for lettering.

## Unity WebGL

Current game: **Real Balloons** on `project-7`, served from `public/games/unity/`.

Batch build (Unity 6000.0.41f1 + WebGL module):

```bash
"/Applications/Unity/Hub/Editor/6000.0.41f1/Unity.app/Contents/MacOS/Unity" \
  -batchmode -nographics -quit \
  -projectPath "/Users/Allan/Downloads/Real Balloons" \
  -executeMethod WebGLBuilder.Build \
  -webglOutput "WebGLBuild" \
  -logFile "/Users/Allan/Downloads/Real Balloons/WebGLBuild.log"
```

Copy `WebGLBuild/{index.html,Build,TemplateData}` into `public/games/unity/`.  
Folder is ~68MB (`WebGLBuild.wasm` ~51MB alone) — GitHub may warn; use Git LFS or external host if needed.  
`vite.config.js` returns real 404s for missing `/games/*` paths (no SPA fallback).

## Large binaries (watch before push)

| Path | ~Size | Notes |
|------|-------|-------|
| `public/games/unity/` | ~68MB | WebGL build |
| `public/files/group20-additional-files.zip` | ~37MB | Chess Machine extras |
| `public/files/htmaa-exam-report.pdf` | ~8MB | Embedded in Chess Machine |
| `public/models/New-Assembly.stl` | ~1.7MB | 3D viewer |

These may still be untracked locally — confirm before `/git-push`.

## Skills in this ecosystem

| Skill | Scope | Use for |
|-------|--------|---------|
| `/git-push` | Project (`.grok/skills/git-push/`) | Commit + push to GitHub |
| `/image-to-sticker` | User (`~/.grok/skills/…`) | Die-cut sticker PNGs |
| `/update-agents-md` | User (`~/.grok/skills/…`) | Re-scan repo and refresh this file |

## Git / GitHub

- Remote: `origin` → `AllanHadzimahovic/myWebpage`
- On 403 / wrong account: `gh auth setup-git`, then retry
- No force-push unless explicitly requested

## Conventions

- Content lives in `projects.js` + `public/`
- After UI changes, verify in the browser (desktop + mobile)
- Don’t commit secrets; large binaries may need LFS
