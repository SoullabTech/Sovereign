/**
 * WebM EBML init-segment helpers.
 *
 * A MediaRecorder's first dataavailable chunk contains an EBML/Segment header
 * (codec info, stream metadata) followed by the first Cluster of audio. Later
 * chunks are Cluster-only — they cannot be decoded standalone, so the init
 * segment must be prepended to them.
 *
 * The init segment is everything BEFORE the first Cluster element. Storing the
 * full first chunk and prepending it (header + audio) causes upstream Whisper
 * to re-transcribe the prefix audio on every later chunk — the source of the
 * phantom-prefix contamination this module exists to prevent.
 *
 * EBML Cluster element ID = 0x1F 0x43 0xB6 0x75.
 */

/**
 * Find the byte offset of the first EBML Cluster element in a WebM buffer.
 * Returns -1 if the Cluster element ID is not found.
 */
export function findFirstClusterOffset(buf: Uint8Array): number {
  if (buf.length < 4) return -1;
  for (let i = 0; i <= buf.length - 4; i++) {
    if (
      buf[i] === 0x1f &&
      buf[i + 1] === 0x43 &&
      buf[i + 2] === 0xb6 &&
      buf[i + 3] === 0x75
    ) {
      return i;
    }
  }
  return -1;
}
