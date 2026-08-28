// backend: app/api/sovereign/app/maia/list/__tests__/visionEphemeral.test.ts
//
// ═════════════════════════════════════════════════════════════════════════════
// VISION-EPHEMERAL-01 — source-level half
//
//   image supplied → the model receives image bytes
//   AND conversation persistence / memory / telemetry / logs contain none
//
// What this file can and cannot do:
//
//   CAN  — prove the carrier chain still has the SHAPE that makes a leak
//          impossible: that `images` is destructured OUT of the client-
//          controlled `meta` rest-spread, that the accepted images are used at
//          a known, small, enumerated set of call sites, and that they are
//          never handed to a persistence writer. This is a DRIFT ALARM: it
//          fires the moment someone changes the shape, which is precisely how
//          a 4 MB base64 field ends up in a generic logger a year from now.
//
//   CANNOT — prove absence at runtime. Only the database + log probe can do
//          that: scripts/verify-vision-ephemeral.ts, run after a real image
//          turn. See docs/ops/VISION_WITNESS_2026-08-28.md.
//
// Treat a failure here as "the invariant may have moved", not "a leak exists".
// ═════════════════════════════════════════════════════════════════════════════

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeImageAttachments } from '@/lib/ai/vision';

const ROUTE = 'app/api/sovereign/app/maia/list/route.ts';
const SERVICE = 'lib/sovereign/maiaService.ts';

const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');
const routeSrc = read(ROUTE);
const serviceSrc = read(SERVICE);

/** Lines mentioning an identifier, trimmed, for shape assertions. */
const linesWith = (src: string, ident: RegExp) =>
  src.split('\n').map(l => l.trim()).filter(l => ident.test(l) && !l.startsWith('//') && !l.startsWith('*'));

describe('VISION-EPHEMERAL-01 · boundary shape', () => {
  it('destructures `images` OUT of the meta rest-spread', () => {
    // THE load-bearing line. `meta` is the client-controlled rest-spread; it
    // reaches prompt composition and the context-inventory telemetry, both of
    // which walk its keys. If `images:` is dropped from this destructure, image
    // bytes silently ride along in meta and this test is the only thing that says so.
    const destructure = routeSrc
      .split('\n')
      .find(l => l.includes('...meta } = body'));

    expect(destructure).toBeDefined();
    expect(destructure).toContain('images: rawImages');
  });

  it('validates at the boundary rather than trusting the client', () => {
    expect(routeSrc).toContain('normalizeImageAttachments(rawImages)');
  });

  it('hands the validated images to getMaiaResponse and to nothing else', () => {
    // Enumerated on purpose. A tenth use of `visionImages` fails this test and
    // forces a human to look at what the new sink is. That is the point.
    const uses = linesWith(routeSrc, /\bvisionImages\b/);
    expect(uses.length).toBeGreaterThan(0);

    // Every use must be one of: the validated destructure, the count-only log,
    // the getMaiaResponse hand-off, or the count-only response block.
    const permitted = [
      /const \{ images: visionImages, rejections: imageRejections \} = normalizeImageAttachments\(rawImages\)/,
      /if \(visionImages\.length > 0 \|\| imageRejections\.length > 0\)/,
      /accepted: describeImagesForLog\(visionImages\)/,
      /images: visionImages,/,
      /seen: visionImages\.length,/,
    ];
    for (const use of uses) {
      expect(permitted.some(p => p.test(use))).toBe(true);
    }
  });

  it('never passes images to a persistence writer', () => {
    // The writers that put a member turn on disk. None may receive images.
    const writers = ['addConversationExchange', 'TurnsStore.addExchange', 'recordConsentState'];
    for (const src of [routeSrc, serviceSrc]) {
      for (const writer of writers) {
        const callLines = linesWith(src, new RegExp(writer.replace('.', '\\.')));
        for (const line of callLines) {
          expect(line).not.toMatch(/\bimages\b/);
          expect(line).not.toMatch(/\bvisionImages\b/);
        }
      }
    }
  });

  it('logs image metadata only, never a payload', () => {
    // Every vision log line in the carrier chain routes through
    // describeImagesForLog (count + media types + KB), never through the
    // attachment object itself.
    for (const src of [routeSrc, serviceSrc]) {
      const logLines = linesWith(src, /console\.(log|warn|error)\(.*vision/i);
      for (const line of logLines) {
        expect(line).not.toMatch(/\.data\b/);
        expect(line).not.toMatch(/JSON\.stringify\(\s*(vision)?[Ii]mages/);
      }
    }
  });

  it('has no whole-body logger that would capture the payload incidentally', () => {
    // The spectacular failure mode: a generic request logger swallowing 4 MB of
    // base64 per turn. Assert the route never stringifies or logs `body`.
    expect(routeSrc).not.toMatch(/console\.\w+\([^)]*\bJSON\.stringify\(\s*body\s*\)/);
    expect(routeSrc).not.toMatch(/console\.\w+\(\s*body\s*[,)]/);
  });
});

describe('VISION-EPHEMERAL-01 · meta cannot carry bytes', () => {
  it('leaves no image payload in meta when the route destructure runs', () => {
    // Executable mirror of the destructure above, on a body shaped like a real
    // image turn. Proves the semantics the source assertion is protecting.
    const body = {
      sessionId: 's1',
      message: 'what is in this photo?',
      images: [{ mediaType: 'image/jpeg', data: '/9j/4AAQSkZJRgABAQAAAQ==', name: 'IMG_0421.jpg' }],
      someClientExtra: 'lands-in-meta',
    };

    const { images: rawImages, sessionId: _s, message: _m, ...meta } = body as Record<string, unknown> & {
      images?: unknown; sessionId?: string; message?: string;
    };

    const serializedMeta = JSON.stringify(meta);
    expect(serializedMeta).not.toContain('/9j/');
    expect(serializedMeta).not.toContain('data');
    expect(meta).toEqual({ someClientExtra: 'lands-in-meta' });

    // …and the bytes are still available on the explicit field.
    const { images } = normalizeImageAttachments(rawImages);
    expect(images).toHaveLength(1);
    expect(images[0].data.startsWith('/9j/')).toBe(true);
  });
});
