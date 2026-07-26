"""Build the original Playframe hoverboard and export a web-ready GLB.

Run from the repository root:

    blender --background --python scripts/blender/build_hoverboard.py

Optional local review renders:

    blender --background --python scripts/blender/build_hoverboard.py -- \
        --preview /tmp/hoverboard-original.png

The board points along Blender +Y. Blender's glTF axis conversion maps that to
glTF -Z, so runtime forward is documented as -Z.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_PATH = REPOSITORY_ROOT / "public/assets/models/hoverboard-original.glb"


def command_line_value(flag: str) -> str | None:
    if "--" not in sys.argv:
        return None
    arguments = sys.argv[sys.argv.index("--") + 1 :]
    if flag not in arguments:
        return None
    index = arguments.index(flag)
    if index + 1 >= len(arguments):
        raise ValueError(f"{flag} requires a path")
    return arguments[index + 1]


def set_shader_input(shader, names: tuple[str, ...], value) -> None:
    for name in names:
        socket = shader.inputs.get(name)
        if socket is not None:
            socket.default_value = value
            return


def create_material(
    name: str,
    base_color: tuple[float, float, float, float],
    *,
    metallic: float,
    roughness: float,
    emission_color: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = base_color
    shader = material.node_tree.nodes.get("Principled BSDF")
    if shader is None:
        raise RuntimeError(f"Principled BSDF missing for {name}")

    set_shader_input(shader, ("Base Color",), base_color)
    set_shader_input(shader, ("Metallic",), metallic)
    set_shader_input(shader, ("Roughness",), roughness)

    if emission_color is not None:
        set_shader_input(shader, ("Emission Color", "Emission"), emission_color)
        set_shader_input(shader, ("Emission Strength",), emission_strength)

    return material


def activate(object_: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    object_.select_set(True)
    bpy.context.view_layer.objects.active = object_


def apply_bevel(
    object_: bpy.types.Object,
    width: float,
    *,
    segments: int = 3,
) -> None:
    activate(object_)
    modifier = object_.modifiers.new("Manufactured edge radius", "BEVEL")
    modifier.width = width
    modifier.segments = segments
    modifier.limit_method = "ANGLE"
    modifier.angle_limit = math.radians(18.0)
    modifier.harden_normals = True
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def create_prism(
    name: str,
    outline: list[tuple[float, float]],
    z_bottom: float,
    z_top: float,
    material: bpy.types.Material,
    *,
    bevel: float,
) -> bpy.types.Object:
    count = len(outline)
    vertices = [(x, y, z_bottom) for x, y in outline]
    vertices.extend((x, y, z_top) for x, y in outline)

    # The outline is clockwise from above. Reverse the upper cap so its normal
    # points upward; keep the lower cap clockwise so its normal points down.
    faces: list[tuple[int, ...]] = [tuple(range(count))]
    faces.append(tuple(count + index for index in reversed(range(count))))
    for index in range(count):
        next_index = (index + 1) % count
        faces.append((index, next_index, count + next_index, count + index))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(material)
    mesh.validate(verbose=False)
    mesh.update()

    object_ = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(object_)
    apply_bevel(object_, bevel, segments=4)
    return object_


def create_beveled_box(
    name: str,
    dimensions: tuple[float, float, float],
    location: tuple[float, float, float],
    material: bpy.types.Material,
    *,
    bevel: float,
    rotation_z: float = 0.0,
    segments: int = 3,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location)
    object_ = bpy.context.object
    object_.name = name
    object_.dimensions = dimensions
    object_.rotation_euler.z = rotation_z
    activate(object_)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    object_.data.materials.append(material)
    apply_bevel(object_, bevel, segments=segments)
    return object_


def create_channel(
    name: str,
    points: list[tuple[float, float, float]],
    material: bpy.types.Material,
    *,
    radius: float,
) -> bpy.types.Object:
    curve = bpy.data.curves.new(f"{name}_Curve", type="CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 1
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    curve.resolution_u = 2

    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, coordinate in zip(spline.points, points):
        point.co = (*coordinate, 1.0)

    object_ = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(object_)
    object_.data.materials.append(material)
    activate(object_)
    bpy.ops.object.convert(target="MESH")
    return bpy.context.object


def combined_bounds(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    minimum = Vector((math.inf, math.inf, math.inf))
    maximum = Vector((-math.inf, -math.inf, -math.inf))
    for object_ in objects:
        object_.update_tag()
        for corner in object_.bound_box:
            world_corner = object_.matrix_world @ Vector(corner)
            minimum.x = min(minimum.x, world_corner.x)
            minimum.y = min(minimum.y, world_corner.y)
            minimum.z = min(minimum.z, world_corner.z)
            maximum.x = max(maximum.x, world_corner.x)
            maximum.y = max(maximum.y, world_corner.y)
            maximum.z = max(maximum.z, world_corner.z)
    return minimum, maximum


def center_asset(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    minimum, maximum = combined_bounds(objects)
    center = (minimum + maximum) * 0.5
    for object_ in objects:
        object_.location -= center
    bpy.context.view_layer.update()
    return combined_bounds(objects)


def point_at(object_: bpy.types.Object, target: tuple[float, float, float]) -> None:
    object_.rotation_euler = (
        Vector(target) - object_.location
    ).to_track_quat("-Z", "Y").to_euler()


def add_preview_light(
    location: tuple[float, float, float],
    energy: float,
    color: tuple[float, float, float],
    size: float,
) -> bpy.types.Object:
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.data.energy = energy
    light.data.color = color
    light.data.shape = "DISK"
    light.data.size = size
    point_at(light, (0.0, 0.0, 0.0))
    return light


def render_review_angles(
    output: Path,
    bounds: tuple[Vector, Vector],
    ground_material: bpy.types.Material,
) -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 960
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.world = bpy.data.worlds.new("Hoverboard Review World")
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.004, 0.008, 0.016, 1.0)
    background.inputs["Strength"].default_value = 0.22

    add_preview_light((3.2, -3.4, 4.6), 520, (0.58, 0.78, 1.0), 4.0)
    add_preview_light((-3.6, 1.2, 2.2), 360, (0.02, 0.72, 1.0), 3.2)
    add_preview_light((2.2, 3.2, 1.1), 280, (1.0, 0.23, 0.08), 2.4)

    minimum, maximum = bounds
    bpy.ops.mesh.primitive_plane_add(
        size=20.0,
        location=(0.0, 0.0, minimum.z - 0.035),
    )
    ground = bpy.context.object
    ground.name = "Review Ground"
    ground.data.materials.append(ground_material)

    bpy.ops.object.camera_add(location=(2.45, -3.35, 1.72))
    camera = bpy.context.object
    camera.data.lens = 58
    point_at(camera, (0.0, 0.0, -0.02))
    scene.camera = camera
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)

    ground.hide_render = True
    camera.location = (-2.3, 2.85, -1.05)
    camera.data.lens = 62
    point_at(camera, (0.0, 0.0, -0.035))
    underside_output = output.with_name(f"{output.stem}-underside{output.suffix}")
    scene.render.filepath = str(underside_output)
    bpy.ops.render.render(write_still=True)


def build_hoverboard() -> tuple[list[bpy.types.Object], tuple[Vector, Vector]]:
    bpy.ops.wm.read_factory_settings(use_empty=True)

    graphite = create_material(
        "Graphite Structure",
        (0.018, 0.024, 0.032, 1.0),
        metallic=0.72,
        roughness=0.24,
    )
    ceramic = create_material(
        "Graphite Ceramic Shell",
        (0.055, 0.067, 0.078, 1.0),
        metallic=0.18,
        roughness=0.32,
    )
    grip = create_material(
        "Matte Foot Grip",
        (0.012, 0.015, 0.018, 1.0),
        metallic=0.02,
        roughness=0.78,
    )
    edge_metal = create_material(
        "Ceramic Edge Hardware",
        (0.11, 0.13, 0.15, 1.0),
        metallic=0.55,
        roughness=0.26,
    )
    cyan = create_material(
        "Cyan Energy Channel",
        (0.0, 0.25, 0.34, 1.0),
        metallic=0.05,
        roughness=0.28,
        emission_color=(0.0, 0.62, 0.82, 1.0),
        emission_strength=1.65,
    )

    outline = [
        (-0.18, 1.10),
        (0.18, 1.10),
        (0.35, 0.94),
        (0.42, 0.61),
        (0.425, 0.12),
        (0.405, -0.48),
        (0.34, -0.86),
        (0.16, -1.08),
        (-0.16, -1.08),
        (-0.34, -0.86),
        (-0.405, -0.48),
        (-0.425, 0.12),
        (-0.42, 0.61),
        (-0.35, 0.94),
    ]
    upper_outline = [(x * 0.925, y * 0.955) for x, y in outline]

    components: list[bpy.types.Object] = []
    components.append(
        create_prism(
            "Deck Graphite Monocoque",
            outline,
            -0.062,
            0.045,
            graphite,
            bevel=0.043,
        )
    )
    components.append(
        create_prism(
            "Deck Ceramic Upper Shell",
            upper_outline,
            0.028,
            0.098,
            ceramic,
            bevel=0.034,
        )
    )

    # Two deliberate standing zones keep the object legible as a board instead
    # of a miniature spacecraft.
    pad_specs = (("Forward", 0.40, math.radians(-2.2)), ("Rear", -0.39, math.radians(2.2)))
    for label, y, rotation in pad_specs:
        components.append(
            create_beveled_box(
                f"{label} Foot Pad",
                (0.58, 0.43, 0.026),
                (0.0, y, 0.118),
                grip,
                bevel=0.065,
                rotation_z=rotation,
                segments=4,
            )
        )
        for groove_index, offset in enumerate((-0.11, 0.0, 0.11), start=1):
            components.append(
                create_beveled_box(
                    f"{label} Grip Groove {groove_index}",
                    (0.45, 0.021, 0.008),
                    (0.0, y + offset, 0.133),
                    edge_metal,
                    bevel=0.008,
                    rotation_z=rotation,
                    segments=2,
                )
            )

    # Protective nose and tail caps create a confident manufactured silhouette
    # without becoming fins, wings, wheels, or branding.
    components.append(
        create_beveled_box(
            "Nose Impact Cap",
            (0.31, 0.13, 0.07),
            (0.0, 0.986, 0.062),
            edge_metal,
            bevel=0.038,
            segments=4,
        )
    )
    components.append(
        create_beveled_box(
            "Tail Impact Cap",
            (0.29, 0.12, 0.065),
            (0.0, -0.955, 0.052),
            edge_metal,
            bevel=0.036,
            segments=4,
        )
    )

    left_channel = [
        (-0.245, 0.91, 0.103),
        (-0.335, 0.66, 0.105),
        (-0.350, 0.15, 0.106),
        (-0.332, -0.48, 0.105),
        (-0.255, -0.82, 0.102),
    ]
    right_channel = [(-x, y, z) for x, y, z in left_channel]
    components.append(
        create_channel(
            "Port Energy Channel",
            left_channel,
            cyan,
            radius=0.009,
        )
    )
    components.append(
        create_channel(
            "Starboard Energy Channel",
            right_channel,
            cyan,
            radius=0.009,
        )
    )

    # Two horizontal, flush-mounted lift pods. Their long capsules and segmented
    # lower emitters intentionally avoid the silhouette of conventional wheels.
    for side_name, x in (("Port", -0.255), ("Starboard", 0.255)):
        components.append(
            create_beveled_box(
                f"{side_name} Lift Pod Housing",
                (0.225, 0.76, 0.15),
                (x, -0.005, -0.124),
                graphite,
                bevel=0.072,
                segments=4,
            )
        )
        components.append(
            create_beveled_box(
                f"{side_name} Lift Emitter",
                (0.155, 0.565, 0.022),
                (x, -0.005, -0.213),
                cyan,
                bevel=0.058,
                segments=4,
            )
        )
        for vent_index, y in enumerate((-0.205, 0.0, 0.205), start=1):
            components.append(
                create_beveled_box(
                    f"{side_name} Emitter Divider {vent_index}",
                    (0.178, 0.034, 0.017),
                    (x, y, -0.227),
                    edge_metal,
                    bevel=0.009,
                    segments=2,
                )
            )

    bounds = center_asset(components)
    root = bpy.data.objects.new("Hoverboard Original", None)
    bpy.context.collection.objects.link(root)
    root["asset_provenance"] = "Original project asset generated procedurally in Blender"
    root["runtime_forward_axis"] = "-Z"
    root["blender_forward_axis"] = "+Y"
    root["contains_external_meshes_or_textures"] = False
    for component in components:
        component.parent = root

    bpy.context.view_layer.update()
    return components, bounds


def export_asset() -> tuple[list[bpy.types.Object], tuple[Vector, Vector]]:
    components, bounds = build_hoverboard()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT_PATH),
        export_format="GLB",
        export_apply=True,
        export_cameras=False,
        export_lights=False,
        export_yup=True,
        export_extras=True,
        export_image_format="WEBP",
        export_meshopt_compression_enable=True,
    )
    minimum, maximum = bounds
    dimensions = maximum - minimum
    faces = sum(len(component.data.polygons) for component in components)
    print(
        "HOVERBOARD_EXPORTED",
        {
            "path": str(OUTPUT_PATH),
            "objects": len(components),
            "faces": faces,
            "dimensions_blender": tuple(round(value, 4) for value in dimensions),
            "forward_blender": "+Y",
            "forward_gltf": "-Z",
        },
    )
    return components, bounds


if __name__ == "__main__":
    components, asset_bounds = export_asset()
    preview = command_line_value("--preview")
    if preview:
        review_ground = create_material(
            "Review Ground Material",
            (0.006, 0.010, 0.017, 1.0),
            metallic=0.08,
            roughness=0.55,
        )
        render_review_angles(Path(preview).resolve(), asset_bounds, review_ground)
