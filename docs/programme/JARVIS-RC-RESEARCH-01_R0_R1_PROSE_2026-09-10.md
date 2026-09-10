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
