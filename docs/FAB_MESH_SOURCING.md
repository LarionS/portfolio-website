# Fab Mesh Sourcing Manifest

**Status:** Sourcing complete; production export and optimization pending  
**Date:** 2026-07-27  
**Scope:** Meshes and source packs for the approved immersive journey rebuild  
**Constraint:** Owned or free assets only. No purchases, carts, paid license tiers, or checkout actions.

---

## 1. Decision summary

The website should not become a collage of marketplace assets. The selected approach is:

1. Use three owned, realistic environment packs as raw source material for stations 01–03.
2. Extract only the small number of modules visible in each authored camera path.
3. Use direct-format GLB/FBX assets for the objects that explain the system: headset, clinical equipment, responder props, ambulance, and role silhouettes.
4. Build confidential or brand-sensitive devices in-house as neutral digital-twin props: instructor UI, tracked training weapon, watch, haptic vest, LAN hardware, and simulation mannequin.
5. Preserve the existing original hoverboard and give FlyboxVR's real video priority over decorative meshes.

This produces a coherent designed world while avoiding generic sci-fi imagery, inaccurate uniforms, uncanny people, and visually expensive geometry that does not advance the story.

---

## 2. License rules

### Fab Standard License

Fab's Standard License permits commercial and private use, modification, use with compatible tools beyond Unreal Engine, and distribution when the asset is incorporated into a project. It does not permit resale or free redistribution of the asset as a standalone product.

Source: <https://www.fab.com/eula?lang=en>

### Creative Commons Attribution 4.0

The selected CC BY 4.0 assets may be adapted and used commercially, but attribution must be retained. Attribution will live in a small site credits/legal surface and in the internal asset manifest.

Source: <https://creativecommons.org/licenses/by/4.0/>

### Repository rule

Raw marketplace source files must not be committed to a public repository. Only optimized, transformed runtime derivatives that are embedded in the website experience should be shipped, and only when the license allows that use. Source archives and Unreal projects remain outside the public repository.

---

## 3. Approved source set

### Station 01 — Clinical decision training

#### Primary environment: Hospital

- Listing: <https://www.fab.com/listings/b4f6e0e9-5d9e-4291-b04f-f145ca199762>
- Publisher: Blue Dot Studios
- Library status: Already owned
- License: Fab Standard License
- Source format: Unreal Engine complete project
- Supported versions: UE 5.1–5.7
- AI disclosure: Generated with AI — No
- Use: Room shell, bed, wall rail, bedside equipment, monitor housing, cart, glazing, sockets, ceiling fixtures
- Production treatment: Rebuild one compact training bay from a small subset; replace all listing/client-like screens and branding with original interfaces
- Risk: UE-only source; requires export, material baking, mesh reduction, and texture consolidation
- Decision: **Approved — visual backbone**

#### Secondary equipment: Medical Equipment

- Listing: <https://www.fab.com/listings/08e7a2a1-dcd4-43c3-b1d0-1729eb8ea863>
- Publisher: a9908244
- Library status: Added to My Library on 2026-07-27
- License: CC BY 4.0
- Formats: GLB, glTF, USDZ
- Download size: 24.52 MB for converted GLB
- AI disclosure: Generated with AI — No
- Use: Candidate bed, scanner/console, computer, or cart when cleaner web conversion is preferable to the UE pack
- Production treatment: Use individual objects only; repaint the blue/white palette; replace all displays; simplify materials
- Decision: **Approved — direct-format fallback and prop donor**

#### Trainee representation: Casual Characters Pack FREE

- Listing: <https://www.fab.com/listings/41894633-7d07-4279-8303-d462f5da91db>
- Publisher: IZIGAMES
- Library status: Already owned
- License: Fab Standard License
- Formats: GLB, FBX, OBJ, Blender, Unreal, Unity
- Character count: 5 rigged humanoids; Mixamo-compatible
- AI disclosure: Generated with AI — No
- Use: One restrained trainee silhouette or hand/pose donor; optional background role silhouettes
- Production treatment: Neutral monochrome material, simplified face treatment, original clothing colors, no cartoon close-up
- Decision: **Approved conditionally — silhouette/background only**

#### HMD: VR Headsets

- Listing: <https://www.fab.com/listings/84f93ed5-dd4f-4f17-aba9-c85548765c35>
- Publisher: RamananTitus
- Library status: Added to My Library on 2026-07-27
- License: CC BY 4.0
- Format: FBX archive, 3.43 MB, 2K textures
- AI disclosure: Generated with AI — No
- Use: Physical HMD on trainee and one instructor-side equipment cue
- Production treatment: Retopology only if needed; compress textures; remove brand-like markings
- Decision: **Approved**

#### Patient/mannequin

- Source: In-house mesh, not a marketplace human
- Use: Deliberately synthetic articulated simulation mannequin with subtle breathing/posture states
- Reason: A custom neutral mannequin is more credible for the confidentiality-safe reconstruction than a generic realistic patient or an uncanny generated human
- Decision: **Build in-house**

---

### Station 02 — Connected multi-user training

#### Primary environment: Military Training Facility

- Listing: <https://www.fab.com/listings/786d44bb-41fb-446a-b786-560d57edcef4>
- Publisher: Dekogon Studios
- Library status: Already owned
- License: Fab Standard License
- Source format: Unreal Engine complete project
- Supported versions: UE 4.26–4.27 and 5.0–5.7
- Contents: 173 environment meshes plus 176 pipe/vent meshes; modular PBR construction
- AI disclosure: Generated with AI — No
- Use: Training bay shell, partitions, floor/ceiling system, instructor platform, industrial railings, cable/vent details
- Production treatment: Assemble an original six-bay cutaway; remove Redhawk/listing branding; export only camera-visible modules; bake 4K sources down to a few shared 1K–2K atlases
- Risk: Heavy source textures and Unreal-only delivery
- Decision: **Approved — visual backbone**

#### Six trainee bodies: Military Mercenary Bandit

- Listing: <https://www.fab.com/listings/c726acc3-9849-4af9-8d30-cc7b0f62e6a7>
- Publisher: Abandoned World
- Library status: Already owned
- License: Fab Standard License
- Formats: GLB/glTF/USDZ conversions, Blender, FBX, OBJ, Unreal, Unity
- AI disclosure: Generated with AI — No
- Use: Rig/silhouette source for six countable trainees
- Production treatment: Strip post-apocalyptic/Russian styling, weapons, insignia, dirt, and original colors; use one shared skeleton and instanced material variants; keep faces secondary
- Decision: **Approved conditionally — only after neutralization**

#### HMD: VR Headsets

- Reuse the CC BY 4.0 asset selected for station 01
- Decision: **Approved — shared asset**

#### Instructor tablet

- Source: In-house neutral device mesh
- Reason: The free rugged-tablet listing requires a license-tier selection and was not acquired under the no-purchase rule. A simple accurate tablet shell with an original live interface is lower risk and visually cleaner.
- Decision: **Build in-house**

#### Watch, haptic vest, tracked weapons, LAN nodes

- Source: In-house sanitized device-category meshes
- Reason: The story is the connection between devices, not their commercial branding. The available free OWO item is an Unreal plugin rather than a reusable vest mesh; the owned FPS Weapon Bundle is a legacy UE Marketplace item and is unnecessary for this web reconstruction.
- Decision: **Build in-house**

---

### Station 03 — Multi-role emergency response

#### Primary environment: Industrial Area Hangar

- Listing: <https://www.fab.com/listings/843b02a2-efd6-4932-8959-291bec8733e3>
- Publisher: Kyrylo Sibiriakov
- Library status: Already owned
- License: Fab Standard License
- Source format: Unreal Engine asset package
- Supported versions: UE 4.9/4.10–4.27 and 5.0–5.6
- Use: Neutral service-yard shell, hangar exterior, gates, fencing, barriers, wet ground, industrial props
- Production treatment: Create an original fictional incident yard with three readable zones; remove signage and identifiable markings; keep the camera at incident-command scale
- Decision: **Approved — best web-fit environment**

#### Alternate environment: Warehouse Environment

- Listing: <https://www.fab.com/listings/ef0311b7-fd62-414a-b2c3-66ba95d8a21d>
- Publisher: ScansMatter
- Library status: Already owned
- License: Fab Standard License
- Source format: Unreal Engine asset package
- Contents: 165+ modular assets, 4K textures, Nanite/Lumen-oriented
- Use: Selective close props or one hero wall/door only
- Risk: Excessive geometry, materials, and textures for the web; no traditional lightmap UV emphasis
- Decision: **Conditional donor only — do not make this the shipped scene**

#### Police vehicle: Free American Sedans — Police variant

- Listing: <https://www.fab.com/listings/b34c4162-44f4-4902-bd6f-489943afa4bd>
- Publisher: High Matters
- Library status: Already owned
- License: Fab Standard License
- Formats: FBX/Unity package
- Geometry: Police variant approximately 11,086 triangles; stylized variant approximately 6,246 triangles
- AI disclosure: Generated with AI — No
- Use: Distant arrival/role anchor only
- Production treatment: Replace markings, colors, light bar behavior, and number; use as a fictional generic service vehicle
- Decision: **Approved conditionally — background role cue**

#### Ambulance

- Listing: <https://www.fab.com/listings/bb9192b4-d0de-47ba-820d-e11fdea5ba29>
- Publisher: RCC Design
- Library status: Added to My Library on 2026-07-27
- License: CC BY 4.0
- Formats: GLB, glTF, USDZ
- Download size: 11.87 MB source archive
- AI disclosure: Generated with AI — No
- Use: Distant medical-response anchor
- Production treatment: Original neutral livery, simplified lights, no country/service branding
- Decision: **Approved**

#### Firefighter Helmet

- Listing: <https://www.fab.com/listings/043508a3-ce36-4d29-a9a5-10522b95bbee>
- Publisher: Gabriel Farias
- Library status: Added to My Library on 2026-07-27
- License: CC BY 4.0
- Format: FBX archive, 14.78 MB
- AI disclosure: Generated with AI — No
- Use: Role-defining prop on a neutral responder silhouette
- Production treatment: Repaint and simplify; no insignia
- Decision: **Approved**

#### Fire Hose Cabinet

- Listing: <https://www.fab.com/listings/48c228e2-35fe-4048-af75-c61515b82111>
- Publisher: RED2000
- Library status: Added to My Library on 2026-07-27
- License: CC BY 4.0
- Formats: GLB, glTF, USDZ, FBX
- Download size: 18.19 MB source archive
- AI disclosure: Generated with AI — No
- Use: Industrial fire-response prop donor
- Caveat: The source intentionally lacks a valve/nozzle; build the operational hose/nozzle in-house
- Decision: **Approved as donor only**

#### Existing local fire extinguisher

- Path: `public/assets/models/fire-extinguisher-cc0.glb`
- License state: Local asset is labeled CC0; retain provenance record before shipping
- Decision: **Approved conditionally — provenance check required**

#### Responders

- Base source: Casual Characters Pack FREE, reused as neutral silhouettes
- Role differentiation: Custom firefighter helmet/SCBA silhouette, medical pack/vest, and police high-visibility/tactical vest; distinct posture and tool interaction
- Reason: No credible owned full firefighter, paramedic, or police character was available, and the user prohibited purchases. The scene should prioritize dependent actions over uniform spectacle.
- Decision: **Build role kits in-house over one licensed shared rig**

---

### Station 04 — Hover The Edge

- Primary mesh: `public/assets/models/hoverboard-original.glb`
- Use: Hero board synchronized to the camera and gameplay footage
- Decision: **Approved — retain**
- Reject: `public/assets/models/challenger-speeder-cc0.glb`; the spaceship/speeder silhouette contradicts the game

No Fab acquisition is required for this station.

---

### Station 05 — FlyboxVR

- Primary evidence: Real FlyboxVR video
- Character source: One neutral shared rig from Casual Characters Pack FREE, posed face-down and simplified into a clean suit silhouette
- Tunnel/installation: Build as a lightweight custom ring/tunnel system around the video rather than importing a large environment
- Decision: **No specialty Fab purchase or acquisition required**

The video remains larger and more important than every mesh in the station.

---

### Station 06 — Applications

- Phone bodies: Build two original neutral shells in-house
- Screens: Use approved English-language product captures from Nomad Home, MoneyNest, and BiteSync; no Hebrew screenshot in the primary composition
- Existing procedural laptop: `/Users/larion/Downloads/optimized_procedural_laptop_v7.glb`
- Laptop status: **Conditional** until ownership/license provenance is recorded
- Decision: **No Fab acquisition required**

---

### Station 07 — CTA

- Use custom interactive geometry derived from the journey's systems, not a marketplace hero mesh
- Decision: **Build in-house**

---

## 4. Free assets added to the Fab library

The following no-cost acquisitions were completed on 2026-07-27. No cart, checkout, paid tier, or purchase was used:

| Asset | License | Format | Intended station |
|---|---|---|---|
| Medical Equipment | CC BY 4.0 | GLB/glTF/USDZ | 01 |
| VR Headsets | CC BY 4.0 | FBX | 01–02 |
| Firefighter Helmet | CC BY 4.0 | FBX | 03 |
| Ambulance | CC BY 4.0 | GLB/glTF/USDZ | 03 |
| Fire Hose Cabinet | CC BY 4.0 | GLB/glTF/USDZ/FBX | 03 |

---

## 5. Explicit rejects

### Animated Tactical Soldier

- Listing: <https://www.fab.com/listings/26aa95a5-9c17-44b8-823f-b7c06451adee>
- Reason: Good formats and CC BY 4.0, but the listing is marked “Generated with AI — Yes.” The approved specification forbids generated people as primary evidence. Do not use it.

### OWO Gaming Haptic Vest

- Listing: <https://www.fab.com/listings/aae70ff2-2000-4239-b599-0345c1d40989>
- Reason: This is an Unreal integration plugin, not a reusable vest mesh. It does not solve the web asset requirement.

### Rugged Tablet 0.1

- Listing: <https://www.fab.com/listings/fc879ff2-dbae-4e44-8920-5212b1b27e09>
- Reason: The listing requires selection from free/paid Standard tiers. It was deliberately not acquired under the no-purchase constraint. The tablet is simple enough to author in-house.

### FPS Weapon Bundle

- Listing: <https://www.fab.com/listings/8aeb9c48-b404-4dcd-9e56-1d0ecedba7f5>
- Reason: Legacy UE Marketplace license label, Unreal-only delivery, and unnecessary firearm detail. A neutral tracked training device communicates the system more safely and clearly.

### Warehouse Environment as a full shipped scene

- Reason: Strong visual reference, but its Nanite/Lumen/4K emphasis imposes excessive web conversion cost. It may donate one or two hero surfaces only.

### Local Piryon project assets

- Location: `/Users/larion/Perforce/Larion_Macbook/depot/Piryon/Content`
- Reason: Excellent reference material exists for beds, hospital equipment, a watch, vest, patient, fire/smoke, and characters, but provenance and client confidentiality are not yet proven. Do not ship these assets unless Playframe explicitly clears them.

---

## 6. Export and web-production gate

Sourcing is complete, but source packages are not production-ready web assets. Before implementation, every selected asset must pass this pipeline:

1. Export only camera-visible modules from Unreal/Fab source.
2. Convert to GLB 2.0, meters, Y-up, with applied transforms and intentional pivots.
3. Remove unused LODs, collisions, sockets, hidden faces, decals, logos, and engine-only helpers.
4. Reduce geometry to the station budget; preserve silhouette before small surface detail.
5. Consolidate materials and bake texture sets to 1K–2K atlases.
6. Add KTX2 only after the runtime loader has explicit KTX2 support.
7. Apply Meshopt compression and verify loading with the existing loader.
8. Use a shared skeleton for repeated figures and `SkeletonUtils.clone`/equivalent safe cloning for skinned instances.
9. Record source archive hash, final derivative path, modifications, attribution, and license in the runtime manifest.
10. Test desktop and mobile authored camera angles before accepting any asset.

### Scene budgets

| Target | Desktop | Mobile |
|---|---:|---:|
| Visible triangles per primary scene | approximately 250k maximum | approximately 120k maximum |
| Draw calls per primary scene | approximately 120 maximum | approximately 70 maximum |
| Environment module | 25k–80k | lower LOD or simplified shell |
| Hero character | 25k–45k | 12k–20k |
| Small prop | 1k–8k | 500–4k |

These are production gates, not invitations to fill every budget.

---

## 7. Download/export status

- Library sourcing: **Complete**
- Free acquisitions: **Complete**
- Paid acquisitions: **None**
- Browser direct-download attempt: Fab's GLB stream stalled partway through transfer; no incomplete file is approved as source
- Epic Launcher route: Opened, but the launcher did not expose a reliable asset export surface during this pass
- Source export: **Pending production pass**
- Website implementation: **Not started**, per the instruction to source meshes before rebuilding

The next action should be a controlled export pass for the approved shortlist, followed by contact sheets and polygon/material audits before any asset enters the live scene.
