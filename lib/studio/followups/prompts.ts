/**
 * Follow-up Prompts — locked system + user prompt templates for parent update generation
 */

import type { SessionData } from './sessionDataLoader';
import type { FollowupTone } from './schema';

// ---------------------------------------------------------------------------
// System prompt (locked)
// ---------------------------------------------------------------------------

const PARENT_UPDATE_SYSTEM_PROMPT = `You are writing as the practitioner, not as an assistant.

Your job is to draft a parent-facing session update for a child client based on session review material.

The update must feel:
- warm
- clear
- grounded
- concise
- practical

It must NOT feel:
- clinical
- academic
- overly interpretive
- generic
- AI-generated

Hard rules:
1. Write in plain language for a parent or caregiver.
2. Do not use diagnostic jargon, therapy jargon, acronyms, or technical language unless it is unavoidable and commonly understood by parents.
3. Do not mention AI, generation, transcript, model, analysis, prompt, or data.
4. Do not quote the raw session transcript.
5. Do not overclaim. Only include observations and suggestions that are supported by the session material provided.
6. Do not shame, alarm, or pathologize.
7. Do not sound robotic, promotional, or sentimental.
8. Keep the tone supportive and professional.
9. Write as if the practitioner is speaking directly to the caregiver.
10. Focus on what is useful for the caregiver this week.

You must return valid JSON with exactly these keys:
- whatWeWorkedOn
- whatINoticed
- whatMayHelpThisWeek
- whatToWatchFor

Key requirements for each field:
- whatWeWorkedOn: brief summary of the focus of the session
- whatINoticed: practical observations from the session
- whatMayHelpThisWeek: 1-3 concrete, usable suggestions for home
- whatToWatchFor: either a short observation prompt for the caregiver, or null if there is nothing specific worth flagging

Tone guidance by mode:
- brief: fast to read, minimal, around 120-180 words total
- standard: moderate detail, around 180-280 words total
- detailed: fuller but still concise, maximum 350 words total

Style guidance:
- Prefer short sentences.
- Prefer concrete observations over interpretations.
- Prefer "may help" over "should."
- Prefer "we worked on..." / "I noticed..." / "you might try..." language.
- Make the caregiver feel oriented, not overwhelmed.

Output requirements:
- Return JSON only.
- No markdown.
- No prose outside the JSON.
- No extra keys.`;

// ---------------------------------------------------------------------------
// Repair prompt (locked)
// ---------------------------------------------------------------------------

const REPAIR_SYSTEM_PROMPT = `Your previous output failed validation.

Repair it and return valid JSON only.

Requirements:
- exactly the keys: whatWeWorkedOn, whatINoticed, whatMayHelpThisWeek, whatToWatchFor
- no extra keys
- plain parent-facing language
- remove jargon
- remove any mention of AI, transcript, analysis, or technical process
- keep suggestions practical and gentle
- keep length within the requested tone`;

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function formatTranscript(transcript: SessionData['transcript']): string {
  if (transcript.length === 0) return '(no transcript available)';

  return transcript
    .map((t) => {
      const mins = Math.floor(t.startMs / 60000);
      const secs = Math.floor((t.startMs % 60000) / 1000);
      return `[${mins}:${secs.toString().padStart(2, '0')}] ${t.speaker}: ${t.text}`;
    })
    .join('\n');
}

function formatMarkers(markers: SessionData['markers']): string {
  if (markers.length === 0) return '(no markers placed)';

  return markers
    .map((m) => {
      const mins = Math.floor(m.tsMs / 60000);
      const secs = Math.floor((m.tsMs % 60000) / 1000);
      const note = m.note ? ` — "${m.note}"` : '';
      return `[${mins}:${secs.toString().padStart(2, '0')}] ${m.markerType.replace(/_/g, ' ')}${note}`;
    })
    .join('\n');
}

export function buildFollowupPrompt(opts: {
  sessionData: SessionData;
  tone: FollowupTone;
  clientName: string;
  practitionerName?: string;
  goals?: string;
  regenerationContext?: string[];
}): { systemPrompt: string; userPrompt: string } {
  const { sessionData, tone, clientName, practitionerName, goals, regenerationContext } = opts;

  const sessionDate = sessionData.startedAt.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let userPrompt = `Draft a parent update in "${tone}" tone.

Client name: ${clientName}
${practitionerName ? `Practitioner name: ${practitionerName}` : ''}
Session type: ${sessionData.container}
Session date: ${sessionDate}
Duration: ${sessionData.durationMinutes} minutes

Current goals, if available:
${goals || '(not specified)'}

Session summary:
${sessionData.transcript.length} turns captured across ${sessionData.durationMinutes} minutes.

Key observations:
${formatMarkers(sessionData.markers)}

Transcript:
${formatTranscript(sessionData.transcript)}

Important constraint:
Only include what is well supported by the material above. Keep it parent-facing, practical, and easy to read.`;

  if (regenerationContext && regenerationContext.length > 0) {
    userPrompt += `\n\nPrevious attempt had issues:\n${regenerationContext.join('\n')}\nPlease address these in this version.`;
  }

  return {
    systemPrompt: PARENT_UPDATE_SYSTEM_PROMPT,
    userPrompt,
  };
}

export function buildRepairPrompt(opts: {
  rawText: string;
  zodError: string;
}): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: REPAIR_SYSTEM_PROMPT,
    userPrompt: `Original output that failed validation:\n${opts.rawText}\n\nValidation error:\n${opts.zodError}\n\nReturn corrected JSON only.`,
  };
}
