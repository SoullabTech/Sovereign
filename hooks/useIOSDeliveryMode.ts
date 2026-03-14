'use client';

import { useMemo } from 'react';

/**
 * Detects which delivery surface MAIA is running on.
 *
 * Three device classes, each with a distinct product posture:
 *
 *   phone    — iPhone companion shell (conversation + capture, 5 core tabs)
 *   tablet   — iPad reflection shell (conversation + review, expanded tabs)
 *   desktop  — Desktop Studio (full operational shell)
 *
 * Within phone/tablet, three iOS delivery modes:
 *
 *   native   — Capacitor iOS app (full voice via native plugin)
 *   safari   — Safari browser tab (full voice via webkitSpeechRecognition)
 *   pwa      — Installed home-screen PWA (TTS output only; mic unavailable — Apple limitation)
 *
 * Usage:
 *   const { deviceClass, mode, voiceInputAvailable, isIOSPWA } = useIOSDeliveryMode();
 */

export type DeviceClass = 'phone' | 'tablet' | 'desktop';
export type DeliveryMode = 'native' | 'safari' | 'pwa' | 'web';

export interface IOSDeliveryModeResult {
  /** Broad device class for shell selection */
  deviceClass: DeviceClass;
  /** Specific delivery surface within iOS */
  mode: DeliveryMode;
  /** Whether voice input (mic) is available in this mode */
  voiceInputAvailable: boolean;
  /** True only for installed iPhone/iPad PWA (home-screen shortcut) */
  isIOSPWA: boolean;
  /** True for any iOS/iPadOS surface */
  isIOS: boolean;
  /** True for iPhone specifically */
  isPhone: boolean;
  /** True for iPad specifically */
  isTablet: boolean;
}

function detectMode(): IOSDeliveryModeResult {
  if (typeof window === 'undefined') {
    return {
      deviceClass: 'desktop',
      mode: 'web',
      voiceInputAvailable: true,
      isIOSPWA: false,
      isIOS: false,
      isPhone: false,
      isTablet: false,
    };
  }

  const ua = navigator.userAgent;

  // iPad detection: explicit iPad UA, or modern iPadOS (reports as Macintosh but has touch)
  const isIPad =
    /iPad/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

  const isIPhone = /iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isIOS = isIPhone || isIPad;

  if (!isIOS) {
    return {
      deviceClass: 'desktop',
      mode: 'web',
      voiceInputAvailable: true,
      isIOSPWA: false,
      isIOS: false,
      isPhone: false,
      isTablet: false,
    };
  }

  const deviceClass: DeviceClass = isIPad ? 'tablet' : 'phone';

  // Capacitor sets window.Capacitor on native builds
  const isNative =
    typeof (window as any).Capacitor !== 'undefined' &&
    (window as any).Capacitor?.isNativePlatform?.() === true;

  if (isNative) {
    return {
      deviceClass,
      mode: 'native',
      voiceInputAvailable: true,
      isIOSPWA: false,
      isIOS: true,
      isPhone: isIPhone,
      isTablet: isIPad,
    };
  }

  // navigator.standalone is true only when launched from the iOS/iPadOS home screen
  const isStandalone = (navigator as any).standalone === true;

  if (isStandalone) {
    return {
      deviceClass,
      mode: 'pwa',
      voiceInputAvailable: false,
      isIOSPWA: true,
      isIOS: true,
      isPhone: isIPhone,
      isTablet: isIPad,
    };
  }

  // Safari browser tab — webkitSpeechRecognition available
  return {
    deviceClass,
    mode: 'safari',
    voiceInputAvailable: true,
    isIOSPWA: false,
    isIOS: true,
    isPhone: isIPhone,
    isTablet: isIPad,
  };
}

export function useIOSDeliveryMode(): IOSDeliveryModeResult {
  // Memoised — delivery mode never changes within a session
  return useMemo(() => detectMode(), []);
}

/**
 * Standalone detector for non-hook contexts.
 */
export function getIOSDeliveryMode(): IOSDeliveryModeResult {
  return detectMode();
}
