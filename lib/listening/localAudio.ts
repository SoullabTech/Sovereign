/** LISTEN-04: member-selected private audio, read only inside the browser.
 * This is neither a server ingest permit nor a grant to rebroadcast/share. */
export const MAX_LOCAL_AUDIO_BYTES = 512 * 1024 * 1024;
const FORMATS: Record<string, { label: string; mime: readonly string[] }> = {
  flac: { label: 'FLAC', mime: ['audio/flac', 'audio/x-flac', 'application/x-flac'] },
  wav: { label: 'WAV', mime: ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave'] },
  mp3: { label: 'MP3', mime: ['audio/mpeg', 'audio/mp3'] },
  m4a: { label: 'M4A', mime: ['audio/mp4', 'audio/x-m4a'] },
  aac: { label: 'AAC', mime: ['audio/aac', 'audio/x-aac'] },
  ogg: { label: 'Ogg', mime: ['audio/ogg'] },
  opus: { label: 'Opus', mime: ['audio/ogg', 'audio/opus'] },
};
export type LocalAudioDecision = { allowed: true; label: string; name: string } |
  { allowed: false; reason: string };
export function validateLocalAudio(file: { name: string; size: number; type: string } | null | undefined): LocalAudioDecision {
  if (!file || typeof file.name !== 'string' || typeof file.type !== 'string' ||
      !Number.isSafeInteger(file.size) || file.size <= 0) return { allowed: false, reason: 'Choose a nonempty audio file.' };
  if (file.size > MAX_LOCAL_AUDIO_BYTES) return { allowed: false, reason: 'Audio file exceeds the 512 MB review limit.' };
  const base = file.name.split(/[\\/]/).pop() || '';
  const ext = base.split('.').pop()?.toLowerCase() || '';
  const format = FORMATS[ext];
  if (!format || base.length > 200 || !base.includes('.'))
    return { allowed: false, reason: 'Select a FLAC, WAV, MP3, M4A, AAC, Ogg or Opus file.' };
  // Some browser/OS combinations provide empty MIME for FLAC; accept the
  // filename there, then rely on native decoding and show any failure clearly.
  if (file.type && !format.mime.includes(file.type.toLowerCase()))
    return { allowed: false, reason: 'File type does not match the selected audio format.' };
  return { allowed: true, label: format.label, name: base.replace(/[\x00-\x1f\x7f]/g, ' ').trim() };
}
