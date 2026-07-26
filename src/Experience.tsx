import { Suspense, useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, RoundedBox, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { chapters, mobileProducts } from "./content";
import type { WorldKind } from "./content";

const STAGE_GAP = 15;

type ExperienceProps = {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<{ x: number; y: number }>;
  mobile: boolean;
  visible: boolean;
  onReady: () => void;
};

type StageProps = {
  index: number;
  progress: MutableRefObject<number>;
  image: string;
  accent: string;
  alignment: "left" | "right";
  kind: WorldKind;
};

function setTextureColor(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
}

function CameraRig({
  progress,
  pointer,
}: Pick<ExperienceProps, "progress" | "pointer">) {
  const targetPosition = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }, delta) => {
    const value = progress.current;
    const z = 10 - value * STAGE_GAP;
    const driftX = Math.sin(value * 1.17) * 0.2 + pointer.current.x * 0.18;
    const driftY = Math.cos(value * 0.84) * 0.08 + pointer.current.y * 0.1;
    const damping = 1 - Math.exp(-6.5 * Math.min(delta, 0.05));

    targetPosition.current.set(driftX, driftY, z);
    camera.position.lerp(targetPosition.current, damping);

    targetLook.current.lerp(
      new THREE.Vector3(pointer.current.x * 0.08, pointer.current.y * 0.04, z - 10),
      damping,
    );
    camera.lookAt(targetLook.current);
  });

  return null;
}

function FrameCorners({ color }: { color: string }) {
  const w = 5.15;
  const h = 2.9;
  const l = 0.48;
  const corners = [
    [
      [-w + l, h, 0.03],
      [-w, h, 0.03],
      [-w, h - l, 0.03],
    ],
    [
      [w - l, h, 0.03],
      [w, h, 0.03],
      [w, h - l, 0.03],
    ],
    [
      [-w + l, -h, 0.03],
      [-w, -h, 0.03],
      [-w, -h + l, 0.03],
    ],
    [
      [w - l, -h, 0.03],
      [w, -h, 0.03],
      [w, -h + l, 0.03],
    ],
  ] as [number, number, number][][];

  return (
    <>
      {corners.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={color}
          lineWidth={1.4}
          transparent
          opacity={0.75}
        />
      ))}
    </>
  );
}

function ClinicalMotif({ accent }: { accent: string }) {
  const signal = useMemo(
    () =>
      [
        [-4.4, 1.72, 0.2],
        [-3.3, 1.72, 0.2],
        [-2.85, 1.48, 0.2],
        [-2.45, 2.1, 0.2],
        [-1.95, 1.1, 0.2],
        [-1.45, 1.72, 0.2],
        [0.2, 1.72, 0.2],
      ] as [number, number, number][],
    [],
  );

  return (
    <group>
      <Line points={signal} color={accent} lineWidth={1.8} transparent opacity={0.8} />
      <mesh position={[3.6, 1.65, 0.2]}>
        <torusGeometry args={[0.55, 0.018, 8, 96]} />
        <meshBasicMaterial color={accent} transparent opacity={0.7} />
      </mesh>
      <mesh position={[3.6, 1.65, 0.21]}>
        <circleGeometry args={[0.035, 18]} />
        <meshBasicMaterial color={accent} />
      </mesh>
    </group>
  );
}

function TacticalMotif({ accent }: { accent: string }) {
  const points = useMemo(
    () =>
      [
        [-3.8, -1.75, 0.3],
        [-2.25, 1.75, 0.3],
        [-0.6, -1.35, 0.3],
        [1.05, 1.5, 0.3],
        [2.75, -1.4, 0.3],
        [4.05, 1.55, 0.3],
      ] as [number, number, number][],
    [],
  );

  return (
    <group>
      <Line points={points} color={accent} lineWidth={1} transparent opacity={0.42} />
      {points.map((point, index) => (
        <group position={point} key={index}>
          <mesh>
            <ringGeometry args={[0.16, 0.23, 32]} />
            <meshBasicMaterial color={accent} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, -0.04]}>
            <circleGeometry args={[0.38, 32]} />
            <meshBasicMaterial color={accent} transparent opacity={0.08} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EmergencyMotif({ accent }: { accent: string }) {
  const route = useMemo(
    () =>
      [
        [-4.6, -2.2, 0.28],
        [-2.5, -2.2, 0.28],
        [-1.3, -1.55, 0.28],
        [0.4, -1.55, 0.28],
        [1.6, -0.7, 0.28],
        [4.25, -0.7, 0.28],
      ] as [number, number, number][],
    [],
  );

  return (
    <group>
      <Line points={route} color={accent} lineWidth={2.4} transparent opacity={0.9} />
      {[[-1.3, -1.55], [1.6, -0.7], [4.25, -0.7]].map(([x, y], index) => (
        <mesh position={[x, y, 0.3]} key={index}>
          <ringGeometry args={[0.09, 0.15, 24]} />
          <meshBasicMaterial color={accent} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function HoverMotif({ accent }: { accent: string }) {
  return (
    <group>
      {[
        [-3.8, 1.5, 0.3, 0.42],
        [-1.2, 1.9, 0.32, 0.3],
        [3.9, 1.35, 0.31, 0.5],
      ].map(([x, y, z, size], index) => (
        <mesh position={[x, y, z]} key={index} rotation={[0.25, 0.3, 0]}>
          <torusGeometry args={[size, 0.035, 12, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={0.85} />
        </mesh>
      ))}
      <Line
        points={[
          [-4.8, -2.1, 0.2],
          [-2.5, -1.6, 0.2],
          [-0.5, -1.85, 0.2],
          [1.5, -1.1, 0.2],
          [4.7, -1.4, 0.2],
        ]}
        color={accent}
        lineWidth={1.2}
        transparent
        opacity={0.6}
      />
    </group>
  );
}

function FlyboxMotif({ accent }: { accent: string }) {
  return (
    <group>
      {[0.7, 1.25, 1.8].map((radius) => (
        <mesh position={[2.8, 0.15, 0.28]} rotation={[0.08, 0.35, 0]} key={radius}>
          <torusGeometry args={[radius, 0.018, 10, 80]} />
          <meshBasicMaterial color={accent} transparent opacity={0.38} />
        </mesh>
      ))}
      <Line
        points={[
          [-4.8, 0, 0.28],
          [-1.5, 0, 0.28],
          [0, -0.32, 0.28],
          [1.5, 0, 0.28],
          [4.8, 0, 0.28],
        ]}
        color={accent}
        lineWidth={1.5}
        transparent
        opacity={0.6}
      />
    </group>
  );
}

function StageMotif({ kind, accent }: { kind: WorldKind; accent: string }) {
  if (kind === "clinical") return <ClinicalMotif accent={accent} />;
  if (kind === "tactical") return <TacticalMotif accent={accent} />;
  if (kind === "emergency") return <EmergencyMotif accent={accent} />;
  if (kind === "hover") return <HoverMotif accent={accent} />;
  if (kind === "flybox") return <FlyboxMotif accent={accent} />;
  return null;
}

function ChapterBackdrop({
  index,
  progress,
  image,
  accent,
  alignment,
  kind,
}: StageProps) {
  const texture = useTexture(image);
  const group = useRef<THREE.Group>(null);
  const imageMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const glowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const side = alignment === "left" ? 1 : -1;

  useEffect(() => setTextureColor(texture), [texture]);

  useFrame((_, delta) => {
    const proximity = THREE.MathUtils.clamp(1 - Math.abs(progress.current - index) / 1.12, 0, 1);
    if (!group.current || !imageMaterial.current || !glowMaterial.current) return;
    group.current.visible = proximity > 0.008;
    imageMaterial.current.opacity = THREE.MathUtils.damp(
      imageMaterial.current.opacity,
      proximity * 0.92,
      7,
      delta,
    );
    glowMaterial.current.opacity = THREE.MathUtils.damp(
      glowMaterial.current.opacity,
      proximity * 0.1,
      7,
      delta,
    );
    const scale = 0.9 + proximity * 0.1;
    group.current.scale.setScalar(scale);
    group.current.rotation.y = side * (0.045 - proximity * 0.035);
  });

  return (
    <group ref={group} position={[side * 2.75, 0, -index * STAGE_GAP]}>
      <mesh position={[0, 0, -0.08]} scale={[1.04, 1.08, 1]}>
        <planeGeometry args={[10.4, 5.86]} />
        <meshBasicMaterial
          ref={glowMaterial}
          color={accent}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[10.4, 5.86]} />
        <meshBasicMaterial
          ref={imageMaterial}
          map={texture}
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <FrameCorners color={accent} />
      <StageMotif kind={kind} accent={accent} />
    </group>
  );
}

function Phone({
  texture,
  position,
  rotation,
}: {
  texture: THREE.Texture;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[2.18, 4.7, 0.18]} radius={0.24} smoothness={5}>
        <meshStandardMaterial color="#07090d" metalness={0.5} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0, 0.101]}>
        <planeGeometry args={[1.97, 4.35]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.2, 0.11]}>
        <planeGeometry args={[0.62, 0.07]} />
        <meshBasicMaterial color="#20242d" />
      </mesh>
    </group>
  );
}

function MobileWorld({ progress }: { progress: MutableRefObject<number> }) {
  const textures = useTexture(mobileProducts.map((product) => product.screen));
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    textures.forEach(setTextureColor);
  }, [textures]);

  useFrame((state, delta) => {
    const proximity = THREE.MathUtils.clamp(1 - Math.abs(progress.current - 6) / 1.15, 0, 1);
    if (!group.current) return;
    group.current.visible = proximity > 0.008;
    const scale = THREE.MathUtils.damp(group.current.scale.x, 0.84 + proximity * 0.16, 7, delta);
    group.current.scale.setScalar(scale);
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.025;
  });

  const phoneData = [
    { position: [-2.5, 0.15, -0.25] as [number, number, number], rotation: [0, 0.23, -0.05] as [number, number, number] },
    { position: [0, 0.4, 0.25] as [number, number, number], rotation: [0, 0, 0.02] as [number, number, number] },
    { position: [2.5, 0.05, -0.2] as [number, number, number], rotation: [0, -0.23, 0.06] as [number, number, number] },
  ];

  return (
    <group ref={group} position={[2.5, 0, -6 * STAGE_GAP]}>
      {textures.map((texture, index) => (
        <Phone
          key={mobileProducts[index].name}
          texture={texture}
          position={phoneData[index].position}
          rotation={phoneData[index].rotation}
        />
      ))}
      <pointLight position={[0, 1, 3]} intensity={18} distance={12} color="#c8a7ff" />
    </group>
  );
}

function IntroWorld({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const proximity = THREE.MathUtils.clamp(1 - progress.current / 1.05, 0, 1);
    group.current.visible = proximity > 0.008;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.22) * 0.03;
    group.current.scale.setScalar(0.9 + proximity * 0.1);
  });

  return (
    <group ref={group} position={[3.1, 0, 0]}>
      {[1.35, 2.15, 3.05].map((radius, index) => (
        <mesh key={radius} rotation={[0.04 * index, 0.12 * index, 0]}>
          <torusGeometry args={[radius, index === 1 ? 0.025 : 0.012, 12, 128]} />
          <meshBasicMaterial
            color={index === 1 ? "#d7ff4f" : "#74ecff"}
            transparent
            opacity={index === 1 ? 0.72 : 0.3}
          />
        </mesh>
      ))}
      {chapters.map((chapter, index) => {
        const angle = (index / chapters.length) * Math.PI * 2;
        return (
          <mesh
            key={chapter.id}
            position={[Math.cos(angle) * 2.55, Math.sin(angle) * 2.55, 0.12]}
          >
            <circleGeometry args={[0.08, 24]} />
            <meshBasicMaterial color={chapter.accent} />
          </mesh>
        );
      })}
      <Line
        points={chapters.map((_, index) => {
          const angle = (index / chapters.length) * Math.PI * 2;
          return [Math.cos(angle) * 2.55, Math.sin(angle) * 2.55, 0.08] as [number, number, number];
        }).concat([[2.55, 0, 0.08]])}
        color="#74ecff"
        lineWidth={0.8}
        transparent
        opacity={0.32}
      />
    </group>
  );
}

function PortalRail() {
  const path = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => {
        const z = 4 - index * 5.4;
        return [Math.sin(index * 0.7) * 0.34, Math.cos(index * 0.52) * 0.16, z] as [number, number, number];
      }),
    [],
  );

  return (
    <group>
      <Line points={path} color="#74ecff" lineWidth={0.65} transparent opacity={0.16} />
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} position={[0, 0, -(index + 1) * STAGE_GAP + 5]}>
          <torusGeometry args={[5.15, 0.018, 8, 128]} />
          <meshBasicMaterial color={chapters[index]?.accent ?? "#74ecff"} transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

function ContactWorld({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const proximity = THREE.MathUtils.clamp(1 - Math.abs(progress.current - 7) / 1.2, 0, 1);
    group.current.visible = proximity > 0.008;
    group.current.rotation.z = state.clock.elapsedTime * 0.035;
    group.current.scale.setScalar(0.85 + proximity * 0.15);
  });

  return (
    <group ref={group} position={[2.7, 0, -7 * STAGE_GAP]}>
      {[1.1, 2.1, 3.15].map((radius, index) => (
        <mesh key={radius} rotation={[0.2 * index, 0.1 * index, 0]}>
          <torusGeometry args={[radius, index === 1 ? 0.04 : 0.015, 12, 128]} />
          <meshBasicMaterial
            color={index === 1 ? "#d7ff4f" : "#74ecff"}
            transparent
            opacity={index === 1 ? 0.62 : 0.28}
          />
        </mesh>
      ))}
      <pointLight color="#74ecff" intensity={22} distance={9} />
    </group>
  );
}

function World({ progress, pointer, mobile }: Omit<ExperienceProps, "visible" | "onReady">) {
  return (
    <>
      <CameraRig progress={progress} pointer={pointer} />
      <ambientLight intensity={0.42} />
      <fog attach="fog" args={["#05070b", 9, 28]} />
      <Sparkles
        count={mobile ? 34 : 76}
        scale={[18, 10, 112]}
        position={[0, 0, -48]}
        size={mobile ? 0.7 : 1.05}
        speed={0.12}
        opacity={0.34}
        color="#aeefff"
      />
      <PortalRail />
      <IntroWorld progress={progress} />
      {chapters.slice(0, 5).map((chapter, index) => (
        <ChapterBackdrop
          key={chapter.id}
          index={index + 1}
          progress={progress}
          image={chapter.image!}
          accent={chapter.accent}
          alignment={chapter.alignment}
          kind={chapter.world}
        />
      ))}
      <MobileWorld progress={progress} />
      <ContactWorld progress={progress} />
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
  return (
    <div className="canvas-stage" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.15 : 1.5]}
        camera={{ position: [0, 0, 10], fov: mobile ? 49 : 40, near: 0.1, far: 42 }}
        gl={{
          antialias: !mobile,
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop={visible ? "always" : "never"}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          onReady();
        }}
      >
        <color attach="background" args={["#05070b"]} />
        <Suspense fallback={null}>
          <World progress={progress} pointer={pointer} mobile={mobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
