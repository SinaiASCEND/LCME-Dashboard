# LCME Task Force Site

Mobile-enabled hub for Mount Sinai's LCME Task Force subcommittees. Member rosters, assigned LCME elements with new-DCI text and changes from 2026-27, task tracking, MEPO reference, and links to the ASCEND Curriculum Navigator.

## Deploy

This is a static site — no build step. Just upload everything to a static host (GitHub Pages, Netlify, S3, etc.).

For **GitHub Pages**:
1. Push these files to a repo (any layout works).
2. Settings → Pages → deploy from branch root.
3. Visit `https://<user>.github.io/<repo>/`.

## Files

| File | Purpose |
|---|---|
| `index.html` | Entry point — loads React, Babel, and all scripts |
| `styles.css` | All visual styling + 3 themes (Mount Sinai / Calm / Modern) |
| `data.js` | Subcommittees, members, elements, tasks, MEPOs, resources |
| `ui.jsx` | Icons, chips, tabs, localStorage hooks |
| `views.jsx` | Home / Subcommittee / Element / MEPO / Resources / Me views |
| `app.jsx` | Root component, hash router, Tweaks panel wiring |
| `tweaks-panel.jsx` | Tweaks panel framework (theme toggle, etc.) |
| `assets/` | Org chart image + DCI comparison PDF |

## Editing content

Almost all content lives in **`data.js`**:

- **Members** — `SUBCOMMITTEES[KEY].coChairs / projectManager / members`
- **Tasks** — `RAW_TASKS` array, format `[id, subcommittee, element, category, description, dueDateSerial]`
- **Element narratives** — `ELEMENTS` array: `changeLevel`, `changeSummary`, `whatChanged[]`, `whatToAddress[]`
- **MEPOs** — `MEPOS` array
- **Resources** — `RESOURCES` array

After editing, no rebuild needed — just refresh.

## Single-file bundle

If you'd prefer one self-contained HTML file (works offline, no asset paths to manage), see `lcme-task-force.html` in the parent project — same site bundled into a single file.

## Browser support

Modern evergreen browsers (Chrome/Edge/Safari/Firefox last 2 years). Uses ES2020+ features and hash-based routing.

## Privacy

Task status and roster identity persist in `localStorage` on each user's device only. Nothing is sent to a server.
