import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type SimulationAtmosphereProps = {
  progress: MutableRefObject<number>;
  mobile: boolean;
  profile: "full" | "lean";
};

const JOURNEY_COLORS = [
  new THREE.Color("#74ecff"),
  new THREE.Color("#74ecff"),
  new THREE.Color("#5d76ff"),
  new THREE.Color("#ff7a3c"),
  new THREE.Color("#71fff0"),
  new THREE.Color("#f5c65c"),
  new THREE.Color("#c8a7ff"),
  new THREE.Color("#e8fbff"),
];

const ATMOSPHERE_DEPTH_COLOR = new THREE.Color("#244f6a");

const FLOOR_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FLOOR_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uCameraXZ;
  uniform vec3 uAccent;
  uniform vec3 uSecondary;

  varying vec3 vWorldPosition;

  float gridLine(vec2 position, float scale, float width) {
    vec2 scaled = position / scale;
    vec2 cell = abs(fract(scaled - 0.5) - 0.5);
    vec2 pixel = max(fwidth(scaled) * width, vec2(0.0001));
    vec2 lineDistance = cell / pixel;
    return 1.0 - min(min(lineDistance.x, lineDistance.y), 1.0);
  }

  void main() {
    vec2 worldXZ = vWorldPosition.xz;
    float distanceToCamera = distance(worldXZ, uCameraXZ);
    float minorGrid = gridLine(worldXZ, 1.25, 0.72);
    float majorGrid = gridLine(worldXZ, 5.0, 1.05);

    float lateralFade = 1.0 - smoothstep(8.0, 15.0, abs(vWorldPosition.x - uCameraXZ.x));
    float depthFade = 1.0 - smoothstep(8.0, 50.0, distanceToCamera);
    float nearFade = smoothstep(1.5, 5.0, distanceToCamera);

    // The grid settles and brightens as the camera reaches each authored station.
    float stationDistance = abs(fract(uProgress + 0.5) - 0.5);
    float stationProximity = exp(-pow(stationDistance * 5.5, 2.0));

    // One restrained scanner ring gives the floor a functional, measured rhythm.
    float scanRadius = mod(uTime * 2.15, 18.0);
    float scanner = 1.0 - smoothstep(0.08, 0.58, abs(distanceToCamera - scanRadius));
    scanner *= 1.0 - smoothstep(9.0, 18.0, distanceToCamera);

    float centerRail = exp(-abs(vWorldPosition.x - uCameraXZ.x) * 1.75);
    float grid = minorGrid * 0.22 + majorGrid * 0.78;
    float visibility = lateralFade * depthFade * nearFade;
    float alpha = (grid * (0.035 + stationProximity * 0.04) + scanner * 0.14 + centerRail * 0.018) * visibility;

    vec3 color = mix(uSecondary, uAccent, 0.45 + majorGrid * 0.35 + stationProximity * 0.2);
    color *= 1.15 + scanner * 2.2 + majorGrid * 0.35;
    gl_FragColor = vec4(color, alpha);
  }
`;

const HAZE_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vec4 localPosition = vec4(position, 1.0);

    #ifdef USE_INSTANCING
      localPosition = instanceMatrix * localPosition;
    #endif

    vec4 worldPosition = modelMatrix * localPosition;
    vUv = uv;
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const HAZE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uOpacity;
  uniform vec3 uAccent;
  uniform vec3 uSecondary;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vec2 centered = vUv - 0.5;
    float horizontalFade = 1.0 - smoothstep(0.18, 0.5, abs(centered.x));
    float verticalFade = 1.0 - smoothstep(0.08, 0.5, abs(centered.y));
    float edgeFade = horizontalFade * verticalFade;

    float slowFold = sin(centered.x * 7.0 + sin(centered.y * 8.0 + uTime * 0.07));
    float depthBand = 0.5 + 0.5 * sin(vWorldPosition.y * 0.7 + vWorldPosition.z * 0.025 - uTime * 0.11);
    float veil = mix(0.68, 1.0, depthBand) * mix(0.82, 1.0, slowFold * 0.5 + 0.5);
    float energy = 0.5 + 0.5 * sin(uProgress * 1.7 + vWorldPosition.z * 0.018);

    vec3 color = mix(uSecondary, uAccent, 0.36 + energy * 0.24);
    color *= 1.25 + depthBand * 0.45;
    gl_FragColor = vec4(color, edgeFade * veil * uOpacity);
  }
`;

const SIGNAL_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aOffset;
  attribute float aLane;

  varying float vPulse;
  varying float vLane;

  void main() {
    float travel = fract(aOffset + uTime * (0.032 + aLane * 0.004));
    vec3 signalPosition = position;
    signalPosition.z = mix(7.0, -52.0, travel);
    signalPosition.y += sin(travel * 6.2831853 + aLane * 1.3) * 0.08;

    vec4 viewPosition = modelViewMatrix * vec4(signalPosition, 1.0);
    float perspective = clamp(42.0 / max(1.0, -viewPosition.z), 0.55, 1.65);
    vPulse = 0.62 + 0.38 * sin((travel + aOffset) * 12.56637);
    vLane = aLane;

    gl_PointSize = uPixelRatio * mix(2.2, 4.4, vPulse) * perspective;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const SIGNAL_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uSecondary;

  varying float vPulse;
  varying float vLane;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceToCenter = length(point);
    float body = 1.0 - smoothstep(0.16, 0.5, distanceToCenter);
    float core = 1.0 - smoothstep(0.0, 0.14, distanceToCenter);
    float laneMix = clamp(vLane * 0.36, 0.0, 1.0);
    vec3 color = mix(uSecondary, uAccent, laneMix);
    color *= 1.5 + core * 2.6;
    gl_FragColor = vec4(color, body * (0.38 + vPulse * 0.52));
  }
`;

function sampleJourneyColor(progress: number, target: THREE.Color) {
  const value = THREE.MathUtils.clamp(progress, 0, JOURNEY_COLORS.length - 1);
  const index = Math.floor(value);
  const nextIndex = Math.min(index + 1, JOURNEY_COLORS.length - 1);
  const blend = THREE.MathUtils.smoothstep(value - index, 0, 1);
  target.copy(JOURNEY_COLORS[index]).lerp(JOURNEY_COLORS[nextIndex], blend);
}

export function SimulationAtmosphere({ progress, mobile, profile }: SimulationAtmosphereProps) {
  const floor = useRef<THREE.Mesh>(null);
  const hazeAnchor = useRef<THREE.Group>(null);
  const signalAnchor = useRef<THREE.Group>(null);

  const floorUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uCameraXZ: { value: new THREE.Vector2() },
      uAccent: { value: new THREE.Color("#74ecff") },
      uSecondary: { value: new THREE.Color("#2b6f8f") },
    }),
    [],
  );

  const hazeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uOpacity: { value: mobile ? 0.006 : profile === "lean" ? 0.0065 : 0.009 },
      uAccent: { value: new THREE.Color("#74ecff") },
      uSecondary: { value: new THREE.Color("#244f6a") },
    }),
    [mobile, profile],
  );

  const signalUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uAccent: { value: new THREE.Color("#74ecff") },
      uSecondary: { value: new THREE.Color("#8be8ff") },
    }),
    [],
  );

  const haze = useMemo(() => {
    const count = mobile || profile === "lean" ? 2 : 4;
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms: hazeUniforms,
      vertexShader: HAZE_VERTEX_SHADER,
      fragmentShader: HAZE_FRAGMENT_SHADER,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const transform = new THREE.Object3D();

    for (let index = 0; index < count; index += 1) {
      const alternatingSide = index % 2 === 0 ? -1 : 1;
      transform.position.set(
        alternatingSide * (index * 1.8),
        (index % 3 - 1) * 0.85,
        -13 - index * (mobile ? 17 : 12),
      );
      transform.scale.set(34 + index * 5, 13 + index * 2.5, 1);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    mesh.renderOrder = -20;
    return { geometry, material, mesh };
  }, [hazeUniforms, mobile, profile]);

  useEffect(
    () => () => {
      haze.geometry.dispose();
      haze.material.dispose();
    },
    [haze],
  );

  const signalAttributes = useMemo(() => {
    const count = mobile ? 9 : profile === "lean" ? 12 : 18;
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count);
    const lanes = new Float32Array(count);
    const laneWidth = mobile ? 1.85 : 3.1;

    for (let index = 0; index < count; index += 1) {
      const lane = index % 3;
      const sequence = Math.floor(index / 3);
      positions[index * 3] = (lane - 1) * laneWidth;
      positions[index * 3 + 1] = -0.45 + lane * 0.58 + (sequence % 2) * 0.12;
      positions[index * 3 + 2] = 0;
      offsets[index] = sequence / Math.ceil(count / 3) + lane * 0.075;
      lanes[index] = lane;
    }

    return { positions, offsets, lanes };
  }, [mobile, profile]);

  const secondaryTarget = useMemo(() => new THREE.Color(), []);

  useFrame(({ camera, clock, gl }) => {
    const time = clock.elapsedTime;
    const journeyProgress = progress.current;

    sampleJourneyColor(journeyProgress, floorUniforms.uAccent.value);
    secondaryTarget.copy(floorUniforms.uAccent.value).lerp(ATMOSPHERE_DEPTH_COLOR, 0.68);
    floorUniforms.uSecondary.value.copy(secondaryTarget);
    hazeUniforms.uAccent.value.copy(floorUniforms.uAccent.value);
    hazeUniforms.uSecondary.value.copy(secondaryTarget);
    signalUniforms.uAccent.value.copy(floorUniforms.uAccent.value);
    signalUniforms.uSecondary.value.copy(secondaryTarget).multiplyScalar(1.35);

    floorUniforms.uTime.value = time;
    floorUniforms.uProgress.value = journeyProgress;
    floorUniforms.uCameraXZ.value.set(camera.position.x, camera.position.z);
    hazeUniforms.uTime.value = time;
    hazeUniforms.uProgress.value = journeyProgress;
    signalUniforms.uTime.value = time;
    signalUniforms.uPixelRatio.value = Math.min(
      gl.getPixelRatio(),
      mobile || profile === "lean" ? 1.2 : 1.6,
    );

    if (floor.current) {
      floor.current.position.x = camera.position.x;
      floor.current.position.z = camera.position.z - 26;
    }

    if (hazeAnchor.current) {
      hazeAnchor.current.position.copy(camera.position);
      hazeAnchor.current.quaternion.copy(camera.quaternion);
    }

    if (signalAnchor.current) {
      signalAnchor.current.position.copy(camera.position);
      signalAnchor.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group name="simulation-atmosphere">
      <mesh
        ref={floor}
        position={[0, -3.2, -26]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={-10}
        frustumCulled={false}
      >
        <planeGeometry args={[30, 104, 1, 1]} />
        <shaderMaterial
          uniforms={floorUniforms}
          vertexShader={FLOOR_VERTEX_SHADER}
          fragmentShader={FLOOR_FRAGMENT_SHADER}
          transparent
          depthTest
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <group ref={hazeAnchor}>
        <primitive object={haze.mesh} />
      </group>

      <group ref={signalAnchor}>
        <points frustumCulled={false} renderOrder={10}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[signalAttributes.positions, 3]} />
            <bufferAttribute attach="attributes-aOffset" args={[signalAttributes.offsets, 1]} />
            <bufferAttribute attach="attributes-aLane" args={[signalAttributes.lanes, 1]} />
          </bufferGeometry>
          <shaderMaterial
            uniforms={signalUniforms}
            vertexShader={SIGNAL_VERTEX_SHADER}
            fragmentShader={SIGNAL_FRAGMENT_SHADER}
            transparent
            depthTest
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>
      </group>
    </group>
  );
}
