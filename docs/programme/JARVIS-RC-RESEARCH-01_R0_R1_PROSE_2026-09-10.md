# JARVIS-RC-RESEARCH-01 · R0 FREEZE + R1 READ (Prose)

**Opened by founder act, 2026-09-10.** Revision Collaboration · external evidence
and future-proofing. ⛔ **No implementation during the census. No Soullab
dependency changes. No imports.**

## R0 — FREEZE

**Law this census is measured against** (pinned, unchanged by anything found here):
RC-01…RC-07 · S3 disclosure authority · BUILD-07A evidence law (`locateCurrent`
three-state, **never fuzzy**) · D9 attention constraints · RC-06 one authoritative
textual home.

⭐ **Future-proofing law, ratified with this lane:**

> **External editing technology may compute or render a proposed difference. It may
> never become the source of truth for what the Work was, what MAIA proposed, what
> the writer modified, or whether a change may enter the Work.**

### Upstream pin

```
Prose   github.com/solo-ist/prose
        72f0ca412ea9005685b0f8fa8ff2243f2928e125
        2026-09-08T13:03:27-04:00 · MIT · read at depth 200
        Electron + React + tiptap/ProseMirror
```

Clone location: disposable scratch outside `/home/user/Sovereign`. Zero writes to
the Soullab repo besides this record; zero imports; zero dependencies added.

### ⚠️ The starting hypothesis was partly WRONG, and the founder falsified it first

Predicted: *editor-centric systems keep proposed text in the document, so accept
merely removes a pending mark.* **Not true of Prose.** `AISuggestionData` holds
`originalText` and `suggestedText` **out of band**, and accept *performs* the
replacement. Prose's authority shape is materially closer to ours than predicted.

Recorded rather than quietly dropped: a census whose hypotheses cannot be wrong is
not a census.

---

## R1 — READ · Prose

### Data model — `src/renderer/extensions/ai-suggestions/types.ts`

```ts
AISuggestionData {
  id · type: 'edit' | 'insertion'
  originalText · suggestedText · explanation · createdAt
  from · to                       // live document positions
  userReply?
  provenanceModel? · provenanceConversationId? · provenanceMessageId?
  documentId?
  blockConversionIntent?          // raw markdown of a block-type change
}
```

⭐ **F-P1 — the edit ↔ conversation link already exists here, at message
granularity.** `provenanceConversationId` + `provenanceMessageId` + `provenanceModel`
answer *which turn produced this change, under which model.* This is the linkage
the census expected to have to take from Sundial. **LEARN FROM — and our equivalent
is stronger**: RC's proposal carries `thread_id`, the frozen `read_state`, and the
S3 `authority` that licensed the reading, so it answers *what she was allowed to
see* as well as *which turn it was*.

### 🔴 F-P2 — REFUSE · fuzzy relocation is a designed feature, in TWO places

Not merely in restore, as first thought. It is in the **authoring contract** too:

```
suggest_edit.search
  "Original text content of the node (from read_document). Used as fallback
   to locate the node if nodeId is stale."
```

And in `restoreAISuggestions` (`extension.ts:951-965`):

```ts
const docText = doc.textContent
const searchText = suggestion.originalText
const textIndex = docText.indexOf(searchText)      // FIRST occurrence
if (textIndex === -1) { console.warn(...); continue }
```

⛔ **`indexOf` takes the first match, and nothing counts occurrences or refuses on
ambiguity.** A repeated passage silently reattaches the proposal to the wrong one.

⭐ **This is not hypothetical for us.** The founder's own manuscript is built on
deliberate repetition — the Develop room's own observations read *"the campfire
scene is narrated three times over the Fire material"* and *"the book opens twice
on the same shape of night-time waking."* On that Work, first-match relocation
would attach a revision to the wrong retelling **and report success.**

```
PROSE       lost position -> search the text again -> first match wins
SOULLAB     lost identity -> superseded | unmeasured -> NEVER relocate
```

**Verdict: REFUSE.** Contained by BUILD-07A (`locateCurrent`, digest-verified,
scoped per ref, never fuzzy) and by RC-06b (identity is id + revision + digest).

### 🔴 F-P3 — REFUSE · the model can apply its own suggestion

`accept_diff` and `reject_diff` are **agent tools**, not member gestures:

```
accept_diff  { id?: string }
  "Accept a pending suggestion. If no ID provided, accepts ALL pending suggestions."
requiresMode: 'editor'
```

Two distinct problems, and the second is worse:

1. **The applier is the proposer.** Our whole authority model is that MAIA may
   prepare a revision and only the writer applies it. Here the same agent that
   called `suggest_edit` can call `accept_diff`.
2. **An omitted id means *all*.** One unargumented call spends authority over N
   objects at once. Compare the S3 walk result: one press → one `actId` → N
   **section-scoped** receipts, each scoped, `BODY_SCOPE_INCOMPLETE` crossing
   *nothing* when authorization is partial.

The only gate is `requiresMode: 'editor'` — a **global mode**, not a per-act,
per-target member authorization.

**Verdict: REFUSE the mechanism. ADAPT the intuition** — Chat Mode being read-only
is the right instinct; a mode is a far weaker instrument than S3's per-section,
one-use authority.

### ⭐ F-P4 — LEARN FROM · structural suggestions are a different mechanism, and
they refused rather than approximated

`blockConversionIntent` exists because changing a paragraph into a heading, list or
blockquote requires **whole-node replacement**, not text replacement. And where it
cannot be done safely they refuse **by name**:

```
TABLE_NODE_NOT_SUPPORTED    use the edit tool to replace the whole table
PLAIN_TEXT_DOCUMENT         create a .md copy instead
```

That is our discipline arriving independently: *a named refusal beats a silent
approximation.* Direct warning for WS2-08 territory — our section/paragraph
boundary work will meet the same wall, and the answer is a refusal with a name.

### ⭐ F-P5 — LEARN FROM · scars are recorded in the source

The accept path carries a comment naming a real field report — markdown arriving as
literal `**bold**` asterisks in the WYSIWYG document (*"TestFlight v1.6.1 report"*)
— and a deliberate degrade-gracefully guard against a future library upgrade
changing a parser's return type. **Proposals are authored in one representation and
applied in another, and the seam between them is where the defects live.** Our
proposals are markdown-ish prose applied into a section body; the same seam exists.

---

## Running verdicts (R4 will consolidate)

```
REUSE        @codemirror/merge          renders two strings, no opinion on
                                        authority (founder ruling; not yet read)
ADAPT        provenance on the proposal Prose links model + conversation +
                                        message; ours adds read_state + S3 authority
ADAPT        read-only discussion mode  right instinct, weaker instrument
LEARN FROM   named refusals for
             unsupported structures
LEARN FROM   authoring/apply
             representation seam
REFUSE       search-fallback targeting  fuzzy relocation, first match wins
REFUSE       agent-callable accept      the proposer must not be the applier
REFUSE       unargumented accept-all    one call, N objects, no scoping
```

## Standing

```
R0 FREEZE               DONE — upstream pinned, hypothesis correction recorded
R1 READ · Prose         SUBSTANTIALLY DONE (persistence/IndexedDB still to read)
R1 READ · others        NOT STARTED
R2 PROBLEM ARCHAEOLOGY  NOT STARTED
R3 RUN PROSE            AUTHORIZED, not yet run
R4..R8                  NOT STARTED

implementation          NOT AUTHORIZED
dependency changes      NOT AUTHORIZED
PRODUCTION              UNTOUCHED
```

---

# Addendum 1 — R1 persistence · R2 archaeology · R3 bounded mechanics (founder-run)

**Run by the founder on the Mac Studio, 2026-09-10**, against the pinned upstream
`72f0ca412ea9005685b0f8fa8ff2243f2928e125` in a disposable `/tmp` clone. No MAIA
repository change, no MAIA environment copied, **no model credential**.

## R1 — persistence: COMPLETE

Pending suggestions live in a **separate IndexedDB store keyed by `documentId`**;
the document itself is unchanged until acceptance. On tab switch the live marks are
extracted and persisted separately, after annotation persistence completes.

```
persisted: suggestion id · original text · suggested text · explanation
           positions · model · conversation id · message id · document id
```

⭐ **ADAPT for proposal ↔ conversation lineage. NOT for targeting.**

## R3 — BOUNDED MECHANICS: PASS

⚠️ **Apparatus finding first: the pinned web harness BUILDS but does not RUN as
shipped.** Its mock Electron API lacks three methods the renderer now expects;
three no-ops were added **to the disposable clone only** to make it render.

> ⭐ **Build success is not runtime-parity evidence.** Carried as a JARVIS lesson,
> not a Prose complaint — our own gates make the same claim shape.

The real TipTap suggestion machinery was then driven directly, without an LLM.

```
fixture     "The night-time waking returns. First telling."
            "The night-time waking returns. Second telling."
            proposal placed on the SECOND occurrence

before accept   document text unchanged  YES
                suggestion exists        YES

after accept    "...returns. First telling."
                "...returns, but altered. Second telling."
```

⭐ **The central interaction is CONFIRMED IN RUNTIME: a proposal does not mutate
prose; Accept performs the mutation.** That is a direct validation of RC's
fundamental model, from an independent implementation.

Reject removed the proposal and left the text unchanged. Clean.

### 🔴 F-P2 is now BEHAVIORAL evidence, not source inspection

Document reset; an ambiguous persisted proposal restored, `originalText` occurring
twice:

```
restore returned success      YES
attached to FIRST occurrence  YES
ambiguity reported            NO
```

**Prose can silently reattach a pending proposal to the wrong recurrence, and
report success.** HARD REFUSE, now witnessed rather than read.

```
R3 BOUNDED MECHANICS    COMPLETE
R3 PHENOMENOLOGY        UNSPENT
```

⛔ **Headless direct-command execution is not a lived UX witness.** The founder
declined to call it one. `UNSPENT` is a first-class result.

## R2 — problem archaeology: where OUR failures will be

### 🔴 A-1 (#578) — exact identity is NOT sufficient. Coverage must be proven too

An accepted **small** edit replaced an entire ~1,800-character body, because the
body had collapsed into a single paragraph node. The target was found correctly and
the replacement was catastrophically wider than the proposal claimed.

⭐ **Candidate invariant — application verifies BOTH:**

```
proposal target        exact
current target         current
expected coverage      exact
replacement operation  bounded to that coverage

ANY disagreement -> REFUSE          not "best effort"
```

⭐ **We can already express this**: the frozen `read_state` carries a per-section
`CodePointRange` and digest. The apply path must assert the replacement is bounded
to *that range*, not merely that the section resolved. **Locating the target and
bounding the write are two different obligations, and #578 is what conflating them
costs.**

### 🔴 A-2 (#681) — a present identifier is not a unique one

Paragraph splitting duplicated node IDs; the resolver then successfully found the
**wrong** node because the "unique" id was not unique.

⭐ Reinforces RC-06b: **uniqueness must be structural.** Our `UNIQUE (draft_id,
position)`, `UNIQUE (candidate_id, revision_number)` and the composite FK on
`(candidate_id, revision_number, digest)` are not overengineering — they are the
answer to a defect another team shipped.

### 🔴 A-3 (#674) — provenance must not depend on decorations

A catalogue: accept-all failed to write history, collapsed ranges deleted records,
async persistence raced tab switches, renaming orphaned attribution. Their repair
moved toward *detach, don't delete*.

⭐ **Our stronger law:**

```
proposal / candidate / decision history    DURABLE TRUTH
editor decorations                         PROJECTION

destroy every decoration -> historical truth is unchanged
```

**Architectural, not a UI convention.**

### 🔴 A-4 — fire-and-forget is wrong for member candidate prose

> **Acknowledged candidate state means durable candidate state.** No optimistic
> "saved" while the only copy of member work sits in a pending async write.

⚠️ **THIS CONTRADICTS A DOCUMENTED HOUSE PATTERN, and the contradiction must be
recorded before someone cites the wrong half.** CLAUDE.md's Bridge D design
principles state *"Fire-and-forget writes — like voiceSovereignty pattern (no
await, no blocking)"*, and that is correct **there**. The distinction is what the
write contains:

```
fire-and-forget IS right   derived structural state that can be recomputed
                           (spiral element/phase, voice sovereignty)
                           losing it costs continuity, not content

fire-and-forget IS WRONG   the sole authoritative home of member writing
                           (RC-05 / RC-06) — losing it destroys the work
```

⛔ **Bridge D's pattern must not be generalized onto the candidate store.** Under
RC-06 the candidate store is the *only* home of that prose until application; a
dropped write there is not a lost cache entry, it is lost writing.

### A-5 — no wildcard Accept

```
Accept(P17)              means exactly P17
Accept()                 REFUSED as a wildcard
Accept {P17, P19, P24}   if ever added: a NEW explicit member act over an
                         ENUMERATED set, each individually current and applicable
```

## ⭐ New future-proofing principle

> **The renderer never owns a proposal. It only depicts one.**

```
RevisionProposal · RevisionCandidate · target identity · decision   SOULLAB TRUTH
CodeMirror decoration · diff widget · popover · sidebar card        DISPOSABLE
```

The UI asks the domain *"show me P17 against its current target"*, rather than the
database reconstructing P17 from whatever marks survived in an editor. This is what
lets CodeMirror, React, the diff library or the whole Studio visual language be
replaced without translating what historically happened.

## RC-06a — better decision frame, ⛔ still NOT ratified

After application the canonical revision owns the manuscript prose. History must
still prove `R18 applied from C1/r3` · `C1/r3 derived from P2` · `P2 from this MAIA
turn`. **It does not follow that candidate prose must remain forever as a second
textual body.** Decide after the remaining systems are compared — not by copying
Prose's annotation-history solution.

## Standing

```
R0 FREEZE                 DONE
R1 PROSE SOURCE           DONE
R2 PROSE ARCHAEOLOGY      SUBSTANTIALLY DONE
R3 PROSE BUILD            PASS
R3 PROSE MECHANICS        PASS · bounded
R3 PROSE PHENOMENOLOGY    UNSPENT

NEXT   Sundial — and the sharper question the Prose pass earned:
       how is `conversation turn -> exact edit -> human decision` preserved
       WHILE THE DOCUMENT KEEPS CHANGING?

implementation            NOT AUTHORIZED
dependency changes        NOT AUTHORIZED
PRODUCTION                UNTOUCHED
```

---

# Addendum 2 — R1 READ · Sundial

```
Sundial   github.com/sundial-org/sundial-desktop
          74ddb42f9430ff8c7bb83e18137b009760bc7d9a
          2026-09-02T21:38:10-07:00 · Apache-2.0
          Next.js + Yjs CRDT · read only, NOT run (per founder ruling)
```

Question this pass was run against: **how is `conversation turn → exact edit →
human decision` preserved while the document keeps changing?**

## ⭐⭐ S-2 — THE FINDING THAT SHOULD CHANGE OUR SHAPE

The whole diff payload is **keyed by the assistant message**:

```ts
TurnEditsResponse = {
  assistantMessageId: string      // the primary addressing key
  files: TurnEditFile[]
  acceptedFrom?: AcceptedSuggestion | null
}
```

Edits are fetched, cached, kept and undone **by `assistantMessageId`**. And Prose
does the same thing independently: `provenanceMessageId` alongside
`provenanceConversationId`.

⚠️ **Ours is thread-level, not turn-level.** `manuscript_revision_proposals.thread_id`
answers *which conversation*, and cannot answer *which turn*. In a thread where the
writer asks three times for successively subtler versions — **exactly the loop the
founder described as the powerful one** — `thread_id` cannot distinguish P1 from P2
from P3's origin.

⭐ **Two independent implementations both key on the message, not the thread.**
Recommendation: add `thread_message_id` beside `thread_id` in R1, while the table is
still unwritten. ⛔ Not a decision — but it is far cheaper now than after rows exist,
and §7's rule (persist the full shape so R2 needs no backfill) applies.

## 🔴 S-1 — REFUSE · applied-vs-pending is decided PER FILE, by policy, not by the member

```ts
/** How THIS file's edits landed — 'suggest' files are pending action items
 *  (accept/discard); 'edit' files are already applied (revertable). Decided
 *  per file, not per turn (a suggest turn can hold forced-direct rows). */
editMode?: 'edit' | 'suggest'
```

The verbs elsewhere are **Keep / Undo**, not Accept / Reject — because the edit has
often *already landed* and the human decision is whether to retain it.

⛔ **A "suggest" turn can contain forced-direct rows that already applied.** The
writer, having made one request, cannot know from the request whether the Work
changed. That is the precise inversion of RC-07:

```
SUNDIAL    default applied; the human decides whether to KEEP
SOULLAB    default not applied; only the writer's explicit act changes the Work
```

**REFUSE the model.** This is the single largest authority divergence found in the
census, and it is invisible from the README.

## 🔴 S-7 — REFUSE · a missing decision defaults to *accepted*

```ts
/** How the review landed. Omitted on older payloads — treat as 'accepted'. */
decision?: 'accepted' | 'rejected'
```

⭐ **This is a live specimen of the defect our attribution-grain discriminator was
designed to prevent.** A schema that grew a decision field later must now guess what
older rows meant — and it guesses toward the *more permissive* value. Under RC-02
absence must be **representable, not inferred**, and never inferred toward the
reading that claims more.

Direct validation of the `attribution_grain` field and of §7's "persist the full
shape now" rule.

## ⭐⭐ S-3 — LEARN FROM · they had to migrate chunk identity, and are carrying the scar

```
legacyId?: string
  the pre-content-hash POSITIONAL id (`chunk-<n>-<oldStart>-<newStart>-…`).
  Decision replay matches it too, so decisions recorded before the id format
  changed keep resolving — "for chunks whose positions haven't since shifted,
  the only ones the old positional scheme matched anyway". Transitional.
```

⭐ **A lived demonstration of RC-06b.** Positional identity does not survive the
document changing; once *decisions* are recorded against it, the identity scheme
cannot be replaced cleanly — only carried, with a caveat that it works precisely
where it was never broken.

We chose `(id, revision, digest)` before any row exists. **This is what the
alternative costs.**

## ⭐ S-4 — ADAPT · decisions are events, replayed; not decorations

`diff.chunk_kept` / `diff.chunk_undone` are recorded events, and review state is
reconstructed by **replaying decisions against chunk ids**. That is A-3 done right,
in an independent codebase: history is durable truth, the rendered chunk is
projection.

## ⭐ S-6 — LEARN FROM · un-reviewability is represented, never hidden

Oversized files surface *"with `chunks: []` and a size-only notice — instead of
vanishing silently."* Binary blobs are *"chunkless and not reviewable"*, synthesized
from an attributed lifecycle event.

Our named-refusal discipline, arrived at independently, and the direct analogue of
`unmeasured`: **the honest answer to "I cannot review this" is a represented state,
not an absence.**

## S-5 — note · canonicalization precedes diffing

`canonicalizeContentText` strips NUL and canonicalizes markdown before diffing.
Fine as a *display* input. ⛔ Caution for us: if we ever canonicalize for rendering,
the canonical form must never become the **identity** — our digests are over the
frozen text as authored.

## S-8 — ADAPT · scope restriction on the review surface

`restrictToPaths` exists so a scoped Review panel *"can't show or act on files
outside the scope"* — the cache still holds the full turn; only the view and its
bulk actions are constrained. Close cousin of our section-scoped receipts.

⚠️ But `Keep all` / `Undo all` remain, so **A-5 stands**: bulk verbs recur in every
system examined.

## Verdicts · Sundial

```
ADAPT        edit addressed by the assistant message  -> S-2, change our shape
ADAPT        decisions as replayed events             -> S-4
ADAPT        scope restriction on the review surface  -> S-8
LEARN FROM   positional identity migration scar       -> S-3, validates RC-06b
LEARN FROM   represented un-reviewability             -> S-6
REFUSE       per-file applied-vs-pending by policy    -> S-1
REFUSE       missing decision defaults to accepted    -> S-7
REFUSE       Keep all / Undo all                      -> A-5
```

## Standing

```
R1 SUNDIAL SOURCE       DONE (read only; not run, per ruling)
R2 SUNDIAL ARCHAEOLOGY  NOT STARTED
R1 remaining            codemirror-ai · prosemirror-suggestion-mode ·
                        @codemirror/merge · jsdiff · FineEdit · CoEdIT

OPEN QUESTION FOR FOUNDER
  add `thread_message_id` to the R1 proposal table now?  (S-2)

implementation          NOT AUTHORIZED
PRODUCTION              UNTOUCHED
```

---

# Addendum 3 — R2 · Sundial archaeology

Run against the five axes the founder named. Two are decisive; two are **NOT
ESTABLISHED** and are recorded as such rather than inferred.

## ⭐⭐ S-9 — AXIS 3 (overlap / identity). The most valuable paragraph in the census.

`lib/workspace/turn-edits.ts:303-325` is a complete, honest account of the identity
problem, arrived at independently:

```
Chunk ids are CONTENT-derived, not position-derived. A position-encoded id
(`chunk-N-oldStart-newStart-…`) shifts whenever an unrelated line above is
added/removed, which orphans the chunk's decision and makes an
already-resolved chunk re-render as pending.

The sole ambiguity is identical changed content in the same file (e.g. the
same word fixed in two paragraphs); ONLY those colliding chunks get a
discriminator, and it's their surrounding context — order-independent, unlike
a positional occurrence index, which would renumber when an identical edit is
inserted above a kept one and LAND THE KEPT DECISION ON THE WRONG
(UNREVIEWED) CHUNK.
```

⭐ **They independently discovered F-P2's failure mode — a decision landing on the
wrong recurrence — and engineered against it.** Prose ships the bug; Sundial named
it and designed around it. The census has now seen both halves of the same defect.

### And their chosen failure direction is ours

```
Accepted residual: when a chunk that WAS unique gains an identical-content
twin later in the run, its id flips … so a prior keep RE-PENDS (IT NEVER
AUTO-ACCEPTS THE TWIN).
```

⭐ **When identity becomes ambiguous, the safe direction is back to needing a human
decision.** That is `unmeasured` → refuse, reached independently by another team.

### ⭐⭐ And they name the complete fix — which we already have

```
This is irreducible for a *derived* id — NO CONTENT-BASED ID CAN BE STABLE
AGAINST BOTH nearby-context changes AND identical-content insertions; we pick
this (rarer) corner. THE COMPLETE FIX IS A PERSISTENT STORED CHUNK ID, a
larger change tracked separately.
```

That is a proof sketch that **derived identity cannot be sufficient**, from a team
that lived it. Their named complete fix is a *persistent stored id*.

**We already have it.** `manuscript_draft_sections.id` is a stored uuid under
`UNIQUE (draft_id, position)`; RC-06b's `(id, revision, digest)` is stored, not
derived. **Soullab is already at the state Sundial describes as "a larger change
tracked separately."**

⚠️ And the founder's own manuscript is the pathological input for the derived
approach: deliberate repetition throughout, which is precisely "identical changed
content in the same file" at scale.

## 🔴 S-10 — AXIS 5 (bulk). REFUSE, and it is worse than the API shape suggested.

```ts
const keepAllSuggestions = useCallback(
  () => { suggestions.forEach((s) => void keepEntry(s)); }, …)
const undoAllSuggestions = useCallback(
  () => { suggestions.forEach((s) => void undoEntry(s)); }, …)
```

`forEach` + `void`: **fire-and-forget over N items — no `await`, no error handling,
no ordering, no atomicity.** A partial failure leaves an arbitrary subset applied
and **nothing records which**.

⭐ This answers the founder's question *"what not to do if we ever introduce batch
acceptance"* concretely: **A-5 is not merely about an omitted identifier meaning
wildcard. A batch verb whose implementation is an unawaited loop is not a decision
at all — it is N independent races.** If batch acceptance is ever added it must be
one transaction over an enumerated set, each member individually current.

## S-11 — AXIS 1 (decision replay). Confirmed derived, not stored.

Chunks are always **built** as `status: 'pending'` (`turn-edits.ts:357`); `kept` /
`undone` are reached by **replaying `diff.chunk_kept` / `diff.chunk_undone`
events** against chunk ids. History is the event stream; the chunk's status is a
projection of it.

⭐ Confirms A-3 / S-4 in an independent codebase, and matches the principle *the
renderer never owns a proposal.*

⛔ **NOT ESTABLISHED:** whether a decision event is itself immutable, and whether a
later event can reverse an earlier one. Not readable from the client-side sources
examined. Recorded as unknown.

## ⛔ NOT ESTABLISHED — axes 2 and 4

```
AXIS 2  source changes between proposal and review, when the content-hash
        identity no longer matches
        -> S-9 covers the IDENTITY consequence (re-pend). Whether the diff is
           rebuilt, rebased or refused is NOT established from these sources.

AXIS 4  what happens to edit provenance when `assistantMessageId` disappears
        -> NOT ESTABLISHED. The client-side search surfaced no deletion path.
           This is the axis directly comparable to RC-08 monotonic severance,
           so it is the one most worth resolving — it needs the server routes,
           which are not in the paths read.
```

⚠️ Recorded as unknown rather than guessed. **The comparison to RC-08 is exactly
where an inferred answer would be most tempting and most misleading.**

## Verdicts · Sundial archaeology

```
VALIDATES OURS   ambiguity re-pends, never auto-accepts        S-9
VALIDATES OURS   persistent stored id is the complete fix      S-9
VALIDATES OURS   decisions replayed; status is projection      S-11
REFUSE           bulk verbs as unawaited loops                 S-10
OPEN             decision-event immutability                   S-11
OPEN             diff behaviour on identity mismatch           axis 2
OPEN             provenance on turn deletion                   axis 4
```

## Standing

```
R1 PROSE · SUNDIAL      DONE
R2 PROSE                SUBSTANTIALLY DONE
R2 SUNDIAL              DONE for 3 of 5 axes; 2 NOT ESTABLISHED
R1 remaining            codemirror-ai · prosemirror-suggestion-mode ·
                        @codemirror/merge · jsdiff · FineEdit · CoEdIT
implementation          NOT AUTHORIZED
PRODUCTION              UNTOUCHED
```

---

# Addendum 4 — R2 · Sundial AXIS 4 (turn erasure vs edit provenance)

Eight questions asked. **Three answered, one decisively; four NOT ESTABLISHED at
the repository boundary.** Axis 2 was not adjacent in these paths and was not
chased — per the founder's instruction not to expand the search to finish a number.

## ⭐⭐ S-12 — Q6 ANSWERED, and it is the exact transition RC-08 refuses

`lib/workspace/use-doc-edits-realtime-key.ts:72-75`:

```
// Bash/sandbox paths may INSERT doc_edits without `assistant_message_id`
// and backfill it via UPDATE at end-of-turn. INSERT-only realtime would
// miss that signal, leaving the inline overlay stale…
```

⭐ **In Sundial an edit's conversational linkage goes `NULL -> value` after the
fact, by design, and the realtime layer had to grow an UPDATE subscription to
notice it.**

```
SUNDIAL    assistant_message_id  nullable, mutable after insert, backfilled
SOULLAB    (thread_id, produced_in_turn_index)
             value -> NULL           ALLOWED   member erasure
             NULL  -> value          REFUSED   RC-08
             value -> other value    REFUSED   RC-08
```

**We refuse precisely the transition their design depends on.** Recorded as REFUSE
— but note the honest asymmetry: their backfill serves a real need (an edit made
by a sandbox tool before the turn is closed), which our atomic write boundary
(`BEGIN append turn -> insert proposal COMMIT`) removes rather than solves. **The
answer to "when is the linkage known?" is "before either row exists", and that is
what makes the refusal affordable.**

## 🔴 S-13 — the founder's specific question: NO `never_linked / linked / severed` distinction exists

There is **one nullable column carrying at least three different meanings**:

```
never linked      a bash/sandbox edit with no originating assistant turn
not yet linked    inserted, awaiting end-of-turn backfill
(whatever deletion does)   NOT ESTABLISHED
```

⚠️ **This is evidence that a single nullable linkage becomes overloaded — not
evidence that Sundial was forced to add the distinction.** They have not added it;
they live with the ambiguity. So it does **not** license adding an explicit
severance state to R1 now. It does confirm the founder's RC-08 semantic note was
the right call: fix the *reading* of NULL before code depends on it, and give the
distinction its own state only if a feature genuinely needs it.

⭐ Our position is already better for a reason unrelated to erasure: because
`NULL -> value` is refused, a Soullab NULL can only ever mean **severed** or
**never had one**, never *not yet*. One of Sundial's three meanings is structurally
impossible for us.

## Q1 · Q2 — answered

```
Q1  owns it   public.doc_edits.assistant_message_id (Postgres via Supabase)
Q2  deletable YES — DELETE /api/workspace/chats -> sidecar.deleteChat
```

⭐ And a named refusal again, worth carrying: external sessions cannot be deleted
through this route — *"External sessions live on disk. Delete them in the agent
that wrote them."* A boundary stated rather than approximated.

## ⛔ NOT ESTABLISHED — Q3, Q5, Q7, Q8

```
Q3  what else references assistantMessageId
Q4  real FK vs soft string        PARTIAL: it is a nullable, post-insert-mutable
                                  column. Whether an FK constrains it is NOT
                                  established — the repository contains NO schema
                                  (no .sql, no migrations, no generated db types;
                                  only lib/supabase/browser.ts)
Q5  on deletion: edit deleted / NULLed / dangling id / denormalized attribution
Q7  what the UI shows when the linked turn is gone
Q8  whether the decision stays independently interpretable
```

**Why the search stops here, rather than continuing.** Deletion executes in
`sidecar.deleteChat` — a **local sidecar process that is not in this repository** —
and the cloud path's cascade behaviour lives in Supabase schema that is also not
here. Q5 in particular is decided by an `ON DELETE` clause **nobody outside the
project can read**.

⛔ **This is the axis where an inferred answer would have been most tempting and
most misleading, because it is the one directly comparable to RC-08.** Recorded as
unknown.

## Verdict

```
REFUSE        NULL -> value backfill of conversational linkage      S-12
LEARN FROM    one nullable column carrying three meanings           S-13
LEARN FROM    named refusal at an ownership boundary                Q2
NOT ESTABLISHED  Q3 · Q5 · Q7 · Q8 — sidecar and schema out of repo

EXPLICIT SEVERANCE STATE   NOT licensed by this evidence.
                           RC-08 stays as designed; the semantic note stands.
```

## ⭐ S-10 promoted — a standing falsifier for any future batch decision

> **A batch decision implemented as `forEach(… void apply())` fails by
> construction.** A member saying *"accept these five"* is ONE decision over an
> enumerated set. The system must give a truthful atomic result, or explicitly
> report the individual outcomes. **"Five asynchronous races happened after you
> clicked" is not an implementation of consent.**

## Standing

```
R2 SUNDIAL      axis 1 answered · axis 3 answered · axis 5 answered
                axis 4 PARTIAL (Q1 Q2 Q6 answered; Q3 Q5 Q7 Q8 out of repo)
                axis 2 NOT CHASED — not adjacent
NEXT            @codemirror/merge + jsdiff, against one question:
                which combination gives the writer the clearest revision
                WITHOUT acquiring authority over where or whether it applies?
implementation  NOT AUTHORIZED
PRODUCTION      UNTOUCHED
```

---

# Addendum 5 — the diff layer · `@codemirror/merge` + `jsdiff`

## ⭐ WL-1 — promoted witness law (general, beside FR-14)

> **A newly introduced upstream refusal can make downstream falsifiers appear
> green without exercising the behaviour they are named to prove.**

Witnessed 2026-09-10: RC-08a's `BEFORE INSERT` trigger made T4/T5/T6 refuse at the
producer check instead of at the candidate-reference, origin-agreement and
work-authority constraints they are named for. **Three checks stopped being tested
while still reporting PASS.**

Detection: read the refusal *reason*, never the result alone.
Repair: make the affected tests satisfy the new precondition so they can reach the
constraint they exist to prove — never delete them, never relax the new gate.

Companion to FR-14 (*an instrument can satisfy all of its remaining questions by
forgetting to ask the difficult ones*). FR-14 is about questions that go missing;
**WL-1 is about questions that are still asked and can no longer be heard.**

## 🔴 `@codemirror/merge` — DOWNGRADED to ADAPT / GUARDED REUSE

The earlier "high-confidence REUSE, no opinion about authority" classification was
**wrong**. It ships mutation affordances by default:

```
unified view    mergeControls defaults to TRUE
acceptChunk     mutates its stored original
rejectChunk     DISPATCHES CHANGES INTO THE EDITOR DOCUMENT
split view      optional revert controls, dispatching document changes
```

⭐ **Reusable only if the mutation affordances are structurally absent from our
adapter**, not merely unused:

```
RevisionDiffView(oldText, proposedText)
  internally   mergeControls: false · no revertControls
               EditorState.readOnly.of(true)
               EditorView.editable.of(false)
  exposes      NOTHING that mutates text
               no acceptChunk · no rejectChunk · no MergeView instance
```

> ⭐ **The diff renderer may SHOW the decision. It may not IMPLEMENT the decision.**

`[Accept] [Revise] [Leave]` sit **outside** that component and are Soullab domain
acts, never CodeMirror acts.

## `jsdiff` 8.0.4 — REUSE for computation · REFUSE for application

### 🔴 H-JD1 CONFIRMED, and worse than the documentation implies

Run against a patch whose target had unrelated content inserted **above** it:

```
applyPatch(moved, patch)                    APPLIED ANYWAY — relocated
applyPatch(moved, patch, {fuzzFactor: 2})   APPLIED ANYWAY — fuzzy accepted
```

⛔ **Relocation is the DEFAULT, not an opt-in.** `fuzzFactor` widens tolerance that
already exists. This is the same category the census has spent its whole length
refusing — *"the target moved; I'll find somewhere similar enough."*

```
REUSE    diffWordsWithSpace · diffWords · diffSentences · structured output
REFUSE   applyPatch · applyPatches · any patch-search application
         any fuzzy compareLine application
```

### ⭐ Granularity, measured on a real developmental revision

Original/proposed drawn from the night-waking passage MAIA actually discussed.

```
diffChars             13 marked   mangles words: "[-th-]a[-t a-]rrived"
diffWords             10 marked   cleanest grouping: "[-It was a-]{+The+}"
diffWordsWithSpace    11 marked   splits that into two spans — marginally noisier
diffSentences          4 marked   but 379 CHARS TOUCHED — rewrites whole
                                  sentences, hiding what actually changed
```

⚠️ **On readability alone `diffWords` won.** It is nonetheless **REFUSED as the
default**, on the discriminating test:

```
whitespace only — a doubled space closed   diffWords: SHOWS NOTHING
whitespace only — a line break added       diffWords: SHOWS NOTHING
trailing space removed                     diffWords: SHOWS NOTHING
                                           diffWordsWithSpace: 1-2 spans marked
```

⭐ **`diffWords` renders a whitespace-only revision as no change at all** — a
proposal that changes something would display as identical to the original. **A
renderer that can silently show a real proposal as "no change" is lying about what
MAIA proposed**, and in a manuscript where rhythm and spacing are authorial that is
the worse failure by a wide margin.

**Default: `diffWordsWithSpace`.** `diffSentences` only as an optional second-level
summary for large revisions, never as the primary view.

### The adapter

```ts
interface ProseDiffEngine {
  compare(original: string, proposed: string): ReadonlyArray<DiffSpan>
}
```

Only that module imports `diff`. Nothing else in the codebase knows the library
exists.

## ⭐ H-DIFF1 CONFIRMED — never persist a computed diff

Verified: the same two strings produce an identical rendering, deterministically.

```
PERSIST      source identity · source revision/digest · proposed_text
             candidate revision where applicable
EPHEMERAL    DiffEngine(originalText, proposedText) -> presentation
```

⭐ **The diff is a view of two authoritative strings, not evidence itself.** So
`jsdiff`, CodeMirror's internal algorithm, our styling, word segmentation, or the
entire editor can be replaced **without migrating a single historical proposal**.

⚠️ Sharpened by a real incompatibility: CodeMirror Merge uses its **own**
character-oriented diff (diff-match-patch–inspired, with its own scan-limit and
degradation behaviour). **Its chunks and jsdiff's tokens are not the same thing and
neither is a stable domain concept.** Persisting either would freeze a vendor's
segmentation into our record.

## Hypotheses

```
H-CM1   CodeMirror Merge reusable only if mutation affordances are
        structurally absent from our adapter          SUPPORTED — and the
        default configuration is NOT safe
H-JD1   jsdiff patch application violates targeting law
                                                      CONFIRMED by experiment;
        relocation is the default, not opt-in
H-DIFF1 no diff output becomes durable domain state   CONFIRMED
```

## Standing

```
WL-1                    PROMOTED
@codemirror/merge       ADAPT / GUARDED REUSE  (downgraded from REUSE)
jsdiff computation      REUSE — default diffWordsWithSpace
jsdiff application      REFUSE — witnessed relocating by default
diff persistence        REFUSED as domain state

DIFF LAYER              research substantially COMPLETE
NEXT                    codemirror-ai · prosemirror-suggestion-mode
                        for INTERACTION lessons, not for a rendering engine
                        FineEdit / CoEdIT last

dependency changes      STILL NOT AUTHORIZED — jsdiff installed only in the
                        disposable research directory
PRODUCTION              UNTOUCHED
```

---

# Addendum 6 — `codemirror-ai` · `prosemirror-suggestion-mode` · two new laws

## ⭐ DV-1 — non-identical strings must produce a visible difference

**Ratified 2026-09-10**, arising from the whitespace test in Addendum 5.

```
original === proposed   ->  no diff
original !== proposed   ->  AT LEAST ONE writer-perceivable change indicator

whitespace-only         ->  EXPLICITLY visualized
                            "line break added"
                            "double space -> single space"
                            or a visible whitespace glyph treatment
```

⭐ **The truthfulness obligation belongs to OUR renderer, not to jsdiff.** Choosing
`diffWordsWithSpace` makes the algorithm detect the change; **CSS can still make a
whitespace-only hunk practically invisible.** A review surface that can show a real
proposal as "no change" is lying about what MAIA proposed, whatever the library
returned.

## ⭐⭐ WL-2 — the authorization resolver and the application resolver must be one truth

**Promoted from a `prosemirror-suggestion-mode` finding.**

> **The resolver whose result authorizes application must be the resolver that
> determines application.**

```
NO   canApply() says "unique"   ->  execute() independently searches again
NO   dry-run refuses ambiguity  ->  live path takes the first match
```

Its AI helper searches by `textBefore + textToReplace + textAfter` and counts
matches. **In dry-run it reports success only when `matches.length === 1`. When
actually dispatching, on multiple matches it logs a warning and applies the first
one anyway.**

> ⭐ **A safe preflight does not make an unsafe execution safe.**

A check/use split where **the semantics themselves differ even without a race.**
Binds our application boundary:

```
locateCurrent(...) -> CURRENT, exact identity + coverage
                   -> THE SAME ESTABLISHED TARGET feeds the mutation

never:  check current -> later search again -> apply wherever found
```

## 🔴 `codemirror-ai` — REFUSE the model. Falsified at runtime.

```
pinned  3b4222b13b18ce76415d9a4f19bd1e3389aeae8a · 2026-09-04 · Apache-2.0
```

Same already-applied shape: the model returns, the document is dispatched
immediately, `{from, to, oldCode, newCode}` is stored, **Accept merely clears the
state and Reject writes `oldCode` back.**

### The static finding

`src/inline-edit/state.ts:149` — `completionState.update()` handles the
`showCompletion` effect and otherwise `return value`. **It never maps `from`/`to`
through `tr.changes`.** The coordinates are frozen at the moment of suggestion.

### ⛔ The runtime consequence — Reject destroys the writer's own work

Pattern falsifier reconstructing that exact state field headlessly on
`@codemirror/state` (*not* a run of the shipped UI, which needs a DOM):

```
doc after AI edit          "Chapter opening.\n\nThe knowledge arrived already complete."
writer types ABOVE it      "A new first paragraph the writer just wrote.\n\nChapter…"
stored coords              from=18 to=57   (unmapped)
press Reject               "A new first paragrIt was a knowledge that arrived
                            already complete.ning.\n\nThe knowledge arrived
                            already complete."

AI text still present after Reject      TRUE
writer's own new paragraph intact       FALSE
```

⭐⭐ **Reject ate the writer's paragraph and kept the AI's text.** The one gesture
whose entire promise is *"undo what the machine did"* destroyed what the human did
and preserved what the machine did.

This was recorded as NOT YET ESTABLISHED in the founder's source pass. **It is now
established.**

```
REFUSE      mutation before acceptance
            rejection-as-restoration
            editor state as proposal truth
            static coordinates on a live document

LEARN FROM  compact inline request surface · loading state
            cancellation via AbortController · keyboard accept/reject
            showing old and new simultaneously
```

⚠️ **And a targeting lesson:** its AI command expands the writer's selection to
whole line boundaries before asking the model. Fine for code, dangerous for prose.

> **A request gesture may orient more broadly, but it must not silently widen the
> replacement target.**

## 🔴 `prosemirror-suggestion-mode` — REFUSE as substrate, LEARN as interaction

```
pinned  e61b70c3… · MIT · explicitly WIP with known issues
```

The classic Word/Docs model: the replacement is **inserted into editor state**, the
removed text is **reinserted carrying a `suggestion_delete` mark**, the new text
carries `suggestion_insert`, and Accept/Reject reconcile the marked pieces.

⛔ **A pending proposal must remain a proposal RECORD, not special text living
inside canonical editor state.** Possibly useful later as a reference for *human*
track-changes inside WRITE; never the substrate for MAIA proposals.

Also repeats **A-5**: its README recommends multiple AI suggestions by looping over
`applySuggestion()`.

## Standing

```
DV-1                    RATIFIED — renderer's obligation, not the library's
WL-2                    PROMOTED — one resolver, authorization = application

codemirror-ai           REFUSE model · LEARN interaction · falsified at runtime
prosemirror-suggestion  REFUSE substrate · LEARN interaction

⭐ NEITHER LIBRARY CHANGES THE RC ARCHITECTURE. Prose and Sundial did; these two
   confirm the boundary and donate interaction lessons. The library census has
   stopped producing architectural surprises.

NEXT   FineEdit / CoEdIT — a different question entirely:
       how do we evaluate whether MAIA's proposed revision is actually good,
       while preserving the writer's voice?
```
