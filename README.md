# Derby Band Avatar Builder

A standalone, student-facing 8-bit band-avatar creator. It is a static site: it collects no names or student information, stores nothing, and has no backend. Students download `band-avatar.png` and submit it through the teacher's Google Classroom assignment.

## Preview locally

Open `index.html` in a modern browser. For the closest behavior to GitHub Pages, serve this folder with any simple local static server.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `derby-band-avatar-builder`.
2. Upload the contents of this folder (not the folder itself) to the repository root.
3. In the repository, open **Settings → Pages**.
4. Set **Source** to **Deploy from a branch**, choose `main`, then choose `/ (root)`.
5. Save. GitHub will provide the public URL after it deploys.

## Classroom workflow

Post the site link in a Google Classroom assignment. Each student creates an avatar, chooses **Download Avatar**, then attaches the downloaded PNG to that assignment. The teacher can manually assign each submitted image to the matching Character Cash student card.

## Technical notes

- Plain HTML, CSS, and JavaScript; no dependencies, APIs, analytics, fonts, accounts, or data collection.
- The 64 × 64 pixel-art source canvas is rendered with nearest-neighbor scaling and exported as a crisp 512 × 512 PNG.
- The controls are keyboard accessible and responsive for Chromebook and smaller screens.
