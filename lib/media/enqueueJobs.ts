/**
 * Media Job Pipeline — Enqueue Processing Jobs
 *
 * Builds the dependency chain for a media project and
 * INSERTs all jobs in a single transaction.
 *
 * Pipeline:
 *   validate → inspect → [thumbnail, waveform, audio_extract] → transcribe → [classify, summarize]
 */

import { query } from '@/lib/db/postgres';
import type { MediaType } from './types';

interface EnqueueOptions {
  projectId: string;
  mediaType: MediaType;
  aiProcessingAllowed: boolean;
}

interface JobSpec {
  jobType: string;
  priority: number;
  isCritical: boolean;
  dependsOnRef?: string; // references another job's ref for chaining
  skipIf?: boolean;       // skip this job entirely
}

/**
 * Enqueue the full processing pipeline for a media project.
 * Returns the IDs of all created jobs.
 */
export async function enqueueProcessingPipeline(opts: EnqueueOptions): Promise<string[]> {
  const { projectId, mediaType, aiProcessingAllowed } = opts;
  const isVideo = mediaType === 'video';
  const isAudioOrVideo = mediaType === 'audio' || mediaType === 'video';
  const isImage = mediaType === 'image';

  // Build job specs with dependency references
  const specs: (JobSpec & { ref: string })[] = [
    { ref: 'validate', jobType: 'validate', priority: 1, isCritical: true },
    { ref: 'inspect', jobType: 'inspect', priority: 2, isCritical: true, dependsOnRef: 'validate' },
    { ref: 'thumbnail', jobType: 'thumbnail', priority: 3, isCritical: false, dependsOnRef: 'inspect' },
    {
      ref: 'waveform', jobType: 'waveform', priority: 3, isCritical: false,
      dependsOnRef: 'inspect',
      skipIf: !isAudioOrVideo,
    },
    {
      ref: 'audio_extract', jobType: 'audio_extract', priority: 3, isCritical: true,
      dependsOnRef: 'inspect',
      skipIf: !isVideo,
    },
    {
      ref: 'transcribe', jobType: 'transcribe', priority: 4, isCritical: true,
      dependsOnRef: isVideo ? 'audio_extract' : 'inspect',
      skipIf: !isAudioOrVideo || !aiProcessingAllowed,
    },
    {
      ref: 'classify', jobType: 'classify', priority: 5, isCritical: false,
      dependsOnRef: 'transcribe',
      skipIf: !isAudioOrVideo || !aiProcessingAllowed,
    },
    {
      ref: 'summarize', jobType: 'summarize', priority: 5, isCritical: false,
      dependsOnRef: 'transcribe',
      skipIf: !isAudioOrVideo || !aiProcessingAllowed,
    },
  ];

  // For images: only validate + inspect + thumbnail
  if (isImage) {
    // Already handled by skipIf flags above
  }

  // Filter out skipped jobs
  const activeSpecs = specs.filter(s => !s.skipIf);

  if (activeSpecs.length === 0) {
    return [];
  }

  // Insert jobs with dependency chain
  // We need to do this in order to capture UUIDs for depends_on
  const jobIds: Record<string, string> = {};
  const allIds: string[] = [];

  for (const spec of activeSpecs) {
    const dependsOnId = spec.dependsOnRef ? jobIds[spec.dependsOnRef] : null;

    // If the dependency was skipped, find the nearest ancestor that exists
    let effectiveDependsOn = dependsOnId ?? null;
    if (spec.dependsOnRef && !effectiveDependsOn) {
      // Walk up the chain to find an existing ancestor
      const depSpec = specs.find(s => s.ref === spec.dependsOnRef);
      if (depSpec?.dependsOnRef && jobIds[depSpec.dependsOnRef]) {
        effectiveDependsOn = jobIds[depSpec.dependsOnRef];
      }
    }

    const result = await query(
      `INSERT INTO media_jobs (project_id, job_type, priority, is_critical, depends_on)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [projectId, spec.jobType, spec.priority, spec.isCritical, effectiveDependsOn]
    );

    const jobId = result.rows[0].id;
    jobIds[spec.ref] = jobId;
    allIds.push(jobId);
  }

  console.log(`[Media] Pipeline enqueued for project ${projectId}: ${activeSpecs.map(s => s.jobType).join(' → ')} (${allIds.length} jobs)`);

  return allIds;
}
