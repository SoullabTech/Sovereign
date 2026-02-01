/**
 * Voice Handlers - Orchestration layer for voice services
 *
 * Routes lazy-import these handlers to avoid module-load issues
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE LIST HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * List available voices
 */
export async function listVoicesHandler() {
  // These are the OpenAI TTS voices available
  const openaiVoices = [
    { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
    { id: 'echo', name: 'Echo', description: 'Warm and friendly' },
    { id: 'fable', name: 'Fable', description: 'Expressive and dynamic' },
    { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
    { id: 'nova', name: 'Nova', description: 'Soft and gentle' },
    { id: 'shimmer', name: 'Shimmer', description: 'Clear and bright' },
  ];

  // Check if OpenAI is available
  const hasOpenAI = !!process.env.OPENAI_API_KEY &&
    !process.env.OPENAI_API_KEY.includes('placeholder');

  // macOS fallback voice
  const macosVoice = {
    id: 'samantha',
    name: 'Samantha (macOS)',
    description: 'Local macOS voice - no API required',
  };

  return {
    ok: true,
    voices: hasOpenAI ? openaiVoices : [macosVoice],
    provider: hasOpenAI ? 'openai' : 'macos',
    note: hasOpenAI
      ? 'OpenAI TTS available'
      : 'Using macOS fallback - set OPENAI_API_KEY for premium voices',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE TRANSCRIBE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

const TranscribeInputSchema = z.object({
  userId: z.string().min(1),
  audioBase64: z.string().optional(),
  audioUrl: z.string().optional(),
  language: z.string().default('en'),
});

/**
 * Transcribe audio to text
 * Currently returns placeholder - implement with Whisper when needed
 */
export async function transcribeHandler(formData: FormData) {
  const file = formData.get('file') as File | null;
  const userId = formData.get('userId') as string | null;

  if (!file) {
    throw new Error('No audio file provided');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  // Check if OpenAI Whisper is available
  const hasOpenAI = !!process.env.OPENAI_API_KEY &&
    !process.env.OPENAI_API_KEY.includes('placeholder');

  if (!hasOpenAI) {
    // Return guidance for client-side fallback
    return {
      ok: false,
      error: 'Server-side transcription requires OpenAI API key',
      suggestion: 'Use browser Web Speech API for transcription',
      fallback: 'web-speech-api',
    };
  }

  try {
    // Lazy import OpenAI only when needed
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Convert File to buffer for Whisper
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a File-like object for OpenAI
    const audioFile = new File([buffer], file.name, { type: file.type });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });

    console.log('✨ Audio transcribed:', {
      userId,
      fileName: file.name,
      length: (transcription as string).length,
    });

    return {
      ok: true,
      transcript: transcription as string,
      meta: {
        userId,
        fileName: file.name,
        fileSize: file.size,
      },
    };
  } catch (error: any) {
    console.error('[Transcribe] Error:', error);
    return {
      ok: false,
      error: 'Transcription failed',
      details: error?.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE NOTES HANDLER (for listing saved voice notes)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * List voice notes for a user
 * Currently returns empty - implement with persistence when needed
 */
export async function listVoiceNotesHandler(userId: string) {
  // TODO: Query from database when voice_notes table exists
  return {
    ok: true,
    notes: [],
    count: 0,
    note: 'Voice notes persistence not yet configured',
  };
}
