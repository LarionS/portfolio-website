import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Line, RoundedBox, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import type {
  ClinicalPhase,
  TacticalPhase,
} from "../sceneState";

type Vec3 = [number, number, number];

type SharedWorldProps = {
  progress: MutableRefObject<number>;
  index: number;
  position: Vec3;
  mobile: boolean;
};

type ClinicalSystemWorldProps = SharedWorldProps & {
  phase: ClinicalPhase;
  onAction: () => void;
};

type ConnectedSystemWorldProps = SharedWorldProps & {
  phase: TacticalPhase;
  onAction: () => void;
};

type EmergencySystemWorldProps = SharedWorldProps & {
  step: number;
  onAdvance: () => void;
};

const CLINICAL = "#72efff";
const CONNECTED = "#d7ff4f";
const RETURN = "#79ddff";
const POLICE = "#4db8ff";
const FIRE = "#ff7a3c";
const MEDICAL = "#ff5f78";

const STATION_MODEL = {
  clinicalDoctor: "/assets/models/stations/clinical-doctor.glb?v=3",
  clinicalInstructor: "/assets/models/stations/clinical-instructor.glb?v=2",
  clinicalPatient: "/assets/models/stations/clinical-patient.glb?v=4",
  clinicalHospital: "/assets/models/stations/clinical-hospital.glb",
  tacticalAlpha: "/assets/models/stations/tactical-trainee-alpha.glb",
  tacticalBravo: "/assets/models/stations/tactical-trainee-bravo.glb",
  tacticalBarrier: "/assets/models/stations/tactical-barrier.glb",
  tacticalSandbags: "/assets/models/stations/tactical-sandbags.glb",
  tacticalStructure: "/assets/models/stations/tactical-structure.glb",
  tacticalController: "/assets/models/stations/tactical-controller.glb",
  police: "/assets/models/stations/responder-police.glb",
  fire: "/assets/models/stations/responder-fire.glb",
  medical: "/assets/models/stations/responder-medical.glb",
  ambulance: "/assets/models/stations/emergency-ambulance.glb",
  wheelchair: "/assets/models/wheelchair-cc0.glb",
  extinguisher: "/assets/models/fire-extinguisher-cc0.glb",
} as const;

type WebModelProps = {
  url: string;
  position?: Vec3;
  rotation?: Vec3;
  scale?: number | Vec3;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
  hideMaterial?: string;
  collapseMaterials?: string;
};

function WebModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  opacity = 1,
  emissive,
  emissiveIntensity = 0,
  hideMaterial,
  collapseMaterials,
}: WebModelProps) {
  const gltf = useGLTF(url);
  const model = useMemo(() => {
    // A regular Object3D clone keeps SkinnedMesh instances bound to the source
    // skeleton. Reusing the asset then leaves hair, helmets, and other weighted
    // pieces floating at the bind pose. SkeletonUtils creates independent rigs.
    const copy = cloneSkeleton(gltf.scene);
    const collapsedMaterial = collapseMaterials
      ? new THREE.MeshStandardMaterial({
          color: collapseMaterials,
          metalness: 0.42,
          roughness: 0.4,
        })
      : null;
    copy.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (collapsedMaterial) {
        // GLTF multi-material groups require one WebGL draw per material. For
        // small monochrome hardware, a single material preserves the form and
        // turns four submissions into one on Windows/ANGLE.
        child.material = collapsedMaterial;
        return;
      }
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const clones = materials.map((source) => {
        const material = source.clone();
        const hidden = Boolean(hideMaterial && source.name.includes(hideMaterial));
        material.transparent = hidden || opacity < 1;
        material.opacity = hidden ? 0 : opacity;
        material.depthWrite = !hidden && opacity > 0.72;
        if (emissive && "emissive" in material) {
          const lit = material as THREE.MeshStandardMaterial;
          lit.emissive = new THREE.Color(emissive);
          lit.emissiveIntensity = emissiveIntensity;
        }
        return material;
      });
      child.material = Array.isArray(child.material) ? clones : clones[0];
    });
    return copy;
  }, [collapseMaterials, emissive, emissiveIntensity, gltf.scene, hideMaterial, opacity]);

  useEffect(
    () => () => {
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        new Set(materials).forEach((material) => material.dispose());
      });
    },
    [model],
  );

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={model} />
    </group>
  );
}

function useWorldPresence(
  progress: MutableRefObject<number>,
  index: number,
  root: MutableRefObject<THREE.Group | null>,
  baseScale = 1,
) {
  const presence = useRef(0);

  useFrame((_, delta) => {
    const target = THREE.MathUtils.smoothstep(
      THREE.MathUtils.clamp(1 - Math.abs(progress.current - index) / 0.92, 0, 1),
      0,
      1,
    );
    presence.current = THREE.MathUtils.damp(
      presence.current,
      target,
      9,
      Math.min(delta, 0.05),
    );
    if (!root.current) return;
    root.current.visible = presence.current > 0.006;
    const scale = baseScale * (0.982 + presence.current * 0.018);
    const nextScale = THREE.MathUtils.damp(
      root.current.scale.x,
      scale,
      9,
      Math.min(delta, 0.05),
    );
    root.current.scale.setScalar(nextScale);

    // All three authored systems use a floor near y=-2.02. Compensating for
    // the mobile scale keeps actors planted instead of shrinking upward.
    root.current.position.y =
      -2.02 * (1 - baseScale) - 0.12 * (1 - presence.current);
  });

  return presence;
}

function usePresenceLight(
  light: MutableRefObject<THREE.PointLight | null>,
  presence: MutableRefObject<number>,
  targetIntensity: number,
) {
  useFrame((_, delta) => {
    if (!light.current) return;
    light.current.intensity = THREE.MathUtils.damp(
      light.current.intensity,
      presence.current * targetIntensity,
      8,
      Math.min(delta, 0.05),
    );
  });
}

function useCursorCleanup() {
  useEffect(
    () => () => {
      // Interactive meshes can unmount as the scroll gate changes while the
      // pointer is still over them. Never leave the page cursor stranded.
      if (document.body.style.cursor === "pointer") {
        document.body.style.cursor = "";
      }
    },
    [],
  );
}

function Beam({
  start,
  end,
  radius,
  color,
  emissive = 0,
  roughness = 0.32,
}: {
  start: Vec3;
  end: Vec3;
  radius: number;
  color: string;
  emissive?: number;
  roughness?: number;
}) {
  const transform = useMemo(() => {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    return {
      position: from.clone().add(to).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
      length: direction.length(),
    };
  }, [end, start]);

  return (
    <mesh position={transform.position} quaternion={transform.quaternion}>
      <cylinderGeometry args={[radius, radius, transform.length, 12]} />
      <meshStandardMaterial
        color={color}
        metalness={0.56}
        roughness={roughness}
        emissive={color}
        emissiveIntensity={emissive}
      />
    </mesh>
  );
}

function useScreenTexture(
  kind: "clinical" | "connected" | "incident",
  state: string,
  accent: string,
) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) return new THREE.CanvasTexture(canvas);

    context.fillStyle = "#061015";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255,255,255,.055)";
    context.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 64) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 64) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }

    context.fillStyle = accent;
    context.font = "600 28px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(
      kind === "clinical"
        ? "CLINICAL SCENARIO"
        : kind === "connected"
          ? "SESSION ORCHESTRATOR"
          : "JOINT INCIDENT",
      54,
      62,
    );
    context.fillStyle = "rgba(227,240,242,.68)";
    context.font = "500 18px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(state.toUpperCase(), 54, 98);

    if (kind === "clinical") {
      const unstable = state === "event" || state === "response";
      const reviewed = state === "review";
      context.strokeStyle = unstable ? "#ff765b" : accent;
      context.lineWidth = 5;
      context.beginPath();
      for (let index = 0; index < 41; index += 1) {
        const x = 52 + index * 16.8;
        const spike = index % (unstable ? 7 : 10) === 4 ? (unstable ? -96 : -58) : 0;
        const y = 232 + Math.sin(index * 0.9) * (unstable ? 18 : 8) + spike;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.fillStyle = "rgba(255,255,255,.78)";
      context.font = "700 64px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.fillText(reviewed ? "REC" : unstable ? "112" : "78", 780, 240);
      context.font = "500 16px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.fillStyle = "rgba(255,255,255,.5)";
      context.fillText(reviewed ? "TIMELINE READY" : "SYNTHETIC BPM", 782, 272);
    } else if (kind === "connected") {
      for (let index = 0; index < 6; index += 1) {
        const active = state !== "ready";
        const x = 60 + (index % 3) * 300;
        const y = 148 + Math.floor(index / 3) * 142;
        context.fillStyle = active ? `${accent}24` : "rgba(255,255,255,.035)";
        context.strokeStyle = active ? accent : "rgba(255,255,255,.18)";
        context.lineWidth = active ? 3 : 1;
        context.fillRect(x, y, 248, 92);
        context.strokeRect(x, y, 248, 92);
        context.fillStyle = active ? accent : "rgba(255,255,255,.42)";
        context.font = "600 19px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillText(`USER 0${index + 1}`, x + 18, y + 34);
        context.fillStyle = "rgba(255,255,255,.5)";
        context.font = "500 14px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillText(active ? "LINKED · RETURNING" : "LAN · READY", x + 18, y + 64);
      }
    } else {
      const steps = ["ROUTE", "HAZARD", "CASUALTY"];
      steps.forEach((label, index) => {
        const complete = Number(state) > index;
        const x = 64 + index * 310;
        context.fillStyle = complete ? `${accent}2a` : "rgba(255,255,255,.035)";
        context.strokeStyle = complete ? accent : "rgba(255,255,255,.16)";
        context.lineWidth = complete ? 3 : 1;
        context.beginPath();
        context.roundRect(x, 178, 250, 124, 14);
        context.fill();
        context.stroke();
        context.fillStyle = complete ? accent : "rgba(255,255,255,.46)";
        context.font = "600 20px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillText(`0${index + 1}  ${label}`, x + 22, 230);
        context.font = "500 14px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillText(complete ? "CONFIRMED" : "WAITING", x + 22, 268);
      });
    }

    const output = new THREE.CanvasTexture(canvas);
    output.colorSpace = THREE.SRGBColorSpace;
    output.anisotropy = 4;
    output.needsUpdate = true;
    return output;
  }, [accent, kind, state]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function DataScreen({
  kind,
  state,
  accent,
  size,
  position,
  rotation = [0, 0, 0],
}: {
  kind: "clinical" | "connected" | "incident";
  state: string;
  accent: string;
  size: [number, number];
  position: Vec3;
  rotation?: Vec3;
}) {
  const texture = useScreenTexture(kind, state, accent);
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[size[0] + 0.2, size[1] + 0.2, 0.16]} radius={0.1} smoothness={3}>
        <meshStandardMaterial color="#172126" metalness={0.72} roughness={0.23} />
      </RoundedBox>
      <mesh position={[0, 0, 0.091]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={texture} toneMapped={false} fog={false} />
      </mesh>
      <pointLight position={[0, 0, 0.55]} color={accent} intensity={1.4} distance={3.2} />
    </group>
  );
}

function CleanHeadset({ accent = CLINICAL }: { accent?: string }) {
  return (
    <group>
      <RoundedBox args={[0.58, 0.27, 0.22]} radius={0.11} smoothness={4} position={[0, 0, 0.13]}>
        <meshPhysicalMaterial color="#10171c" metalness={0.58} roughness={0.2} clearcoat={1} />
      </RoundedBox>
      <RoundedBox args={[0.47, 0.15, 0.025]} radius={0.055} smoothness={3} position={[0, 0, 0.255]}>
        <meshStandardMaterial color="#071116" emissive={accent} emissiveIntensity={0.18} roughness={0.2} />
      </RoundedBox>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]}>
        <torusGeometry args={[0.27, 0.025, 8, 32, Math.PI * 1.35]} />
        <meshStandardMaterial color="#263239" metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh position={[0.22, -0.02, 0.27]}>
        <circleGeometry args={[0.025, 12]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ClinicalPractitioner({
  kind,
  response = 0,
  hmd = false,
  compact = false,
}: {
  kind: "doctor" | "instructor";
  response?: number;
  hmd?: boolean;
  compact?: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const modelScale = (kind === "doctor" ? 0.56 : 0.54) * (compact ? 0.82 : 1);

  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const responding = response > 0;
    root.current.position.y = THREE.MathUtils.damp(
      root.current.position.y,
      responding ? 0.035 + Math.sin(clock.elapsedTime * 2.2) * 0.012 : 0,
      5,
      Math.min(delta, 0.05),
    );
    root.current.position.z = THREE.MathUtils.damp(
      root.current.position.z,
      kind === "doctor" && responding ? -0.48 : 0,
      4.5,
      Math.min(delta, 0.05),
    );
    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      kind === "doctor" && responding ? -0.14 : response > 1 ? -0.12 : 0,
      4,
      Math.min(delta, 0.05),
    );
  });

  return (
    <group ref={root}>
      {kind === "instructor" ? (
        <ArticulatedPerson accent={CLINICAL} response={response} compact={compact} />
      ) : (
        <WebModel url={STATION_MODEL.clinicalDoctor} scale={modelScale} />
      )}
      {hmd ? (
        <group
          position={[0, 1.53 * (compact ? 0.82 : 1), -0.2]}
          rotation={[0, Math.PI, 0]}
          scale={0.57 * (compact ? 0.82 : 1)}
        >
          <CleanHeadset accent={CLINICAL} />
        </group>
      ) : null}
    </group>
  );
}

function ArticulatedPerson({
  accent,
  hmd = false,
  response = 0,
  role,
  compact = false,
}: {
  accent: string;
  hmd?: boolean;
  response?: number;
  role?: "police" | "fire" | "medical";
  compact?: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const scale = compact ? 0.72 : 1;

  useFrame(({ clock }, delta) => {
    if (root.current) {
      root.current.position.y = THREE.MathUtils.damp(
        root.current.position.y,
        response > 0 ? 0.035 : 0,
        4,
        delta,
      );
    }
    if (head.current) {
      head.current.rotation.x = THREE.MathUtils.damp(
        head.current.rotation.x,
        response > 0 ? -0.24 : Math.sin(clock.elapsedTime * 0.55) * 0.025,
        5,
        delta,
      );
      head.current.rotation.y = THREE.MathUtils.damp(
        head.current.rotation.y,
        response > 1 ? -0.2 : 0,
        5,
        delta,
      );
    }
    if (rightArm.current) {
      rightArm.current.rotation.z = THREE.MathUtils.damp(
        rightArm.current.rotation.z,
        response > 0 ? -0.92 : -0.16,
        5,
        delta,
      );
      rightArm.current.rotation.x = THREE.MathUtils.damp(
        rightArm.current.rotation.x,
        response > 0 ? -0.35 : 0,
        5,
        delta,
      );
    }
  });

  return (
    <group ref={root} scale={scale}>
      <group position={[0, 1.55, 0]} ref={head}>
        <mesh>
          <sphereGeometry args={[0.23, 18, 12]} />
          <meshStandardMaterial color="#aab4b2" roughness={0.72} />
        </mesh>
        {hmd ? <CleanHeadset accent={accent} /> : null}
        {role === "fire" ? (
          <group position={[0, 0.18, 0]}>
            <mesh>
              <sphereGeometry args={[0.275, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#d9b529" metalness={0.24} roughness={0.45} />
            </mesh>
            <RoundedBox args={[0.44, 0.07, 0.37]} radius={0.03} smoothness={2} position={[0, -0.01, 0]}>
              <meshStandardMaterial color="#20282c" roughness={0.48} />
            </RoundedBox>
          </group>
        ) : null}
      </group>

      <RoundedBox args={[0.58, 0.86, 0.34]} radius={0.18} smoothness={4} position={[0, 0.9, 0]}>
        <meshStandardMaterial color={role ? "#283238" : "#182329"} metalness={0.34} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.36, 0.04]} radius={0.08} smoothness={3} position={[0, 1.02, 0.195]}>
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.18 + response * 0.18} roughness={0.45} />
      </RoundedBox>

      {role === "fire" ? (
        <group position={[0, 0.92, -0.28]}>
          {[-0.14, 0.14].map((x) => (
            <mesh position={[x, 0, 0]} key={x}>
              <cylinderGeometry args={[0.1, 0.1, 0.64, 14]} />
              <meshStandardMaterial color="#59666c" metalness={0.68} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ) : null}

      {role === "medical" ? (
        <group position={[-0.36, 0.92, -0.08]}>
          <RoundedBox args={[0.42, 0.5, 0.22]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color="#4f1822" roughness={0.55} />
          </RoundedBox>
          <mesh position={[0, 0, 0.118]}>
            <boxGeometry args={[0.2, 0.055, 0.025]} />
            <meshBasicMaterial color={MEDICAL} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.119]}>
            <boxGeometry args={[0.055, 0.2, 0.025]} />
            <meshBasicMaterial color={MEDICAL} toneMapped={false} />
          </mesh>
        </group>
      ) : null}

      {role === "police" ? (
        <group position={[0.43, 0.74, 0.3]} rotation={[-0.32, -0.08, -0.24]}>
          <RoundedBox args={[0.3, 0.42, 0.055]} radius={0.045} smoothness={3}>
            <meshStandardMaterial color="#121b20" metalness={0.52} roughness={0.3} />
          </RoundedBox>
          <mesh position={[0, 0, 0.032]}>
            <planeGeometry args={[0.24, 0.34]} />
            <meshBasicMaterial color="#244d63" toneMapped={false} />
          </mesh>
        </group>
      ) : null}

      {role === "fire" ? (
        <group position={[0.48, 0.62, 0.28]} rotation={[0, 0, -0.22]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.075, 0.095, 0.5, 14]} />
            <meshStandardMaterial color="#6f7c80" metalness={0.72} roughness={0.26} />
          </mesh>
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 12]} />
            <meshStandardMaterial color="#283338" metalness={0.6} roughness={0.34} />
          </mesh>
        </group>
      ) : null}

      <group position={[-0.4, 1.12, 0]} rotation={[0, 0, 0.16]}>
        <Beam start={[0, 0, 0]} end={[-0.02, -0.72, 0.04]} radius={0.105} color="#68767b" />
      </group>
      <group ref={rightArm} position={[0.4, 1.12, 0]} rotation={[0, 0, -0.16]}>
        <Beam start={[0, 0, 0]} end={[-0.02, -0.72, 0.04]} radius={0.105} color="#68767b" />
      </group>
      {[-0.18, 0.18].map((x) => (
        <group position={[x, 0.58, 0]} key={x}>
          <Beam start={[0, 0, 0]} end={[x * 0.12, -0.95, 0.03]} radius={0.12} color="#39464c" />
        </group>
      ))}
      {!compact ? (
        <pointLight
          position={[0, 1, 0.35]}
          color={accent}
          intensity={response > 0 ? 0.7 : 0.15}
          distance={2.2}
        />
      ) : null}
    </group>
  );
}

function ClinicalPatient({ phase }: { phase: ClinicalPhase }) {
  const patient = useRef<THREE.Group>(null);
  const sensorMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const event = phase === "event" || phase === "response";

  useFrame(({ clock }, delta) => {
    if (patient.current) {
      const rate = event ? 4.8 : phase === "review" ? 1.4 : 2.1;
      const breath = 1 + Math.sin(clock.elapsedTime * rate) * (event ? 0.014 : 0.006);
      patient.current.scale.y = THREE.MathUtils.damp(patient.current.scale.y, breath, 8, delta);
      patient.current.rotation.z = THREE.MathUtils.damp(
        patient.current.rotation.z,
        event ? Math.sin(clock.elapsedTime * 5.2) * 0.008 : 0,
        5,
        delta,
      );
    }
    if (sensorMaterial.current) {
      sensorMaterial.current.opacity = event
        ? 0.62 + Math.max(0, Math.sin(clock.elapsedTime * 7.2)) * 0.38
        : 0.42;
    }
  });

  return (
    <group ref={patient} position={[-0.08, 0.02, 0]} scale={0.86}>
      {/* A deliberately clean, covered patient silhouette. The sourced character
          meshes deform badly when rotated into a bed pose, so the bed scene uses
          restrained procedural anatomy instead of exposing a broken rig. */}
      <group position={[-1.34, 0.44, 0]}>
        <mesh position={[-0.025, 0.045, -0.045]} scale={[1.04, 1.08, 0.92]}>
          <sphereGeometry args={[0.27, 24, 18]} />
          <meshStandardMaterial color="#22292c" roughness={0.88} />
        </mesh>
        <mesh position={[0.025, -0.015, 0.055]} scale={[0.92, 0.98, 0.86]}>
          <sphereGeometry args={[0.25, 24, 18]} />
          <meshStandardMaterial color="#ad8068" roughness={0.76} />
        </mesh>
        <RoundedBox
          args={[0.19, 0.12, 0.07]}
          radius={0.04}
          smoothness={3}
          position={[0.03, -0.035, 0.255]}
        >
          <meshPhysicalMaterial
            color="#9ce9ec"
            transparent
            opacity={0.58}
            roughness={0.22}
            clearcoat={0.65}
          />
        </RoundedBox>
      </group>
      <RoundedBox
        args={[2.5, 0.25, 0.96]}
        radius={0.1}
        smoothness={4}
        position={[0.2, 0.27, 0]}
      >
        <meshStandardMaterial color="#aac9ca" roughness={0.86} />
      </RoundedBox>
      <RoundedBox
        args={[1.12, 0.3, 0.82]}
        radius={0.11}
        smoothness={4}
        position={[-0.56, 0.45, 0]}
        rotation={[0, 0, -0.035]}
      >
        <meshStandardMaterial color="#cfe0de" roughness={0.9} />
      </RoundedBox>
      <group position={[-0.2, 0.47, 0.59]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <capsuleGeometry args={[0.08, 0.48, 8, 14]} />
          <meshStandardMaterial color="#ad8068" roughness={0.76} />
        </mesh>
      </group>
      <mesh position={[0.1, 0.47, 0.59]} scale={[1.25, 0.9, 1]}>
        <sphereGeometry args={[0.105, 18, 12]} />
        <meshStandardMaterial color="#ad8068" roughness={0.76} />
      </mesh>
      {[-0.06, 0.48, 1.02].map((x, index) => (
        <mesh position={[x, 0.405 - index * 0.025, 0.492]} rotation={[Math.PI / 2, 0, 0]} key={`fold-${x}`}>
          <planeGeometry args={[0.018, 0.78 - index * 0.08]} />
          <meshBasicMaterial color="#d9e9e7" transparent opacity={0.38 - index * 0.06} />
        </mesh>
      ))}
      <RoundedBox
        args={[0.92, 0.035, 0.48]}
        radius={0.025}
        smoothness={2}
        position={[-0.22, 0.6, 0]}
      >
        <meshStandardMaterial color="#385b64" roughness={0.58} metalness={0.15} />
      </RoundedBox>
      {[-0.42, -0.16, 0.1].map((x) => (
        <mesh position={[x - 0.06, 0.625, 0]} rotation={[-Math.PI / 2, 0, 0]} key={x}>
          <circleGeometry args={[0.045, 14]} />
          <meshBasicMaterial
            ref={x === -0.16 ? sensorMaterial : undefined}
            color={event ? "#ff765b" : CLINICAL}
            transparent
            opacity={event ? 0.9 : 0.42}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function ClinicalBed({ phase }: { phase: ClinicalPhase }) {
  return (
    <group position={[-1.05, -1.22, -0.55]} rotation={[0, 0.08, 0]}>
      <RoundedBox args={[4.65, 0.25, 1.65]} radius={0.13} smoothness={4} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#aab7ba" metalness={0.64} roughness={0.28} />
      </RoundedBox>
      <RoundedBox args={[4.25, 0.32, 1.48]} radius={0.17} smoothness={4} position={[0, 0.04, 0]}>
        <meshStandardMaterial color="#d9e1de" roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[0.68, 0.2, 1.18]} radius={0.11} smoothness={3} position={[-1.78, 0.27, 0]} rotation={[0, 0, -0.08]}>
        <meshStandardMaterial color="#edf2ef" roughness={0.74} />
      </RoundedBox>
      <group position={[-0.18, 0.36, 0]}>
        <ClinicalPatient phase={phase} />
      </group>
      {[-0.9, 0.9].map((z) => (
        <group key={z} position={[0, 0.18, z]}>
          <Beam start={[-1.5, 0, 0]} end={[1.52, 0, 0]} radius={0.032} color="#829399" />
          <Beam start={[-1.5, -0.35, 0]} end={[-1.5, 0, 0]} radius={0.03} color="#829399" />
          <Beam start={[1.52, -0.35, 0]} end={[1.52, 0, 0]} radius={0.03} color="#829399" />
        </group>
      ))}
      {[-1.68, 1.68].flatMap((x) =>
        [-0.62, 0.62].map((z) => (
          <mesh position={[x, -0.76, z]} rotation={[Math.PI / 2, 0, 0]} key={`${x}-${z}`}>
            <torusGeometry args={[0.17, 0.045, 8, 20]} />
            <meshStandardMaterial color="#12191d" metalness={0.46} roughness={0.48} />
          </mesh>
        )),
      )}
    </group>
  );
}

function ClinicalRoom({ mobile }: { mobile: boolean }) {
  return (
    <group>
      <mesh position={[0, -2.02, -0.2]}>
        <boxGeometry args={[11.5, 0.18, 8.6]} />
        <meshStandardMaterial color="#131c20" roughness={0.68} metalness={0.22} />
      </mesh>
      <mesh position={[0, 1.7, -4.3]}>
        <boxGeometry args={[11.5, 7.4, 0.18]} />
        <meshStandardMaterial color="#596769" roughness={0.83} />
      </mesh>
      <mesh position={[-5.65, 1.1, -0.25]}>
        <boxGeometry args={[0.18, 6.2, 8.1]} />
        <meshStandardMaterial color="#465457" roughness={0.82} />
      </mesh>
      <RoundedBox args={[7.2, 0.32, 0.24]} radius={0.06} smoothness={2} position={[-0.75, 0.15, -4.06]}>
        <meshStandardMaterial color="#78888d" metalness={0.5} roughness={0.32} />
      </RoundedBox>
      <RoundedBox args={[2.15, 1.18, 0.08]} radius={0.08} smoothness={3} position={[-4.08, 1.56, -4.15]}>
        <meshStandardMaterial color="#263338" metalness={0.34} roughness={0.48} />
      </RoundedBox>
      {[-4.7, -4.08, -3.46].map((x, portIndex) => (
        <group position={[x, 1.57, -4.095]} key={x}>
          <mesh>
            <ringGeometry args={[0.095, 0.125, 20]} />
            <meshStandardMaterial
              color={portIndex === 0 ? "#d8eef2" : portIndex === 1 ? "#78d7c3" : "#d8b26d"}
              emissive={portIndex === 0 ? "#d8eef2" : portIndex === 1 ? "#78d7c3" : "#d8b26d"}
              emissiveIntensity={0.14}
              metalness={0.48}
              roughness={0.34}
            />
          </mesh>
          <mesh position={[0, -0.31, 0]}>
            <boxGeometry args={[0.34, 0.04, 0.025]} />
            <meshBasicMaterial color="#a7b5b7" transparent opacity={0.38} />
          </mesh>
        </group>
      ))}
      <RoundedBox args={[1.42, 2.35, 0.08]} radius={0.06} smoothness={3} position={[4.72, 0.92, -4.15]}>
        <meshStandardMaterial color="#313d40" metalness={0.22} roughness={0.64} />
      </RoundedBox>
      <Beam start={[4.3, -0.15, -4.08]} end={[4.3, 1.98, -4.08]} radius={0.018} color="#839094" />
      <Line
        points={[[-4.65, -1.91, 2.65], [-4.65, -1.91, -3.2], [4.9, -1.91, -3.2]]}
        color="#799198"
        lineWidth={mobile ? 0.55 : 0.8}
        transparent
        opacity={0.24}
        dashed
        dashSize={0.18}
        gapSize={0.2}
      />
      {Array.from({ length: mobile ? 4 : 7 }, (_, index) => (
        <mesh position={[-4.4 + index * 1.45, 3.75, -1.1]} key={index}>
          <boxGeometry args={[0.78, 0.04, 2.5]} />
          <meshStandardMaterial color="#c6d0cd" emissive="#dff9ff" emissiveIntensity={0.08} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function ObservationBooth({ phase }: { phase: ClinicalPhase }) {
  const review = phase === "review";
  return (
    <group position={[3.55, -0.02, -2.72]} rotation={[0, -0.04, 0]}>
      <RoundedBox args={[3.4, 3.35, 0.12]} radius={0.08} smoothness={3}>
        <meshPhysicalMaterial
          color="#3b6670"
          roughness={0.08}
          transparent
          opacity={0.22}
          metalness={0.06}
          clearcoat={0.82}
          depthWrite={false}
        />
      </RoundedBox>
      {[-1.67, 1.67].map((x) => (
        <Beam key={x} start={[x, -1.7, 0]} end={[x, 1.7, 0]} radius={0.05} color="#60737b" />
      ))}
      <group position={[0.55, -1.52, 0.46]} rotation={[0, Math.PI * 0.88, 0]}>
        <ClinicalPractitioner kind="instructor" response={review ? 1 : 0} compact />
      </group>
      <DataScreen
        kind="clinical"
        state={phase}
        accent={review ? "#8effc4" : CLINICAL}
        size={[2.35, 1.18]}
        position={[-0.38, -0.92, 0.68]}
        rotation={[-0.38, 0, 0]}
      />
      <pointLight position={[0, 0.2, 1]} color={review ? "#8effc4" : CLINICAL} intensity={review ? 4.5 : 1.2} distance={5} />
    </group>
  );
}

function ScenarioControl({
  phase,
  onAction,
}: {
  phase: ClinicalPhase;
  onAction: () => void;
}) {
  const pulse = useRef<THREE.Mesh>(null);
  useCursorCleanup();
  useFrame(({ clock }) => {
    if (!pulse.current) return;
    const value = 1 + ((clock.elapsedTime * 0.55) % 1) * 1.5;
    pulse.current.scale.setScalar(value);
    const material = pulse.current.material as THREE.MeshBasicMaterial;
    material.opacity = phase === "baseline" || phase === "review" ? (2.5 - value) * 0.17 : 0;
  });

  return (
    <group
      position={[3.72, -0.58, 1.65]}
      rotation={[-0.42, -0.08, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onAction();
      }}
      onPointerEnter={() => { document.body.style.cursor = "pointer"; }}
      onPointerLeave={() => { document.body.style.cursor = ""; }}
    >
      <RoundedBox args={[1.38, 0.82, 0.18]} radius={0.12} smoothness={4}>
        <meshPhysicalMaterial color="#111a1e" metalness={0.72} roughness={0.2} clearcoat={0.8} />
      </RoundedBox>
      <mesh position={[0, 0, 0.13]}>
        <circleGeometry args={[0.19, 28]} />
        <meshStandardMaterial color={phase === "event" || phase === "response" ? "#ff765b" : CLINICAL} emissive={phase === "event" || phase === "response" ? "#ff765b" : CLINICAL} emissiveIntensity={2.3} />
      </mesh>
      <mesh ref={pulse} position={[0, 0, 0.125]}>
        <ringGeometry args={[0.24, 0.27, 40]} />
        <meshBasicMaterial color={CLINICAL} transparent opacity={0.2} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function ClinicalSystemWorld({
  progress,
  index,
  position,
  mobile,
  phase,
  onAction,
}: ClinicalSystemWorldProps) {
  const root = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const presence = useWorldPresence(progress, index, root, mobile ? 0.84 : 1);
  const active = phase === "event" || phase === "response";
  const response = phase === "response" ? 1 : phase === "review" ? 2 : 0;
  usePresenceLight(keyLight, presence, mobile ? 4.5 : active ? 9 : 6);

  return (
    <group position={position}>
      <group ref={root} visible={Math.abs(progress.current - index) < 0.94}>
        <ClinicalRoom mobile={mobile} />
        <ClinicalBed phase={phase} />
        <group position={[-1.72, -1.93, 1.55]} rotation={[0, Math.PI * 0.76, 0]}>
          <ClinicalPractitioner kind="doctor" hmd response={response} compact={mobile} />
        </group>
        <DataScreen
          kind="clinical"
          state={phase}
          accent={active ? "#ff765b" : CLINICAL}
          size={[1.78, 1.06]}
          position={[1.65, 0.08, -0.42]}
          rotation={[0, -0.22, 0]}
        />
        <Beam start={[1.65, -0.5, -0.5]} end={[1.65, -1.62, -0.5]} radius={0.045} color="#788a90" />
        <ObservationBooth phase={phase} />
        <ScenarioControl phase={phase} onAction={onAction} />
        <Line
          points={[[3.72, -0.58, 1.5], [2.2, -0.2, 0.5], [1.25, 0.06, -0.4], [-1.05, -0.55, -0.55]]}
          color={active ? "#ff765b" : CLINICAL}
          lineWidth={mobile ? 0.72 : 1.1}
          dashed
          dashSize={0.16}
          gapSize={0.14}
          transparent
          opacity={active ? 0.76 : 0.18}
        />
        <pointLight
          ref={keyLight}
          position={[-0.1, 1.8, 0.4]}
          color={active ? "#ff8268" : "#d9f8ff"}
          intensity={0}
          distance={10}
          decay={2}
        />
      </group>
    </group>
  );
}

const BAY_POSITIONS: Vec3[] = [
  [-4.2, -1.77, -0.95],
  [-2.78, -1.77, -1.82],
  [-1.34, -1.77, -2.35],
  [0.1, -1.77, -2.35],
  [1.52, -1.77, -1.82],
  [2.92, -1.77, -0.95],
];

function Watch({ active }: { active: boolean }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.105, 0.025, 8, 24]} />
        <meshStandardMaterial color="#11181c" metalness={0.52} roughness={0.34} />
      </mesh>
      <RoundedBox args={[0.17, 0.2, 0.055]} radius={0.045} smoothness={3} position={[0, 0, 0.03]}>
        <meshStandardMaterial color="#0b1315" emissive={active ? CONNECTED : "#14201a"} emissiveIntensity={active ? 1.8 : 0.12} roughness={0.24} />
      </RoundedBox>
    </group>
  );
}

function HapticVest({ active }: { active: boolean }) {
  const dotTransforms = useMemo(() => {
    const transforms: THREE.Matrix4[] = [];
    for (const x of [-0.16, 0, 0.16]) {
      for (const y of [-0.14, 0, 0.14]) {
        transforms.push(new THREE.Matrix4().makeTranslation(x, y, 0.04));
      }
    }
    return transforms;
  }, []);
  const dots = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!dots.current) return;
    dotTransforms.forEach((matrix, index) => dots.current?.setMatrixAt(index, matrix));
    dots.current.instanceMatrix.needsUpdate = true;
  }, [dotTransforms]);

  return (
    <group position={[0, 1.02, 0.205]}>
      <RoundedBox args={[0.52, 0.5, 0.055]} radius={0.09} smoothness={3}>
        <meshStandardMaterial color="#1a2428" metalness={0.36} roughness={0.46} />
      </RoundedBox>
      <instancedMesh ref={dots} args={[undefined, undefined, dotTransforms.length]}>
        <circleGeometry args={[0.03, 10]} />
        <meshBasicMaterial color={active ? CONNECTED : "#3a4740"} transparent opacity={active ? 0.95 : 0.28} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

function TrainingDevice({ active }: { active: boolean }) {
  return (
    <group position={[0.42, 0.93, 0.34]} rotation={[0.02, Math.PI * 0.5, -0.4]}>
      <WebModel url={STATION_MODEL.tacticalController} scale={0.56} collapseMaterials="#172126" />
      <mesh position={[0.32, 0.04, 0.16]}>
        <circleGeometry args={[0.035, 12]} />
        <meshBasicMaterial color={active ? CONNECTED : "#59665f"} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ConnectedTrainee({
  index,
  phase,
  mobile,
}: {
  index: number;
  phase: TacticalPhase;
  mobile: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const signal = useRef<THREE.Mesh>(null);
  const signalMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const dispatch = phase !== "ready";
  const haptics = phase === "feedback";
  const returning = phase === "telemetry" || phase === "review";
  const alpha = index % 2 === 0;

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const stagger = dispatch
      ? Math.sin(clock.elapsedTime * 1.8 + index * 0.72) * 0.012
      : 0;
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      dispatch ? 0.045 + stagger : 0,
      4,
      Math.min(delta, 0.05),
    );
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      haptics ? -0.16 : dispatch ? -0.06 : 0,
      5,
      Math.min(delta, 0.05),
    );
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      haptics ? (index % 2 ? -0.055 : 0.055) : 0,
      7,
      Math.min(delta, 0.05),
    );
    if (signal.current && signalMaterial.current) {
      const wave = (clock.elapsedTime * 0.85 + index * 0.14) % 1;
      signal.current.scale.setScalar(0.82 + wave * 1.9);
      signalMaterial.current.opacity = dispatch ? (1 - wave) * 0.52 : 0;
    }
  });

  return (
    <group ref={group} scale={mobile ? 0.72 : 1}>
      <WebModel
        url={alpha ? STATION_MODEL.tacticalAlpha : STATION_MODEL.tacticalBravo}
        rotation={[0, Math.PI, 0]}
        scale={alpha ? 0.84 : 0.61}
      />
      <group position={[0, 1.64, -0.17]} rotation={[0, Math.PI, 0]} scale={0.58}>
        <CleanHeadset accent={CONNECTED} />
      </group>
      <group position={[-0.42, 0.95, 0.05]} rotation={[0.2, 0.1, 0.25]}>
        <Watch active={returning} />
      </group>
      <HapticVest active={haptics} />
      <TrainingDevice active={dispatch} />
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.58, 0.72, 0.06, 28]} />
        <meshStandardMaterial color="#152017" emissive={dispatch ? CONNECTED : "#0b110d"} emissiveIntensity={dispatch ? 0.48 : 0.04} metalness={0.54} roughness={0.34} />
      </mesh>
      <mesh ref={signal} position={[0, 1.02, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.47, 34]} />
        <meshBasicMaterial
          ref={signalMaterial}
          color={haptics ? "#fff58a" : CONNECTED}
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function VirtualVolume({ phase, mobile }: { phase: TacticalPhase; mobile: boolean }) {
  const active = phase !== "ready";
  const group = useRef<THREE.Group>(null);
  const eventMarker = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      active ? Math.sin(clock.elapsedTime * 0.42) * 0.025 : 0,
      5,
      Math.min(delta, 0.05),
    );
    if (eventMarker.current) {
      const pulse = active ? 0.86 + Math.sin(clock.elapsedTime * 4.2) * 0.12 : 0.48;
      eventMarker.current.scale.setScalar(
        THREE.MathUtils.damp(eventMarker.current.scale.x, pulse, 7, delta),
      );
      eventMarker.current.rotation.y += delta * (active ? 0.8 : 0.16);
    }
  });
  return (
    <group position={[0, 1.34, -5.1]} ref={group}>
      <RoundedBox args={[7.75, 3.35, 0.14]} radius={0.16} smoothness={4}>
        <meshPhysicalMaterial color="#173029" transparent opacity={0.16} roughness={0.12} metalness={0.12} clearcoat={0.72} depthWrite={false} />
      </RoundedBox>
      <WebModel
        url={STATION_MODEL.tacticalStructure}
        position={[0, -1.58, -0.08]}
        rotation={[0, Math.PI * 0.5, 0]}
        scale={0.29}
        opacity={active ? 0.34 : 0.12}
        emissive={CONNECTED}
        emissiveIntensity={active ? 0.52 : 0.12}
      />
      <group ref={eventMarker} position={[0.65, -0.1, 0.3]}>
        <mesh>
          <icosahedronGeometry args={[0.48, 1]} />
          <meshBasicMaterial
            color={phase === "feedback" ? "#ff765b" : CONNECTED}
            wireframe
            transparent
            opacity={active ? 0.86 : 0.18}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.735, 54]} />
          <meshBasicMaterial color={CONNECTED} transparent opacity={active ? 0.55 : 0.1} toneMapped={false} />
        </mesh>
      </group>
      <Line points={[[-3.55, -0.98, 0.22], [3.55, -0.98, 0.22]]} color={CONNECTED} lineWidth={mobile ? 0.8 : 1.35} transparent opacity={active ? 0.64 : 0.14} dashed dashSize={0.18} gapSize={0.16} />
    </group>
  );
}

function NetworkPulse({
  points,
  offset,
  active,
  returning,
  settled,
}: {
  points: Vec3[];
  offset: number;
  active: boolean;
  returning: boolean;
  settled: boolean;
}) {
  const pulse = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);
  useFrame(({ clock }) => {
    if (!pulse.current) return;
    if (!active || settled) {
      pulse.current.visible = false;
      return;
    }
    const base = (clock.elapsedTime * 0.5 + offset) % 1;
    const t = returning ? 1 - base : base;
    pulse.current.position.copy(curve.getPointAt(t));
    pulse.current.visible = active;
  });
  return (
    <group>
      <Line points={curve.getPoints(18).map((point) => point.toArray() as Vec3)} color={returning ? RETURN : CONNECTED} lineWidth={active ? 1.65 : 0.8} transparent opacity={active ? 0.72 : 0.08} dashed dashSize={0.12} gapSize={0.18} />
      <mesh ref={pulse} visible={false}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <meshBasicMaterial color={returning ? RETURN : CONNECTED} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ConnectedFacility({ mobile }: { mobile: boolean }) {
  return (
    <group>
      <mesh position={[0, -2.02, -0.6]}>
        <cylinderGeometry args={[6.25, 6.45, 0.2, mobile ? 36 : 64]} />
        <meshStandardMaterial color="#0e1418" metalness={0.4} roughness={0.62} />
      </mesh>
      {[-4.85, -3.25, -1.62, 0, 1.62, 3.25, 4.85].map((x) => (
        <group position={[x, 0, -3.15]} key={x}>
          <Beam start={[0, -1.9, 0]} end={[0, 3.1, 0]} radius={0.06} color="#2f3e42" />
          <Beam start={[-0.7, 3.1, 0]} end={[0.7, 3.1, 0]} radius={0.05} color="#2f3e42" />
        </group>
      ))}
      <mesh position={[0, 3.14, -3.15]}>
        <boxGeometry args={[11.2, 0.1, 0.16]} />
        <meshStandardMaterial color="#65786f" emissive={CONNECTED} emissiveIntensity={0.08} metalness={0.5} roughness={0.34} />
      </mesh>
      <WebModel
        url={STATION_MODEL.tacticalBarrier}
        position={[-4.55, -1.93, 0.32]}
        rotation={[0, Math.PI * 0.46, 0]}
        scale={0.38}
      />
      <WebModel
        url={STATION_MODEL.tacticalBarrier}
        position={[4.42, -1.93, -0.2]}
        rotation={[0, -Math.PI * 0.42, 0]}
        scale={0.34}
      />
      <WebModel
        url={STATION_MODEL.tacticalSandbags}
        position={[0.35, -1.93, -3.28]}
        rotation={[0, Math.PI * 0.5, 0]}
        scale={0.52}
      />
    </group>
  );
}

function InstructorStation({ phase, onAction }: { phase: TacticalPhase; onAction: () => void }) {
  const active = phase !== "ready";
  useCursorCleanup();
  return (
    <group
      position={[0, -1.28, 3.35]}
      onClick={(event) => {
        event.stopPropagation();
        onAction();
      }}
      onPointerEnter={() => { document.body.style.cursor = "pointer"; }}
      onPointerLeave={() => { document.body.style.cursor = ""; }}
    >
      <RoundedBox args={[4.2, 0.28, 1.28]} radius={0.13} smoothness={4}>
        <meshStandardMaterial color="#1c272c" metalness={0.62} roughness={0.32} />
      </RoundedBox>
      <DataScreen kind="connected" state={phase} accent={CONNECTED} size={[2.75, 1.38]} position={[-0.48, 1.05, -0.22]} rotation={[-0.3, 0, 0]} />
      <group position={[1.42, 0.65, 0.12]} rotation={[-0.72, 0.06, 0]}>
        <RoundedBox args={[0.96, 1.28, 0.09]} radius={0.1} smoothness={4}>
          <meshPhysicalMaterial color="#12191d" metalness={0.68} roughness={0.21} clearcoat={0.9} />
        </RoundedBox>
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[0.78, 1.08]} />
          <meshBasicMaterial color={active ? "#304719" : "#18251a"} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[1.42, 0.65, 0.19]}>
        <ringGeometry args={[0.12, 0.16, 24]} />
        <meshBasicMaterial color={CONNECTED} transparent opacity={active ? 0.9 : 0.24} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function ConnectedSystemWorld({
  progress,
  index,
  position,
  mobile,
  phase,
  onAction,
}: ConnectedSystemWorldProps) {
  const root = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const presence = useWorldPresence(progress, index, root, mobile ? 0.8 : 1);
  const active = phase !== "ready";
  const returning = phase === "telemetry" || phase === "review";
  const settled = phase === "review";
  usePresenceLight(keyLight, presence, mobile ? 5 : active ? 11 : 5.5);

  return (
    <group position={position}>
      <group ref={root} visible={Math.abs(progress.current - index) < 0.94}>
        <ConnectedFacility mobile={mobile} />
        <VirtualVolume phase={phase} mobile={mobile} />
        {BAY_POSITIONS.map((bay, bayIndex) => (
            <group position={bay} rotation={[0, -bay[0] * 0.055, 0]} key={bayIndex}>
              <ConnectedTrainee index={bayIndex} phase={phase} mobile={mobile} />
              <Line
                points={[[0, 1.1, 0], [bay[0] * -0.28, 4.92, -5.1 - bay[2]]]}
                color={RETURN}
                lineWidth={mobile ? 0.48 : 0.78}
                transparent
                opacity={returning ? 0.58 : active ? 0.14 : 0.04}
                dashed
                dashSize={0.14}
                gapSize={0.2}
              />
            </group>
        ))}
        {BAY_POSITIONS.map((bay, bayIndex) => (
          <NetworkPulse
            key={`network-${bayIndex}`}
            points={[[0, 0.34, 3.3], [0, -0.32, 0.62], [bay[0], bay[1] + 1.08, bay[2]]]}
            offset={bayIndex * 0.13}
            active={active}
            returning={returning}
            settled={settled}
          />
        ))}
        <InstructorStation phase={phase} onAction={onAction} />
        <group position={[0, -0.42, 0.65]}>
          <mesh>
            <octahedronGeometry args={[0.24, 1]} />
            <meshStandardMaterial color={CONNECTED} emissive={CONNECTED} emissiveIntensity={active ? 3.2 : 0.35} wireframe />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.38, 0.42, 34]} />
            <meshBasicMaterial color={CONNECTED} transparent opacity={active ? 0.8 : 0.18} toneMapped={false} />
          </mesh>
        </group>
        <Line
          points={[[0, 0.34, 3.3], [0, -0.42, 0.65]]}
          color={returning ? RETURN : CONNECTED}
          lineWidth={active ? 2.1 : 0.8}
          transparent
          opacity={active ? 0.82 : 0.12}
        />
        <pointLight
          ref={keyLight}
          position={[0, 1.8, 0]}
          color={active ? CONNECTED : "#cce2e4"}
          intensity={0}
          distance={12}
          decay={2}
        />
      </group>
    </group>
  );
}

function WarehouseYard({ mobile }: { mobile: boolean }) {
  return (
    <group>
      <mesh position={[0, -2.02, -0.25]}>
        <boxGeometry args={[12.4, 0.18, 9.2]} />
        <meshStandardMaterial color="#171d20" metalness={0.2} roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.5, -4.55]}>
        <boxGeometry args={[12.4, 5.2, 0.22]} />
        <meshStandardMaterial color="#313a3d" metalness={0.36} roughness={0.58} />
      </mesh>
      {[-4.7, -2.4, 0, 2.4, 4.7].map((x) => (
        <Beam key={x} start={[x, -1.95, -4.3]} end={[x, 3.1, -4.3]} radius={0.07} color="#556269" />
      ))}
      <RoundedBox args={[3.1, 3.25, 0.2]} radius={0.08} smoothness={3} position={[0.35, -0.34, -4.25]}>
        <meshStandardMaterial color="#21292d" metalness={0.44} roughness={0.46} />
      </RoundedBox>
      {Array.from({ length: mobile ? 4 : 7 }, (_, index) => (
        <mesh position={[-4.8 + index * 1.6, 2.95, -2.5]} key={index}>
          <boxGeometry args={[0.82, 0.05, 2.6]} />
          <meshStandardMaterial color="#dfe5dc" emissive="#e6f2e4" emissiveIntensity={0.14} roughness={0.5} />
        </mesh>
      ))}
      <Line points={[[-5.2, -1.91, 2.8], [5.2, -1.91, 2.8]]} color="#76838a" lineWidth={1} transparent opacity={0.22} dashed dashSize={0.22} gapSize={0.22} />
    </group>
  );
}

function Gate({ open }: { open: boolean }) {
  const bar = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!bar.current) return;
    bar.current.rotation.z = THREE.MathUtils.damp(bar.current.rotation.z, open ? -1.08 : -0.04, 4, delta);
  });
  return (
    <group position={[-3.75, -1.82, -0.85]}>
      <RoundedBox args={[0.38, 1.7, 0.38]} radius={0.08} smoothness={3} position={[0, 0.82, 0]}>
        <meshStandardMaterial color="#27343a" metalness={0.58} roughness={0.38} />
      </RoundedBox>
      <group ref={bar} position={[0, 1.45, 0]}>
        <RoundedBox args={[3.1, 0.18, 0.22]} radius={0.055} smoothness={3} position={[1.46, 0, 0]}>
          <meshStandardMaterial color={open ? POLICE : "#d7dce0"} emissive={open ? POLICE : "#15191d"} emissiveIntensity={open ? 0.5 : 0.04} roughness={0.42} />
        </RoundedBox>
      </group>
    </group>
  );
}

function useHazardTexture(kind: "flame" | "smoke") {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) return new THREE.CanvasTexture(canvas);

    if (kind === "flame") {
      const gradient = context.createLinearGradient(0, 38, 0, 238);
      gradient.addColorStop(0, "rgba(255,238,170,0)");
      gradient.addColorStop(0.24, "rgba(255,210,96,.78)");
      gradient.addColorStop(0.58, "rgba(255,92,32,.94)");
      gradient.addColorStop(1, "rgba(110,8,3,0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(128, 20);
      context.bezierCurveTo(170, 72, 218, 120, 188, 194);
      context.bezierCurveTo(172, 232, 91, 242, 61, 191);
      context.bezierCurveTo(34, 145, 97, 105, 128, 20);
      context.fill();

      const core = context.createRadialGradient(128, 176, 4, 128, 176, 70);
      core.addColorStop(0, "rgba(255,255,220,.96)");
      core.addColorStop(0.35, "rgba(255,210,83,.8)");
      core.addColorStop(1, "rgba(255,86,24,0)");
      context.fillStyle = core;
      context.fillRect(48, 94, 160, 150);
    } else {
      const gradient = context.createRadialGradient(128, 128, 12, 128, 128, 118);
      gradient.addColorStop(0, "rgba(128,140,143,.36)");
      gradient.addColorStop(0.5, "rgba(82,92,96,.2)");
      gradient.addColorStop(1, "rgba(30,38,42,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
    }

    const output = new THREE.CanvasTexture(canvas);
    output.colorSpace = THREE.SRGBColorSpace;
    output.needsUpdate = true;
    return output;
  }, [kind]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function FireHazard({ suppressed, mobile }: { suppressed: boolean; mobile: boolean }) {
  const core = useRef<THREE.Group>(null);
  const smoke = useRef<THREE.Group>(null);
  const flameTexture = useHazardTexture("flame");
  const smokeTexture = useHazardTexture("smoke");
  useFrame(({ clock }, delta) => {
    if (core.current) {
      const target = suppressed ? 0.14 : 0.9 + Math.sin(clock.elapsedTime * 5.4) * 0.08;
      const scale = THREE.MathUtils.damp(core.current.scale.x, target, 4, delta);
      core.current.scale.setScalar(scale);
      core.current.rotation.y = THREE.MathUtils.damp(
        core.current.rotation.y,
        suppressed ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.18,
        4,
        Math.min(delta, 0.05),
      );
    }
    if (smoke.current) {
      const target = suppressed ? 0.12 : 1;
      const scale = THREE.MathUtils.damp(smoke.current.scale.x, target, 2.6, delta);
      smoke.current.scale.setScalar(scale);
    }
  });
  return (
    <group position={[0.35, -1.58, -3.6]}>
      <group ref={core}>
        {[
          [-0.28, 0.45, 0.08, 0.72, 1.45],
          [0.22, 0.55, -0.02, 0.82, 1.72],
          [0, 0.32, 0.16, 1.05, 1.35],
        ].map(([x, y, z, width, height], flameIndex) => (
          <sprite position={[x, y, z]} scale={[width, height, 1]} key={flameIndex}>
            <spriteMaterial
              map={flameTexture}
              color={flameIndex === 1 ? "#ffd06b" : "#ff6b2f"}
              transparent
              opacity={0.92}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
        ))}
        <pointLight position={[0, 0.5, 0.4]} color="#ff582f" intensity={suppressed ? 0.4 : mobile ? 5 : 9} distance={6} decay={2} />
      </group>
      <group ref={smoke}>
        {Array.from({ length: mobile ? 4 : 7 }, (_, index) => (
          <sprite
            position={[Math.sin(index * 1.8) * 0.3, 0.9 + index * 0.32, Math.cos(index) * 0.18]}
            scale={[0.78 + (index % 3) * 0.18, 0.78 + (index % 3) * 0.18, 1]}
            key={index}
          >
            <spriteMaterial map={smokeTexture} color="#7d898d" transparent opacity={0.34} depthWrite={false} />
          </sprite>
        ))}
      </group>
    </group>
  );
}

function AmbulanceUnit({ active, mobile }: { active: boolean; mobile: boolean }) {
  const beacon = useRef<THREE.PointLight>(null);
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (beacon.current) {
      const flash = active ? 2.5 + Math.max(0, Math.sin(clock.elapsedTime * 9)) * 6 : 0.35;
      beacon.current.intensity = THREE.MathUtils.damp(beacon.current.intensity, flash, 12, delta);
    }
    if (root.current) {
      root.current.position.x = THREE.MathUtils.damp(root.current.position.x, active ? -0.24 : 0, 3.5, delta);
      root.current.position.z = THREE.MathUtils.damp(root.current.position.z, active ? 0 : 2.15, 3.2, delta);
    }
  });

  return (
    <group ref={root} position={[0, 0, 2.15]}>
      <WebModel
        url={STATION_MODEL.ambulance}
        position={[4.35, -1.93, -3.42]}
        rotation={[0, -0.54, 0]}
        scale={mobile ? 0.48 : 0.58}
      />
      <pointLight
        ref={beacon}
        position={[3.82, -0.2, -3.12]}
        color={active ? MEDICAL : "#7099a6"}
        intensity={0}
        distance={5}
        decay={2}
      />
    </group>
  );
}

function ResponderModel({
  role,
  engaged,
  acting,
  mobile,
}: {
  role: "police" | "fire" | "medical";
  engaged: boolean;
  acting: boolean;
  mobile: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const modelScale = (role === "police" ? 0.52 : role === "fire" ? 0.57 : 0.55) * (mobile ? 0.84 : 1);
  const accent = role === "police" ? POLICE : role === "fire" ? FIRE : MEDICAL;

  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const travel = role === "police" ? -0.82 : role === "fire" ? -1.18 : -0.92;
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, engaged ? travel : 0, 3.4, delta);
    root.current.position.y = THREE.MathUtils.damp(
      root.current.position.y,
      role === "medical" && engaged ? -0.2 : acting ? Math.abs(Math.sin(clock.elapsedTime * 8)) * 0.045 : 0,
      6,
      delta,
    );
    root.current.rotation.x = THREE.MathUtils.damp(
      root.current.rotation.x,
      role === "medical" && engaged ? -0.22 : role === "fire" && engaged ? 0.08 : 0,
      4,
      delta,
    );
    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      engaged
        ? (role === "police" ? -0.18 : role === "fire" ? 0.1 : 0.22) + Math.sin(clock.elapsedTime * 0.7) * 0.025
        : 0,
      4,
      delta,
    );
    root.current.rotation.z = THREE.MathUtils.damp(
      root.current.rotation.z,
      acting ? Math.sin(clock.elapsedTime * 7.5) * 0.018 : 0,
      7,
      delta,
    );
  });

  return (
    <group ref={root}>
      <WebModel
        url={role === "police" ? STATION_MODEL.police : role === "fire" ? STATION_MODEL.fire : STATION_MODEL.medical}
        rotation={[0, Math.PI, 0]}
        scale={modelScale}
      />
      {role === "police" ? (
        <group position={[0.35, 1.02, 0.26]} rotation={[-0.38, 0.08, -0.22]} scale={mobile ? 0.82 : 1}>
          <RoundedBox args={[0.3, 0.42, 0.055]} radius={0.045} smoothness={3}>
            <meshStandardMaterial color="#11191d" metalness={0.52} roughness={0.3} />
          </RoundedBox>
          <mesh position={[0, 0, 0.032]}>
            <planeGeometry args={[0.24, 0.34]} />
            <meshBasicMaterial color={engaged ? POLICE : "#244052"} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
      {role === "fire" ? (
        <group position={[0.3, 0.82, 0.18]} rotation={[0.02, -0.16, -0.38]} scale={mobile ? 0.62 : 0.72}>
          <WebModel url={STATION_MODEL.extinguisher} rotation={[0, 0, 0]} />
        </group>
      ) : null}
      {role === "medical" ? (
        <group position={[-0.42, 0.78, 0.02]} scale={mobile ? 0.74 : 0.86}>
          <RoundedBox args={[0.42, 0.5, 0.22]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color="#4d111b" roughness={0.55} />
          </RoundedBox>
          <mesh position={[0, 0, 0.118]}>
            <boxGeometry args={[0.2, 0.055, 0.025]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.119]}>
            <boxGeometry args={[0.055, 0.2, 0.025]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
      <mesh position={[0, -0.025, 0]}>
        <cylinderGeometry args={[0.52, 0.68, 0.055, 26]} />
        <meshStandardMaterial
          color="#151b1e"
          emissive={engaged ? accent : "#101519"}
          emissiveIntensity={engaged ? 0.48 : 0.05}
          metalness={0.46}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

function SuppressionJet({ active }: { active: boolean }) {
  const spray = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!spray.current) return;
    spray.current.position.x = Math.sin(clock.elapsedTime * 13) * 0.045;
    spray.current.rotation.y = Math.sin(clock.elapsedTime * 9) * 0.012;
  });
  if (!active) return null;
  return (
    <group ref={spray}>
      {[0, 0.08, -0.08].map((offset, lineIndex) => (
        <Line
          key={offset}
          points={[[-0.34 + offset, -0.42, 0.2], [-0.05, -0.68, -1.45], [0.35 + offset * 0.5, -1.0, -3.18]]}
          color={lineIndex === 0 ? "#e8fbff" : "#9eeaff"}
          lineWidth={lineIndex === 0 ? 2.8 : 1.35}
          transparent
          opacity={lineIndex === 0 ? 0.9 : 0.52}
        />
      ))}
      {[0.28, 0.48, 0.68, 0.86].map((step, particleIndex) => (
        <mesh
          key={step}
          position={[-0.28 + step * 0.72 + Math.sin(particleIndex * 2.1) * 0.08, -0.44 - step * 0.56, 0.2 - step * 3.35]}
        >
          <sphereGeometry args={[0.045 + particleIndex * 0.008, 8, 8]} />
          <meshBasicMaterial color="#d9faff" transparent opacity={0.72} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function MedicalTreatment({ active }: { active: boolean }) {
  const pulse = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (!pulse.current || !material.current) return;
    const cycle = (clock.elapsedTime * 0.7) % 1;
    pulse.current.scale.setScalar(0.7 + cycle * 1.8);
    material.current.opacity = active ? (1 - cycle) * 0.62 : 0;
  });
  return (
    <group position={[2.78, -1.0, -2.42]}>
      <mesh ref={pulse} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.46, 44]} />
        <meshBasicMaterial ref={material} color="#83ffc4" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <pointLight color="#83ffc4" intensity={active ? 4.5 : 0} distance={3.2} />
    </group>
  );
}

function CasualtyStation({ stabilized }: { stabilized: boolean }) {
  const breath = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!breath.current) return;
    const target = 1 + Math.sin(clock.elapsedTime * (stabilized ? 1.8 : 3.8)) * (stabilized ? 0.018 : 0.042);
    breath.current.scale.y = THREE.MathUtils.damp(breath.current.scale.y, target, 8, delta);
  });
  return (
    <group position={[2.78, -1.62, -2.4]} rotation={[0, -0.18, 0]}>
      <RoundedBox args={[2.65, 0.18, 1.02]} radius={0.08} smoothness={3} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#bdc8c7" metalness={0.5} roughness={0.34} />
      </RoundedBox>
      <group ref={breath} position={[-0.05, 0.02, 0]} scale={0.66}>
        <ClinicalPatient phase={stabilized ? "review" : "event"} />
      </group>
      <RoundedBox args={[0.66, 0.48, 0.1]} radius={0.06} smoothness={3} position={[1.08, 0.58, 0]}>
        <meshStandardMaterial color="#172025" emissive={stabilized ? "#75ffc1" : MEDICAL} emissiveIntensity={stabilized ? 0.8 : 0.38} roughness={0.32} />
      </RoundedBox>
      <Line points={[[0.72, 0.58, 0.06], [0.86, 0.58, 0.06], [0.94, 0.46, 0.06], [1.02, 0.72, 0.06], [1.12, 0.58, 0.06], [1.36, 0.58, 0.06]]} color={stabilized ? "#75ffc1" : MEDICAL} lineWidth={1.3} />
    </group>
  );
}

function RolePath({
  points,
  color,
  enabled,
  complete,
  offset,
}: {
  points: Vec3[];
  color: string;
  enabled: boolean;
  complete: boolean;
  offset: number;
}) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);
  const pulse = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!pulse.current) return;
    const t = complete ? 1 : (clock.elapsedTime * 0.24 + offset) % 1;
    pulse.current.position.copy(curve.getPointAt(t));
    pulse.current.visible = enabled;
  });
  return (
    <group>
      <Line points={curve.getPoints(24).map((point) => point.toArray() as Vec3)} color={complete ? "#83ffc4" : color} lineWidth={1.55} transparent opacity={enabled ? 0.78 : 0.1} />
      <mesh ref={pulse} visible={false}>
        <sphereGeometry args={[0.075, 10, 10]} />
        <meshBasicMaterial color={complete ? "#83ffc4" : color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function IncidentConsole({ step, onAdvance }: { step: number; onAdvance: () => void }) {
  useCursorCleanup();
  return (
    <group
      position={[3.72, -1.5, 2.52]}
      scale={0.62}
      onClick={(event) => {
        event.stopPropagation();
        onAdvance();
      }}
      onPointerEnter={() => { document.body.style.cursor = "pointer"; }}
      onPointerLeave={() => { document.body.style.cursor = ""; }}
    >
      <RoundedBox args={[4.2, 0.28, 1.25]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color="#1c2428" metalness={0.58} roughness={0.34} />
      </RoundedBox>
      <DataScreen kind="incident" state={String(step)} accent={step === 3 ? "#83ffc4" : FIRE} size={[3.35, 1.58]} position={[0, 1.05, -0.26]} rotation={[-0.31, 0, 0]} />
      <mesh position={[1.62, 0.22, 0.42]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.17, 0.23, 28]} />
        <meshBasicMaterial color={step === 3 ? "#83ffc4" : FIRE} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function EmergencySystemWorld({
  progress,
  index,
  position,
  mobile,
  step,
  onAdvance,
}: EmergencySystemWorldProps) {
  const root = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const presence = useWorldPresence(progress, index, root, mobile ? 0.82 : 1);
  const routeSecure = step >= 1;
  const suppressed = step >= 2;
  const stabilized = step >= 3;
  usePresenceLight(keyLight, presence, mobile ? 5 : 9);

  return (
    <group position={position}>
      <group ref={root} visible={Math.abs(progress.current - index) < 0.94}>
        <WarehouseYard mobile={mobile} />
        <AmbulanceUnit active={routeSecure} mobile={mobile} />
        <Gate open={routeSecure} />
        <FireHazard suppressed={suppressed} mobile={mobile} />
        <CasualtyStation stabilized={stabilized} />
        <group position={[-3.35, -1.77, 1.32]} rotation={[0, -0.08, 0]}>
          <ResponderModel role="police" engaged={routeSecure} acting={step === 1} mobile={mobile} />
        </group>
        <group position={[-0.46, -1.77, 1.02]}>
          <ResponderModel role="fire" engaged={suppressed} acting={step === 2} mobile={mobile} />
        </group>
        <group position={[2.42, -1.77, 1.18]} rotation={[0, 0.12, 0]}>
          <ResponderModel role="medical" engaged={stabilized} acting={step === 3} mobile={mobile} />
        </group>
        <SuppressionJet active={step === 2} />
        <MedicalTreatment active={step === 3} />
        <RolePath points={[[-3.35, -1.78, 1.32], [-3.2, -1.78, -0.6], [-2.4, -1.72, -2.85]]} color={POLICE} enabled={step === 0 || routeSecure} complete={routeSecure} offset={0.05} />
        <RolePath points={[[ -0.46, -1.78, 1.02], [0.05, -1.7, -0.72], [0.35, -1.58, -3.58]]} color={FIRE} enabled={routeSecure} complete={suppressed} offset={0.28} />
        <RolePath points={[[2.42, -1.78, 1.18], [2.72, -1.7, -0.4], [2.78, -1.55, -2.38]]} color={MEDICAL} enabled={suppressed} complete={stabilized} offset={0.56} />
        <Line points={[[-0.05, -0.84, 1.18], [0.12, -1.25, -0.65], [0.35, -1.42, -3.35]]} color={suppressed ? "#83ffc4" : FIRE} lineWidth={mobile ? 1.3 : 2.1} transparent opacity={routeSecure ? 0.74 : 0.12} />
        <IncidentConsole step={step} onAdvance={onAdvance} />
        <pointLight
          ref={keyLight}
          position={[0, 1.7, 0]}
          color={stabilized ? "#83ffc4" : FIRE}
          intensity={0}
          distance={12}
          decay={2}
        />
      </group>
    </group>
  );
}
