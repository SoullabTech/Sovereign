import { registerPlugin } from '@capacitor/core';

export interface NativeAudioRecorderPlugin {
  /**
   * Check if audio recording is available
   */
  checkAudioPermissions(): Promise<{ granted: boolean }>;

  /**
   * Request audio recording permissions
   */
  requestAudioPermissions(): Promise<{ granted: boolean }>;

  /**
   * Start recording audio
   */
  startRecording(): Promise<void>;

  /**
   * Stop recording and get the audio data as base64
   */
  stopRecording(): Promise<{ base64Data: string; mimeType: string; duration: number }>;

  /**
   * Check if currently recording
   */
  isRecording(): Promise<{ recording: boolean }>;
}

const NativeAudioRecorder = registerPlugin<NativeAudioRecorderPlugin>('NativeAudioRecorder', {
  web: () => import('./NativeAudioRecorderWeb').then(m => new m.NativeAudioRecorderWeb()),
});

export default NativeAudioRecorder;
