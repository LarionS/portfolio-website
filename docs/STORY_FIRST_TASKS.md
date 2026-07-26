# Story-first rebuild execution list

This checklist implements [`STORY_FIRST_REBUILD.md`](./STORY_FIRST_REBUILD.md). A task is complete only after runtime and visual verification.

**Execution status:** complete and verified locally on 27 July 2026. The production build, responsive review, interaction pass, state persistence checks, console review, and before/after visual comparison all passed. Publishing remains intentionally separate and requires explicit approval.

## P0 — Narrative architecture

- [x] Move station interaction state into one shared React owner and pass typed controls into WebGL worlds.
- [x] Replace event-bus/local-state drift so returning to a lazily mounted station preserves the displayed state.
- [x] Reduce every station to one headline, one proof line, and one visual action.
- [x] Author distinct transition arcs and destination camera intent.

## 01 — Clinical

- [x] Install the new clinical cinematic reconstruction as the dominant evidence layer.
- [x] Reframe to trainee point of view with patient/bed/monitor as one readable composition.
- [x] Make patient sensors, vitals, room light, and instructor timeline respond together.
- [x] Keep wheelchair as a cropped scale cue only.
- [x] Verify stable, deteriorating, intervention, and recovered visual states.

## 02 — Tactical

- [x] Install the new connected-system reconstruction.
- [x] Render all six trainee nodes and the instructor console simultaneously.
- [x] Visualize dispatch → six trainees → wearable/equipment/haptics → telemetry return.
- [x] Replace generic “scenario” cycling with selection of one complete trainee path.
- [x] Confirm system remains fictional, unbranded, and confidentiality-safe.

## 03 — Emergency

- [x] Install a new multi-role fictional reconstruction with police, fire, and medical readable at a glance.
- [x] Remove toy cones / dominant hose ring / prop-first composition.
- [x] Animate sequential role deployment and one shared containment outcome.
- [x] Let smoke, incident energy, route color, responders, and scene lighting react together.

## 04 — Hover The Edge

- [x] Recut a 1080p owner-footage micro-trailer from the uploaded source.
- [x] Build and export an original web-ready hoverboard GLB in Blender with source script and provenance.
- [x] Replace the spaceship with a camera-bound board and first-person carving response.
- [x] Make footage occupy 70–80% of the visual hierarchy.
- [x] Add lean, press-and-hold boost, route pickups, and artifact objective without hijacking mobile scroll.

## 05 — FlyboxVR

- [x] Make the real video the largest, most frontal visual surface.
- [x] Remove the dominant procedural ring/mannequin show.
- [x] Keep tunnel/fan/airflow geometry as edge parallax props only.
- [x] Ensure any body silhouette is prone and face-down.
- [x] Link the flight action to video scale/light, airflow speed, and body position.

## 06 — Apps

- [x] Replace the BiteSync Hebrew texture with the German source.
- [x] Implement three unique relative carousel slots for every focus index.
- [x] Keep all phones visible and out of the copy column during transitions.
- [x] Share focus state between DOM and WebGL and verify re-entry.

## 07 — Contact

- [x] Remove the location line.
- [x] Replace the six-sphere constellation with an interactive three-part assembly/launch object.
- [x] Connect pointer, keyboard, and reduced-motion completion states to the contact CTA.
- [x] Verify the visual never touches the headline at desktop or mobile widths.

## QA

- [x] Typecheck and production build.
- [x] Inspect runtime console; remove project-owned errors and actionable warnings.
- [x] Capture every station at the available desktop review viewport and at 390 × 844.
- [x] Compare each result against the matching baseline in one visual review input.
- [x] Test all narrative actions, rapid repeated actions, station exit/re-entry, and phone selection.
- [x] Test keyboard flow, focus visibility, `aria-live` feedback, reduced motion, and mobile vertical scrolling.
- [x] Review asset dimensions, encoding, load behavior, and commercial-use provenance.
- [x] Commit the verified local release without publishing until explicit approval.
