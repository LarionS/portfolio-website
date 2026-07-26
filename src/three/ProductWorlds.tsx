import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MutableRefObject } from "react";
import { Line, RoundedBox } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

type SharedWorldProps = {
  progress: MutableRefObject<number>;
  index: number;
  position: [number, number, number];
  mobile: boolean;
};

type FilmWorldProps = SharedWorldProps & {
  videoUrl: string;
  posterUrl: string;
};

type MobileWorldProps = SharedWorldProps & {
  screens: string[];
};

type Vec3 = [number, number, number];

const CYAN = "#71fff0";
const GOLD = "#f5c65c";
const INK = "#05080d";
const STEEL = "#111821";

function proximityAt(progress: MutableRefObject<number>, index: number) {
  return THREE.MathUtils.clamp(
    1 - Math.abs(progress.current - index) / 0.94,
    0,
    1,
  );
}

function useManagedVideo(
  url: string,
  progress: MutableRefObject<number>,
  index: number,
) {
  const resource = useMemo(() => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "none";
    video.setAttribute("playsinline", "");

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return { video, texture };
  }, [url]);
  const requested = useRef(false);
  const manuallyPaused = useRef(false);
  const retryAfter = useRef(0);
  const [ready, setReady] = useState(false);

  const requestPlayback = useCallback(
    (shouldPlay: boolean) => {
      if (shouldPlay && performance.now() < retryAfter.current) return;
      if (shouldPlay === requested.current) return;
      requested.current = shouldPlay;

      if (shouldPlay) {
        if (!resource.video.src) {
          resource.video.src = url;
          resource.video.load();
        }
        void resource.video.play().catch(() => {
          requested.current = false;
          retryAfter.current = performance.now() + 5000;
        });
      } else {
        resource.video.pause();
      }
    },
    [resource.video, url],
  );

  useFrame(() => {
    const proximity = proximityAt(progress, index);
    if (proximity < 0.08) manuallyPaused.current = false;
    requestPlayback(
      proximity > 0.56 && !document.hidden && !manuallyPaused.current,
    );
  });

  useEffect(() => {
    const handleReady = () => setReady(true);
    const handleVisibility = () => {
      if (document.hidden) requestPlayback(false);
    };
    resource.video.addEventListener("playing", handleReady);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      resource.video.removeEventListener("playing", handleReady);
      document.removeEventListener("visibilitychange", handleVisibility);
      resource.video.pause();
      resource.video.removeAttribute("src");
      resource.video.load();
      resource.texture.dispose();
    };
  }, [requestPlayback, resource]);

  const toggle = useCallback(() => {
    if (resource.video.paused) {
      manuallyPaused.current = false;
      requested.current = false;
      retryAfter.current = 0;
      requestPlayback(true);
    } else {
      manuallyPaused.current = true;
      requested.current = true;
      requestPlayback(false);
    }
  }, [requestPlayback, resource.video]);

  const start = useCallback(() => {
    manuallyPaused.current = false;
    requested.current = false;
    retryAfter.current = 0;
    requestPlayback(true);
  }, [requestPlayback]);

  return { texture: resource.texture, toggle, start, ready };
}

function VideoPortal({
  texture,
  position,
  rotation = [0, 0, 0],
  size,
  color,
  onToggle,
}: {
  texture: THREE.Texture;
  position: Vec3;
  rotation?: Vec3;
  size: [number, number];
  color: string;
  onToggle: () => void;
}) {
  const [width, height] = size;
  const frame = 0.075;

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onToggle();
  };

  return (
    <group position={position} rotation={rotation} onClick={handleClick}>
      <mesh position={[0, 0, -0.055]}>
        <planeGeometry args={[width + 0.42, height + 0.42]} />
        <meshStandardMaterial
          color={INK}
          metalness={0.76}
          roughness={0.23}
        />
      </mesh>
      <mesh position={[0, 0, 0.04]} renderOrder={1}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {[
        [0, height / 2 + frame, 0.055, width + 0.26, frame],
        [0, -height / 2 - frame, 0.055, width + 0.26, frame],
        [-width / 2 - frame, 0, 0.055, frame, height + 0.26],
        [width / 2 + frame, 0, 0.055, frame, height + 0.26],
      ].map(([x, y, z, w, h], frameIndex) => (
        <mesh key={frameIndex} position={[x, y, z]}>
          <boxGeometry args={[w, h, 0.07]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.3}
            metalness={0.35}
            roughness={0.2}
          />
        </mesh>
      ))}
      <mesh position={[-width / 2 + 0.14, height / 2 - 0.14, 0.07]}>
        <circleGeometry args={[0.045, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

const HOVER_TRACK: Vec3[] = [
  [0, -1.38, 3.8],
  [-0.35, -1.42, 1.6],
  [0.65, -1.4, -0.7],
  [-0.75, -1.34, -3.1],
  [0.28, -1.3, -5.35],
  [0, -1.27, -7.8],
];

function TrackDeck() {
  const segments = useMemo(
    () =>
      HOVER_TRACK.slice(0, -1).map((start, segmentIndex) => {
        const end = HOVER_TRACK[segmentIndex + 1];
        const dx = end[0] - start[0];
        const dz = end[2] - start[2];
        return {
          position: [
            (start[0] + end[0]) / 2,
            (start[1] + end[1]) / 2,
            (start[2] + end[2]) / 2,
          ] as Vec3,
          length: Math.hypot(dx, dz) + 0.12,
          rotation: Math.atan2(dx, dz),
        };
      }),
    [],
  );

  const leftRail = useMemo(
    () => HOVER_TRACK.map(([x, y, z]) => [x - 0.79, y + 0.13, z] as Vec3),
    [],
  );
  const rightRail = useMemo(
    () => HOVER_TRACK.map(([x, y, z]) => [x + 0.79, y + 0.13, z] as Vec3),
    [],
  );

  return (
    <group>
      {segments.map((segment, segmentIndex) => (
        <mesh
          key={segmentIndex}
          position={segment.position}
          rotation={[0, segment.rotation, 0]}
        >
          <boxGeometry args={[1.62, 0.14, segment.length]} />
          <meshStandardMaterial
            color="#101923"
            metalness={0.38}
            roughness={0.58}
          />
        </mesh>
      ))}
      <Line points={leftRail} color={CYAN} lineWidth={1.35} transparent opacity={0.76} />
      <Line points={rightRail} color={CYAN} lineWidth={1.35} transparent opacity={0.76} />
      {HOVER_TRACK.slice(1, -1).map(([x, y, z], stripeIndex) => (
        <mesh key={stripeIndex} position={[x, y + 0.09, z]}>
          <boxGeometry args={[1.28, 0.018, 0.05]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.28} />
        </mesh>
      ))}
    </group>
  );
}

type RockTransform = {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
};

const ROCKS: RockTransform[] = [
  { position: [-4.8, -0.2, 4], rotation: [0.1, 0.2, -0.06], scale: [2.1, 3.2, 1.6] },
  { position: [4.7, -0.5, 3.2], rotation: [-0.1, 0.8, 0.08], scale: [2.3, 2.7, 1.8] },
  { position: [-3.7, 0.4, 1], rotation: [0.2, 1.2, 0.03], scale: [1.55, 3.7, 1.8] },
  { position: [4.2, 0.1, 0], rotation: [0.1, 0.5, 0.08], scale: [1.7, 3.5, 1.45] },
  { position: [-4.9, -0.1, -2.2], rotation: [-0.15, 0.9, 0.04], scale: [2.25, 3.1, 1.9] },
  { position: [3.65, 0.65, -2.8], rotation: [0.18, 0.25, -0.08], scale: [1.45, 4, 1.6] },
  { position: [-3.7, 0.1, -5.5], rotation: [0.1, 1.4, 0.02], scale: [1.7, 3.2, 1.4] },
  { position: [4.7, -0.4, -5.8], rotation: [-0.12, 0.7, 0.08], scale: [2.2, 2.8, 1.9] },
  { position: [-5.25, 1.4, -8], rotation: [0.2, 0.1, -0.05], scale: [2.4, 4.4, 2.2] },
  { position: [5.1, 1.1, -8.2], rotation: [-0.1, 0.95, 0.07], scale: [2.2, 4.1, 2] },
  { position: [-6.4, -0.8, 2.2], rotation: [0.1, 0.5, 0], scale: [2.4, 2.5, 2.2] },
  { position: [6.3, -0.7, 1.1], rotation: [-0.2, 1.1, 0.1], scale: [2.4, 2.6, 2.3] },
  { position: [-6.2, -0.6, -3.9], rotation: [0.1, 1.4, 0.08], scale: [2.8, 2.7, 2.1] },
  { position: [6, -0.8, -4.1], rotation: [-0.1, 0.3, -0.04], scale: [2.65, 2.5, 2.4] },
  { position: [-2.9, -1, 4.8], rotation: [0.1, 0.7, 0.05], scale: [1.2, 1.5, 1.2] },
  { position: [2.8, -1.1, 4.7], rotation: [0.2, 0.4, -0.06], scale: [1.1, 1.35, 1.2] },
  { position: [-2.55, -0.9, -1.1], rotation: [-0.2, 1.2, 0], scale: [0.9, 1.4, 0.8] },
  { position: [2.55, -0.85, -1.35], rotation: [0.1, 0.5, 0.08], scale: [0.9, 1.45, 0.9] },
  { position: [-2.7, -0.85, -4.4], rotation: [0.12, 0.2, -0.05], scale: [1, 1.6, 0.95] },
  { position: [2.6, -0.9, -4.75], rotation: [-0.1, 0.9, 0.05], scale: [1.1, 1.5, 0.9] },
];

function CanyonRocks({ mobile }: { mobile: boolean }) {
  const rocks = useMemo(() => (mobile ? ROCKS.slice(0, 14) : ROCKS), [mobile]);
  const instances = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!instances.current) return;
    const transform = new THREE.Object3D();
    rocks.forEach((rock, rockIndex) => {
      transform.position.set(...rock.position);
      transform.rotation.set(...rock.rotation);
      transform.scale.set(...rock.scale);
      transform.updateMatrix();
      instances.current?.setMatrixAt(rockIndex, transform.matrix);
    });
    instances.current.instanceMatrix.needsUpdate = true;
    instances.current.computeBoundingSphere();
  }, [rocks]);

  return (
    <instancedMesh ref={instances} args={[undefined, undefined, rocks.length]}>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#111722" roughness={0.93} metalness={0.04} flatShading />
    </instancedMesh>
  );
}

function HoverGate({ position, phase }: { position: Vec3; phase: number }) {
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ring.current) return;
    ring.current.rotation.z = THREE.MathUtils.damp(
      ring.current.rotation.z,
      Math.sin(state.clock.elapsedTime * 0.7 + phase) * 0.08,
      5,
      delta,
    );
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5 + phase) * 0.025;
    ring.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh ref={ring}>
        <torusGeometry args={[1.02, 0.075, 10, 56]} />
        <meshStandardMaterial
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={2.1}
          roughness={0.22}
          metalness={0.2}
        />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 1.03, Math.sin(angle) * 1.03, -0.03]}
          rotation={[0, 0, angle]}
        >
          <boxGeometry args={[0.12, 0.36, 0.18]} />
          <meshStandardMaterial color="#24313d" metalness={0.75} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function HoverDevice({
  progress,
  index,
}: {
  progress: MutableRefObject<number>;
  index: number;
}) {
  const craft = useRef<THREE.Group>(null);
  const thrusters = useRef<THREE.Group>(null);
  const boosted = useRef(false);

  useEffect(() => {
    const handleAction = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "hover") {
        boosted.current = !boosted.current;
      }
    };
    window.addEventListener("larion:scene-action", handleAction);
    return () => window.removeEventListener("larion:scene-action", handleAction);
  }, []);

  useFrame((state, delta) => {
    if (!craft.current) return;
    const proximity = proximityAt(progress, index);
    const steering = proximity > 0.3 ? state.pointer.x * 0.95 : 0;
    const targetX = steering + Math.sin(state.clock.elapsedTime * 0.72) * 0.12;
    craft.current.position.x = THREE.MathUtils.damp(
      craft.current.position.x,
      targetX,
      5.5,
      delta,
    );
    craft.current.position.y = -0.78 + Math.sin(state.clock.elapsedTime * 2.1) * 0.055;
    craft.current.rotation.z = THREE.MathUtils.damp(
      craft.current.rotation.z,
      -steering * 0.12,
      6,
      delta,
    );
    craft.current.rotation.x = THREE.MathUtils.damp(
      craft.current.rotation.x,
      boosted.current ? -0.12 : 0.02,
      5,
      delta,
    );
    if (thrusters.current) {
      const scale = boosted.current ? 1.75 : 1 + Math.sin(state.clock.elapsedTime * 5) * 0.12;
      thrusters.current.scale.z = THREE.MathUtils.damp(
        thrusters.current.scale.z,
        scale,
        7,
        delta,
      );
    }
  });

  const toggleBoost = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    boosted.current = !boosted.current;
  };

  return (
    <group ref={craft} position={[0, -0.78, 2.45]} onClick={toggleBoost}>
      <RoundedBox args={[1.25, 0.16, 1.55]} radius={0.1} smoothness={3} rotation={[0.16, 0, 0]}>
        <meshStandardMaterial color="#172532" metalness={0.72} roughness={0.24} />
      </RoundedBox>
      <mesh position={[0, 0.17, -0.08]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.52, 0.08, 0.92]} />
        <meshStandardMaterial color="#293c4b" roughness={0.45} metalness={0.48} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, -0.01, 0.08]} rotation={[0.08, 0, x < 0 ? 0.22 : -0.22]}>
          <boxGeometry args={[0.36, 0.1, 1.05]} />
          <meshStandardMaterial color="#0c1119" metalness={0.65} roughness={0.25} />
        </mesh>
      ))}
      <group ref={thrusters} position={[0, -0.09, 0.72]}>
        {[-0.43, 0.43].map((x) => (
          <mesh key={x} position={[x, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.13, 0.72, 18, 1, true]} />
            <meshBasicMaterial
              color={CYAN}
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <pointLight color={CYAN} intensity={4.5} distance={3.5} position={[0, -0.1, 0.8]} />
    </group>
  );
}

export function HoverWorld({
  progress,
  index,
  position,
  mobile,
  videoUrl,
  posterUrl,
}: FilmWorldProps) {
  const world = useRef<THREE.Group>(null);
  const presence = useRef(0);
  const { texture, toggle, start, ready } = useManagedVideo(videoUrl, progress, index);
  const posterTexture = useLoader(THREE.TextureLoader, posterUrl);

  useEffect(() => {
    posterTexture.colorSpace = THREE.SRGBColorSpace;
    posterTexture.minFilter = THREE.LinearFilter;
    posterTexture.generateMipmaps = false;
    posterTexture.needsUpdate = true;
  }, [posterTexture]);

  useEffect(() => {
    const handleAction = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "hover") start();
    };
    window.addEventListener("larion:scene-action", handleAction);
    return () => window.removeEventListener("larion:scene-action", handleAction);
  }, [start]);

  useFrame((state, delta) => {
    if (!world.current) return;
    presence.current = THREE.MathUtils.damp(
      presence.current,
      proximityAt(progress, index),
      9,
      delta,
    );
    world.current.visible = presence.current > 0.012;
    const scale = 0.9 + presence.current * 0.1;
    world.current.scale.setScalar(scale);
    world.current.position.set(
      position[0],
      position[1] + (1 - presence.current) * 0.28,
      position[2],
    );
    world.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.012;
  });

  const gatePositions: Vec3[] = [
    [-0.25, -0.25, 0.65],
    [0.55, -0.18, -2.15],
    [-0.42, -0.12, -5.05],
  ];

  return (
    <group ref={world} position={position} visible={Math.abs(progress.current - index) < 0.94}>
      <CanyonRocks mobile={mobile} />
      <TrackDeck />
      {gatePositions.slice(0, mobile ? 2 : 3).map((gatePosition, gateIndex) => (
        <HoverGate
          key={gatePosition[2]}
          position={gatePosition}
          phase={gateIndex * 1.9}
        />
      ))}
      <HoverDevice progress={progress} index={index} />
      <VideoPortal
        texture={ready ? texture : posterTexture}
        position={[0, 0.42, -7.55]}
        size={mobile ? [3.45, 1.94] : [5.15, 2.9]}
        color={CYAN}
        onToggle={toggle}
      />
      <mesh position={[0, -2.08, -2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 17]} />
        <meshStandardMaterial color="#060a10" roughness={0.98} metalness={0.02} />
      </mesh>
      <pointLight color={CYAN} intensity={mobile ? 5 : 8} distance={15} position={[0, 2.5, 1.4]} />
      <pointLight color="#7d8dff" intensity={mobile ? 2 : 4} distance={13} position={[-4, 3, -5]} />
    </group>
  );
}

function Fan({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  const blades = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!blades.current) return;
    blades.current.rotation.z += delta * (2.6 + Math.sin(state.clock.elapsedTime) * 0.25);
  });

  return (
    <group position={position} scale={scale}>
      <mesh>
        <torusGeometry args={[0.58, 0.09, 10, 48]} />
        <meshStandardMaterial color="#2c3741" metalness={0.82} roughness={0.25} />
      </mesh>
      <group ref={blades}>
        {Array.from({ length: 7 }, (_, bladeIndex) => {
          const angle = (bladeIndex / 7) * Math.PI * 2;
          return (
            <mesh key={bladeIndex} rotation={[0, 0, angle]} position={[Math.cos(angle) * 0.25, Math.sin(angle) * 0.25, 0]}>
              <boxGeometry args={[0.14, 0.54, 0.035]} />
              <meshStandardMaterial color="#77848e" metalness={0.72} roughness={0.34} />
            </mesh>
          );
        })}
      </group>
      <mesh position={[0, 0, 0.045]}>
        <circleGeometry args={[0.09, 24]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

function Limb({
  from,
  to,
  radius,
  color,
}: {
  from: Vec3;
  to: Vec3;
  radius: number;
  color: string;
}) {
  const transform = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return {
      position: midpoint.toArray() as Vec3,
      quaternion,
      length: direction.length(),
    };
  }, [from, to]);

  return (
    <mesh position={transform.position} quaternion={transform.quaternion}>
      <cylinderGeometry args={[radius, radius * 0.88, transform.length, 14]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

function FlightBody({
  progress,
  index,
}: {
  progress: MutableRefObject<number>;
  index: number;
}) {
  const rig = useRef<THREE.Group>(null);
  const lifted = useRef(false);

  useEffect(() => {
    const handleAction = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "flybox") {
        lifted.current = !lifted.current;
      }
    };
    window.addEventListener("larion:scene-action", handleAction);
    return () => window.removeEventListener("larion:scene-action", handleAction);
  }, []);

  useFrame((state, delta) => {
    if (!rig.current) return;
    const proximity = proximityAt(progress, index);
    const targetTilt = proximity > 0.3 ? state.pointer.x * -0.16 : 0;
    const targetPitch = proximity > 0.3 ? state.pointer.y * 0.075 : 0;
    rig.current.rotation.z = THREE.MathUtils.damp(
      rig.current.rotation.z,
      targetTilt,
      5.5,
      delta,
    );
    rig.current.rotation.x = THREE.MathUtils.damp(
      rig.current.rotation.x,
      targetPitch,
      5.5,
      delta,
    );
    rig.current.position.y = THREE.MathUtils.damp(
      rig.current.position.y,
      (lifted.current ? 0.32 : 0.08) + Math.sin(state.clock.elapsedTime * 1.25) * 0.055,
      5,
      delta,
    );
  });

  const toggleLift = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    lifted.current = !lifted.current;
  };

  return (
    <group ref={rig} position={[-0.8, 0.08, 0.65]} onClick={toggleLift}>
      <mesh position={[0, 0.05, 0]}>
        <capsuleGeometry args={[0.3, 0.88, 8, 18]} />
        <meshStandardMaterial color="#e2b63f" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.88, 0.02]}>
        <sphereGeometry args={[0.28, 20, 16]} />
        <meshStandardMaterial color="#bf8e6c" roughness={0.82} />
      </mesh>
      <RoundedBox args={[0.56, 0.32, 0.32]} radius={0.07} smoothness={3} position={[0, 0.91, 0.23]}>
        <meshStandardMaterial color="#f3f5f7" metalness={0.2} roughness={0.26} />
      </RoundedBox>
      <mesh position={[0, 0.91, 0.405]}>
        <planeGeometry args={[0.39, 0.17]} />
        <meshPhysicalMaterial color="#101927" roughness={0.05} metalness={0.5} clearcoat={1} />
      </mesh>
      <Limb from={[-0.2, 0.48, 0]} to={[-1.25, 0.72, -0.02]} radius={0.13} color="#e2b63f" />
      <Limb from={[0.2, 0.48, 0]} to={[1.25, 0.72, -0.02]} radius={0.13} color="#e2b63f" />
      <Limb from={[-0.15, -0.44, 0]} to={[-0.62, -1.18, -0.05]} radius={0.15} color="#252d35" />
      <Limb from={[0.15, -0.44, 0]} to={[0.62, -1.18, -0.05]} radius={0.15} color="#252d35" />
      <RoundedBox args={[0.72, 0.44, 0.26]} radius={0.08} smoothness={3} position={[0, 0.03, 0.18]}>
        <meshStandardMaterial color="#171d25" metalness={0.18} roughness={0.55} />
      </RoundedBox>
      <Line
        points={[
          [-0.24, 0.12, -0.02],
          [-0.65, 1.55, -0.28],
          [-1.4, 2.35, -0.65],
        ]}
        color="#cbd8df"
        lineWidth={1.2}
        transparent
        opacity={0.7}
      />
      <Line
        points={[
          [0.24, 0.12, -0.02],
          [0.65, 1.55, -0.28],
          [1.4, 2.35, -0.65],
        ]}
        color="#cbd8df"
        lineWidth={1.2}
        transparent
        opacity={0.7}
      />
    </group>
  );
}

function AirflowField({ mobile }: { mobile: boolean }) {
  const field = useRef<THREE.Group>(null);
  const count = mobile ? 7 : 13;
  const streams = useMemo(
    () =>
      Array.from({ length: count }, (_, streamIndex) => {
        const normalized = streamIndex / (count - 1);
        const x = THREE.MathUtils.lerp(-2.45, 2.45, normalized);
        return Array.from({ length: 16 }, (_, pointIndex) => {
          const t = pointIndex / 15;
          const bend = Math.sin(t * Math.PI) * (0.18 + Math.abs(x) * 0.035);
          return [
            x + Math.sin(t * Math.PI * 2 + streamIndex) * 0.045,
            -2.3 + t * 4.8,
            -0.45 + bend,
          ] as Vec3;
        });
      }),
    [count],
  );

  useFrame((state) => {
    if (!field.current) return;
    field.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.035;
    field.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.45) * 0.018;
  });

  return (
    <group ref={field}>
      {streams.map((points, streamIndex) => (
        <Line
          key={streamIndex}
          points={points}
          color={streamIndex % 3 === 0 ? GOLD : CYAN}
          lineWidth={streamIndex % 3 === 0 ? 1.05 : 0.7}
          transparent
          opacity={streamIndex % 3 === 0 ? 0.54 : 0.28}
          dashed
          dashSize={0.2}
          gapSize={0.27}
        />
      ))}
    </group>
  );
}

export function FlyboxWorld({
  progress,
  index,
  position,
  mobile,
  videoUrl,
  posterUrl,
}: FilmWorldProps) {
  const world = useRef<THREE.Group>(null);
  const chamber = useRef<THREE.Group>(null);
  const presence = useRef(0);
  const { texture, toggle, start, ready } = useManagedVideo(videoUrl, progress, index);
  const posterTexture = useLoader(THREE.TextureLoader, posterUrl);

  useEffect(() => {
    posterTexture.colorSpace = THREE.SRGBColorSpace;
    posterTexture.minFilter = THREE.LinearFilter;
    posterTexture.generateMipmaps = false;
    posterTexture.needsUpdate = true;
  }, [posterTexture]);

  useEffect(() => {
    const handleAction = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "flybox") start();
    };
    window.addEventListener("larion:scene-action", handleAction);
    return () => window.removeEventListener("larion:scene-action", handleAction);
  }, [start]);

  useFrame((state, delta) => {
    if (!world.current) return;
    presence.current = THREE.MathUtils.damp(
      presence.current,
      proximityAt(progress, index),
      9,
      delta,
    );
    world.current.visible = presence.current > 0.012;
    world.current.position.set(
      position[0],
      position[1] + (1 - presence.current) * 0.3,
      position[2],
    );
    const scale = 0.9 + presence.current * 0.1;
    world.current.scale.setScalar(scale);
    if (chamber.current) {
      chamber.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.01;
    }
  });

  const braces = Array.from({ length: mobile ? 8 : 12 }, (_, braceIndex) => {
    const angle = (braceIndex / (mobile ? 8 : 12)) * Math.PI * 2;
    return { angle, position: [Math.cos(angle) * 3.42, Math.sin(angle) * 3.42, -0.82] as Vec3 };
  });

  return (
    <group ref={world} position={position} visible={Math.abs(progress.current - index) < 0.94}>
      <group ref={chamber}>
        <mesh position={[0, 0, -0.86]}>
          <torusGeometry args={[3.5, 0.11, 12, 96]} />
          <meshStandardMaterial color="#303b45" metalness={0.86} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0, -0.82]}>
          <torusGeometry args={[3.08, 0.035, 8, 96]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.25} metalness={0.4} roughness={0.25} />
        </mesh>
        {braces.map(({ angle, position: bracePosition }, braceIndex) => (
          <mesh key={braceIndex} position={bracePosition} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.1, 0.66, 0.16]} />
            <meshStandardMaterial color="#56636d" metalness={0.78} roughness={0.28} />
          </mesh>
        ))}
        <AirflowField mobile={mobile} />
        <FlightBody progress={progress} index={index} />
        <group position={[0, -2.35, -0.4]}>
          <Fan position={[-1.45, 0, 0]} scale={0.88} />
          <Fan position={[0, 0, 0]} />
          <Fan position={[1.45, 0, 0]} scale={0.88} />
        </group>
      </group>
      <VideoPortal
        texture={ready ? texture : posterTexture}
        position={mobile ? [2.25, 0.3, -1.45] : [3.65, 0.35, -1.65]}
        rotation={[0, -0.28, 0]}
        size={mobile ? [2.65, 1.49] : [4.15, 2.34]}
        color={GOLD}
        onToggle={toggle}
      />
      <pointLight color={GOLD} intensity={mobile ? 5 : 8} distance={12} position={[0, 3.1, 2.5]} />
      <pointLight color={CYAN} intensity={mobile ? 2.5 : 4.5} distance={11} position={[-3.4, -0.5, 1]} />
    </group>
  );
}

function LighthouseSculpture() {
  const houses = [
    [-1.22, -1.56, -0.22, 0.38],
    [1.2, -1.42, -0.25, 0.48],
    [-1.34, 1.22, -0.34, 0.31],
  ] as const;
  return (
    <group>
      {houses.map(([x, y, z, scale], houseIndex) => (
        <group key={houseIndex} position={[x, y, z]} scale={scale}>
          <RoundedBox args={[1, 0.78, 0.72]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color="#d7b678" roughness={0.65} />
          </RoundedBox>
          <mesh position={[0, 0.63, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.72, 0.72, 0.76]} />
            <meshStandardMaterial color="#7f5f40" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0, 0.38]}>
            <planeGeometry args={[0.18, 0.3]} />
            <meshBasicMaterial color="#ffe3a4" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <Line
        points={houses.map(([x, y, z]) => [x, y, z - 0.03] as Vec3).concat([[-1.22, -1.56, -0.25]])}
        color="#f0c985"
        lineWidth={0.8}
        transparent
        opacity={0.42}
      />
    </group>
  );
}

function MoneyNestSculpture() {
  return (
    <group>
      {[-1.35, 1.35].map((x, stackIndex) => (
        <group key={x} position={[x, -1.48, -0.22]}>
          {Array.from({ length: stackIndex === 0 ? 4 : 6 }, (_, coinIndex) => (
            <mesh key={coinIndex} position={[0, coinIndex * 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.075, 28]} />
              <meshStandardMaterial color="#82d2a0" metalness={0.62} roughness={0.28} />
            </mesh>
          ))}
        </group>
      ))}
      {[0.28, 0.5, 0.78, 1.06].map((height, barIndex) => (
        <RoundedBox
          key={height}
          args={[0.16, height, 0.18]}
          radius={0.04}
          smoothness={2}
          position={[-1.52 + barIndex * 0.23, 1.18 + height / 2, -0.28]}
        >
          <meshStandardMaterial color="#76ffc3" emissive="#3cd68d" emissiveIntensity={0.6} roughness={0.3} />
        </RoundedBox>
      ))}
    </group>
  );
}

function BiteSyncSculpture() {
  return (
    <group>
      {[1.35, 1.58].map((radius, ringIndex) => (
        <mesh key={radius} position={[0, 0, -0.32]} rotation={[0.18 + ringIndex * 0.32, 0.28, ringIndex * 0.6]}>
          <torusGeometry args={[radius, 0.028, 8, 72]} />
          <meshStandardMaterial color={ringIndex === 0 ? "#c8a7ff" : CYAN} emissive={ringIndex === 0 ? "#8964da" : CYAN} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {[
        [-1.28, 1.05, -0.22],
        [1.34, -0.8, -0.18],
        [1.12, 1.15, -0.25],
        [-1.42, -0.72, -0.24],
      ].map((spherePosition, sphereIndex) => (
        <mesh key={sphereIndex} position={spherePosition as Vec3}>
          <sphereGeometry args={[0.12 + sphereIndex * 0.012, 18, 14]} />
          <meshStandardMaterial color={sphereIndex % 2 === 0 ? "#c8a7ff" : CYAN} emissiveIntensity={0.65} emissive={sphereIndex % 2 === 0 ? "#7d5fc4" : CYAN} />
        </mesh>
      ))}
    </group>
  );
}

function DomainSculpture({ index }: { index: number }) {
  if (index === 0) return <LighthouseSculpture />;
  if (index === 1) return <MoneyNestSculpture />;
  return <BiteSyncSculpture />;
}

const PHONE_LAYOUT = [
  { position: [-2.55, 0, -0.45] as Vec3, rotation: [0.02, 0.3, -0.055] as Vec3 },
  { position: [0, 0.3, 0.35] as Vec3, rotation: [0, 0, 0.015] as Vec3 },
  { position: [2.55, -0.03, -0.45] as Vec3, rotation: [-0.02, -0.3, 0.06] as Vec3 },
];

function PhysicalPhone({
  texture,
  phoneIndex,
  focused,
  onFocus,
  mobile,
}: {
  texture: THREE.Texture;
  phoneIndex: number;
  focused: number;
  onFocus: (index: number) => void;
  mobile: boolean;
}) {
  const phone = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const layout = PHONE_LAYOUT[phoneIndex] ?? PHONE_LAYOUT[PHONE_LAYOUT.length - 1];
  const targetPosition = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Euler());

  useFrame((state, delta) => {
    if (!phone.current) return;
    const isFocused = focused === phoneIndex;
    const hasFocus = focused >= 0;
    const side = phoneIndex < focused ? -1 : 1;
    if (isFocused) {
      targetPosition.current.set(0, 0.25, 1.05);
      targetRotation.current.set(0, 0, 0);
    } else if (hasFocus) {
      targetPosition.current.set(side * (mobile ? 2.7 : 3.75), -0.15, -1.25);
      targetRotation.current.set(0, -side * 0.32, side * 0.08);
    } else {
      targetPosition.current.set(...layout.position);
      targetRotation.current.set(...layout.rotation);
    }
    const targetScale = isFocused ? 1.12 : hasFocus ? 0.72 : hovered.current ? 1.035 : 1;

    phone.current.position.lerp(targetPosition.current, 1 - Math.exp(-6 * delta));
    phone.current.rotation.x = THREE.MathUtils.damp(phone.current.rotation.x, targetRotation.current.x, 6, delta);
    phone.current.rotation.y = THREE.MathUtils.damp(
      phone.current.rotation.y,
      targetRotation.current.y + (!hasFocus ? state.pointer.x * 0.025 : 0),
      6,
      delta,
    );
    phone.current.rotation.z = THREE.MathUtils.damp(phone.current.rotation.z, targetRotation.current.z, 6, delta);
    const nextScale = THREE.MathUtils.damp(phone.current.scale.x, targetScale, 6, delta);
    phone.current.scale.setScalar(nextScale);
  });

  const handleFocus = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onFocus(focused === phoneIndex ? -1 : phoneIndex);
  };

  return (
    <group
      ref={phone}
      position={layout.position}
      rotation={layout.rotation}
      onClick={handleFocus}
      onPointerOver={(event) => {
        event.stopPropagation();
        hovered.current = true;
      }}
      onPointerOut={() => {
        hovered.current = false;
      }}
    >
      <DomainSculpture index={phoneIndex} />
      <RoundedBox args={[2.18, 4.72, 0.25]} radius={0.24} smoothness={5}>
        <meshPhysicalMaterial color="#171b20" metalness={0.92} roughness={0.2} clearcoat={0.65} />
      </RoundedBox>
      <RoundedBox args={[2.04, 4.55, 0.08]} radius={0.2} smoothness={5} position={[0, 0, 0.14]}>
        <meshStandardMaterial color="#010204" roughness={0.16} metalness={0.36} />
      </RoundedBox>
      <mesh position={[0, 0, 0.188]}>
        <planeGeometry args={[1.91, 4.29]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <RoundedBox args={[1.98, 4.39, 0.022]} radius={0.18} smoothness={4} position={[0, 0, 0.202]}>
        <meshPhysicalMaterial
          color="#d8f3ff"
          transparent
          opacity={0.09}
          transmission={0.18}
          roughness={0.03}
          metalness={0.08}
          clearcoat={1}
          depthWrite={false}
        />
      </RoundedBox>
      <RoundedBox args={[0.56, 0.15, 0.04]} radius={0.075} smoothness={4} position={[0, 2.02, 0.225]}>
        <meshStandardMaterial color="#050608" roughness={0.18} />
      </RoundedBox>
      <RoundedBox args={[0.055, 0.72, 0.06]} radius={0.022} smoothness={2} position={[-1.115, 0.72, 0]}>
        <meshStandardMaterial color="#555e67" metalness={0.95} roughness={0.16} />
      </RoundedBox>
      <RoundedBox args={[0.055, 0.42, 0.06]} radius={0.022} smoothness={2} position={[1.115, 0.84, 0]}>
        <meshStandardMaterial color="#555e67" metalness={0.95} roughness={0.16} />
      </RoundedBox>
      <RoundedBox args={[0.74, 0.92, 0.07]} radius={0.17} smoothness={4} position={[-0.56, 1.5, -0.17]}>
        <meshStandardMaterial color="#0b0d11" metalness={0.72} roughness={0.22} />
      </RoundedBox>
      {[
        [-0.76, 1.71, -0.235],
        [-0.38, 1.7, -0.235],
        [-0.74, 1.3, -0.235],
      ].map((lensPosition, lensIndex) => (
        <mesh key={lensIndex} position={lensPosition as Vec3} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.145, 0.145, 0.065, 28]} />
          <meshPhysicalMaterial color="#101d2c" metalness={0.5} roughness={0.05} clearcoat={1} />
        </mesh>
      ))}
      <pointLight color={phoneIndex === 0 ? "#f0c985" : phoneIndex === 1 ? "#76ffc3" : "#c8a7ff"} intensity={2.6} distance={3.5} position={[0, 0, 0.9]} />
    </group>
  );
}

export function MobileWorld({
  progress,
  index,
  position,
  mobile,
  screens,
}: MobileWorldProps) {
  const textures = useLoader(THREE.TextureLoader, screens);
  const world = useRef<THREE.Group>(null);
  const presence = useRef(0);
  const [focused, setFocused] = useState(-1);

  useEffect(() => {
    const handleAction = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== "mobile") return;
      setFocused((current) => (current + 1) % 3);
    };
    window.addEventListener("larion:scene-action", handleAction);
    return () => window.removeEventListener("larion:scene-action", handleAction);
  }, []);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = mobile ? 2 : 4;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
    });
  }, [mobile, textures]);

  useFrame((state, delta) => {
    if (!world.current) return;
    presence.current = THREE.MathUtils.damp(
      presence.current,
      proximityAt(progress, index),
      9,
      delta,
    );
    world.current.visible = presence.current > 0.012;
    world.current.position.set(
      position[0],
      position[1] + (1 - presence.current) * 0.3,
      position[2],
    );
    const scale = 0.88 + presence.current * 0.12;
    world.current.scale.setScalar(scale);
    world.current.rotation.y = THREE.MathUtils.damp(
      world.current.rotation.y,
      state.pointer.x * 0.025,
      5,
      delta,
    );
  });

  return (
    <group ref={world} position={position} visible={Math.abs(progress.current - index) < 0.94}>
      <mesh
        position={[0, 0, -2.6]}
        onClick={(event) => {
          event.stopPropagation();
          setFocused(-1);
        }}
      >
        <planeGeometry args={[15, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {textures.slice(0, 3).map((texture, phoneIndex) => (
        <PhysicalPhone
          key={`${screens[phoneIndex]}-${phoneIndex}`}
          texture={texture}
          phoneIndex={phoneIndex}
          focused={focused}
          onFocus={setFocused}
          mobile={mobile}
        />
      ))}
      {[1.55, 2.75, 4.15].map((radius, ringIndex) => (
        <mesh key={radius} position={[0, -2.63, -0.75]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.018, radius + 0.018, 96]} />
          <meshBasicMaterial
            color={ringIndex === 1 ? "#c8a7ff" : CYAN}
            transparent
            opacity={ringIndex === 1 ? 0.3 : 0.14}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <pointLight color="#c8a7ff" intensity={mobile ? 7 : 11} distance={13} position={[0, 2.8, 3.2]} />
      <pointLight color={CYAN} intensity={mobile ? 3 : 5} distance={11} position={[-4, -1, 1]} />
    </group>
  );
}
