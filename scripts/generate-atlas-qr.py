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
  - Center mark is the canonical Holoflower (public/holoflower.svg), recolored
    to taupe and scaled within H-level error-correction tolerance.
  - The QR becomes part of the book design system, not a SaaS widget.

Run:
  python3 -m venv /tmp/qrvenv
  /tmp/qrvenv/bin/pip install qrcode pillow cairosvg
  /tmp/qrvenv/bin/python3 scripts/generate-atlas-qr.py
"""

from __future__ import annotations

import math
import re
import xml.sax.saxutils as xml_utils
from pathlib import Path

import cairosvg
import qrcode
from qrcode.constants import ERROR_CORRECT_H

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

# Holoflower visual scale within the cleared circle. Slightly less than the
# clear circle diameter so the holoflower's outer reach remains separated
# from the surrounding QR modules.
GLYPH_SCALE_FRACTION = 0.92

# Holoflower opacity. 1.0 = solid taupe. < 1.0 leaves the parchment field
# faintly visible through the petals — keeps the center reading as a
# breath rather than a dense seal.
GLYPH_OPACITY = 1.0

PNG_PIXELS = 3000

REPO_ROOT = Path(__file__).resolve().parent.parent
HOLOFLOWER_PATH = REPO_ROOT / "public" / "holoflower.svg"
OUTPUT_DIR = REPO_ROOT / "public" / "book-studio" / "qr"


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
    return qr.get_matrix()


# ---------------------------------------------------------------------------
# Canonical Holoflower
# ---------------------------------------------------------------------------

def load_holoflower() -> tuple[str, float, float]:
    """Read the canonical holoflower SVG, return its inner content recolored to
    taupe along with its viewBox dimensions.

    The source SVG uses fill="#FFFFFF" on every path (designed for dark
    backgrounds). We recolor each fill to taupe so the holoflower reads
    correctly on the parchment field of the QR.
    """
    raw = HOLOFLOWER_PATH.read_text(encoding="utf-8")

    # Extract viewBox dimensions.
    vb_match = re.search(r'viewBox="\s*([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s*"', raw)
    if not vb_match:
        raise RuntimeError("Could not parse viewBox from canonical holoflower.svg")
    vb_w = float(vb_match.group(3))
    vb_h = float(vb_match.group(4))

    # Pull out everything between the opening <svg> and closing </svg>.
    inner_match = re.search(r"<svg[^>]*>(.*)</svg>", raw, re.DOTALL)
    if not inner_match:
        raise RuntimeError("Could not extract inner content from canonical holoflower.svg")
    inner = inner_match.group(1)

    # Recolor: every #FFFFFF path becomes taupe. Case-insensitive across
    # 6-digit and 3-digit hex forms.
    recolored = re.sub(r'fill="#FFFFFF"', f'fill="{TAUPE}"', inner)
    recolored = re.sub(r'fill="#FFF"', f'fill="{TAUPE}"', recolored)
    recolored = re.sub(r'fill="white"', f'fill="{TAUPE}"', recolored, flags=re.IGNORECASE)

    return recolored, vb_w, vb_h


def embed_holoflower(cx: float, cy: float, max_diameter: float, content: str, vb_w: float, vb_h: float) -> str:
    """Wrap the canonical holoflower content in a <g> that:
       - centers it on (cx, cy)
       - scales it to fit within max_diameter (preserving aspect ratio)
       - applies the configured opacity
    """
    longest_side = max(vb_w, vb_h)
    scale = max_diameter / longest_side
    drawn_w = vb_w * scale
    drawn_h = vb_h * scale
    tx = cx - drawn_w / 2
    ty = cy - drawn_h / 2
    return (
        f'<g transform="translate({tx:.4f} {ty:.4f}) scale({scale:.6f})" '
        f'opacity="{GLYPH_OPACITY:.3f}">\n'
        f'    {content}\n'
        f'  </g>'
    )


# ---------------------------------------------------------------------------
# SVG
# ---------------------------------------------------------------------------

def render_svg(matrix: list[list[bool]], payload: str) -> tuple[str, int, int]:
    n = len(matrix)
    side = n + QUIET_ZONE * 2

    cx = side / 2
    cy = side / 2

    clear_radius = (n * CENTER_CLEAR_FRACTION) / 2
    glyph_diameter = clear_radius * 2 * GLYPH_SCALE_FRACTION

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

    holoflower_inner, vb_w, vb_h = load_holoflower()
    holoflower_group = embed_holoflower(cx, cy, glyph_diameter, holoflower_inner, vb_w, vb_h)

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
  {holoflower_group}
</svg>
"""
    return svg, skipped, n


# ---------------------------------------------------------------------------
# PNG (rasterized from the SVG — single source of truth)
# ---------------------------------------------------------------------------

def render_png_from_svg(svg: str, pixels: int) -> bytes:
    """Convert the generated SVG to PNG via cairosvg. Both outputs share
    the same source — the SVG — so any geometry tuning lives in one place."""
    return cairosvg.svg2png(
        bytestring=svg.encode("utf-8"),
        output_width=pixels,
        output_height=pixels,
    )


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
      <dt>Center mark</dt><dd>Canonical Holoflower (recolored taupe)</dd>
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

    png_bytes = render_png_from_svg(svg, PNG_PIXELS)
    png_path.write_bytes(png_bytes)

    html_path.write_text(
        TEST_HTML.format(
            parchment=PARCHMENT,
            taupe=TAUPE,
            url=URL,
            quiet=QUIET_ZONE,
            png=PNG_PIXELS,
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
        f"  center: canonical Holoflower (public/holoflower.svg, recolored taupe)\n"
        f"  svg:  {svg_path.relative_to(REPO_ROOT)} ({svg_path.stat().st_size} bytes)\n"
        f"  png:  {png_path.relative_to(REPO_ROOT)} ({PNG_PIXELS}x{PNG_PIXELS}, {png_path.stat().st_size} bytes)\n"
        f"  test: {html_path.relative_to(REPO_ROOT)}"
    )


if __name__ == "__main__":
    main()
