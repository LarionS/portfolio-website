import { Suspense, useMemo, useRef, useState } from "react";
import type { MutableRefObject, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Line,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import { chapters, mobileProducts } from "./content";
import type { JourneySceneState } from "./sceneState";
import {
  ClinicalWorld,
  DefenseWorld,
  EmergencyWorld,
} from "./three/TrainingWorlds";
import { FlyboxWorld, HoverWorld, MobileWorld } from "./three/ProductWorlds";
import { SimulationAtmosphere } from "./three/Atmosphere";
import { SourcedSciFiHelmet } from "./three/SourcedAssets";

type ExperienceProps = {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<{ x: number; y: number }>;
  mobile: boolean;
  visible: boolean;
  sceneState: JourneySceneState;
  onUpdateScene: (patch: Partial<JourneySceneState>) => void;
  onReady: () => void;
};

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

function sampleSegment(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, DESKTOP_SHOTS.length - 1);
  const index = Math.min(DESKTOP_SHOTS.length - 2, Math.floor(clamped));
  const fraction = clamped - index;
  return {
    index,
    // Thirty percent of either end is a true hold; the camera travels only
    // through the authored middle beat.
    blend: THREE.MathUtils.smoothstep(fraction, 0.3, 0.7),
  };
}

function glowColor(color: string, intensity = 4) {
  return new THREE.Color(color).multiplyScalar(intensity);
}

function CameraDirector({
  progress,
  pointer,
  mobile,
}: Pick<ExperienceProps, "progress" | "pointer" | "mobile">) {
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
  const activeRef = useRef(Math.abs(progress.current - index) < 1.65);
  const [active, setActive] = useState(activeRef.current);

  useFrame(() => {
    const next = Math.abs(progress.current - index) < 1.65;
    if (next === activeRef.current) return;
    activeRef.current = next;
    setActive(next);
  });

  return active ? children : null;
}

function SignalThread({ progress }: { progress: MutableRefObject<number> }) {
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
      {Array.from({ length: 4 }, (_, index) => (
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
  onToggle,
}: {
  progress: MutableRefObject<number>;
  mobile: boolean;
  assembled: boolean;
  onToggle: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const modules = useRef<(THREE.Group | null)[]>([]);
  const pulse = useRef<THREE.Mesh>(null);
  const pulseMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const core = useRef<THREE.Group>(null);
  const assemblyEnergy = useRef(assembled ? 1 : 0);
  const cyan = useMemo(() => glowColor("#72efff", 4.5), []);
  const sourcePositions = useMemo(
    () => [
      new THREE.Vector3(0.25, 2.35, 0.15),
      new THREE.Vector3(2.45, -1.55, 0.3),
      new THREE.Vector3(5.4, 1.35, -0.25),
    ],
    [],
  );
  const assembledPositions = useMemo(
    () => [
      new THREE.Vector3(2.25, 0.92, 0),
      new THREE.Vector3(3.45, -0.72, 0),
      new THREE.Vector3(4.05, 0.92, 0),
    ],
    [],
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    const proximity = THREE.MathUtils.clamp(1 - Math.abs(progress.current - 7) / 0.92, 0, 1);
    group.current.visible = proximity > 0.015;
    const scale = 0.82 + proximity * 0.18;
    group.current.scale.setScalar(scale);
    assemblyEnergy.current = THREE.MathUtils.damp(
      assemblyEnergy.current,
      assembled ? 1 : 0,
      assembled ? 6.5 : 4.2,
      delta,
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
      module.rotation.y += delta * (0.14 + moduleIndex * 0.05);
      module.rotation.z = Math.sin(state.clock.elapsedTime * 0.45 + moduleIndex) * 0.08 * (1 - assemblyEnergy.current);
    });
    if (core.current) {
      const targetScale = 0.35 + assemblyEnergy.current * 0.65;
      const nextScale = THREE.MathUtils.damp(core.current.scale.x, targetScale, 7, delta);
      core.current.scale.setScalar(nextScale);
      core.current.rotation.y += delta * (assembled ? 0.22 : 0.06);
    }
    if (pulse.current && pulseMaterial.current) {
      const pulsePhase = assembled ? (state.clock.elapsedTime * 0.5) % 1 : 0;
      pulse.current.scale.setScalar(1 + pulsePhase * 3.2);
      pulseMaterial.current.opacity = assembled ? (1 - pulsePhase) * 0.36 : 0;
    }
  });

  return (
    <group ref={group} position={WORLD_POSITIONS[7]}>
      <group
        position={mobile ? [-2.8, 1.55, 0] : [-2, 0, 0]}
        scale={mobile ? 0.72 : 1}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        onPointerEnter={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "";
        }}
      >
        <group ref={(value) => { modules.current[0] = value; }}>
          <RoundedBox args={[1.7, 0.62, 0.5]} radius={0.18} smoothness={4}>
            <meshPhysicalMaterial color="#1b2931" metalness={0.75} roughness={0.22} clearcoat={0.8} />
          </RoundedBox>
          <mesh position={[0.48, 0, 0.31]}>
            <circleGeometry args={[0.12, 24]} />
            <meshBasicMaterial color={cyan} toneMapped={false} />
          </mesh>
        </group>
        <group ref={(value) => { modules.current[1] = value; }}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.58, 0.58, 0.45, 6]} />
            <meshPhysicalMaterial color="#c8a7ff" metalness={0.62} roughness={0.24} clearcoat={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.28]}>
            <ringGeometry args={[0.24, 0.29, 6]} />
            <meshBasicMaterial color={cyan} toneMapped={false} />
          </mesh>
        </group>
        <group ref={(value) => { modules.current[2] = value; }}>
          <mesh rotation={[0.2, 0.1, 0]}>
            <torusKnotGeometry args={[0.46, 0.12, mobile ? 48 : 80, 10, 2, 3]} />
            <meshPhysicalMaterial color="#f5c65c" metalness={0.72} roughness={0.2} clearcoat={0.9} />
          </mesh>
        </group>
        <group ref={core} position={[3.14, 0.08, 0]} scale={0.35}>
          <mesh>
            <dodecahedronGeometry args={[0.78, 1]} />
            <meshPhysicalMaterial color="#07171c" metalness={0.72} roughness={0.16} clearcoat={1} />
          </mesh>
          <mesh scale={0.72}>
            <icosahedronGeometry args={[0.78, 2]} />
            <meshBasicMaterial color={cyan} wireframe transparent opacity={0.78} toneMapped={false} />
          </mesh>
        </group>
        <mesh ref={pulse} position={[3.14, 0.08, -0.05]}>
          <ringGeometry args={[0.92, 0.96, 72]} />
          <meshBasicMaterial ref={pulseMaterial} color={cyan} transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
      <pointLight position={[3.14, 0.08, 1.2]} color="#72efff" intensity={assembled ? (mobile ? 12 : 22) : 5} distance={13} />
    </group>
  );
}

function World({
  progress,
  pointer,
  mobile,
  sceneState,
  onUpdateScene,
}: Omit<ExperienceProps, "visible" | "onReady">) {
  const hoverVideo = chapters.find((chapter) => chapter.world === "hover")?.video ?? "";
  const hoverPoster = chapters.find((chapter) => chapter.world === "hover")?.poster ?? "";
  const flyboxVideo = chapters.find((chapter) => chapter.world === "flybox")?.video ?? "";
  const flyboxPoster = chapters.find((chapter) => chapter.world === "flybox")?.poster ?? "";

  return (
    <>
      <CameraDirector progress={progress} pointer={pointer} mobile={mobile} />
      <color attach="background" args={["#030609"]} />
      <fog attach="fog" args={["#030609", mobile ? 21 : 22, mobile ? 58 : 72]} />
      <ambientLight intensity={mobile ? 0.4 : 0.12} color="#a9c8d5" />
      <hemisphereLight intensity={mobile ? 0.46 : 0.22} color="#b6dcea" groundColor="#030507" />
      <directionalLight position={[6, 12, 8]} intensity={mobile ? 0.78 : 0.58} color="#dceeff" />
      {!mobile ? (
        <Suspense fallback={null}>
          <Environment files="/assets/environment/empty-warehouse-01-1k.hdr" environmentIntensity={0.62} />
        </Suspense>
      ) : null}
      <FacilitySpine />
      <SignalThread progress={progress} />
      <SimulationAtmosphere progress={progress} mobile={mobile} />
      <SceneGate progress={progress} index={0}><IntroWorld progress={progress} /></SceneGate>
      <SceneGate progress={progress} index={1}><ClinicalWorld progress={progress} index={1} position={WORLD_POSITIONS[1]} mobile={mobile} active={sceneState.clinicalActive} onToggle={() => onUpdateScene({ clinicalActive: !sceneState.clinicalActive })} /></SceneGate>
      <SceneGate progress={progress} index={2}><DefenseWorld progress={progress} index={2} position={WORLD_POSITIONS[2]} mobile={mobile} selectedNode={sceneState.tacticalNode} onSelectNode={(tacticalNode) => onUpdateScene({ tacticalNode })} /></SceneGate>
      <SceneGate progress={progress} index={3}><EmergencyWorld progress={progress} index={3} position={WORLD_POSITIONS[3]} mobile={mobile} active={sceneState.emergencyActive} onToggle={() => onUpdateScene({ emergencyActive: !sceneState.emergencyActive })} /></SceneGate>
      <SceneGate progress={progress} index={4}>
        <Suspense fallback={null}><HoverWorld progress={progress} index={4} position={WORLD_POSITIONS[4]} mobile={mobile} videoUrl={hoverVideo} posterUrl={hoverPoster} active={sceneState.hoverBoost} onActiveChange={(hoverBoost: boolean) => onUpdateScene({ hoverBoost })} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={5}>
        <Suspense fallback={null}><FlyboxWorld progress={progress} index={5} position={WORLD_POSITIONS[5]} mobile={mobile} videoUrl={flyboxVideo} posterUrl={flyboxPoster} active={sceneState.flyboxActive} onActiveChange={(flyboxActive: boolean) => onUpdateScene({ flyboxActive })} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={6}>
        <Suspense fallback={null}><MobileWorld progress={progress} index={6} position={WORLD_POSITIONS[6]} mobile={mobile} screens={mobileProducts.map((product) => product.screen)} focused={sceneState.mobileFocus} onFocus={(mobileFocus: number) => onUpdateScene({ mobileFocus })} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={7}><ContactWorld progress={progress} mobile={mobile} assembled={sceneState.contactAssembled} onToggle={() => onUpdateScene({ contactAssembled: !sceneState.contactAssembled })} /></SceneGate>
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

  return (
    <div className="canvas-stage" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1 : 1.35]}
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
          onReady();
        }}
      >
        <World progress={progress} pointer={pointer} mobile={mobile} sceneState={sceneState} onUpdateScene={onUpdateScene} />
      </Canvas>
    </div>
  );
}
