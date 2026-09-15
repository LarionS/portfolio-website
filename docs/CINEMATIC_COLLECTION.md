# Cinematic collection

The user selected the first visual concept with Car → Helicopter → Boat → Jet ski → Motorcycle ordering. `src/templates.json` is the canonical product order; the catalogue, homepage showcase, related links and structured list use it.

`CinematicShowroom.tsx` provides the hero, shared selection, actual gameplay and matching product headers. `cinematic.css` loads after existing template styles. Public campaign images are promotional artwork, separate from the original product gallery and footage.

## Asset generation

Built-in ImageGen was used with inspected original vehicle references and the selected design image. Files live in `public/assets/templates/*-campaign.webp`, with `*-campaign-small.webp` responsive siblings. No API/CLI image model was used. Routine WebP compression used Pillow.

Shared prompt: cinematic photographic promotional website background, preserve the supplied product's identity and colors, subject lower-right, broad calm dark left for white headline, natural warm sunset, navy shadows, no text, UI, logos, neon or holograms.

- Car: supplied blue open-top angular sports car, orange cockpit, black wheels, coastal asphalt, front three-quarter composition.
- Helicopter: supplied blue Compact Scout, pale seats, bubble canopy, thin white stripe, airborne above a mountain airfield.
- Boat: blue-white runabout and outboard, turquoise water and a rocky sunset coastline.
- Jet ski: red ReferenceCraft, black saddle, bow insert, exposed handlebars, ocean and sunset island.
- Motorcycle: silver-white/black bike and helmeted rider on coastal road; promotional interpretation grounded in the available small exterior reference.

Actual car trailer downloaded from the product's public Drive media and encoded to VP9/Opus. Boat and helicopter footage preserved. All trailers load on demand. No autoplay video or scroll interception was added.
