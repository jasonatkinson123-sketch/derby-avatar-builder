# Artwork system

## Grid and alignment

All runtime artwork uses a shared 128 × 128 transparent canvas and the same `[0, 0]` anchor. The authoring script draws on a 64 × 64 logical grid and enlarges each logical pixel to 2 × 2 source pixels with nearest-neighbor scaling. The browser composites at 128 × 128, shows that canvas with `image-rendering: pixelated`, and enlarges it to 512 × 512 for export with image smoothing disabled.

No character body part or instrument is drawn with HTML or CSS at runtime. The only programmatic visual is the selected solid background.

## Runtime layer order

1. Solid background
2. Rear hair or rear headwear
3. Rear pose detail, such as a neck or shoulder strap
4. Base clothing
5. Neck, ears, and face base
6. Front hair or front headwear
7. High-contrast facial features
8. Pose-specific rear sleeve, arm, and hand
9. Instrument
10. Pose-specific front sleeve, arm, and hand

Facial features are intentionally a separate foreground layer. This keeps the expression legible at 64 × 64 without flattening the face, hair, or headwear into one picture.

## Palette system

Skin, clothing, hair, and headwear PNGs use three exact marker colors for base, shadow, and highlight. `app.js` replaces only those marker colors with a selected three-color palette. Outlines and intentional detail colors are left unchanged, so recoloring cannot wash out shading or instrument detail.

Pose-specific arms contain both skin markers and clothing markers. Therefore the selected skin affects hands and arms, while the selected clothing color affects pose sleeves. Headwear uses the same three-slot artwork channel as hair but chooses from a separate palette list.

The marker colors and every available asset are documented in `assets/manifest.json`.

## Pose-kit architecture

Each instrument has a named pose family under `assets/poses/`:

- `rear.png` — straps or other elements behind the body
- `arms-rear.png` — the arm/hand behind the instrument
- `arms-front.png` — the arm/hand in front of the instrument

The finished instrument is a separate transparent layer under `assets/instruments/`. Hair, face, and base clothing remain independent when an instrument changes. This lets one student appearance move between all four proof instruments while loading only the pose-specific arms, sleeves, hands, strap, and instrument.

## Adding a hairstyle or head covering

1. Author rear and front transparent PNGs on the 128 × 128 grid.
2. Keep the central eye and mouth region clear enough for the feature layer.
3. Use the three hair marker colors if palette recoloring is required.
4. Add both files to `assets/manifest.json` and the option metadata in `app.js`.
5. Test the silhouette on light and deep skin at 128, 96, and 64 pixels with all four pose families.

## Adding an instrument

1. Design the instrument around its real playing position; do not reuse an unsuitable generic arm pose.
2. Create the instrument PNG plus rear, rear-arm, and front-arm pose layers.
3. Use skin and shirt marker colors in exposed hands and pose-specific sleeves.
4. Add manifest records with the new compatible pose family and add its option in `app.js`.
5. Check hands, face clearance, silhouette, and instrument identity at 64 × 64 and 96 × 96 on every hair/headwear family.

## Art-direction source

`assets/reference/instrument-style-source.png` is an original AI-assisted study used to establish warm pixel shading and recognizable instrument detail for the four proof kits. It is not a runtime layer and is never shown behind controls. The checked-in modular PNGs were standardized and redrawn on the shared grid by `tools/generate_assets.py`.

## Estimated full-catalog expansion

The remaining twelve instruments would require approximately 48 core pose/instrument PNGs (instrument, rear, rear arm, front arm per instrument), plus roughly 8–16 corrective overlays for instrument-specific grips, bells, straps, or occlusion. Expanding from four to sixteen hair/headwear choices would add about 24 rear/front PNGs. Allowing for validation variants and polish, the complete builder is likely to need about **80–110 additional production assets** beyond this proof.
