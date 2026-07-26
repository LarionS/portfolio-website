# Playframe premium-polish execution list

This checklist translates the findings in [PREMIUM_POLISH_AUDIT.md](./PREMIUM_POLISH_AUDIT.md) into build work. A task is complete only when its acceptance criteria are verified, not merely when code exists.

## P0 — Correct the visual system

- [x] **Unify floor datum and remove global occlusion**
  - Recess or narrow `FacilitySpine`; let each scene own its contact floor.
  - Confirm all hero subjects have visible ground contact and no cross-section clipping.
- [x] **Author chapter-specific cameras**
  - Replace distant survey views with intentional three-quarter / low / over-shoulder shots.
  - Create dedicated mobile cameras with tighter framing and a narrower effective composition.
- [x] **Rebalance the signal system**
  - Lower its idle hierarchy, keep it off hero evidence, and vary its behavior by chapter.
- [x] **Rebuild scene lighting hierarchy**
  - Unique key/rim/practical palette per world; sufficient mobile contrast; controlled reflections.
- [x] **Make real proof dominant**
  - Enlarge and flatten Hover / Flybox video viewing angles.
  - Increase phone scale and screen contrast.

## P1 — Upgrade every world

- [x] **Arrival: replace the generic demo-orb impression**
  - Create a deliberate boot / signal object and reveal meaningful journey depth.
  - Remove mobile copy collisions and dead lower-space composition.
- [x] **Clinical: create a credible anonymized training bay**
  - Upgrade bed / monitor / equipment silhouette with commercially safe real meshes or a genuine sourced asset.
  - Add a readable vital display and meaningful alert response.
  - Add accessible state feedback.
- [x] **Tactical: show the connected system, not toy soldiers**
  - Upgrade participant silhouettes and one hero equipment station.
  - Make six-person state, instructor event, and telemetry return readable.
  - Show an actual dashboard/tablet evidence surface.
- [x] **Emergency: rebuild the weakest credibility moment**
  - Replace box vehicle and mannequin responders with credible silhouettes.
  - Add incident-source, smoke, wet-ground response light, and controlled route/hose emphasis.
- [x] **Hover: turn gameplay into the hero**
  - Use a credible craft mesh / silhouette and authored canyon foreground.
  - Introduce low chase framing, parallax, dust, and a meaningful boost interaction.
- [x] **Flybox: make the chamber feel engineered**
  - Upgrade fan / ring / panel construction with a credible mesh anchor.
  - Compose body, airflow, and footage as one shot.
- [x] **Apps: make each shipped product discoverable**
  - Focus one phone at a time; sharpen material / screen response.
  - Name and position Lighthouse / Nomad Home, MoneyNest, and BiteSync.
- [x] **Finale: create a true commissioning moment**
  - Replace the repeated hero orb and oversized CTA slab.
  - Fix mobile headline breaks, secondary contact hierarchy, and complete-state numbering.

## P1 — Content and interaction

- [x] Rewrite chapter copy around systems, constraints, outcomes, and real integrations without restricted claims.
- [x] Give every scene action a narrative state change and persistent visible label.
- [x] Announce state changes accessibly and expose selected / pressed state where appropriate.
- [x] Preserve a clear journey: serious training credibility → technical depth → experiential range → contact.

## P2 — Finish and performance

- [x] Optimize imported GLB geometry, materials, textures, and draw calls.
- [x] Add or update third-party notices with source, creator, license, and modification details.
- [x] Reduce repeated geometry/material allocation and lazy-load heavy chapter assets.
- [x] Refine particles, reflections, fog, bloom, contact shadows, and transition easing without obscuring proof.
- [x] Remove actionable runtime warnings, including obsolete clock usage if owned by project code/dependencies.
  - Runtime has no errors. The remaining `THREE.Clock` deprecation is emitted by React Three Fiber's internal store, not project code; it is recorded as an upstream dependency warning rather than hidden or patched in `node_modules`.
- [x] Ensure scene actions cannot leave confusing state after chapter changes.

## QA and deployment

- [x] Run TypeScript and production build.
- [x] Compare before/after desktop captures at 1440 × 900 for all eight states.
- [x] Compare before/after mobile captures at 390 × 844 for all eight states.
- [x] Test keyboard-only traversal and visible focus.
- [x] Test reduced-motion behavior and stable video fallback.
- [x] Inspect console errors/warnings and loaded asset sizes.
- [x] Verify email, WhatsApp, chapter navigation, and scene-action controls.
- [x] Commit intentionally, publish `main`, and verify the production URL with a cache-busting query.
  - Verified on 26 July 2026 at `https://playframe.qd.je/?v=0feeb45277d440a57cac7ad55a2d1f8322b8c4cb`.
