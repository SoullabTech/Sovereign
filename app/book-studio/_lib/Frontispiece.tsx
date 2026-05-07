/**
 * Frontispiece — canonical contemplative threshold for the read surface.
 *
 * Sibling architecture to the canvas's Canonical Plate Mode:
 *   - canonical path (no inline hardcode at call sites)
 *   - missing-file silence (silent reserve space, never a broken-image icon)
 *   - locked render (no caption, no draggable / editorial behavior)
 *
 * F00 is the orienting field of the work — the initial cosmological breath,
 * the establishing field, the transition from ordinary reading into
 * symbolic participation. It precedes the Preface; it is not decorative.
 *
 * Drop the binary at the canonical path and it appears automatically.
 * The read surface is `force-dynamic`, so file presence is checked on
 * every request — no rebuild required.
 */

import { promises as fs } from 'fs';
import path from 'path';

const COSMOGRAM_URL = '/book-studio/figures/F00-cosmogram.png';

async function cosmogramExists(): Promise<boolean> {
  const diskPath = path.join(
    process.cwd(),
    'public',
    'book-studio',
    'figures',
    'F00-cosmogram.png',
  );
  try {
    await fs.access(diskPath);
    return true;
  } catch {
    return false;
  }
}

export default async function Frontispiece() {
  const exists = await cosmogramExists();

  // Missing-file silence: reserve respiratory whitespace before the
  // Preface even when the binary is absent, so the page rhythm is not
  // compressed during slow read while plates are still being authored.
  if (!exists) {
    return (
      <section
        className="my-16 min-h-[12rem]"
        aria-hidden="true"
        data-frontispiece="silent-reserve"
      />
    );
  }

  return (
    <section
      className="my-16 flex justify-center"
      aria-label="Frontispiece"
      data-frontispiece="canonical"
    >
      <img
        src={COSMOGRAM_URL}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="max-w-md w-full select-none pointer-events-none"
        style={{ userSelect: 'none' }}
      />
    </section>
  );
}
