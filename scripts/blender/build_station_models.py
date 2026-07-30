"""Build the station 01-03 web model kit from commercial-safe CC0 sources.

The source files are intentionally kept outside the repository. Download URLs,
authors, and licenses are recorded in ``public/assets/models/stations/SOURCES.md``.

Run from the repository root:

    blender --background --factory-startup --python scripts/blender/build_station_models.py

The character sources contain full rigs and large action libraries. For the web
experience we evaluate one authored action frame, bake that deformed pose into a
plain mesh, remove the armature, and export a compact static GLB. The surrounding
React Three Fiber scene supplies the subtle procedural motion.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

import bpy
import bmesh
from mathutils import Vector


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
SOURCE_ROOT = Path("/private/tmp/portfolio-source-assets")
TRANSPORT_ROOT = Path("/private/tmp/quaternius-publictransport/Blends")
OUTPUT_ROOT = REPOSITORY_ROOT / "public/assets/models/stations"


Color = tuple[float, float, float, float]


@dataclass(frozen=True)
class ExportSpec:
    source: Path
    output: str
    meshes: tuple[str, ...]
    action: str | None = None
    frame: int = 0
    colors: dict[str, Color] = field(default_factory=dict)
    metallic: float = 0.08
    roughness: float = 0.54
    remove_materials: tuple[str, ...] = ()


WHITE = (0.78, 0.86, 0.88, 1.0)
INK = (0.018, 0.028, 0.034, 1.0)
CHARCOAL = (0.055, 0.075, 0.085, 1.0)
CYAN = (0.16, 0.72, 0.86, 1.0)
LIME = (0.62, 0.88, 0.12, 1.0)
BLUE = (0.08, 0.32, 0.54, 1.0)
ORANGE = (0.92, 0.22, 0.055, 1.0)
RED = (0.72, 0.035, 0.055, 1.0)
OLIVE = (0.16, 0.22, 0.12, 1.0)
SAND = (0.32, 0.28, 0.19, 1.0)


SPECS = (
    ExportSpec(
        SOURCE_ROOT / "worker-male.blend",
        "clinical-doctor.glb",
        ("Body",),
        action="Idle",
        frame=34,
        colors={"Shirt": WHITE, "Pants": CYAN},
        remove_materials=("Hat", "Vest"),
    ),
    ExportSpec(
        SOURCE_ROOT / "doctor-female.blend",
        "clinical-instructor.glb",
        ("Body",),
        action="Idle",
        frame=61,
        colors={"Main": CHARCOAL, "Brown": CYAN, "Black": INK, "Hair": CHARCOAL},
    ),
    ExportSpec(
        SOURCE_ROOT / "worker-male.blend",
        "clinical-patient.glb",
        ("Body",),
        action="Idle",
        frame=0,
        colors={
            "Shirt": (0.2, 0.42, 0.48, 1.0),
            "Pants": (0.68, 0.82, 0.84, 1.0),
        },
        roughness=0.66,
        remove_materials=("Hat", "Vest"),
    ),
    ExportSpec(
        SOURCE_ROOT / "toon-soldier.blend",
        "tactical-trainee-alpha.glb",
        ("Body", "Head", "ShoulderPad.R", "ShoulderPad.L"),
        action="Idle_Shoot",
        frame=4,
        colors={
            "Character_Main": OLIVE,
            "Pants": CHARCOAL,
            "DarkGrey": INK,
            "Grey": (0.12, 0.15, 0.13, 1.0),
            "Red": LIME,
        },
    ),
    ExportSpec(
        SOURCE_ROOT / "soldier-female.blend",
        "tactical-trainee-bravo.glb",
        ("Body",),
        action="Run_Carry",
        frame=7,
        colors={"Main": OLIVE, "DarkGreen": CHARCOAL, "Black": INK},
    ),
    ExportSpec(
        SOURCE_ROOT / "worker-female.blend",
        "responder-police.glb",
        ("Body",),
        action="Walk_Carry",
        frame=9,
        colors={"Vest": BLUE, "Shirt": INK, "Pants": CHARCOAL, "Hat": INK},
    ),
    ExportSpec(
        SOURCE_ROOT / "worker-male.blend",
        "responder-fire.glb",
        ("Body",),
        action="Run_Carry",
        frame=7,
        colors={"Vest": ORANGE, "Shirt": CHARCOAL, "Pants": INK, "Hat": ORANGE},
    ),
    ExportSpec(
        SOURCE_ROOT / "doctor-male.blend",
        "responder-medical.glb",
        ("Body",),
        action="Walk_Carry",
        frame=18,
        colors={"Main": RED, "Brown": WHITE, "Black": CHARCOAL},
    ),
    ExportSpec(
        TRANSPORT_ROOT / "Ambulance.blend",
        "emergency-ambulance.glb",
        ("Ambulance", "BackWheels", "FrontWheels"),
        colors={
            "White": WHITE,
            "Red": RED,
            "Windows": (0.025, 0.11, 0.15, 1.0),
            "Grey": CHARCOAL,
            "Bumper": INK,
        },
        metallic=0.16,
        roughness=0.38,
    ),
    ExportSpec(
        SOURCE_ROOT / "barrier-large.blend",
        "tactical-barrier.glb",
        ("Barrier_Large",),
        colors={"DarkGrey": INK, "Grey": CHARCOAL, "Yellow": LIME, "White": WHITE},
        metallic=0.24,
        roughness=0.48,
    ),
    ExportSpec(
        SOURCE_ROOT / "sack-trench.blend",
        "tactical-sandbags.glb",
        ("SackTrench",),
        colors={"Sack": SAND},
        roughness=0.78,
    ),
    ExportSpec(
        SOURCE_ROOT / "structure-2.blend",
        "tactical-structure.glb",
        ("Structure_2",),
        colors={
            "Green": OLIVE,
            "Grey": CHARCOAL,
            "Grey2": INK,
            "Yellow": LIME,
            "Wood": SAND,
            "Wood_Light": (0.42, 0.34, 0.22, 1.0),
        },
        metallic=0.12,
        roughness=0.58,
    ),
    ExportSpec(
        SOURCE_ROOT / "smg.blend",
        "tactical-controller.glb",
        ("SMG",),
        colors={
            "Black": INK,
            "DarkGrey": CHARCOAL,
            "Grey": (0.16, 0.2, 0.2, 1.0),
            "Grey2": CHARCOAL,
            "Wood": OLIVE,
        },
        metallic=0.32,
        roughness=0.38,
    ),
    ExportSpec(
        SOURCE_ROOT / "hospital.blend",
        "clinical-hospital.glb",
        ("Hospital",),
        roughness=0.64,
    ),
)


def set_shader_input(shader: bpy.types.Node, name: str, value) -> None:
    socket = shader.inputs.get(name)
    if socket is not None:
        socket.default_value = value


def style_materials(colors: dict[str, Color], metallic: float, roughness: float) -> None:
    for material in bpy.data.materials:
        material.use_nodes = True
        color = colors.get(material.name)
        if color is not None:
            material.diffuse_color = color
        else:
            color = tuple(material.diffuse_color)
        # The legacy source files often connect an old Diffuse node to their
        # active output while leaving an unused Principled node beside it. The
        # glTF exporter then falls back to white. Rebuild a minimal predictable
        # PBR graph instead of trying to guess which legacy output is active.
        material.node_tree.nodes.clear()
        shader = material.node_tree.nodes.new("ShaderNodeBsdfPrincipled")
        output = material.node_tree.nodes.new("ShaderNodeOutputMaterial")
        material.node_tree.links.new(shader.outputs["BSDF"], output.inputs["Surface"])
        set_shader_input(shader, "Base Color", color)
        set_shader_input(shader, "Metallic", metallic)
        set_shader_input(shader, "Roughness", roughness)


def set_pose(action_name: str | None, frame: int) -> None:
    if action_name is None:
        return
    action = bpy.data.actions.get(action_name)
    if action is None:
        raise RuntimeError(f"Action {action_name!r} not found")
    armatures = [item for item in bpy.context.scene.objects if item.type == "ARMATURE"]
    if not armatures:
        raise RuntimeError(f"No armature found for action {action_name!r}")
    for armature in armatures:
        armature.animation_data_create()
        armature.animation_data.action = action
    bpy.context.scene.frame_set(frame)
    bpy.context.view_layer.update()


def baked_mesh(source: bpy.types.Object) -> bpy.types.Object:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = source.evaluated_get(depsgraph)
    mesh = bpy.data.meshes.new_from_object(evaluated, depsgraph=depsgraph)
    output = bpy.data.objects.new(source.name, mesh)
    output.matrix_world = source.matrix_world.copy()
    return output


def combined_bounds(objects: Iterable[bpy.types.Object]) -> tuple[Vector, Vector]:
    minimum = Vector((float("inf"), float("inf"), float("inf")))
    maximum = Vector((float("-inf"), float("-inf"), float("-inf")))
    for item in objects:
        for corner in item.bound_box:
            world = item.matrix_world @ Vector(corner)
            minimum.x = min(minimum.x, world.x)
            minimum.y = min(minimum.y, world.y)
            minimum.z = min(minimum.z, world.z)
            maximum.x = max(maximum.x, world.x)
            maximum.y = max(maximum.y, world.y)
            maximum.z = max(maximum.z, world.z)
    return minimum, maximum


def center_on_floor(objects: list[bpy.types.Object]) -> None:
    minimum, maximum = combined_bounds(objects)
    offset = Vector((-(minimum.x + maximum.x) * 0.5, -(minimum.y + maximum.y) * 0.5, -minimum.z))
    for item in objects:
        item.location += offset
    bpy.context.view_layer.update()


def reset_to_baked_meshes(mesh_names: tuple[str, ...]) -> list[bpy.types.Object]:
    originals: list[bpy.types.Object] = []
    for name in mesh_names:
        source = bpy.data.objects.get(name)
        if source is None:
            raise RuntimeError(f"Mesh {name!r} not found in {bpy.data.filepath}")
        originals.append(source)

    baked = [baked_mesh(source) for source in originals]
    for item in list(bpy.data.objects):
        if item not in baked:
            bpy.data.objects.remove(item, do_unlink=True)
    for item in baked:
        bpy.context.collection.objects.link(item)
    center_on_floor(baked)
    return baked


def remove_material_geometry(
    objects: list[bpy.types.Object],
    material_names: tuple[str, ...],
) -> None:
    if not material_names:
        return
    names = set(material_names)
    for item in objects:
        material_indices = {
            index
            for index, slot in enumerate(item.material_slots)
            if slot.material is not None and slot.material.name in names
        }
        if not material_indices:
            continue
        mesh = item.data
        editable = bmesh.new()
        editable.from_mesh(mesh)
        doomed = [face for face in editable.faces if face.material_index in material_indices]
        bmesh.ops.delete(editable, geom=doomed, context="FACES")
        editable.to_mesh(mesh)
        editable.free()
        mesh.update()


def export(spec: ExportSpec) -> None:
    if not spec.source.exists():
        raise FileNotFoundError(spec.source)
    bpy.ops.wm.open_mainfile(filepath=str(spec.source))
    set_pose(spec.action, spec.frame)
    style_materials(spec.colors, spec.metallic, spec.roughness)
    meshes = reset_to_baked_meshes(spec.meshes)
    remove_material_geometry(meshes, spec.remove_materials)

    for item in bpy.context.view_layer.objects:
        item.select_set(False)
    for item in meshes:
        item.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]

    output = OUTPUT_ROOT / spec.output
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_apply=True,
    )
    print(f"EXPORTED {output} ({output.stat().st_size:,} bytes)")


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    for spec in SPECS:
        export(spec)


if __name__ == "__main__":
    main()
