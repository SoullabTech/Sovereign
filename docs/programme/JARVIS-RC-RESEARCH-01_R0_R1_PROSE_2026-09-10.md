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
