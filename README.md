# Derby Band Avatar Builder

A standalone, student-facing 8-bit band-avatar creator. It is a static site: it collects no names or student information, stores nothing, and has no backend. Students download `band-avatar.png` and submit it through the teacher's Google Classroom assignment.

Live site: https://jasonatkinson123-sketch.github.io/derby-avatar-builder/

Repository: https://github.com/jasonatkinson123-sketch/derby-avatar-builder

## Preview locally

Open `index.html` in a modern browser. For the closest behavior to GitHub Pages, serve this folder with any simple local static server.

## GitHub Pages deployment

This repository is configured for GitHub Pages from `main` at `/ (root)`. Updates pushed to `main` deploy to the live URL above. If you upload this backup to a different repository, choose **Settings → Pages → Deploy from a branch**, then select `main` and `/ (root)`.

## Classroom workflow

Post the site link in a Google Classroom assignment. Each student creates an avatar, chooses **Download Avatar**, then attaches the downloaded PNG to that assignment. The teacher can manually assign each submitted image to the matching Character Cash student card.

## Technical notes

- Plain HTML, CSS, and JavaScript; no dependencies, APIs, analytics, fonts, accounts, or data collection.
- The 64 × 64 pixel-art source canvas is rendered with nearest-neighbor scaling and exported as a crisp 512 × 512 PNG.
- Reusable hair, clothing, face, hand, and instrument layers are drawn in `app.js` on a shared 64 × 64 grid. There is no `assets/` folder because the artwork is code-drawn rather than stored as separate images.
- The controls are keyboard accessible and responsive for Chromebook and smaller screens.
