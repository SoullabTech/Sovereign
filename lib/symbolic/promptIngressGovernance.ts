/**
 * Prompt Ingress Governance — Phase 16
 *
 * Governs how governed symbolic outputs may enter MAIA prompts,
 * practitioner views, user-facing views, and memory writes.
 *
 * THE CORE RISK THIS PREVENTS:
 *   Symbolic outputs are carefully governed at formation.
 *   The failure mode appears at ingress: when prompt construction
 *   flattens authoritative, derived, fallback, and blocked items
 *   into one persuasive blob — erasing provenance at the moment of use.
 *
 * INGRESS ROLES:
 *   fact             — authoritative items only; enter as grounded factual context
 *   interpretation   — derived items; enter as interpretive suggestion, clearly tagged
 *   uncertainty      — disagreement or blocked synthesis; enters as open question
 *   question_seed    — fallback items; may seed exploratory questions only
 *   excluded         — blocked/high-risk items; audit-only, never rendered
 *
 * ELIGIBILITY RULES (in order of strictness):
 *
 *   Prompt eligibility (least strict):
 *     authoritative  → allowed as 'fact'
 *     derived        → allowed as 'interpretation'
 *     fallback       → allowed only as 'question_seed' (not as claims)
 *     renderBlocked  → excluded
 *
 *   Practitioner view:
 *     authoritative  → allowed
 *     derived        → allowed (practitioners can interpret)
 *     fallback       → excluded (practitioners should not receive ungrounded claims)
 *     renderBlocked  → excluded
 *
 *   User-facing view (strictest output):
 *     authoritative  → allowed
 *     derived        → allowed only if not assertively framed
 *     fallback       → excluded
 *     renderBlocked  → excluded
 *
 *   Memory write (stricter than prompt):
 *     authoritative  → allowed
 *     derived        → allowed only if not flagged as speculative
 *     fallback       → excluded
 *     renderBlocked  → excluded
 *     blocked claim types (identity, intent, relative_time) → excluded from memory always
 *
 * ABSOLUTE EXCLUSIONS (across all surfaces):
 *   - identity_claim → excluded from prompt, view, memory; audit only
 *   - intent_attribution → excluded from prompt, view, memory; audit only
 *   - relative_time (ungrounded) → excluded from all surfaces
 */

import type {
  SymbolicDomain,
  SymbolicAuthority,
  SymbolicClaimType,
} from '@/lib/symbolic/symbolicAuthorityContracts';

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT ROLE
// How this item may appear in a prompt or surface, if at all.
// ─────────────────────────────────────────────────────────────────────────────

export type PromptRole =
  | 'fact'           // authoritative; enters as grounded context
  | 'interpretation' // derived; enters as interpretive suggestion
  | 'uncertainty'    // blocked synthesis or disagreement; enters as open question
  | 'question_seed'  // fallback; may seed exploratory questions only — not claims
  | 'excluded';      // blocked item; never enters any rendered surface

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT INGRESS ITEM
// The governed shape for any symbolic item attempting to enter a downstream surface.
// ─────────────────────────────────────────────────────────────────────────────

export interface PromptIngressItem {
  traceId: string;
  domain: SymbolicDomain | 'cross_domain';
  text: string;
  authority: SymbolicAuthority;
  renderBlocked: boolean;
  blockReason?: string;
  claimTypes: SymbolicClaimType[];

  /** May this item appear in any prompt context at all? */
  allowedInPrompt: boolean;

  /**
   * May this item appear in practitioner-facing views?
   * Practitioners see more than users but less than audit.
   */
  allowedInPractitionerView: boolean;

  /** May this item appear in user-facing output? */
  allowedInUserView: boolean;

  /**
   * May this item be written to memory?
   * Memory eligibility is stricter than prompt eligibility.
   */
  allowedInMemory: boolean;

  /** How this item may be used if allowed */
  promptRole: PromptRole;
}

// ─────────────────────────────────────────────────────────────────────────────
// ABSOLUTE EXCLUSION CLAIM TYPES
// These claim types are excluded from all rendered surfaces regardless of authority.
// They may only appear in audit records.
// ─────────────────────────────────────────────────────────────────────────────

const ABSOLUTE_EXCLUSION_CLAIMS = new Set<SymbolicClaimType>([
  'identity_claim',
  'relative_time',
]);

// Field-sensing-specific exclusions (imported as string literals for cross-domain use)
const FIELD_ABSOLUTE_EXCLUSION_CLAIMS = new Set<string>([
  'intent_attribution',
  'emotional_attribution', // only excluded when renderBlocked
]);

function hasAbsoluteExclusionClaim(claimTypes: SymbolicClaimType[]): boolean {
  return claimTypes.some(
    ct => ABSOLUTE_EXCLUSION_CLAIMS.has(ct) || FIELD_ABSOLUTE_EXCLUSION_CLAIMS.has(ct)
  );
}

function hasAbsoluteExclusionClaimStrict(claimTypes: SymbolicClaimType[]): boolean {
  // For memory and user-view: identity and intent are always excluded
  return claimTypes.some(
    ct => ABSOLUTE_EXCLUSION_CLAIMS.has(ct) ||
    ct === ('intent_attribution' as SymbolicClaimType)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT ROLE RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the prompt role for an item based on its authority and block status.
 */
export function resolvePromptRole(
  authority: SymbolicAuthority,
  renderBlocked: boolean,
  claimTypes: SymbolicClaimType[]
): PromptRole {
  // Blocked items with absolute exclusion claims: excluded
  if (renderBlocked || hasAbsoluteExclusionClaim(claimTypes)) return 'excluded';

  switch (authority) {
    case 'authoritative': return 'fact';
    case 'derived':       return 'interpretation';
    case 'fallback':      return 'question_seed';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIGIBILITY RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determine all eligibility flags for a symbolic item.
 *
 * Rules matrix:
 *
 *   | authority     | blocked | prompt  | practitioner | user    | memory  |
 *   |---------------|---------|---------|--------------|---------|---------|
 *   | authoritative | no      | yes     | yes          | yes     | yes     |
 *   | derived       | no      | yes     | yes          | yes*    | yes*    |
 *   | fallback      | no      | yes**   | no           | no      | no      |
 *   | any           | yes     | no      | no           | no      | no      |
 *   | absolute excl | —       | no      | no           | no      | no      |
 *
 *   * derived: allowed in user view unless assertively framed; allowed in memory unless speculative
 *   ** fallback: only as question_seed, never as a claim
 */
export function resolveEligibility(
  authority: SymbolicAuthority,
  renderBlocked: boolean,
  claimTypes: SymbolicClaimType[],
  options?: {
    assertivelyFramed?: boolean;
    speculative?: boolean;
  }
): Pick<PromptIngressItem, 'allowedInPrompt' | 'allowedInPractitionerView' | 'allowedInUserView' | 'allowedInMemory'> {
  // Blocked items: excluded from all surfaces
  if (renderBlocked) {
    return { allowedInPrompt: false, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false };
  }

  // Absolute exclusion claims: excluded from all surfaces
  if (hasAbsoluteExclusionClaim(claimTypes)) {
    return { allowedInPrompt: false, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false };
  }

  // Strict exclusion for memory and user-view (intent, identity)
  const strictlyExcluded = hasAbsoluteExclusionClaimStrict(claimTypes);

  switch (authority) {
    case 'authoritative':
      return {
        allowedInPrompt: true,
        allowedInPractitionerView: true,
        allowedInUserView: !strictlyExcluded,
        allowedInMemory: !strictlyExcluded,
      };

    case 'derived':
      return {
        allowedInPrompt: true,
        allowedInPractitionerView: true,
        // Derived items excluded from user view if assertively framed
        allowedInUserView: !strictlyExcluded && !(options?.assertivelyFramed === true),
        // Derived items excluded from memory if marked speculative
        allowedInMemory: !strictlyExcluded && !(options?.speculative === true),
      };

    case 'fallback':
      return {
        allowedInPrompt: true,  // as question_seed only — enforced by promptRole
        allowedInPractitionerView: false,
        allowedInUserView: false,
        allowedInMemory: false,
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD PROMPT INGRESS ITEM
// Compose a fully governed PromptIngressItem from a symbolic item.
// ─────────────────────────────────────────────────────────────────────────────

export interface PromptIngressInput {
  traceId: string;
  domain: PromptIngressItem['domain'];
  text: string;
  authority: SymbolicAuthority;
  renderBlocked: boolean;
  blockReason?: string;
  claimTypes: SymbolicClaimType[];
  assertivelyFramed?: boolean;
  speculative?: boolean;
}

export function buildPromptIngressItem(input: PromptIngressInput): PromptIngressItem {
  const promptRole = resolvePromptRole(input.authority, input.renderBlocked, input.claimTypes);
  const eligibility = resolveEligibility(
    input.authority,
    input.renderBlocked,
    input.claimTypes,
    { assertivelyFramed: input.assertivelyFramed, speculative: input.speculative }
  );

  return {
    traceId: input.traceId,
    domain: input.domain,
    text: input.text,
    authority: input.authority,
    renderBlocked: input.renderBlocked,
    blockReason: input.blockReason,
    claimTypes: input.claimTypes,
    promptRole,
    ...eligibility,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH BUILDERS — FILTER FOR SPECIFIC SURFACES
// ─────────────────────────────────────────────────────────────────────────────

/** Filter a batch of ingress items to only those allowed in prompt context */
export function filterForPrompt(items: PromptIngressItem[]): PromptIngressItem[] {
  return items.filter(i => i.allowedInPrompt);
}

/** Filter a batch to only those allowed in practitioner view */
export function filterForPractitionerView(items: PromptIngressItem[]): PromptIngressItem[] {
  return items.filter(i => i.allowedInPractitionerView);
}

/** Filter a batch to only those allowed in user-facing output */
export function filterForUserView(items: PromptIngressItem[]): PromptIngressItem[] {
  return items.filter(i => i.allowedInUserView);
}

/** Filter a batch to only those eligible for memory write */
export function filterForMemory(items: PromptIngressItem[]): PromptIngressItem[] {
  return items.filter(i => i.allowedInMemory);
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT TEXT ASSEMBLY
// Assemble a governed prompt block from a list of ingress items.
// Items are grouped by promptRole and formatted accordingly.
// ─────────────────────────────────────────────────────────────────────────────

export interface AssembledPromptBlock {
  facts: string[];
  interpretations: string[];
  uncertainties: string[];
  questionSeeds: string[];
  excludedCount: number;
}

/**
 * Assemble a structured prompt block from governed ingress items.
 * Maintains separation between factual context, interpretation, and uncertainty.
 * Excluded items contribute only to the excludedCount — never to text.
 */
export function assemblePromptBlock(items: PromptIngressItem[]): AssembledPromptBlock {
  const block: AssembledPromptBlock = {
    facts: [],
    interpretations: [],
    uncertainties: [],
    questionSeeds: [],
    excludedCount: 0,
  };

  for (const item of items) {
    switch (item.promptRole) {
      case 'fact':
        if (item.text) block.facts.push(item.text);
        break;
      case 'interpretation':
        if (item.text) block.interpretations.push(item.text);
        break;
      case 'uncertainty':
        if (item.text) block.uncertainties.push(item.text);
        break;
      case 'question_seed':
        if (item.text) block.questionSeeds.push(item.text);
        break;
      case 'excluded':
        block.excludedCount++;
        break;
    }
  }

  return block;
}

// ─────────────────────────────────────────────────────────────────────────────
// INGRESS AUDIT SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export interface PromptIngressAuditSummary {
  totalItems: number;
  allowedInPrompt: number;
  allowedInPractitionerView: number;
  allowedInUserView: number;
  allowedInMemory: number;
  excludedFromAll: number;
  byRole: Record<PromptRole, number>;
  byAuthority: Record<SymbolicAuthority, number>;
}

export function buildPromptIngressAuditSummary(
  items: PromptIngressItem[]
): PromptIngressAuditSummary {
  const byRole: Record<PromptRole, number> = {
    fact: 0, interpretation: 0, uncertainty: 0, question_seed: 0, excluded: 0,
  };
  const byAuthority: Record<SymbolicAuthority, number> = {
    authoritative: 0, derived: 0, fallback: 0,
  };

  for (const item of items) {
    byRole[item.promptRole]++;
    byAuthority[item.authority]++;
  }

  const excludedFromAll = items.filter(
    i => !i.allowedInPrompt && !i.allowedInPractitionerView &&
         !i.allowedInUserView && !i.allowedInMemory
  ).length;

  return {
    totalItems: items.length,
    allowedInPrompt: items.filter(i => i.allowedInPrompt).length,
    allowedInPractitionerView: items.filter(i => i.allowedInPractitionerView).length,
    allowedInUserView: items.filter(i => i.allowedInUserView).length,
    allowedInMemory: items.filter(i => i.allowedInMemory).length,
    excludedFromAll,
    byRole,
    byAuthority,
  };
}
