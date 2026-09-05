# Playframe — September 2026 rebuild

## Direction

**Visual thesis:** A cinematic independent engineering studio: monumental white typography, a luminous physical-to-virtual scene, ink and mineral-white editorial layouts, and precise ultramarine interventions.

**Content plan:** A branded first-screen statement and selected-work link → three confidential training specialisms presented as editorial case studies → an interactive explanation of the connected system → real films of Hover the Edge and FlyboxVR → secondary mobile products → a direct, project-aware email/WhatsApp invitation.

**Interaction thesis:** A short, once-only opening sequence; native scrolling with a sticky system diagram that responds to explicit selections; image/arrow hover treatments and accessible project dialogs. No scroll interception, continuous WebGL render loop, autoplay carousel, or opacity tricks that obscure content.

## Non-negotiables

- Playframe is the only public-facing brand. No portrait or location footer.
- The immediate offer is production Unreal Engine and VR development, not prototyping.
- Keep approved ultramarine `#5D76FF`. Ink `#070913`, mineral `#F1F3F7` and white carry the layout.
- Healthcare, military multiplayer and emergency-response training lead the story. Apps remain secondary.
- Confidential projects use clearly labeled original visualizations, not purported client screenshots.
- Real video plays when visible, pauses offscreen, and supports an explicit play/pause control. Reduced motion is respected.
- Contact: `https://wa.me/972504931021` and `Larion1@gmail.com`.
- No invented client logos, metrics, testimonials, team size, awards or delivery promises.
- Preserve unrelated local QA files.

## Reference study

Reviewed [Magnopus](https://www.magnopus.com/) and [Dimension](https://dimensionstudio.co/) on 2026-09-05. Both connect ambitious real-time work to clear services and visible project evidence. The useful principle is confident work-first presentation, not their wording or layout copied wholesale. Playframe's distinguishing story is the whole connected training system: instructor, multiplayer, physical devices, and returning data.

## Implementation and review checklist

- [x] Replace the active application and styling with a coherent new composition.
- [x] Create a new original hero image and keep it in the repository.
- [x] Make project summaries and project detail dialogs specific and honest.
- [x] Demonstrate instructor → trainees → devices → review interactively.
- [x] Keep real films large and implement visibility-aware media playback.
- [x] Present all three real app interfaces at useful resolution.
- [x] Provide accessible navigation, dialogs, tabs, reduced-motion behavior and focus states.
- [x] Verify desktop and mobile composition, local interaction flows, and contact targets.
- [ ] Production build, publish via existing GitHub Pages pipeline, verify deployed version.

## Image generation

Method: built-in image generation, not the API/CLI fallback.

Hero prompt: A photorealistic cinematic editorial campaign image for an independent Unreal Engine and virtual-reality development studio. Wide 16:9 architectural composition. A real training participant in a plain dark technical outfit, a correctly worn unbranded VR headset and fitted haptic vest, three-quarter back profile on the right third of the image, interacting with a virtual training world. In a vast refined concrete simulation stage, an enormous rectangular projection/opening reveals a convincing sunlit architectural training environment; the physical dark floor and virtual courtyard align in perspective. A second distant instructor at a low control desk is subordinate. Late-afternoon light pours through the rectangular world, pale warm daylight against deep blue-black architecture, subtle atmosphere and soft reflected light, highly detailed materials, beautiful cinematic art direction, restrained and credible, photographed with a 35mm lens. Keep the left half calm and dark for large white website text. Show the participant from mid-thigh upwards, head entirely in frame with space above, hardware and hands anatomically correct. The key story is a real person, real equipment, and a convincing virtual environment. No text, no logos, no watermark, no neon, no holographic UI, no guns, no sci-fi armor, no floating disconnected hardware, no image collage or split-screen. Generate at high landscape resolution.

Final assets: `assets/brand/editorial/playframe-worlds-hero.webp` (99.55 kB) and `assets/brand/editorial/playframe-worlds-hero-960.webp` (32.85 kB). The source was generated with the built-in image tool and converted to optimized WebP without changing the artwork.

## Implementation and QA record

- Active entry: `src/StudioApp.tsx` and `src/studio.css`. Previous source remains inactive for reference; no old WebGL code is imported into the new site.
- Existing brand concept is reproduced as a crisp inline vector, with the approved ultramarine retained.
- Native scrolling throughout. No wheel interception, pinned page-length animation or perpetual canvas loop.
- Case studies use native dialogs. Verified clinical and military details, Escape dismissal, and focus return to the opening control.
- System selections and keyboard arrow navigation update the diagram. Verified the sequence reaches stage 4, stops, and offers replay. The mobile controls use a compact horizontal layout; descriptions have stable space to avoid repeated layout jumps.
- Both real films were observed playing on entering the viewport. Verified manual pause, expanded playback, background preview suspension while a film dialog is open, and Escape dismissal.
- Verified Lighthouse → MoneyNest → BiteSync switching and the high-resolution health-conversation screenshot for BiteSync.
- Verified mobile menu opening, anchor navigation and closing. Contact category selection produces a contextual mailto URL; WhatsApp is exactly `https://wa.me/972504931021`. No messages were sent in testing.
- Visual checks at 1440×900, 884×783 and 390×844. Overflow check at 320×740 found no overflowing content. Browser console contained no warnings or errors during the check.
- Reduced-motion styling and autoplay opt-out are implemented; no OS-level reduced-motion emulation was available during this check. This is not a claim of physical Windows-device testing.
- Added dependency-free contract tests for entry point, anchors, legacy redirects, media presence, contacts, native scrolling and image budgets.
- Keep the existing GitHub Pages deployment and domain. No migration to Sites, DNS alteration or certificate replacement is part of this redesign.
