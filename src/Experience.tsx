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
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { chapters, mobileProducts } from "./content";
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
};

const shot = (
  position: [number, number, number],
  lookAt: [number, number, number],
  fov: number,
  aspectShift: number,
): CameraShot => ({
  position: new THREE.Vector3(...position),
  lookAt: new THREE.Vector3(...lookAt),
  fov,
  aspectShift,
});

// Each station owns a composed hero frame. Travel only occupies the middle of a
// scroll segment, so the camera has time to arrive and become still around copy.
const DESKTOP_SHOTS: CameraShot[] = [
  shot([-0.6, 1.2, 12.5], [2, 0.45, -0.4], 40, 0.65),
  shot([-1.2, 1.75, -16.6], [-0.9, -0.05, -28], 39, 0.42),
  shot([4.8, 1.75, -49.2], [1.55, -0.28, -60.2], 39, 0.32),
  shot([-0.2, 1.2, -82.2], [-1.4, -0.75, -93], 39, 0.48),
  shot([1.1, 1.35, -120.2], [-1.8, -0.25, -134.1], 39, 0.58),
  shot([6, 1.7, -149], [5.5, -0.55, -161], 42, 0.3),
  shot([-1.9, 1, -184], [-3.3, -0.7, -196], 39, 0.36),
  shot([0.2, 1.25, -217], [-2.1, -0.25, -228], 40, 0.18),
];

const MOBILE_SHOTS: CameraShot[] = [
  shot([3.2, 1.55, 18.2], [6.8, -0.2, 0], 53, 0),
  shot([1, 2.1, -8.2], [0.7, -0.9, -28], 54, 0),
  shot([-1, 2.1, -38.5], [-1.3, -1.05, -60], 54, 0),
  shot([1.2, 1.7, -71.8], [0.2, -1.2, -93], 54, 0),
  shot([-0.1, 0.9, -121.2], [-0.7, -1.5, -134], 52, 0),
  shot([3.6, 1.1, -149.1], [2, -1.15, -161.4], 52, 0),
  shot([-1.8, 1.25, -178.2], [-1.8, -1, -196], 52, 0),
  shot([0.5, 1.25, -212.2], [-2, -1.05, -228], 51, 0),
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
    targetPosition.current.y += transition * (mobile ? 0.48 : 0.92);
    targetPosition.current.x += transition * (index % 2 === 0 ? 0.18 : -0.18) * (mobile ? 0.35 : 1);

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
      transition * (index % 2 === 0 ? 0.005 : -0.005) + pointer.current.x * 0.0025 * pointerScale,
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
          new THREE.Vector3(0.5, -1.6, -228),
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
}: {
  progress: MutableRefObject<number>;
  mobile: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.Group>(null);
  const cyan = useMemo(() => glowColor("#72efff", 4.5), []);

  useFrame(({ clock }, delta) => {
    if (!group.current || !nodes.current) return;
    const proximity = THREE.MathUtils.clamp(1 - Math.abs(progress.current - 7) / 0.92, 0, 1);
    group.current.visible = proximity > 0.015;
    nodes.current.rotation.z += delta * 0.055;
    nodes.current.rotation.y = Math.sin(clock.elapsedTime * 0.22) * 0.16;
    const scale = 0.82 + proximity * 0.18;
    group.current.scale.setScalar(scale);
  });

  const nodePositions = Array.from({ length: 6 }, (_, index) => {
    const angle = (index / 6) * Math.PI * 2;
    return [Math.cos(angle) * 3.2, Math.sin(angle) * 3.2, 0] as [number, number, number];
  });

  return (
    <group ref={group} position={WORLD_POSITIONS[7]}>
      <group ref={nodes}>
        <Line
          points={[...nodePositions, nodePositions[0]]}
          color="#72efff"
          lineWidth={1.2}
          transparent
          opacity={mobile ? 0.16 : 0.42}
        />
        {nodePositions.map((position, index) => (
          <group key={index} position={position}>
            <mesh>
              <sphereGeometry args={[0.14, 18, 18]} />
              <meshBasicMaterial color={cyan} toneMapped={false} />
            </mesh>
            <mesh>
              <ringGeometry args={[0.28, 0.3, 48]} />
              <meshBasicMaterial color={cyan} transparent opacity={mobile ? 0.22 : 0.5} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshPhysicalMaterial
          color="#72efff"
          roughness={0.03}
          metalness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.04}
          transparent
          opacity={mobile ? 0.18 : 0.38}
          emissive="#123f48"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh scale={0.72}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={cyan} wireframe toneMapped={false} />
      </mesh>
      <pointLight color="#72efff" intensity={mobile ? 13 : 26} distance={13} />
    </group>
  );
}

function PostEffects({ mobile }: { mobile: boolean }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={mobile ? 0.3 : 0.48}
        luminanceThreshold={1.05}
        luminanceSmoothing={0.28}
        mipmapBlur
      />
      <Noise
        premultiply
        opacity={mobile ? 0 : 0.014}
        blendFunction={BlendFunction.SOFT_LIGHT}
      />
      <Vignette offset={0.18} darkness={mobile ? 0.38 : 0.43} eskil={false} />
    </EffectComposer>
  );
}

function World({
  progress,
  pointer,
  mobile,
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
      <SceneGate progress={progress} index={1}><ClinicalWorld progress={progress} index={1} position={WORLD_POSITIONS[1]} mobile={mobile} /></SceneGate>
      <SceneGate progress={progress} index={2}><DefenseWorld progress={progress} index={2} position={WORLD_POSITIONS[2]} mobile={mobile} /></SceneGate>
      <SceneGate progress={progress} index={3}><EmergencyWorld progress={progress} index={3} position={WORLD_POSITIONS[3]} mobile={mobile} /></SceneGate>
      <SceneGate progress={progress} index={4}>
        <Suspense fallback={null}><HoverWorld progress={progress} index={4} position={WORLD_POSITIONS[4]} mobile={mobile} videoUrl={hoverVideo} posterUrl={hoverPoster} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={5}>
        <Suspense fallback={null}><FlyboxWorld progress={progress} index={5} position={WORLD_POSITIONS[5]} mobile={mobile} videoUrl={flyboxVideo} posterUrl={flyboxPoster} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={6}>
        <Suspense fallback={null}><MobileWorld progress={progress} index={6} position={WORLD_POSITIONS[6]} mobile={mobile} screens={mobileProducts.map((product) => product.screen)} /></Suspense>
      </SceneGate>
      <SceneGate progress={progress} index={7}><ContactWorld progress={progress} mobile={mobile} /></SceneGate>
      {!mobile ? <PostEffects mobile={false} /> : null}
    </>
  );
}

export default function Experience({
  progress,
  pointer,
  mobile,
  visible,
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
        <World progress={progress} pointer={pointer} mobile={mobile} />
      </Canvas>
    </div>
  );
}
