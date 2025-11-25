/**
 * Voice Utilities - Compatibility layer for original MAIA
 * Provides voice transcript and speech functionality
 */

import { mayaSpeak } from './maya-voice';

/**
 * Get voice transcript (placeholder for compatibility)
 * In the original MAIA, this would provide speech-to-text functionality
 */
export async function getVoiceTranscript(): Promise<string> {
  // For now, return empty string - this can be enhanced later
  // with actual speech recognition if needed
  console.log('Voice transcript functionality not yet implemented');
  return '';
}

/**
 * Speak text using Maya's voice system
 */
export async function speakText(text: string): Promise<void> {
  return mayaSpeak(text);
}

/**
 * Check if speech recognition is available
 */
export function isSpeechRecognitionAvailable(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechSynthesisAvailable(): boolean {
  return 'speechSynthesis' in window;
}