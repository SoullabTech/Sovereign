/**
 * Knowledge Field — Prompt Injection Block
 *
 * Registry-based prompt composition. Draws from the 12-domain
 * knowledge registry to build context-appropriate prompt blocks.
 *
 * Canon: docs/canon/MAIA_KNOWLEDGE_FIELD_v1.0.md
 *
 * CONSTRAINTS (hard):
 *   - Never flatten traditions into sameness
 *   - Never claim authority over a tradition
 *   - Always name the tradition or domain
 *   - Preserve meaningful differences
 *   - Non-ambient: entered by inquiry, not imposed
 *
 * USAGE:
 *   Inject ADDITIVELY when domain language is detected in user message.
 *   Does not replace base system prompt — adds a knowledge layer.
 *
 *   Activation: feature flag `knowledgeFieldLayer` + domain detection.
 */

import {
  detectKnowledgeDomains,
  getKnowledgeDomain,
  type KnowledgeDomainId,
} from '@/lib/maia/knowledge/knowledgeField';

// ═══════════════════════════════════════════════════════════════
// Default fallback domains (when no specific detection)
// ═══════════════════════════════════════════════════════════════

const DEFAULT_DOMAINS: KnowledgeDomainId[] = [
  'spiralogic',
  'relational_intelligence',
  'jungian_psychology',
  'islamic_psychology',
  'mystical_contemplative',
];

// ═══════════════════════════════════════════════════════════════
// Prompt Builder
// ═══════════════════════════════════════════════════════════════

/**
 * Build a knowledge field prompt block from the registry.
 *
 * When specific domains are detected in the user's message,
 * includes those domains (up to 3). Otherwise includes the
 * default set for general orientation.
 *
 * Returns the prompt block string for injection into systemPrompt.
 */
export function buildKnowledgeFieldBlock(input: string): string {
  const detectedDomains = detectKnowledgeDomains(input);

  // Use detected domains (capped at 3) or fall back to defaults
  const selectedDomains: KnowledgeDomainId[] =
    detectedDomains.length > 0
      ? detectedDomains.slice(0, 3)
      : DEFAULT_DOMAINS;

  const domainSummaries = selectedDomains
    .map((domainId) => getKnowledgeDomain(domainId))
    .filter(Boolean)
    .map(
      (domain) =>
        `- ${domain!.label}: ${domain!.summary} Core orientation: ${domain!.orientation}`
    )
    .join('\n');

  const crossDomain = detectedDomains.length >= 2;

  let block = `
[KNOWLEDGE FIELD]

Use the following knowledge domains when relevant to the member's question:

${domainSummaries}

When using this field:
- name the domain or tradition clearly
- define important terms simply
- relate systems when useful
- preserve distinctions and do not flatten traditions into sameness
- avoid synthetic authority or overclaiming equivalence
- where there are meaningful differences, say so explicitly
- prioritize integration, clarity, and respectful comparison
`.trim();

  if (crossDomain) {
    block += `

Cross-domain inquiry detected. When responding:
- anchor in the first domain, then bridge to the second
- name specifically where they align and where they diverge
- allow the tension between systems to be generative, not resolved
- end with integration, not conclusion
`;
  }

  return '\n\n' + block + '\n';
}

/**
 * Check whether any knowledge domains are present in the input.
 * Lightweight gate for the oracle route — avoids building the full
 * block when no domain language is detected.
 */
export function hasKnowledgeDomainSignal(input: string): boolean {
  return detectKnowledgeDomains(input).length > 0;
}
