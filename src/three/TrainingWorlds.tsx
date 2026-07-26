import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { Line, RoundedBox, useCursor } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import systemsInterface from "../../assets/journey/worlds/systems-interface-v1.webp";
import tacticalBackdrop from "../../assets/journey/worlds/tactical-world.webp";
import emergencyBackdrop from "../../assets/journey/worlds/emergency-world.webp";
import {
  SourcedFireExtinguisher,
  SourcedSciFiHelmet,
  SourcedWheelchair,
} from "./SourcedAssets";

type Vec3 = [number, number, number];

export type TrainingWorldProps = {
  progress: MutableRefObject<number>;
  index: number;
  position: Vec3;
  mobile: boolean;
};

const CLINICAL = "#74ecff";
const DEFENSE = "#d7ff4f";
const EMERGENCY = "#ff713f";
const GRAPHITE = "#080d12";
const DARK_METAL = "#101820";
const MID_METAL = "#26343d";

function useInterfaceCrop(
  repeatX: number,
  repeatY: number,
  offsetX: number,
  offsetY: number,
) {
  const source = useLoader(THREE.TextureLoader, systemsInterface);
  const texture = useMemo(() => {
    const cropped = source.clone();
    cropped.colorSpace = THREE.SRGBColorSpace;
    cropped.wrapS = THREE.ClampToEdgeWrapping;
    cropped.wrapT = THREE.ClampToEdgeWrapping;
    cropped.repeat.set(repeatX, repeatY);
    cropped.offset.set(offsetX, offsetY);
    cropped.minFilter = THREE.LinearMipmapLinearFilter;
    cropped.magFilter = THREE.LinearFilter;
    cropped.generateMipmaps = true;
    cropped.needsUpdate = true;
    return cropped;
  }, [offsetX, offsetY, repeatX, repeatY, source]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function EvidenceBackdrop({
  image,
  position,
  size,
  accent,
  tint = "#ffffff",
}: {
  image: string;
  position: Vec3;
  size: [number, number];
  accent: string;
  tint?: string;
}) {
  const texture = useLoader(THREE.TextureLoader, image);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <group position={position}>
      <RoundedBox args={[size[0] + 0.34, size[1] + 0.34, 0.18]} radius={0.08} smoothness={3} position={[0, 0, -0.08]}>
        <meshStandardMaterial color="#080d11" metalness={0.74} roughness={0.24} />
      </RoundedBox>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={texture} color={tint} toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[0, -size[1] / 2 - 0.12, 0.06]}>
        <boxGeometry args={[size[0] + 0.18, 0.045, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.15} />
      </mesh>
    </group>
  );
}

function useWorldPresence(
  progress: MutableRefObject<number>,
  index: number,
  root: MutableRefObject<THREE.Group | null>,
  range = 0.94,
) {
  const presence = useRef(0);

  useFrame((_, delta) => {
    const destination = THREE.MathUtils.smoothstep(
      THREE.MathUtils.clamp(1 - Math.abs(progress.current - index) / range, 0, 1),
      0,
      1,
    );
    presence.current = THREE.MathUtils.damp(
      presence.current,
      destination,
      10,
      Math.min(delta, 0.05),
    );

    const group = root.current;
    if (!group) return;
    group.visible = presence.current > 0.006;
    const scale = 0.985 + presence.current * 0.015;
    group.scale.setScalar(scale);
    group.position.y = -0.12 * (1 - presence.current);
    group.rotation.y = 0.015 * (1 - presence.current);
  });

  return presence;
}

function usePresenceLight(
  light: MutableRefObject<THREE.PointLight | null>,
  presence: MutableRefObject<number>,
  intensity: number,
) {
  useFrame((_, delta) => {
    if (!light.current) return;
    light.current.intensity = THREE.MathUtils.damp(
      light.current.intensity,
      presence.current * intensity,
      6,
      Math.min(delta, 0.05),
    );
  });
}

function Beam({
  start,
  end,
  radius,
  color,
  metalness = 0.45,
  roughness = 0.35,
  emissive,
  emissiveIntensity = 0,
  segments = 10,
}: {
  start: Vec3;
  end: Vec3;
  radius: number;
  color: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  segments?: number;
}) {
  const transform = useMemo(() => {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const midpoint = from.clone().add(to).multiplyScalar(0.5);
    const direction = to.clone().sub(from);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return { midpoint, quaternion, length: direction.length() };
  }, [end, start]);

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion}>
      <cylinderGeometry args={[radius, radius, transform.length, segments]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive ?? color}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

function ClinicalBed({ mobile }: { mobile: boolean }) {
  const segments = mobile ? 8 : 14;

  return (
    <group position={[0, -0.72, 0.15]} rotation={[0, -0.04, 0]}>
      <RoundedBox args={[3.45, 0.48, 1.45]} radius={0.16} smoothness={3} position={[0, -0.74, 0]}>
        <meshStandardMaterial color="#17232b" metalness={0.68} roughness={0.28} />
      </RoundedBox>
      <RoundedBox args={[1.15, 0.58, 0.92]} radius={0.14} smoothness={3} position={[0, -1.2, 0]}>
        <meshStandardMaterial color="#0b1117" metalness={0.72} roughness={0.25} />
      </RoundedBox>
      <RoundedBox args={[5.3, 0.24, 1.85]} radius={0.12} smoothness={4} position={[0, -0.35, 0]}>
        <meshStandardMaterial color="#81929a" metalness={0.72} roughness={0.22} />
      </RoundedBox>
      <RoundedBox args={[5.05, 0.32, 1.68]} radius={0.18} smoothness={4} position={[0, -0.12, 0]}>
        <meshStandardMaterial color="#d7e3e4" roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.23, 1.34]} radius={0.13} smoothness={3} position={[-1.88, 0.13, 0]} rotation={[0, 0, -0.07]}>
        <meshStandardMaterial color="#e9f1ee" roughness={0.74} />
      </RoundedBox>

      {[-0.98, 0.98].map((z) => (
        <group key={z} position={[0, 0.16, z]}>
          <Beam start={[-1.45, 0, 0]} end={[1.48, 0, 0]} radius={0.038} color="#aab9be" />
          <Beam start={[-1.45, -0.34, 0]} end={[-1.45, 0, 0]} radius={0.035} color="#aab9be" />
          <Beam start={[1.48, -0.34, 0]} end={[1.48, 0, 0]} radius={0.035} color="#aab9be" />
        </group>
      ))}

      {[-2.05, 2.05].flatMap((x) =>
        [-0.66, 0.66].map((z) => (
          <group position={[x, -1.46, z]} rotation={[Math.PI / 2, 0, 0]} key={`${x}-${z}`}>
            <mesh>
              <torusGeometry args={[0.19, 0.055, 7, segments]} />
              <meshStandardMaterial color="#121920" metalness={0.52} roughness={0.44} />
            </mesh>
          </group>
        )),
      )}

      <group position={[-0.15, 0.34, 0]}>
        <mesh position={[-1.64, 0.08, 0]} scale={[1, 0.93, 0.93]}>
          <sphereGeometry args={[0.31, segments, Math.max(6, segments / 2)]} />
          <meshStandardMaterial color="#c7d0ce" roughness={0.7} />
        </mesh>
        <mesh position={[-0.75, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.31, 1.12, mobile ? 4 : 7, segments]} />
          <meshStandardMaterial color="#bac5c4" roughness={0.72} />
        </mesh>
        <mesh position={[0.38, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.34, 0.72, mobile ? 4 : 7, segments]} />
          <meshStandardMaterial color="#aebaba" roughness={0.72} />
        </mesh>
        {[-0.29, 0.29].map((z) => (
          <group key={z}>
            <mesh position={[1.18, -0.08, z]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.18, 1.15, mobile ? 4 : 6, segments]} />
              <meshStandardMaterial color="#c0c9c7" roughness={0.72} />
            </mesh>
            <mesh position={[-0.48, -0.08, z * 1.9]} rotation={[0, 0.08, Math.PI / 2]}>
              <capsuleGeometry args={[0.14, 1.05, mobile ? 4 : 6, segments]} />
              <meshStandardMaterial color="#aeb8b7" roughness={0.72} />
            </mesh>
          </group>
        ))}
        {[[-1.64, 0.08, 0.31], [-0.19, 0, 0.32], [0.72, -0.06, 0.26]].map((point, pointIndex) => (
          <mesh position={point as Vec3} key={pointIndex}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color={CLINICAL} emissive={CLINICAL} emissiveIntensity={2.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function ClinicalMonitor({ mobile }: { mobile: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [alert, setAlert] = useState(false);
  const screenMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const interfaceTexture = useInterfaceCrop(0.315, 0.455, 0.008, 0.54);
  useCursor(hovered);

  useEffect(() => {
    const handleAction = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "clinical") {
        setAlert((current) => !current);
      }
    };
    window.addEventListener("larion:scene-action", handleAction);
    return () => window.removeEventListener("larion:scene-action", handleAction);
  }, []);

  const signal = useMemo<Vec3[]>(() => {
    const values = alert
      ? [0, 0.02, -0.03, 0.08, -0.12, 0.52, -0.38, 0.14, 0.02, 0, 0.04, -0.02, 0.06, -0.04, 0.34, -0.28, 0.09, 0]
      : [0, 0.02, 0.01, 0.04, -0.03, 0.29, -0.2, 0.08, 0.02, 0, 0.02, 0.01, 0.03, -0.02, 0.25, -0.17, 0.06, 0];
    return values.map((value, valueIndex) => [
      -0.63 + valueIndex * (1.26 / (values.length - 1)),
      value,
      0.278,
    ]);
  }, [alert]);

  useFrame(({ clock }) => {
    if (!screenMaterial.current) return;
    const beat = 0.5 + Math.sin(clock.elapsedTime * (alert ? 8.5 : 4.3)) * 0.5;
    screenMaterial.current.emissiveIntensity = (hovered ? 1.15 : 0.72) + beat * (alert ? 0.55 : 0.18);
  });

  return (
    <group
      position={[3.32, 0.66, -0.72]}
      rotation={[0, -0.2, 0]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(event) => {
        event.stopPropagation();
        setAlert((current) => !current);
      }}
    >
      <RoundedBox args={[1.7, 1.32, 0.28]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color="#b6c3c7" metalness={0.68} roughness={0.22} />
      </RoundedBox>
      <RoundedBox args={[1.48, 1.03, 0.12]} radius={0.07} smoothness={3} position={[0, 0.05, 0.18]}>
        <meshStandardMaterial
          ref={screenMaterial}
          color="#031012"
          roughness={0.24}
          emissive={alert ? "#ff5d43" : "#072d30"}
          emissiveIntensity={0.8}
        />
      </RoundedBox>
      <mesh position={[0, 0.05, 0.248]}>
        <planeGeometry args={[1.34, 0.88]} />
        <meshBasicMaterial
          map={interfaceTexture}
          color={alert ? "#ff9e8e" : "#ffffff"}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <Line
        points={signal}
        color={alert ? "#ff6b48" : CLINICAL}
        lineWidth={mobile ? 1.1 : 1.8}
        transparent
        opacity={0.95}
      />
      {[0.29, 0.49, 0.69].map((y, lightIndex) => (
        <mesh position={[0.65, y - 0.93, 0.26]} key={y}>
          <circleGeometry args={[0.035, mobile ? 8 : 14]} />
          <meshStandardMaterial
            color={lightIndex === 0 && alert ? "#ff5d43" : CLINICAL}
            emissive={lightIndex === 0 && alert ? "#ff5d43" : CLINICAL}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
      <Beam start={[0, -0.68, -0.02]} end={[0, -2.18, -0.02]} radius={0.045} color="#84969e" />
      <group position={[0, -2.2, -0.02]}>
        {[-0.45, 0, 0.45].map((x) => (
          <Beam key={x} start={[0, 0, 0]} end={[x, -0.08, 0.3]} radius={0.032} color="#71838a" />
        ))}
      </group>
    </group>
  );
}

function IVStand({ mobile }: { mobile: boolean }) {
  return (
    <group position={[-3.25, -1.6, -0.6]}>
      <Beam start={[0, 0, 0]} end={[0, 3.55, 0]} radius={0.035} color="#a8b9bd" />
      <Beam start={[-0.33, 3.53, 0]} end={[0.33, 3.53, 0]} radius={0.025} color="#a8b9bd" />
      {[-0.32, 0.32].map((x) => (
        <group position={[x, 3.02, 0]} key={x}>
          <RoundedBox args={[0.34, 0.72, 0.12]} radius={0.07} smoothness={3}>
            <meshPhysicalMaterial
              color="#c9fbff"
              roughness={0.12}
              transmission={0.66}
              transparent
              opacity={0.72}
              thickness={0.2}
            />
          </RoundedBox>
          <mesh position={[0, -0.03, 0.072]}>
            <boxGeometry args={[0.28, 0.25, 0.015]} />
            <meshStandardMaterial color={CLINICAL} emissive={CLINICAL} emissiveIntensity={0.55} transparent opacity={0.5} />
          </mesh>
          <Beam start={[0, -0.37, 0]} end={[0, -1.18, 0.08]} radius={0.008} color="#91e9ef" metalness={0} roughness={0.2} emissive={CLINICAL} emissiveIntensity={0.4} segments={mobile ? 5 : 8} />
        </group>
      ))}
      {[-0.46, 0, 0.46].map((angle, armIndex) => (
        <Beam
          key={angle}
          start={[0, 0, 0]}
          end={[Math.sin(angle) * 0.65, -0.08, Math.cos(angle) * 0.65]}
          radius={0.025}
          color="#7f9197"
          segments={mobile ? 6 : 10}
        />
      ))}
    </group>
  );
}

function SurgicalLight({ mobile }: { mobile: boolean }) {
  const lamp = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!lamp.current) return;
    lamp.current.rotation.z = Math.sin(clock.elapsedTime * 0.35) * 0.035;
  });

  return (
    <group position={[1.15, 2.65, -0.6]} scale={0.86}>
      <Beam start={[0, 1.0, 0]} end={[0, 0.28, 0]} radius={0.06} color="#71838b" />
      <Beam start={[0, 0.35, 0]} end={[0.68, 0.02, 0.15]} radius={0.055} color="#71838b" />
      <group ref={lamp} position={[0.82, -0.02, 0.2]} rotation={[0.18, -0.1, 0]}>
        <mesh>
          <torusGeometry args={[0.86, 0.11, mobile ? 8 : 12, mobile ? 32 : 64]} />
          <meshStandardMaterial color="#cbd7d9" metalness={0.72} roughness={0.2} />
        </mesh>
        {Array.from({ length: mobile ? 5 : 7 }, (_, bulbIndex) => {
          const angle = (bulbIndex / (mobile ? 5 : 7)) * Math.PI * 2;
          return (
            <mesh position={[Math.cos(angle) * 0.62, Math.sin(angle) * 0.62, 0.04]} key={bulbIndex}>
              <circleGeometry args={[0.12, mobile ? 10 : 18]} />
              <meshStandardMaterial color="#eaffff" emissive={CLINICAL} emissiveIntensity={0.72} />
            </mesh>
          );
        })}
        <mesh position={[0, 0, 0.03]}>
          <circleGeometry args={[0.27, mobile ? 12 : 24]} />
          <meshStandardMaterial color="#e9ffff" emissive={CLINICAL} emissiveIntensity={0.62} />
        </mesh>
      </group>
    </group>
  );
}

function ClinicalRoomShell({ mobile }: { mobile: boolean }) {
  return (
    <group>
      <RoundedBox args={[10.6, 0.18, 8.4]} radius={0.08} smoothness={2} position={[0, -2.05, 0]}>
        <meshStandardMaterial color="#111a20" metalness={0.22} roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[10.6, 6.4, 0.24]} radius={0.08} smoothness={2} position={[0, 1.06, -4.12]}>
        <meshStandardMaterial color="#17232a" metalness={0.16} roughness={0.69} />
      </RoundedBox>
      <RoundedBox args={[0.25, 6.4, 8.4]} radius={0.06} smoothness={2} position={[-5.18, 1.06, 0]}>
        <meshStandardMaterial color="#121c22" metalness={0.18} roughness={0.72} />
      </RoundedBox>
      <Beam start={[-4.7, 0.25, -3.94]} end={[4.7, 0.25, -3.94]} radius={0.055} color="#83949a" />
      <Beam start={[-4.7, 1.38, -3.94]} end={[4.7, 1.38, -3.94]} radius={0.035} color={CLINICAL} emissive={CLINICAL} emissiveIntensity={0.55} />
      {[-4.15, -2.85, 2.42, 3.72].map((x) => (
        <RoundedBox args={[1.05, 1.3, 0.42]} radius={0.09} smoothness={3} position={[x, -1.18, -3.73]} key={x}>
          <meshStandardMaterial color="#26353c" metalness={0.42} roughness={0.46} />
        </RoundedBox>
      ))}
      {[-3.45, -1.15, 1.15, 3.45].map((x) => (
        <group position={[x, 3.5, -1.0]} key={x}>
          <RoundedBox args={[1.5, 0.08, 2.2]} radius={0.03} smoothness={2}>
            <meshStandardMaterial color="#d9edef" emissive="#bceeff" emissiveIntensity={0.48} roughness={0.28} />
          </RoundedBox>
        </group>
      ))}
      {!mobile ? (
        <group position={[-4.3, -0.65, 2.55]}>
          <RoundedBox args={[1.45, 1.55, 1.2]} radius={0.12} smoothness={3}>
            <meshStandardMaterial color="#1c2930" metalness={0.38} roughness={0.5} />
          </RoundedBox>
          <RoundedBox args={[1.18, 0.08, 1.02]} radius={0.03} smoothness={2} position={[0, 0.82, 0]}>
            <meshPhysicalMaterial color="#aac8cc" metalness={0.15} roughness={0.18} transmission={0.3} transparent opacity={0.72} />
          </RoundedBox>
          {[-0.48, 0.48].flatMap((x) =>
            [-0.42, 0.42].map((z) => (
              <mesh position={[x, -0.92, z]} rotation={[Math.PI / 2, 0, 0]} key={`${x}-${z}`}>
                <torusGeometry args={[0.12, 0.04, 7, 12]} />
                <meshStandardMaterial color="#0a0f14" roughness={0.65} />
              </mesh>
            )),
          )}
        </group>
      ) : null}
    </group>
  );
}

export function ClinicalWorld({ progress, index, position, mobile }: TrainingWorldProps) {
  const root = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const presence = useWorldPresence(progress, index, root);
  usePresenceLight(keyLight, presence, mobile ? 5 : 9);

  return (
    <group position={position}>
      <group ref={root} visible={Math.abs(progress.current - index) < 0.94}>
        <ClinicalRoomShell mobile={mobile} />
        <ClinicalBed mobile={mobile} />
        <ClinicalMonitor mobile={mobile} />
        <IVStand mobile={mobile} />
        <SurgicalLight mobile={mobile} />
        <Suspense fallback={null}>
          <SourcedWheelchair
            normalizeTo={1.86}
            position={[2.72, -2.03, 1.38]}
            rotation={[0, -2.42, 0]}
            shadows={false}
          />
        </Suspense>
        <pointLight ref={keyLight} position={[0.7, 2.15, 1.8]} color="#b9f7ff" intensity={0} distance={11} decay={2} />
        <pointLight position={[-3.7, -0.2, -1.8]} color={CLINICAL} intensity={mobile ? 1.6 : 2.8} distance={6} decay={2} />
      </group>
    </group>
  );
}

const DEFENSE_POSITIONS: Vec3[] = [
  [-3.72, -1.15, 1.1],
  [-3.2, -1.15, -1.52],
  [-1.42, -1.15, -3.26],
  [1.42, -1.15, -3.26],
  [3.2, -1.15, -1.52],
  [3.72, -1.15, 1.1],
];

const DEFENSE_EVIDENCE_NODES: Vec3[] = [
  [-3.5, -0.55, -4.22],
  [-2.15, 0.38, -4.22],
  [-0.72, -0.02, -4.22],
  [0.72, 0.38, -4.22],
  [2.15, -0.02, -4.22],
  [3.5, -0.55, -4.22],
];

function TraineeNode({
  position,
  nodeIndex,
  active,
  selected,
  mobile,
  onHover,
  onSelect,
}: {
  position: Vec3;
  nodeIndex: number;
  active: boolean;
  selected: boolean;
  mobile: boolean;
  onHover: (node: number | null) => void;
  onSelect: (node: number) => void;
}) {
  const inner = useRef<THREE.Group>(null);
  const vest = useRef<THREE.MeshStandardMaterial>(null);
  const segments = mobile ? 8 : 14;
  const yaw = Math.atan2(-position[0], -position[2]);

  useFrame(({ clock }, delta) => {
    if (!inner.current) return;
    const targetScale = selected ? 1.075 : 1;
    const scale = THREE.MathUtils.damp(inner.current.scale.x, targetScale, 8, delta);
    inner.current.scale.setScalar(scale);
    inner.current.position.y = Math.sin(clock.elapsedTime * 1.2 + nodeIndex * 0.9) * 0.018;
    if (vest.current) {
      const pulse = 0.5 + Math.sin(clock.elapsedTime * (active ? 3.2 : 1.1) + nodeIndex) * 0.5;
      vest.current.emissiveIntensity = active ? 0.2 + pulse * 0.7 : 0.04;
    }
  });

  const vital = useMemo<Vec3[]>(
    () => [
      [-0.47, 2.42, 0.2],
      [-0.31, 2.42, 0.2],
      [-0.23, 2.31, 0.2],
      [-0.13, 2.58, 0.2],
      [-0.02, 2.35, 0.2],
      [0.1, 2.42, 0.2],
      [0.46, 2.42, 0.2],
    ],
    [],
  );

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <group
        ref={inner}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(nodeIndex);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(nodeIndex);
        }}
      >
        <mesh position={[0, 2.02, 0]}>
          <sphereGeometry args={[0.32, segments, Math.max(6, segments / 2)]} />
          <meshStandardMaterial color="#7e8d91" roughness={0.62} metalness={0.18} />
        </mesh>
        <mesh position={[0, 2.03, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.36, 0.055, 8, segments * 2]} />
          <meshStandardMaterial color="#11191e" metalness={0.72} roughness={0.22} />
        </mesh>
        <RoundedBox args={[0.69, 0.27, 0.28]} radius={0.09} smoothness={3} position={[0, 2.04, 0.31]}>
          <meshStandardMaterial color="#05090c" emissive={active ? DEFENSE : "#172016"} emissiveIntensity={active ? 0.36 : 0.04} metalness={0.7} roughness={0.2} />
        </RoundedBox>
        <RoundedBox args={[0.88, 1.15, 0.48]} radius={0.16} smoothness={3} position={[0, 1.08, 0]}>
          <meshStandardMaterial color="#273239" roughness={0.56} metalness={0.22} />
        </RoundedBox>
        <RoundedBox args={[0.73, 0.78, 0.12]} radius={0.1} smoothness={3} position={[0, 1.12, 0.31]}>
          <meshStandardMaterial ref={vest} color="#111a19" emissive={DEFENSE} emissiveIntensity={0.2} roughness={0.48} metalness={0.28} />
        </RoundedBox>
        {[-0.25, 0, 0.25].flatMap((x) =>
          [0.89, 1.1, 1.31].map((y) => (
            <mesh position={[x, y, 0.39]} key={`${x}-${y}`}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color={DEFENSE} emissive={DEFENSE} emissiveIntensity={active ? 1.5 : 0.16} />
            </mesh>
          )),
        )}
        <Beam start={[-0.34, 1.55, 0]} end={[-0.58, 0.62, 0.14]} radius={0.1} color="#66757a" segments={segments} />
        <Beam start={[0.34, 1.55, 0]} end={[0.56, 0.72, 0.32]} radius={0.1} color="#66757a" segments={segments} />
        <Beam start={[-0.22, 0.52, 0]} end={[-0.27, -0.65, 0.08]} radius={0.12} color="#39464b" segments={segments} />
        <Beam start={[0.22, 0.52, 0]} end={[0.27, -0.65, 0.08]} radius={0.12} color="#39464b" segments={segments} />
        <group position={[-0.57, 0.78, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.12, 0.04, 7, 16]} />
            <meshStandardMaterial color="#11171a" metalness={0.72} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <circleGeometry args={[0.075, 12]} />
            <meshStandardMaterial color={active ? DEFENSE : "#314038"} emissive={DEFENSE} emissiveIntensity={active ? 1.1 : 0.12} />
          </mesh>
        </group>
        <group position={[0.45, 0.78, 0.48]} rotation={[0.02, 0, -0.42]}>
          <RoundedBox args={[1.12, 0.13, 0.16]} radius={0.04} smoothness={2}>
            <meshStandardMaterial color="#151c20" metalness={0.72} roughness={0.26} />
          </RoundedBox>
          <RoundedBox args={[0.35, 0.3, 0.16]} radius={0.03} smoothness={2} position={[-0.38, -0.16, 0]}>
            <meshStandardMaterial color="#263135" metalness={0.54} roughness={0.38} />
          </RoundedBox>
          <Beam start={[0.52, 0, 0]} end={[0.88, 0, 0]} radius={0.035} color="#667274" segments={8} />
        </group>
        <Line points={vital} color={active ? DEFENSE : "#4a564a"} lineWidth={mobile ? 0.8 : 1.25} transparent opacity={active ? 0.86 : 0.28} />
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.62, 0.78, 0.11, mobile ? 16 : 28]} />
          <meshStandardMaterial color="#10171b" metalness={0.48} roughness={0.38} emissive={active ? DEFENSE : "#000000"} emissiveIntensity={active ? 0.18 : 0} />
        </mesh>
      </group>
    </group>
  );
}

function NetworkPulse({ start, active, offset, mobile }: { start: Vec3; active: boolean; offset: number; mobile: boolean }) {
  const pulse = useRef<THREE.Mesh>(null);
  const from = useMemo(() => new THREE.Vector3(start[0], start[1] + 1.15, start[2]), [start]);
  const to = useMemo(() => new THREE.Vector3(0, -0.15, 0), []);

  useFrame(({ clock }) => {
    if (!pulse.current) return;
    pulse.current.visible = active;
    const t = (clock.elapsedTime * 0.34 + offset) % 1;
    pulse.current.position.lerpVectors(from, to, t);
    const scale = 0.7 + Math.sin(t * Math.PI) * 0.55;
    pulse.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={pulse} visible={active}>
      <sphereGeometry args={[mobile ? 0.045 : 0.06, 8, 8]} />
      <meshStandardMaterial color={DEFENSE} emissive={DEFENSE} emissiveIntensity={2.6} />
    </mesh>
  );
}

function InstructorConsole({
  scenario,
  hovered,
  mobile,
  onHover,
  onAdvance,
}: {
  scenario: number;
  hovered: boolean;
  mobile: boolean;
  onHover: (hovered: boolean) => void;
  onAdvance: () => void;
}) {
  const screen = useRef<THREE.MeshStandardMaterial>(null);
  const dashboardTexture = useInterfaceCrop(0.36, 0.55, 0.32, 0.2);

  useFrame(({ clock }) => {
    if (!screen.current) return;
    screen.current.emissiveIntensity = (hovered ? 1.15 : 0.68) + Math.sin(clock.elapsedTime * 2.4) * 0.08;
  });

  return (
    <group
      position={[0, -1.17, 4.05]}
      rotation={[-0.02, 0, 0]}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
      onClick={(event) => {
        event.stopPropagation();
        onAdvance();
      }}
    >
      <RoundedBox args={[3.75, 0.26, 1.25]} radius={0.12} smoothness={3} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#182228" metalness={0.62} roughness={0.3} />
      </RoundedBox>
      <Beam start={[-1.45, 0, 0]} end={[-1.45, -0.86, 0]} radius={0.08} color="#2b383d" />
      <Beam start={[1.45, 0, 0]} end={[1.45, -0.86, 0]} radius={0.08} color="#2b383d" />
      <group position={[-0.45, 0.88, -0.22]} rotation={[-0.32, 0, 0]}>
        <RoundedBox args={[2.35, 1.35, 0.13]} radius={0.08} smoothness={3}>
          <meshStandardMaterial color="#111a1c" metalness={0.54} roughness={0.28} />
        </RoundedBox>
        <RoundedBox args={[2.08, 1.09, 0.035]} radius={0.04} smoothness={2} position={[0, 0, 0.085]}>
          <meshStandardMaterial ref={screen} color="#0a130b" emissive="#243410" emissiveIntensity={0.72} roughness={0.32} />
        </RoundedBox>
        <mesh position={[0, 0, 0.111]}>
          <planeGeometry args={[1.98, 0.99]} />
          <meshBasicMaterial map={dashboardTexture} toneMapped={false} fog={false} />
        </mesh>
        {Array.from({ length: 6 }, (_, unitIndex) => (
          <group position={[-0.82 + (unitIndex % 3) * 0.82, 0.24 - Math.floor(unitIndex / 3) * 0.48, 0.13]} key={unitIndex}>
            <RoundedBox args={[0.62, 0.28, 0.02]} radius={0.025} smoothness={2}>
              <meshStandardMaterial
                color={unitIndex < scenario ? "#a7ca39" : "#253029"}
                emissive={unitIndex < scenario ? DEFENSE : "#101410"}
                emissiveIntensity={unitIndex < scenario ? 0.72 : 0.08}
                roughness={0.42}
                transparent
                opacity={0.34}
              />
            </RoundedBox>
          </group>
        ))}
      </group>
      <group position={[1.18, 0.56, 0.18]} rotation={[-0.72, 0.08, -0.04]}>
        <RoundedBox args={[0.9, 1.25, 0.095]} radius={0.1} smoothness={3}>
          <meshStandardMaterial color="#11181c" metalness={0.65} roughness={0.25} />
        </RoundedBox>
        <RoundedBox args={[0.75, 1.03, 0.025]} radius={0.06} smoothness={2} position={[0, 0, 0.058]}>
          <meshStandardMaterial color="#17200e" emissive={DEFENSE} emissiveIntensity={hovered ? 0.8 : 0.35} roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0, 0.074]}>
          <planeGeometry args={[0.68, 0.93]} />
          <meshBasicMaterial map={dashboardTexture} toneMapped={false} fog={false} />
        </mesh>
        <Line
          points={[[-0.28, -0.1, 0.084], [-0.15, -0.1, 0.084], [-0.08, -0.24, 0.084], [0.02, 0.2, 0.084], [0.12, -0.1, 0.084], [0.29, -0.1, 0.084]]}
          color={DEFENSE}
          lineWidth={mobile ? 0.8 : 1.2}
        />
      </group>
    </group>
  );
}

export function DefenseWorld({ progress, index, position, mobile }: TrainingWorldProps) {
  const root = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const [scenario, setScenario] = useState(6);
  const [consoleHovered, setConsoleHovered] = useState(false);
  const presence = useWorldPresence(progress, index, root);
  usePresenceLight(keyLight, presence, mobile ? 7 : 13);
  useCursor(consoleHovered);

  useEffect(() => {
    const handleAction = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "tactical") {
        setScenario((current) => (current % 6) + 1);
      }
    };
    window.addEventListener("larion:scene-action", handleAction);
    return () => window.removeEventListener("larion:scene-action", handleAction);
  }, []);

  return (
    <group position={position}>
      <group ref={root} visible={Math.abs(progress.current - index) < 0.94}>
        <mesh position={[0, -1.98, 0]}>
          <cylinderGeometry args={[5.9, 6.15, 0.22, mobile ? 32 : 56]} />
          <meshStandardMaterial color="#0c1216" metalness={0.42} roughness={0.55} />
        </mesh>
        <mesh position={[0, -1.83, 0]}>
          <torusGeometry args={[4.58, 0.035, 8, mobile ? 48 : 88]} />
          <meshStandardMaterial color={DEFENSE} emissive={DEFENSE} emissiveIntensity={0.42} roughness={0.25} transparent opacity={0.2} />
        </mesh>
        <EvidenceBackdrop
          image={tacticalBackdrop}
          position={[0, 0.65, -4.42]}
          size={mobile ? [8.6, 4.84] : [10.5, 5.91]}
          accent={DEFENSE}
          tint={scenario === 1 ? "#d8ff90" : "#ffffff"}
        />
        <group position={[0, -1.36, 0]}>
          <mesh>
            <cylinderGeometry args={[1.3, 1.65, 0.82, mobile ? 24 : 40]} />
            <meshStandardMaterial color="#172127" metalness={0.64} roughness={0.28} />
          </mesh>
          <Suspense fallback={null}>
            <SourcedSciFiHelmet
              normalizeTo={1.55}
              position={[0, 0.84, 0]}
              rotation={[0.02, -0.52, 0.03]}
              shadows={false}
            />
          </Suspense>
          <mesh position={[0, 0.48, 0.28]}>
            <sphereGeometry args={[0.22, 12, 8]} />
            <meshStandardMaterial color={DEFENSE} emissive={DEFENSE} emissiveIntensity={2.1} transparent opacity={0.62} />
          </mesh>
        </group>

        {DEFENSE_EVIDENCE_NODES.map((nodePosition, nodeIndex) => (
          <group key={nodeIndex}>
            <Line
              points={[
                [nodePosition[0], nodePosition[1] + 1.15, nodePosition[2]],
                [0, -0.15, 0],
              ]}
              color={nodeIndex < scenario ? DEFENSE : "#35403a"}
              lineWidth={mobile ? 0.7 : 1.15}
              transparent
              opacity={nodeIndex < scenario ? 0.58 : 0.16}
            />
            <NetworkPulse start={nodePosition} active={nodeIndex < scenario} offset={nodeIndex / 6} mobile={mobile} />
            <mesh position={nodePosition}>
              <circleGeometry args={[nodeIndex < scenario ? 0.1 : 0.065, mobile ? 12 : 20]} />
              <meshStandardMaterial
                color={nodeIndex < scenario ? DEFENSE : "#39423e"}
                emissive={DEFENSE}
                emissiveIntensity={nodeIndex < scenario ? 1.7 : 0.04}
              />
            </mesh>
          </group>
        ))}

        <InstructorConsole
          scenario={scenario}
          hovered={consoleHovered}
          mobile={mobile}
          onHover={setConsoleHovered}
          onAdvance={() => setScenario((current) => (current % 6) + 1)}
        />

        <pointLight ref={keyLight} position={[0, 2.4, 1.4]} color="#e7ff8a" intensity={0} distance={12} decay={2} />
        <pointLight position={[0, -0.2, 0]} color={DEFENSE} intensity={mobile ? 3 : 5.5} distance={7} decay={2} />
      </group>
    </group>
  );
}

const EMERGENCY_ROUTE: Vec3[] = [
  [4.4, -1.83, 2.5],
  [3.1, -1.83, 2.05],
  [1.55, -1.83, 1.75],
  [0.4, -1.83, 1.0],
  [-0.45, -1.83, 0.72],
  [-1.35, -1.83, 0.56],
  [-2.3, -1.83, 0.45],
];

function RouteLight({ position, lightIndex, active, mobile }: { position: Vec3; lightIndex: number; active: boolean; mobile: boolean }) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!material.current) return;
    const wave = 0.5 + Math.sin(clock.elapsedTime * 4.8 - lightIndex * 0.82) * 0.5;
    material.current.emissiveIntensity = active ? 0.35 + wave * 2.4 : 0.08;
  });
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[mobile ? 0.09 : 0.12, mobile ? 0.15 : 0.2, mobile ? 12 : 20]} />
      <meshStandardMaterial ref={material} color={active ? EMERGENCY : "#384147"} emissive={EMERGENCY} emissiveIntensity={0.5} roughness={0.34} />
    </mesh>
  );
}

function EmergencyVehicle({ mobile }: { mobile: boolean }) {
  const redLight = useRef<THREE.MeshStandardMaterial>(null);
  const blueLight = useRef<THREE.MeshStandardMaterial>(null);
  const segments = mobile ? 10 : 18;

  useFrame(({ clock }) => {
    const flash = Math.sin(clock.elapsedTime * 9) > 0;
    if (redLight.current) redLight.current.emissiveIntensity = flash ? 3.5 : 0.18;
    if (blueLight.current) blueLight.current.emissiveIntensity = flash ? 0.18 : 3.5;
  });

  return (
    <group position={[3.45, -0.94, -1.85]} rotation={[0, -0.13, 0]}>
      <RoundedBox args={[4.25, 1.75, 1.72]} radius={0.2} smoothness={3}>
        <meshStandardMaterial color="#7f2118" metalness={0.42} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[1.42, 1.42, 1.6]} radius={0.18} smoothness={3} position={[-1.62, 0.08, 0]}>
        <meshStandardMaterial color="#b83724" metalness={0.36} roughness={0.38} />
      </RoundedBox>
      <RoundedBox args={[1.08, 0.56, 0.025]} radius={0.07} smoothness={2} position={[-1.68, 0.36, 0.82]}>
        <meshPhysicalMaterial color="#8bd8e4" roughness={0.16} metalness={0.12} transmission={0.18} transparent opacity={0.78} />
      </RoundedBox>
      {[-0.9, 0.15, 1.1].map((x) => (
        <RoundedBox args={[0.72, 0.44, 0.05]} radius={0.04} smoothness={2} position={[x, 0.25, 0.89]} key={x}>
          <meshStandardMaterial color="#611914" metalness={0.45} roughness={0.44} />
        </RoundedBox>
      ))}
      <RoundedBox args={[2.55, 0.18, 0.045]} radius={0.035} smoothness={2} position={[0.52, -0.2, 0.9]}>
        <meshStandardMaterial color="#e6eee9" metalness={0.45} roughness={0.28} />
      </RoundedBox>
      {[-1.46, 1.42].flatMap((x) =>
        [-0.82, 0.82].map((z) => (
          <mesh position={[x, -0.86, z]} rotation={[Math.PI / 2, 0, 0]} key={`${x}-${z}`}>
            <cylinderGeometry args={[0.45, 0.45, 0.24, segments]} />
            <meshStandardMaterial color="#080b0d" roughness={0.7} />
          </mesh>
        )),
      )}
      <group position={[-0.72, 1.08, 0]}>
        <RoundedBox args={[0.72, 0.13, 0.26]} radius={0.04} smoothness={2} position={[-0.39, 0, 0]}>
          <meshStandardMaterial ref={redLight} color="#ff432e" emissive="#ff311f" emissiveIntensity={2} />
        </RoundedBox>
        <RoundedBox args={[0.72, 0.13, 0.26]} radius={0.04} smoothness={2} position={[0.39, 0, 0]}>
          <meshStandardMaterial ref={blueLight} color="#41baff" emissive="#2a9cff" emissiveIntensity={0.2} />
        </RoundedBox>
      </group>
    </group>
  );
}

function Responder({
  position,
  color,
  responderIndex,
  contained,
  mobile,
}: {
  position: Vec3;
  color: string;
  responderIndex: number;
  contained: boolean;
  mobile: boolean;
}) {
  const responder = useRef<THREE.Group>(null);
  const segments = mobile ? 8 : 14;
  useFrame(({ clock }, delta) => {
    if (!responder.current) return;
    const destination = contained ? -0.32 : 0;
    responder.current.position.z = THREE.MathUtils.damp(responder.current.position.z, destination, 4, delta);
    responder.current.position.y = Math.sin(clock.elapsedTime * 1.5 + responderIndex) * 0.018;
  });
  return (
    <group position={position} rotation={[0, -0.45 + responderIndex * 0.18, 0]}>
      <group ref={responder}>
        <mesh position={[0, 1.82, 0]}>
          <sphereGeometry args={[0.3, segments, Math.max(6, segments / 2)]} />
          <meshStandardMaterial color="#66747a" roughness={0.62} />
        </mesh>
        <mesh position={[0, 1.96, 0]} scale={[1.06, 0.48, 1.06]}>
          <sphereGeometry args={[0.34, segments, Math.max(6, segments / 2)]} />
          <meshStandardMaterial color="#313c41" metalness={0.46} roughness={0.38} />
        </mesh>
        <mesh position={[0, 1.92, 0.31]}>
          <boxGeometry args={[0.58, 0.075, 0.08]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} metalness={0.3} roughness={0.36} />
        </mesh>
        <RoundedBox args={[0.9, 1.15, 0.5]} radius={0.14} smoothness={3} position={[0, 0.94, 0]}>
          <meshStandardMaterial color="#252f34" roughness={0.58} metalness={0.2} />
        </RoundedBox>
        <mesh position={[0, 1.1, 0.27]}>
          <boxGeometry args={[0.76, 0.1, 0.035]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.82} />
        </mesh>
        <Beam start={[-0.32, 1.35, 0]} end={[-0.55, 0.52, 0.2]} radius={0.1} color="#536066" segments={segments} />
        <Beam start={[0.32, 1.35, 0]} end={[0.58, 0.64, 0.34]} radius={0.1} color="#536066" segments={segments} />
        <Beam start={[-0.2, 0.44, 0]} end={[-0.25, -0.68, 0.04]} radius={0.12} color="#303b40" segments={segments} />
        <Beam start={[0.2, 0.44, 0]} end={[0.25, -0.68, 0.04]} radius={0.12} color="#303b40" segments={segments} />
        {responderIndex === 1 ? (
          <group position={[0.58, 0.52, 0.38]} rotation={[0, 0, -0.44]}>
            <Beam start={[0, -0.4, 0]} end={[0, 0.55, 0]} radius={0.045} color="#8d9a9d" />
            <mesh position={[0, 0.64, 0]}>
              <boxGeometry args={[0.42, 0.13, 0.09]} />
              <meshStandardMaterial color="#c9d1d0" metalness={0.62} roughness={0.24} />
            </mesh>
          </group>
        ) : null}
      </group>
    </group>
  );
}

function FireAndSmoke({ contained, mobile, position = [-2.3, -1.82, 0.45] }: { contained: boolean; mobile: boolean; position?: Vec3 }) {
  const flame = useRef<THREE.Group>(null);
  const fireLight = useRef<THREE.PointLight>(null);
  const smoke = useRef<THREE.Group>(null);
  const puffs = useMemo(
    () =>
      Array.from({ length: mobile ? 5 : 9 }, (_, puffIndex) => ({
        position: [
          Math.sin(puffIndex * 2.13) * (0.2 + puffIndex * 0.035),
          0.35 + puffIndex * 0.31,
          Math.cos(puffIndex * 1.71) * (0.18 + puffIndex * 0.025),
        ] as Vec3,
        scale: 0.42 + (puffIndex % 3) * 0.16,
      })),
    [mobile],
  );

  useFrame(({ clock }, delta) => {
    if (flame.current) {
      const flicker = 0.9 + Math.sin(clock.elapsedTime * 8.1) * 0.09 + Math.sin(clock.elapsedTime * 13.4) * 0.04;
      const target = contained ? 0.32 : flicker;
      flame.current.scale.y = THREE.MathUtils.damp(flame.current.scale.y, target, 5, delta);
      flame.current.scale.x = THREE.MathUtils.damp(flame.current.scale.x, contained ? 0.48 : 1, 5, delta);
      flame.current.rotation.y = clock.elapsedTime * 0.18;
    }
    if (fireLight.current) {
      fireLight.current.intensity = THREE.MathUtils.damp(
        fireLight.current.intensity,
        contained ? 1.1 : 8 + Math.sin(clock.elapsedTime * 10) * 1.3,
        7,
        delta,
      );
    }
    if (smoke.current) {
      smoke.current.position.y = THREE.MathUtils.damp(smoke.current.position.y, contained ? 0.28 : 0, 2, delta);
      smoke.current.rotation.y = clock.elapsedTime * 0.035;
      const smokeScale = THREE.MathUtils.damp(smoke.current.scale.x, contained ? 0.58 : 1, 2, delta);
      smoke.current.scale.setScalar(smokeScale);
    }
  });

  return (
    <group position={position}>
      <group ref={flame}>
        <mesh position={[0, 0.52, 0]}>
          <coneGeometry args={[0.48, 1.25, mobile ? 8 : 14]} />
          <meshStandardMaterial color="#ff3d1f" emissive="#ff2b12" emissiveIntensity={2.1} transparent opacity={0.84} roughness={0.4} />
        </mesh>
        <mesh position={[0.04, 0.54, 0.04]} scale={[0.55, 0.7, 0.55]}>
          <coneGeometry args={[0.46, 1.1, mobile ? 8 : 14]} />
          <meshStandardMaterial color="#ffd261" emissive="#ff9d24" emissiveIntensity={3.2} transparent opacity={0.92} roughness={0.34} />
        </mesh>
        <mesh position={[0, 0.62, 0.55]} renderOrder={3}>
          <coneGeometry args={[0.3, 0.92, mobile ? 8 : 14]} />
          <meshBasicMaterial color="#ffb33f" transparent opacity={0.92} toneMapped={false} />
        </mesh>
      </group>
      <group ref={smoke} position={[0, 0.7, 0]}>
        {puffs.map((puff, puffIndex) => (
          <mesh position={puff.position} scale={puff.scale} key={puffIndex}>
            <sphereGeometry args={[0.65, mobile ? 8 : 12, mobile ? 6 : 9]} />
            <meshStandardMaterial color="#30383c" roughness={0.9} transparent opacity={contained ? 0.08 : 0.2} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <pointLight ref={fireLight} position={[0, 0.8, 0.5]} color="#ff6b31" intensity={8} distance={7} decay={2} />
    </group>
  );
}

function IncidentBeacon({
  contained,
  hovered,
  mobile,
  onHover,
  onToggle,
}: {
  contained: boolean;
  hovered: boolean;
  mobile: boolean;
  onHover: (hovered: boolean) => void;
  onToggle: () => void;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (ring.current) {
      const wave = 1 + (0.5 + Math.sin(clock.elapsedTime * 3.8) * 0.5) * 0.42;
      ring.current.scale.setScalar(wave);
      ring.current.rotation.z = clock.elapsedTime * 0.22;
    }
    if (material.current) {
      material.current.emissiveIntensity = hovered ? 3.5 : contained ? 0.65 : 2.1;
    }
  });
  return (
    <group
      position={[-2.3, -1.7, 0.45]}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.72, 0.85, 0.12, mobile ? 18 : 30]} />
        <meshStandardMaterial color="#3b211b" metalness={0.42} roughness={0.48} />
      </mesh>
      <mesh ref={ring} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.74, 0.035, 8, mobile ? 24 : 42]} />
        <meshStandardMaterial ref={material} color={contained ? "#74ecff" : EMERGENCY} emissive={contained ? "#74ecff" : EMERGENCY} emissiveIntensity={2.1} />
      </mesh>
    </group>
  );
}

function WarehouseShell({ mobile }: { mobile: boolean }) {
  return (
    <group>
      <RoundedBox args={[12, 0.2, 9.7]} radius={0.07} smoothness={2} position={[0, -1.98, 0]}>
        <meshStandardMaterial color="#0b0e10" metalness={0.14} roughness={0.88} />
      </RoundedBox>
      <RoundedBox args={[12, 6.6, 0.3]} radius={0.06} smoothness={2} position={[0, 1.18, -4.7]}>
        <meshStandardMaterial color="#101416" metalness={0.22} roughness={0.72} />
      </RoundedBox>
      {[-5.65, 5.65].map((x) => (
        <RoundedBox args={[0.42, 6.5, 9.4]} radius={0.05} smoothness={2} position={[x, 1.15, 0]} key={x}>
          <meshStandardMaterial color="#111619" metalness={0.32} roughness={0.64} />
        </RoundedBox>
      ))}
      <group position={[0.8, 0.65, -4.5]}>
        <RoundedBox args={[5.3, 4.65, 0.22]} radius={0.08} smoothness={2}>
          <meshStandardMaterial color="#171b1d" metalness={0.5} roughness={0.48} />
        </RoundedBox>
        {Array.from({ length: mobile ? 6 : 10 }, (_, slatIndex) => (
          <mesh position={[0, 1.86 - slatIndex * 0.4, 0.13]} key={slatIndex}>
            <boxGeometry args={[4.9, 0.045, 0.04]} />
            <meshStandardMaterial color="#45494a" metalness={0.62} roughness={0.35} />
          </mesh>
        ))}
      </group>
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <Beam key={x} start={[x, 4.05, -4.35]} end={[x, 4.05, 3.95]} radius={0.1} color="#3b4143" segments={mobile ? 8 : 12} />
      ))}
      {!mobile ? (
        <group position={[-4.72, -1.2, 2.65]}>
          {[-0.72, 0.72].map((x) => (
            <group position={[x, 0, 0]} key={x}>
              <mesh>
                <coneGeometry args={[0.26, 0.86, 16]} />
                <meshStandardMaterial color="#f26a34" roughness={0.62} />
              </mesh>
              <mesh position={[0, -0.17, 0]}>
                <torusGeometry args={[0.2, 0.045, 8, 16]} />
                <meshStandardMaterial color="#e7e1cd" roughness={0.6} />
              </mesh>
            </group>
          ))}
          <Beam start={[-0.95, 0.38, 0]} end={[0.95, 0.38, 0]} radius={0.055} color="#f2d65e" />
        </group>
      ) : null}
    </group>
  );
}

function IncidentDisplay({ contained }: { contained: boolean }) {
  const incidentTexture = useInterfaceCrop(0.31, 0.64, 0.69, 0.18);

  return (
    <group position={[-3.4, 1.05, -4.48]} rotation={[0, 0.08, 0]}>
      <RoundedBox args={[2.75, 1.66, 0.13]} radius={0.08} smoothness={3}>
        <meshStandardMaterial color="#11181c" metalness={0.62} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[2.52, 1.42]} />
        <meshBasicMaterial
          map={incidentTexture}
          color={contained ? "#b9fff6" : "#ffffff"}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <mesh position={[-1.18, 0.68, 0.09]}>
        <circleGeometry args={[0.055, 20]} />
        <meshBasicMaterial color={contained ? CLINICAL : EMERGENCY} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function EmergencyWorld({ progress, index, position, mobile }: TrainingWorldProps) {
  const root = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const [contained, setContained] = useState(false);
  const [beaconHovered, setBeaconHovered] = useState(false);
  const presence = useWorldPresence(progress, index, root);
  usePresenceLight(keyLight, presence, mobile ? 5 : 8);
  useCursor(beaconHovered);

  useEffect(() => {
    const handleAction = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "emergency") {
        setContained((current) => !current);
      }
    };
    window.addEventListener("larion:scene-action", handleAction);
    return () => window.removeEventListener("larion:scene-action", handleAction);
  }, []);

  const hoseCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        EMERGENCY_ROUTE.map(([x, y, z]) => new THREE.Vector3(x, y + 0.03, z)),
        false,
        "catmullrom",
        0.45,
      ),
    [],
  );

  return (
    <group position={position}>
      <group ref={root} visible={Math.abs(progress.current - index) < 0.94}>
        <WarehouseShell mobile={mobile} />
        <EvidenceBackdrop
          image={emergencyBackdrop}
          position={[0, 0.62, -4.3]}
          size={mobile ? [8.7, 4.9] : [10.7, 6.02]}
          accent={contained ? CLINICAL : EMERGENCY}
          tint={contained ? "#b8e7eb" : "#ffffff"}
        />
        <Suspense fallback={null}>
          <SourcedFireExtinguisher
            normalizeTo={1.34}
            position={[1.05, -1.98, 1.62]}
            rotation={[0, -0.2, 0]}
            shadows={false}
          />
        </Suspense>
        <mesh>
          <tubeGeometry args={[hoseCurve, mobile ? 32 : 64, 0.055, mobile ? 5 : 8, false]} />
          <meshStandardMaterial color={contained ? "#74ecff" : "#354852"} emissive="#74ecff" emissiveIntensity={contained ? 0.78 : 0.08} roughness={0.48} />
        </mesh>
        {EMERGENCY_ROUTE.map((routePosition, routeIndex) => (
          <RouteLight
            key={routeIndex}
            position={routePosition}
            lightIndex={routeIndex}
            active={!contained}
            mobile={mobile}
          />
        ))}
        <FireAndSmoke contained={contained} mobile={mobile} position={[3.15, -1.82, -3.6]} />
        <IncidentBeacon
          contained={contained}
          hovered={beaconHovered}
          mobile={mobile}
          onHover={setBeaconHovered}
          onToggle={() => setContained((current) => !current)}
        />
        <pointLight ref={keyLight} position={[0.7, 2.9, 1.8]} color="#d6e9ed" intensity={0} distance={13} decay={2} />
        <pointLight position={[3.1, -0.25, -0.7]} color="#3e9cff" intensity={mobile ? 2.2 : 4.5} distance={7} decay={2} />
      </group>
    </group>
  );
}
