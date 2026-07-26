# Flybox VR — Story Loop v2

## Story intent

This edit makes the real Flybox experience the station's primary storyteller. It follows a compact experiential arc:

1. **Enter the chamber** — a wide view establishes the physical installation and suspended participant.
2. **Put on the system** — a close headset moment introduces embodiment.
3. **Leave the room** — the first-person view moves from orbit into flight.
4. **Become the aircraft** — a virtual hand movement match-cuts to a real participant flying horizontally.
5. **Bank and dive** — alternating in-world and physical shots connect body motion to the simulated result.
6. **Feel it** — a clean reaction shot adds human payoff.
7. **Meet the encounter** — an in-world helicopter leads directly back to the participant in the chamber.

The montage contains no added text. Source moments with Hebrew promotional overlays or subtitles were excluded wherever possible. One reaction shot was reframed from the clean upper portion of the original frame so its embedded subtitle is not visible; incidental venue signage remains part of the photographed environment.

## Source and provenance

- Source: `/Users/larion/Downloads/Flybox VR.mp4`
- Source properties: H.264, 1280×720, 25 fps, 00:53.777, AAC stereo
- The source file was read only and left untouched.
- No external footage, generated imagery, or synthetic frames were introduced.
- The source was upscaled with Lanczos and received restrained per-shot gamma, contrast, saturation, and sharpening adjustments.

## Edit map

| Beat | Source in | Source out | Raw duration | Visual purpose |
| --- | ---: | ---: | ---: | --- |
| Chamber reveal | `00:03.750` | `00:04.950` | 1.200 s | Wide physical chamber and suspended participant establish the real installation. |
| Headset embodiment | `00:05.000` | `00:05.700` | 0.700 s | Tight setup shot shows the participant entering VR. |
| Virtual takeoff | `00:11.000` | `00:12.200` | 1.200 s | First-person hands, spacecraft structure, and planet create immediate scale. |
| Virtual-to-physical match | `00:18.050` | `00:20.400` | 2.350 s | Space flight transitions directly into a clean prone-flight shot with visible arm movement. |
| In-world dive | `00:34.000` | `00:35.450` | 1.450 s | Hands and landscape communicate descent and directional control. |
| Physical banking | `00:35.500` | `00:36.950` | 1.450 s | A horizontal participant rolls and reaches inside the chamber. |
| Human reaction | `00:39.550` | `00:40.200` | 0.650 s | Joyful reaction supplies emotional proof; cropped to 960×540 at x=160, y=0 to remove the source subtitle. |
| Hand-guided flight | `00:40.250` | `00:41.150` | 0.900 s | First-person hand movement reconnects the physical gesture to flight. |
| Helicopter encounter | `00:45.000` | `00:46.550` | 1.550 s | A close in-world helicopter pass match-cuts back to the participant flying prone. |

The raw selections total 11.45 seconds. Constant-frame-rate rounding at the source-native 25 fps produces the final 11.440-second file.

## Deliverables

- `assets/journey/flybox/flybox-story-v2.mp4`
  - 1920×1080 H.264, 25 fps, `yuv420p`
  - 11.440 seconds, 8,982,470 bytes, approximately 6.28 Mbps
  - Silent by design for reliable background autoplay
  - `faststart` enabled for web delivery
  - SHA-256: `0853b6fc8d41e035a4b43f0a312ce0bb205dc3c5862d34ecdda9c20f0bce7b73`
- `assets/journey/flybox/flybox-story-v2-poster.jpg`
  - 1920×1080 JPEG selected from source time `00:19.350`
  - Clean horizontal/prone participant frame with visible body and hand movement
  - 126,150 bytes
  - SHA-256: `300d7bb9e3f33de1d0339123dadae6a7461e034c02c9a3d65be2d903306fe929`

## Reproduction commands

Run from the repository root.

```sh
ffmpeg -y -hide_banner -loglevel error -i "/Users/larion/Downloads/Flybox VR.mp4" -filter_complex "[0:v]trim=start=3.75:end=4.95,setpts=PTS-STARTPTS,fps=25,scale=1920:1080:flags=lanczos,eq=gamma=1.07:contrast=1.05:saturation=1.10,unsharp=5:5:0.22:3:3:0[v0];[0:v]trim=start=5.00:end=5.70,setpts=PTS-STARTPTS,fps=25,scale=1920:1080:flags=lanczos,eq=gamma=1.06:contrast=1.05:saturation=1.08,unsharp=5:5:0.22:3:3:0[v1];[0:v]trim=start=11.00:end=12.20,setpts=PTS-STARTPTS,fps=25,scale=1920:1080:flags=lanczos,eq=gamma=1.03:contrast=1.05:saturation=1.10,unsharp=5:5:0.22:3:3:0[v2];[0:v]trim=start=18.05:end=20.40,setpts=PTS-STARTPTS,fps=25,scale=1920:1080:flags=lanczos,eq=gamma=1.06:contrast=1.05:saturation=1.10,unsharp=5:5:0.22:3:3:0[v3];[0:v]trim=start=34.00:end=35.45,setpts=PTS-STARTPTS,fps=25,scale=1920:1080:flags=lanczos,eq=gamma=1.03:contrast=1.06:saturation=1.08,unsharp=5:5:0.22:3:3:0[v4];[0:v]trim=start=35.50:end=36.95,setpts=PTS-STARTPTS,fps=25,scale=1920:1080:flags=lanczos,eq=gamma=1.09:brightness=0.01:contrast=1.05:saturation=1.10,unsharp=5:5:0.22:3:3:0[v5];[0:v]trim=start=39.55:end=40.20,setpts=PTS-STARTPTS,fps=25,crop=960:540:160:0,scale=1920:1080:flags=lanczos,eq=gamma=1.06:contrast=1.05:saturation=1.08,unsharp=5:5:0.20:3:3:0[v6];[0:v]trim=start=40.25:end=41.15,setpts=PTS-STARTPTS,fps=25,scale=1920:1080:flags=lanczos,eq=gamma=1.03:contrast=1.05:saturation=1.08,unsharp=5:5:0.22:3:3:0[v7];[0:v]trim=start=45.00:end=46.55,setpts=PTS-STARTPTS,fps=25,scale=1920:1080:flags=lanczos,eq=gamma=1.05:contrast=1.05:saturation=1.10,unsharp=5:5:0.22:3:3:0[v8];[v0][v1][v2][v3][v4][v5][v6][v7][v8]concat=n=9:v=1:a=0,format=yuv420p[outv]" -map "[outv]" -c:v libx264 -preset slow -crf 20 -maxrate 6M -bufsize 12M -movflags +faststart -an assets/journey/flybox/flybox-story-v2.mp4
```

```sh
ffmpeg -y -hide_banner -loglevel error -ss 19.35 -i "/Users/larion/Downloads/Flybox VR.mp4" -frames:v 1 -vf "scale=1920:1080:flags=lanczos,eq=gamma=1.06:contrast=1.05:saturation=1.10,unsharp=5:5:0.22:3:3:0" -q:v 2 assets/journey/flybox/flybox-story-v2-poster.jpg
```

## Validation

- Full-stream decode completed with no FFmpeg errors.
- `ffprobe` confirmed one H.264 video stream, 1920×1080, 25 fps, `yuv420p`, and no audio stream.
- Source contact sheets were reviewed at two-second, half-second, and quarter-second density before editing.
- The complete output was visually reviewed with one-frame-per-second and two-frames-per-second contact sheets; no promotional Hebrew overlay or subtitle remains visible.
- The poster was visually inspected at full resolution.
- No React, CSS, or other application code was changed as part of this edit.
