#!/usr/bin/env python3
"""Build deterministic in-game Jão sprites from 2x2 transparent concept atlases.

Each source atlas contains, in row-major order: idle, walk A, walk B,
and back view. Generated production frames are fitted to the existing 224x160
Jão canvas using nearest-neighbour scaling.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "art" / "sheets"
ASSETS = ROOT / "src" / "assets"
ELEMENTS = ("earth", "water", "fire", "lightning", "light", "shadow")
FRAME_SIZE = (224, 160)
MAX_SPRITE = (106, 134)
ANCHOR_X = 80
BASELINE_Y = 150


def make_frame(atlas: Image.Image, cell: int) -> Image.Image:
    width, height = atlas.size
    x0, y0 = (cell % 2) * (width // 2), (cell // 2) * (height // 2)
    x1 = width if cell % 2 else width // 2
    y1 = height if cell // 2 else height // 2
    frame = atlas.crop((x0, y0, x1, y1)).convert("RGBA")
    alpha = frame.getchannel("A")
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError(f"Empty sprite cell {cell}")
    frame = frame.crop(bounds)
    frame.thumbnail(MAX_SPRITE, Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", FRAME_SIZE, (0, 0, 0, 0))
    x = ANCHOR_X - frame.width // 2
    y = BASELINE_Y - frame.height
    canvas.alpha_composite(frame, (x, y))
    return canvas


def main() -> None:
    for element in ELEMENTS:
        source = SHEETS / f"jao-{element}-attunement.png"
        atlas = Image.open(source).convert("RGBA")
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
        # The active slash pose reuses the second distinct step; combat trails
        # and elemental geometry are rendered separately in the scene.
        frames[2].save(ASSETS / f"jao-attack-{element}.png", optimize=True)


if __name__ == "__main__":
    main()
