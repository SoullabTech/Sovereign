/**
 * Browser Detection Utilities
 * Detects browser capabilities and incompatibilities
 */

export function isIOSChrome(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isChrome = /CriOS/.test(userAgent); // Chrome on iOS uses CriOS identifier

  return isIOS && isChrome;
}

export function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/CriOS/.test(userAgent) && !/FxiOS/.test(userAgent);

  return isIOS && isSafari;
}

export function supportsWebSpeechAPI(): boolean {
  if (typeof window === 'undefined') return false;

  return !!(
    (window as any).webkitSpeechRecognition ||
    (window as any).SpeechRecognition
  );
}

/**
 * Determine if we should use Whisper (MediaRecorder) instead of Web Speech API
 * Returns true if browser doesn't reliably support Web Speech API
 */
export function shouldUseWhisper(): boolean {
  if (typeof window === 'undefined') return true;

  // iOS Chrome - Web Speech API completely broken
  if (isIOSChrome()) return true;

  // iOS Safari - Web Speech API unreliable, prefer Whisper
  if (isIOSSafari()) return true;

  // No Web Speech API support at all
  if (!supportsWebSpeechAPI()) return true;

  // Desktop browsers - Web Speech API works well
  return false;
}

export function getBrowserInfo() {
  if (typeof window === 'undefined') {
    return {
      isIOSChrome: false,
      isIOSSafari: false,
      supportsWebSpeech: false,
      shouldUseWhisper: true,
      userAgent: ''
    };
  }

  return {
    isIOSChrome: isIOSChrome(),
    isIOSSafari: isIOSSafari(),
    supportsWebSpeech: supportsWebSpeechAPI(),
    shouldUseWhisper: shouldUseWhisper(),
    userAgent: window.navigator.userAgent
  };
}
