/**
 * macOS Native TTS Fallback
 * Uses the built-in 'say' command for local development
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function synthesizeSpeechMacOS(text: string): Promise<Buffer> {
  const tempFile = path.join(os.tmpdir(), `maia-tts-${Date.now()}.aiff`);

  try {
    // Use macOS say command with Samantha voice
    const cleanText = text.replace(/"/g, '\\"');
    await execAsync(`say -v Samantha -o "${tempFile}" "${cleanText}"`);

    // Read the audio file
    const audioBuffer = await fs.readFile(tempFile);

    // Clean up
    await fs.unlink(tempFile).catch(() => {});

    return audioBuffer;
  } catch (error) {
    console.error('❌ [macOS TTS] Error:', error);
    throw new Error('macOS TTS synthesis failed');
  }
}
