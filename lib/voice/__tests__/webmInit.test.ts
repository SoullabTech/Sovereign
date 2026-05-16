/**
 * Substrate-level test for the WebM EBML init-segment scanner.
 *
 * findFirstClusterOffset is the byte-boundary load-bearing layer of the
 * client-side phantom-prefix fix. The function's contract is: scan a
 * Uint8Array for the EBML Cluster element ID (0x1F 0x43 0xB6 0x75) and
 * return the offset, or -1 if absent.
 *
 * Synthetic byte arrays test the function's correctness without requiring
 * a real WebM file. Real MediaRecorder output places the Cluster ID after
 * an EBML header + Segment header section (typically tens to a few hundred
 * bytes); the structurally-realistic test below mirrors that shape.
 */
import { findFirstClusterOffset } from '../webmInit';

const CLUSTER_ID = [0x1f, 0x43, 0xb6, 0x75] as const;

const concat = (...parts: number[][]): Uint8Array => {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let i = 0;
  for (const p of parts) {
    out.set(p, i);
    i += p.length;
  }
  return out;
};

describe('findFirstClusterOffset', () => {
  describe('contract', () => {
    it('returns -1 for an empty buffer', () => {
      expect(findFirstClusterOffset(new Uint8Array(0))).toBe(-1);
    });

    it('returns -1 for a buffer shorter than the Cluster ID', () => {
      expect(findFirstClusterOffset(new Uint8Array([0x1f, 0x43, 0xb6]))).toBe(-1);
    });

    it('returns -1 when no Cluster element is present', () => {
      const buf = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01]);
      expect(findFirstClusterOffset(buf)).toBe(-1);
    });

    it('finds the Cluster ID at offset 0', () => {
      const buf = new Uint8Array([...CLUSTER_ID, 0x00, 0x00]);
      expect(findFirstClusterOffset(buf)).toBe(0);
    });

    it('finds the Cluster ID at offset N when present', () => {
      const prefix = [0xaa, 0xbb, 0xcc, 0xdd, 0xee];
      const buf = concat(prefix, [...CLUSTER_ID], [0x10, 0x20]);
      expect(findFirstClusterOffset(buf)).toBe(prefix.length);
    });

    it('finds the Cluster ID when it appears at the end of the buffer', () => {
      const prefix = new Array(40).fill(0xff);
      const buf = concat(prefix, [...CLUSTER_ID]);
      expect(findFirstClusterOffset(buf)).toBe(prefix.length);
    });

    it('returns the FIRST Cluster offset when multiple are present', () => {
      const buf = concat(
        [0x00, 0x01],
        [...CLUSTER_ID],
        [0x02, 0x03, 0x04],
        [...CLUSTER_ID],
      );
      expect(findFirstClusterOffset(buf)).toBe(2);
    });

    it('does not match a partial / truncated Cluster ID sequence', () => {
      const buf = new Uint8Array([
        0x1f, 0x43, 0xb6, 0x00,
        0x1f, 0x43, 0x00, 0x75,
        0xff,
      ]);
      expect(findFirstClusterOffset(buf)).toBe(-1);
    });
  });

  describe('structural realism (EBML-shaped buffers)', () => {
    it('extracts the offset past a plausible EBML header + Segment header section', () => {
      // EBML header element ID (0x1A 0x45 0xDF 0xA3) + tiny payload, then
      // Segment element ID (0x18 0x53 0x80 0x67) + Info/Tracks-like bytes,
      // then the Cluster ID. Bytes are not valid WebM data — they only need
      // to exercise the scanner over a header-shaped prefix.
      const ebmlHeader = [
        0x1a, 0x45, 0xdf, 0xa3,
        0x9f, 0x42, 0x86, 0x81, 0x01,
        0x42, 0xf7, 0x81, 0x01,
        0x42, 0xf2, 0x81, 0x04,
        0x42, 0xf3, 0x81, 0x08,
        0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d,
      ];
      const segmentHeader = [
        0x18, 0x53, 0x80, 0x67, 0xff,
        0x11, 0x4d, 0x9b, 0x74, 0x80,
        0x15, 0x49, 0xa9, 0x66, 0x80,
        0x16, 0x54, 0xae, 0x6b, 0x80,
      ];
      const buf = concat(ebmlHeader, segmentHeader, [...CLUSTER_ID], [0x00, 0x00]);
      const offset = findFirstClusterOffset(buf);
      expect(offset).toBe(ebmlHeader.length + segmentHeader.length);
      // Sanity: slicing at the returned offset gives a non-empty prefix and
      // the Cluster ID is the start of the remainder.
      const prefix = buf.slice(0, offset);
      const remainder = buf.slice(offset);
      expect(prefix.length).toBeGreaterThan(0);
      expect(remainder[0]).toBe(0x1f);
      expect(remainder[1]).toBe(0x43);
      expect(remainder[2]).toBe(0xb6);
      expect(remainder[3]).toBe(0x75);
    });
  });

  describe('absence integrity (load-bearing case)', () => {
    it('returns -1 (not 0, not a spurious match) for a buffer of pure zeros', () => {
      expect(findFirstClusterOffset(new Uint8Array(100))).toBe(-1);
    });

    it('returns -1 for a buffer that nearly-but-not-quite matches', () => {
      // Three of the four Cluster ID bytes in sequence, twice, but never all four.
      const buf = concat(
        [0x1f, 0x43, 0xb6, 0x74],
        [0x1f, 0x43, 0xb5, 0x75],
        [0x00],
      );
      expect(findFirstClusterOffset(buf)).toBe(-1);
    });
  });
});
