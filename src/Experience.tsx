import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MutableRefObject, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Line,
  PerformanceMonitor,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import { chapters, mobileProducts } from "./content";
import type { JourneySceneState } from "./sceneState";
import { SimulationAtmosphere } from "./three/Atmosphere";
import { SourcedSciFiHelmet } from "./three/SourcedAssets";

const ClinicalSystemWorld = lazy(() => import("./three/SystemWorlds").then((module) => ({ default: module.ClinicalSystemWorld })));
const ConnectedSystemWorld = lazy(() => import("./three/SystemWorlds").then((module) => ({ default: module.ConnectedSystemWorld })));
const EmergencySystemWorld = lazy(() => import("./three/SystemWorlds").then((module) => ({ default: module.EmergencySystemWorld })));
const HoverWorld = lazy(() => import("./three/ProductWorlds").then((module) => ({ default: module.HoverWorld })));
const FlyboxWorld = lazy(() => import("./three/ProductWorlds").then((module) => ({ default: module.FlyboxWorld })));
const MobileWorld = lazy(() => import("./three/ProductWorlds").then((module) => ({ default: module.MobileWorld })));

type ExperienceProps = {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<{ x: number; y: number }>;
  mobile: boolean;
  visible: boolean;
  sceneState: JourneySceneState;
  onUpdateScene: (patch: Partial<JourneySceneState>) => void;
  onReady: () => void;
};

type RenderProfile = "full" | "lean";

const FULL_SCENE_PIXEL_BUDGET = 4_500_000;
const MOBILE_SCENE_PIXEL_BUDGET = 2_200_000;

function getBudgetedDpr(mobile: boolean) {
  if (typeof window === "undefined") return 1;
  const viewportPixels = Math.max(1, window.innerWidth * window.innerHeight);
  const pixelBudget = mobile ? MOBILE_SCENE_PIXEL_BUDGET : FULL_SCENE_PIXEL_BUDGET;
  const budgeted = Math.sqrt(pixelBudget / viewportPixels);
  const deviceDpr = window.devicePixelRatio || 1;
  return THREE.MathUtils.clamp(
    Math.min(deviceDpr, budgeted, mobile ? 1 : 1.15),
    mobile ? 0.75 : 0.68,
    mobile ? 1 : 1.15,
  );
}

function isSoftwareRenderer(gl: THREE.WebGLRenderer) {
  const context = gl.getContext();
  const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
  if (!debugInfo) return false;
  const renderer = String(
    context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? "",
  ).toLowerCase();
  return /swiftshader|llvmpipe|software|microsoft basic render/.test(renderer);
}

function DevelopmentDiagnostics() {
  const samples = useRef<number[]>([]);
  const reportedRenderer = useRef(false);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const enabled = import.meta.env.DEV
    && typeof window !== "undefined"
    && new URLSearchParams(window.location.search).has("perf");

  useFrame(({ gl, scene }, delta) => {
    if (!enabled) return;
    samples.current.push(delta * 1000);

    if (!reportedRenderer.current) {
      reportedRenderer.current = true;
      const context = gl.getContext();
      const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
      const renderer = debugInfo
        ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "renderer unavailable";
      console.info(`[playframe-perf] renderer=${String(renderer)}`);
    }

    if (samples.current.length < 180) return;
    const ordered = samples.current.splice(0).sort((a, b) => a - b);
    const average = ordered.reduce((total, value) => total + value, 0) / ordered.length;
    const p95 = ordered[Math.floor(ordered.length * 0.95)] ?? average;
    let visibleMeshes = 0;
    let materialSlots = 0;
    const drawSources = new Map<string, number>();
    const stationSlots = Array.from({ length: WORLD_POSITIONS.length }, () => 0);
    scene.traverseVisible((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      visibleMeshes += 1;
      const slots = Array.isArray(object.material) ? object.material.length : 1;
      materialSlots += slots;
      const source = object.name || object.geometry.type || object.type;
      drawSources.set(source, (drawSources.get(source) ?? 0) + slots);
      object.getWorldPosition(worldPosition);
      let nearest = 0;
      let distance = Number.POSITIVE_INFINITY;
      WORLD_POSITIONS.forEach((position, index) => {
        const next = Math.abs(worldPosition.z - position[2]);
        if (next < distance) {
          nearest = index;
          distance = next;
        }
      });
      stationSlots[nearest] += Array.isArray(object.material) ? object.material.length : 1;
    });
    console.info(
      `[playframe-perf] fps=${(1000 / average).toFixed(1)} p95=${p95.toFixed(1)}ms calls=${gl.info.render.calls} triangles=${gl.info.render.triangles} meshes=${visibleMeshes} materials=${materialSlots} stations=${stationSlots.join(",")}`,
    );
    console.info(
      `[playframe-perf] top=${[...drawSources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, slots]) => `${name}:${slots}`).join(",")}`,
    );
  });

  return null;
}

const WORLD_POSITIONS: [number, number, number][] = [
  [3.4, -0.45, 0],
  [1.5, -1.1, -28],
  [-1.2, -1.1, -60],
  [1.4, -1.15, -93],
  [-0.5, -0.7, -127],
  [1.2, -0.75, -161],
  [-1.8, -0.6, -196],
  [0.5, -0.5, -228],
];

type CameraShot = {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
  aspectShift: number;
  travelLift: number;
  travelLateral: number;
  travelRoll: number;
};

const shot = (
  position: [number, number, number],
  lookAt: [number, number, number],
  fov: number,
  aspectShift: number,
  travel: [number, number, number] = [0.7, 0, 0],
): CameraShot => ({
  position: new THREE.Vector3(...position),
  lookAt: new THREE.Vector3(...lookAt),
  fov,
  aspectShift,
  travelLift: travel[0],
  travelLateral: travel[1],
  travelRoll: travel[2],
});

// Each station owns a composed hero frame. Travel only occupies the middle of a
// scroll segment, so the camera has time to arrive and become still around copy.
const DESKTOP_SHOTS: CameraShot[] = [
  shot([-0.6, 1.2, 12.5], [2, 0.45, -0.4], 40, 0.65, [0.55, 0.1, 0.002]),
  shot([-0.8, 1.45, -16.8], [-0.55, -0.45, -28], 38.5, 0.42, [1.25, 0.2, -0.006]),
  shot([4.6, 2.05, -48.2], [1.25, -0.6, -60.2], 40.5, 0.32, [0.34, -0.95, -0.011]),
  shot([0.15, 1.35, -82], [-0.9, -0.85, -93], 39, 0.48, [0.58, 0.62, 0.006]),
  shot([0.9, 0.95, -120.1], [0.25, -0.5, -134], 39, 0.58, [0.72, -0.18, -0.004]),
  shot([5.5, 1.7, -149], [4.7, -0.55, -161], 40.5, 0.3, [1.05, 0.34, 0.008]),
  shot([-1.9, 1, -184], [-3.3, -0.7, -196], 39, 0.36, [0.22, 0.08, 0.001]),
  shot([0.2, 1.25, -217], [-3.1, -0.25, -228], 40, 0.18, [0, 0, 0]),
];

const MOBILE_SHOTS: CameraShot[] = [
  shot([3.2, 1.55, 18.2], [6.8, -0.2, 0], 53, 0, [0.28, 0, 0]),
  shot([1.2, 1.55, -11.5], [1, -1.05, -28], 52, 0, [0.52, 0.08, -0.003]),
  shot([3.2, 1.65, -42], [-1, -1.1, -60], 53, 0, [0.22, -0.22, -0.006]),
  shot([0.4, 1.4, -76], [-0.1, -1.25, -93], 52, 0, [0.38, 0.2, 0.003]),
  shot([0.2, 0.9, -121.2], [0.1, -1.25, -134], 52, 0, [0.42, 0, -0.003]),
  shot([3.4, 1.4, -145.5], [1.6, -1.35, -161.3], 54, 0, [0.52, 0.16, 0.005]),
  shot([-1.8, 1.25, -178.2], [-1.8, -1, -196], 52, 0, [0.16, 0.04, 0]),
  shot([0.5, 1.25, -212.2], [-2.6, -1.05, -228], 51, 0, [0, 0, 0]),
];

type CameraEmphasis = {
  position: readonly [number, number, number];
  lookAt: readonly [number, number, number];
};

const NO_CAMERA_EMPHASIS: CameraEmphasis = {
  position: [0, 0, 0],
  lookAt: [0, 0, 0],
};

function getClinicalCameraEmphasis(
  phase: JourneySceneState["clinicalPhase"],
): CameraEmphasis {
  if (phase === "event") {
    return { position: [0.06, -0.04, -0.18], lookAt: [0.12, -0.05, -0.06] };
  }
  if (phase === "response") {
    return { position: [-0.08, -0.1, -0.32], lookAt: [0.24, -0.12, -0.12] };
  }
  if (phase === "review") {
    return { position: [0.12, 0.06, 0.08], lookAt: [0.38, 0.02, -0.04] };
  }
  return NO_CAMERA_EMPHASIS;
}

function getConnectedCameraEmphasis(
  phase: JourneySceneState["tacticalPhase"],
): CameraEmphasis {
  if (phase === "dispatch") {
    return { position: [-0.06, -0.04, -0.22], lookAt: [-0.04, -0.03, -0.12] };
  }
  if (phase === "feedback") {
    return { position: [-0.22, -0.1, -0.4], lookAt: [-0.18, -0.09, -0.2] };
  }
  if (phase === "telemetry") {
    return { position: [0.08, 0.03, 0.08], lookAt: [0.12, -0.04, 0.22] };
  }
  if (phase === "review") {
    return { position: [0.02, 0.08, 0.14], lookAt: [0.14, 0.02, 0.16] };
  }
  return NO_CAMERA_EMPHASIS;
}

function getEmergencyCameraEmphasis(step: number): CameraEmphasis {
  if (step === 1) {
    return { position: [-0.14, -0.04, -0.16], lookAt: [-0.3, -0.06, -0.08] };
  }
  if (step === 2) {
    return { position: [0, -0.1, -0.26], lookAt: [0.06, -0.11, -0.18] };
  }
  if (step >= 3) {
    return { position: [0.1, 0.05, 0.16], lookAt: [0.32, -0.04, -0.12] };
  }
  return NO_CAMERA_EMPHASIS;
}

function stationEmphasisWeight(progress: number, index: number) {
  const proximity = THREE.MathUtils.clamp(
    1 - Math.abs(progress - index) / 0.58,
    0,
    1,
  );
  return THREE.MathUtils.smootherstep(proximity, 0, 1);
}

function applyCameraEmphasis(
  targetPosition: THREE.Vector3,
  targetLook: THREE.Vector3,
  emphasis: CameraEmphasis,
  weight: number,
) {
  targetPosition.x += emphasis.position[0] * weight;
  targetPosition.y += emphasis.position[1] * weight;
  targetPosition.z += emphasis.position[2] * weight;
  targetLook.x += emphasis.lookAt[0] * weight;
  targetLook.y += emphasis.lookAt[1] * weight;
  targetLook.z += emphasis.lookAt[2] * weight;
}

function nextClinicalPhase(
  phase: JourneySceneState["clinicalPhase"],
): JourneySceneState["clinicalPhase"] {
  return phase === "baseline" || phase === "review" ? "event" : "baseline";
}

function nextTacticalPhase(
  phase: JourneySceneState["tacticalPhase"],
): JourneySceneState["tacticalPhase"] {
  return phase === "ready" || phase === "review" ? "dispatch" : "ready";
}

function sampleSegment(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, DESKTOP_SHOTS.length - 1);
  const index = Math.min(DESKTOP_SHOTS.length - 2, Math.floor(clamped));
  const fraction = clamped - index;
  return {
    index,
    // Preserve every pixel of wheel/trackpad input. Camera damping below gives
    // the journey its authored ease without creating unresponsive dead zones.
    blend: fraction,
  };
}

function glowColor(color: string, intensity = 4) {
  return new THREE.Color(color).multiplyScalar(intensity);
}

function CameraDirector({
  progress,
  pointer,
  mobile,
  sceneState,
}: Pick<ExperienceProps, "progress" | "pointer" | "mobile" | "sceneState">) {
  const targetPosition = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const viewVector = useRef(new THREE.Vector3());
  const targetQuaternion = useRef(new THREE.Quaternion());
  const director = useRef(new THREE.PerspectiveCamera());
  const initialized = useRef(false);
  const lastProgress = useRef(progress.current);
  const jumpEnergy = useRef(0);

  useFrame(({ camera, size }, delta) => {
    const shots = mobile ? MOBILE_SHOTS : DESKTOP_SHOTS;
    const { index, blend } = sampleSegment(progress.current);
    const current = shots[index];
    const next = shots[index + 1];
    const transition = Math.sin(blend * Math.PI);

    targetPosition.current.lerpVectors(current.position, next.position, blend);
    targetLook.current.lerpVectors(current.lookAt, next.lookAt, blend);

    // A small vertical travel arc avoids the mechanical straight-line dolly,
    // while remaining perfectly still at every authored station.
    targetPosition.current.y += transition * current.travelLift;
    targetPosition.current.x += transition * current.travelLateral * (mobile ? 0.48 : 1);

    const aspect = size.width / Math.max(size.height, 1);
    if (mobile) {
      // Very narrow phones need a little more distance without falling back to
      // the previous remote, postage-stamp framing on ordinary handsets.
      const narrowness = THREE.MathUtils.clamp((0.58 - aspect) / 0.18, 0, 1);
      viewVector.current
        .copy(targetPosition.current)
        .sub(targetLook.current)
        .multiplyScalar(1 + narrowness * 0.08);
      targetPosition.current.copy(targetLook.current).add(viewVector.current);
    } else {
      const aspectShift = THREE.MathUtils.lerp(current.aspectShift, next.aspectShift, blend);
      targetLook.current.x += (1.55 - aspect) * aspectShift;
    }

    const emphasisScale = mobile ? 0.56 : 1;
    applyCameraEmphasis(
      targetPosition.current,
      targetLook.current,
      getClinicalCameraEmphasis(sceneState.clinicalPhase),
      stationEmphasisWeight(progress.current, 1) * emphasisScale,
    );
    applyCameraEmphasis(
      targetPosition.current,
      targetLook.current,
      getConnectedCameraEmphasis(sceneState.tacticalPhase),
      stationEmphasisWeight(progress.current, 2) * emphasisScale,
    );
    applyCameraEmphasis(
      targetPosition.current,
      targetLook.current,
      getEmergencyCameraEmphasis(sceneState.emergencyStep),
      stationEmphasisWeight(progress.current, 3) * emphasisScale,
    );

    const pointerScale = mobile ? 0.06 : 1;
    targetPosition.current.x += pointer.current.x * 0.18 * pointerScale;
    targetPosition.current.y += pointer.current.y * 0.09 * pointerScale;
    targetLook.current.x -= pointer.current.x * 0.025 * pointerScale;
    targetLook.current.y += pointer.current.y * 0.018 * pointerScale;

    if (Math.abs(progress.current - lastProgress.current) > 0.34) {
      jumpEnergy.current = 1;
    }
    lastProgress.current = progress.current;
    jumpEnergy.current = THREE.MathUtils.damp(jumpEnergy.current, 0, 4.5, delta);

    const damping = 1 - Math.exp(-(6.4 + jumpEnergy.current * 20) * Math.min(delta, 0.05));
    if (!initialized.current) {
      camera.position.copy(targetPosition.current);
    } else {
      camera.position.lerp(targetPosition.current, damping);
    }

    director.current.position.copy(camera.position);
    director.current.lookAt(targetLook.current);
    director.current.rotateZ(
      transition * current.travelRoll + pointer.current.x * 0.0025 * pointerScale,
    );
    targetQuaternion.current.copy(director.current.quaternion);
    if (!initialized.current) {
      camera.quaternion.copy(targetQuaternion.current);
      initialized.current = true;
    } else {
      camera.quaternion.slerp(targetQuaternion.current, damping);
    }

    const narrowness = mobile
      ? THREE.MathUtils.clamp((0.58 - aspect) / 0.18, 0, 1)
      : THREE.MathUtils.clamp((1.28 - aspect) / 0.28, 0, 1);
    const targetFov = THREE.MathUtils.lerp(current.fov, next.fov, blend) + narrowness * (mobile ? 1.2 : 2);
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = THREE.MathUtils.damp(perspective.fov, targetFov, 5, delta);
    if (Math.abs(perspective.fov - targetFov) > 0.01) {
      perspective.updateProjectionMatrix();
    }
  });

  return null;
}

function SceneGate({
  progress,
  index,
  children,
}: {
  progress: MutableRefObject<number>;
  index: number;
  children: ReactNode;
}) {
  // Exactly one expensive station is mounted at a time. Media preloading lives
  // in the DOM layer so it cannot introduce overlapping Three.js worlds.
  const isNearestStation = () => Math.round(progress.current) === index;
  const activeRef = useRef(isNearestStation());
  const [active, setActive] = useState(activeRef.current);

  useFrame(() => {
    const next = isNearestStation();
    if (next === activeRef.current) return;
    activeRef.current = next;
    setActive(next);
  });

  return active ? children : null;
}

function SignalThread({
  progress,
  profile,
}: {
  progress: MutableRefObject<number>;
  profile: RenderProfile;
}) {
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseMaterialRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const threadMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(2.3, -0.35, 2),
          new THREE.Vector3(1.2, -3.03, -28),
          new THREE.Vector3(-1.1, -3.08, -60),
          new THREE.Vector3(1.6, -3.1, -93),
          new THREE.Vector3(-0.5, -2.7, -127),
          new THREE.Vector3(1.2, -3.02, -161),
          new THREE.Vector3(-1.8, -3.18, -196),
          new THREE.Vector3(3.64, -0.42, -228),
        ],
        false,
        "centripetal",
        0.26,
      ),
    [],
  );
  const cyan = useMemo(() => glowColor("#72efff", 2.7), []);

  useFrame(({ clock }) => {
    const nearestStation = Math.round(progress.current);
    const travel = THREE.MathUtils.smoothstep(
      Math.abs(progress.current - nearestStation),
      0.08,
      0.42,
    );
    if (threadMaterial.current) {
      threadMaterial.current.opacity = 0.075 + travel * 0.085;
    }
    pulseRefs.current.forEach((pulse, index) => {
      if (!pulse) return;
      const t = (clock.elapsedTime * 0.023 + index / pulseRefs.current.length) % 1;
      curve.getPointAt(t, pulse.position);
      const breathe = 0.72 + Math.sin(clock.elapsedTime * 2.2 + index) * 0.16;
      pulse.scale.setScalar(breathe);
      const material = pulseMaterialRefs.current[index];
      if (material) material.opacity = 0.22 + travel * 0.34;
    });
  });

  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 240, 0.011, 5, false), [curve]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial ref={threadMaterial} color={cyan} transparent opacity={0.075} toneMapped={false} />
      </mesh>
      {Array.from({ length: profile === "lean" ? 2 : 4 }, (_, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            pulseRefs.current[index] = mesh;
          }}
        >
          <sphereGeometry args={[0.048, 8, 8]} />
          <meshBasicMaterial
            ref={(material) => {
              pulseMaterialRefs.current[index] = material;
            }}
            color={cyan}
            transparent
            opacity={0.22}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function PortalFrame({ position, accent }: { position: [number, number, number]; accent: string }) {
  const glow = useMemo(() => glowColor(accent, 3.4), [accent]);
  return (
    <group position={position}>
      <mesh position={[-4.35, 1.35, 0]}>
        <boxGeometry args={[0.16, 9.05, 0.32]} />
        <meshStandardMaterial color="#141b21" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[4.35, 1.35, 0]}>
        <boxGeometry args={[0.16, 9.05, 0.32]} />
        <meshStandardMaterial color="#141b21" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, 5.85, 0]}>
        <boxGeometry args={[8.85, 0.16, 0.32]} />
        <meshStandardMaterial color="#141b21" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, -3.12, 0.03]}>
        <boxGeometry args={[8.7, 0.035, 0.36]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
    </group>
  );
}

function FacilitySpine() {
  const portals = [
    { z: -11, x: 0.7, color: "#72efff" },
    { z: -43, x: 0.2, color: "#b9ff5d" },
    { z: -76, x: 0.1, color: "#ff8458" },
    { z: -110, x: 0.2, color: "#72fff0" },
    { z: -144, x: 0.4, color: "#ffc85b" },
    { z: -179, x: -0.3, color: "#b9a3ff" },
    { z: -212, x: -0.4, color: "#72efff" },
  ];

  return (
    <group>
      <mesh position={[0, -3.28, -111]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.2, 250]} />
        <meshStandardMaterial color="#030609" metalness={0.04} roughness={0.98} />
      </mesh>
      <mesh position={[0, -3.255, -111]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.032, 250]} />
        <meshBasicMaterial color={glowColor("#72efff", 3.5)} toneMapped={false} />
      </mesh>
      {portals.map((portal) => (
        <PortalFrame
          key={portal.z}
          position={[portal.x, 0, portal.z]}
          accent={portal.color}
        />
      ))}
    </group>
  );
}

function IntroWorld({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const [energized, setEnergized] = useState(false);
  const cyan = useMemo(() => glowColor("#72efff", energized ? 6 : 3.5), [energized]);

  useFrame(({ clock }, delta) => {
    if (!group.current || !core.current) return;
    const proximity = THREE.MathUtils.clamp(1 - progress.current / 0.92, 0, 1);
    group.current.visible = proximity > 0.015;
    core.current.rotation.y += delta * (energized ? 0.48 : 0.18);
    core.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.12;
  });

  return (
    <group ref={group} position={WORLD_POSITIONS[0]}>
      <group
        ref={core}
        position={[2.3, 0.02, 0]}
        onPointerEnter={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "";
        }}
        onClick={() => setEnergized((current) => !current)}
      >
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.18}>
          <Suspense fallback={null}>
            <SourcedSciFiHelmet
              normalizeTo={2.5}
              anchor="center"
              rotation={[0.08, Math.PI, -0.035]}
            />
          </Suspense>
        </Float>
        {[1.48, 1.96, 2.46].map((radius, index) => (
          <mesh key={radius} rotation={[Math.PI / 2 + index * 0.23, index * 0.4, 0]}>
            <torusGeometry args={[radius, index === 1 ? 0.035 : 0.018, 10, 100]} />
            <meshBasicMaterial color={cyan} transparent opacity={0.1 + index * 0.045} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <RoundedBox position={[0.7, -1.05, 0]} args={[7.45, 0.16, 7.45]} radius={0.08}>
        <meshStandardMaterial color="#0b1116" metalness={0.6} roughness={0.38} />
      </RoundedBox>
      {[-2.85, 4.25].map((x) => (
        <mesh key={x} position={[x, 2.1, -0.7]}>
          <boxGeometry args={[0.14, 7, 0.14]} />
          <meshStandardMaterial color="#1a242b" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <pointLight position={[2.3, 0.2, 1.8]} color="#72efff" intensity={energized ? 21 : 10} distance={9} />
      <spotLight
        position={[2.3, 4.2, 2.4]}
        target-position={[2.3, 0, 0]}
        angle={0.42}
        penumbra={0.74}
        color="#e5fbff"
        intensity={energized ? 8 : 4.5}
        distance={12}
      />
      <Sparkles count={28} scale={[8, 6, 8]} size={1.4} speed={0.25} color="#72efff" />
    </group>
  );
}

function ContactWorld({
  progress,
  mobile,
  assembled,
}: {
  progress: MutableRefObject<number>;
  mobile: boolean;
  assembled: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const modules = useRef<(THREE.Group | null)[]>([]);
  const pulse = useRef<THREE.Mesh>(null);
  const pulseMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const trainee = useRef<THREE.Group>(null);
  const completionLight = useRef<THREE.PointLight>(null);
  // Always begin at the three source modules. This also makes a direct load at
  // the bottom of the page play the assembly instead of mounting completed.
  const assemblyEnergy = useRef(0);
  const completionPulse = useRef(0);
  const cyan = useMemo(() => glowColor("#72efff", 4.5), []);
  const sourcePositions = useMemo(
    () => [
      new THREE.Vector3(-0.15, 2.38, 0.22),
      new THREE.Vector3(2.02, -1.42, 0.3),
      new THREE.Vector3(5.85, 1.55, -0.08),
    ],
    [],
  );
  const assembledPositions = useMemo(
    () => [
      new THREE.Vector3(3.18, 2.12, 0.33),
      new THREE.Vector3(3.18, 1.28, 0.27),
      new THREE.Vector3(3.62, 0.72, 0.25),
    ],
    [],
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    const frameDelta = Math.min(delta, 0.05);
    const proximity = THREE.MathUtils.clamp(1 - Math.abs(progress.current - 7) / 0.92, 0, 1);
    group.current.visible = proximity > 0.015;
    const scale = 0.82 + proximity * 0.18;
    group.current.scale.setScalar(scale);
    assemblyEnergy.current = THREE.MathUtils.damp(
      assemblyEnergy.current,
      assembled ? 1 : 0,
      assembled ? 6.5 : 4.2,
      frameDelta,
    );
    modules.current.forEach((module, moduleIndex) => {
      if (!module) return;
      const start = sourcePositions[moduleIndex];
      const destination = assembledPositions[moduleIndex];
      module.position.lerpVectors(start, destination, assemblyEnergy.current);
      if (!assembled) {
        module.position.x += state.pointer.x * (moduleIndex - 1) * 0.16;
        module.position.y += state.pointer.y * (moduleIndex === 1 ? -0.12 : 0.1);
      }
      module.rotation.x = THREE.MathUtils.damp(
        module.rotation.x,
        assembled ? 0 : Math.sin(state.clock.elapsedTime * 0.42 + moduleIndex) * 0.08,
        6,
        frameDelta,
      );
      module.rotation.y = THREE.MathUtils.damp(
        module.rotation.y,
        assembled ? 0 : Math.sin(state.clock.elapsedTime * 0.32 + moduleIndex * 1.7) * 0.18,
        3.5,
        frameDelta,
      );
      module.rotation.z = THREE.MathUtils.damp(
        module.rotation.z,
        assembled ? 0 : Math.sin(state.clock.elapsedTime * 0.45 + moduleIndex) * 0.08,
        6,
        frameDelta,
      );
    });
    if (trainee.current) {
      trainee.current.rotation.y = THREE.MathUtils.damp(
        trainee.current.rotation.y,
        assembled ? 0 : -0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015,
        5,
        frameDelta,
      );
      trainee.current.position.y = THREE.MathUtils.damp(
        trainee.current.position.y,
        assembled ? 0 : Math.sin(state.clock.elapsedTime * 1.2) * 0.012,
        6,
        frameDelta,
      );
    }
    if (pulse.current && pulseMaterial.current) {
      if (!assembled) {
        completionPulse.current = 0;
      } else if (assemblyEnergy.current > 0.68) {
        completionPulse.current = Math.min(1, completionPulse.current + frameDelta * 0.8);
      }
      const pulsePhase = completionPulse.current;
      const pulseEnvelope = pulsePhase > 0 && pulsePhase < 1
        ? Math.sin(pulsePhase * Math.PI)
        : 0;
      pulse.current.scale.setScalar(1 + pulsePhase * 3.2);
      pulse.current.visible = pulseEnvelope > 0.001;
      pulseMaterial.current.opacity = pulseEnvelope * 0.32;
    }
    if (completionLight.current) {
      const targetIntensity = 4 + assemblyEnergy.current * (mobile ? 8 : 18);
      completionLight.current.intensity = THREE.MathUtils.damp(
        completionLight.current.intensity,
        targetIntensity,
        7,
        frameDelta,
      );
    }
  });

  return (
    <group ref={group} position={WORLD_POSITIONS[7]}>
      <group
        position={mobile ? [-2.58, 0.62, 0] : [-1.7, -0.05, 0]}
        scale={mobile ? 0.72 : 1}
      >
        <group position={[-0.28, -1.28, 0.08]}>
          <RoundedBox args={[1.92, 0.18, 1.08]} radius={0.09} smoothness={3}>
            <meshStandardMaterial color="#182329" metalness={0.65} roughness={0.32} />
          </RoundedBox>
          <group position={[0, 0.68, -0.16]} rotation={[-0.28, 0, 0]}>
            <RoundedBox args={[1.62, 0.92, 0.12]} radius={0.08} smoothness={3}>
              <meshStandardMaterial color="#142029" metalness={0.7} roughness={0.25} />
            </RoundedBox>
            <mesh position={[0, 0, 0.068]}>
              <planeGeometry args={[1.42, 0.72]} />
              <meshBasicMaterial color={assembled ? "#1d5260" : "#0b2028"} toneMapped={false} />
            </mesh>
            {[-0.42, 0, 0.42].map((x, statusIndex) => (
              <mesh key={x} position={[x, 0, 0.076]}>
                <circleGeometry args={[0.055, 16]} />
                <meshBasicMaterial color={assembled ? "#72efff" : statusIndex === 0 ? "#72efff" : "#29414a"} toneMapped={false} />
              </mesh>
            ))}
          </group>
        </group>

        <group ref={trainee} position={[3.18, 0, 0]}>
          <mesh position={[0, 2.12, 0]}>
            <sphereGeometry args={[0.3, 22, 16]} />
            <meshStandardMaterial color="#9eadaf" roughness={0.68} />
          </mesh>
          <RoundedBox args={[0.72, 1.05, 0.38]} radius={0.22} smoothness={4} position={[0, 1.25, 0]}>
            <meshStandardMaterial color="#233039" metalness={0.24} roughness={0.5} />
          </RoundedBox>
          {[-0.48, 0.48].map((x) => (
            <mesh key={`arm-${x}`} position={[x, 1.25, 0]} rotation={[0, 0, x < 0 ? -0.12 : 0.12]}>
              <capsuleGeometry args={[0.11, 0.72, 6, 14]} />
              <meshStandardMaterial color="#596970" roughness={0.58} />
            </mesh>
          ))}
          {[-0.22, 0.22].map((x) => (
            <mesh key={`leg-${x}`} position={[x, 0.37, 0]}>
              <capsuleGeometry args={[0.13, 0.72, 6, 14]} />
              <meshStandardMaterial color="#1a242b" roughness={0.62} />
            </mesh>
          ))}
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.78, 0.92, 0.08, 36]} />
            <meshStandardMaterial color="#11191e" emissive={assembled ? "#72efff" : "#0a1014"} emissiveIntensity={assembled ? 0.38 : 0.04} metalness={0.62} roughness={0.32} />
          </mesh>
        </group>

        <group ref={(value) => { modules.current[0] = value; }} position={[-0.15, 2.38, 0.22]}>
          <RoundedBox args={[0.78, 0.34, 0.28]} radius={0.14} smoothness={4}>
            <meshPhysicalMaterial color="#111a20" metalness={0.7} roughness={0.2} clearcoat={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.64, 0.2, 0.025]} radius={0.07} smoothness={3} position={[0, 0, 0.16]}>
            <meshStandardMaterial color="#071116" emissive="#72efff" emissiveIntensity={assembled ? 0.85 : 0.16} roughness={0.18} />
          </RoundedBox>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, -0.08]}>
            <torusGeometry args={[0.36, 0.025, 8, 30, Math.PI * 1.35]} />
            <meshStandardMaterial color="#52616a" metalness={0.6} roughness={0.34} />
          </mesh>
        </group>
        <group ref={(value) => { modules.current[1] = value; }} position={[2.02, -1.42, 0.3]}>
          <RoundedBox args={[0.68, 0.72, 0.12]} radius={0.16} smoothness={4}>
            <meshStandardMaterial color="#141e24" metalness={0.35} roughness={0.44} />
          </RoundedBox>
          {[-0.2, 0, 0.2].flatMap((x) =>
            [-0.22, 0, 0.22].map((y) => (
              <mesh key={`${x}-${y}`} position={[x, y, 0.075]}>
                <circleGeometry args={[0.035, 12]} />
                <meshBasicMaterial color="#72efff" transparent opacity={assembled ? 0.95 : 0.28} toneMapped={false} />
              </mesh>
            )),
          )}
        </group>
        <group ref={(value) => { modules.current[2] = value; }} position={[5.85, 1.55, -0.08]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.038, 8, 28]} />
            <meshStandardMaterial color="#1b272e" metalness={0.66} roughness={0.3} />
          </mesh>
          <RoundedBox args={[0.22, 0.28, 0.065]} radius={0.055} smoothness={3} position={[0, 0, 0.05]}>
            <meshStandardMaterial color="#071116" emissive="#72efff" emissiveIntensity={assembled ? 1.4 : 0.22} roughness={0.2} />
          </RoundedBox>
        </group>
        <Line points={[[-0.28, -0.62, 0.1], [1.3, 0.25, 0.12], [3.18, 2.12, 0.31]]} color="#72efff" lineWidth={2} transparent opacity={assembled ? 0.75 : 0.08} dashed dashSize={0.15} gapSize={0.12} />
        <Line points={[[-0.28, -0.62, 0.1], [1.5, 0.2, 0.12], [3.18, 1.28, 0.25]]} color="#72efff" lineWidth={2} transparent opacity={assembled ? 0.72 : 0.08} dashed dashSize={0.15} gapSize={0.12} />
        <Line points={[[-0.28, -0.62, 0.1], [2.0, -0.1, 0.12], [3.62, 0.72, 0.25]]} color="#72efff" lineWidth={2} transparent opacity={assembled ? 0.72 : 0.08} dashed dashSize={0.15} gapSize={0.12} />
        <mesh ref={pulse} position={[3.18, 1.28, 0.46]} renderOrder={4} visible={false}>
          <ringGeometry args={[0.92, 0.96, 72]} />
          <meshBasicMaterial ref={pulseMaterial} color={cyan} transparent opacity={0} toneMapped={false} depthTest={false} depthWrite={false} />
        </mesh>
      </group>
      <pointLight ref={completionLight} position={[1.48, 0.45, 1.2]} color="#72efff" intensity={4} distance={13} />
    </group>
  );
}

function World({
  progress,
  pointer,
  mobile,
  profile,
  sceneState,
  onUpdateScene,
}: Omit<ExperienceProps, "visible" | "onReady"> & { profile: RenderProfile }) {
  const hoverVideo = chapters.find((chapter) => chapter.world === "hover")?.video ?? "";
  const hoverPoster = chapters.find((chapter) => chapter.world === "hover")?.poster ?? "";
  const flyboxVideo = chapters.find((chapter) => chapter.world === "flybox")?.video ?? "";
  const flyboxPoster = chapters.find((chapter) => chapter.world === "flybox")?.poster ?? "";

  return (
    <>
      <CameraDirector progress={progress} pointer={pointer} mobile={mobile} sceneState={sceneState} />
      <color attach="background" args={["#030609"]} />
      <fog attach="fog" args={["#030609", mobile ? 21 : 22, mobile ? 58 : 72]} />
      <ambientLight intensity={mobile ? 0.4 : 0.12} color="#a9c8d5" />
      <hemisphereLight intensity={mobile ? 0.46 : 0.22} color="#b6dcea" groundColor="#030507" />
      <directionalLight position={[6, 12, 8]} intensity={mobile ? 0.78 : 0.58} color="#dceeff" />
      {!mobile && profile === "full" ? (
        <Suspense fallback={null}>
          <Environment files="/assets/environment/empty-warehouse-01-1k.hdr" environmentIntensity={0.62} />
        </Suspense>
      ) : null}
      <FacilitySpine />
      <SignalThread progress={progress} profile={profile} />
      <SimulationAtmosphere progress={progress} mobile={mobile} profile={profile} />
      <SceneGate progress={progress} index={0}><IntroWorld progress={progress} /></SceneGate>
      <SceneGate progress={progress} index={1}>
        <Suspense fallback={null}><ClinicalSystemWorld progress={progress} index={1} position={WORLD_POSITIONS[1]} mobile={mobile} phase={sceneState.clinicalPhase} onAction={() => onUpdateScene({ clinicalPhase: nextClinicalPhase(sceneState.clinicalPhase) })} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={2}>
        <Suspense fallback={null}><ConnectedSystemWorld progress={progress} index={2} position={WORLD_POSITIONS[2]} mobile={mobile} phase={sceneState.tacticalPhase} onAction={() => onUpdateScene({ tacticalPhase: nextTacticalPhase(sceneState.tacticalPhase) })} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={3}>
        <Suspense fallback={null}><EmergencySystemWorld progress={progress} index={3} position={WORLD_POSITIONS[3]} mobile={mobile} step={sceneState.emergencyStep} onAdvance={() => onUpdateScene({ emergencyStep: sceneState.emergencyStep >= 3 ? 0 : sceneState.emergencyStep + 1 })} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={4}>
        <Suspense fallback={null}><HoverWorld progress={progress} index={4} position={WORLD_POSITIONS[4]} mobile={mobile} videoUrl={hoverVideo} posterUrl={hoverPoster} active={sceneState.hoverBoost} onActiveChange={(hoverBoost: boolean) => onUpdateScene({ hoverBoost })} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={5}>
        <Suspense fallback={null}><FlyboxWorld progress={progress} index={5} position={WORLD_POSITIONS[5]} mobile={mobile} videoUrl={flyboxVideo} posterUrl={flyboxPoster} active={sceneState.flyboxActive} onActiveChange={(flyboxActive: boolean) => onUpdateScene({ flyboxActive })} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={6}>
        <Suspense fallback={null}><MobileWorld progress={progress} index={6} position={WORLD_POSITIONS[6]} mobile={mobile} screens={mobileProducts.map((product) => product.screen)} focused={sceneState.mobileFocus} onFocus={(mobileFocus: number) => onUpdateScene({ mobileFocus })} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={7}><ContactWorld progress={progress} mobile={mobile} assembled={sceneState.contactAssembled} /></SceneGate>
    </>
  );
}

export default function Experience({
  progress,
  pointer,
  mobile,
  visible,
  sceneState,
  onUpdateScene,
  onReady,
}: ExperienceProps) {
  const shots = mobile ? MOBILE_SHOTS : DESKTOP_SHOTS;
  const initialShot = shots[Math.max(0, Math.min(7, Math.round(progress.current)))];
  const [profile, setProfile] = useState<RenderProfile>("full");
  const [adaptiveScale, setAdaptiveScale] = useState(1);
  const [budgetedDpr, setBudgetedDpr] = useState(() => getBudgetedDpr(mobile));

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = getBudgetedDpr(mobile);
      setBudgetedDpr((current) => Math.abs(current - next) > 0.025 ? next : current);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("resize", requestUpdate, { passive: true });
    update();
    return () => {
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [mobile]);

  const handlePerformanceDecline = useCallback(() => {
    setProfile("lean");
    setAdaptiveScale((current) => Math.min(current, 0.78));
  }, []);

  const handlePerformanceFallback = useCallback(() => {
    setProfile("lean");
    setAdaptiveScale(0.64);
  }, []);

  const effectiveDpr = Math.max(0.55, budgetedDpr * adaptiveScale);

  return (
    <div className="canvas-stage" aria-hidden="true">
      <Canvas
        dpr={effectiveDpr}
        camera={{ position: initialShot.position.toArray(), fov: initialShot.fov, near: 0.08, far: 74 }}
        gl={{
          antialias: !mobile,
          alpha: false,
          powerPreference: "high-performance",
        }}
        shadows={false}
        frameloop={visible ? "always" : "never"}
        style={{ touchAction: "pan-y" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = mobile ? 1.08 : 0.88;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          if (isSoftwareRenderer(gl)) {
            setProfile("lean");
            setAdaptiveScale(0.58);
          }
          onReady();
        }}
      >
        <PerformanceMonitor
          ms={500}
          iterations={6}
          threshold={0.75}
          flipflops={1}
          onDecline={handlePerformanceDecline}
          onFallback={handlePerformanceFallback}
        />
        {import.meta.env.DEV ? <DevelopmentDiagnostics /> : null}
        <World
          progress={progress}
          pointer={pointer}
          mobile={mobile}
          profile={profile}
          sceneState={sceneState}
          onUpdateScene={onUpdateScene}
        />
      </Canvas>
    </div>
  );
}
