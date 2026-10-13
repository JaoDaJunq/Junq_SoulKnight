#!/usr/bin/env python3
"""Build deterministic in-game Jão sprites from transparent concept atlases.

Each source atlas contains, in row-major order: idle, walk A, walk B,
and back view. Generated production frames are fitted to the existing 224x160
Jão canvas using nearest-neighbour scaling. Each pose matches the visible
height of its equivalent base Jão frame. The elemental concepts are wider and
shorter than the base sheet, so fitting them to the same width made their
in-game silhouettes visibly smaller.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "art" / "sheets"
ASSETS = ROOT / "src" / "assets"
ELEMENTS = ("earth", "water", "fire", "lightning", "light", "shadow")
ATTACK_SHEETS = {element: SHEETS / f"jao-attack-{element}-v2.png" for element in ELEMENTS}
LIGHTNING_SHEET = "jao-lightning-attunement-v2.png"
EARTH_SHEET = "jao-earth-attunement-v2.png"
FRAME_SIZE = (224, 160)
# Alpha-bounds of jao-armed, jao-walk1-armed, jao-walk2-armed and
# jao-back-armed, respectively. Keep evolved silhouettes aligned to the
# approved base model in every pose while preserving each concept's aspect.
POSE_HEIGHTS = (134, 130, 130, 134)
ANCHOR_X = 80
BASELINE_Y = 150


def make_frame(atlas: Image.Image, cell: int, columns: int = 2, target_height: int | None = None) -> Image.Image:
    width, height = atlas.size
    cell_width, cell_height = width // columns, height // 2
    x0, y0 = (cell % columns) * cell_width, (cell // columns) * cell_height
    x1 = width if cell % columns == columns - 1 else x0 + cell_width
    y1 = height if cell // columns == 1 else y0 + cell_height
    frame = atlas.crop((x0, y0, x1, y1)).convert("RGBA")
    alpha = frame.getchannel("A").point(lambda value: 255 if value >= 32 else 0)
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError(f"Empty sprite cell {cell}")
    frame = frame.crop(bounds)
    target_height = target_height or POSE_HEIGHTS[cell % len(POSE_HEIGHTS)]
    target_width = round(frame.width * target_height / frame.height)
    frame = frame.resize((target_width, target_height), Image.Resampling.NEAREST)
    if target_width > FRAME_SIZE[0]:
        raise ValueError(f"Sprite cell {cell} exceeds the gameplay canvas width: {target_width}")
    canvas = Image.new("RGBA", FRAME_SIZE, (0, 0, 0, 0))
    x = ANCHOR_X - frame.width // 2
    y = BASELINE_Y - frame.height
    canvas.alpha_composite(frame, (x, y))
    visible = canvas.getchannel("A").getbbox()
    if visible is None or visible[3] != BASELINE_Y or abs((visible[3] - visible[1]) - target_height) > 1:
        raise ValueError(f"Sprite cell {cell} lost base scale or foot alignment: {visible}")
    return canvas


def make_attack_frame(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    alpha = image.getchannel("A").point(lambda value: 255 if value >= 32 else 0)
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError(f"Empty attack pose: {source}")
    figure = image.crop(bounds)
    height = POSE_HEIGHTS[0]
    scale = height / figure.height
    width = round(figure.width * scale)
    if width > FRAME_SIZE[0]:
        scale = FRAME_SIZE[0] / figure.width
        width = FRAME_SIZE[0]
        height = round(figure.height * scale)
    if height < 118:
        raise ValueError(f"Attack pose is too wide for the character scale: {source} ({width}×{height})")
    figure = figure.resize((width, height), Image.Resampling.NEAREST)
    figure.putalpha(figure.getchannel("A").point(lambda value: 0 if value < 32 else value))
    canvas = Image.new("RGBA", FRAME_SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(figure, (ANCHOR_X - width // 2, BASELINE_Y - height))
    visible = canvas.getchannel("A").getbbox()
    if visible is None or visible[3] != BASELINE_Y:
        raise ValueError(f"Attack pose missed the shared foot baseline: {source} ({visible})")
    return canvas


def main() -> None:
    for element in ELEMENTS:
        source_name = EARTH_SHEET if element == "earth" else LIGHTNING_SHEET if element == "lightning" else f"jao-{element}-attunement.png"
        source = SHEETS / source_name
        atlas = Image.open(source).convert("RGBA")
        if element == "earth":
            if atlas.width != atlas.height * 3 // 2:
                raise ValueError(f"Expected a three-column, two-row Terra atlas: {source}")
            poses = (
                ("jao-earth-armed.png", 0, 134),
                ("jao-walk-down1-earth-armed.png", 1, 130),
                ("jao-walk-down2-earth-armed.png", 2, 130),
                ("jao-walk1-earth-armed.png", 3, 130),
                ("jao-walk2-earth-armed.png", 4, 130),
                ("jao-back-earth-armed.png", 5, 134),
            )
            frames = [make_frame(atlas, cell, columns=3, target_height=pose_height) for _, cell, pose_height in poses]
            names = tuple(name for name, _, _ in poses)
        else:
            if atlas.width != atlas.height:
                raise ValueError(f"Expected square atlas: {source}")
            frames = [make_frame(atlas, i) for i in range(4)]
            names = (
                f"jao-{element}-armed.png",
                f"jao-walk1-{element}-armed.png",
                f"jao-walk2-{element}-armed.png",
                f"jao-back-{element}-armed.png",
            )
        for name, frame in zip(names, frames):
            frame.save(ASSETS / name, optimize=True)
        attack = make_attack_frame(ATTACK_SHEETS[element])
        attack.save(ASSETS / f"jao-attack-{element}.png", optimize=True)


if __name__ == "__main__":
    main()
