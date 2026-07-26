import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MutableRefObject } from "react";
import { Line, RoundedBox } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { SourcedHoverboard } from "./SourcedAssets";

type SharedWorldProps = {
  progress: MutableRefObject<number>;
  index: number;
  position: [number, number, number];
  mobile: boolean;
};

type FilmWorldProps = SharedWorldProps & {
  videoUrl: string;
  posterUrl: string;
  active: boolean;
  onActiveChange: (active: boolean) => void;
};

type MobileWorldProps = SharedWorldProps & {
  screens: string[];
  focused: number;
  onFocus: (index: number) => void;
};

type Vec3 = [number, number, number];

const CYAN = "#71fff0";
const GOLD = "#f5c65c";
const INK = "#05080d";

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
  active: boolean,
) {
  const resource = useMemo(() => {
    const video = document.createElement("video");
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "none";
    video.controls = false;
    video.disablePictureInPicture = true;
    video.setAttribute("playsinline", "");

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return { video, texture };
  }, [url]);
  const requested = useRef(false);
  const retryAfter = useRef(0);
  const [ready, setReady] = useState(false);

  const requestPlayback = useCallback(
    (shouldPlay: boolean) => {
      if (shouldPlay && performance.now() < retryAfter.current) return;
      if (shouldPlay === requested.current) return;
      requested.current = shouldPlay;

      if (shouldPlay) {
        if (!url) {
          requested.current = false;
          return;
        }
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

  useFrame((_, delta) => {
    requestPlayback(
      proximityAt(progress, index) > 0.56 && !document.hidden,
    );
    resource.video.playbackRate = THREE.MathUtils.damp(
      resource.video.playbackRate || 1,
      active ? 1.08 : 1,
      4.5,
      Math.min(delta, 0.05),
    );
    if (resource.video.readyState >= 2 && resource.video.videoWidth > 0) {
      resource.texture.needsUpdate = true;
    }
  });

  useEffect(() => {
    let videoFrame = 0;
    const handleReady = () => {
      if (resource.video.currentTime > 0.035) setReady(true);
    };
    const handlePlaying = () => {
      if ("requestVideoFrameCallback" in resource.video) {
        videoFrame = resource.video.requestVideoFrameCallback(() => setReady(true));
      } else {
        handleReady();
      }
    };
    const handleVisibility = () => {
      if (document.hidden) requestPlayback(false);
    };
    resource.video.addEventListener("playing", handlePlaying);
    resource.video.addEventListener("timeupdate", handleReady);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      resource.video.removeEventListener("playing", handlePlaying);
      resource.video.removeEventListener("timeupdate", handleReady);
      if (videoFrame && "cancelVideoFrameCallback" in resource.video) {
        resource.video.cancelVideoFrameCallback(videoFrame);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
      resource.video.pause();
      resource.video.removeAttribute("src");
      resource.video.load();
      resource.texture.dispose();
    };
  }, [requestPlayback, resource]);

  return { texture: resource.texture, ready };
}

function VideoPortal({
  texture,
  position,
  rotation = [0, 0, 0],
  size,
  color,
  active,
  onToggle,
}: {
  texture: THREE.Texture;
  position: Vec3;
  rotation?: Vec3;
  size: [number, number];
  color: string;
  active: boolean;
  onToggle: () => void;
}) {
  const [width, height] = size;
  const frame = 0.04;
  const screenMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const idleTint = useMemo(() => new THREE.Color("#c4ccd2"), []);
  const liveTint = useMemo(() => new THREE.Color("#ffffff"), []);

  useFrame((_, delta) => {
    screenMaterial.current?.color.lerp(
      active ? liveTint : idleTint,
      1 - Math.exp(-5 * Math.min(delta, 0.05)),
    );
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onToggle();
  };

  return (
    <group position={position} rotation={rotation} onClick={handleClick}>
      <mesh position={[0, 0, -0.045]}>
        <planeGeometry args={[width + 0.18, height + 0.18]} />
        <meshStandardMaterial
          color={INK}
          metalness={0.76}
          roughness={0.23}
        />
      </mesh>
      <mesh position={[0, 0, 0.04]} renderOrder={1}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={screenMaterial}
          map={texture}
          toneMapped={false}
          side={THREE.DoubleSide}
          fog={false}
        />
      </mesh>
      {[
        [0, height / 2 + frame, 0.055, width + 0.12, frame],
        [0, -height / 2 - frame, 0.055, width + 0.12, frame],
        [-width / 2 - frame, 0, 0.055, frame, height + 0.12],
        [width / 2 + frame, 0, 0.055, frame, height + 0.12],
      ].map(([x, y, z, frameWidth, frameHeight], frameIndex) => (
        <mesh key={frameIndex} position={[x, y, z]}>
          <boxGeometry args={[frameWidth, frameHeight, 0.055]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={active ? 1.65 : 0.72}
            metalness={0.35}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function RoutePickup({
  position,
  phase,
  active,
}: {
  position: Vec3;
  phase: number;
  active: boolean;
}) {
  const pickup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!pickup.current) return;
    pickup.current.rotation.y += delta * (active ? 1.7 : 0.72);
    pickup.current.rotation.z = Math.sin(
      state.clock.elapsedTime * 1.15 + phase,
    ) * 0.12;
    pickup.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 1.8 + phase) * 0.07;
  });

  return (
    <group ref={pickup} position={position} scale={active ? 1.08 : 0.92}>
      <mesh>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={active ? 2.6 : 1.05}
          metalness={0.28}
          roughness={0.18}
        />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <ringGeometry args={[0.25, 0.27, 40]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={active ? 0.62 : 0.28}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ArtifactBeacon({
  position,
  active,
}: {
  position: Vec3;
  active: boolean;
}) {
  const core = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!core.current) return;
    core.current.rotation.x += delta * 0.28;
    core.current.rotation.y -= delta * (active ? 0.78 : 0.34);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.055;
    core.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <group ref={core}>
        <mesh>
          <dodecahedronGeometry args={[0.29, 0]} />
          <meshPhysicalMaterial
            color="#172229"
            emissive={CYAN}
            emissiveIntensity={active ? 1.45 : 0.46}
            metalness={0.7}
            roughness={0.16}
            clearcoat={1}
          />
        </mesh>
        <mesh scale={1.23}>
          <icosahedronGeometry args={[0.29, 1]} />
          <meshBasicMaterial
            color={CYAN}
            wireframe
            transparent
            opacity={active ? 0.72 : 0.34}
            toneMapped={false}
          />
        </mesh>
      </group>
      <pointLight
        color={CYAN}
        intensity={active ? 5.5 : 1.8}
        distance={4.5}
      />
    </group>
  );
}

function HoverBoardRig({
  progress,
  index,
  mobile,
  active,
  onActiveChange,
}: {
  progress: MutableRefObject<number>;
  index: number;
  mobile: boolean;
  active: boolean;
  onActiveChange: (active: boolean) => void;
}) {
  const cameraAnchor = useRef<THREE.Group>(null);
  const board = useRef<THREE.Group>(null);
  const boostTrails = useRef<THREE.Group>(null);
  const boostLight = useRef<THREE.PointLight>(null);
  const inverseParent = useMemo(() => new THREE.Matrix4(), []);
  const localCamera = useMemo(() => new THREE.Matrix4(), []);
  const localScale = useMemo(() => new THREE.Vector3(), []);
  const leanLimit = THREE.MathUtils.degToRad(mobile ? 10 : 11.5);
  const baseY = mobile ? -1.22 : -0.9;
  const baseZ = mobile ? -2.9 : -2.72;

  useFrame(({ camera, pointer, clock }, delta) => {
    if (!cameraAnchor.current || !board.current) return;
    const parent = cameraAnchor.current.parent;
    if (parent) {
      parent.updateWorldMatrix(true, false);
      camera.updateMatrixWorld();
      inverseParent.copy(parent.matrixWorld).invert();
      localCamera.multiplyMatrices(inverseParent, camera.matrixWorld);
      localCamera.decompose(
        cameraAnchor.current.position,
        cameraAnchor.current.quaternion,
        localScale,
      );
      cameraAnchor.current.scale.copy(localScale);
    }

    const proximity = proximityAt(progress, index);
    const steer = proximity > 0.28 ? pointer.x : 0;
    const bob = Math.sin(clock.elapsedTime * 2.15) * 0.018;
    board.current.position.x = THREE.MathUtils.damp(
      board.current.position.x,
      steer * (mobile ? 0.08 : 0.16),
      7,
      delta,
    );
    board.current.position.y = THREE.MathUtils.damp(
      board.current.position.y,
      baseY + bob + (active ? 0.08 : 0),
      7,
      delta,
    );
    board.current.position.z = THREE.MathUtils.damp(
      board.current.position.z,
      baseZ - (active ? 0.28 : 0),
      7,
      delta,
    );
    board.current.rotation.x = THREE.MathUtils.damp(
      board.current.rotation.x,
      0.25 - pointer.y * 0.035 - (active ? 0.035 : 0),
      7,
      delta,
    );
    board.current.rotation.y = THREE.MathUtils.damp(
      board.current.rotation.y,
      steer * THREE.MathUtils.degToRad(4.5),
      7,
      delta,
    );
    board.current.rotation.z = THREE.MathUtils.damp(
      board.current.rotation.z,
      -steer * leanLimit,
      7,
      delta,
    );
    const boardScale = THREE.MathUtils.damp(
      board.current.scale.x,
      active ? 1.035 : 1,
      7,
      delta,
    );
    board.current.scale.setScalar(boardScale);

    if (boostTrails.current) {
      const trailScale = THREE.MathUtils.damp(
        boostTrails.current.scale.z,
        active ? 2.4 : 0.55,
        8,
        delta,
      );
      boostTrails.current.scale.set(1, 1, trailScale);
    }
    if (boostLight.current) {
      boostLight.current.intensity = THREE.MathUtils.damp(
        boostLight.current.intensity,
        active ? 9 : 2.2,
        8,
        delta,
      );
    }
  });

  const beginBoost = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const target = event.target as unknown as {
      setPointerCapture?: (pointerId: number) => void;
    };
    target.setPointerCapture?.(event.pointerId);
    onActiveChange(true);
  };

  const endBoost = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const target = event.target as unknown as {
      releasePointerCapture?: (pointerId: number) => void;
    };
    target.releasePointerCapture?.(event.pointerId);
    onActiveChange(false);
  };

  return (
    <group ref={cameraAnchor}>
      <group
        ref={board}
        position={[0, baseY, baseZ]}
        rotation={[0.25, 0, 0]}
        onPointerDown={beginBoost}
        onPointerUp={endBoost}
        onPointerOut={(event) => {
          if (event.buttons > 0) endBoost(event);
        }}
      >
        <Suspense fallback={null}>
          <SourcedHoverboard
            normalizeTo={mobile ? 1.82 : 2.18}
            shadows={false}
          />
        </Suspense>
        <group ref={boostTrails} position={[0, -0.08, 0.68]} scale={[1, 1, 0.55]}>
          {[-0.2, 0.2].map((x) => (
            <mesh
              key={x}
              position={[x, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <capsuleGeometry args={[0.024, 0.24, 4, 10]} />
              <meshBasicMaterial
                color={CYAN}
                transparent
                opacity={0.66}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
        <pointLight
          ref={boostLight}
          color={CYAN}
          intensity={2.2}
          distance={3.5}
          position={[0, -0.08, 0.35]}
        />
      </group>
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
  active,
  onActiveChange,
}: FilmWorldProps) {
  const world = useRef<THREE.Group>(null);
  const videoStage = useRef<THREE.Group>(null);
  const presence = useRef(0);
  const { texture, ready } = useManagedVideo(
    videoUrl,
    progress,
    index,
    active,
  );
  const posterTexture = useLoader(THREE.TextureLoader, posterUrl);

  useEffect(() => {
    posterTexture.colorSpace = THREE.SRGBColorSpace;
    posterTexture.minFilter = THREE.LinearFilter;
    posterTexture.magFilter = THREE.LinearFilter;
    posterTexture.generateMipmaps = false;
    posterTexture.needsUpdate = true;
  }, [posterTexture]);

  useFrame((state, delta) => {
    if (!world.current) return;
    presence.current = THREE.MathUtils.damp(
      presence.current,
      proximityAt(progress, index),
      9,
      delta,
    );
    world.current.visible = presence.current > 0.012;
    const scale = 0.97 + presence.current * 0.03;
    world.current.scale.setScalar(scale);
    world.current.position.set(
      position[0],
      position[1] + (1 - presence.current) * 0.12,
      position[2],
    );
    world.current.rotation.y = 0;

    if (videoStage.current) {
      videoStage.current.rotation.z = THREE.MathUtils.damp(
        videoStage.current.rotation.z,
        state.pointer.x * THREE.MathUtils.degToRad(1.65),
        5.5,
        delta,
      );
      const targetScale = active ? 1.018 : 1;
      const nextScale = THREE.MathUtils.damp(
        videoStage.current.scale.x,
        targetScale,
        6,
        delta,
      );
      videoStage.current.scale.setScalar(nextScale);
    }
  });

  const pickupPositions: Vec3[] = mobile
    ? [
        [-1.25, -1.1, -1.55],
        [0.2, -0.72, -2.65],
        [1.45, -0.25, -3.75],
      ]
    : [
        [-2.95, -1.25, -1.65],
        [0.15, -0.78, -2.85],
        [3.05, -0.22, -4.1],
      ];

  return (
    <group
      ref={world}
      position={position}
      visible={Math.abs(progress.current - index) < 0.94}
    >
      <group ref={videoStage}>
        <VideoPortal
          texture={ready ? texture : posterTexture}
          position={mobile ? [0.6, -0.44, -5.15] : [0.75, 0.18, -5.6]}
          size={mobile ? [6.4, 3.6] : [10.8, 6.075]}
          color={CYAN}
          active={active}
          onToggle={() => onActiveChange(!active)}
        />
      </group>
      {pickupPositions.map((pickupPosition, pickupIndex) => (
        <RoutePickup
          key={pickupIndex}
          position={pickupPosition}
          phase={pickupIndex * 1.7}
          active={active}
        />
      ))}
      <ArtifactBeacon
        position={mobile ? [2.25, 0.7, -4.4] : [4.65, 1.25, -4.82]}
        active={active}
      />
      <HoverBoardRig
        progress={progress}
        index={index}
        mobile={mobile}
        active={active}
        onActiveChange={onActiveChange}
      />
      <pointLight
        color={CYAN}
        intensity={active ? (mobile ? 5.8 : 8.5) : (mobile ? 2.2 : 3.4)}
        distance={15}
        position={[0.5, -0.1, 1.7]}
      />
      <pointLight
        color="#6f62ff"
        intensity={mobile ? 2 : 3.8}
        distance={14}
        position={[-4, 3, -4]}
      />
    </group>
  );
}

function Fan({
  position,
  scale = 1,
  active,
}: {
  position: Vec3;
  scale?: number;
  active: boolean;
}) {
  const blades = useRef<THREE.Group>(null);
  const motionDisk = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state, delta) => {
    if (!blades.current) return;
    const speed = active
      ? 19
      : 4.8 + Math.sin(state.clock.elapsedTime) * 0.35;
    blades.current.rotation.z += delta * speed;
    if (motionDisk.current) {
      motionDisk.current.opacity = THREE.MathUtils.damp(
        motionDisk.current.opacity,
        active ? 0.24 : 0.035,
        7,
        delta,
      );
    }
  });

  return (
    <group position={position} scale={scale}>
      <mesh>
        <torusGeometry args={[0.48, 0.065, 8, 40]} />
        <meshStandardMaterial
          color="#2c3741"
          metalness={0.82}
          roughness={0.25}
        />
      </mesh>
      <group ref={blades}>
        {Array.from({ length: 6 }, (_, bladeIndex) => {
          const angle = (bladeIndex / 6) * Math.PI * 2;
          return (
            <mesh
              key={bladeIndex}
              rotation={[0, 0, angle]}
              position={[
                Math.cos(angle) * 0.2,
                Math.sin(angle) * 0.2,
                0,
              ]}
            >
              <boxGeometry args={[0.11, 0.43, 0.028]} />
              <meshStandardMaterial
                color="#77848e"
                metalness={0.72}
                roughness={0.34}
              />
            </mesh>
          );
        })}
      </group>
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[0.07, 20]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={active ? 2.5 : 0.72}
        />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <circleGeometry args={[0.4, 40]} />
        <meshBasicMaterial
          ref={motionDisk}
          color={CYAN}
          transparent
          opacity={0.035}
          depthWrite={false}
          toneMapped={false}
        />
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
      <cylinderGeometry
        args={[radius, radius * 0.88, transform.length, 12]}
      />
      <meshStandardMaterial color={color} roughness={0.68} metalness={0.05} />
    </mesh>
  );
}

function FlightBody({
  active,
  mobile,
}: {
  active: boolean;
  mobile: boolean;
}) {
  const rig = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rig.current) return;
    rig.current.position.y = THREE.MathUtils.damp(
      rig.current.position.y,
      (active ? 0.18 : 0) +
        Math.sin(state.clock.elapsedTime * (active ? 2.2 : 1.1)) * 0.035,
      6,
      delta,
    );
    rig.current.rotation.z = THREE.MathUtils.damp(
      rig.current.rotation.z,
      active ? state.pointer.x * -0.1 : -0.035,
      6,
      delta,
    );
    const targetScale = (mobile ? 0.36 : 0.46) * (active ? 1.08 : 1);
    const nextScale = THREE.MathUtils.damp(
      rig.current.scale.x,
      targetScale,
      6,
      delta,
    );
    rig.current.scale.setScalar(nextScale);
  });

  return (
    <group
      ref={rig}
      scale={mobile ? 0.36 : 0.46}
      rotation={[0, -0.12, -0.035]}
    >
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.23, 0.74, 6, 14]} />
        <meshStandardMaterial color="#d7aa37" roughness={0.64} />
      </mesh>
      <mesh position={[0.73, -0.08, 0]}>
        <sphereGeometry args={[0.24, 18, 14]} />
        <meshStandardMaterial color="#b98665" roughness={0.82} />
      </mesh>
      <RoundedBox
        args={[0.31, 0.15, 0.2]}
        radius={0.055}
        smoothness={3}
        position={[0.8, -0.27, 0]}
        rotation={[0, 0, -0.16]}
      >
        <meshPhysicalMaterial
          color="#101927"
          roughness={0.08}
          metalness={0.52}
          clearcoat={1}
        />
      </RoundedBox>
      <Limb
        from={[0.18, 0, 0.14]}
        to={[0.9, -0.02, 0.58]}
        radius={0.09}
        color="#d7aa37"
      />
      <Limb
        from={[0.18, 0, -0.14]}
        to={[0.9, -0.02, -0.58]}
        radius={0.09}
        color="#d7aa37"
      />
      <Limb
        from={[-0.3, 0, 0.12]}
        to={[-1.12, -0.02, 0.34]}
        radius={0.11}
        color="#222a32"
      />
      <Limb
        from={[-0.3, 0, -0.12]}
        to={[-1.12, -0.02, -0.34]}
        radius={0.11}
        color="#222a32"
      />
      <RoundedBox
        args={[0.52, 0.48, 0.2]}
        radius={0.07}
        smoothness={3}
        position={[-0.12, 0.16, 0]}
      >
        <meshStandardMaterial
          color="#171d25"
          metalness={0.18}
          roughness={0.55}
        />
      </RoundedBox>
    </group>
  );
}

function AirflowField({
  mobile,
  active,
  halfWidth,
  height,
}: {
  mobile: boolean;
  active: boolean;
  halfWidth: number;
  height: number;
}) {
  const field = useRef<THREE.Group>(null);
  const count = mobile ? 4 : 6;
  const streams = useMemo(
    () =>
      Array.from({ length: count }, (_, streamIndex) => {
        const perSide = count / 2;
        const side = streamIndex < perSide ? -1 : 1;
        const lane = streamIndex % perSide;
        const x = side * (halfWidth + 0.2 + lane * 0.22);
        return Array.from({ length: 13 }, (_, pointIndex) => {
          const t = pointIndex / 12;
          return [
            x + Math.sin(t * Math.PI * 2 + streamIndex) * 0.035,
            -height * 0.46 + t * height * 0.92,
            -1.35 + Math.sin(t * Math.PI) * 0.08,
          ] as Vec3;
        });
      }),
    [count, halfWidth, height],
  );

  useFrame((state) => {
    if (!field.current) return;
    const speed = active ? 3.4 : 0.8;
    field.current.position.y =
      Math.sin(state.clock.elapsedTime * speed) * (active ? 0.08 : 0.025);
  });

  return (
    <group ref={field}>
      {streams.map((points, streamIndex) => (
        <Line
          key={streamIndex}
          points={points}
          color={streamIndex % 3 === 0 ? GOLD : CYAN}
          lineWidth={active ? 1.1 : 0.62}
          transparent
          opacity={active ? 0.56 : 0.16}
          dashed
          dashSize={active ? 0.24 : 0.16}
          gapSize={active ? 0.2 : 0.34}
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
  active,
  onActiveChange,
}: FilmWorldProps) {
  const world = useRef<THREE.Group>(null);
  const videoStage = useRef<THREE.Group>(null);
  const presence = useRef(0);
  const { texture, ready } = useManagedVideo(
    videoUrl,
    progress,
    index,
    active,
  );
  const posterTexture = useLoader(THREE.TextureLoader, posterUrl);
  const width = mobile ? 6.45 : 10.9;
  const height = width * (9 / 16);
  const centerX = mobile ? 0.42 : 3.45;

  useEffect(() => {
    posterTexture.colorSpace = THREE.SRGBColorSpace;
    posterTexture.minFilter = THREE.LinearFilter;
    posterTexture.magFilter = THREE.LinearFilter;
    posterTexture.generateMipmaps = false;
    posterTexture.needsUpdate = true;
  }, [posterTexture]);

  useFrame((_, delta) => {
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
      position[1] + (1 - presence.current) * 0.12,
      position[2],
    );
    const scale = 0.97 + presence.current * 0.03;
    world.current.scale.setScalar(scale);

    if (videoStage.current) {
      const stageScale = THREE.MathUtils.damp(
        videoStage.current.scale.x,
        active ? 1.045 : 1,
        6,
        delta,
      );
      videoStage.current.scale.setScalar(stageScale);
      videoStage.current.position.z = THREE.MathUtils.damp(
        videoStage.current.position.z,
        active ? 0.22 : 0,
        6,
        delta,
      );
    }
  });

  return (
    <group
      ref={world}
      position={position}
      visible={Math.abs(progress.current - index) < 0.94}
    >
      <group position={[centerX, mobile ? -0.42 : 0.05, 0]}>
        <group ref={videoStage}>
          <VideoPortal
            texture={ready ? texture : posterTexture}
            position={[0, 0, -2.05]}
            size={[width, height]}
            color={GOLD}
            active={active}
            onToggle={() => onActiveChange(!active)}
          />
        </group>
        <AirflowField
          mobile={mobile}
          active={active}
          halfWidth={width / 2}
          height={height}
        />
        {[-1, 1].map((side) => (
          <RoundedBox
            key={side}
            args={[0.075, height * 0.72, 0.13]}
            radius={0.03}
            smoothness={2}
            position={[side * (width / 2 + 0.18), 0, -1.55]}
          >
            <meshStandardMaterial
              color="#46535d"
              emissive={active ? CYAN : "#111820"}
              emissiveIntensity={active ? 0.72 : 0.08}
              metalness={0.8}
              roughness={0.25}
            />
          </RoundedBox>
        ))}
        <Fan
          position={[-width / 2 - 0.46, -height * 0.35, -1.18]}
          scale={mobile ? 0.58 : 0.78}
          active={active}
        />
        <Fan
          position={[width / 2 + 0.46, -height * 0.35, -1.18]}
          scale={mobile ? 0.58 : 0.78}
          active={active}
        />
        <group
          position={[
            mobile ? 1.65 : width * 0.27,
            -height * 0.38,
            -0.78,
          ]}
        >
          <FlightBody active={active} mobile={mobile} />
        </group>
      </group>
      <pointLight
        color={GOLD}
        intensity={active ? (mobile ? 7 : 11) : (mobile ? 2.8 : 4.6)}
        distance={15}
        position={[centerX, 3.3, 2.2]}
      />
      <pointLight
        color={CYAN}
        intensity={active ? (mobile ? 4 : 6.5) : (mobile ? 1.4 : 2.3)}
        distance={13}
        position={[centerX - width / 2, -0.6, 1]}
      />
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
          <RoundedBox
            args={[1, 0.78, 0.72]}
            radius={0.08}
            smoothness={3}
          >
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
        points={houses
          .map(([x, y, z]) => [x, y, z - 0.03] as Vec3)
          .concat([[-1.22, -1.56, -0.25]])}
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
          {Array.from(
            { length: stackIndex === 0 ? 4 : 6 },
            (_, coinIndex) => (
              <mesh
                key={coinIndex}
                position={[0, coinIndex * 0.1, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.35, 0.35, 0.075, 28]} />
                <meshStandardMaterial
                  color="#82d2a0"
                  metalness={0.62}
                  roughness={0.28}
                />
              </mesh>
            ),
          )}
        </group>
      ))}
      {[0.28, 0.5, 0.78, 1.06].map((barHeight, barIndex) => (
        <RoundedBox
          key={barHeight}
          args={[0.16, barHeight, 0.18]}
          radius={0.04}
          smoothness={2}
          position={[
            -1.52 + barIndex * 0.23,
            1.18 + barHeight / 2,
            -0.28,
          ]}
        >
          <meshStandardMaterial
            color="#76ffc3"
            emissive="#3cd68d"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

function BiteSyncSculpture() {
  return (
    <group>
      {[1.35, 1.58].map((radius, ringIndex) => (
        <mesh
          key={radius}
          position={[0, 0, -0.32]}
          rotation={[
            0.18 + ringIndex * 0.32,
            0.28,
            ringIndex * 0.6,
          ]}
        >
          <torusGeometry args={[radius, 0.028, 8, 72]} />
          <meshStandardMaterial
            color={ringIndex === 0 ? "#c8a7ff" : CYAN}
            emissive={ringIndex === 0 ? "#8964da" : CYAN}
            emissiveIntensity={0.8}
          />
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
          <meshStandardMaterial
            color={sphereIndex % 2 === 0 ? "#c8a7ff" : CYAN}
            emissiveIntensity={0.65}
            emissive={sphereIndex % 2 === 0 ? "#7d5fc4" : CYAN}
          />
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

const DESKTOP_PHONE_SLOTS = [
  {
    position: [-2.65, -0.2, -0.72] as Vec3,
    rotation: [0.015, 0.3, -0.055] as Vec3,
    scale: 0.76,
  },
  {
    position: [0, 0.3, 0.72] as Vec3,
    rotation: [0, 0, 0.012] as Vec3,
    scale: 1.08,
  },
  {
    position: [2.65, -0.2, -0.72] as Vec3,
    rotation: [-0.015, -0.3, 0.055] as Vec3,
    scale: 0.76,
  },
];

const MOBILE_PHONE_SLOTS = [
  {
    position: [-1.38, -0.12, -0.82] as Vec3,
    rotation: [0.02, 0.22, -0.045] as Vec3,
    scale: 0.62,
  },
  {
    position: [0, 0.25, 0.5] as Vec3,
    rotation: [0, 0, 0.01] as Vec3,
    scale: 0.88,
  },
  {
    position: [1.38, -0.12, -0.82] as Vec3,
    rotation: [-0.02, -0.22, 0.045] as Vec3,
    scale: 0.62,
  },
];

function carouselOffset(phoneIndex: number, focused: number) {
  if (focused < 0) return phoneIndex - 1;
  return ((phoneIndex - focused + 4) % 3) - 1;
}

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
  const targetPosition = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Euler());
  const relative = carouselOffset(phoneIndex, focused);
  const slots = mobile ? MOBILE_PHONE_SLOTS : DESKTOP_PHONE_SLOTS;
  const slot = slots[relative + 1];

  useFrame((state, delta) => {
    if (!phone.current) return;
    targetPosition.current.set(...slot.position);
    targetRotation.current.set(...slot.rotation);

    phone.current.position.lerp(
      targetPosition.current,
      1 - Math.exp(-6 * delta),
    );
    phone.current.rotation.x = THREE.MathUtils.damp(
      phone.current.rotation.x,
      targetRotation.current.x,
      6,
      delta,
    );
    phone.current.rotation.y = THREE.MathUtils.damp(
      phone.current.rotation.y,
      targetRotation.current.y +
        (relative === 0 ? state.pointer.x * 0.024 : 0),
      6,
      delta,
    );
    phone.current.rotation.z = THREE.MathUtils.damp(
      phone.current.rotation.z,
      targetRotation.current.z,
      6,
      delta,
    );
    const targetScale = slot.scale * (hovered.current ? 1.025 : 1);
    const nextScale = THREE.MathUtils.damp(
      phone.current.scale.x,
      targetScale,
      6,
      delta,
    );
    phone.current.scale.setScalar(nextScale);
  });

  const handleFocus = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onFocus(phoneIndex);
  };

  return (
    <group
      ref={phone}
      position={slot.position}
      rotation={slot.rotation}
      scale={slot.scale}
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
      <RoundedBox
        args={[2.18, 4.72, 0.25]}
        radius={0.24}
        smoothness={5}
      >
        <meshPhysicalMaterial
          color="#171b20"
          metalness={0.92}
          roughness={0.2}
          clearcoat={0.65}
        />
      </RoundedBox>
      <RoundedBox
        args={[2.04, 4.55, 0.08]}
        radius={0.2}
        smoothness={5}
        position={[0, 0, 0.14]}
      >
        <meshStandardMaterial
          color="#010204"
          roughness={0.16}
          metalness={0.36}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.188]}>
        <planeGeometry args={[1.91, 4.29]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <RoundedBox
        args={[1.98, 4.39, 0.022]}
        radius={0.18}
        smoothness={4}
        position={[0, 0, 0.202]}
      >
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
      <RoundedBox
        args={[0.56, 0.15, 0.04]}
        radius={0.075}
        smoothness={4}
        position={[0, 2.02, 0.225]}
      >
        <meshStandardMaterial color="#050608" roughness={0.18} />
      </RoundedBox>
      <RoundedBox
        args={[0.055, 0.72, 0.06]}
        radius={0.022}
        smoothness={2}
        position={[-1.115, 0.72, 0]}
      >
        <meshStandardMaterial
          color="#555e67"
          metalness={0.95}
          roughness={0.16}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.055, 0.42, 0.06]}
        radius={0.022}
        smoothness={2}
        position={[1.115, 0.84, 0]}
      >
        <meshStandardMaterial
          color="#555e67"
          metalness={0.95}
          roughness={0.16}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.74, 0.92, 0.07]}
        radius={0.17}
        smoothness={4}
        position={[-0.56, 1.5, -0.17]}
      >
        <meshStandardMaterial
          color="#0b0d11"
          metalness={0.72}
          roughness={0.22}
        />
      </RoundedBox>
      {[
        [-0.76, 1.71, -0.235],
        [-0.38, 1.7, -0.235],
        [-0.74, 1.3, -0.235],
      ].map((lensPosition, lensIndex) => (
        <mesh
          key={lensIndex}
          position={lensPosition as Vec3}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.145, 0.145, 0.065, 28]} />
          <meshPhysicalMaterial
            color="#101d2c"
            metalness={0.5}
            roughness={0.05}
            clearcoat={1}
          />
        </mesh>
      ))}
      <pointLight
        color={
          phoneIndex === 0
            ? "#f0c985"
            : phoneIndex === 1
              ? "#76ffc3"
              : "#c8a7ff"
        }
        intensity={relative === 0 ? 3.2 : 1.35}
        distance={3.5}
        position={[0, 0, 0.9]}
      />
    </group>
  );
}

export function MobileWorld({
  progress,
  index,
  position,
  mobile,
  screens,
  focused,
  onFocus,
}: MobileWorldProps) {
  const textures = useLoader(THREE.TextureLoader, screens);
  const world = useRef<THREE.Group>(null);
  const presence = useRef(0);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = mobile ? 4 : 8;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
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
      position[1] + (1 - presence.current) * 0.15,
      position[2],
    );
    const scale = (0.96 + presence.current * 0.04) * (mobile ? 1.3 : 1);
    world.current.scale.setScalar(scale);
    world.current.rotation.y = THREE.MathUtils.damp(
      world.current.rotation.y,
      state.pointer.x * 0.022,
      5,
      delta,
    );
  });

  return (
    <group
      ref={world}
      position={position}
      visible={Math.abs(progress.current - index) < 0.94}
    >
      <mesh
        position={[0, 0, -2.6]}
        onClick={(event) => {
          event.stopPropagation();
          onFocus(-1);
        }}
      >
        <planeGeometry args={[15, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {textures.slice(0, 3).map((texture, phoneIndex) => (
        <PhysicalPhone
          key={screens[phoneIndex] + "-" + phoneIndex}
          texture={texture}
          phoneIndex={phoneIndex}
          focused={focused}
          onFocus={onFocus}
          mobile={mobile}
        />
      ))}
      {[2.1, 3.65].map((radius, ringIndex) => (
        <mesh
          key={radius}
          position={[0, -2.63, -0.75]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius - 0.018, radius + 0.018, 80]} />
          <meshBasicMaterial
            color={ringIndex === 0 ? "#c8a7ff" : CYAN}
            transparent
            opacity={ringIndex === 0 ? 0.25 : 0.11}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <pointLight
        color="#c8a7ff"
        intensity={mobile ? 7 : 11}
        distance={13}
        position={[0, 2.8, 3.2]}
      />
      <pointLight
        color={CYAN}
        intensity={mobile ? 3 : 5}
        distance={11}
        position={[-4, -1, 1]}
      />
    </group>
  );
}
