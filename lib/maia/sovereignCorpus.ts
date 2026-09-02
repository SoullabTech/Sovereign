/**
 * The Sovereign Corpus — MIPA Phase 0, P1b.
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P1b
 *
 * ── THE COVENANT THIS SERVES ────────────────────────────────────────────────
 *
 *   MAIA may not have durable participatory access to a representation about
 *   the member that the member has neither meaningful access to nor meaningful
 *   sovereignty over.
 *
 *   MAIA's durable participatory corpus  ⊆  member-governable corpus
 *
 * Operational/security state and fully regenerable implementation artifacts may
 * be exempt — but **exemption never confers additional epistemic or
 * participatory authority.**
 *
 * ── WHY THIS IS NOT AN EXPORT SPECIFICATION ─────────────────────────────────
 *
 * The 37-table figure from P1a is a DISCOVERY set, not an export list. A
 * database table is an implementation object; what the member is owed is a
 * faithful account of the representations the system holds about them.
 *
 *   > Data portability is not sovereignty if the machine exports tables the
 *   > member cannot understand while quietly retaining unexported
 *   > interpretations that affect the relationship.
 *
 * So this module classifies REPRESENTATIONS, and records where a single table
 * carries fields of different authorship. Three do, and the mixture is the
 * point rather than an inconvenience:
 *
 *   member_daily_anchors   `prompt_shown` system · `response` MEMBER
 *   member_lens_passes     `prompt` system      · `member_response` MEMBER
 *   bardic_cues            `cue_type`/`metadata` system · `user_words` MEMBER
 *
 * A table-level verdict on any of those would either discard the member's own
 * words or launder the system's framing into their record.
 *
 * ── UNKNOWN IS A REAL VERDICT ───────────────────────────────────────────────
 *
 * Where the write path does not establish authorship, the answer is UNKNOWN and
 * it fails closed for NEW participatory authority. It is not resolved by table
 * name, by probable caller, or by what would make the coverage count prettier.
 * Nine of these are UNKNOWN. That number is evidence, not embarrassment.
 *
 * ── CORRECTION RECORDED IN P1c (2026-09-02) ─────────────────────────────────
 *
 * `state_vectors` was classified UNKNOWN on the evidence "NO WRITER FOUND in
 * source". That evidence was WRONG, and the defect was in the instrument: the
 * writer search matched `INSERT INTO <table>`, and this table is written
 * through the `insertOne('state_vectors', row)` helper in `lib/db/postgres.ts`.
 * A whole family of writers — thirty-four tables — is invisible to an
 * `INSERT INTO` scan.
 *
 * The real write path is fully establishable and is now recorded below: MAIA
 * emits a fenced STATE_VECTOR block in its own response, `parseStateVector`
 * reads it back out, and `storeStateVector` persists it. Authorship is MAIA;
 * authority class is inference. It is a SYSTEM representation, not an unknown
 * one.
 *
 * `episode_links` was re-checked under the same widened search and remains
 * genuinely writer-less: `LinkingRepo` writes `bardic_links`, a different
 * table. Its UNKNOWN verdict stands on corrected evidence.
 *
 * The correction is recorded rather than quietly applied, because a census that
 * silently improves its own numbers is not a census.
 */

/** Classification buckets, ratified 2026-09-02. */
export type CorpusClass =
  /** Member-authored, declared, marked or otherwise sovereignly established. Export required. */
  | 'CANONICAL_MEMBER_RECORD'
  /** Machine-authored durable claim about the member. Inspectability required before participation may exceed the current exclusion. */
  | 'SYSTEM_REPRESENTATION_ABOUT_MEMBER'
  /** Regenerable vector/index/cache with no independent epistemic authority. Raw export not required. */
  | 'DERIVED_IMPLEMENTATION_ARTIFACT'
  /** Credentials, tokens, infrastructure bookkeeping. Not MAIA-memory; never dumped as such. */
  | 'OPERATIONAL_OR_SECURITY'
  /** Authorship not certifiable from source. Fails closed. */
  | 'UNKNOWN';

export interface CorpusEntry {
  class: CorpusClass;
  /** Write-path evidence — the basis for the verdict, never a naming inference. */
  evidence: string;
  /** Fields whose authorship differs from the row's dominant class. */
  mixed?: Record<string, 'member' | 'system'>;
  /** The refusal currently governing this representation's participation. */
  gate?: 'R24' | 'R25' | 'R26' | 'R27' | 'R04' | 'R07' | 'R08' | 'P3e';
  /** True where the export already reaches it today. */
  exportedToday?: true;
}

export const SOVEREIGN_CORPUS = {
  // ── CANONICAL MEMBER RECORD — export required ─────────────────────────────
  members: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'member profile; member-supplied at registration', exportedToday: true },
  member_settings: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'member-chosen preferences written through the authenticated settings surface', exportedToday: true },
  conversation_turns: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'TurnsStore writes verbatim utterances; `role` discriminates member from MAIA' },
  quick_journal_entries: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'app/api/journal/quick — authenticated member gesture, member-supplied content' },
  elemental_journal_entries: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'lib/elemental-alchemy/journalService — member-written entry' },
  member_memory_atoms: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'Keep gesture (portfolio.ts); practitioner_observation rows are ATTRIBUTED and epistemically framed', gate: 'R04' },
  episodic_memories: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'Mark gesture with R18 provenance; only marked_by_member rows are loader-eligible' },
  member_ideas: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'app/api/ideas/capture — member captures an idea' },
  member_idea_blocks: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'app/api/ideas/[id]/blocks — member-authored blocks' },
  member_organizing_principles: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'app/api/sovereign/principles — member-declared principle' },
  capture_notes: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'captureStore — member-supplied `text` and `tag` during a session' },
  personal_states: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'living-field/states POST — member-supplied `label`/`intensity`' },
  personal_living_fields: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'living-field/[fieldKey] POST — member-supplied `current_expression`' },
  preference_confirmations: { class: 'CANONICAL_MEMBER_RECORD', evidence: 'member confirms/corrects a stored memory; the nearest existing correction act' },
  member_daily_anchors: {
    class: 'CANONICAL_MEMBER_RECORD',
    evidence: 'anchor/today — `response` is the member\'s own words; `prompt_shown` is system-authored',
    mixed: { response: 'member', prompt_shown: 'system' },
    gate: 'R08',
  },
  member_lens_passes: {
    class: 'CANONICAL_MEMBER_RECORD',
    evidence: 'portfolio.ts — `member_response` is member-authored; `prompt` and `lens` are system-authored',
    mixed: { member_response: 'member', prompt: 'system', lens: 'system' },
  },

  // ── SYSTEM REPRESENTATION ABOUT THE MEMBER ────────────────────────────────
  developmental_memories: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'MemoryWriteback distils an LLM signal; no authorship column', gate: 'R24', exportedToday: true },
  breakthrough_moments: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'sole live writer fires on significance>=0.5 or a heuristic, with machine-extracted insight', gate: 'R25' },
  member_theme_signals: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'participatoryRealityHelper — automatic per-turn scored inference', gate: 'R24' },
  member_sessions: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'SessionSummaryStore writes a machine-generated `summary`; transformation creates a newly authored object', exportedToday: true },
  conversation_themes: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'RelationshipMemoryService — machine-detected themes' },
  relationship_patterns: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'RelationshipMemoryService — machine-inferred relational patterns' },
  relationship_essences: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'RelationshipAnamnesis — machine-composed essence of the relationship' },
  user_relationship_context: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'SessionMemoryService / SpiralStateService — machine-maintained relational state' },
  selflet_nodes: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'SelfletChain writes machine-derived phase/element/archetypes/dominant_emotions/continuity_score' },
  reflection_capsules: { class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER', evidence: 'capsuleService writes a `summary` — a machine summarisation of member material' },
  state_vectors: {
    class: 'SYSTEM_REPRESENTATION_ABOUT_MEMBER',
    evidence: 'MAIA emits a fenced STATE_VECTOR block in its own response; parseStateVector reads it back and storeStateVector persists it via insertOne(). MAIA-authored inference about the member — reclassified from UNKNOWN in P1c after the INSERT INTO writer scan was found blind to the insertOne() helper family',
  },

  // ── DERIVED IMPLEMENTATION ARTIFACT ───────────────────────────────────────
  conversation_memory_uses: { class: 'DERIVED_IMPLEMENTATION_ARTIFACT', evidence: 'retrieval audit trail; regenerable bookkeeping about which candidates were considered' },
  memory_links: { class: 'DERIVED_IMPLEMENTATION_ARTIFACT', evidence: 'link rows between memory objects; carries no independent claim' },
  living_field_affinities: { class: 'DERIVED_IMPLEMENTATION_ARTIFACT', evidence: 'indexAtom builds an affinity index over already-classified atoms' },

  // ── OPERATIONAL / SECURITY ────────────────────────────────────────────────
  google_calendar_credentials: { class: 'OPERATIONAL_OR_SECURITY', evidence: 'OAuth access/refresh tokens; the member is owed a truthful connection STATE, never the secrets', exportedToday: true },

  // ── UNKNOWN — fails closed ────────────────────────────────────────────────
  bardic_cues: {
    class: 'UNKNOWN',
    evidence: 'CueRepo stores `user_words` (member) alongside machine `cue_type`/`cue_key`/`metadata`; no source evidence establishes who supplies `user_words` at the call site',
    mixed: { user_words: 'member', cue_type: 'system', metadata: 'system' },
  },
  bardic_microacts: { class: 'UNKNOWN', evidence: 'RecallRepo stores `description` + machine `element_bias`; the origin of `description` is not established by the write path' },
  teloi: { class: 'UNKNOWN', evidence: 'TeleologyRepo stores a `phrase` with machine `strength`/`signals`; phrase origin not established' },
  episodes: { class: 'UNKNOWN', evidence: 'episodeService writes place/sense cues and affect valence; not established whether the member supplied them or they were extracted' },
  episode_links: { class: 'UNKNOWN', evidence: 'NO WRITER FOUND in source; read paths exist. Read-but-never-written in this tree' },
  selflet_messages: { class: 'UNKNOWN', evidence: 'SelfletChain writes `title`/`content`/`ritual_trigger`; member-facing archive/snooze routes exist, but no source evidence establishes who AUTHORS the message' },
  selflet_boundaries: { class: 'UNKNOWN', evidence: 'SelfletChain writer; authorship not established' },
  selflet_metamorphosis: { class: 'UNKNOWN', evidence: 'SelfletChain writer; authorship not established' },
  selflet_reinterpretations: { class: 'UNKNOWN', evidence: 'SelfletChain writer; authorship not established' },
  // `satisfies`, not an annotation: the key set stays LITERAL so P1c's
  // disposition ledger can be a total function over it at COMPILE time. An
  // annotation of `Record<string, CorpusEntry>` widens the keys to `string`
  // and a missing disposition becomes a runtime discovery instead of a build
  // failure.
} satisfies Record<string, CorpusEntry>;

/** Every classified representation, as a literal union. */
export type CorpusKey = keyof typeof SOVEREIGN_CORPUS;

/** Classes for which the member must be able to obtain or inspect the material. */
export const EXPORT_REQUIRED_CLASSES: readonly CorpusClass[] = [
  'CANONICAL_MEMBER_RECORD',
  'SYSTEM_REPRESENTATION_ABOUT_MEMBER',
];

/** Classes legitimately exempt from the MAIA-memory export. */
export const EXPORT_EXEMPT_CLASSES: readonly CorpusClass[] = [
  'DERIVED_IMPLEMENTATION_ARTIFACT',
  'OPERATIONAL_OR_SECURITY',
];
