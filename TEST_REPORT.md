# Visual proof test report

## Automated asset checks

- All 29 runtime PNG layers open as 128 × 128 RGBA images.
- All four pose families have rear, rear-arm, instrument, and front-arm layers.
- The twelve-combination contact sheet renders from the same files and palette rules used by the web application.
- Separate 96 × 96 and 64 × 64 classroom-card sheets reopen successfully.

## Visual review

The twelve-sheet review includes every proof skin tone, hairstyle/head covering, clothing style, clothing color, background, and instrument. It explicitly includes:

- Deep skin + curls + coral hoodie + flute
- Light skin + hijab + navy sweatshirt + alto saxophone
- Warm brown skin + ponytail + mustard T-shirt + electric bass
- Medium skin + locs + teal hoodie + mallets/bells

Facial features were separated into a contrast layer after the initial small-card review showed that dark hair could hide expressions. The revised 64 × 64 sheet keeps faces, hair silhouettes, shirt colors, and all four instrument families distinguishable.

## Browser verification

The proof passed an isolated real-Chromium verification run on a GitHub-hosted Ubuntu runner. The workflow is restricted to `codex/verify-avatar-builder`; it does not deploy the site, merge branches, or update GitHub Pages.

Successful workflow: [Proof browser verification — run 35518588265](https://github.com/jasonatkinson123-sketch/derby-avatar-builder/actions/runs/35518588265)

Verified in Chromium:

- All twelve representative cross-combinations rendered as twelve distinct canvases.
- Skin and shirt palette colors reached the composed body parts and pose-specific sleeves.
- Instrument changes preserved skin, hair/headwear, hair color, and clothing.
- Randomize Look preserved the selected instrument.
- Undo restored an instrument change.
- Start Over opened the accessible confirmation dialog and restored the documented default.
- Arrow-key tab navigation moved both selection and keyboard focus.
- The 1366 × 768 layout kept the preview beside the controls with no horizontal overflow.
- The 390 × 844 layout stacked the preview and controls with no horizontal overflow.
- Download produced `band-avatar.png` as a valid 512 × 512 PNG.
- Every exported 4 × 4 pixel block matched its corresponding live-preview pixel, confirming exact nearest-neighbor output.
- The browser reported zero application console errors or uncaught page errors.

Permanent evidence is checked into `proof/browser-chromebook-1366x768.png`, `proof/browser-mobile-390x844.png`, and `proof/verified-band-avatar.png`.

Additional checks:

- JavaScript syntax validation with `node --check app.js`
- `git diff --check`
- Manifest/path completeness for all 29 runtime PNG layers
- Image format and dimension validation for every runtime asset
- Deterministic rendering and reopening of twelve cross-combinations at 128, 96, and 64 pixels
- Manual visual inspection of the contact sheet, both classroom-card sheets, and both browser screenshots

## Visible proof limitations

- This is a four-instrument proof, not the final sixteen-instrument catalog.
- Faces share one base geometry and one expression; production expansion should add a small set of compatible feature variants.
- Each instrument has a dedicated pose kit, but one base torso geometry is shared across clothing types.
- Hair/headwear and clothing have the requested proof palettes only.
- Pixel proportions intentionally favor classroom-card readability over anatomical detail.
- The art-direction source is useful for style reference, but each modular runtime asset still needs human review before a final student release.
