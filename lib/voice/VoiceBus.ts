import mitt, { Emitter } from 'mitt';

/**
 * Voice Event Bus
 *
 * Central event emitter for non-blocking communication between voice layers.
 * Uses Mitt for lightweight, type-safe event passing.
 *
 * Architecture:
 * - Input Layer → emits transcript events
 * - Processing Layer → subscribes to transcripts, emits responses
 * - Output Layer → subscribes to responses, plays audio
 *
 * No layer blocks another - all communication via events.
 */

// Voice event types
export type VoiceEvent =
  | { type: 'mic_start'; timestamp: number }
  | { type: 'mic_stop'; timestamp: number }
  | { type: 'transcript_interim'; text: string; timestamp: number }
  | { type: 'transcript_complete'; text: string; timestamp: number }
  | { type: 'processing_start'; mode: 'scribe' | 'active' | 'full'; timestamp: number }
  | { type: 'processing_complete'; response: string; timestamp: number }
  | { type: 'tts_start'; text: string; timestamp: number }
  | { type: 'audio_start'; timestamp: number }
  | { type: 'audio_end'; timestamp: number }
  | { type: 'error'; error: Error; stage: string; timestamp: number }
  | { type: 'mode_switch'; mode: 'scribe' | 'active' | 'full' }
  | { type: 'interrupt'; timestamp: number }
  | { type: 'connection_open'; timestamp: number }
  | { type: 'connection_close'; timestamp: number };

// Create singleton event bus
export const voiceBus: Emitter<Record<VoiceEvent['type'], VoiceEvent>> = mitt();

/**
 * Helper: Emit event with automatic timestamp
 *
 * @example
 * emit('transcript_complete', { text: 'Hello world', timestamp: Date.now() });
 */
export function emit<T extends VoiceEvent['type']>(
  type: T,
  data: Omit<Extract<VoiceEvent, { type: T }>, 'type'>
) {
  voiceBus.emit(type, { type, ...data } as any);
}

/**
 * Helper: Type-safe subscription
 * Returns unsubscribe function
 *
 * @example
 * const unsubscribe = subscribe('transcript_complete', (event) => {
 *   console.log('Transcript:', event.text);
 * });
 *
 * // Later: cleanup
 * unsubscribe();
 */
export function subscribe<T extends VoiceEvent['type']>(
  type: T,
  handler: (event: Extract<VoiceEvent, { type: T }>) => void
) {
  voiceBus.on(type, handler as any);
  return () => voiceBus.off(type, handler as any);
}

/**
 * Helper: Subscribe to all events (for debugging/logging)
 *
 * @example
 * const unsubscribeAll = subscribeAll((type, event) => {
 *   console.log(`[VOICE_BUS] ${type}`, event);
 * });
 */
export function subscribeAll(handler: (type: string, event: any) => void) {
  voiceBus.on('*', handler);
  return () => voiceBus.off('*', handler);
}

// Debug logging (development only)
if (process.env.NODE_ENV === 'development') {
  voiceBus.on('*', (type, event) => {
    // Color-coded console logging
    const colors: Record<string, string> = {
      mic_start: '\x1b[32m', // green
      transcript_complete: '\x1b[36m', // cyan
      processing_start: '\x1b[33m', // yellow
      processing_complete: '\x1b[34m', // blue
      audio_start: '\x1b[35m', // magenta
      error: '\x1b[31m', // red
    };

    const color = colors[type as string] || '\x1b[37m'; // default white
    const reset = '\x1b[0m';

    console.log(`${color}[VOICE_BUS]${reset} ${type}`, event);
  });
}
