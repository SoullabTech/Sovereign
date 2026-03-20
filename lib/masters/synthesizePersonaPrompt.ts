/**
 * Synthesize a system prompt block from a trained PractitionerPersona.
 *
 * When a master has trained their Virtual Self, the trained voice_patterns,
 * framework, and boundaries replace the static systemPromptBlock from their
 * field config. This produces a live, evolving prompt that deepens as they train.
 *
 * If the persona has not been meaningfully trained (all defaults), returns null
 * so the static fallback is used instead.
 */

import type { PractitionerPersona } from '@/lib/stellium/types';

export function synthesizePersonaPrompt(
  masterName: string,
  persona: PractitionerPersona
): string | null {
  const voice = persona.voice_patterns as Record<string, unknown> | null;
  const framework = persona.framework as Record<string, unknown> | null;
  const boundaries = persona.boundaries as Record<string, unknown> | null;

  // Check meaningful training has occurred
  const hasVoice = voice && (voice.tone || (voice.phrases as string[])?.length > 0);
  const hasFramework = framework && Object.keys(framework).length > 2;

  if (!hasVoice && !hasFramework) {
    // Not meaningfully trained — use static fallback
    return null;
  }

  const lines: string[] = [
    `You are MAIA, present within ${masterName}'s field.`,
    '',
    `This is ${masterName}'s trained Virtual Self — shaped by their own voice, framework, and scope.`,
    '',
  ];

  if (hasVoice) {
    lines.push('VOICE:');
    if (voice.tone) lines.push(`- Tone: ${voice.tone}`);
    if (voice.style) lines.push(`- Style: ${voice.style}`);
    if (voice.warmth_level) lines.push(`- Warmth: ${voice.warmth_level}`);
    const phrases = voice.phrases as string[] | undefined;
    if (phrases?.length) {
      lines.push('- Natural phrases:');
      phrases.slice(0, 5).forEach(p => lines.push(`  "${p}"`));
    }
    const avoids = voice.avoids as string[] | undefined;
    if (avoids?.length) {
      lines.push(`- Avoid: ${avoids.slice(0, 5).join(', ')}`);
    }
    lines.push('');
  }

  if (hasFramework) {
    lines.push('FRAMEWORK:');
    if (framework.primary) lines.push(`- Primary approach: ${framework.primary}`);
    if (framework.secondary) lines.push(`- Secondary: ${framework.secondary}`);
    const traditions = framework.traditions as string[] | undefined;
    if (traditions?.length) lines.push(`- Traditions: ${traditions.join(', ')}`);
    const specialties = framework.specialties as string[] | undefined;
    if (specialties?.length) lines.push(`- Specialties: ${specialties.join(', ')}`);
    lines.push('');
  }

  if (boundaries) {
    lines.push('SCOPE:');
    if (boundaries.no_predictions) lines.push('- Never make predictions');
    if (boundaries.no_diagnosis) lines.push('- Never diagnose');
    if (boundaries.no_medical_advice) lines.push('- Never give medical advice');
    if (boundaries.refers_for_crisis) lines.push('- Refer out immediately in crisis');
    const custom = boundaries.custom_rules as string[] | undefined;
    if (custom?.length) {
      custom.slice(0, 4).forEach(r => lines.push(`- ${r}`));
    }
    lines.push('');
  }

  lines.push(
    'This persona has been trained by the master themselves. Honor their voice.',
    'Do not overlay your own interpretation — follow their framework and scope precisely.'
  );

  return lines.join('\n');
}
