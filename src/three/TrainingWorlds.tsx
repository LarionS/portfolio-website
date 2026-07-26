import { Suspense, useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Line, RoundedBox } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import clinicalBackdrop from "../../assets/journey/worlds/story-first/clinical-decision-v2.webp";
import tacticalBackdrop from "../../assets/journey/worlds/story-first/tactical-system-v2.webp";
import emergencyBackdrop from "../../assets/journey/worlds/story-first/emergency-coordination-v2.webp";

type Vec3 = [number, number, number];

export type TrainingWorldProps = {
  progress: MutableRefObject<number>;
  index: number;
  position: Vec3;
  mobile: boolean;
};

export type ClinicalWorldProps = TrainingWorldProps & {
  active: boolean;
  onToggle: () => void;
};

export type DefenseWorldProps = TrainingWorldProps & {
  selectedNode: number | null;
  onSelectNode: (node: number | null) => void;
};

export type EmergencyWorldProps = TrainingWorldProps & {
  active: boolean;
  onToggle: () => void;
};

const CLINICAL = "#74ecff";
const DEFENSE = "#d7ff4f";
const EMERGENCY = "#ff713f";
const GRAPHITE = "#080d12";
const DARK_METAL = "#101820";
const MID_METAL = "#26343d";

function EvidenceImage({
  image,
  size,
  tint,
  opacity,
}: {
  image: string;
  size: [number, number];
  tint: string;
  opacity: number;
}) {
  const texture = useLoader(THREE.TextureLoader, image);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh position={[0, 0, 0.16]}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        color={tint}
        transparent={opacity < 1}
        opacity={opacity}
        side={THREE.DoubleSide}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}

function EvidenceBackdrop({
  image,
  position,
  size,
  accent,
  tint = "#ffffff",
  opacity = 1,
}: {
  image: string;
  position: Vec3;
  size: [number, number];
  accent: string;
  tint?: string;
  opacity?: number;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[size[0] + 0.34, size[1] + 0.34, 0.18]} radius={0.08} smoothness={3} position={[0, 0, -0.08]}>
        <meshBasicMaterial color="#030609" toneMapped={false} />
      </RoundedBox>
      <Suspense fallback={null}>
        <EvidenceImage image={image} size={size} tint={tint} opacity={opacity} />
      </Suspense>
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

function ClinicalBed({
  mobile,
  active,
  onToggle,
}: {
  mobile: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  const segments = mobile ? 8 : 14;
  const sensors = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!sensors.current) return;
    const pulse = active ? 1 + Math.sin(clock.elapsedTime * 8.2) * 0.1 : 1;
    sensors.current.scale.setScalar(pulse);
  });

  return (
    <group
      position={[0, -0.72, 0.15]}
      rotation={[0, -0.04, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
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
        <group ref={sensors}>
          {[[-1.64, 0.08, 0.31], [-0.19, 0, 0.32], [0.72, -0.06, 0.26]].map((point, pointIndex) => (
            <mesh position={point as Vec3} key={pointIndex}>
              <sphereGeometry args={[active ? 0.062 : 0.045, 8, 8]} />
              <meshStandardMaterial
                color={active ? "#ff714c" : CLINICAL}
                emissive={active ? "#ff3f24" : CLINICAL}
                emissiveIntensity={active ? 4.2 : 2.3}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

function ClinicalMonitor({
  mobile,
  active,
  onToggle,
}: {
  mobile: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  const screenMaterial = useRef<THREE.MeshStandardMaterial>(null);

  const signal = useMemo<Vec3[]>(() => {
    const values = active
      ? [0, 0.02, -0.03, 0.08, -0.12, 0.52, -0.38, 0.14, 0.02, 0, 0.04, -0.02, 0.06, -0.04, 0.34, -0.28, 0.09, 0]
      : [0, 0.02, 0.01, 0.04, -0.03, 0.29, -0.2, 0.08, 0.02, 0, 0.02, 0.01, 0.03, -0.02, 0.25, -0.17, 0.06, 0];
    return values.map((value, valueIndex) => [
      -0.63 + valueIndex * (1.26 / (values.length - 1)),
      value,
      0.278,
    ]);
  }, [active]);

  useFrame(({ clock }) => {
    if (!screenMaterial.current) return;
    const beat = 0.5 + Math.sin(clock.elapsedTime * (active ? 8.5 : 4.3)) * 0.5;
    screenMaterial.current.emissiveIntensity = 0.72 + beat * (active ? 0.72 : 0.18);
  });

  return (
    <group
      position={[3.32, 0.66, -0.72]}
      rotation={[0, -0.2, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
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
          emissive={active ? "#ff5d43" : "#072d30"}
          emissiveIntensity={0.8}
        />
      </RoundedBox>
      <mesh position={[0, 0.05, 0.248]}>
        <planeGeometry args={[1.34, 0.88]} />
        <meshBasicMaterial
          color={active ? "#5b1d15" : "#062b31"}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <Line
        points={signal}
        color={active ? "#ff6b48" : CLINICAL}
        lineWidth={mobile ? 1.1 : 1.8}
        transparent
        opacity={0.95}
      />
      {[0.29, 0.49, 0.69].map((y, lightIndex) => (
        <mesh position={[0.65, y - 0.93, 0.26]} key={y}>
          <circleGeometry args={[0.035, mobile ? 8 : 14]} />
          <meshStandardMaterial
            color={lightIndex === 0 && active ? "#ff5d43" : CLINICAL}
            emissive={lightIndex === 0 && active ? "#ff5d43" : CLINICAL}
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

function ClinicalDecisionTimeline({
  active,
  mobile,
  onToggle,
}: {
  active: boolean;
  mobile: boolean;
  onToggle: () => void;
}) {
  const cursor = useRef<THREE.Group>(null);
  const width = mobile ? 5.1 : 6.65;
  const stages = [-width * 0.36, 0, width * 0.36];

  useFrame(({ clock }, delta) => {
    if (!cursor.current) return;
    cursor.current.position.x = THREE.MathUtils.damp(
      cursor.current.position.x,
      active ? stages[2] : stages[0],
      7,
      delta,
    );
    const pulse = active ? 1 + Math.sin(clock.elapsedTime * 6.4) * 0.12 : 1;
    cursor.current.scale.setScalar(pulse);
  });

  return (
    <group
      position={[0.85, mobile ? 2.12 : 2.72, -4.04]}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <RoundedBox args={[width, 0.72, 0.075]} radius={0.055} smoothness={3} position={[0, 0, -0.045]}>
        <meshStandardMaterial color="#071015" metalness={0.48} roughness={0.34} transparent opacity={0.76} />
      </RoundedBox>
      <Line
        points={stages.map((x) => [x, 0.08, 0.02] as Vec3)}
        color={active ? "#ff714c" : CLINICAL}
        lineWidth={mobile ? 1 : 1.6}
        transparent
        opacity={0.72}
      />
      {stages.map((x, stageIndex) => {
        const reached = active ? stageIndex <= 2 : stageIndex === 0;
        return (
          <group key={x} position={[x, 0.08, 0.05]}>
            <mesh>
              <circleGeometry args={[0.12, mobile ? 12 : 20]} />
              <meshBasicMaterial
                color={reached ? (active ? "#ff714c" : CLINICAL) : "#304047"}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, -0.25, 0]}>
              <boxGeometry args={[0.58, 0.045, 0.02]} />
              <meshBasicMaterial
                color={reached ? (active ? "#ff9b72" : "#a8f5ff") : "#253137"}
                transparent
                opacity={reached ? 0.86 : 0.34}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
      <group ref={cursor} position={[stages[0], 0.08, 0.11]}>
        <mesh>
          <ringGeometry args={[0.19, 0.225, mobile ? 18 : 28]} />
          <meshBasicMaterial color={active ? "#ff714c" : CLINICAL} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function ClinicalSignalOverlay({
  active,
  mobile,
  onToggle,
}: {
  active: boolean;
  mobile: boolean;
  onToggle: () => void;
}) {
  const scanner = useRef<THREE.Group>(null);
  const pulseMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const width = mobile ? 5.55 : 7.15;
  const waveform = useMemo<Vec3[]>(() => {
    const values = active
      ? [0, 0.03, -0.04, 0.12, -0.13, 0.46, -0.34, 0.15, 0.02, 0, 0.04, -0.02, 0.08, -0.05, 0.37, -0.27, 0.1, 0]
      : [0, 0.02, 0.01, 0.04, -0.03, 0.24, -0.16, 0.07, 0.02, 0, 0.02, 0.01, 0.03, -0.02, 0.2, -0.14, 0.05, 0];
    return values.map((value, valueIndex) => [
      -width * 0.43 + valueIndex * ((width * 0.86) / (values.length - 1)),
      value,
      0.11,
    ]);
  }, [active, width]);

  useFrame(({ clock }, delta) => {
    if (scanner.current) {
      const phase = (clock.elapsedTime * (active ? 0.24 : 0.065)) % 1;
      const destination = active
        ? THREE.MathUtils.lerp(-width * 0.44, width * 0.44, phase)
        : -width * 0.44;
      scanner.current.position.x = THREE.MathUtils.damp(
        scanner.current.position.x,
        destination,
        active ? 9 : 5,
        delta,
      );
    }
    if (pulseMaterial.current) {
      const beat = 0.5 + Math.sin(clock.elapsedTime * (active ? 7.8 : 3.8)) * 0.5;
      pulseMaterial.current.opacity = active ? 0.5 + beat * 0.45 : 0.3 + beat * 0.16;
    }
  });

  return (
    <group
      position={[0.85, mobile ? -1.24 : -1.48, -4.03]}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <RoundedBox args={[width, 1.18, 0.07]} radius={0.055} smoothness={3} position={[0, 0, -0.05]}>
        <meshStandardMaterial
          color="#061015"
          metalness={0.42}
          roughness={0.38}
          transparent
          opacity={0.7}
        />
      </RoundedBox>
      <Line
        points={waveform}
        color={active ? "#ff7958" : CLINICAL}
        lineWidth={mobile ? 1.15 : 1.85}
        transparent
        opacity={0.94}
      />
      <Line
        points={[
          [-width * 0.44, -0.39, 0.08],
          [width * 0.44, -0.39, 0.08],
        ]}
        color={active ? "#ff7958" : CLINICAL}
        lineWidth={mobile ? 0.55 : 0.85}
        transparent
        opacity={0.34}
      />
      {[-0.31, 0, 0.31].map((normalized, metricIndex) => (
        <group key={normalized} position={[normalized * width, -0.39, 0.1]}>
          <mesh>
            <circleGeometry args={[mobile ? 0.045 : 0.055, 18]} />
            <meshBasicMaterial
              color={metricIndex === 1 && active ? "#ff7958" : CLINICAL}
              transparent
              opacity={active ? 0.96 : 0.58}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.18 + metricIndex * 0.035, 0]}>
            <boxGeometry args={[0.42, 0.025, 0.018]} />
            <meshBasicMaterial
              color={active ? "#ffb09a" : "#b6f7ff"}
              transparent
              opacity={active ? 0.74 : 0.38}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      <group ref={scanner} position={[-width * 0.44, 0, 0.15]}>
        <mesh>
          <boxGeometry args={[0.018, 0.92, 0.018]} />
          <meshBasicMaterial
            ref={pulseMaterial}
            color={active ? "#ff7958" : CLINICAL}
            transparent
            opacity={0.42}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <circleGeometry args={[0.055, 18]} />
          <meshBasicMaterial color={active ? "#ff7958" : CLINICAL} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export function ClinicalWorld({
  progress,
  index,
  position,
  mobile,
  active,
  onToggle,
}: ClinicalWorldProps) {
  const root = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const presence = useWorldPresence(progress, index, root);
  usePresenceLight(keyLight, presence, mobile ? 5.5 : 9.5);

  return (
    <group position={position}>
      <group ref={root} visible={Math.abs(progress.current - index) < 0.94}>
        <EvidenceBackdrop
          image={clinicalBackdrop}
          position={[0.72, 0.66, -4.46]}
          size={mobile ? [8.8, 4.95] : [11.45, 6.44]}
          accent={active ? "#ff714c" : CLINICAL}
          tint={active ? "#e7c1b8" : "#e7fbff"}
          opacity={active ? 0.86 : 0.94}
        />
        <ClinicalSignalOverlay active={active} mobile={mobile} onToggle={onToggle} />
        <ClinicalDecisionTimeline active={active} mobile={mobile} onToggle={onToggle} />
        <pointLight
          ref={keyLight}
          position={[1.2, 2.2, 1.8]}
          color={active ? "#ff8a65" : "#b9f7ff"}
          intensity={0}
          distance={11}
          decay={2}
        />
        <pointLight
          position={[3.35, 0.25, 1.15]}
          color={active ? "#ff542f" : CLINICAL}
          intensity={active ? (mobile ? 3.2 : 5.4) : (mobile ? 1.4 : 2.6)}
          distance={7}
          decay={2}
        />
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

function TelemetryBeaconNode({
  position,
  nodeIndex,
  active,
  selected,
  mobile,
  onSelect,
}: {
  position: Vec3;
  nodeIndex: number;
  active: boolean;
  selected: boolean;
  mobile: boolean;
  onSelect: (node: number) => void;
}) {
  const assembly = useRef<THREE.Group>(null);
  const coreMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const wearableOrbit = useRef<THREE.Group>(null);
  const equipmentModule = useRef<THREE.Group>(null);
  const hapticPulse = useRef<THREE.Group>(null);
  const returnPulse = useRef<THREE.Mesh>(null);
  const segments = mobile ? 12 : 20;
  const yaw = Math.atan2(-position[0], -position[2]);

  useFrame(({ clock }, delta) => {
    if (!assembly.current) return;
    const targetScale = selected ? 1.1 : active ? 1 : 0.9;
    const scale = THREE.MathUtils.damp(
      assembly.current.scale.x,
      targetScale,
      8,
      delta,
    );
    assembly.current.scale.setScalar(scale);
    assembly.current.position.y =
      Math.sin(clock.elapsedTime * 1.2 + nodeIndex * 0.9) * 0.022;
    assembly.current.rotation.y = Math.sin(
      clock.elapsedTime * 0.38 + nodeIndex,
    ) * (selected ? 0.1 : 0.035);

    if (coreMaterial.current) {
      const pulse =
        0.5 +
        Math.sin(clock.elapsedTime * (selected ? 5.2 : 2.1) + nodeIndex) * 0.5;
      coreMaterial.current.emissiveIntensity = selected
        ? 1.05 + pulse * 1.15
        : active
          ? 0.38 + pulse * 0.32
          : 0.06;
    }
    if (wearableOrbit.current) {
      wearableOrbit.current.rotation.z += delta * (selected ? 1.45 : 0.28);
      wearableOrbit.current.rotation.y += delta * (selected ? 0.72 : 0.12);
    }
    if (equipmentModule.current) {
      equipmentModule.current.position.x = THREE.MathUtils.damp(
        equipmentModule.current.position.x,
        selected ? 0.72 : 0.57,
        7,
        delta,
      );
      equipmentModule.current.rotation.z = THREE.MathUtils.damp(
        equipmentModule.current.rotation.z,
        selected ? -0.16 : -0.05,
        7,
        delta,
      );
    }
    if (hapticPulse.current) {
      const hapticScale = selected
        ? 1 + (Math.sin(clock.elapsedTime * 5.8) * 0.5 + 0.5) * 0.2
        : 0.92;
      hapticPulse.current.scale.setScalar(hapticScale);
    }
    if (returnPulse.current) {
      const phase = (clock.elapsedTime * 0.7 + nodeIndex * 0.13) % 1;
      returnPulse.current.visible = selected;
      returnPulse.current.position.y = 0.78 + phase * 1.22;
    }
  });

  const wearableSignal = useMemo<Vec3[]>(
    () => [
      [-0.45, 1.2, 0.19],
      [-0.3, 1.2, 0.19],
      [-0.21, 1.08, 0.19],
      [-0.1, 1.38, 0.19],
      [0.02, 1.14, 0.19],
      [0.14, 1.2, 0.19],
      [0.45, 1.2, 0.19],
    ],
    [],
  );

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <group
        ref={assembly}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(nodeIndex);
        }}
      >
        <mesh position={[0, -0.63, 0]}>
          <cylinderGeometry args={[0.52, 0.68, 0.16, segments]} />
          <meshStandardMaterial
            color="#10181c"
            metalness={0.72}
            roughness={0.3}
            emissive={active ? DEFENSE : "#000000"}
            emissiveIntensity={active ? 0.12 : 0}
          />
        </mesh>
        <mesh position={[0, -0.49, 0]}>
          <cylinderGeometry args={[0.34, 0.47, 0.2, 8]} />
          <meshStandardMaterial
            color="#263238"
            metalness={0.62}
            roughness={0.26}
          />
        </mesh>
        <Beam
          start={[0, -0.42, 0]}
          end={[0, 0.4, 0]}
          radius={0.045}
          color="#5d6c70"
          metalness={0.76}
          roughness={0.2}
          segments={segments}
        />

        <group ref={hapticPulse} position={[0, -0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
          {[0.42, 0.57].map((radius, ringIndex) => (
            <mesh key={radius}>
              <torusGeometry args={[radius, ringIndex === 0 ? 0.026 : 0.014, 8, segments * 2]} />
              <meshBasicMaterial
                color={DEFENSE}
                transparent
                opacity={selected ? (ringIndex === 0 ? 0.82 : 0.42) : 0.11}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>

        <group position={[0, 0.35, 0]}>
          <mesh>
            <octahedronGeometry args={[0.34, 0]} />
            <meshStandardMaterial
              ref={coreMaterial}
              color="#17211c"
              emissive={DEFENSE}
              emissiveIntensity={0.4}
              metalness={0.68}
              roughness={0.18}
            />
          </mesh>
          <mesh scale={1.28}>
            <icosahedronGeometry args={[0.34, 1]} />
            <meshBasicMaterial
              color={DEFENSE}
              wireframe
              transparent
              opacity={selected ? 0.86 : active ? 0.34 : 0.1}
              toneMapped={false}
            />
          </mesh>
        </group>

        <group ref={wearableOrbit} position={[0, 0.35, 0]} rotation={[0.68, 0.36, 0]}>
          <mesh>
            <torusGeometry args={[0.52, 0.026, 8, segments * 2]} />
            <meshStandardMaterial
              color="#23312a"
              emissive={DEFENSE}
              emissiveIntensity={selected ? 1.25 : active ? 0.34 : 0.04}
              metalness={0.52}
              roughness={0.22}
            />
          </mesh>
          <mesh position={[0.52, 0, 0]}>
            <sphereGeometry args={[0.065, 10, 10]} />
            <meshBasicMaterial color={DEFENSE} toneMapped={false} />
          </mesh>
        </group>

        <group ref={equipmentModule} position={[0.57, 0.12, 0.04]} rotation={[0.08, 0.14, -0.05]}>
          <RoundedBox args={[0.72, 0.14, 0.2]} radius={0.045} smoothness={2}>
            <meshStandardMaterial
              color="#1b252a"
              emissive={selected ? DEFENSE : "#111812"}
              emissiveIntensity={selected ? 0.78 : 0.08}
              metalness={0.72}
              roughness={0.24}
            />
          </RoundedBox>
          <mesh position={[0.31, 0, 0.115]}>
            <boxGeometry args={[0.1, 0.06, 0.025]} />
            <meshBasicMaterial color={selected ? DEFENSE : "#5e6b61"} toneMapped={false} />
          </mesh>
        </group>

        <Line
          points={wearableSignal}
          color={active ? DEFENSE : "#465146"}
          lineWidth={mobile ? 0.72 : 1.15}
          transparent
          opacity={selected ? 0.96 : active ? 0.46 : 0.14}
        />

        <Line
          points={[[0, 0.73, 0], [0, 2.02, 0]]}
          color={CLINICAL}
          lineWidth={mobile ? 0.62 : 0.95}
          transparent
          opacity={selected ? 0.72 : 0.08}
          dashed
          dashSize={0.13}
          gapSize={0.14}
        />
        <mesh ref={returnPulse} position={[0, 0.78, 0]} visible={false}>
          <sphereGeometry args={[mobile ? 0.045 : 0.06, 10, 10]} />
          <meshBasicMaterial color={CLINICAL} toneMapped={false} />
        </mesh>
        <mesh position={[0, 2.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.09, 0.125, segments]} />
          <meshBasicMaterial
            color={selected ? CLINICAL : DEFENSE}
            transparent
            opacity={selected ? 0.92 : active ? 0.35 : 0.1}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {Array.from({ length: 6 }, (_, indicatorIndex) => (
          <mesh
            key={indicatorIndex}
            position={[-0.25 + indicatorIndex * 0.1, -0.56, 0.49]}
          >
            <circleGeometry args={[0.022, 10]} />
            <meshBasicMaterial
              color={indicatorIndex === nodeIndex ? DEFENSE : "#334038"}
              transparent
              opacity={indicatorIndex === nodeIndex ? 0.95 : 0.28}
              toneMapped={false}
            />
          </mesh>
        ))}

        <pointLight
          color={selected ? CLINICAL : DEFENSE}
          intensity={selected ? (mobile ? 2.7 : 4.6) : active ? 0.8 : 0.15}
          distance={3.2}
          position={[0, 0.45, 0.5]}
        />
      </group>
    </group>
  );
}

function InstructorTelemetry({
  target,
  mobile,
}: {
  target: Vec3;
  mobile: boolean;
}) {
  const dispatchPulse = useRef<THREE.Mesh>(null);
  const returnPulse = useRef<THREE.Mesh>(null);
  const consolePoint = useMemo(() => new THREE.Vector3(0, -0.18, 3.82), []);
  const traineePoint = useMemo(
    () => new THREE.Vector3(target[0], target[1] + 1.18, target[2]),
    [target],
  );

  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime * 0.36) % 1;
    if (dispatchPulse.current) {
      const dispatchT = THREE.MathUtils.smootherstep(Math.min(phase * 2, 1), 0, 1);
      dispatchPulse.current.visible = phase < 0.56;
      dispatchPulse.current.position.lerpVectors(consolePoint, traineePoint, dispatchT);
    }
    if (returnPulse.current) {
      const returnT = THREE.MathUtils.smootherstep(Math.max((phase - 0.5) * 2, 0), 0, 1);
      returnPulse.current.visible = phase >= 0.44;
      returnPulse.current.position.lerpVectors(traineePoint, consolePoint, returnT);
    }
  });

  return (
    <group>
      <Line
        points={[consolePoint.toArray() as Vec3, traineePoint.toArray() as Vec3]}
        color={DEFENSE}
        lineWidth={mobile ? 1 : 1.6}
        transparent
        opacity={0.78}
        dashed
        dashSize={0.2}
        gapSize={0.17}
      />
      <mesh ref={dispatchPulse}>
        <sphereGeometry args={[mobile ? 0.055 : 0.075, 10, 10]} />
        <meshBasicMaterial color="#f1ff9a" toneMapped={false} />
      </mesh>
      <mesh ref={returnPulse}>
        <sphereGeometry args={[mobile ? 0.05 : 0.068, 10, 10]} />
        <meshBasicMaterial color={CLINICAL} toneMapped={false} />
      </mesh>
    </group>
  );
}

function InstructorConsole({
  selectedNode,
  mobile,
  onAdvance,
}: {
  selectedNode: number | null;
  mobile: boolean;
  onAdvance: () => void;
}) {
  const screen = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!screen.current) return;
    screen.current.emissiveIntensity = (selectedNode === null ? 0.62 : 0.94) + Math.sin(clock.elapsedTime * 2.4) * 0.08;
  });

  return (
    <group
      position={[0, -1.17, 4.05]}
      rotation={[-0.02, 0, 0]}
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
          <meshBasicMaterial color="#101d12" toneMapped={false} fog={false} />
        </mesh>
        {Array.from({ length: 6 }, (_, unitIndex) => (
          <group position={[-0.82 + (unitIndex % 3) * 0.82, 0.24 - Math.floor(unitIndex / 3) * 0.48, 0.13]} key={unitIndex}>
            <RoundedBox args={[0.62, 0.28, 0.02]} radius={0.025} smoothness={2}>
              <meshStandardMaterial
                color={unitIndex === selectedNode ? "#d7ff4f" : "#253029"}
                emissive={unitIndex === selectedNode ? DEFENSE : "#101410"}
                emissiveIntensity={unitIndex === selectedNode ? 0.9 : 0.08}
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
          <meshStandardMaterial color="#17200e" emissive={DEFENSE} emissiveIntensity={selectedNode === null ? 0.3 : 0.82} roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0, 0.074]}>
          <planeGeometry args={[0.68, 0.93]} />
          <meshBasicMaterial color="#13230f" toneMapped={false} fog={false} />
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

export function DefenseWorld({
  progress,
  index,
  position,
  mobile,
  selectedNode,
  onSelectNode,
}: DefenseWorldProps) {
  const root = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const presence = useWorldPresence(progress, index, root);
  usePresenceLight(keyLight, presence, mobile ? 6.5 : 12);
  const selectNode = (node: number) => {
    onSelectNode(selectedNode === node ? null : node);
  };
  const advanceNode = () => {
    onSelectNode(selectedNode === null ? 0 : selectedNode >= 5 ? null : selectedNode + 1);
  };

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
          position={[0.15, 0.68, -4.58]}
          size={mobile ? [8.8, 4.95] : [11.45, 6.44]}
          accent={DEFENSE}
          tint={selectedNode === null ? "#eaf0e4" : "#e4ffc0"}
          opacity={selectedNode === null ? 0.92 : 0.84}
        />
        {DEFENSE_POSITIONS.map((nodePosition, nodeIndex) => {
          const target = [nodePosition[0], nodePosition[1] + 1.18, nodePosition[2]] as Vec3;
          const isSelected = selectedNode === nodeIndex;
          return (
            <group key={nodeIndex}>
              {selectedNode === null ? (
                <Line
                  points={[[0, -0.18, 3.82], target]}
                  color={DEFENSE}
                  lineWidth={mobile ? 0.45 : 0.75}
                  transparent
                  opacity={0.2}
                  dashed
                  dashSize={0.16}
                  gapSize={0.26}
                />
              ) : null}
              <TelemetryBeaconNode
                position={nodePosition}
                nodeIndex={nodeIndex}
                active={selectedNode === null || isSelected}
                selected={isSelected}
                mobile={mobile}
                onSelect={selectNode}
              />
            </group>
          );
        })}

        {selectedNode !== null && DEFENSE_POSITIONS[selectedNode] ? (
          <InstructorTelemetry target={DEFENSE_POSITIONS[selectedNode]} mobile={mobile} />
        ) : null}

        <InstructorConsole
          selectedNode={selectedNode}
          mobile={mobile}
          onAdvance={advanceNode}
        />

        <pointLight ref={keyLight} position={[0, 2.4, 1.4]} color="#e7ff8a" intensity={0} distance={12} decay={2} />
        <pointLight
          position={selectedNode === null ? [0, -0.2, 0] : [DEFENSE_POSITIONS[selectedNode][0], 0.4, DEFENSE_POSITIONS[selectedNode][2]]}
          color={selectedNode === null ? DEFENSE : CLINICAL}
          intensity={selectedNode === null ? (mobile ? 2.4 : 4.5) : (mobile ? 4 : 7.5)}
          distance={7}
          decay={2}
        />
      </group>
    </group>
  );
}

const EMERGENCY_ROLE_PATHS: { color: string; points: Vec3[] }[] = [
  {
    color: "#51b9ff",
    points: [
      [-3.55, -1.84, 2.35],
      [-2.72, -1.75, 0.72],
      [-1.45, -1.56, -3.25],
    ],
  },
  {
    color: EMERGENCY,
    points: [
      [0.1, -1.84, 2.55],
      [0.18, -1.68, 0.34],
      [0.35, -1.4, -3.5],
    ],
  },
  {
    color: "#ff5368",
    points: [
      [3.72, -1.84, 2.2],
      [2.92, -1.7, 0.54],
      [2.35, -1.48, -3.18],
    ],
  },
];

function EmergencyRolePath({
  points,
  color,
  active,
  offset,
  mobile,
  onToggle,
}: {
  points: Vec3[];
  color: string;
  active: boolean;
  offset: number;
  mobile: boolean;
  onToggle: () => void;
}) {
  const pulse = useRef<THREE.Mesh>(null);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))),
    [points],
  );
  const end = points[points.length - 1];

  useFrame(({ clock }, delta) => {
    if (!pulse.current) return;
    if (active) {
      pulse.current.position.x = THREE.MathUtils.damp(pulse.current.position.x, end[0], 5, delta);
      pulse.current.position.y = THREE.MathUtils.damp(pulse.current.position.y, end[1], 5, delta);
      pulse.current.position.z = THREE.MathUtils.damp(pulse.current.position.z, end[2], 5, delta);
      const settledScale = THREE.MathUtils.damp(pulse.current.scale.x, 0.72, 5, delta);
      pulse.current.scale.setScalar(settledScale);
      return;
    }
    const t = (clock.elapsedTime * 0.24 + offset) % 1;
    pulse.current.position.copy(curve.getPointAt(t));
    const travellingScale = 0.82 + Math.sin(t * Math.PI) * 0.32;
    pulse.current.scale.setScalar(travellingScale);
  });

  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <Line
        points={curve.getPoints(mobile ? 18 : 30).map((point) => point.toArray() as Vec3)}
        color={active ? CLINICAL : color}
        lineWidth={mobile ? 1.15 : 1.8}
        transparent
        opacity={active ? 0.34 : 0.82}
      />
      <mesh ref={pulse} position={points[0]}>
        <sphereGeometry args={[mobile ? 0.075 : 0.1, 12, 10]} />
        <meshBasicMaterial color={active ? CLINICAL : color} toneMapped={false} />
      </mesh>
      <mesh position={end}>
        <icosahedronGeometry args={[mobile ? 0.1 : 0.14, 1]} />
        <meshBasicMaterial
          color={active ? CLINICAL : color}
          transparent
          opacity={active ? 0.62 : 0.92}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function IncidentEnergy({
  active,
  mobile,
  onToggle,
}: {
  active: boolean;
  mobile: boolean;
  onToggle: () => void;
}) {
  const energy = useRef<THREE.Group>(null);
  const smoke = useRef<THREE.Group>(null);
  const puffs = useMemo(
    () =>
      Array.from({ length: mobile ? 4 : 7 }, (_, puffIndex) => ({
        position: [
          Math.sin(puffIndex * 2.17) * (0.18 + puffIndex * 0.035),
          0.38 + puffIndex * 0.31,
          Math.cos(puffIndex * 1.73) * (0.14 + puffIndex * 0.025),
        ] as Vec3,
        scale: 0.34 + (puffIndex % 3) * 0.13,
      })),
    [mobile],
  );

  useFrame(({ clock }, delta) => {
    if (energy.current) {
      const targetScale = active ? 0.34 : 1 + Math.sin(clock.elapsedTime * 4.8) * 0.035;
      const nextScale = THREE.MathUtils.damp(energy.current.scale.x, targetScale, 4.5, delta);
      energy.current.scale.setScalar(nextScale);
      energy.current.rotation.y += delta * (active ? 0.08 : 0.32);
    }
    if (smoke.current) {
      smoke.current.position.y = THREE.MathUtils.damp(smoke.current.position.y, active ? 0.18 : 0, 2.5, delta);
      const targetSmoke = active ? 0.48 : 1;
      const smokeScale = THREE.MathUtils.damp(smoke.current.scale.x, targetSmoke, 2.5, delta);
      smoke.current.scale.setScalar(smokeScale);
    }
  });

  return (
    <group
      position={[0.35, -1.38, -3.35]}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <group ref={energy}>
        <mesh position={[0, 0.48, 0]}>
          <icosahedronGeometry args={[mobile ? 0.34 : 0.48, 2]} />
          <meshStandardMaterial
            color={active ? CLINICAL : "#ff6a35"}
            emissive={active ? CLINICAL : "#ff3e1e"}
            emissiveIntensity={active ? 0.8 : 2.6}
            wireframe
            transparent
            opacity={active ? 0.48 : 0.82}
          />
        </mesh>
        <pointLight
          position={[0, 0.52, 0.2]}
          color={active ? CLINICAL : "#ff552b"}
          intensity={active ? 1.2 : (mobile ? 5 : 8.5)}
          distance={6}
          decay={2}
        />
      </group>
      <group ref={smoke} position={[0, 0, 0]}>
        {puffs.map((puff, puffIndex) => (
          <mesh key={puffIndex} position={puff.position} scale={puff.scale}>
            <sphereGeometry args={[0.62, mobile ? 7 : 10, mobile ? 5 : 8]} />
            <meshStandardMaterial
              color="#39464b"
              roughness={0.94}
              transparent
              opacity={active ? 0.035 : 0.13}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
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
  return (
    <group position={[-3.4, 1.05, -4.48]} rotation={[0, 0.08, 0]}>
      <RoundedBox args={[2.75, 1.66, 0.13]} radius={0.08} smoothness={3}>
        <meshStandardMaterial color="#11181c" metalness={0.62} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[2.52, 1.42]} />
        <meshBasicMaterial
          color={contained ? "#0b3a3c" : "#32130d"}
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

export function EmergencyWorld({
  progress,
  index,
  position,
  mobile,
  active,
  onToggle,
}: EmergencyWorldProps) {
  const root = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const presence = useWorldPresence(progress, index, root);
  usePresenceLight(keyLight, presence, mobile ? 5.5 : 9);

  return (
    <group position={position}>
      <group ref={root} visible={Math.abs(progress.current - index) < 0.94}>
        <EvidenceBackdrop
          image={emergencyBackdrop}
          position={[0.12, 0.66, -4.52]}
          size={mobile ? [8.8, 4.95] : [11.45, 6.44]}
          accent={active ? CLINICAL : EMERGENCY}
          tint={active ? "#bdd8dd" : "#ffffff"}
          opacity={active ? 0.7 : 0.94}
        />
        <mesh position={[0.3, -1.99, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[11.4, 8.4]} />
          <meshStandardMaterial color="#080d11" roughness={0.88} metalness={0.16} />
        </mesh>
        {EMERGENCY_ROLE_PATHS.map((role, roleIndex) => (
          <EmergencyRolePath
            key={role.color}
            points={role.points}
            color={role.color}
            active={active}
            offset={roleIndex / EMERGENCY_ROLE_PATHS.length}
            mobile={mobile}
            onToggle={onToggle}
          />
        ))}
        <IncidentEnergy active={active} mobile={mobile} onToggle={onToggle} />
        <pointLight
          ref={keyLight}
          position={[0.7, 2.9, 1.8]}
          color={active ? "#b9f6ff" : "#ffd0bd"}
          intensity={0}
          distance={13}
          decay={2}
        />
        <pointLight
          position={[-2.35, -0.15, 0.9]}
          color="#3e9cff"
          intensity={active ? (mobile ? 2.4 : 4.2) : (mobile ? 1.6 : 3.2)}
          distance={8}
          decay={2}
        />
        <pointLight
          position={[3.05, -0.35, 0.65]}
          color={active ? CLINICAL : "#ff5368"}
          intensity={active ? (mobile ? 1.8 : 3.4) : (mobile ? 2.8 : 5.2)}
          distance={7}
          decay={2}
        />
      </group>
    </group>
  );
}
