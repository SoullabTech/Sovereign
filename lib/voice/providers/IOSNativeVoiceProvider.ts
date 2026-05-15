/**
 * IOSNativeVoiceProvider — Phase 1 minimal.
 *
 * Wraps the Swift VoiceController Capacitor plugin. Orchestrates with the
 * existing AudioSessionManager plugin (audio session category + AVAudioEngine).
 *
 * JS-side responsibilities:
 * - Translate the MAIAVoiceProvider contract into plugin calls
 * - Subscribe to native events and dispatch to handlers
 * - Track local state from stateChange events
 *
 * NOT JS responsibilities (these live in Swift VoiceController):
 * - Mic state machine
 * - Recognition lifecycle
 * - Restart timing
 * - Audio session ownership
 *
 * Phase 1 scope:
 * - start, stop
 * - transcriptPartial, transcriptFinal events
 * - stateChange, error events
 * - permission helper
 *
 * Phase 2+: continuous restart, 60-sec rotation, background/foreground.
 * Phase 3+: pauseForTTS, resumeAfterTTS, interrupt.
 */

import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import type {
  MAIAVoiceProvider,
  VoiceState,
  VoiceTranscript,
  VoiceError,
  Unsubscribe,
} from '../contract/MAIAVoiceProvider';

// Native plugin contract (matches Swift VoiceController)
interface VoiceControllerPlugin {
  start(): Promise<{ success: boolean; sessionId: string }>;
  stop(): Promise<{ success: boolean; sessionId: string }>;
  getState(): Promise<{ state: VoiceState; sessionId: string }>;
  requestPermission(): Promise<{ granted: boolean; status: string }>;
  addListener(
    eventName: 'transcriptPartial' | 'transcriptFinal' | 'stateChange' | 'error',
    listenerFunc: (event: any) => void,
  ): Promise<PluginListenerHandle>;
}

interface AudioSessionManagerPlugin {
  prepareForListening(): Promise<{ success: boolean; state: string }>;
  prepareForSpeaking(): Promise<{ success: boolean; state: string }>;
  stopAllAudio(): Promise<{ success: boolean; state: string }>;
}

const VoiceController = registerPlugin<VoiceControllerPlugin>('VoiceController');
const AudioSessionManager = registerPlugin<AudioSessionManagerPlugin>('AudioSessionManager');

export class IOSNativeVoiceProvider implements MAIAVoiceProvider {
  private state: VoiceState = 'idle';
  private partialHandlers = new Set<(t: VoiceTranscript) => void>();
  private finalHandlers = new Set<(t: VoiceTranscript) => void>();
  private stateHandlers = new Set<(s: VoiceState) => void>();
  private errorHandlers = new Set<(e: VoiceError) => void>();
  private nativeListeners: PluginListenerHandle[] = [];
  private listenersWired = false;

  /**
   * Start a listening session.
   * Phase 1: prepare audio session, then start recognition. Returns a single
   * recognition pass. Continuous restart arrives in Phase 2.
   */
  async start(): Promise<void> {
    // Wire native event listeners on first start (idempotent)
    await this.wireListeners();

    // Orchestrate: prepare audio session, then start recognition.
    // AudioSessionManager owns the audio session + engine.
    // VoiceController consumes the prepared engine to drive recognition.
    await AudioSessionManager.prepareForListening();
    await VoiceController.start();
  }

  async stop(): Promise<void> {
    await VoiceController.stop();
    await AudioSessionManager.stopAllAudio();
  }

  getState(): VoiceState {
    return this.state;
  }

  onTranscriptPartial(handler: (t: VoiceTranscript) => void): Unsubscribe {
    this.partialHandlers.add(handler);
    return () => {
      this.partialHandlers.delete(handler);
    };
  }

  onTranscriptFinal(handler: (t: VoiceTranscript) => void): Unsubscribe {
    this.finalHandlers.add(handler);
    return () => {
      this.finalHandlers.delete(handler);
    };
  }

  onStateChange(handler: (s: VoiceState) => void): Unsubscribe {
    this.stateHandlers.add(handler);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  onError(handler: (e: VoiceError) => void): Unsubscribe {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Tear down all listeners. Call on provider disposal.
   */
  async dispose(): Promise<void> {
    for (const l of this.nativeListeners) {
      try {
        await l.remove();
      } catch {
        // best-effort cleanup
      }
    }
    this.nativeListeners = [];
    this.listenersWired = false;
    this.partialHandlers.clear();
    this.finalHandlers.clear();
    this.stateHandlers.clear();
    this.errorHandlers.clear();
  }

  private async wireListeners(): Promise<void> {
    if (this.listenersWired) return;
    this.listenersWired = true;

    this.nativeListeners.push(
      await VoiceController.addListener('transcriptPartial', (e: VoiceTranscript) => {
        this.partialHandlers.forEach((h) => h(e));
      }),
      await VoiceController.addListener('transcriptFinal', (e: VoiceTranscript) => {
        this.finalHandlers.forEach((h) => h(e));
      }),
      await VoiceController.addListener('stateChange', (e: { state: VoiceState }) => {
        this.state = e.state;
        this.stateHandlers.forEach((h) => h(e.state));
      }),
      await VoiceController.addListener('error', (e: VoiceError) => {
        this.errorHandlers.forEach((h) => h(e));
      }),
    );
  }
}

/**
 * Request speech recognition permission.
 * Must be called and granted before start().
 */
export async function requestVoicePermission(): Promise<boolean> {
  const result = await VoiceController.requestPermission();
  return result.granted;
}
