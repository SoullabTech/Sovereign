/**
 * Second Brain Classifier (The "Sorter")
 *
 * Uses Claude to classify raw captures into structured second brain items.
 * Implements Nate's "treat prompts like APIs" principle with strict JSON output.
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { SB_Classified, SB_Bucket, SB_RawCapture } from './secondBrainWriter';

// ═══════════════════════════════════════════════════════════════════════════════
// Zod Schema (the "Form" contract for the AI)
// ═══════════════════════════════════════════════════════════════════════════════

const SB_ClassificationSchema = z.object({
  bucket: z.enum(['person', 'project', 'idea', 'admin']),
  title: z.string().min(1).max(200),
  body: z.string(),
  next_action: z.string().optional(),
  tags: z.array(z.string()).optional(),
  entities: z.object({
    people: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
  }).optional(),
  confidence: z.number().min(0).max(1),
  needs_clarification: z.boolean().optional(),
  clarification_question: z.string().optional(),
});

type SB_ClassificationResult = z.infer<typeof SB_ClassificationSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// Classification Prompt (the "API contract")
// ═══════════════════════════════════════════════════════════════════════════════

const CLASSIFIER_SYSTEM_PROMPT = `You are a Second Brain classifier. Your job is to categorize raw thoughts into one of four buckets and extract structured data.

## Buckets

- **project**: Something with a clear outcome and multiple steps (has a "done" state)
- **admin**: Errands, appointments, one-off tasks, logistics
- **idea**: A thought, insight, or concept to remember (no immediate action needed)
- **person**: Information about a specific person (context, preferences, relationship notes) with NO action focus

## ROUTING PRECEDENCE (ACTION-FIRST)

Choose the bucket based on what should be *done* or *tracked*, not just which entity is mentioned.

1. If the capture contains a concrete next action (email/call/schedule/send/pay/follow up) or a deadline/time:
   - Use "project" if it relates to an ongoing deliverable/initiative (website, launch, budget, program)
   - Use "admin" if it's a standalone errand/task not clearly tied to a project
2. Use "idea" for thoughts, insights, or concepts with no immediate action needed
3. Use "person" ONLY when the capture is primarily relationship/context about a person (preferences, background, notes) with NO meaningful project/admin execution focus

**CRITICAL**: ALWAYS populate entities.people if a person is mentioned, even when bucket is "project" or "admin".

## Output Format

Return ONLY valid JSON matching this schema:

{
  "bucket": "project" | "admin" | "idea" | "person",
  "title": "Clear, descriptive title (max 200 chars)",
  "body": "The processed content, cleaned up but preserving meaning",
  "next_action": "Specific executable action (if applicable). Use imperative verb: 'Email Sarah', not 'Should email Sarah'",
  "tags": ["relevant", "tags"],
  "entities": {
    "people": ["Names mentioned - ALWAYS include if a person is named"],
    "projects": ["Projects referenced"]
  },
  "confidence": 0.0-1.0,
  "needs_clarification": true/false,
  "clarification_question": "Question to ask if unclear"
}

## Rules

1. **Title**: Name the deliverable/action for projects. Name the task for admin. Name the concept for ideas.
2. **Next action**: Must be concrete and executable. "Work on website" is bad. "Email Sarah to confirm copy deadline" is good.
3. **Confidence**: Rate 0.0-1.0. Below 0.6 means you're guessing. Be honest.
4. **Clarification**: If the input is ambiguous, set needs_clarification=true and ask a specific question.
5. **No markdown in JSON**: Return pure JSON only. No code blocks, no explanation.

## Examples

Input: "Sarah from marketing mentioned she needs the copy by Friday. Should probably follow up."
Output:
{"bucket":"project","title":"Website copy - confirm deadline with Sarah","body":"Sarah from marketing needs the copy by Friday. Need to confirm and deliver.","next_action":"Email Sarah to confirm copy deadline is Friday","tags":["marketing","deadline","website"],"entities":{"people":["Sarah"],"projects":["Website copy"]},"confidence":0.92}

Input: "Sarah prefers morning meetings and doesn't like being interrupted during deep work"
Output:
{"bucket":"person","title":"Sarah","body":"Sarah prefers morning meetings and doesn't like being interrupted during deep work.","tags":["preferences","meetings"],"entities":{"people":["Sarah"]},"confidence":0.95}

Input: "interesting thought about how consciousness might emerge from recursive self-modeling"
Output:
{"bucket":"idea","title":"Consciousness as recursive self-modeling","body":"Interesting thought about how consciousness might emerge from recursive self-modeling. Worth exploring further.","tags":["consciousness","theory","emergence"],"entities":{},"confidence":0.9}

Input: "meeting tuesday"
Output:
{"bucket":"admin","title":"Meeting on Tuesday","body":"Meeting scheduled for Tuesday. Details unclear.","next_action":"Clarify meeting details: time, location, participants","tags":["meeting","calendar"],"entities":{},"confidence":0.5,"needs_clarification":true,"clarification_question":"What is this meeting about? Who is attending? What time?"}`;

// ═══════════════════════════════════════════════════════════════════════════════
// Classifier Implementation
// ═══════════════════════════════════════════════════════════════════════════════

// Model for classification (Sonnet is fast and reliable for structured output)
const CLASSIFIER_MODEL = process.env.SB_CLASSIFIER_MODEL || 'claude-sonnet-4-6';

// Lazy-initialized client
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (anthropicClient) return anthropicClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  anthropicClient = new Anthropic({ apiKey });
  return anthropicClient;
}

/**
 * Classify a raw capture using Claude
 *
 * Returns a fully structured SB_Classified item ready for the writer.
 */
export async function classifyCapture(capture: SB_RawCapture): Promise<SB_Classified> {
  const client = getAnthropicClient();
  const capturedAt = capture.captured_at ?? new Date();

  console.log(`🔍 SecondBrain: classifying "${capture.text.slice(0, 50)}..."`);

  try {
    const message = await client.messages.create({
      model: CLASSIFIER_MODEL,
      max_tokens: 1024,
      temperature: 0.3, // Lower temperature for more consistent JSON output
      system: CLASSIFIER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: capture.text }
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error(`Unexpected response type: ${content.type}`);
    }

    // Parse and validate JSON
    const rawJson = content.text.trim();
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawJson);
    } catch (parseError) {
      // Try to extract JSON from potential markdown code block
      const jsonMatch = rawJson.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        throw parseError;
      }
    }

    // Validate against schema
    const validated = SB_ClassificationSchema.parse(parsed);

    // Build full SB_Classified object
    const classified: SB_Classified = {
      bucket: validated.bucket as SB_Bucket,
      title: validated.title,
      body: validated.body,
      next_action: validated.next_action,
      tags: validated.tags,
      entities: validated.entities,
      confidence: validated.confidence,
      needs_clarification: validated.needs_clarification,
      clarification_question: validated.clarification_question,
      sb_id: crypto.randomUUID(),
      captured_at_iso: capturedAt.toISOString(),
      source: capture.source ?? 'maia',
    };

    console.log(`✅ SecondBrain: classified as ${classified.bucket} (conf=${classified.confidence.toFixed(2)})`);
    return classified;

  } catch (error) {
    console.error('❌ SecondBrain classification failed:', error);

    // Return a low-confidence fallback that will go to inbox for review
    return {
      bucket: 'idea', // Default bucket
      title: 'Unclassified: ' + capture.text.slice(0, 50),
      body: capture.text,
      confidence: 0.1,
      needs_clarification: true,
      clarification_question: 'Classification failed. Please manually categorize this item.',
      sb_id: crypto.randomUUID(),
      captured_at_iso: capturedAt.toISOString(),
      source: capture.source ?? 'maia',
    };
  }
}

/**
 * Classify multiple captures in batch
 */
export async function classifyCaptures(captures: SB_RawCapture[]): Promise<SB_Classified[]> {
  // Process sequentially to avoid rate limits
  // Could be parallelized with Promise.all for speed if needed
  const results: SB_Classified[] = [];

  for (const capture of captures) {
    const classified = await classifyCapture(capture);
    results.push(classified);
  }

  return results;
}

/**
 * Re-classify an existing item (for the "Fix Button")
 * Takes the body text and optional hints from the user
 */
export async function reclassify(opts: {
  text: string;
  hint?: string; // e.g., "person: Sarah" or "This is actually a project"
  source?: string;
}): Promise<SB_Classified> {
  const input = opts.hint
    ? `[User hint: ${opts.hint}]\n\n${opts.text}`
    : opts.text;

  return classifyCapture({
    text: input,
    source: (opts.source as SB_RawCapture['source']) ?? 'manual',
    captured_at: new Date(),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════════

export { SB_ClassificationSchema };
