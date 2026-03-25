/**
 * Document Extraction Pipeline — Jondi v1
 *
 * Three-pass extraction from uploaded teaching materials:
 *   Pass 1 — Method (strongest for Jondi): sequences, protocols, decision points
 *   Pass 2 — Perception: what she notices first, refuses to collapse
 *   Pass 3 — Voice (light): rhythms, vocabulary, tone
 *
 * Uses PostgreSQL directly (lib/db/postgres.ts). No Supabase.
 * Fire-and-forget from upload route — idempotent by docId.
 *
 * Extraction results stored per-document. Persona rollup merges all completed docs.
 */

import { query } from '@/lib/db/postgres';
import { addIndexedMaterial, addBookReference } from '@/lib/stellium/personas';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExtractionResult = Record<string, unknown>;

interface PersonaDocumentRow {
  id: string;
  practitioner_id: string;
  persona_id: string;
  title: string;
  source_type: 'transcript' | 'book' | 'class' | 'notes';
  raw_content: string | null;
  processing_status: 'pending' | 'extracting' | 'complete' | 'failed';
}

const MAX_INPUT_CHARS = 120_000;

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

async function getDocument(docId: string): Promise<PersonaDocumentRow | null> {
  const result = await query(
    `SELECT id, practitioner_id, persona_id, title, source_type, raw_content, processing_status
     FROM persona_documents WHERE id = $1`,
    [docId]
  );
  return (result.rows[0] as PersonaDocumentRow) ?? null;
}

async function setStatus(
  docId: string,
  status: string,
  patch: Record<string, unknown> = {}
): Promise<void> {
  const sets = ['processing_status = $2'];
  const params: unknown[] = [docId, status];
  let idx = 3;

  for (const [key, value] of Object.entries(patch)) {
    if (key === 'method_extractions' || key === 'perception_extractions' || key === 'voice_extractions') {
      sets.push(`${key} = $${idx}::jsonb`);
      params.push(JSON.stringify(value));
    } else if (key === 'extracted_at') {
      sets.push(`${key} = $${idx}::timestamptz`);
      params.push(value);
    } else {
      sets.push(`${key} = $${idx}`);
      params.push(value);
    }
    idx++;
  }

  await query(
    `UPDATE persona_documents SET ${sets.join(', ')} WHERE id = $1`,
    params
  );
}

// ---------------------------------------------------------------------------
// Extraction passes (placeholder — wire Claude calls here)
// ---------------------------------------------------------------------------

/**
 * Pass 1 — Method extraction (strongest for Jondi).
 * Replace with Claude call when ready.
 */
async function extractMethod(content: string): Promise<ExtractionResult> {
  // TODO: Wire Claude Sonnet call with method extraction prompt
  // System prompt should ask for: sequences, protocols, decision_points, error_corrections
  return {
    _placeholder: true,
    sequences: [],
    protocols: [],
    decisionPoints: [],
    errorCorrections: [],
    contentPreview: content.slice(0, 300),
  };
}

/**
 * Pass 2 — Perception extraction.
 * Replace with Claude call when ready.
 */
async function extractPerception(content: string): Promise<ExtractionResult> {
  // TODO: Wire Claude Sonnet call with perception extraction prompt
  // System prompt should ask for: notices_first, refuses_to_collapse, transformation_sequence
  return {
    _placeholder: true,
    noticesFirst: [],
    refusesToCollapse: [],
    transformationSequence: [],
    contentPreview: content.slice(0, 300),
  };
}

/**
 * Pass 3 — Voice extraction (light).
 * Replace with Claude call when ready.
 */
async function extractVoice(content: string): Promise<ExtractionResult> {
  // TODO: Wire Claude Sonnet call with voice extraction prompt
  // System prompt should ask for: rhythms, vocabulary, tone_markers
  return {
    _placeholder: true,
    rhythms: [],
    vocabulary: [],
    toneMarkers: [],
    contentPreview: content.slice(0, 300),
  };
}

// ---------------------------------------------------------------------------
// Persona rollup — merge completed docs into persona aggregate fields
// ---------------------------------------------------------------------------

async function mergeIntoPersona(doc: PersonaDocumentRow): Promise<void> {
  try {
    // Append to indexed materials list (not overwrite)
    await addIndexedMaterial(
      doc.practitioner_id,
      doc.persona_id,
      `${doc.title} (${doc.source_type})`
    );

    // If it's a book, also add to book references
    if (doc.source_type === 'book') {
      await addBookReference(doc.practitioner_id, doc.persona_id, doc.title);
    }

    console.log(`[document-extraction] Merged "${doc.title}" into persona ${doc.persona_id}`);
  } catch (err) {
    // Non-fatal — document extraction succeeded, persona merge is best-effort
    console.error(`[document-extraction] Persona merge failed for "${doc.title}":`, err);
  }
}

// ---------------------------------------------------------------------------
// Main extraction entry point
// ---------------------------------------------------------------------------

/**
 * Extract method, perception, and voice patterns from a document.
 * Idempotent by docId — skips if already complete.
 * Called fire-and-forget from the upload route.
 */
export async function extractFromDocument(docId: string): Promise<void> {
  const doc = await getDocument(docId);

  if (!doc) {
    console.error(`[document-extraction] Document ${docId} not found`);
    return;
  }

  if (doc.processing_status === 'complete') {
    return; // Already done
  }

  const rawContent = doc.raw_content?.trim();
  if (!rawContent) {
    await setStatus(docId, 'failed', {
      processing_error: 'No raw content available for extraction.',
    });
    return;
  }

  // Clamp to model input limit
  const content = rawContent.length > MAX_INPUT_CHARS
    ? rawContent.slice(0, MAX_INPUT_CHARS)
    : rawContent;

  await setStatus(docId, 'extracting', { processing_error: null });

  try {
    // Pass 1 — Method
    const method = await extractMethod(content);
    await setStatus(docId, 'extracting', { method_extractions: method });

    // Pass 2 — Perception
    const perception = await extractPerception(content);
    await setStatus(docId, 'extracting', { perception_extractions: perception });

    // Pass 3 — Voice
    const voice = await extractVoice(content);
    await setStatus(docId, 'complete', {
      voice_extractions: voice,
      extracted_at: new Date().toISOString(),
    });

    console.log(`[document-extraction] Complete: "${doc.title}" (${docId})`);

    // Merge into persona (append, not overwrite)
    await mergeIntoPersona(doc);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown extraction failure';
    console.error(`[document-extraction] Failed for ${docId}:`, message);
    await setStatus(docId, 'failed', { processing_error: message });
  }
}
