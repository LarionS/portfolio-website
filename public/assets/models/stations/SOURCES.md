# Station 01–03 model sources

These GLBs are modified derivatives of CC0 assets by Quaternius. CC0 permits
commercial use, modification, and redistribution without attribution; this file
retains author and source details for provenance.

- Characters: [Ultimate Animated Character Pack](https://quaternius.com/packs/ultimatedanimatedcharacter.html)
- Tactical characters, weapon controller, barriers, sandbags, and structure:
  [Toon Shooter Game Kit](https://quaternius.com/packs/toonshootergamekit.html)
- Ambulance: [Public Transport Pack](https://quaternius.com/packs/publictransport.html)
- Hospital exterior: [Simple Buildings Pack](https://quaternius.com/packs/simplebuildings.html)
- License: [Creative Commons CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)

The Blender pipeline in `scripts/blender/build_station_models.py` bakes selected
rig poses to static meshes, removes armatures and unused actions, replaces legacy
materials with predictable PBR materials, applies the site palette, centers each
asset on the floor, and exports cameras/lights/animation-free GLBs.

The clinical set includes separate doctor, instructor, and patient derivatives.
The patient uses a clean static source pose rotated horizontally in the scene;
no procedural capsule mannequin is used.

The headset used on the website is original, logo-free geometry authored in the
React Three Fiber scene. No branded headset mesh is included.
