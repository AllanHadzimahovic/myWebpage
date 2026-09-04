#!/usr/bin/env python3
"""Build a 2x2 cluster of JP / AT / ES / DK flags as a die-cut sticker.

Flag interiors keep official white; only the outer silhouette gets a white outline.
Do not run make_sticker.py on this asset — it treats near-white as fringe.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "projects"
STICKER_PATH = OUT_DIR / "project-21.png"
FLAGS_DIR = OUT_DIR / "flags"

# Official-ish colours (sRGB).
JP_RED = (188, 0, 45, 255)
AT_RED = (237, 41, 57, 255)
ES_RED = (170, 21, 27, 255)
ES_GOLD = (241, 191, 0, 255)
DK_RED = (200, 16, 46, 255)
EU_BLUE = (0, 51, 153, 255)
EU_GOLD = (255, 204, 0, 255)
WHITE = (255, 255, 255, 255)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def flag_japan(w: int, h: int) -> Image.Image:
    img = Image.new("RGBA", (w, h), WHITE)
    draw = ImageDraw.Draw(img)
    d = int(round(h * 3 / 5))
    cx, cy = w / 2, h / 2
    box = (cx - d / 2, cy - d / 2, cx + d / 2, cy + d / 2)
    draw.ellipse(box, fill=JP_RED)
    return img


def flag_austria(w: int, h: int) -> Image.Image:
    img = Image.new("RGBA", (w, h), WHITE)
    draw = ImageDraw.Draw(img)
    band = h / 3
    draw.rectangle((0, 0, w, band), fill=AT_RED)
    draw.rectangle((0, 2 * band, w, h), fill=AT_RED)
    return img


def flag_spain(w: int, h: int) -> Image.Image:
    """Civil flag (no coat of arms) — readable at sticker size."""
    img = Image.new("RGBA", (w, h), ES_GOLD)
    draw = ImageDraw.Draw(img)
    band = h / 4
    draw.rectangle((0, 0, w, band), fill=ES_RED)
    draw.rectangle((0, 3 * band, w, h), fill=ES_RED)
    return img


def flag_denmark(w: int, h: int) -> Image.Image:
    """Dannebrog 37:28 — white Nordic cross offset to the hoist."""
    img = Image.new("RGBA", (w, h), DK_RED)
    draw = ImageDraw.Draw(img)
    unit = h / 28
    t = 4 * unit
    hoist = 12 * unit
    draw.rectangle((hoist, 0, hoist + t, h), fill=WHITE)
    draw.rectangle((0, (h - t) / 2, w, (h + t) / 2), fill=WHITE)
    return img


def _star(cx: float, cy: float, outer_r: float) -> list[tuple[float, float]]:
    """Upright five-point star (points do not radiate from the circle)."""
    inner_r = outer_r * (3 - math.sqrt(5)) / 2
    pts = []
    for i in range(10):
        r = outer_r if i % 2 == 0 else inner_r
        a = -math.pi / 2 + i * math.pi / 5
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def flag_eu(w: int, h: int) -> Image.Image:
    """Council of Europe / EU flag: 12 upright gold stars on blue."""
    img = Image.new("RGBA", (w, h), EU_BLUE)
    draw = ImageDraw.Draw(img)
    cx, cy = w / 2, h / 2
    ring = h / 3
    star_r = h / 18
    for k in range(12):
        a = -math.pi / 2 + k * (2 * math.pi / 12)
        sx = cx + ring * math.cos(a)
        sy = cy + ring * math.sin(a)
        draw.polygon(_star(sx, sy, star_r), fill=EU_GOLD)
    return img


def as_rounded_flag(flag: Image.Image) -> Image.Image:
    w, h = flag.size
    radius = max(10, int(round(h * 0.12)))
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(flag, (0, 0))
    out.putalpha(rounded_mask((w, h), radius))
    return out


def die_cut(src: Image.Image, stroke_px_at_60: float = 2.6, shadow: bool = True) -> Image.Image:
    """White silhouette outline + optional shadow. Keeps interior white pixels."""
    img = src.convert("RGBA")
    bbox = img.getbbox()
    if not bbox:
        raise SystemExit("No opaque content")
    img = img.crop(bbox)

    src_side = max(img.size)
    radius = max(8, int(round(stroke_px_at_60 * src_side / 60)))
    filt = radius * 2 + 1
    if filt % 2 == 0:
        filt += 1

    pad = max(24, radius + 8)
    bw, bh = img.size
    canvas = Image.new("RGBA", (bw + pad * 2, bh + pad * 2), (0, 0, 0, 0))
    canvas.paste(img, (pad, pad), img)
    alpha = canvas.split()[-1]

    stroke_alpha = alpha.filter(ImageFilter.MaxFilter(filt)).point(lambda p: 255 if p > 20 else 0)
    white = Image.new("RGBA", canvas.size, (255, 255, 255, 255))
    white.putalpha(stroke_alpha)

    out = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    if shadow:
        shadow_a = (
            stroke_alpha.filter(ImageFilter.MaxFilter(11))
            .filter(ImageFilter.GaussianBlur(5))
            .point(lambda p: int(p * 0.4))
        )
        shade = Image.new("RGBA", canvas.size, (0, 0, 0, 255))
        shade.putalpha(shadow_a)
        out = Image.alpha_composite(out, shade)

    out = Image.alpha_composite(out, white)
    out = Image.alpha_composite(out, canvas)
    out = out.crop(out.getbbox())

    ow, oh = out.size
    side = max(ow, oh)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(out, ((side - ow) // 2, (side - oh) // 2), out)
    return square


def compose_cluster() -> Image.Image:
    # Each flag is its own mini-sticker so white fields don't melt together.
    fw, fh = 420, 280
    # Paint back-to-front: Austria, Spain, then Japan and Denmark on top.
    layers = [
        (flag_austria, 9, (0.78, 0.02)),
        (flag_spain, 6, (0.02, 0.76)),
        (flag_japan, -10, (0.0, 0.0)),
        (flag_denmark, -7, (0.76, 0.74)),
    ]

    stickers = []
    for maker, angle, _ in layers:
        mini = die_cut(as_rounded_flag(maker(fw, fh)), stroke_px_at_60=2.2, shadow=False)
        mini = mini.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
        stickers.append(mini)

    max_w = max(s.size[0] for s in stickers)
    max_h = max(s.size[1] for s in stickers)
    gap_x, gap_y = int(max_w * 0.58), int(max_h * 0.56)
    canvas = Image.new("RGBA", (max_w + gap_x + 40, max_h + gap_y + 40), (0, 0, 0, 0))

    for sticker, (_, _, (nx, ny)) in zip(stickers, layers):
        x = int(round(nx * gap_x)) + 16
        y = int(round(ny * gap_y)) + 16
        canvas.alpha_composite(sticker, (x, y))
    return canvas


def save_individual() -> None:
    FLAGS_DIR.mkdir(parents=True, exist_ok=True)
    makers = {
        "japan.png": flag_japan,
        "austria.png": flag_austria,
        "spain.png": flag_spain,
        "denmark.png": flag_denmark,
        "eu.png": flag_eu,
    }
    fw, fh = 360, 240
    for name, maker in makers.items():
        sticker = die_cut(as_rounded_flag(maker(fw, fh)))
        dest = FLAGS_DIR / name
        sticker.save(dest, optimize=True)
        print(f"saved {dest} {sticker.size}")


def main() -> None:
    save_individual()
    cluster = compose_cluster()
    sticker = die_cut(cluster)
    STICKER_PATH.parent.mkdir(parents=True, exist_ok=True)
    sticker.save(STICKER_PATH, optimize=True)
    print(f"saved {STICKER_PATH} {sticker.size}")


if __name__ == "__main__":
    main()
