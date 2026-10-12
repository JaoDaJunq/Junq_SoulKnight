"""Derive first playable outfit forms from the approved original Jão sprites.

Only jacket pixels are recolored; face, hair, pose and transparent pixels stay intact.
Run with: python scripts/make_jao_forms.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

ASSETS = Path(__file__).resolve().parents[1] / 'src' / 'assets'
POSES = ('jao', 'jao-back', 'jao-walk1', 'jao-walk2')


def jacket(r, g, b, y):
    return 38 <= y <= 112 and 48 < r < 220 and g < r * .48 and b < r * .54 and b > g * .75


for pose in POSES:
    source = Image.open(ASSETS / f'{pose}.png').convert('RGBA')
    for form in ('fire', 'plasma'):
        image = source.copy()
        pixels = image.load()
        for y in range(image.height):
            for x in range(image.width):
                r, g, b, a = pixels[x, y]
                if a < 20 or not jacket(r, g, b, y):
                    continue
                if form == 'fire':
                    # Soot-dark coat with molten amber seams instead of a floating aura.
                    pixels[x, y] = (min(255, int(r * .8 + 56)), min(255, int(r * .46 + 13)), int(r * .12 + 4), a)
                else:
                    pixels[x, y] = (min(255, int(r * .72 + 40)), int(r * .28 + 10), min(255, int(r * .65 + 57)), a)
        # A small cloth insignia is part of the sprite itself, never a glow layer.
        draw = ImageDraw.Draw(image)
        cx = image.width // 2
        emblem = (255, 206, 81, 255) if form == 'fire' else (255, 149, 222, 255)
        if pose == 'jao-back':
            draw.polygon([(cx, 69), (cx - 4, 79), (cx, 77), (cx - 1, 86), (cx + 5, 72)], fill=emblem)
        else:
            draw.polygon([(cx - 14, 73), (cx - 18, 83), (cx - 12, 80), (cx - 15, 89), (cx - 8, 76)], fill=emblem)
        image.quantize(colors=128, method=Image.Quantize.FASTOCTREE).save(ASSETS / f'{pose}-{form}.png', optimize=True)
