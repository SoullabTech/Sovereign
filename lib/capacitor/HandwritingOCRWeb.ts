import { WebPlugin } from '@capacitor/core';
import type {
  HandwritingOCRPlugin,
  HandwritingOCRResult,
  RecognizeOptions,
  AvailabilityResult,
} from './HandwritingOCR';

/**
 * Web fallback for HandwritingOCR
 *
 * OCR is not available on web - returns empty result with guidance
 * to use iOS Live Text or Google Lens for copy-paste workflow.
 */
export class HandwritingOCRWeb extends WebPlugin implements HandwritingOCRPlugin {
  /**
   * OCR is not available on web
   */
  async isAvailable(): Promise<AvailabilityResult> {
    return {
      available: false,
      platform: 'web',
      provider: 'none',
    };
  }

  /**
   * Returns empty result - web cannot perform OCR
   *
   * The UI should detect this and show a manual paste interface
   * with guidance to use iOS Live Text or Google Lens.
   */
  async recognize(_options: RecognizeOptions): Promise<HandwritingOCRResult> {
    console.log('[HandwritingOCRWeb] OCR not available on web - use manual paste');
    return {
      text: '',
      confidence: 0,
      lineCount: 0,
      blocks: [],
    };
  }
}
