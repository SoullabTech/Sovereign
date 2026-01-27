/**
 * Native Audio Player Stub
 * Placeholder for iOS native audio playback
 */

export function isNativeIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && (window as any).Capacitor?.isNativePlatform?.();
}

export async function nativePlayBase64(base64Audio: string): Promise<void> {
  // Stub - actual native playback would go here
  console.log('[native-audio-player] nativePlayBase64 stub called');
}
