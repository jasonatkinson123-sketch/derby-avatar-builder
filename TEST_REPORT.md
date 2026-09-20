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

Browser results will be recorded here after the proof branch is available through a non-production preview URL.

## Visible proof limitations

- This is a four-instrument proof, not the final sixteen-instrument catalog.
- Faces share one base geometry and one expression; production expansion should add a small set of compatible feature variants.
- Each instrument has a dedicated pose kit, but one base torso geometry is shared across clothing types.
- Hair/headwear and clothing have the requested proof palettes only.
- Pixel proportions intentionally favor classroom-card readability over anatomical detail.
- The art-direction source is useful for style reference, but each modular runtime asset still needs human review before a final student release.
