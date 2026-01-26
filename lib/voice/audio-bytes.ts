/**
 * Audio Bytes Utilities
 * Helper functions for converting audio data formats
 */

/**
 * Convert ArrayBuffer to base64 string
 * Uses chunked processing to avoid call stack size exceeded errors
 * Smaller chunks reduce peak memory usage for long audio files
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 4096; // 4KB chunks - reduces peak memory

  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode.apply(null, Array.from(slice) as any);
  }

  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}
