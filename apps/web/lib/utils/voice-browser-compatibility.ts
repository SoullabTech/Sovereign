/**
 * Cross-browser voice compatibility utilities
 * Ensures voice features work across Chrome, Safari, Firefox, Edge
 */

export interface BrowserVoiceCapabilities {
  hasGetUserMedia: boolean;
  hasMediaRecorder: boolean;
  supportedMimeTypes: string[];
  preferredMimeType: string;
  requiresPolyfill: boolean;
}

/**
 * Detect browser voice capabilities
 */
export function getBrowserVoiceCapabilities(): BrowserVoiceCapabilities {
  const hasGetUserMedia = !!(
    navigator.mediaDevices?.getUserMedia ||
    // @ts-ignore - Legacy APIs
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia
  );

  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';

  const supportedMimeTypes: string[] = [];
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mpeg',
    'audio/wav',
  ];

  if (hasMediaRecorder) {
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        supportedMimeTypes.push(mimeType);
      }
    }
  }

  // Determine preferred MIME type based on browser
  let preferredMimeType = supportedMimeTypes[0] || 'audio/wav';

  // Safari prefers MP4, others prefer WebM
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari && supportedMimeTypes.includes('audio/mp4')) {
    preferredMimeType = 'audio/mp4';
  }

  return {
    hasGetUserMedia,
    hasMediaRecorder,
    supportedMimeTypes,
    preferredMimeType,
    requiresPolyfill: !hasGetUserMedia || !hasMediaRecorder,
  };
}

/**
 * Get cross-browser getUserMedia function
 */
export function getCrossBrowserGetUserMedia(): (constraints: MediaStreamConstraints) => Promise<MediaStream> {
  if (navigator.mediaDevices?.getUserMedia) {
    return (constraints) => navigator.mediaDevices.getUserMedia(constraints);
  }

  // Legacy API fallback
  // @ts-ignore
  const legacyGetUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia;

  if (legacyGetUserMedia) {
    return (constraints) => {
      return new Promise((resolve, reject) => {
        legacyGetUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  throw new Error('getUserMedia not supported in this browser');
}

/**
 * Get optimized audio constraints for the current browser
 */
export function getOptimizedAudioConstraints(): MediaTrackConstraints {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

  const baseConstraints: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  // Safari doesn't always support sampleRate constraints
  if (!isSafari) {
    return {
      ...baseConstraints,
      sampleRate: 16000,
    };
  }

  return baseConstraints;
}

/**
 * Check if browser supports the required voice features
 */
export function isVoiceCompatible(): { compatible: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!navigator.mediaDevices && !navigator.getUserMedia &&
      // @ts-ignore
      !navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
    issues.push('No microphone access available');
  }

  if (typeof MediaRecorder === 'undefined') {
    issues.push('Audio recording not supported');
  }

  if (issues.length === 0 && getBrowserVoiceCapabilities().supportedMimeTypes.length === 0) {
    issues.push('No supported audio formats');
  }

  return {
    compatible: issues.length === 0,
    issues
  };
}

/**
 * Create MediaRecorder with best supported options
 */
export function createCompatibleMediaRecorder(stream: MediaStream): MediaRecorder {
  const capabilities = getBrowserVoiceCapabilities();

  try {
    // Try with preferred MIME type
    return new MediaRecorder(stream, {
      mimeType: capabilities.preferredMimeType
    });
  } catch (error) {
    console.warn('Failed to create MediaRecorder with preferred type, falling back to default:', error);

    // Fallback to basic MediaRecorder
    return new MediaRecorder(stream);
  }
}