# VR vehicle collection

Added September 15, 2026. The live Fab publisher page was checked directly because search results contained an older catalogue. Five vehicle products were live: boat, helicopter, car, jet ski and motorcycle v2. No spaceship product is advertised.

## Content and routes

- Product content and public Fab/Google Drive links: `src/templates.json`.
- Shared homepage showcase, catalogue and product components: `src/Templates.tsx`.
- The existing studio homepage retains its design and project content, with a new vehicle showcase and navigation links.
- `/templates/` is the catalogue. Each product has `/templates/<slug>/`.
- The production build renders six HTML pages with full content, unique titles/descriptions, canonical links, social metadata and JSON-LD. The sitemap is generated at build time.
- Prices and checkout remain on Fab to avoid stale prices, currency or promotion information.
- In development, Vite routes template paths to the separate template entry point. In production, GitHub Pages serves real directory index files, including direct visits and refreshes.

## Public media

All site media lives in `public/assets/templates/`. Only public product images and completed public trailers are included; no plugin source, private records or source project files are published.

Boat images are frames from the publisher's 1.0.1 release trailer. Gameplay and hand motion use scripted inputs; this is stated on the product page. Helicopter images and trailer come from the publisher's 1.0.0 release media. Car, jet ski and motorcycle screenshots were retrieved from the full-size public Fab galleries, not their 160-pixel thumbnail previews.

Images are compressed WebP, with small variants for the leading image. Original aspect ratios are retained in the detail gallery; catalogue/showcase slots may crop for layout. The boat and helicopter trailers are browser-compatible VP9/Opus WebM transcodes with original duration and audio. They load on demand (`preload="none"`) and never autoplay. Other product pages link to their published Fab trailer or YouTube showcase.

Boat trailer music: “Dream Culture” by Kevin MacLeod, https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046, licensed CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. Edited excerpt with fades and adjusted level, used in the trailer only. Credit appears in the video and on the boat page. Media is included for the owner's website; this does not grant reuse rights to site visitors.

## Maintenance

When adding a vehicle, update the data, images, public-resource links and collection count copy. Verify that the listing is live and that demo links point to public demo packages, not paid source archives. Run `npm run build` and `npm test`; verify desktop/mobile appearance and actual image/video playback. Push to `main` to publish through the existing GitHub Pages workflow.
