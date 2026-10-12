"""Original pixel weapons and projectiles for the three Junq heroes.

Run with `python scripts/make_weapon_art.py`. All shapes use hard pixel edges.
"""
from pathlib import Path
from PIL import Image, ImageDraw

DEST = Path(__file__).resolve().parents[1] / 'src' / 'assets'
INK = '#241b23'
GOLD = '#e4b75d'
CREAM = '#fff0c7'


def canvas(name, size, paint):
    art = Image.new('RGBA', size)
    paint(ImageDraw.Draw(art))
    art.save(DEST / f'{name}.png', optimize=True)


def sword(d):
    # Handle at the hero's fist, broad steel blade raised diagonally.
    d.polygon([(10,45),(14,48),(25,38),(21,34)], fill=INK)
    d.polygon([(12,44),(14,45),(23,37),(21,36)], fill='#79502e')
    d.polygon([(18,32),(21,29),(31,41),(28,44)], fill=INK)
    d.polygon([(19,33),(21,32),(30,41),(28,42)], fill=GOLD)
    d.polygon([(20,37),(24,41),(37,22),(43,4),(31,12)], fill=INK)
    d.polygon([(23,37),(25,38),(39,13),(41,6),(33,14)], fill='#a9c0c4')
    d.polygon([(25,39),(37,23),(42,7),(40,13)], fill='#e5eee1')
    d.line([(35,15),(26,34)], fill='#f8f4de', width=2)
    d.rectangle((10,44,14,48), fill=GOLD)


def bow(d):
    # Recurved wood and a taut bright string; arrow visible in the hand.
    d.line([(16,4),(10,10),(7,19),(8,30),(12,40),(18,45)], fill=INK, width=6)
    d.line([(16,5),(12,11),(10,19),(11,29),(15,39),(18,43)], fill='#a66d34', width=3)
    d.line([(15,5),(25,25),(18,44)], fill='#f3dfad', width=1)
    d.polygon([(14,22),(20,20),(23,25),(19,30),(14,28)], fill=INK)
    d.polygon([(15,23),(20,22),(22,25),(19,28),(15,27)], fill=GOLD)
    d.line([(17,25),(43,25)], fill=INK, width=4)
    d.line([(18,25),(39,25)], fill=CREAM, width=2)
    d.polygon([(39,20),(47,25),(39,30)], fill=INK)
    d.polygon([(41,22),(46,25),(41,28)], fill='#d7dfe0')
    d.polygon([(17,25),(12,21),(13,24),(11,25),(13,27),(12,30)], fill='#e9d0a2')


def card(d, x, y, suit):
    d.rectangle((x-1,y-1,x+14,y+20), fill=INK)
    d.rectangle((x,y,x+13,y+19), fill=CREAM)
    d.rectangle((x+2,y+2,x+11,y+17), outline=GOLD, width=1)
    d.polygon([(x+7,y+7),(x+10,y+10),(x+7,y+13),(x+4,y+10)], fill=suit)
    d.point([(x+3,y+4),(x+10,y+15)], fill=suit)


def cards_hand(d):
    card(d, 4, 9, '#a1354d')
    card(d, 13, 5, '#426b8d')
    card(d, 23, 10, '#a1354d')
    d.polygon([(12,32),(16,26),(24,28),(25,34),(17,37)], fill='#d59b74')
    d.line([(11,33),(21,36)], fill=INK, width=2)


def arrow(d):
    d.line([(5,8),(35,8)], fill=INK, width=5)
    d.line([(5,8),(35,8)], fill='#b78145', width=2)
    d.polygon([(32,2),(47,8),(32,14),(35,8)], fill=INK)
    d.polygon([(35,4),(44,8),(35,12),(37,8)], fill='#d9e8d7')
    d.polygon([(3,8),(0,2),(12,6),(10,8),(12,10),(0,14)], fill='#f0d39b')
    d.line([(2,8),(11,8)], fill='#8e4c35', width=1)


canvas('weapon-sword', (50,50), sword)
canvas('weapon-bow', (50,50), bow)
canvas('weapon-cards', (39,39), cards_hand)
canvas('projectile-arrow', (48,16), arrow)
for index, hue in enumerate(('#a1354d', '#426b8d', '#688049'), 1):
    canvas(f'projectile-card-{index}', (16,22), lambda d, h=hue: card(d, 1, 1, h))
