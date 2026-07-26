import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export const SOURCED_ASSET_PATHS = {
  wheelchair: "/assets/models/wheelchair-cc0.glb",
  fireExtinguisher: "/assets/models/fire-extinguisher-cc0.glb",
  hoverSpeeder: "/assets/models/challenger-speeder-cc0.glb",
  sciFiHelmet: "/assets/models/scifi-helmet-cc0.glb",
} as const;

export type SourcedAssetKey = keyof typeof SOURCED_ASSET_PATHS;
export type SourcedAssetAnchor = "floor" | "center";

export type SourcedAssetProps = Omit<ThreeElements["group"], "children"> & {
  /** Longest model dimension, in scene units, before the outer group transform. */
  normalizeTo?: number;
  /** Places the model on y=0 or centers its bounds around the local origin. */
  anchor?: SourcedAssetAnchor;
  shadows?: boolean;
};

type PreparedAsset = {
  object: THREE.Group;
  ownedMaterials: THREE.Material[];
};

const MIN_MODEL_SIZE = 1e-6;

function cloneMaterial(
  material: THREE.Material,
  materialCopies: Map<THREE.Material, THREE.Material>,
) {
  const existing = materialCopies.get(material);
  if (existing) return existing;

  const copy = material.clone();
  materialCopies.set(material, copy);
  return copy;
}

function prepareAsset(
  source: THREE.Group,
  normalizeTo: number,
  anchor: SourcedAssetAnchor,
  shadows: boolean,
): PreparedAsset {
  const object = source.clone(true);
  const materialCopies = new Map<THREE.Material, THREE.Material>();

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.castShadow = shadows;
    child.receiveShadow = shadows;
    child.material = Array.isArray(child.material)
      ? child.material.map((material) =>
          cloneMaterial(material, materialCopies),
        )
      : cloneMaterial(child.material, materialCopies);
  });

  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object, true);
  const size = bounds.getSize(new THREE.Vector3());
  const longestDimension = Math.max(size.x, size.y, size.z);

  if (
    Number.isFinite(longestDimension) &&
    longestDimension > MIN_MODEL_SIZE
  ) {
    const safeTarget =
      Number.isFinite(normalizeTo) && normalizeTo > 0 ? normalizeTo : 1;
    object.scale.multiplyScalar(safeTarget / longestDimension);
    object.updateMatrixWorld(true);

    bounds.setFromObject(object, true);
    const center = bounds.getCenter(new THREE.Vector3());
    object.position.x -= center.x;
    object.position.z -= center.z;
    object.position.y -= anchor === "floor" ? bounds.min.y : center.y;
    object.updateMatrixWorld(true);
  }

  return {
    object,
    ownedMaterials: Array.from(materialCopies.values()),
  };
}

function SourcedModel({
  asset,
  normalizeTo,
  anchor,
  shadows,
  ...groupProps
}: SourcedAssetProps & {
  asset: SourcedAssetKey;
  normalizeTo: number;
  anchor: SourcedAssetAnchor;
  shadows: boolean;
}) {
  // These assets use EXT_meshopt_compression, not Draco. Keeping Draco disabled
  // avoids a decoder-network dependency while Drei supplies Meshopt locally.
  const { scene } = useGLTF(SOURCED_ASSET_PATHS[asset], false, true);
  const prepared = useMemo(
    () => prepareAsset(scene, normalizeTo, anchor, shadows),
    [anchor, normalizeTo, scene, shadows],
  );

  useEffect(
    () => () => {
      // Geometry and textures remain owned by useGLTF's shared cache. Only the
      // per-instance material clones belong to this component.
      prepared.ownedMaterials.forEach((material) => material.dispose());
    },
    [prepared],
  );

  return (
    <group {...groupProps}>
      <primitive object={prepared.object} dispose={null} />
    </group>
  );
}

export function SourcedWheelchair({
  normalizeTo = 1.8,
  anchor = "floor",
  shadows = true,
  ...props
}: SourcedAssetProps) {
  return (
    <SourcedModel
      asset="wheelchair"
      normalizeTo={normalizeTo}
      anchor={anchor}
      shadows={shadows}
      {...props}
    />
  );
}

export function SourcedFireExtinguisher({
  normalizeTo = 1.25,
  anchor = "floor",
  shadows = true,
  ...props
}: SourcedAssetProps) {
  return (
    <SourcedModel
      asset="fireExtinguisher"
      normalizeTo={normalizeTo}
      anchor={anchor}
      shadows={shadows}
      {...props}
    />
  );
}

export function SourcedHoverSpeeder({
  normalizeTo = 3.2,
  anchor = "center",
  shadows = true,
  ...props
}: SourcedAssetProps) {
  return (
    <SourcedModel
      asset="hoverSpeeder"
      normalizeTo={normalizeTo}
      anchor={anchor}
      shadows={shadows}
      {...props}
    />
  );
}

export function SourcedSciFiHelmet({
  normalizeTo = 1,
  anchor = "center",
  shadows = true,
  ...props
}: SourcedAssetProps) {
  return (
    <SourcedModel
      asset="sciFiHelmet"
      normalizeTo={normalizeTo}
      anchor={anchor}
      shadows={shadows}
      {...props}
    />
  );
}
