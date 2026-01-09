import { registerPlugin } from '@capacitor/core';

/**
 * Result from handwriting OCR recognition
 */
export interface HandwritingOCRResult {
  /** Extracted text, lines joined by newlines */
  text: string;
  /** Mean confidence score (0-1) across all recognized lines */
  confidence: number;
  /** Number of text lines recognized */
  lineCount: number;
  /** Detailed block information (optional) */
  blocks?: Array<{
    text: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

/**
 * Options for OCR recognition
 */
export interface RecognizeOptions {
  /** Base64-encoded image (with or without data URL prefix) */
  base64: string;
  /** Language codes for recognition (default: ["en-US"]) */
  languages?: string[];
}

/**
 * Availability check result
 */
export interface AvailabilityResult {
  available: boolean;
  platform: 'ios' | 'android' | 'web';
  provider: 'vision' | 'mlkit' | 'none';
}

/**
 * HandwritingOCR Plugin Interface
 *
 * Provides on-device text recognition for handwritten journal pages.
 * iOS uses Vision framework, web falls back to manual paste.
 */
export interface HandwritingOCRPlugin {
  /**
   * Check if OCR is available on this platform
   */
  isAvailable(): Promise<AvailabilityResult>;

  /**
   * Recognize text from a base64-encoded image
   */
  recognize(options: RecognizeOptions): Promise<HandwritingOCRResult>;
}

const HandwritingOCR = registerPlugin<HandwritingOCRPlugin>('HandwritingOCR', {
  web: () => import('./HandwritingOCRWeb').then(m => new m.HandwritingOCRWeb()),
});

export default HandwritingOCR;
