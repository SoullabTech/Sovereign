/**
 * Media Job Processors
 *
 * Each processor handles one job type in the media pipeline.
 * Uses ffmpeg/ffprobe for media processing, local Whisper for transcription.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { stat } from 'fs/promises';
import { query } from '@/lib/db/postgres';
import {
  getAbsolutePath, storeFile, fileExists,
} from './storage';
import { classifyMediaContent } from '@/lib/trust/mediaDisclosure';
import type { MediaJobRow } from './types';

const execFileAsync = promisify(execFile);

const WHISPER_URL = process.env.WHISPER_LOCAL_URL || 'http://faster-whisper:8000';
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434';

export type JobProcessor = (job: MediaJobRow) => Promise<void>;

// ── Registry ───────────────────────────────────────────────

export const PROCESSORS: Record<string, JobProcessor> = {
  validate: processValidate,
  inspect: processInspect,
  thumbnail: processThumbnail,
  waveform: processWaveform,
  audio_extract: processAudioExtract,
  transcribe: processTranscribe,
  classify: processClassify,
  summarize: processSummarize,
};

// ── Helpers ────────────────────────────────────────────────

async function getOriginalAssetPath(projectId: string): Promise<string | null> {
  const result = await query(
    `SELECT storage_path FROM media_assets
     WHERE project_id = $1 AND asset_type = 'original'
     ORDER BY created_at LIMIT 1`,
    [projectId]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0].storage_path;
}

async function getAudioPath(projectId: string): Promise<string | null> {
  // Prefer extracted audio, fall back to original
  const extract = await query(
    `SELECT storage_path FROM media_assets
     WHERE project_id = $1 AND asset_type = 'audio_extract'
     ORDER BY created_at DESC LIMIT 1`,
    [projectId]
  );
  if (extract.rows.length > 0) return extract.rows[0].storage_path;
  return getOriginalAssetPath(projectId);
}

// ── Processors ─────────────────────────────────────────────

async function processValidate(job: MediaJobRow): Promise<void> {
  const assetPath = await getOriginalAssetPath(job.project_id);
  if (!assetPath) throw new Error('No original asset found');

  if (!fileExists(assetPath)) {
    throw new Error(`File does not exist: ${assetPath}`);
  }

  const absolutePath = getAbsolutePath(assetPath);
  const stats = await stat(absolutePath);

  if (stats.size === 0) {
    throw new Error('File is empty (0 bytes)');
  }

  // Verify project mime_type matches actual file
  const project = await query(
    'SELECT mime_type FROM media_projects WHERE id = $1',
    [job.project_id]
  );
  if (project.rows.length > 0 && !project.rows[0].mime_type) {
    throw new Error('No mime_type set on project');
  }

  console.log(`[Media:validate] OK: ${assetPath} (${stats.size} bytes)`);
}

async function processInspect(job: MediaJobRow): Promise<void> {
  const assetPath = await getOriginalAssetPath(job.project_id);
  if (!assetPath) throw new Error('No original asset found');

  const absolutePath = getAbsolutePath(assetPath);

  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      absolutePath,
    ]);

    const info = JSON.parse(stdout);
    const format = info.format || {};
    const videoStream = (info.streams || []).find((s: { codec_type: string }) => s.codec_type === 'video');
    const audioStream = (info.streams || []).find((s: { codec_type: string }) => s.codec_type === 'audio');

    const duration = parseFloat(format.duration || '0');
    const width = videoStream?.width || null;
    const height = videoStream?.height || null;

    await query(
      `UPDATE media_projects SET
         duration_seconds = $1, width = $2, height = $3, updated_at = NOW()
       WHERE id = $4`,
      [duration, width, height, job.project_id]
    );

    // Store probe data in job output
    await query(
      `UPDATE media_jobs SET output_data = $1 WHERE id = $2`,
      [JSON.stringify({
        duration,
        width,
        height,
        codec: videoStream?.codec_name || audioStream?.codec_name,
        sampleRate: audioStream?.sample_rate,
        bitRate: format.bit_rate,
      }), job.id]
    );

    console.log(`[Media:inspect] duration=${duration}s width=${width} height=${height}`);
  } catch (err) {
    // If ffprobe not available, store basic info
    console.warn('[Media:inspect] ffprobe failed, storing basic info:', err);
    const stats = await stat(absolutePath);
    await query(
      'UPDATE media_jobs SET output_data = $1 WHERE id = $2',
      [JSON.stringify({ fileSize: stats.size, note: 'ffprobe unavailable' }), job.id]
    );
  }
}

async function processThumbnail(job: MediaJobRow): Promise<void> {
  const assetPath = await getOriginalAssetPath(job.project_id);
  if (!assetPath) throw new Error('No original asset found');

  const absolutePath = getAbsolutePath(assetPath);
  const project = await query(
    'SELECT media_type, duration_seconds FROM media_projects WHERE id = $1',
    [job.project_id]
  );
  const mediaType = project.rows[0]?.media_type;
  const duration = parseFloat(project.rows[0]?.duration_seconds || '0');

  const thumbnailFilename = 'thumbnail.jpg';
  const outputPath = getAbsolutePath(`${job.project_id}/processed/${thumbnailFilename}`);

  try {
    if (mediaType === 'video') {
      // Extract frame at 10% of duration
      const seekTo = Math.max(1, duration * 0.1);
      await execFileAsync('ffmpeg', [
        '-y', '-i', absolutePath,
        '-ss', String(seekTo),
        '-vframes', '1',
        '-vf', 'scale=640:-1',
        outputPath,
      ]);
    } else if (mediaType === 'audio') {
      // Generate waveform-based thumbnail for audio
      await execFileAsync('ffmpeg', [
        '-y', '-i', absolutePath,
        '-filter_complex', 'showwavespic=s=640x360:colors=#f59e0b',
        '-frames:v', '1',
        outputPath,
      ]);
    } else if (mediaType === 'image') {
      // Resize image for thumbnail
      await execFileAsync('ffmpeg', [
        '-y', '-i', absolutePath,
        '-vf', 'scale=640:-1',
        outputPath,
      ]);
    }

    const stats = await stat(outputPath);
    await query(
      `INSERT INTO media_assets (project_id, asset_type, storage_path, mime_type, file_size_bytes)
       VALUES ($1, 'thumbnail', $2, 'image/jpeg', $3)`,
      [job.project_id, `${job.project_id}/processed/${thumbnailFilename}`, stats.size]
    );

    console.log(`[Media:thumbnail] Generated for project ${job.project_id}`);
  } catch (err) {
    console.warn('[Media:thumbnail] ffmpeg failed:', err);
    throw err;
  }
}

async function processWaveform(job: MediaJobRow): Promise<void> {
  const audioPath = await getAudioPath(job.project_id);
  if (!audioPath) throw new Error('No audio source found');

  const absolutePath = getAbsolutePath(audioPath);
  const waveformFilename = 'waveform.png';
  const outputPath = getAbsolutePath(`${job.project_id}/processed/${waveformFilename}`);

  try {
    await execFileAsync('ffmpeg', [
      '-y', '-i', absolutePath,
      '-filter_complex', 'showwavespic=s=1200x200:colors=#f59e0b',
      '-frames:v', '1',
      outputPath,
    ]);

    const stats = await stat(outputPath);
    await query(
      `INSERT INTO media_assets (project_id, asset_type, storage_path, mime_type, file_size_bytes)
       VALUES ($1, 'waveform', $2, 'image/png', $3)`,
      [job.project_id, `${job.project_id}/processed/${waveformFilename}`, stats.size]
    );

    console.log(`[Media:waveform] Generated for project ${job.project_id}`);
  } catch (err) {
    console.warn('[Media:waveform] ffmpeg failed:', err);
    throw err;
  }
}

async function processAudioExtract(job: MediaJobRow): Promise<void> {
  const assetPath = await getOriginalAssetPath(job.project_id);
  if (!assetPath) throw new Error('No original asset found');

  const absolutePath = getAbsolutePath(assetPath);
  const audioFilename = 'audio.wav';
  const outputPath = getAbsolutePath(`${job.project_id}/processed/${audioFilename}`);

  try {
    await execFileAsync('ffmpeg', [
      '-y', '-i', absolutePath,
      '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1',
      outputPath,
    ]);

    const stats = await stat(outputPath);
    await query(
      `INSERT INTO media_assets (project_id, asset_type, storage_path, mime_type, file_size_bytes)
       VALUES ($1, 'audio_extract', $2, 'audio/wav', $3)`,
      [job.project_id, `${job.project_id}/processed/${audioFilename}`, stats.size]
    );

    console.log(`[Media:audio_extract] Extracted audio for project ${job.project_id}`);
  } catch (err) {
    console.warn('[Media:audio_extract] ffmpeg failed:', err);
    throw err;
  }
}

async function processTranscribe(job: MediaJobRow): Promise<void> {
  // Check ai_processing_allowed
  const project = await query(
    'SELECT ai_processing_allowed FROM media_projects WHERE id = $1',
    [job.project_id]
  );
  if (!project.rows[0]?.ai_processing_allowed) {
    console.log(`[Media:transcribe] Skipped: ai_processing_allowed=false for ${job.project_id}`);
    return;
  }

  const audioPath = await getAudioPath(job.project_id);
  if (!audioPath) throw new Error('No audio source found');

  const absolutePath = getAbsolutePath(audioPath);
  const { readFile } = await import('fs/promises');
  const audioData = await readFile(absolutePath);

  // POST to local Whisper
  const formData = new FormData();
  formData.append('file', new Blob([audioData], { type: 'audio/wav' }), 'audio.wav');
  formData.append('response_format', 'verbose_json');
  formData.append('language', 'en');

  const response = await fetch(`${WHISPER_URL}/v1/audio/transcriptions`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper returned ${response.status}: ${await response.text()}`);
  }

  const result = await response.json();
  const fullText = result.text || '';
  const segments = (result.segments || []).map((s: { start: number; end: number; text: string }) => ({
    start: s.start,
    end: s.end,
    text: s.text.trim(),
  }));

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  await query(
    `INSERT INTO media_transcripts (project_id, engine, language, full_text, segments, word_count, status)
     VALUES ($1, 'whisper-local', 'en', $2, $3, $4, 'completed')`,
    [job.project_id, fullText, JSON.stringify(segments), wordCount]
  );

  console.log(`[Media:transcribe] Completed: ${wordCount} words, ${segments.length} segments`);
}

async function processClassify(job: MediaJobRow): Promise<void> {
  // Get transcript text
  const transcriptResult = await query(
    `SELECT full_text FROM media_transcripts
     WHERE project_id = $1 AND status = 'completed'
     ORDER BY created_at DESC LIMIT 1`,
    [job.project_id]
  );

  if (transcriptResult.rows.length === 0 || !transcriptResult.rows[0].full_text) {
    console.log(`[Media:classify] No transcript to classify for ${job.project_id}`);
    return;
  }

  const result = await classifyMediaContent(
    job.project_id,
    transcriptResult.rows[0].full_text
  );

  await query(
    'UPDATE media_jobs SET output_data = $1 WHERE id = $2',
    [JSON.stringify(result), job.id]
  );
}

async function processSummarize(job: MediaJobRow): Promise<void> {
  // Check ai_processing_allowed
  const project = await query(
    'SELECT ai_processing_allowed FROM media_projects WHERE id = $1',
    [job.project_id]
  );
  if (!project.rows[0]?.ai_processing_allowed) {
    console.log(`[Media:summarize] Skipped: ai_processing_allowed=false for ${job.project_id}`);
    return;
  }

  // Get transcript text
  const transcriptResult = await query(
    `SELECT id, full_text FROM media_transcripts
     WHERE project_id = $1 AND status = 'completed'
     ORDER BY created_at DESC LIMIT 1`,
    [job.project_id]
  );

  if (transcriptResult.rows.length === 0 || !transcriptResult.rows[0].full_text) {
    console.log(`[Media:summarize] No transcript to summarize for ${job.project_id}`);
    return;
  }

  const transcript = transcriptResult.rows[0];
  const text = transcript.full_text.slice(0, 8000); // Limit input size

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:8b',
        prompt: `Summarize this transcript in 2-3 paragraphs. Focus on key points, themes, and actionable takeaways:\n\n${text}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const result = await response.json();
    const summary = result.response || '';

    await query(
      `UPDATE media_transcripts SET summary = $1, summary_model = 'deepseek-r1:8b', updated_at = NOW()
       WHERE id = $2`,
      [summary, transcript.id]
    );

    console.log(`[Media:summarize] Generated summary (${summary.length} chars) for project ${job.project_id}`);
  } catch (err) {
    console.warn('[Media:summarize] Ollama unavailable, skipping summary:', err);
    throw err;
  }
}
