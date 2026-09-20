# Derby Band Avatar Builder — visual proof

This branch is a non-production, four-instrument proof of a layered pixel-art system for the student-facing Derby Band Avatar Builder. It collects no names or student information, stores nothing, and has no backend.

The production site is intentionally unchanged. Do not merge this proof into `main` or deploy it to GitHub Pages until its artwork has been approved.

## Proof catalog

- Four skin palettes: light, medium, warm brown, and deep
- Textured curls, high ponytail, shoulder-length locs, and hijab
- Three natural hair palettes and three headwear palettes
- T-shirt, sweatshirt, and hoodie in navy, teal, mustard, and coral
- Alto saxophone, flute, four-string electric bass, and mallets/bells
- Turquoise, coral, deep blue, and mint backgrounds

Every avatar is assembled at runtime from transparent PNG layers in `assets/`. Canvas is used only to recolor those controlled layers, composite them, and export a crisp 512 × 512 PNG.

## Preview locally

From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. An HTTP server best matches repository-subdirectory hosting.

## Proof artifacts

- `proof/proof-contact-sheet.png` — twelve cross-combinations
- `proof/classroom-cards-96.png` — the same combinations at 96 × 96
- `proof/classroom-cards-64.png` — the same combinations at 64 × 64
- `proof/browser-chromebook-1366x768.png` — real Chromium Chromebook-layout evidence
- `proof/browser-mobile-390x844.png` — real Chromium narrow-screen evidence
- `proof/verified-band-avatar.png` — PNG produced by the browser download control
- `assets/manifest.json` — machine-readable asset metadata
- `ARTWORK.md` — grid, palette, layer, and extension guidance
- `TEST_REPORT.md` — verification results and limitations

## Regenerating the proof assets

The checked-in PNG files are the website's runtime assets. Their editable source is `tools/generate_assets.py`, which requires Pillow. Regenerate the library and proof sheets with:

```bash
python3 tools/generate_assets.py
python3 tools/render_proof.py
```

The image in `assets/reference/` is an original AI-assisted art-direction study. It is not displayed by the application and is not used as a flattened avatar.

## Browser verification

The proof branch contains an isolated GitHub Actions workflow that runs only for `codex/verify-avatar-builder`. It starts the static site locally on the runner, tests it in real Chromium, and retains screenshots plus the downloaded PNG as build evidence. It does not deploy the site or alter GitHub Pages.

## Student workflow if approved later

Student builds avatar → downloads `band-avatar.png` → attaches it in Google Classroom → teacher uploads it manually in Character Cash.
