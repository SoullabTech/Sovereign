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
  - Canonical Soullab Holoflower at center, recolored taupe, sized within
    H-level error-correction tolerance. (Source asset: public/holoflower.svg)
  - The QR becomes part of the book design system, not a SaaS widget.

Run:
  /tmp/qrvenv/bin/python3 scripts/generate-atlas-qr.py
"""

from __future__ import annotations

import math
import re
import subprocess
import xml.sax.saxutils as xml_utils
from pathlib import Path

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

# How much of the cleared circle the holoflower visually occupies. The
# holoflower is naturally circular (dotted mandala), so its bounding-box
# square fits inside the cleared circle when sized to the diameter.
HOLOFLOWER_FILL_FRACTION = 0.96
HOLOFLOWER_OPACITY = 1.0  # taupe-on-parchment reads as quiet without dimming

PNG_PIXELS = 3000

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = REPO_ROOT / "public" / "book-studio" / "qr"
HOLOFLOWER_SVG_PATH = REPO_ROOT / "public" / "holoflower.svg"


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
# Canonical Holoflower — dotted spiral mandala from public/holoflower.svg
# ---------------------------------------------------------------------------

_HOLO_VIEWBOX_RE = re.compile(r'viewBox="([^"]+)"')
_HOLO_INNER_RE = re.compile(r"<svg[^>]*>(.*)</svg>", re.DOTALL)
_HOLO_WHITE_RE = re.compile(r'fill="#[fF]{6}"')


def load_holoflower(taupe: str) -> tuple[str, str]:
    """
    Load public/holoflower.svg, extract its inner content, and recolor
    the white fills to the QR's taupe so the canonical glyph renders as
    quiet ink rather than blank parchment.

    Returns (inner_xml, viewBox).
    """
    raw = HOLOFLOWER_SVG_PATH.read_text(encoding="utf-8")

    vb_match = _HOLO_VIEWBOX_RE.search(raw)
    if not vb_match:
        raise RuntimeError(
            f"holoflower viewBox not found in {HOLOFLOWER_SVG_PATH}"
        )
    viewbox = vb_match.group(1)

    inner_match = _HOLO_INNER_RE.search(raw)
    if not inner_match:
        raise RuntimeError(
            f"could not extract inner SVG from {HOLOFLOWER_SVG_PATH}"
        )
    inner = inner_match.group(1)

    # Recolor any #FFFFFF / #ffffff fill to taupe. Leaves other fills
    # (none for this asset) untouched.
    inner = _HOLO_WHITE_RE.sub(f'fill="{taupe}"', inner)

    return inner, viewbox


# ---------------------------------------------------------------------------
# SVG
# ---------------------------------------------------------------------------

def render_svg(matrix: list[list[bool]], payload: str) -> tuple[str, int, int]:
    n = len(matrix)
    side = n + QUIET_ZONE * 2

    cx = side / 2
    cy = side / 2

    clear_radius = (n * CENTER_CLEAR_FRACTION) / 2

    # Build modules as one path with rectangular subpaths — keeps file small
    # and yields hard square corners. Skip modules whose centers fall inside
    # the clear circle so the QR matrix and the cleared region never overlap.
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

    # Canonical holoflower, recolored taupe and sized to the cleared circle.
    holo_inner, holo_viewbox = load_holoflower(TAUPE)
    holo_diameter = clear_radius * 2 * HOLOFLOWER_FILL_FRACTION
    holo_x = cx - holo_diameter / 2
    holo_y = cy - holo_diameter / 2

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
  <!-- canonical Soullab Holoflower (public/holoflower.svg), taupe -->
  <svg x="{holo_x:.3f}" y="{holo_y:.3f}"
       width="{holo_diameter:.3f}" height="{holo_diameter:.3f}"
       viewBox="{holo_viewbox}"
       preserveAspectRatio="xMidYMid meet"
       opacity="{HOLOFLOWER_OPACITY}"
       shape-rendering="geometricPrecision">
{holo_inner}
  </svg>
</svg>
"""
    return svg, skipped, n


# ---------------------------------------------------------------------------
# PNG (rasterized via sharp — Node — so the embedded holoflower SVG renders
# faithfully. Python alternatives (PIL, cairosvg) either can't read SVG or
# require system cairo; sharp is already a project dependency.)
# ---------------------------------------------------------------------------

SHARP_RASTER_SCRIPT = """
const sharp = require('sharp');
const [svgPath, pngPath, sizeStr] = process.argv.slice(-3);
const size = parseInt(sizeStr, 10);
sharp(svgPath, { density: 600 })
  .resize(size, size, { fit: 'contain', background: { r: 244, g: 235, b: 221 } })
  .flatten({ background: '#F4EBDD' })
  .png({ compressionLevel: 9, palette: false })
  .toFile(pngPath)
  .then(info => {
    process.stdout.write(JSON.stringify({ width: info.width, height: info.height, size: info.size }));
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
"""


def rasterize_svg_to_png(svg_path: Path, png_path: Path, size: int) -> dict:
    """Use sharp (via Node) to rasterize the SVG to a print-scale PNG."""
    result = subprocess.run(
        [
            "node",
            "-e",
            SHARP_RASTER_SCRIPT,
            str(svg_path),
            str(png_path),
            str(size),
        ],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    import json
    return json.loads(result.stdout)


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
      <dt>Center mark</dt><dd>Canonical Soullab Holoflower (taupe)</dd>
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

    if not HOLOFLOWER_SVG_PATH.exists():
        raise FileNotFoundError(
            f"Canonical holoflower asset not found at {HOLOFLOWER_SVG_PATH}"
        )

    matrix = build_matrix(URL)
    svg, skipped, n = render_svg(matrix, URL)

    svg_path = OUTPUT_DIR / "qr-atlas.svg"
    png_path = OUTPUT_DIR / "qr-atlas.png"
    html_path = OUTPUT_DIR / "test.html"

    svg_path.write_text(svg, encoding="utf-8")
    png_info = rasterize_svg_to_png(svg_path, png_path, PNG_PIXELS)

    html_path.write_text(
        TEST_HTML.format(
            parchment=PARCHMENT,
            taupe=TAUPE,
            url=URL,
            quiet=QUIET_ZONE,
            png=png_info["width"],
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
        f"  center glyph: canonical Soullab Holoflower, taupe\n"
        f"  svg:  {svg_path.relative_to(REPO_ROOT)} ({svg_path.stat().st_size} bytes)\n"
        f"  png:  {png_path.relative_to(REPO_ROOT)} "
        f"({png_info['width']}x{png_info['height']}, {png_info['size']} bytes)\n"
        f"  test: {html_path.relative_to(REPO_ROOT)}"
    )


if __name__ == "__main__":
    main()
