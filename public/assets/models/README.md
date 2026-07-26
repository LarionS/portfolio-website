# Sourced 3D assets

This directory contains web-packaged derivatives of CC0 models. CC0 permits
commercial use, modification, and redistribution without attribution. Source
and author details are retained here for provenance anyway.

All source files were downloaded from the official publisher repositories on
2026-07-26. Final GLBs were validated by importing them back into Blender 5.2
LTS. Mesh geometry uses `EXT_meshopt_compression`; the Drei `useGLTF` wrapper in
`src/three/SourcedAssets.tsx` enables the bundled Meshopt decoder.

## wheelchair-cc0.glb

- Source: [Wheelchair 01 on Poly Haven](https://polyhaven.com/a/wheelchair_01)
- Artist: Garreth Dean
- License: [CC0 1.0](https://polyhaven.com/license)
- Source variant: official 1K glTF package
- Modifications: repackaged as a single GLB; cameras/lights omitted; geometry
  topology preserved, quantized, and compressed with Meshopt; 1K source textures
  resampled to 512px and encoded as WebP.
- Final size: 388,644 bytes
- SHA-256: `13eda0b51037fec20623aa6be6b0faa3a643bbde0e56f6a9343ee2eb7dce4caf`

## fire-extinguisher-cc0.glb

- Source: [Korean Fire Extinguisher 01 on Poly Haven](https://polyhaven.com/a/korean_fire_extinguisher_01)
- Artist: UM JOORIN
- License: [CC0 1.0](https://polyhaven.com/license)
- Source variant: official 1K glTF package
- Modifications: repackaged as a single GLB; cameras/lights omitted; geometry
  topology preserved, quantized, and compressed with Meshopt; 1K source textures
  resampled to 512px and encoded as WebP.
- Final size: 246,768 bytes
- SHA-256: `70810f2ea0d7801f11166d6d7d06a408a59eee0d824af612d9c9eb8852b29a1c`

## challenger-speeder-cc0.glb

- Source: [Ultimate Spaceships Pack by Quaternius](https://quaternius.com/packs/ultimatespaceships.html)
- Direct source folder: [Challenger glTF on the publisher-linked Google Drive](https://drive.google.com/drive/folders/1H0ssgL0hSqE-hnwofpjNHT41FtGOOw-6?usp=sharing)
- Artist: Quaternius
- License: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
- Source variant: official `Challenger.gltf` with the orange material
- Modifications: source texture resampled from 2048px to 1024px; repackaged as
  a single GLB; cameras/lights omitted; mesh data compressed with Meshopt; WebP
  texture encoded at quality 88.
- Final size: 212,572 bytes
- SHA-256: `2b693f08286514db85f314201936f219d1e3167aa0b837cc666ccfc47f362bb6`

## scifi-helmet-cc0.glb

- Source: [SciFiHelmet in Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SciFiHelmet)
- Artists: Michael Pavlovic (model), Norbert Nopper (glTF conversion)
- License: [CC0 1.0](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/SciFiHelmet/LICENSE.md)
- Source variant: official separate glTF package
- Modifications: source textures resampled from 2048px to 512px; repackaged as
  a single GLB; cameras/lights omitted; all 23,358 faces preserved; geometry
  quantized and compressed with Meshopt; textures encoded as WebP.
- Final size: 363,040 bytes
- SHA-256: `7679667b2985ffc7ccbc374311da98b3de9229def920f4d04b16893d5e883c1c`

## Runtime policy

Models are requested only when the journey's `SceneGate` mounts the current or
adjacent chapter, so the set stays progressive rather than becoming part of the
critical first load.
