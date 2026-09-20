#!/usr/bin/env python3
"""Build the aligned 128px PNG sprite library for the visual proof."""

from pathlib import Path
from PIL import Image, ImageDraw
import json

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SCALE = 2
SIZE = 64

OUTLINE = "#17243b"
INK = "#182235"
SKIN = "#d99a67"
SKIN_SHADOW = "#aa6546"
SKIN_HIGHLIGHT = "#f1bd91"
SHIRT = "#557bb5"
SHIRT_SHADOW = "#294c82"
SHIRT_HIGHLIGHT = "#789bd0"
HAIR = "#2a252a"
HAIR_SHADOW = "#14151b"
HAIR_HIGHLIGHT = "#4a424a"


def canvas():
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    return image, ImageDraw.Draw(image)


def save(image, path):
    target = ASSETS / path
    target.parent.mkdir(parents=True, exist_ok=True)
    image.resize((SIZE * SCALE, SIZE * SCALE), Image.Resampling.NEAREST).save(target)


def poly(draw, points, fill, outline=OUTLINE, width=2):
    draw.polygon(points, fill=fill)
    if outline:
        draw.line(points + [points[0]], fill=outline, width=width, joint="curve")


def line(draw, points, fill, width=2):
    draw.line(points, fill=fill, width=width, joint="curve")


def face():
    im, d = canvas()
    # neck, ears and stepped face silhouette
    poly(d, [(27,33),(37,33),(38,43),(26,43)], SKIN)
    poly(d, [(15,22),(20,20),(20,34),(15,32),(13,28)], SKIN)
    poly(d, [(49,22),(44,20),(44,34),(49,32),(51,28)], SKIN)
    poly(d, [(19,13),(25,9),(39,9),(45,13),(48,20),(47,31),(41,38),(23,38),(17,31),(16,20)], SKIN)
    d.polygon([(17,25),(20,33),(26,38),(24,34),(20,30),(20,18)], fill=SKIN_SHADOW)
    d.rectangle((41,16,44,30), fill=SKIN_HIGHLIGHT)
    d.rectangle((31,26,33,29), fill=SKIN_SHADOW)
    return im


def face_features():
    """High-contrast features sit above front hair so small cards stay readable."""
    im, d = canvas()
    d.rectangle((23,22,26,25), fill=INK)
    d.rectangle((38,22,41,25), fill=INK)
    d.point((25,23), fill="#fff4df")
    d.point((40,23), fill="#fff4df")
    d.rectangle((24,18,27,19), fill="#4d2b2a")
    d.rectangle((37,18,40,19), fill="#4d2b2a")
    line(d, [(27,31),(30,33),(35,33),(38,30)], "#7a3037", 1)
    d.point((32,33), fill="#f2a0a1")
    return im


def curls(part):
    im, d = canvas()
    if part == "rear":
        for x, y, r in [(15,15,7),(22,9,7),(31,7,8),(41,9,7),(48,15,7),(14,25,7),(49,25,7),(17,34,6),(47,34,6)]:
            d.ellipse((x-r,y-r,x+r,y+r), fill=HAIR_SHADOW, outline=OUTLINE, width=2)
    else:
        # Frame the face rather than filling its eye line.
        for x, y, r in [(17,12,6),(25,7,6),(33,6,7),(42,9,6),(48,15,6),(15,20,5),(20,14,5),(43,14,5)]:
            d.ellipse((x-r,y-r,x+r,y+r), fill=HAIR, outline=OUTLINE, width=1)
        for x, y in [(18,9),(27,5),(35,6),(42,9),(14,18),(21,12),(43,12)]:
            d.rectangle((x,y,x+3,y+2), fill=HAIR_HIGHLIGHT)
    return im


def pony(part):
    im, d = canvas()
    if part == "rear":
        poly(d, [(40,10),(51,8),(58,14),(57,25),(52,34),(45,34),(47,25),(44,19)], HAIR)
        d.rectangle((44,14,49,18), fill="#e4a72d")
        line(d, [(50,12),(55,18),(52,29)], HAIR_HIGHLIGHT, 3)
    else:
        poly(d, [(18,17),(20,11),(28,7),(41,8),(47,13),(45,20),(39,17),(34,14),(27,17),(22,23),(17,24)], HAIR)
        line(d, [(24,12),(33,9),(42,12)], HAIR_HIGHLIGHT, 3)
        poly(d, [(17,19),(22,22),(20,32),(16,30)], HAIR)
    return im


def locs(part):
    im, d = canvas()
    if part == "rear":
        for x, bottom, wiggle in [(15,43,0),(19,48,1),(23,45,0),(40,46,1),(44,49,0),(48,42,1)]:
            pts=[(x,15),(x+4,15),(x+3+wiggle,bottom),(x-1+wiggle,bottom)]
            poly(d, pts, HAIR, OUTLINE, 1)
            line(d, [(x+2,19),(x+1+wiggle,bottom-3)], HAIR_HIGHLIGHT, 1)
    else:
        poly(d, [(17,18),(19,11),(26,7),(38,7),(46,12),(48,20),(43,21),(39,16),(32,14),(25,17),(20,23)], HAIR)
        for x in [22,28,35,41]:
            line(d, [(x,10),(x-2,18)], HAIR_HIGHLIGHT, 2)
        for x, bottom in [(16,36),(19,40),(45,39),(48,35)]:
            poly(d, [(x,18),(x+4,18),(x+3,bottom),(x,bottom)], HAIR, OUTLINE, 1)
    return im


def hijab(part):
    im, d = canvas()
    if part == "rear":
        poly(d, [(18,10),(27,6),(39,7),(48,14),(51,28),(48,43),(42,51),(21,51),(15,42),(13,27)], HAIR_SHADOW)
        poly(d, [(20,12),(29,9),(39,10),(46,16),(48,29),(44,42),(39,47),(24,47),(18,40),(16,27)], HAIR)
    else:
        poly(d, [(19,13),(25,9),(39,9),(46,15),(47,28),(43,39),(38,35),(42,29),(43,18),(38,14),(27,14),(21,19),(20,30),(24,36),(20,42),(16,35),(15,24)], HAIR, OUTLINE, 2)
        line(d, [(22,13),(30,10),(39,12)], HAIR_HIGHLIGHT, 2)
        poly(d, [(19,39),(28,36),(39,37),(48,44),(45,53),(20,52),(15,45)], HAIR)
        line(d, [(22,42),(32,45),(43,42)], HAIR_HIGHLIGHT, 2)
    return im


def clothing(kind):
    im, d = canvas()
    poly(d, [(19,39),(26,35),(38,35),(46,39),(55,46),(58,64),(6,64),(9,46)], SHIRT)
    d.polygon([(7,55),(13,45),(20,41),(22,64),(7,64)], fill=SHIRT_SHADOW)
    d.polygon([(45,41),(52,46),(56,62),(49,64),(43,47)], fill=SHIRT_HIGHLIGHT)
    if kind == "tee":
        poly(d, [(25,36),(29,42),(35,42),(39,36),(36,34),(28,34)], "#f5e6cf", OUTLINE, 1)
        line(d, [(20,40),(24,46)], SHIRT_SHADOW, 2)
    elif kind == "sweatshirt":
        poly(d, [(25,35),(28,40),(36,40),(39,35),(36,34),(28,34)], SHIRT_SHADOW, OUTLINE, 1)
        line(d, [(14,54),(22,52)], SHIRT_HIGHLIGHT, 2)
        line(d, [(42,52),(50,54)], SHIRT_SHADOW, 2)
    else:
        poly(d, [(20,39),(24,33),(29,31),(35,31),(40,33),(44,39),(39,42),(36,37),(28,37),(25,42)], SHIRT_SHADOW)
        poly(d, [(27,36),(30,41),(34,41),(37,36),(35,34),(29,34)], "#dce7f5", OUTLINE, 1)
        line(d, [(30,41),(30,51)], "#e7edf5", 1)
        line(d, [(35,41),(35,51)], "#e7edf5", 1)
        poly(d, [(20,56),(44,56),(47,63),(17,63)], SHIRT_SHADOW, OUTLINE, 1)
    return im


def arm(draw, points, hand_box=None):
    poly(draw, points, SHIRT)
    # sleeve highlight follows upper edge
    line(draw, [points[0], points[1]], SHIRT_HIGHLIGHT, 2)
    if hand_box:
        x1,y1,x2,y2 = hand_box
        draw.rectangle(hand_box, fill=SKIN, outline=OUTLINE, width=2)
        draw.rectangle((x2-2,y1+1,x2-1,y2-1), fill=SKIN_HIGHLIGHT)


def pose_layers(kind):
    layers = {}
    rear, d = canvas()
    if kind == "alto-sax":
        line(d, [(25,37),(35,49),(43,37)], "#20273a", 3)
    elif kind == "electric-bass":
        line(d, [(18,39),(43,62)], "#20273a", 5)
        line(d, [(18,39),(43,62)], "#59647b", 2)
    layers["rear"] = rear

    arms_rear, d = canvas()
    if kind == "alto-sax":
        arm(d, [(11,45),(18,41),(31,48),(28,54),(18,49),(12,57)], (27,48,33,54))
    elif kind == "flute":
        arm(d, [(10,46),(17,41),(27,45),(24,51),(17,48),(13,58)], (23,44,29,50))
    elif kind == "electric-bass":
        arm(d, [(48,43),(53,47),(45,56),(39,52)], (37,49,43,55))
    else:
        arm(d, [(10,46),(17,42),(25,49),(22,55),(15,51),(12,59)], (20,47,26,53))
    layers["arms-rear"] = arms_rear

    instrument, d = canvas()
    if kind == "alto-sax":
        # mouthpiece, crook, body, bow and bell
        line(d, [(31,38),(37,39),(40,43)], "#1e2634", 3)
        line(d, [(39,42),(42,45),(41,57),(45,61)], "#b77608", 7)
        line(d, [(39,42),(42,45),(41,57),(45,61)], "#e8a916", 4)
        poly(d, [(42,58),(51,56),(56,59),(55,64),(45,64)], "#e8a916")
        poly(d, [(49,55),(57,54),(60,58),(55,60)], "#ffd85b")
        for x,y in [(39,46),(43,49),(39,52),(43,55)]:
            d.rectangle((x,y,x+2,y+2), fill="#ffe78a", outline="#7d4e08")
        line(d, [(44,45),(48,41)], "#f6ca42", 2)
    elif kind == "flute":
        line(d, [(10,46),(54,46)], OUTLINE, 6)
        line(d, [(10,45),(54,45)], "#dce8f0", 4)
        line(d, [(11,44),(53,44)], "#ffffff", 1)
        d.rectangle((10,42,15,48), fill="#c3d2de", outline=OUTLINE)
        for x in [25,31,37,43,49]:
            d.ellipse((x,43,x+3,46), fill="#75899b", outline=OUTLINE)
    elif kind == "electric-bass":
        poly(d, [(12,48),(18,42),(27,43),(31,47),(39,44),(44,49),(42,58),(34,62),(24,59),(18,64),(9,61)], "#d63b46")
        d.polygon([(12,50),(20,45),(25,46),(23,58),(14,60)], fill="#f56a68")
        poly(d, [(24,48),(33,47),(35,56),(27,58)], "#f4eee3", OUTLINE, 1)
        line(d, [(35,49),(57,31)], OUTLINE, 7)
        line(d, [(35,48),(57,30)], "#c98b4b", 4)
        poly(d, [(55,27),(62,25),(63,31),(58,34),(54,32)], "#c98b4b")
        for i in range(4):
            line(d, [(27,49+i),(60,28+i)], "#e7edf1", 1)
        for x,y in [(58,27),(61,27),(57,31),(60,31)]:
            d.rectangle((x,y,x+1,y+1), fill="#e4e9ee")
        d.rectangle((27,49,29,56), fill="#20283a")
        d.rectangle((32,48,34,55), fill="#20283a")
        d.rectangle((14,57,22,59), fill="#e7edf1")
    else:
        # compact glockenspiel tray and alternating bars
        poly(d, [(9,51),(55,51),(59,63),(5,63)], "#263850")
        for i in range(10):
            x=9+i*4
            length=8 if i in (0,1,8,9) else 10
            poly(d, [(x,53),(x+3,53),(x+2,53+length),(x-1,53+length)], "#e0e8ec", OUTLINE, 1)
            d.rectangle((x,54,x+2,55), fill="#ffffff")
        line(d, [(23,49),(18,39)], "#9c5d2d", 2)
        line(d, [(41,49),(47,39)], "#9c5d2d", 2)
        d.ellipse((15,36,21,42), fill="#287bd0", outline=OUTLINE, width=2)
        d.ellipse((44,36,50,42), fill="#287bd0", outline=OUTLINE, width=2)
        d.rectangle((17,37,19,38), fill="#77c5ff")
        d.rectangle((46,37,48,38), fill="#77c5ff")
    layers["instrument"] = instrument

    front, d = canvas()
    if kind == "alto-sax":
        arm(d, [(52,45),(55,51),(44,57),(39,53),(46,49)], (38,50,44,56))
    elif kind == "flute":
        arm(d, [(51,45),(55,50),(42,52),(36,48),(40,44)], (35,43,41,49))
    elif kind == "electric-bass":
        arm(d, [(10,47),(15,44),(28,52),(25,58),(15,53),(11,60)], (24,50,30,56))
    else:
        arm(d, [(52,46),(55,52),(45,55),(40,51),(44,47)], (39,47,45,53))
    layers["arms-front"] = front
    return layers


def main():
    save(face(), "faces/base.png")
    save(face_features(), "faces/features.png")
    for name, maker in [("curls", curls),("ponytail", pony),("locs", locs)]:
        save(maker("rear"), f"hair/{name}-rear.png")
        save(maker("front"), f"hair/{name}-front.png")
    save(hijab("rear"), "headwear/hijab-rear.png")
    save(hijab("front"), "headwear/hijab-front.png")
    for kind in ["tee","sweatshirt","hoodie"]:
        save(clothing(kind), f"clothing/{kind}.png")
    for kind in ["alto-sax","flute","electric-bass","mallets-bells"]:
        for layer, image in pose_layers(kind).items():
            folder = "instruments" if layer == "instrument" else f"poses/{kind}"
            filename = f"{kind}.png" if layer == "instrument" else f"{layer}.png"
            save(image, f"{folder}/{filename}")

    manifest = {
        "grid": {"width": 128, "height": 128, "logicalPixelScale": 2, "anchor": [0, 0]},
        "paletteMarkers": {
            "skin": [SKIN, SKIN_SHADOW, SKIN_HIGHLIGHT],
            "shirt": [SHIRT, SHIRT_SHADOW, SHIRT_HIGHLIGHT],
            "hair": [HAIR, HAIR_SHADOW, HAIR_HIGHLIGHT]
        },
        "layerOrder": ["background","hairRear","poseRear","clothing","face","hairFront","faceFeatures","armsRear","instrument","armsFront"],
        "assets": []
    }
    def add(asset_id, path, layer, poses="all", recolor="none", restrictions=None):
        manifest["assets"].append({"id": asset_id, "path": path, "layer": layer, "anchor": [0,0], "compatiblePoses": poses, "recolor": recolor, "restrictions": restrictions or []})
    add("face-base","faces/base.png","face",recolor="skin palette")
    add("face-features","faces/features.png","faceFeatures",restrictions=["draw after front hair/headwear for small-size contrast"])
    for name in ["curls","ponytail","locs"]:
        add(f"hair-{name}-rear",f"hair/{name}-rear.png","hairRear",recolor="hair palette")
        add(f"hair-{name}-front",f"hair/{name}-front.png","hairFront",recolor="hair palette")
    add("hijab-rear","headwear/hijab-rear.png","hairRear",recolor="headwear palette",restrictions=["does not use natural hair palette"])
    add("hijab-front","headwear/hijab-front.png","hairFront",recolor="headwear palette",restrictions=["does not use natural hair palette"])
    for kind in ["tee","sweatshirt","hoodie"]:
        add(f"clothing-{kind}",f"clothing/{kind}.png","clothing",recolor="shirt palette")
    for kind in ["alto-sax","flute","electric-bass","mallets-bells"]:
        add(f"{kind}-rear",f"poses/{kind}/rear.png","poseRear",[kind],"none")
        add(f"{kind}-arms-rear",f"poses/{kind}/arms-rear.png","armsRear",[kind],"skin and shirt palettes")
        add(f"instrument-{kind}",f"instruments/{kind}.png","instrument",[kind],"none")
        add(f"{kind}-arms-front",f"poses/{kind}/arms-front.png","armsFront",[kind],"skin and shirt palettes")
    (ASSETS / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    main()
