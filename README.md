# Playframe — Immersive Systems Portfolio

A guided, six-chapter portfolio journey for Playframe's Unreal Engine, VR, connected-training, physical-experience, and mobile-product work.

## Tech

- React + TypeScript
- Three.js via React Three Fiber
- Vite
- GitHub Pages (via GitHub Actions)

## Local preview

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, then run `npm test`.

## VR template collection

The homepage showcases five VR vehicle templates. `/templates/` contains the catalogue, with an individual page for each product. These pages are pre-rendered at build time for direct visits, search indexing and link previews. Edit `src/templates.json` for content and public demo/Fab links. See [collection documentation](docs/VR_TEMPLATE_COLLECTION.md) for media sources and maintenance.

## Deploy

Push to `main` and GitHub Actions will deploy to GitHub Pages automatically.

Only optimized, public-safe assets are tracked. Private reference footage, legacy pages, the portrait, résumé, and source-quality media remain local and are excluded from the repository.
