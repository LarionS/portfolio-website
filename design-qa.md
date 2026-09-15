# Cinematic collection design QA

Date: 2026-09-15. Selected target: first displayed ImageGen result, `exec-4a565f15-6a8f-4b1a-aa8a-a27d16e007da.png`. User explicitly changed the vehicle order to Car, Helicopter, Boat, Jet ski, Motorcycle.

## Evidence and comparison

Compared the selected reference and rendered implementation together in `../design-comparison-final.jpg`, preserving image aspect ratios. Reference native 1003×1568; implementation captured at 1440×1000 CSS viewport, with the first 2200px of the full page normalized to 720px wide for comparison. Hero height adapts to the viewport rather than matching the tall reference literally. Actual car footage replaces illustrative boat footage, and the car leads per user instruction.

Focused desktop hero and 390×844 mobile catalogue/car product views were opened separately at readable size. Evidence: `../premium-desktop-final.png`, `../premium-phone.png`. No horizontal mobile overflow. Original source and new promotional vehicle assets were inspected. Assets remain clearly described as promotional artwork; in-engine galleries and trailers are separate.

## Iterations

- P2: Initial display typography was smaller than the visual target. Increased desktop headline from 7.8vw to 9vw and supporting mono copy to 16px; confirmed wrapping in the new capture.
- P2: Larger typography pushed thumbnail labels below the fixed hero. Reduced lower copy padding from 170px to 60px; the final capture shows all five labels, active underline and bottom collection link.
- P2: Independent hero and gameplay selection could show the wrong film. Lifted selection into the catalogue and verified vehicle selection changes both sections.

## Required fidelity surfaces

- Typography: Inter Tight variable and IBM Plex Mono; monumental two-line heading, restrained mono captions. Font loading, wrapping and readable primary CTA checked at desktop and phone widths.
- Layout: full-bleed hero, slim overlaid navigation, lower thumbnail row, contrasting editorial gameplay section and large alternating product stories. Small-screen layout preserves all five selectors.
- Color: existing blue-black, mineral white and ultramarine tokens retained. White primary action and active blue underline follow the chosen reference.
- Images: optimized campaign assets, responsive sizes, eager lead image and lazy supporting images. Car artwork positioned at 72% to keep the vehicle inside the desktop crop. Gameplay uses native video aspect fitting to preserve controls rather than crop evidence.
- Copy: selected headline retained. Verified product descriptions, Fab URLs, dependencies and demo resources retained. No invented prices, testimonials or metrics.

## Functionality

Verified car/boat selection, keyboard navigation implementation, linked car page, film playback (61.01s duration, observed advancing beyond 39s), pause control, mobile rendering, and browser console with no warnings/errors. Gameplay and hero tabs share selection. Offscreen/hidden video pauses. Reduced motion removes the entry animation; no film autoplays. Existing gallery lightbox and download paths preserved.

Production build and all eight tests pass. Tests cover crawlable pages, metadata, local links, anchors, product media and demo/Fab resources.

No outstanding P0/P1/P2 findings. P3: additional art-directed portrait assets could further improve mobile vehicle framing; current crop is usable and intentional.

final result: passed
