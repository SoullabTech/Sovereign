import { WebPlugin } from '@capacitor/core';
import type { NativeAudioRecorderPlugin } from './NativeAudioRecorder';

export class NativeAudioRecorderWeb extends WebPlugin implements NativeAudioRecorderPlugin {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private stream: MediaStream | null = null;

  async checkAudioPermissions(): Promise<{ granted: boolean }> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return { granted: result.state === 'granted' };
    } catch {
      // Fallback: assume we need to request
      return { granted: false };
    }
  }

  async requestAudioPermissions(): Promise<{ granted: boolean }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return { granted: true };
    } catch (error) {
      console.error('Permission denied:', error);
      return { granted: false };
    }
  }

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
    } catch (error: any) {
      throw new Error(`Failed to start recording: ${error.message}`);
    }
  }

  async stopRecording(): Promise<{ base64Data: string; mimeType: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      const mimeType = this.mediaRecorder.mimeType;

      this.mediaRecorder.onstop = async () => {
        const duration = Date.now() - this.startTime;
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          // Remove data URL prefix
          const base64 = base64Data.split(',')[1];

          // Cleanup
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }

          resolve({
            base64Data: base64,
            mimeType,
            duration
          });
        };
        reader.onerror = () => reject(new Error('Failed to convert audio to base64'));
        reader.readAsDataURL(audioBlob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    });
  }

  async isRecording(): Promise<{ recording: boolean }> {
    return {
      recording: this.mediaRecorder !== null && this.mediaRecorder.state === 'recording'
    };
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }
}
