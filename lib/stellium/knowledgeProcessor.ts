/**
 * KNOWLEDGE PROCESSOR
 *
 * Takes a raw document, chunks it by structure (chapters/sections),
 * extracts knowledge statements from each chunk using Claude,
 * then synthesizes into a knowledge_block for persona builds.
 *
 * Pipeline: raw text → chunks → knowledge statements → knowledge_summary
 *
 * Knowledge statements are structured:
 *   { text, category, source_chapter, weight }
 *
 * Categories:
 *   concept     — core ideas and principles
 *   definition  — named terms and their meanings
 *   framework   — structural models (elements, phases, trinity)
 *   distinction — important differences the practitioner draws
 *   practice    — exercises, applications, how-tos
 *   caution     — boundaries, warnings, what not to do
 */

import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'crypto';
import { query } from '@/lib/db/postgres';
import type {
  PersonaDocument,
  KnowledgeStatement,
  IngestDocumentInput,
} from './trainingTypes';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ============================================
// DOCUMENT INGESTION
// ============================================

/**
 * Ingest a document: store raw content, then process asynchronously.
 */
export async function ingestDocument(
  personaId: string,
  input: IngestDocumentInput
): Promise<PersonaDocument> {
  const contentHash = createHash('sha256')
    .update(input.content)
    .digest('hex')
    .slice(0, 32);

  // Check for duplicate
  const existing = await query(
    `SELECT id FROM persona_documents
     WHERE persona_id = $1 AND content_hash = $2`,
    [personaId, contentHash]
  );
  if (existing.rows.length > 0) {
    throw new Error('Document with identical content already ingested');
  }

  const result = await query(
    `INSERT INTO persona_documents
     (persona_id, title, source_type, content_hash, raw_content, char_count, processing_status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING *`,
    [
      personaId,
      input.title,
      input.source_type,
      contentHash,
      input.content,
      input.content.length,
    ]
  );

  return result.rows[0] as PersonaDocument;
}

/**
 * Process a document: chunk → extract → summarize.
 */
export async function processDocument(
  docId: string
): Promise<PersonaDocument> {
  // Mark as processing
  await query(
    `UPDATE persona_documents SET processing_status = 'processing', updated_at = NOW()
     WHERE id = $1`,
    [docId]
  );

  try {
    const docResult = await query(
      `SELECT * FROM persona_documents WHERE id = $1`,
      [docId]
    );
    const doc = docResult.rows[0] as PersonaDocument;
    if (!doc) throw new Error('Document not found');

    // 1. Chunk the document
    const chunks = chunkDocument(doc.raw_content);
    console.log(
      '[KnowledgeProcessor] Document "%s": %d chunks from %d chars',
      doc.title, chunks.length, doc.char_count
    );

    // 2. Extract knowledge statements from each chunk
    const allStatements: KnowledgeStatement[] = [];
    for (const chunk of chunks) {
      const statements = await extractKnowledge(chunk);
      allStatements.push(...statements);
    }

    console.log(
      '[KnowledgeProcessor] Extracted %d knowledge statements',
      allStatements.length
    );

    // 3. Synthesize into knowledge summary
    const knowledgeSummary = await synthesizeKnowledge(allStatements, doc.title);

    // 4. Update document
    const updated = await query(
      `UPDATE persona_documents
       SET processing_status = 'completed',
           chunks_count = $1,
           knowledge_statements = $2,
           knowledge_summary = $3,
           processed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [
        chunks.length,
        JSON.stringify(allStatements),
        knowledgeSummary,
        docId,
      ]
    );

    return updated.rows[0] as PersonaDocument;
  } catch (err) {
    await query(
      `UPDATE persona_documents
       SET processing_status = 'failed',
           processing_error = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [err instanceof Error ? err.message : 'Unknown error', docId]
    );
    throw err;
  }
}

// ============================================
// CHUNKING
// ============================================

interface DocumentChunk {
  title: string;
  content: string;
  index: number;
}

/**
 * Chunk a markdown document by headings.
 * Each H1/H2 section becomes a chunk.
 * Chunks are capped at ~4000 chars for LLM processing.
 */
function chunkDocument(content: string): DocumentChunk[] {
  const lines = content.split('\n');
  const chunks: DocumentChunk[] = [];
  let currentTitle = 'Introduction';
  let currentLines: string[] = [];

  function flushChunk() {
    const text = currentLines
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('!['))
      .join('\n');

    if (text.length > 100) {
      // Split oversized chunks
      if (text.length > 4000) {
        const parts = splitByParagraphs(text, 4000);
        for (let i = 0; i < parts.length; i++) {
          chunks.push({
            title: `${currentTitle}${parts.length > 1 ? ` (part ${i + 1})` : ''}`,
            content: parts[i],
            index: chunks.length,
          });
        }
      } else {
        chunks.push({
          title: currentTitle,
          content: text,
          index: chunks.length,
        });
      }
    }
    currentLines = [];
  }

  for (const line of lines) {
    // Chunk at H1 and H2 boundaries (not H3 — those stay grouped in their parent)
    if (/^#{1,2}\s/.test(line)) {
      flushChunk();
      currentTitle = line.replace(/^#+\s*/, '').replace(/\*+/g, '').replace(/!\[.*?\]\[.*?\]/g, '').trim();
    } else {
      currentLines.push(line);
    }
  }
  flushChunk(); // last section

  return chunks;
}

function splitByParagraphs(text: string, maxLen: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const parts: string[] = [];
  let current = '';

  for (const p of paragraphs) {
    if (current.length + p.length > maxLen && current.length > 0) {
      parts.push(current.trim());
      current = p;
    } else {
      current += (current ? '\n\n' : '') + p;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// ============================================
// KNOWLEDGE EXTRACTION (per chunk)
// ============================================

async function extractKnowledge(
  chunk: DocumentChunk
): Promise<KnowledgeStatement[]> {
  const prompt = `You are extracting STRUCTURED PERCEPTUAL KNOWLEDGE from a practitioner's book — not summaries, not content descriptions, but the living architecture of how this person perceives and navigates reality.

SECTION: "${chunk.title}"

TEXT:
${chunk.content.slice(0, 4000)}

Extract 3-8 knowledge units. For EACH, ask one of these questions:
- What DISTINCTION is being made? (what must not be confused?)
- What SEQUENCE is implied? (what comes before what? what cannot be skipped?)
- What CONSTRAINT is set? (what must be true before this applies? what governing rule?)
- What DISTORTION is being prevented? (what error, misuse, or flattening is warned against?)
- What FRAMEWORK is being defined? (structural model, elemental mapping, process?)
- What PRACTICE is offered? (exercise, application, embodied instruction?)

Categorize each as: distinction, sequence, constraint, distortion, framework, practice

Return JSON array:
[
  { "text": "Fire without Earth produces vision without container — the spark has nowhere to live", "category": "distinction", "source_chapter": "${chunk.title}" },
  ...
]

CRITICAL RULES:
- Preserve MOVEMENT and TENSION — not just what something IS, but what it does and what happens when it's missing
- Preserve SPECIFIC LANGUAGE — "spiral," "rising," "without earth," "re-ensouling" — do not normalize these into generic terms
- Preserve SEQUENCE — if the text implies an order (ground before meaning, stabilize before interpret), capture it
- Preserve CONSTRAINTS — "do not interpret what has not stabilized" is a governing rule, not an insight
- Keep each statement under 80 words but vivid and precise
- Only return the JSON array, nothing else`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: 'Extract knowledge statements. Return only valid JSON array.',
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]) as KnowledgeStatement[];
    return parsed.map(s => ({
      text: s.text,
      category: s.category || 'concept',
      source_chapter: chunk.title,
    }));
  } catch {
    console.warn('[KnowledgeProcessor] Failed to parse chunk "%s"', chunk.title);
    return [];
  }
}

// ============================================
// KNOWLEDGE SYNTHESIS
// ============================================

/**
 * Synthesize all knowledge statements into a compact knowledge_block.
 * This is what gets injected into persona builds.
 */
async function synthesizeKnowledge(
  statements: KnowledgeStatement[],
  documentTitle: string
): Promise<string> {
  // Group by category
  const grouped: Record<string, string[]> = {};
  for (const s of statements) {
    const cat = s.category || 'concept';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s.text);
  }

  const sections: string[] = [];
  for (const [cat, items] of Object.entries(grouped)) {
    sections.push(`${cat.toUpperCase()} (${items.length}):\n${items.map(i => `- ${i}`).join('\n')}`);
  }

  const prompt = `You are synthesizing extracted knowledge into a STRUCTURED INTERNAL ORIENTATION for an AI companion. This is not a summary — it is a perceptual operating system.

SOURCE: "${documentTitle}"
TOTAL STATEMENTS: ${statements.length}

${sections.join('\n\n')}

Synthesize into a KNOWLEDGE BLOCK structured as follows:

## ELEMENTAL ARCHITECTURE
The core framework: what the elements are, how they map to experience, how they interact.
- Fire = spiritual expression, vision, creative impulse
- Water = emotional depth, dissolution, feeling
- Earth = embodied service, grounding, container
- Air = intelligence, perspective, meaning-making
- Aether = integration, coherence, the weave
(Fill in from the actual extracted knowledge — be specific, not generic)

## DISTINCTIONS (what must not be confused)
List the critical distinctions. Format: "X vs Y — why the difference matters"

## SEQUENCES (what cannot be skipped)
List ordering rules. Format: "Before X, Y must be true" or "X precedes Y because..."

## CONSTRAINTS (governing rules)
List non-negotiable operational rules. These are not insights — they are laws of practice.
Format: direct imperatives. "Ground before meaning." "Do not interpret what has not stabilized."

## DISTORTIONS (what goes wrong)
List common errors, misuses, and flattenings. Format: "When X is missing, Y degrades into Z"

## PRACTICES
List key exercises and applications. Brief, actionable.

Rules:
- Keep under 4000 characters total
- Preserve the practitioner's EXACT terminology — "spiral," "re-ensouling," "reality tunnel," "phenomenal life"
- This must be USABLE by the oracle for real-time reasoning, not just reference
- Write in second person where it helps: "You recognize fire without earth as..."
- Be specific. Vague knowledge is worse than no knowledge.
- This is KNOWLEDGE, not voice or stance (those are handled separately)`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: 'Synthesize knowledge into a compact reference block. Be specific and structured.',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0]?.type === 'text' ? response.content[0].text : '';
}

// ============================================
// QUERIES
// ============================================

export async function listDocuments(
  personaId: string
): Promise<PersonaDocument[]> {
  const result = await query(
    `SELECT id, persona_id, title, source_type, content_hash, char_count,
            processing_status, processing_error, chunks_count,
            knowledge_summary, created_at, updated_at, processed_at
     FROM persona_documents
     WHERE persona_id = $1
     ORDER BY created_at DESC`,
    [personaId]
  );
  return result.rows as PersonaDocument[];
}

export async function getDocument(
  personaId: string,
  docId: string
): Promise<PersonaDocument | null> {
  const result = await query(
    `SELECT * FROM persona_documents
     WHERE id = $1 AND persona_id = $2`,
    [docId, personaId]
  );
  return (result.rows[0] as PersonaDocument) ?? null;
}

/**
 * Get the combined knowledge summary from all completed documents.
 * This is what the builder reads for the knowledge_block.
 */
export async function getCombinedKnowledge(
  personaId: string
): Promise<string | null> {
  const result = await query(
    `SELECT knowledge_summary FROM persona_documents
     WHERE persona_id = $1 AND processing_status = 'completed'
     ORDER BY created_at`,
    [personaId]
  );

  if (result.rows.length === 0) return null;

  return result.rows
    .map((r: { knowledge_summary: string }) => r.knowledge_summary)
    .filter(Boolean)
    .join('\n\n---\n\n');
}
