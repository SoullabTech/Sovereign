#!/usr/bin/env python3
"""
Generate a print-quality, sovereign QR code for the Elemental Alchemy book.

Produces:
  public/book-studio/qr/qr-atlas.svg    (vector, print-ready)
  public/book-studio/qr/qr-atlas.png    (3000px raster, print-ready)
  public/book-studio/qr/test.html       (scan verification page)

Design principles:
  - Static QR encoding the canonical URL only — no redirect, no shortener, no third party.
  - Square modules. No rounded corners. No frame. No scan label.
  - Parchment background, taupe geometry.
  - Subtle holoflower glyph at center, sized within H-level error-correction tolerance.
  - The QR becomes part of the book design system, not a SaaS widget.

Run:
  /tmp/qrvenv/bin/python3 scripts/generate-atlas-qr.py
"""

from __future__ import annotations

import math
import os
import xml.sax.saxutils as xml_utils
from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

URL = "https://soullab.life/atlas"

PARCHMENT = "#F4EBDD"
TAUPE = "#5E544B"

# SVG canvas: 1 logical unit per QR module. Quiet zone = 4 modules per QR spec.
QUIET_ZONE = 4

# Center occlusion: fraction of QR side cleared for the holoflower glyph.
# H-level error correction tolerates ~30% damage. We clear < 17% of area
# (≈ 0.20 of side, π/4 of that as a circle ≈ 12.5% of total area).
CENTER_CLEAR_FRACTION = 0.20

# Holoflower geometry inside the cleared circle.
GLYPH_OUTER_RING_FRACTION = 0.94   # of clear circle radius
GLYPH_INNER_RING_FRACTION = 0.46
GLYPH_PETAL_RADIUS_FRACTION = 0.13  # of clear circle radius — petal dot size
GLYPH_PETAL_ORBIT_FRACTION = 0.66   # how far petal centers sit from center
GLYPH_CENTER_DOT_FRACTION = 0.12

PNG_PIXELS = 3000

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "book-studio" / "qr"


# ---------------------------------------------------------------------------
# QR matrix
# ---------------------------------------------------------------------------

def build_matrix(payload: str) -> list[list[bool]]:
    """Build the QR module matrix at H-level error correction."""
    qr = qrcode.QRCode(
        version=None,                       # auto
        error_correction=ERROR_CORRECT_H,   # 30% recovery — required for center glyph
        box_size=1,
        border=0,                           # quiet zone added explicitly in SVG
    )
    qr.add_data(payload)
    qr.make(fit=True)
    matrix = qr.get_matrix()
    return matrix


# ---------------------------------------------------------------------------
# Holoflower glyph
# ---------------------------------------------------------------------------

def holoflower_svg(cx: float, cy: float, r: float) -> str:
    """A small monastic flower-of-life glyph centered at (cx, cy), radius r.

    Composition (parchment-on-taupe):
      - thin outer ring
      - thin inner ring
      - 6 petal dots arranged on a hexagon
      - center dot
    """
    parts: list[str] = []

    outer_r = r * GLYPH_OUTER_RING_FRACTION
    inner_r = r * GLYPH_INNER_RING_FRACTION
    petal_orbit = r * GLYPH_PETAL_ORBIT_FRACTION
    petal_r = r * GLYPH_PETAL_RADIUS_FRACTION
    center_r = r * GLYPH_CENTER_DOT_FRACTION

    # Hairline strokes scale with the cleared radius so they read at any output size.
    hairline = max(r * 0.018, 0.04)

    parts.append(
        f'<circle cx="{cx:.3f}" cy="{cy:.3f}" r="{outer_r:.3f}" '
        f'fill="none" stroke="{TAUPE}" stroke-width="{hairline:.3f}"/>'
    )
    parts.append(
        f'<circle cx="{cx:.3f}" cy="{cy:.3f}" r="{inner_r:.3f}" '
        f'fill="none" stroke="{TAUPE}" stroke-width="{hairline:.3f}"/>'
    )

    for i in range(6):
        angle = -math.pi / 2 + i * (math.pi / 3)  # start at top, six points
        px = cx + petal_orbit * math.cos(angle)
        py = cy + petal_orbit * math.sin(angle)
        parts.append(
            f'<circle cx="{px:.3f}" cy="{py:.3f}" r="{petal_r:.3f}" fill="{TAUPE}"/>'
        )

    parts.append(
        f'<circle cx="{cx:.3f}" cy="{cy:.3f}" r="{center_r:.3f}" fill="{TAUPE}"/>'
    )

    return "\n  ".join(parts)


# ---------------------------------------------------------------------------
# SVG
# ---------------------------------------------------------------------------

def render_svg(matrix: list[list[bool]], payload: str) -> str:
    n = len(matrix)
    side = n + QUIET_ZONE * 2

    cx = side / 2
    cy = side / 2

    clear_radius = (n * CENTER_CLEAR_FRACTION) / 2

    # Build modules as one path with rectangular subpaths — keeps file small and
    # yields hard square corners. Skip modules whose centers fall inside the
    # clear circle so the QR matrix and the cleared region never overlap.
    rects: list[str] = []
    skipped = 0
    for r_idx, row in enumerate(matrix):
        for c_idx, bit in enumerate(row):
            if not bit:
                continue
            mx = QUIET_ZONE + c_idx + 0.5
            my = QUIET_ZONE + r_idx + 0.5
            if math.hypot(mx - cx, my - cy) < clear_radius:
                skipped += 1
                continue
            x = QUIET_ZONE + c_idx
            y = QUIET_ZONE + r_idx
            rects.append(f"M{x},{y}h1v1h-1z")

    payload_safe = xml_utils.escape(payload)

    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 {side} {side}"
     shape-rendering="crispEdges"
     role="img"
     aria-label="QR code linking to {payload_safe}">
  <title>{payload_safe}</title>
  <rect width="100%" height="100%" fill="{PARCHMENT}"/>
  <path d="{''.join(rects)}" fill="{TAUPE}"/>
  <!-- holoflower clear zone -->
  <circle cx="{cx:.3f}" cy="{cy:.3f}" r="{clear_radius:.3f}" fill="{PARCHMENT}"/>
  {holoflower_svg(cx, cy, clear_radius)}
</svg>
"""
    return svg, skipped, n


# ---------------------------------------------------------------------------
# PNG (rasterized directly from the matrix — no SVG→PNG dependency)
# ---------------------------------------------------------------------------

def render_png(matrix: list[list[bool]], pixels: int) -> Image.Image:
    n = len(matrix)
    side_modules = n + QUIET_ZONE * 2

    # Choose integer module size so the QR grid stays pixel-perfect, then
    # center within the requested canvas (parchment around it).
    module_px = max(1, pixels // side_modules)
    qr_px = module_px * side_modules
    canvas_px = max(qr_px, pixels)

    img = Image.new("RGB", (canvas_px, canvas_px), PARCHMENT)
    draw = ImageDraw.Draw(img)

    offset = (canvas_px - qr_px) // 2
    cx = offset + (QUIET_ZONE + n / 2) * module_px
    cy = cx
    clear_radius_px = (n * CENTER_CLEAR_FRACTION / 2) * module_px

    for r_idx, row in enumerate(matrix):
        for c_idx, bit in enumerate(row):
            if not bit:
                continue
            x0 = offset + (QUIET_ZONE + c_idx) * module_px
            y0 = offset + (QUIET_ZONE + r_idx) * module_px
            mxc = x0 + module_px / 2
            myc = y0 + module_px / 2
            if math.hypot(mxc - cx, myc - cy) < clear_radius_px:
                continue
            draw.rectangle([x0, y0, x0 + module_px - 1, y0 + module_px - 1], fill=TAUPE)

    # Holoflower over the clear zone.
    outer_r = clear_radius_px * GLYPH_OUTER_RING_FRACTION
    inner_r = clear_radius_px * GLYPH_INNER_RING_FRACTION
    petal_orbit = clear_radius_px * GLYPH_PETAL_ORBIT_FRACTION
    petal_r = clear_radius_px * GLYPH_PETAL_RADIUS_FRACTION
    center_r = clear_radius_px * GLYPH_CENTER_DOT_FRACTION
    hairline = max(int(round(clear_radius_px * 0.025)), 2)

    def circle(cx_, cy_, rad, fill=None, outline=None, width=1):
        draw.ellipse(
            [cx_ - rad, cy_ - rad, cx_ + rad, cy_ + rad],
            fill=fill,
            outline=outline,
            width=width,
        )

    circle(cx, cy, outer_r, outline=TAUPE, width=hairline)
    circle(cx, cy, inner_r, outline=TAUPE, width=hairline)
    for i in range(6):
        angle = -math.pi / 2 + i * (math.pi / 3)
        px = cx + petal_orbit * math.cos(angle)
        py = cy + petal_orbit * math.sin(angle)
        circle(px, py, petal_r, fill=TAUPE)
    circle(cx, cy, center_r, fill=TAUPE)

    return img


# ---------------------------------------------------------------------------
# Test HTML
# ---------------------------------------------------------------------------

TEST_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>QR · Atlas</title>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    :root {{
      --parchment: {parchment};
      --taupe: {taupe};
    }}
    html, body {{
      margin: 0;
      padding: 0;
      background: #fafafa;
      color: var(--taupe);
      font-family: ui-serif, "Iowan Old Style", "Apple Garamond", "Baskerville", Georgia, serif;
    }}
    main {{
      max-width: 720px;
      margin: 0 auto;
      padding: 56px 32px 96px;
    }}
    .frame {{
      background: var(--parchment);
      padding: 56px;
      border-radius: 2px;
      box-shadow: 0 1px 0 rgba(0,0,0,0.04);
      display: flex;
      justify-content: center;
    }}
    .frame img {{
      width: 320px;
      height: 320px;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }}
    h1 {{ font-weight: 400; font-size: 18px; letter-spacing: 0.06em; text-transform: uppercase; margin: 48px 0 8px; }}
    p  {{ font-size: 15px; line-height: 1.6; max-width: 56ch; }}
    code {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }}
    .meta {{ margin-top: 32px; font-size: 13px; opacity: 0.75; }}
    .meta dt {{ float: left; width: 9rem; opacity: 0.7; }}
    .meta dd {{ margin: 0 0 6px 0; }}
    .meta dd::after {{ content: ""; display: block; clear: both; }}
  </style>
</head>
<body>
  <main>
    <div class="frame">
      <img src="qr-atlas.svg" alt="QR linking to {url}"/>
    </div>
    <h1>Soullab Press · Atlas</h1>
    <p>Scan the mark above to verify it resolves to <code>{url}</code>. The same vector is used for print; the PNG export is provided only as a fallback for tools that require raster.</p>
    <dl class="meta">
      <dt>Encoding</dt><dd>Static · ECC level H (≈ 30% recovery)</dd>
      <dt>Background</dt><dd>{parchment}</dd>
      <dt>Foreground</dt><dd>{taupe}</dd>
      <dt>Quiet zone</dt><dd>{quiet} modules</dd>
      <dt>Center mark</dt><dd>Holoflower glyph (within H-level tolerance)</dd>
      <dt>Vector</dt><dd><a href="qr-atlas.svg">qr-atlas.svg</a></dd>
      <dt>Raster</dt><dd><a href="qr-atlas.png">qr-atlas.png</a> · {png}px</dd>
    </dl>
  </main>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    matrix = build_matrix(URL)
    svg, skipped, n = render_svg(matrix, URL)

    svg_path = OUTPUT_DIR / "qr-atlas.svg"
    png_path = OUTPUT_DIR / "qr-atlas.png"
    html_path = OUTPUT_DIR / "test.html"

    svg_path.write_text(svg, encoding="utf-8")

    img = render_png(matrix, PNG_PIXELS)
    img.save(png_path, "PNG", optimize=True)

    html_path.write_text(
        TEST_HTML.format(
            parchment=PARCHMENT,
            taupe=TAUPE,
            url=URL,
            quiet=QUIET_ZONE,
            png=img.size[0],
        ),
        encoding="utf-8",
    )

    total_modules = n * n
    occlusion_pct = 100 * skipped / total_modules
    print(
        f"QR generated for {URL}\n"
        f"  matrix: {n}x{n} modules ({total_modules} total)\n"
        f"  cleared modules under glyph: {skipped} ({occlusion_pct:.1f}%)\n"
        f"  ECC level: H (30% recovery — well within tolerance)\n"
        f"  svg:  {svg_path.relative_to(OUTPUT_DIR.parent.parent)} ({svg_path.stat().st_size} bytes)\n"
        f"  png:  {png_path.relative_to(OUTPUT_DIR.parent.parent)} ({img.size[0]}x{img.size[1]}, {png_path.stat().st_size} bytes)\n"
        f"  test: {html_path.relative_to(OUTPUT_DIR.parent.parent)}"
    )


if __name__ == "__main__":
    main()
