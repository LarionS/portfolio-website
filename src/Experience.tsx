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

type ExperienceProps = {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<{ x: number; y: number }>;
  mobile: boolean;
  visible: boolean;
  onReady: () => void;
};

const WORLD_POSITIONS: [number, number, number][] = [
  [6.2, -0.45, 0],
  [1.5, -1.1, -28],
  [-1.2, -1.1, -60],
  [1.4, -1.15, -93],
  [-0.5, -0.7, -127],
  [1.2, -0.75, -161],
  [-1.8, -0.6, -196],
  [0.5, -0.5, -228],
];

const CAMERA_POINTS = [
  new THREE.Vector3(-0.8, 1.1, 13),
  new THREE.Vector3(0.1, 2.05, -16),
  new THREE.Vector3(4.8, 2.65, -48),
  new THREE.Vector3(0.6, 1.8, -81),
  new THREE.Vector3(-0.4, 1.1, -115),
  new THREE.Vector3(5.3, 2.2, -149),
  new THREE.Vector3(-5.2, 1.8, -184),
  new THREE.Vector3(-0.8, 1.2, -216),
];

const MOBILE_CAMERA_POINTS = [
  new THREE.Vector3(2.8, 1.5, 20),
  new THREE.Vector3(1.5, 2.15, -4),
  new THREE.Vector3(-1.2, 2.35, -36),
  new THREE.Vector3(1.4, 2.15, -69),
  new THREE.Vector3(-0.5, 1.65, -103),
  new THREE.Vector3(1.2, 1.85, -137),
  new THREE.Vector3(-1.8, 1.8, -172),
  new THREE.Vector3(0.5, 1.55, -204),
];

const LOOK_POINTS = [
  new THREE.Vector3(1.1, 0.52, -0.5),
  new THREE.Vector3(-0.8, 0.48, -28),
  new THREE.Vector3(-1.2, 0.12, -60),
  new THREE.Vector3(-1.6, -0.2, -93),
  new THREE.Vector3(-0.5, -0.02, -127),
  new THREE.Vector3(1.2, 0.08, -161),
  new THREE.Vector3(-1.8, 0.06, -196),
  new THREE.Vector3(0.5, 0.42, -228),
];

const MOBILE_LOOK_POINTS = WORLD_POSITIONS.map(
  ([x, y, z], index) =>
    new THREE.Vector3(x, y + (index === 0 || index === 7 ? 0.72 : 0.86), z),
);

function segmentEase(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, 7);
  const index = Math.min(6, Math.floor(clamped));
  const fraction = clamped - index;
  const held = THREE.MathUtils.smoothstep(fraction, 0.1, 0.9);
  return index + held;
}

function glowColor(color: string, intensity = 4) {
  return new THREE.Color(color).multiplyScalar(intensity);
}

function CameraDirector({
  progress,
  pointer,
  mobile,
}: Pick<ExperienceProps, "progress" | "pointer" | "mobile">) {
  const positionCurve = useMemo(
    () => new THREE.CatmullRomCurve3(mobile ? MOBILE_CAMERA_POINTS : CAMERA_POINTS, false, "centripetal", 0.3),
    [mobile],
  );
  const lookCurve = useMemo(
    () => new THREE.CatmullRomCurve3(mobile ? MOBILE_LOOK_POINTS : LOOK_POINTS, false, "centripetal", 0.3),
    [mobile],
  );
  const targetPosition = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const targetQuaternion = useRef(new THREE.Quaternion());
  const director = useRef(new THREE.PerspectiveCamera());
  const initialized = useRef(false);
  const lastProgress = useRef(progress.current);
  const jumpEnergy = useRef(0);

  useFrame(({ camera }, delta) => {
    const value = segmentEase(progress.current);
    const t = THREE.MathUtils.clamp(value / 7, 0, 1);
    positionCurve.getPoint(t, targetPosition.current);
    lookCurve.getPoint(t, targetLook.current);

    const pointerScale = mobile ? 0.28 : 1;
    targetPosition.current.x += pointer.current.x * 0.22 * pointerScale;
    targetPosition.current.y += pointer.current.y * 0.13 * pointerScale;
    targetLook.current.x += pointer.current.x * 0.14 * pointerScale;
    targetLook.current.y += pointer.current.y * 0.08 * pointerScale;

    if (Math.abs(progress.current - lastProgress.current) > 0.34) {
      jumpEnergy.current = 1;
    }
    lastProgress.current = progress.current;
    jumpEnergy.current = THREE.MathUtils.damp(jumpEnergy.current, 0, 4.5, delta);

    const damping = 1 - Math.exp(-(5.2 + jumpEnergy.current * 18) * Math.min(delta, 0.05));
    if (!initialized.current) {
      camera.position.copy(targetPosition.current);
    } else {
      camera.position.lerp(targetPosition.current, damping);
    }

    director.current.position.copy(camera.position);
    director.current.lookAt(targetLook.current);
    director.current.rotateZ(
      Math.sin(value * Math.PI) * 0.012 + pointer.current.x * 0.004,
    );
    targetQuaternion.current.copy(director.current.quaternion);
    if (!initialized.current) {
      camera.quaternion.copy(targetQuaternion.current);
      initialized.current = true;
    } else {
      camera.quaternion.slerp(targetQuaternion.current, damping);
    }

    const baseFov = mobile ? 56 : 41;
    const targetFov = baseFov + (mobile ? 0 : Math.sin(THREE.MathUtils.clamp(value - 3.2, 0, 2.2) * Math.PI) * 3);
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

function SignalThread() {
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(2.3, 0.25, 2),
          new THREE.Vector3(1.2, -0.25, -28),
          new THREE.Vector3(-1.1, 0.15, -60),
          new THREE.Vector3(1.6, -0.2, -93),
          new THREE.Vector3(-0.5, 0.15, -127),
          new THREE.Vector3(1.2, 0.25, -161),
          new THREE.Vector3(-1.8, 0.2, -196),
          new THREE.Vector3(0.5, 0.3, -228),
        ],
        false,
        "centripetal",
        0.26,
      ),
    [],
  );
  const cyan = useMemo(() => glowColor("#72efff", 4.5), []);

  useFrame(({ clock }) => {
    pulseRefs.current.forEach((pulse, index) => {
      if (!pulse) return;
      const t = (clock.elapsedTime * 0.035 + index / pulseRefs.current.length) % 1;
      curve.getPointAt(t, pulse.position);
      const breathe = 0.75 + Math.sin(clock.elapsedTime * 3 + index) * 0.25;
      pulse.scale.setScalar(breathe);
    });
  });

  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 320, 0.018, 6, false), [curve]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={cyan} transparent opacity={0.34} toneMapped={false} />
      </mesh>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            pulseRefs.current[index] = mesh;
          }}
        >
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshBasicMaterial color={cyan} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function PortalFrame({ position, accent }: { position: [number, number, number]; accent: string }) {
  const glow = useMemo(() => glowColor(accent, 3.4), [accent]);
  return (
    <group position={position}>
      <mesh position={[-4.35, 2.25, 0]}>
        <boxGeometry args={[0.16, 7.3, 0.32]} />
        <meshStandardMaterial color="#141b21" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[4.35, 2.25, 0]}>
        <boxGeometry args={[0.16, 7.3, 0.32]} />
        <meshStandardMaterial color="#141b21" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, 5.85, 0]}>
        <boxGeometry args={[8.85, 0.16, 0.32]} />
        <meshStandardMaterial color="#141b21" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, -1.34, 0.03]}>
        <boxGeometry args={[8.7, 0.035, 0.36]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.4, 0.5]} intensity={5} distance={9} color={accent} />
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
      <mesh position={[0, -1.48, -111]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 250]} />
        <meshStandardMaterial color="#030609" metalness={0.04} roughness={0.98} />
      </mesh>
      <mesh position={[0, -1.455, -111]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.045, 250]} />
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
        position={[3.1, 0, 0]}
        onPointerEnter={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "";
        }}
        onClick={() => setEnergized((current) => !current)}
      >
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.18}>
          <mesh>
            <icosahedronGeometry args={[1.2, 2]} />
            <meshPhysicalMaterial
              color="#63d8ea"
              roughness={0.08}
              metalness={0.12}
              clearcoat={1}
              clearcoatRoughness={0.08}
              transparent
              opacity={0.42}
              emissive="#123f48"
              emissiveIntensity={0.65}
            />
          </mesh>
          <mesh scale={0.68}>
            <icosahedronGeometry args={[1.2, 1]} />
            <meshBasicMaterial color={cyan} wireframe toneMapped={false} />
          </mesh>
        </Float>
        {[1.75, 2.35, 3.05].map((radius, index) => (
          <mesh key={radius} rotation={[Math.PI / 2 + index * 0.23, index * 0.4, 0]}>
            <torusGeometry args={[radius, index === 1 ? 0.035 : 0.018, 10, 100]} />
            <meshBasicMaterial color={cyan} transparent opacity={0.26 + index * 0.08} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <RoundedBox position={[0, -1.05, 0]} args={[8.7, 0.18, 8.7]} radius={0.08}>
        <meshStandardMaterial color="#0b1116" metalness={0.6} roughness={0.38} />
      </RoundedBox>
      {[-3.8, 3.8].map((x) => (
        <mesh key={x} position={[x, 2.1, -0.7]}>
          <boxGeometry args={[0.14, 7, 0.14]} />
          <meshStandardMaterial color="#1a242b" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <pointLight position={[3.1, 0, 0]} color="#72efff" intensity={energized ? 28 : 14} distance={12} />
      <Sparkles count={28} scale={[8, 6, 8]} size={1.4} speed={0.25} color="#72efff" />
    </group>
  );
}

function ContactWorld({ progress }: { progress: MutableRefObject<number> }) {
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
          opacity={0.42}
        />
        {nodePositions.map((position, index) => (
          <group key={index} position={position}>
            <mesh>
              <sphereGeometry args={[0.14, 18, 18]} />
              <meshBasicMaterial color={cyan} toneMapped={false} />
            </mesh>
            <mesh>
              <ringGeometry args={[0.28, 0.3, 48]} />
              <meshBasicMaterial color={cyan} transparent opacity={0.5} toneMapped={false} side={THREE.DoubleSide} />
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
          opacity={0.38}
          emissive="#123f48"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh scale={0.72}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={cyan} wireframe toneMapped={false} />
      </mesh>
      <pointLight color="#72efff" intensity={26} distance={13} />
    </group>
  );
}

function PostEffects({ mobile }: { mobile: boolean }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={mobile ? 0.3 : 0.54}
        luminanceThreshold={1.05}
        luminanceSmoothing={0.28}
        mipmapBlur
      />
      <Noise
        premultiply
        opacity={mobile ? 0 : 0.026}
        blendFunction={BlendFunction.SOFT_LIGHT}
      />
      <Vignette offset={0.14} darkness={mobile ? 0.42 : 0.56} eskil={false} />
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
      <fog attach="fog" args={["#030609", 18, mobile ? 55 : 68]} />
      <ambientLight intensity={mobile ? 0.62 : 0.24} color="#a9c8d5" />
      <hemisphereLight intensity={mobile ? 0.74 : 0.38} color="#b6dcea" groundColor="#05080b" />
      <directionalLight position={[6, 12, 8]} intensity={mobile ? 1.24 : 0.82} color="#dceeff" />
      {!mobile ? (
        <Suspense fallback={null}>
          <Environment files="/assets/environment/empty-warehouse-01-1k.hdr" environmentIntensity={0.68} />
        </Suspense>
      ) : null}
      <FacilitySpine />
      <SignalThread />
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
      <SceneGate progress={progress} index={7}><ContactWorld progress={progress} /></SceneGate>
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
  const cameraPoints = mobile ? MOBILE_CAMERA_POINTS : CAMERA_POINTS;
  const initialCamera = cameraPoints[Math.max(0, Math.min(7, Math.round(progress.current)))];

  return (
    <div className="canvas-stage" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1 : 1.35]}
        camera={{ position: initialCamera.toArray(), fov: mobile ? 56 : 41, near: 0.08, far: 74 }}
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
