/**
 * BUILD VALIDATOR
 *
 * Validates a persona build before activation.
 * Checks structural completeness and safety constraints.
 * Invalid builds cannot be activated.
 */

import type { PersonaBuild, BuildValidationResult } from './trainingTypes';

/**
 * Patterns that indicate an attempt to override system rules.
 * Case-insensitive matching.
 */
const FORBIDDEN_PATTERNS = [
  'ignore previous',
  'ignore all previous',
  'you are not maia',
  'forget your instructions',
  'disregard',
  'override',
  'new instructions',
  'system prompt',
  'jailbreak',
  'pretend you are',
  'act as if you have no',
  'you can now',
  'restrictions removed',
];

/**
 * Patterns indicating unsafe clinical/medical overreach.
 */
const UNSAFE_PATTERNS = [
  'diagnose',
  'prescribe medication',
  'you are a doctor',
  'you are a therapist',
  'medical advice',
  'replace professional',
  'you are qualified to',
  'clinical authority',
  'therapeutic authority',
];

export function validateBuild(build: PersonaBuild): BuildValidationResult {
  const issues: string[] = [];

  // 1. Structural checks — voice and stance must be present
  if (!build.voice_block?.trim()) {
    issues.push('Voice block is empty — build must include voice layer');
  }

  if (!build.stance_block?.trim()) {
    issues.push('Stance block is empty — build must include stance layer');
  }

  if (!build.system_prompt_block?.trim()) {
    issues.push('System prompt block is empty');
  }

  // 2. Safety checks — scan for forbidden patterns
  const fullText = [
    build.voice_block ?? '',
    build.stance_block ?? '',
    build.system_prompt_block ?? '',
  ].join(' ').toLowerCase();

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (fullText.includes(pattern)) {
      issues.push(`Safety: contains forbidden pattern "${pattern}" — potential system override`);
    }
  }

  for (const pattern of UNSAFE_PATTERNS) {
    if (fullText.includes(pattern)) {
      issues.push(`Safety: contains unsafe pattern "${pattern}" — potential clinical overreach`);
    }
  }

  // 3. Size checks — guard against prompt explosion
  const totalLength =
    (build.voice_block?.length ?? 0) +
    (build.stance_block?.length ?? 0) +
    (build.system_prompt_block?.length ?? 0);

  if (totalLength > 15000) {
    issues.push(`Size: total prompt is ${totalLength} chars (max 15000) — too large for reliable oracle behavior`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
