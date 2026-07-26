# Hover The Edge — Story Loop v2 Recut

## Story intent

The previous loop was dominated by downward-looking, low-contrast footage. This recut keeps the camera aimed through the course and builds a compact run with visible progression:

1. **Accelerate into the storm** — forward travel, a coin line, water gaps, and lightning establish speed and stakes immediately.
2. **Carve the rock route** — a low horizon and lateral banks make the hover movement readable.
3. **Hit the boost checkpoint** — the luminous blue pickup becomes a clear mid-run objective and bridges rock into sand.
4. **Bank across the desert** — palm silhouettes and dark stone create stronger terrain contrast while the camera leans through the route.
5. **Commit to the target** — the rider locks onto the red marker, passes a coin pickup, and exits in a fast lateral carve.

The montage is text-free apart from the game's own diegetic HUD. It uses source-native gameplay only, with restrained contrast/color treatment and subtle speed ramps to preserve the actual movement while making the short web loop feel decisive.

## Source and provenance

- Source: `/Users/larion/Downloads/Hover The Edge.mp4`
- Source properties: H.264, 1920×1080, 30 fps, 05:55.6, AAC stereo
- The source file was read only and left untouched.
- No stock footage, generated imagery, interpolation, or synthetic frames were introduced.
- The complete source was remapped before recutting; promising motion beats were then reviewed at half-second, quarter-second, and eighth-second density.

## Edit map

| Beat | Source in | Source out | Raw duration | Speed | Effective duration | Visual purpose |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Storm acceleration | `00:08.600` | `00:11.700` | 3.100 s | 1.12× | 2.768 s | Forward track, coin line, water gaps, and lightning create an immediate action opening. |
| Low rock carve | `00:23.100` | `00:26.400` | 3.300 s | 1.15× | 2.870 s | Low-angle traversal and side-to-side banking communicate hoverboard handling. |
| Boost checkpoint | `00:49.700` | `00:52.200` | 2.500 s | 1.10× | 2.273 s | The blue checkpoint/boost is acquired as the terrain changes from wet rock to open sand. |
| Desert banking | `00:54.200` | `00:57.000` | 2.800 s | 1.18× | 2.373 s | Palm silhouettes, boulders, and a sustained lean deliver stronger visual contrast and carving. |
| Objective and pickup | `00:58.000` | `01:01.600` | 3.600 s | 1.20× | 3.000 s | The red target anchors the route; the rider approaches and passes a coin before banking away. |

The raw selections total 15.30 seconds. The documented speed ramps produce approximately 13.28 seconds; constant-frame-rate rounding produces the final 13.266-second file.

## Deliverables

- `assets/journey/hover-the-edge/hover-story-v2.mp4`
  - 1920×1080 H.264, 30 fps, `yuv420p`
  - 13.266 seconds, 10,465,515 bytes, approximately 6.31 Mbps
  - Silent by design for reliable background autoplay
  - `faststart` enabled for web delivery
  - SHA-256: `fe7273d88c08d31e34ec77ae21861644e8c87826a9b115c81eee66824f3bbfb6`
- `assets/journey/hover-the-edge/hover-story-v2-poster.jpg`
  - 1920×1080 JPEG selected from source time `00:49.950`
  - Luminous blue checkpoint, visible lightning, strong lateral camera angle, and authentic “Checkpoint Reached” HUD feedback
  - 94,811 bytes
  - SHA-256: `d8b61595df16cf5c5b4283537aa1cf2329f3094935e5e1d50a9d7f160a8bd72b`

## Reproduction commands

Run from the repository root.

```sh
ffmpeg -y -hide_banner -loglevel error -i "/Users/larion/Downloads/Hover The Edge.mp4" -filter_complex "[0:v]trim=start=8.60:end=11.70,setpts=(PTS-STARTPTS)/1.12,fps=30,scale=1920:1080:flags=lanczos,eq=gamma=0.88:contrast=1.16:saturation=1.16,unsharp=5:5:0.18:3:3:0[v0];[0:v]trim=start=23.10:end=26.40,setpts=(PTS-STARTPTS)/1.15,fps=30,scale=1920:1080:flags=lanczos,eq=gamma=0.88:contrast=1.16:saturation=1.16,unsharp=5:5:0.18:3:3:0[v1];[0:v]trim=start=49.70:end=52.20,setpts=(PTS-STARTPTS)/1.10,fps=30,scale=1920:1080:flags=lanczos,eq=gamma=0.90:contrast=1.16:saturation=1.16,unsharp=5:5:0.18:3:3:0[v2];[0:v]trim=start=54.20:end=57.00,setpts=(PTS-STARTPTS)/1.18,fps=30,scale=1920:1080:flags=lanczos,eq=gamma=0.90:contrast=1.16:saturation=1.16,unsharp=5:5:0.18:3:3:0[v3];[0:v]trim=start=58.00:end=61.60,setpts=(PTS-STARTPTS)/1.20,fps=30,scale=1920:1080:flags=lanczos,eq=gamma=0.90:contrast=1.16:saturation=1.16,unsharp=5:5:0.18:3:3:0[v4];[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0,format=yuv420p[outv]" -map "[outv]" -c:v libx264 -preset slow -crf 20 -maxrate 6M -bufsize 12M -movflags +faststart -an assets/journey/hover-the-edge/hover-story-v2.mp4
```

```sh
ffmpeg -y -hide_banner -loglevel error -ss 49.95 -i "/Users/larion/Downloads/Hover The Edge.mp4" -frames:v 1 -vf "scale=1920:1080:flags=lanczos,eq=gamma=0.90:contrast=1.16:saturation=1.16,unsharp=5:5:0.18:3:3:0" -q:v 2 assets/journey/hover-the-edge/hover-story-v2-poster.jpg
```

## Validation

- Full-stream decode completed with no FFmpeg errors.
- `ffprobe` confirmed one H.264 video stream, 1920×1080, 30 fps, `yuv420p`, and no audio stream.
- A two-frames-per-second contact sheet of the complete export was visually inspected after the final recut.
- The final selection avoids the long overhead board glance, palm-trunk occlusion, dark ruins, and out-of-bounds moments found during the source audit.
- The poster was visually inspected at full resolution.
- No React, CSS, or other application code was changed as part of this edit.
