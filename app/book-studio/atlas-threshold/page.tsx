/**
 * Atlas Threshold — read-only print-proportion preview.
 *
 * The single back-matter doorway, rendered at 6×9 trim proportion
 * with the same restraint the print stylesheet applies. No editing
 * UI, no download buttons, no marketing chrome — this surface
 * exists so the threshold can be seen in flow before render.
 *
 * Per Book Studio QR Doctrine (2026-05-08):
 *   - one QR per book
 *   - at the end (back matter)
 *   - discovered, not promoted
 *   - the physical book remains sovereign
 *
 * Sovereign asset:
 *   public/book-studio/qr/qr-atlas.svg
 *   No shortener. No redirect. Direct URL only.
 *
 * Editorial slot in the manuscript: the final H1 ("Continue to
 * the Atlas") in ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md, after
 * Bibliography and Additional Resources.
 */

import { promises as fs } from 'fs';
import path from 'path';

export const metadata = {
  title: 'Atlas Threshold · The Book Studio',
};

export const dynamic = 'force-dynamic';

const QR_URL = '/book-studio/qr/qr-atlas.svg';
const QR_DISK_PATH = path.join(
  process.cwd(),
  'public',
  'book-studio',
  'qr',
  'qr-atlas.svg',
);

async function qrExists(): Promise<boolean> {
  try {
    await fs.access(QR_DISK_PATH);
    return true;
  } catch {
    return false;
  }
}

export default async function AtlasThresholdPage() {
  const exists = await qrExists();

  return (
    <div>
      <header className="mb-10">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-2">
          The Book Studio &middot; Back-Matter Threshold
        </p>
        <h1 className="text-amber-100/90 text-2xl md:text-3xl font-light tracking-wide">
          Atlas Threshold &mdash; Print Preview
        </h1>
        <p className="text-amber-200/45 text-sm font-light italic mt-1 max-w-xl">
          The single back-matter doorway. Discovered, not promoted.
          One QR per book.
        </p>
      </header>

      {/*
        6×9 print trim, proportionally scaled. Internal typography
        echoes print-book.css so the preview matches the rendered PDF
        without coupling the two. If print-book.css moves, this
        preview will visibly drift — that is intentional, so visual
        regressions are caught here before render.
      */}
      <div className="flex justify-center">
        <div
          className="bg-[#F4EBDD] shadow-2xl ring-1 ring-amber-200/15"
          style={{
            width: 'min(72vh, 26rem)',
            aspectRatio: '6 / 9',
            color: '#5e544b',
            fontFamily:
              "'Crimson Pro', 'Iowan Old Style', Georgia, serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: '38%',
          }}
          role="img"
          aria-label="Atlas threshold — print preview at 6 by 9 inch trim"
        >
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 400,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Continue to the Atlas
          </p>

          {exists ? (
            <img
              src={QR_URL}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                width: '40%',
                height: 'auto',
                margin: '4.2% 0 3.2%',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          ) : (
            // Missing-file silence: reserve the same space the QR
            // would occupy so the threshold composition reads true
            // even before the asset is on disk.
            <div
              aria-hidden="true"
              style={{
                width: '40%',
                aspectRatio: '1 / 1',
                margin: '4.2% 0 3.2%',
              }}
            />
          )}

          <p
            style={{
              fontSize: '0.6rem',
              fontStyle: 'italic',
              letterSpacing: '0.04em',
              margin: 0,
              textAlign: 'center',
            }}
          >
            soullab.life/atlas
          </p>
        </div>
      </div>

      <p className="mt-8 text-amber-200/45 text-xs font-light italic text-center max-w-xl mx-auto leading-relaxed">
        Asset:{' '}
        <code className="text-amber-300/70 not-italic">
          public/book-studio/qr/qr-atlas.svg
        </code>{' '}
        &middot; Sovereign, owned, no shortener. Per Book Studio QR
        Doctrine (2026-05-08).
      </p>
    </div>
  );
}
