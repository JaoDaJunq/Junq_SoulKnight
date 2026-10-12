"""Extract compact, aligned PNG sprites from the approved character sheets.

The compact transparent source sheets are in art/sheets. The game uses only the
generated PNGs in src/assets. Run with: python scripts/build_approved_sprites.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art' / 'sheets'
DEST = ROOT / 'src' / 'assets'
CANVAS = (224, 160)
ANCHOR_X = 80
BOTTOM = 150
SOURCE_SCALE = .5  # source sheets were reduced from their generation size

# Horizontal boundaries separate the figures; character centers stabilize the
# body's position even while an attack extends a bow, card or sword to the right.
SHEETS = {
    'jao': {'scale': .25, 'frames': [(62,423,240),(446,901,720),(952,1734,1180),(1792,2083,1937)]},
    'alice': {'scale': .19, 'frames': [(47,452,246),(494,952,730),(990,1592,1210),(1619,1949,1782)]},
    'gui': {'scale': .216, 'frames': [(56,409,240),(519,973,742),(1051,1757,1260),(1790,2148,1958)]},
}
ALTERNATE = {
    'jao': (760, .1415),
    'alice': (570, .1057),
    'gui': (560, .1030),
}
FRAMES = ('front', 'walk1', 'attack', 'back')


def extract(sheet, bounds, scale):
    left, right, center = (round(value * SOURCE_SCALE) for value in bounds)
    scale /= SOURCE_SCALE
    strip = sheet.crop((left, 0, right+1, sheet.height))
    alpha = strip.getchannel('A').point(lambda p: 255 if p >= 60 else 0)
    box = alpha.getbbox()
    if not box:
        raise ValueError(f'Empty sprite at {bounds}')
    cropped = strip.crop(box)
    width = round(cropped.width * scale)
    height = round(cropped.height * scale)
    figure = cropped.resize((width, height), Image.Resampling.LANCZOS)
    # Crisp outer silhouette without matte from nearly transparent edge pixels.
    figure.putalpha(figure.getchannel('A').point(lambda p: 0 if p < 32 else p))
    canvas = Image.new('RGBA', CANVAS)
    x = round(ANCHOR_X - (center - left - box[0]) * scale)
    canvas.alpha_composite(figure, (x, BOTTOM-height))
    return canvas


def evolved_jao(image, form):
    image = image.copy()
    pixels = image.load()
    for y in range(48, 116):
        for x in range(18, 145):
            r,g,b,a = pixels[x,y]
            if a < 80 or not (45 < r < 200 and 15 < g < 90 and 18 < b < 105 and r > g*1.45 and r > b*1.4):
                continue
            if form == 'fire':
                pixels[x,y] = (min(255,int(r*.85+32)), int(g*.63+11), int(b*.43+5), a)
            else:
                pixels[x,y] = (min(255,int(r*.67+30)), int(g*.63+8), min(255,int(b*1.18+56)), a)
    # Tiny insignia fixed to the jacket; no floating aura obscures the grip.
    return image


def alternate_step(hero):
    image = Image.open(SOURCE / f'{hero}-walk2.webp').convert('RGBA')
    alpha = image.getchannel('A').point(lambda p: 255 if p >= 170 else 0)
    box = alpha.getbbox()
    if not box:
        raise ValueError(f'Empty alternate walk for {hero}')
    figure = image.crop(box)
    center, scale = ALTERNATE[hero]
    center = round(center * SOURCE_SCALE)
    scale /= SOURCE_SCALE
    figure = figure.resize((round(figure.width*scale),round(figure.height*scale)),Image.Resampling.LANCZOS)
    figure.putalpha(figure.getchannel('A').point(lambda p: 0 if p < 150 else p))
    canvas = Image.new('RGBA', CANVAS)
    canvas.alpha_composite(figure,(round(ANCHOR_X-(center-box[0])*scale), BOTTOM-figure.height))
    return canvas


def save(image, filename):
    image.save(DEST / f'{filename}.png', optimize=True)


for hero, spec in SHEETS.items():
    sheet = Image.open(SOURCE / f'{hero}.webp').convert('RGBA')
    frames = {name: extract(sheet, box, spec['scale']) for name,box in zip(FRAMES,spec['frames'])}
    frames['walk2'] = alternate_step(hero)
    for pose, image in frames.items():
        stem = hero if pose == 'front' else f'{hero}-{pose}'
        save(image, f'{stem}-armed' if pose != 'attack' else stem)
        if hero == 'jao':
            for form in ('fire','plasma'):
                save(evolved_jao(image, form), f'{stem}-{form}-armed' if pose != 'attack' else f'{stem}-{form}')
    # Selection portrait has a compact canvas; gameplay frames keep extra
    # transparent room for the right-facing attack without scaling the body.
    save(frames['front'].crop((0,0,160,160)), f'{hero}-select')
