/**
 * IOSNativeVoiceProvider.
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
 * VOICE-RECOGNITION-ENGINE-01: `start()` accepts an engine preference
 * (`baseline` default → legacy SFSpeech; `modern` → SpeechAnalyzer where
 * supported) and a locale. Three evidence streams are exposed alongside the
 * transcript events. None of them, and no transcript event, closes the human
 * turn — that is `lib/voice/recognition/humanTurnAuthority.ts`.
 */

import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import type {
  MAIAVoiceProvider,
  VoiceState,
  VoiceTranscript,
  VoiceError,
  VoiceStartOptions,
  CaptureEvidence,
  RecognitionEvidence,
  RecognitionCapabilities,
  Unsubscribe,
} from '../contract/MAIAVoiceProvider';

type NativeEvent =
  | 'transcriptPartial'
  | 'transcriptFinal'
  | 'stateChange'
  | 'error'
  | 'captureEvidence'
  | 'recognitionEvidence'
  | 'engineSelected';

// Native plugin contract (matches Swift VoiceController)
interface VoiceControllerPlugin {
  start(options?: VoiceStartOptions): Promise<{ success: boolean; sessionId: string; engine?: string }>;
  stop(): Promise<{ success: boolean; sessionId: string }>;
  getState(): Promise<{ state: VoiceState; sessionId: string }>;
  getCapabilities(options?: VoiceStartOptions): Promise<RecognitionCapabilities>;
  requestPermission(): Promise<{ granted: boolean; status: string }>;
  addListener(eventName: NativeEvent, listenerFunc: (event: any) => void): Promise<PluginListenerHandle>;
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
  private captureHandlers = new Set<(e: CaptureEvidence) => void>();
  private recognitionHandlers = new Set<(e: RecognitionEvidence) => void>();
  private engineHandlers = new Set<(c: RecognitionCapabilities) => void>();
  private nativeListeners: PluginListenerHandle[] = [];
  private listenersWired = false;
  private lastCapabilities: RecognitionCapabilities | null = null;

  /**
   * Start a listening session. Prepares the audio session, then starts
   * recognition with the requested engine preference (default: baseline).
   */
  async start(options?: VoiceStartOptions): Promise<void> {
    await this.wireListeners();
    await AudioSessionManager.prepareForListening();
    await VoiceController.start(options ?? {});
  }

  async stop(): Promise<void> {
    await VoiceController.stop();
    await AudioSessionManager.stopAllAudio();
  }

  getState(): VoiceState {
    return this.state;
  }

  /** Capabilities reported by the most recent start(), if any. */
  getLastSelectedCapabilities(): RecognitionCapabilities | null {
    return this.lastCapabilities;
  }

  async getRecognitionCapabilities(options?: VoiceStartOptions): Promise<RecognitionCapabilities> {
    return VoiceController.getCapabilities(options ?? {});
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

  onCaptureEvidence(handler: (e: CaptureEvidence) => void): Unsubscribe {
    this.captureHandlers.add(handler);
    return () => {
      this.captureHandlers.delete(handler);
    };
  }

  onRecognitionEvidence(handler: (e: RecognitionEvidence) => void): Unsubscribe {
    this.recognitionHandlers.add(handler);
    return () => {
      this.recognitionHandlers.delete(handler);
    };
  }

  onEngineSelected(handler: (c: RecognitionCapabilities) => void): Unsubscribe {
    this.engineHandlers.add(handler);
    return () => {
      this.engineHandlers.delete(handler);
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
    this.captureHandlers.clear();
    this.recognitionHandlers.clear();
    this.engineHandlers.clear();
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
      await VoiceController.addListener('captureEvidence', (e: { evidence: CaptureEvidence }) => {
        this.captureHandlers.forEach((h) => h(e.evidence));
      }),
      await VoiceController.addListener('recognitionEvidence', (e: { evidence: RecognitionEvidence }) => {
        this.recognitionHandlers.forEach((h) => h(e.evidence));
      }),
      await VoiceController.addListener('engineSelected', (e: RecognitionCapabilities) => {
        this.lastCapabilities = e;
        this.engineHandlers.forEach((h) => h(e));
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
