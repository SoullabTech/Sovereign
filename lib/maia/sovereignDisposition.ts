/**
 * Sovereign Corpus Disposition — MIPA Phase 0, P1c.
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P1c
 *
 * ── WHAT P1b LEFT OPEN ──────────────────────────────────────────────────────
 *
 *     CLASSIFIED  ≠  MEMBER-ACCESSIBLE  ≠  MEMBER-GOVERNABLE  ≠  PARTICIPATION-EXCLUDED
 *
 * P1b said what the 40 representations ARE. It deliberately had no runtime
 * authority, which means it changed nothing about what the member can do or
 * what MAIA may use. This module assigns each representation an ENFORCEABLE
 * disposition and is the source the export is built from.
 *
 * ── THE GOVERNING INVARIANT ─────────────────────────────────────────────────
 *
 *   MAIA may not have durable participatory access to a representation about
 *   the member that the member has neither meaningful access to nor meaningful
 *   sovereignty over.
 *
 * For a SYSTEM representation the covenant closes on one side or the other:
 *
 *     the member can meaningfully access it        OR      it cannot participate
 *
 * There is no third state in which MAIA uses an interpretation the member
 * cannot discover.
 *
 * ── THE POLICY THIS LEDGER APPLIES (and why the class counts are not it) ────
 *
 * P1b's preliminary arithmetic was "16 canonical + 10 system = 26 owed". That
 * is a class count, not a policy. The obligation is derived here instead:
 *
 *   1. CANONICAL_MEMBER_RECORD  → EXPORT, always. The member's own material.
 *   2. SYSTEM_REPRESENTATION_ABOUT_MEMBER →
 *        EXCLUDE alone is sufficient ONLY where every reader inside the live
 *        composition closure is covered by a certified exclusion. Otherwise the
 *        covenant closes on the ACCESS side and the representation is EXPORTed
 *        with its authorship and epistemic class stated.
 *   3. DERIVED_IMPLEMENTATION_ARTIFACT →
 *        EXEMPT requires all three proofs (regenerable · no independent claim ·
 *        no participation authority). A historical log is NOT regenerable, so
 *        two of the three "derived" artifacts do not qualify and are EXPORTed.
 *   4. OPERATIONAL_OR_SECURITY → EXEMPT from MAIA-memory export. Truthful
 *        connection STATE, never the secret. (Already repaired in P1a.)
 *   5. UNKNOWN → no permissive default. Either a certified non-participation,
 *        or it is an unresolved P1 blocker. Never resolved by guessing.
 *
 * ── HOW NON-PARTICIPATION IS PROVEN, AND WHERE THE CEILING IS ───────────────
 *
 * Two bases are accepted, and only two:
 *
 *   `certified_gate`  — a named refusal with a certification suite on disk that
 *                       covers the reader.
 *   `not_reachable`   — no module reading the representation is in the import
 *                       closure of the declared live composition entry points.
 *                       Sound in the safe direction: no import path exists, so
 *                       no call can. Recomputed by the certification suite, so
 *                       adding one import flips the verdict.
 *
 * `not_reachable` is an over-approximation the other way: a module being IN the
 * closure is NOT proof that it composes. That distinction is the P3 Closed-Set
 * Certification ceiling (outcome C) — no source-level property separates a
 * template that becomes prompt text from one that becomes a console line. So
 * in-closure-without-a-gate is never recorded here as "excluded". It is either
 * closed on the access side, or named as an exposure.
 *
 * ── INSPECT IS ASSERTED ONLY WHERE A SURFACE EXISTS ─────────────────────────
 *
 * INSPECT means the member can actually see that MAIA holds this, with its
 * provenance. It is claimed for exactly one representation, because exactly one
 * has an authenticated member-scoped route that serves it. Inventing the P4/P5
 * correction and endorsement gestures to make more representations "governable"
 * is out of scope for Phase 0 and is not done here.
 */

import { SOVEREIGN_CORPUS, type CorpusKey } from './sovereignCorpus';

export type Disposition = 'EXPORT' | 'INSPECT' | 'EXCLUDE' | 'EXEMPT';

/** Refusals whose certification suites exist on disk. */
export type CertifiedGate = 'R24' | 'R25' | 'R26' | 'R27' | 'P3e' | 'P1c';

export type ExclusionBasis =
  | {
      kind: 'certified_gate';
      gates: readonly CertifiedGate[];
      /** Suites that must exist for the claim to stand. */
      suites: readonly string[];
      /** Readers covered — the claim is per-path and says so. */
      scope: string;
    }
  | {
      kind: 'not_reachable';
      /** Reader modules, all of which must be OUTSIDE the live closure. */
      readers: readonly string[];
      scope: string;
    }
  | {
      kind: 'unresolved';
      /** Named exposure. Blocks P1 closure. */
      exposure: string;
    };

/** All three are required before EXEMPT may be claimed. */
export interface ExemptionProof {
  regenerableFrom: string;
  noIndependentClaim: string;
  noParticipationAuthority: string;
}

/** A member-facing surface that actually exists, for an INSPECT claim. */
export interface InspectSurface {
  route: string;
  /** Authenticated and bound to the session subject, not a query parameter. */
  memberScoped: true;
}

/**
 * A logical representation to hand the member — not a table dump.
 *
 * Columns are named explicitly and every one is checked against the real
 * schema by the certification suite, so P1a's five fictional columns cannot
 * recur by a different route.
 */
export interface LogicalExportSpec {
  /** What this IS, in the member's terms. */
  logicalType: string;
  authorship: 'member' | 'system' | 'mixed';
  authorityClass:
    | 'testimony'
    | 'member_act'
    | 'observation'
    | 'inference'
    | 'routing_state'
    | 'unresolved';
  table: string;
  memberKey: 'member_id' | 'user_id';
  select: readonly string[];
  /** SQL expressions rendered as booleans/derived values — e.g. embedding presence. */
  computed?: readonly { readonly as: string; readonly expr: string }[];
  /** Column the export orders by, newest first. */
  temporalField: string;
  /** Per-field authorship where the row is mixed. */
  fieldAuthorship?: Readonly<Record<string, 'member' | 'system'>>;
  /** Stated to the member wherever provenance is not resolved. */
  uncertainty?: string;
  /**
   * Already served by the pre-existing export sections. Kept in the ledger so
   * the obligation is visible, but not re-queried.
   */
  servedBy?: 'legacy_section';
}

export interface DispositionEntry {
  /** Non-empty by construction: there is no permissive default. */
  dispositions: readonly [Disposition, ...Disposition[]];
  rationale: string;
  exclusion?: ExclusionBasis;
  exemption?: ExemptionProof;
  inspect?: InspectSurface;
  export?: LogicalExportSpec;
  /**
   * Certified exclusions that exist but do NOT cover every in-closure reader.
   * Recorded so a partial gate is never read as a whole one.
   */
  partialGates?: readonly CertifiedGate[];
}

/** Columns that must never leave as autobiographical memory. */
export const FORBIDDEN_EXPORT_COLUMNS: readonly string[] = [
  'access_token',
  'refresh_token',
  'password_hash',
  'passkey_hash',
  'token',
  'secret',
  'client_secret',
  'api_key',
];

/**
 * A conversation history can be very long. A silently truncated export is the
 * P1a failure in another costume, so the cap is declared here and the export
 * REPORTS when it is reached.
 */
export const EXPORT_ROW_CAP = 5000;

const LIVE_COMPOSITION_ENTRY_POINTS: readonly string[] = [
  'app/api/sovereign/app/maia/route.ts',
  'app/api/sovereign/app/maia/list/route.ts',
  'app/api/sovereign/app/maia/voice/route.ts',
  'lib/sovereign/maiaService.ts',
  'lib/sovereign/maiaVoice.ts',
];

export { LIVE_COMPOSITION_ENTRY_POINTS };

const NOT_REACHABLE_SCOPE =
  'no reader module lies in the import closure of the declared live composition entry points';

/**
 * The disposition of every classified representation.
 *
 * Typed as a total function over `CorpusKey`: adding a representation to the
 * P1b corpus without disposing it here is a COMPILE error, not a review miss.
 */
export const SOVEREIGN_DISPOSITION: Record<CorpusKey, DispositionEntry> = {
  // ── CANONICAL MEMBER RECORD — the member's own material, always EXPORT ────

  members: {
    dispositions: ['EXPORT'],
    rationale:
      'The member profile, supplied by the member at registration. Already served by the export section that predates P1c.',
    export: {
      logicalType: 'Your profile',
      authorship: 'member',
      authorityClass: 'member_act',
      table: 'members',
      memberKey: 'member_id',
      select: [],
      temporalField: 'created_at',
      servedBy: 'legacy_section',
    },
  },

  member_settings: {
    dispositions: ['EXPORT'],
    rationale: 'Preferences the member chose through the authenticated settings surface.',
    export: {
      logicalType: 'Your settings and preferences',
      authorship: 'member',
      authorityClass: 'member_act',
      table: 'member_settings',
      memberKey: 'member_id',
      select: [],
      temporalField: 'created_at',
      servedBy: 'legacy_section',
    },
  },

  conversation_turns: {
    dispositions: ['EXPORT'],
    rationale:
      'Verbatim utterances. `role` discriminates the member\'s own words from MAIA\'s, so the export carries the discriminant rather than flattening both into "conversation".',
    export: {
      logicalType: 'What was actually said, turn by turn',
      authorship: 'mixed',
      authorityClass: 'testimony',
      table: 'conversation_turns',
      memberKey: 'user_id',
      select: ['id', 'session_id', 'role', 'content', 'visibility', 'created_at'],
      temporalField: 'created_at',
      fieldAuthorship: { content: 'member' },
      uncertainty:
        'Rows with role="assistant" are MAIA\'s words, not yours. The `role` field is the discriminant.',
    },
  },

  quick_journal_entries: {
    dispositions: ['EXPORT'],
    rationale: 'Member-written journal entries captured through an authenticated gesture.',
    export: {
      logicalType: 'Your quick journal entries',
      authorship: 'member',
      authorityClass: 'testimony',
      table: 'quick_journal_entries',
      memberKey: 'user_id',
      select: ['id', 'entry_type', 'content', 'tags', 'source', 'created_at'],
      temporalField: 'created_at',
    },
  },

  elemental_journal_entries: {
    dispositions: ['EXPORT'],
    rationale: 'Member-written entries against an elemental practice prompt.',
    export: {
      logicalType: 'Your elemental journal entries',
      authorship: 'mixed',
      authorityClass: 'testimony',
      table: 'elemental_journal_entries',
      memberKey: 'user_id',
      select: [
        'id',
        'element',
        'chapter_num',
        'practice_id',
        'prompt',
        'content',
        'insights',
        'mood',
        'tags',
        'created_at',
      ],
      temporalField: 'created_at',
      fieldAuthorship: { content: 'member', insights: 'member', prompt: 'system' },
    },
  },

  member_memory_atoms: {
    dispositions: ['EXPORT'],
    rationale:
      'Kept by an explicit member gesture. Practitioner-observation rows are attributed and carry their epistemological status, which the export preserves rather than laundering into "your memory".',
    export: {
      logicalType: 'Memories you chose to keep',
      authorship: 'mixed',
      authorityClass: 'member_act',
      table: 'member_memory_atoms',
      memberKey: 'member_id',
      select: [
        'id',
        'source_type',
        'title',
        'body',
        'primary_register',
        'registers',
        'elemental_lenses',
        'status',
        'kept_at',
        'return_preference',
        'surface_count',
        'last_surfaced_at',
        'is_breakthrough',
        'marked_breakthrough_at',
        'epistemological_status',
        'provenance',
        'memory_scope',
        'generated_by',
        'created_at',
      ],
      temporalField: 'created_at',
      fieldAuthorship: { body: 'member', epistemological_status: 'system', provenance: 'system' },
      uncertainty:
        'Rows whose `source_type` is a practitioner observation were authored by a practitioner about you, not by you. `epistemological_status` and `provenance` carry that framing.',
    },
  },

  episodic_memories: {
    dispositions: ['EXPORT'],
    rationale:
      'Marked by an explicit member gesture; `marked_by_member` plus `verbatim_text` is the provenance the loader gate depends on, so both are exported.',
    export: {
      logicalType: 'Episodes you marked',
      authorship: 'mixed',
      authorityClass: 'member_act',
      table: 'episodic_memories',
      memberKey: 'user_id',
      select: [
        'id',
        'episode_id',
        'timestamp',
        'experience_title',
        'experience_description',
        'experience_context',
        'significance',
        'marked_by_member',
        'verbatim_text',
        'spiral_stage',
        'created_at',
      ],
      computed: [
        { as: 'has_semantic_vector', expr: 'semantic_vector IS NOT NULL' },
      ],
      temporalField: 'created_at',
      fieldAuthorship: {
        verbatim_text: 'member',
        experience_title: 'system',
        experience_description: 'system',
        significance: 'system',
      },
      uncertainty:
        'Only `verbatim_text` is your own words. The title, description and significance score are MAIA\'s.',
    },
  },

  member_ideas: {
    dispositions: ['EXPORT'],
    rationale:
      'Ideas the member captured through an authenticated gesture — their own framing, in their own words.',
    export: {
      logicalType: 'Ideas you captured',
      authorship: 'member',
      authorityClass: 'member_act',
      table: 'member_ideas',
      memberKey: 'member_id',
      select: ['id', 'title', 'framing', 'status', 'tags', 'created_at', 'last_entered_at'],
      temporalField: 'created_at',
    },
  },

  member_idea_blocks: {
    dispositions: ['EXPORT'],
    rationale:
      'Member-authored blocks written inside an idea. The block text is testimony, not a system rendering of it.',
    export: {
      logicalType: 'What you wrote inside your ideas',
      authorship: 'member',
      authorityClass: 'testimony',
      table: 'member_idea_blocks',
      memberKey: 'member_id',
      select: ['id', 'idea_id', 'block_type', 'content', 'created_at'],
      temporalField: 'created_at',
    },
  },

  member_organizing_principles: {
    dispositions: ['EXPORT'],
    rationale: 'Principles the member declared for themselves.',
    export: {
      logicalType: 'Principles you declared',
      authorship: 'member',
      authorityClass: 'member_act',
      table: 'member_organizing_principles',
      memberKey: 'member_id',
      select: [
        'id',
        'title',
        'principle',
        'question_answered',
        'evidence',
        'status',
        'created_at',
        'accepted_at',
      ],
      temporalField: 'created_at',
    },
  },

  capture_notes: {
    dispositions: ['EXPORT'],
    rationale:
      'Notes the member typed during a session, with their own tag. Member testimony captured at the moment it was made.',
    export: {
      logicalType: 'Notes you captured during sessions',
      authorship: 'member',
      authorityClass: 'testimony',
      table: 'capture_notes',
      memberKey: 'user_id',
      select: ['id', 'session_id', 'offset_ms', 'tag', 'text', 'created_at'],
      temporalField: 'created_at',
    },
  },

  personal_states: {
    dispositions: ['EXPORT'],
    rationale:
      'The member names the state and its intensity themselves; nothing here is a reading MAIA took of them.',
    export: {
      logicalType: 'States you named for yourself',
      authorship: 'member',
      authorityClass: 'testimony',
      table: 'personal_states',
      memberKey: 'member_id',
      select: ['id', 'state_key', 'label', 'intensity', 'source_type', 'created_at'],
      temporalField: 'created_at',
    },
  },

  personal_living_fields: {
    dispositions: ['EXPORT'],
    rationale:
      'The member writes the current expression of a living field in their own words; the field key is the only system-supplied part.',
    export: {
      logicalType: 'How you described your living fields',
      authorship: 'member',
      authorityClass: 'testimony',
      table: 'personal_living_fields',
      memberKey: 'member_id',
      select: ['id', 'field_key', 'current_expression', 'status', 'created_at', 'updated_at'],
      temporalField: 'created_at',
    },
  },

  preference_confirmations: {
    dispositions: ['EXPORT'],
    rationale:
      'The nearest thing the system currently has to a correction act: the member confirming or correcting a stored memory. Exporting it is what makes those acts visible as a record.',
    export: {
      logicalType: 'Times you confirmed or corrected what MAIA held',
      authorship: 'member',
      authorityClass: 'member_act',
      table: 'preference_confirmations',
      memberKey: 'user_id',
      select: [
        'id',
        'memory_id',
        'action',
        'previous_content',
        'new_content',
        'triggered_by',
        'created_at',
      ],
      temporalField: 'created_at',
      fieldAuthorship: { new_content: 'member', previous_content: 'system' },
    },
  },

  member_daily_anchors: {
    dispositions: ['EXPORT'],
    rationale:
      'Field-mixed: `response` is the member\'s own words, `prompt_shown` is system-authored. A table-level verdict would launder one into the other, so both are exported with their authorship stated.',
    export: {
      logicalType: 'Your daily anchors',
      authorship: 'mixed',
      authorityClass: 'testimony',
      table: 'member_daily_anchors',
      memberKey: 'member_id',
      select: [
        'id',
        'anchor_date',
        'prompt_shown',
        'response',
        'surface_preference',
        'created_at',
      ],
      temporalField: 'created_at',
      fieldAuthorship: { response: 'member', prompt_shown: 'system' },
    },
  },

  member_lens_passes: {
    dispositions: ['EXPORT'],
    rationale:
      'Field-mixed: `member_response` is member-authored; `prompt` and `lens` are the system\'s framing.',
    export: {
      logicalType: 'Your responses to lens prompts',
      authorship: 'mixed',
      authorityClass: 'testimony',
      table: 'member_lens_passes',
      memberKey: 'member_id',
      select: ['id', 'memory_atom_id', 'lens', 'prompt', 'member_response', 'created_at'],
      temporalField: 'created_at',
      fieldAuthorship: { member_response: 'member', prompt: 'system', lens: 'system' },
    },
  },

  // ── SYSTEM REPRESENTATION ABOUT THE MEMBER ────────────────────────────────

  developmental_memories: {
    dispositions: ['EXPORT'],
    rationale:
      'Machine-distilled from an LLM signal, with no authorship column. Already exported (P1a corrected its five fictional columns), so the covenant closes on the access side. It also carries certified exclusions — but those are per-path claims, not a whole-system one.',
    partialGates: ['R24', 'R26'],
    export: {
      logicalType: 'What MAIA distilled about your development',
      authorship: 'system',
      authorityClass: 'inference',
      table: 'developmental_memories',
      memberKey: 'user_id',
      select: [],
      temporalField: 'formed_at',
      servedBy: 'legacy_section',
      uncertainty:
        'These are MAIA\'s inferences about you, not statements you made. No authorship column exists on these rows.',
    },
  },

  member_sessions: {
    dispositions: ['EXPORT', 'EXCLUDE'],
    rationale:
      'The `summary` is machine-generated: member material plus machine summarisation is a newly authored object, never member testimony. Exported already, and no reader is in the live composition closure.',
    exclusion: {
      kind: 'not_reachable',
      readers: [
        'lib/memory/stores/SessionSummaryStore.ts',
        'app/api/sovereign/episodes/mark/route.ts',
        'app/api/members/delete-account/route.ts',
        'app/api/members/export-data/route.ts',
      ],
      scope: NOT_REACHABLE_SCOPE,
    },
    export: {
      logicalType: 'MAIA\'s summaries of your sessions',
      authorship: 'system',
      authorityClass: 'inference',
      table: 'member_sessions',
      memberKey: 'member_id',
      select: [],
      temporalField: 'started_at',
      servedBy: 'legacy_section',
      uncertainty: 'The `summary` was written by MAIA about the session, not by you.',
    },
  },

  breakthrough_moments: {
    dispositions: ['EXPORT'],
    rationale:
      'Machine-extracted insight fired by a significance threshold plus a heuristic. Two composers are certifiably closed (R25 in MemoryBundle, P1c in RelationshipMemoryService) but a THIRD is not: lib/memory/MemoryOrchestrator.ts composes a "RECENT BREAKTHROUGHS" block from BreakthroughStore and is imported by lib/sovereign/maiaService.ts. Since non-participation cannot be claimed whole, the covenant closes on the access side instead.',
    partialGates: ['R25', 'P1c'],
    export: {
      logicalType: 'Moments MAIA marked as breakthroughs',
      authorship: 'system',
      authorityClass: 'inference',
      table: 'breakthrough_moments',
      memberKey: 'user_id',
      select: [
        'id',
        'timestamp',
        'insight',
        'element',
        'integrated',
        'related_themes',
        'created_at',
      ],
      temporalField: 'created_at',
      uncertainty:
        'MAIA decided these were breakthroughs and wrote the wording. You did not mark them.',
    },
  },

  member_theme_signals: {
    dispositions: ['EXPORT'],
    rationale:
      'Automatic per-turn scored inference. R24 closes the memoryLoaders path; participatoryRealityHelper is also inside the live closure and is not gated, so the covenant closes on the access side.',
    partialGates: ['R24'],
    export: {
      logicalType: 'Themes MAIA detected in what you said',
      authorship: 'system',
      authorityClass: 'inference',
      table: 'member_theme_signals',
      memberKey: 'member_id',
      select: [
        'id',
        'session_id',
        'theme',
        'signal_type',
        'resonance_strength',
        'element',
        'context',
        'detected_at',
      ],
      temporalField: 'detected_at',
      uncertainty:
        'Detected automatically per turn and scored by MAIA. You never confirmed these.',
    },
  },

  conversation_themes: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Machine-detected themes. The only reader inside the live composition closure is RelationshipMemoryService, and P1c partitions them out of the composition-eligible view: reaching them from the formatter is now a type error.',
    exclusion: {
      kind: 'certified_gate',
      gates: ['P1c'],
      suites: ['__tests__/mipa-p1c-sovereign-disposition.test.ts'],
      scope:
        'lib/memory/RelationshipMemoryService.ts — the only in-closure reader; formatRelationshipMemoryForPrompt takes CertifiedRelationshipMemory, which has no themes field',
    },
  },

  relationship_patterns: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Machine-inferred relational patterns, same single in-closure reader and same structural partition.',
    exclusion: {
      kind: 'certified_gate',
      gates: ['P1c'],
      suites: ['__tests__/mipa-p1c-sovereign-disposition.test.ts'],
      scope:
        'lib/memory/RelationshipMemoryService.ts — the only in-closure reader; CertifiedRelationshipMemory declares no patterns field',
    },
  },

  relationship_essences: {
    dispositions: ['EXPORT', 'INSPECT'],
    rationale:
      'A machine-composed essence of the relationship. P1c reduces RelationshipMemoryService to a boolean, but RelationshipAnamnesisStorage and RelationshipAnamnesisPostgres are also inside the live closure and are not gated. It is the one representation with a real member-facing surface, so it carries INSPECT as well.',
    inspect: { route: 'app/api/relationship-essence/route.ts', memberScoped: true },
    export: {
      logicalType: 'MAIA\'s sense of the relationship',
      authorship: 'system',
      authorityClass: 'inference',
      table: 'relationship_essences',
      memberKey: 'user_id',
      select: [
        'id',
        'user_name',
        'presence_quality',
        'archetypal_resonances',
        'spiral_position',
        'relationship_field',
        'first_encounter',
        'last_encounter',
        'encounter_count',
        'created_at',
      ],
      temporalField: 'created_at',
      uncertainty:
        'Composed by MAIA about the relationship. None of it is a statement you made.',
    },
  },

  user_relationship_context: {
    dispositions: ['EXPORT'],
    rationale:
      'Machine-maintained relational state. lib/memory/MemoryOrchestrator.ts composes a "RELATIONSHIP CONTEXT" block from it — conversation_history_summary, recurring_themes, consciousness_journey_stage — and is imported by maiaService. Non-participation is not claimable, so it is exported. Embedding columns are reported as presence only: a raw vector is not something a member can read, and dumping it would be topology, not sovereignty.',
    export: {
      logicalType: 'MAIA\'s running picture of you',
      authorship: 'system',
      authorityClass: 'inference',
      table: 'user_relationship_context',
      memberKey: 'user_id',
      select: [
        'preferred_name',
        'communication_style',
        'conversation_history_summary',
        'recurring_themes',
        'evolution_patterns',
        'spiral_development',
        'elemental_affinities',
        'total_sessions',
        'relationship_depth',
        'consciousness_journey_stage',
        'created_at',
        'updated_at',
      ],
      computed: [
        { as: 'has_relationship_embedding', expr: 'relationship_embedding IS NOT NULL' },
        { as: 'has_personality_embedding', expr: 'personality_embedding IS NOT NULL' },
      ],
      temporalField: 'updated_at',
      fieldAuthorship: { preferred_name: 'member' },
      uncertainty:
        'Except for `preferred_name`, this is MAIA\'s characterisation of you, maintained automatically.',
    },
  },

  selflet_nodes: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Machine-derived phase, element, archetypes, emotions and a continuity score. Its only reader, SelfletChain, is outside the live composition closure.',
    exclusion: {
      kind: 'not_reachable',
      readers: ['lib/memory/selflet/SelfletChain.ts'],
      scope: NOT_REACHABLE_SCOPE,
    },
  },

  reflection_capsules: {
    dispositions: ['EXPORT'],
    rationale:
      'A machine summarisation of member material — a newly authored object under the transformation rule. lib/psyche/sources/capsule.ts is inside the live closure and is not gated, so the covenant closes on the access side. `source_excerpt` is the member\'s own words and is exported as theirs.',
    export: {
      logicalType: 'MAIA\'s reflection capsules',
      authorship: 'mixed',
      authorityClass: 'inference',
      table: 'reflection_capsules',
      memberKey: 'user_id',
      select: [
        'id',
        'source_type',
        'title',
        'summary',
        'gold_lines',
        'decisions',
        'next_steps',
        'practices',
        'patterns',
        'signals',
        'tags',
        'source_excerpt',
        'pinned',
        'archived',
        'created_at',
      ],
      temporalField: 'created_at',
      fieldAuthorship: { source_excerpt: 'member', summary: 'system', patterns: 'system' },
      uncertainty:
        'The summary, patterns and signals are MAIA\'s. Only `source_excerpt` is your own words.',
    },
  },

  state_vectors: {
    dispositions: ['EXPORT'],
    rationale:
      'Reclassified from UNKNOWN in P1c: MAIA emits a fenced STATE_VECTOR block in its own response, parseStateVector reads it back and storeStateVector persists it. A MAIA-authored reading of the member. The read functions have no caller inside the live closure, but the module is in it and the P3-CSC ceiling forbids turning that into a non-participation claim, so it is exported.',
    export: {
      logicalType: 'MAIA\'s readings of your state',
      authorship: 'system',
      authorityClass: 'inference',
      table: 'state_vectors',
      memberKey: 'member_id',
      select: [
        'id',
        'session_id',
        'source',
        'primary_element',
        'primary_facet_code',
        'primary_phase',
        'primary_intensity',
        'primary_polarity',
        'primary_stability',
        'secondary_element',
        'confidence',
        'kairos_assessment',
        'kairos_confidence',
        'kairos_description',
        'movement',
        'evidence',
        'created_at',
      ],
      temporalField: 'created_at',
      uncertainty:
        'MAIA produced these readings about you inside its own response. You never stated them, and they carry a confidence score MAIA assigned.',
    },
  },

  // ── DERIVED IMPLEMENTATION ARTIFACT ───────────────────────────────────────

  conversation_memory_uses: {
    dispositions: ['EXPORT'],
    rationale:
      'EXEMPT is refused here. It is a historical audit trail of which memories were retrieved into which turn — it cannot be regenerated from a sovereign source, and a record of what MAIA used about you is exactly the kind of thing sovereignty exists to make visible.',
    export: {
      logicalType: 'Which memories MAIA drew on, and when',
      authorship: 'system',
      authorityClass: 'routing_state',
      table: 'conversation_memory_uses',
      memberKey: 'user_id',
      select: [
        'id',
        'session_id',
        'message_id',
        'memory_table',
        'memory_id',
        'used_as',
        'retrieval_score',
        'user_feedback',
        'feedback_note',
        'created_at',
      ],
      temporalField: 'created_at',
      fieldAuthorship: { user_feedback: 'member', feedback_note: 'member' },
    },
  },

  memory_links: {
    dispositions: ['EXPORT'],
    rationale:
      'EXEMPT is refused here too. A link asserting that two of your memories are related IS an independent claim, and it is not regenerable — `created_by` records who or what asserted it.',
    export: {
      logicalType: 'Connections MAIA drew between your memories',
      authorship: 'system',
      authorityClass: 'inference',
      table: 'memory_links',
      memberKey: 'user_id',
      select: [
        'id',
        'from_table',
        'from_id',
        'to_table',
        'to_id',
        'link_type',
        'weight',
        'confidence',
        'created_by',
        'created_at',
      ],
      temporalField: 'created_at',
    },
  },

  living_field_affinities: {
    dispositions: ['EXEMPT'],
    rationale:
      'The one derived artifact that satisfies all three exemption conditions.',
    exemption: {
      regenerableFrom:
        'member_memory_atoms — indexAtom rebuilds the affinity index from atoms that are themselves EXPORTed',
      noIndependentClaim:
        'an affinity weight over already-classified atoms; it asserts nothing about the member that the atoms do not already carry',
      noParticipationAuthority:
        'no reader lies in the import closure of the live composition entry points',
    },
  },

  // ── OPERATIONAL / SECURITY ────────────────────────────────────────────────

  google_calendar_credentials: {
    dispositions: ['EXEMPT'],
    rationale:
      'OAuth access and refresh tokens. The member is owed a truthful connection STATE — which P1a already made honest, including the third state "unknown" when the read fails — and never the secrets.',
    exemption: {
      regenerableFrom: 're-authorisation by the member; a token is not autobiography',
      noIndependentClaim: 'a credential says nothing about the member',
      noParticipationAuthority:
        'no reader lies in the import closure of the live composition entry points',
    },
  },

  // ── UNKNOWN — no permissive default ───────────────────────────────────────

  bardic_cues: {
    dispositions: ['EXPORT', 'EXCLUDE'],
    rationale:
      'Field-mixed and unresolved: `user_words` reads as the member\'s own, but no source evidence establishes who supplies it at the call site. Non-participation is certified by reachability. The member\'s words are exported anyway, with the uncertainty stated rather than resolved — authority follows the smallest certifiable representation, and withholding a person\'s possible words because the container is unclassified would be the wrong error.',
    exclusion: {
      kind: 'not_reachable',
      readers: ['lib/memory/bardic/storage/CueRepo.ts'],
      scope: NOT_REACHABLE_SCOPE,
    },
    export: {
      logicalType: 'Bardic cues held about you',
      authorship: 'mixed',
      authorityClass: 'unresolved',
      table: 'bardic_cues',
      memberKey: 'user_id',
      select: ['id', 'cue_type', 'cue_key', 'user_words', 'media_ref', 'metadata', 'created_at'],
      temporalField: 'created_at',
      fieldAuthorship: { user_words: 'member', cue_type: 'system', metadata: 'system' },
      uncertainty:
        'PROVENANCE UNRESOLVED. `user_words` may be your own words or may have been extracted on your behalf — the code that writes this does not establish which. It is shown to you rather than guessed about.',
    },
  },

  bardic_microacts: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Authorship of `description` is not established by the write path, so it fails closed. Non-participation is certified by reachability.',
    exclusion: {
      kind: 'not_reachable',
      readers: ['lib/memory/bardic/storage/RecallRepo.ts'],
      scope: NOT_REACHABLE_SCOPE,
    },
  },

  teloi: {
    dispositions: ['EXCLUDE'],
    rationale:
      'A phrase stored with a machine-assigned strength and signals, but the write path does not establish who supplied the phrase. Fails closed; non-participation certified by reachability.',
    exclusion: {
      kind: 'not_reachable',
      readers: ['lib/memory/bardic/storage/TeleologyRepo.ts'],
      scope: NOT_REACHABLE_SCOPE,
    },
  },

  episodes: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Not established whether the member supplied the place and sense cues or they were extracted. Fails closed; certified non-participation.',
    exclusion: {
      kind: 'not_reachable',
      readers: [
        'lib/services/episodeService.ts',
        'lib/memory/bardic/storage/TeleologyRepo.ts',
        'lib/memory/bardic/storage/ReentryRepo.ts',
      ],
      scope: NOT_REACHABLE_SCOPE,
    },
  },

  episode_links: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Re-checked in P1c under a widened writer search — including the insertOne() helper family that the original INSERT INTO scan was blind to — and it remains genuinely writer-less in this tree. LinkingRepo writes bardic_links, a different table. Read-but-never-written; certified non-participation.',
    exclusion: {
      kind: 'not_reachable',
      readers: [
        'lib/memory/bardic/storage/LinkingRepo.ts',
        'lib/memory/bardic/storage/ReentryRepo.ts',
        'lib/memory/bardic/storage/RecognitionRepo.ts',
      ],
      scope: NOT_REACHABLE_SCOPE,
    },
  },

  selflet_messages: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Member-facing archive and snooze routes exist, but no source evidence establishes who authors the message. Fails closed; certified non-participation.',
    exclusion: {
      kind: 'not_reachable',
      readers: ['lib/memory/selflet/SelfletChain.ts'],
      scope: NOT_REACHABLE_SCOPE,
    },
  },

  selflet_boundaries: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Written by SelfletChain, whose write path does not establish who authors the content. Fails closed; non-participation certified by reachability.',
    exclusion: {
      kind: 'not_reachable',
      readers: ['lib/memory/selflet/SelfletChain.ts'],
      scope: NOT_REACHABLE_SCOPE,
    },
  },

  selflet_metamorphosis: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Written by SelfletChain, whose write path does not establish who authors the content. Fails closed; non-participation certified by reachability.',
    exclusion: {
      kind: 'not_reachable',
      readers: ['lib/memory/selflet/SelfletChain.ts'],
      scope: NOT_REACHABLE_SCOPE,
    },
  },

  selflet_reinterpretations: {
    dispositions: ['EXCLUDE'],
    rationale:
      'Written by SelfletChain, whose write path does not establish who authors the content. Fails closed; non-participation certified by reachability.',
    exclusion: {
      kind: 'not_reachable',
      readers: ['lib/memory/selflet/SelfletChain.ts'],
      scope: NOT_REACHABLE_SCOPE,
    },
  },
};

// ── DERIVED VIEWS ────────────────────────────────────────────────────────────

/** Every representation the export must actually query. */
export const OWED_LOGICAL_EXPORTS: readonly CorpusKey[] = (
  Object.keys(SOVEREIGN_DISPOSITION) as CorpusKey[]
).filter((k) => {
  const e = SOVEREIGN_DISPOSITION[k];
  return e.dispositions.includes('EXPORT') && !!e.export && e.export.servedBy !== 'legacy_section';
});

/** Owed to the member, but served by the export sections that predate P1c. */
export const LEGACY_SERVED_EXPORTS: readonly CorpusKey[] = (
  Object.keys(SOVEREIGN_DISPOSITION) as CorpusKey[]
).filter((k) => SOVEREIGN_DISPOSITION[k].export?.servedBy === 'legacy_section');

/**
 * Representations that can still participate outside the member-governable
 * corpus. P1 cannot be proposed complete while this is non-empty.
 */
export const UNRESOLVED_P1_BLOCKERS: readonly CorpusKey[] = (
  Object.keys(SOVEREIGN_DISPOSITION) as CorpusKey[]
).filter((k) => SOVEREIGN_DISPOSITION[k].exclusion?.kind === 'unresolved');

/**
 * The covenant, evaluated. A SYSTEM or UNKNOWN representation must be closed on
 * the access side (EXPORT) or the participation side (a certified EXCLUDE).
 * Anything else is an open exposure.
 */
export function covenantOpenRepresentations(): CorpusKey[] {
  const open: CorpusKey[] = [];
  for (const k of Object.keys(SOVEREIGN_DISPOSITION) as CorpusKey[]) {
    const cls = SOVEREIGN_CORPUS[k].class;
    if (cls !== 'SYSTEM_REPRESENTATION_ABOUT_MEMBER' && cls !== 'UNKNOWN') continue;
    const e = SOVEREIGN_DISPOSITION[k];
    const accessClosed = e.dispositions.includes('EXPORT') && !!e.export;
    const participationClosed =
      e.dispositions.includes('EXCLUDE') &&
      (e.exclusion?.kind === 'certified_gate' || e.exclusion?.kind === 'not_reachable');
    if (!accessClosed && !participationClosed) open.push(k);
  }
  return open;
}

/** Whether P1 may be proposed complete, and what stands in the way if not. */
export function p1ClosureState(): { closable: boolean; blockers: CorpusKey[] } {
  const blockers = [...UNRESOLVED_P1_BLOCKERS, ...covenantOpenRepresentations()];
  return { closable: blockers.length === 0, blockers: [...new Set(blockers)] };
}
