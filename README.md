# LCME Task Force Site

Mobile-enabled hub for Mount Sinai's LCME Task Force subcommittees.

**What's inside:**
- Membership directory (all members + per-subcommittee filters)
- Full 2027–28 DCI: 12 standards → elements → narrative questions, tables, supporting docs
- Independent Student Analysis (ISA) survey items by domain
- Element-level task tracking (status saved locally)
- Cross-document search (DCI + ISA)
- Sticky bottom nav: Search · DCI · Members · Saved
- ASCEND palette: Cyan #00AEEF primary, Magenta #D80B8C accent, Barlow type

## Deploy

Static site, no build step. Push to any static host.

**GitHub Pages:**
1. Push every file in this folder to a repo.
2. Settings → Pages → deploy from branch root.
3. Visit `https://<user>.github.io/<repo>/`.

## Files

| File | Purpose |
|---|---|
| `index.html` | Entry point — loads React, Babel, all scripts, Google Fonts |
| `styles.css` | All styling — ASCEND palette + 2 alternate themes (Calm, Modern) |
| `data.js` | Subcommittees, members, task list, MEPOs, resources |
| `dci-data.js` | Parsed 2027–28 DCI: 12 standards, ~83 elements, narratives, tables, docs |
| `isa-data.js` | ISA survey items by domain |
| `ui.jsx` | Icons, chips, tabs, localStorage hooks |
| `views.jsx` | Home / Subcommittee / Element / MEPO / Resources / Saved views |
| `docs.jsx` | DCI / ISA / Membership views + document search |
| `app.jsx` | Root, hash router, breadcrumbs, bottom bar, search overlay, Tweaks |
| `tweaks-panel.jsx` | Tweaks panel framework (visual theme toggle) |
| `assets/` | Governance org chart + DCI comparison PDF |

## Editing content

Most content lives in `data.js`:

- **Members** — `SUBCOMMITTEES[KEY].coChairs / projectManager / members`
- **Tasks** — `RAW_TASKS` array: `[id, subcommittee, element, category, description, dueDateSerial]`
- **Element change notes** — `ELEMENTS` array
- **MEPOs** — `MEPOS` array

To update the DCI or ISA content, edit `dci-data.js` or `isa-data.js` directly (they're plain JSON inside a JS assignment).

No rebuild needed — just refresh the browser.

## Browser support

Modern evergreen browsers. Uses ES2020+, hash-based routing, CSS custom properties, `env(safe-area-inset-bottom)` for iOS notch.

## Privacy

Task status and theme preference persist in `localStorage` only. Nothing leaves the device.
