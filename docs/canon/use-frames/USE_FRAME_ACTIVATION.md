# Use-Frame Activation — Architectural Design

**Status:** spec / decision document. **No code yet.**

**Question:** How should use-frames (e.g.
`JOHN_OF_THE_CROSS_USE_FRAME.md`) enter MAIA's response layer?

**Companion canons:**
- `MAIA_CANON_v1.1.md` — §1 (no persuasion drift), §4 (no certainty manufacture), §10 (no false authority)
- `AI_RELATIONAL_SAFEGUARDS.md`
- `project_non_ambient_cognition_canon` (memory) — *"the relational field is not ambient. it is entered."*
- `project_symbolic_field_containment` (memory) — MAIA is one intelligence, many presences; each field governs its own field
- `project_maia_integrative_nature` (memory) — weave 27+ frameworks without flattening; juxtaposition, not substitution

---

## What a use-frame *is*

A use-frame is a **prompt-shaping artifact** that sits between a body of
retrieved source material and MAIA's response. It encodes:

- the **stance** MAIA should take when drawing on the source ("may illuminate," not "is")
- the **themes** MAIA may surface from the source
- the **discernment boundary** that prevents misuse (e.g. "do not romanticise suffering")
- the **vocabulary mapping** that connects member language to the corpus's lexicon

A use-frame is **not** a personality, a voice, or a system prompt override. It is a
*provisional lens* applied at response-generation time when a specific corpus is in play.

---

## The three candidate activation paths

### Option 1 — Retrieval-hit injection

**Mechanism:** When MAIA's response pipeline triggers library retrieval
**and** the retrieved chunks include any source registered to a use-frame,
inject the use-frame prompt block into the system prompt before LLM call.

**Trigger surface:** the library retrieval result itself.

**Pros:**
- Honors *"the field is not ambient — it is entered"*: the field is entered
  by the library actually surfacing the source in response to a real query
- Naturally source-grounded — the texts and the frame are activated together
  or not at all
- Scales: each new corpus that earns a use-frame auto-activates when retrieved
- No member-side configuration; no onboarding friction
- Avoids always-on theology

**Cons:**
- Activation depends on retrieval quality. If retrieval is noisy, frames
  fire on marginal hits.
- Multiple registered corpora retrieved at once → frame conflict (which one
  shapes the response?)
- The 0.530 sim score on the *Way of Nothing* query shows that even
  vocabulary-mismatched queries can produce non-trivial scores — without a
  threshold, the frame would fire on weak matches
- Requires guard rails: minimum similarity, source-set scoping, conflict
  resolution

### Option 2 — Member-language-triggered injection

**Mechanism:** A configured set of trigger phrases per use-frame
(e.g. "dark night", "spiritual dryness", "purification") is detected in
the member's input. When matched, the corresponding use-frame is injected.

**Trigger surface:** the member's text.

**Pros:**
- Direct, predictable, auditable: "this phrase → this frame"
- Zero retrieval dependency
- Easy to disable per frame

**Cons:**
- **Violates the non-ambient cognition canon.** Phrase-detection *is*
  interpretation; firing a frame on the appearance of a single word
  ("dark," "empty," "purify") is "interpreting faster than understanding"
- Phrase lists go stale and never cover the long tail of how members
  actually speak
- Coercive — the frame is *imposed* by the system rather than entered
  through the member's own engagement with the field
- Bypasses retrieval entirely — frame can fire even if the corpus has
  nothing relevant to say
- Conflicts multiply when one phrase ("emptiness") could trigger John of
  the Cross, Buddhist śūnyatā, IFS exile, and somatic numbness frames
  simultaneously — phrase detection has no way to choose

### Option 3 — Care-lens-style registration

**Mechanism:** Register each use-frame as a Care Lens alongside the
existing therapeutic frameworks (IFS, Somatic, Existential, etc.). Member
explicitly selects which lenses are active. When active, the lens prompt
block is injected into every response.

**Trigger surface:** member configuration / opt-in.

**Pros:**
- Implementation pattern already proven (PR #156, lensBlock in
  `app/api/oracle/conversation/route.ts`)
- Member-controlled — strongest consent semantics
- Predictable behaviour when active

**Cons:**
- **Always-on theology.** When the lens is on, it shapes responses about
  dinner choices and tax filings, not just questions of soul
- Doesn't honor *"the field is entered"* — the field is configured once,
  then ambient
- Doesn't scale to many traditions: members would face an opt-in matrix of
  John, Rumi, I Ching, Tarot, Stoicism, Buddhist madhyamaka, Daoism, Sufi
  silsilas, Islamic kalam… — opt-in friction multiplies, and most members
  cannot meaningfully consent without studying each
- Conflicts with the "MAIA Integrative Nature" canon principle that MAIA
  weaves many frameworks without flattening — care-lens lock-in is
  flattening into a single chosen lens
- For mystic/symbolic frames specifically, the boundary between
  "therapeutic framework" and "spiritual identity claim" gets uncomfortably
  thin if a member opts in to "Carmelite apophatic" the way they opt in to "IFS"

---

## Recommendation — Option 1 (retrieval-hit) with strict boundaries

### Why

It is the only one of the three that satisfies all three canon constraints:

1. *Non-ambient cognition* — the frame is entered by the library actually
   surfacing the source, not configured ambient or pattern-matched on words
2. *Symbolic field containment* — each frame's field is bounded by the
   physical presence of its source corpus; no frame can claim authority
   beyond what its texts ground
3. *Integrative nature* — frames don't lock the member into one tradition;
   they appear when the conversation reaches material that warrants them
   and recede when it doesn't

### The strict boundaries (the load-bearing part)

A retrieval-hit injection without guards becomes the worst version of
itself — frames firing on weak matches, multiple frames clashing, member
experience flattened by whatever the embedding cosine happens to surface.
The boundaries are:

1. **Similarity threshold gate.** A use-frame fires only if at least one
   retrieved chunk from a registered source has cosine similarity above a
   per-frame threshold (suggested initial: **0.60**, tuned per corpus).
   Below threshold, the chunks may still be retrieved as background
   context, but the frame does not activate.

2. **Source-set scoping.** Each use-frame registers an explicit list of
   `library_sources.id` values it claims. Only retrieval hits on those
   exact IDs activate the frame. No fuzzy title matching, no
   author-similarity bleed.

3. **Single-frame-per-turn ceiling.** When multiple registered frames
   would activate, only the highest-confidence one (top retrieved chunk's
   similarity) is injected. The others are recorded in telemetry but not
   applied. Frame fatigue is real; competing frames in a single response
   are confusing.

4. **Member-language as boost, not trigger.** Phrase signals from the
   member's own text are used to *raise the confidence* of an
   already-firing frame (e.g. "I feel spiritually empty" + retrieved
   *Dark Night* chunk = high confidence, full frame injection), but they
   do not *trigger* a frame on their own. This is Option 2 demoted to a
   secondary signal so the canon constraint holds.

5. **Frame block stays provisional.** The injected block always carries
   the discernment boundary clauses ("this *may* illuminate," "we should
   not force this frame," "distinguish from clinical / nervous-system
   contexts"). The frame never grants MAIA more authority than the
   underlying canon allows.

6. **Telemetry on every fire.** Each frame activation logs:
   `{frame_id, top_similarity, source_ids_hit, member_signals_matched, suppressed_competing_frames}`.
   This is how we discover false positives, runaway activations, and
   frames drifting from intended use.

7. **Kill-switch per frame.** A single env-var toggle per frame, off by
   default in production until each frame has been reviewed and accepted.

### Architectural principle (canon)

> **Explicit mention of a tradition or figure may open retrieval, but does
> not itself authorize field activation. The field enters only when retrieved
> source material clears the threshold and remains relevant to the member's
> stated context.**

This is the load-bearing distinction the v1 test surfaced empirically. A
member asking *"What does St. John of the Cross have to do with my breakup?"*
**named the source** but the corpus contains no language about modern
breakups; semantic similarity didn't clear the 0.60 threshold; the frame
correctly **did not fire**. MAIA asked the member what was drawing them to
the connection rather than supplying a dark-night reading of their breakup.

Naming-as-trigger would violate the non-ambient cognition canon by allowing
the frame to be summoned by a single word. Retrieval-hit gating ensures the
frame enters only when the **field itself** has something to say.

### What this looks like, end-to-end

```
member message
  → MAIA pipeline begins
  → library retrieval runs (existing)
  → retrieval results scanned against registered use-frame source sets
  → for each frame whose source_ids appear in results:
      compute max(similarity) of its hits
      if max(sim) >= frame.threshold: candidate
  → if any candidates:
      pick highest-sim candidate
      optionally boost with member-language signal match
      inject frame.prompt_block into system prompt
      log telemetry
  → LLM generates response with frame block in context
```

No new model calls. No phrase detection as primary signal. No member
configuration. The retrieval the system was already doing becomes the
trigger.

---

## Risks the recommended path still carries

- **Retrieval drift.** If embedding quality degrades or the corpus shifts,
  thresholds may need re-tuning. Mitigation: telemetry + periodic
  evaluation.
- **Frame collision in mixed conversations.** A member who is genuinely
  speaking about both somatic tension and apophatic emptiness in one turn
  may trigger competing frames. The single-frame ceiling means one is
  dropped; this is a real loss but the alternative (multiple injections)
  is worse.
- **False sense of authority via frame consistency.** If the same frame
  fires repeatedly across a conversation, MAIA's responses can start to
  *sound* doctrinally consistent in a way that crosses into authority. The
  provisional language clauses in each frame block must be load-bearing,
  not decorative.
- **Vocabulary gap exposure.** Today the *Way of Nothing* query under-retrieves
  because the corpus uses Peers's "all" / "naught" rather than "nothing."
  Until query-side vocabulary expansion is wired, John of the Cross frame
  will under-fire on Spanish / shorthand vocabulary. This is acceptable as
  a known limitation, not a blocker.
- **Cold-start corpus.** A newly added corpus with poor retrieval quality
  (tiny, fragmented, OCR-noisy) will produce noisy frame activations.
  Mitigation: each frame must pass an evaluation pass before activation
  (the "test signals" list in `JOHN_OF_THE_CROSS_USE_FRAME.md`).

---

## What this does *not* address (deferred)

- **Query-side vocabulary expansion** — mapping member terms to corpus
  lexicon (e.g. *nada* → *all and nothing / detachment from creatures*).
  Belongs upstream of retrieval, not in the frame layer. Separate spec.
- **Source weighting / canonical bias** — letting primary mystical sources
  outrank scraped articles for spiritually-specific queries. Belongs in
  the retrieval ranking layer, not the frame layer. Separate spec.
- **Multi-frame composition** — when (eventually) the canon allows two
  frames to be present together. Currently disallowed by the
  single-frame-per-turn ceiling. Revisit only after telemetry shows when
  composition would help and when it confuses.
- **Frame versioning** — frames will evolve. Need a schema for
  `frame_version` in telemetry so behavior changes are traceable.

---

## Implementation sketch (for the eventual code task — not now)

When this is built, it will likely live near these existing surfaces:

- `lib/library/LibraryService.ts` — retrieval results gain a frame-tag field
- `lib/maia/use-frames/` (new) — registry of frames with `{id, source_ids, threshold, prompt_block_path, member_signals?}`
- `app/api/oracle/conversation/route.ts` — after library retrieval, before
  `finalSystemPrompt` assembly, scan for frame activations and append the
  highest-confidence frame block alongside the existing care-lens / mentor
  blocks
- Telemetry: extend `logMaiaTurn` with a `use_frame: { fired, top_sim, source_ids, ...}` field

This integrates with the existing prompt-assembly chain
(`[systemPrompt, councilInsights, collectiveWisdom, lensBlock, frameBlock?]`)
without disrupting it.

---

## Decision needed

Before any code, the open decisions are:

1. **Adopt Option 1 with the seven boundaries above?** (Recommended)
2. **Initial similarity threshold for John of the Cross frame?** (Suggested: 0.60. Empirical observation: dev/prod retrieval scored 0.69–0.78 on direct queries, 0.53 on vocabulary-gap queries — so 0.60 catches confident hits while excluding marginals.)
3. **Member-language boost — implement now or defer?** (Suggested: defer to v2; ship v1 with retrieval-hit only, observe the failure modes, then add boost from real data.)
4. **Telemetry destination?** (Suggested: extend `logMaiaTurn` rather than a new table; reuse existing observation pipeline.)
5. **Scope of v1?** (Suggested: John of the Cross only. Prove the activation pattern on one frame before generalising.)

Once these are answered, the code task is small (~1 file added, ~30 LoC
in `oracle/conversation/route.ts`, ~1 telemetry field). The thinking is
the work; the wiring is mechanical.
