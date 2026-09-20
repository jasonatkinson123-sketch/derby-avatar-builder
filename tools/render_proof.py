#!/usr/bin/env python3
"""Render representative modular combinations for visual review."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUT = ROOT / "proof"
OUT.mkdir(exist_ok=True)

MARKERS = {
    "skin": ["#d99a67", "#aa6546", "#f1bd91"],
    "shirt": ["#557bb5", "#294c82", "#789bd0"],
    "hair": ["#2a252a", "#14151b", "#4a424a"],
}
SKINS = [
    ["#f3c7a6", "#ca855f", "#ffe0c4"],
    ["#d99a67", "#aa6546", "#f1bd91"],
    ["#a95f3b", "#763c2b", "#ca8259"],
    ["#633820", "#3f241c", "#865233"],
]
HAIR = [
    ["#2a252a", "#14151b", "#4a424a"],
    ["#4b2e25", "#24191a", "#765040"],
    ["#8c472b", "#48251e", "#c06d3d"],
]
HIJAB = [
    ["#62448f", "#352853", "#8c6abc"],
    ["#244d80", "#152d50", "#527cac"],
    ["#237d79", "#164c50", "#49aaa4"],
]
SHIRTS = [
    ["#214d85", "#16345f", "#4d75aa"],
    ["#198d88", "#11605e", "#43b2aa"],
    ["#e6a918", "#9a6810", "#ffd35a"],
    ["#df625b", "#993d43", "#f58c7c"],
]
BACKGROUNDS = ["#2fc5c4", "#ef7064", "#265db0", "#69d4a3"]

COMBINATIONS = [
    ("Deep curls · flute",3,"curls",0,"hoodie",3,"flute",0),
    ("Light hijab · sax",0,"hijab",1,"sweatshirt",0,"alto-sax",1),
    ("Warm pony · bass",2,"ponytail",2,"tee",2,"electric-bass",2),
    ("Medium locs · bells",1,"locs",1,"hoodie",1,"mallets-bells",3),
    ("Light curls · bells",0,"curls",1,"sweatshirt",3,"mallets-bells",2),
    ("Deep locs · sax",3,"locs",0,"tee",1,"alto-sax",3),
    ("Medium pony · flute",1,"ponytail",2,"hoodie",0,"flute",1),
    ("Warm hijab · bass",2,"hijab",0,"sweatshirt",1,"electric-bass",0),
    ("Warm curls · sax",2,"curls",0,"tee",2,"alto-sax",2),
    ("Deep hijab · flute",3,"hijab",2,"hoodie",3,"flute",3),
    ("Light pony · bells",0,"ponytail",1,"sweatshirt",2,"mallets-bells",0),
    ("Medium locs · bass",1,"locs",2,"tee",0,"electric-bass",1),
]


def rgb(hex_value):
    value = hex_value.lstrip("#")
    return tuple(int(value[i:i+2], 16) for i in (0, 2, 4))


def tinted(path, palettes=None):
    image = Image.open(ASSETS / path).convert("RGBA")
    if not palettes:
        return image
    mapping = {}
    for name, colors in palettes.items():
        for marker, target in zip(MARKERS[name], colors):
            mapping[rgb(marker)] = rgb(target)
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a and (r, g, b) in mapping:
                nr, ng, nb = mapping[(r, g, b)]
                pixels[x, y] = (nr, ng, nb, a)
    return image


def render(combo):
    _, skin, hair, hair_color, shirt, shirt_color, instrument, background = combo
    avatar = Image.new("RGBA", (128, 128), rgb(BACKGROUNDS[background]) + (255,))
    hair_palette = (HIJAB if hair == "hijab" else HAIR)[hair_color]
    hair_folder = "headwear" if hair == "hijab" else "hair"
    layers = [
        (f"{hair_folder}/{hair}-rear.png", {"hair": hair_palette}),
        (f"poses/{instrument}/rear.png", None),
        (f"clothing/{shirt}.png", {"shirt": SHIRTS[shirt_color]}),
        ("faces/base.png", {"skin": SKINS[skin]}),
        (f"{hair_folder}/{hair}-front.png", {"hair": hair_palette}),
        ("faces/features.png", None),
        (f"poses/{instrument}/arms-rear.png", {"skin": SKINS[skin], "shirt": SHIRTS[shirt_color]}),
        (f"instruments/{instrument}.png", None),
        (f"poses/{instrument}/arms-front.png", {"skin": SKINS[skin], "shirt": SHIRTS[shirt_color]}),
    ]
    for path, palettes in layers:
        avatar.alpha_composite(tinted(path, palettes))
    return avatar.convert("RGB")


def contact_sheet():
    cell_w, cell_h = 270, 292
    sheet = Image.new("RGB", (cell_w * 4 + 20, cell_h * 3 + 20), "#fffaf0")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=15)
    for index, combo in enumerate(COMBINATIONS):
        avatar = render(combo).resize((256, 256), Image.Resampling.NEAREST)
        x = 10 + (index % 4) * cell_w
        y = 10 + (index // 4) * cell_h
        sheet.paste(avatar, (x, y))
        draw.text((x, y + 262), combo[0], fill="#152a4a", font=font)
    sheet.save(OUT / "proof-contact-sheet.png")


def small_sheet(size, filename):
    gap = 8
    sheet = Image.new("RGB", (size * 4 + gap * 5, size * 3 + gap * 4), "#fffaf0")
    for index, combo in enumerate(COMBINATIONS):
        avatar = render(combo).resize((size, size), Image.Resampling.NEAREST)
        x = gap + (index % 4) * (size + gap)
        y = gap + (index // 4) * (size + gap)
        sheet.paste(avatar, (x, y))
    sheet.save(OUT / filename)


if __name__ == "__main__":
    contact_sheet()
    small_sheet(96, "classroom-cards-96.png")
    small_sheet(64, "classroom-cards-64.png")
