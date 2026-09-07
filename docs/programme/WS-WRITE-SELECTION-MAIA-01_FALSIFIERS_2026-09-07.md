# WRITERS-STUDIO-WRITE-SELECTION-MAIA-01 · Falsifiers, pinned before BUILD

**Pinned, not implemented.** ⛔ No capability exists. These are stated now so BUILD implements
against them rather than deriving them afterwards — a falsifier written after the code it judges
tends to describe what the code does.

⛔ **Deliberately not committed as red tests.** A suite that fails by design is a broken suite, and
a repo whose tests are red is a repo where nobody reads them. Each obligation below names the
assertion it will become and, where it matters, **how it could falsely pass** — which is the part a
later author cannot reconstruct.

---

## Rulings this rests on (founder, 2026-09-07)

```text
PASSAGE ANCHOR    { on:'passage', sectionId, start, end, text, digest }  · DRAFT section
ASK CONTEXT       anchor-carried, server re-verified before acceptance
ADOPTION          existing putDraftSections seam
CONTINUOUS DRAFT  out of scope · gesture absent · residual recorded
```

**The prose-free rule is narrowed, not repealed:** *Ask does not discover prose. It may receive
prose the writer explicitly pointed to and the server verified.* The invariant becomes **no body
lookups**, which is a rule about `askReader`, not about the boundary.

---

## The ten

**F1 · Selecting text exposes Ask MAIA.**
Where: the gesture's own test. Assert it appears on a non-empty selection in a section-addressable
draft and not otherwise. ⚠️ *False pass:* asserting the component renders. Assert it renders **for a
selection** — a gesture that is always present tests nothing.

**F2 · Asking does not alter the manuscript.**
Assert no write path is reachable from the ask call. ⚠️ *False pass:* checking the text is unchanged
after a mocked ask. Assert the mutation client is **never invoked** — unchanged text proves nothing
about a write that failed silently.

**F3 · MAIA receives exactly the selected passage.**
Assert the rendered context contains the anchor's `text` and no adjacent prose. ⚠️ **This is
structural, not behavioural, and that is the point:** the anchor carries the passage, so a
surrounding chunk is unrepresentable. The test should assert the union shape too — if a future
`{ on:'passage' }` gains an optional `context` field, F3 becomes policy again.

**F4 · Two-Work ambiguity does not block passage help.**
Assert `checkAnchor({on:'passage',…}, null)` is `ok`. ⚠️ *Structural:* passage sits with
`work | section | concern`, which may have `reading === null`. **Nothing in the coherence rule can
ask a passage anchor to resolve a Work** — assert that, not the UI.

**F5 · Work-specific questions may request clarification only when necessary.**
The hard one, and the only one whose subject is a judgement rather than a mechanism. State it as:
a passage anchor **never** triggers Work clarification; Work clarification remains reachable only
where a Work-level anchor is used. ⛔ Do not try to classify a question's intent — that would be the
system deciding what the writer meant.

**F6 · A proposal stays outside the manuscript until adopted.**
Assert a returned revision lives as an Ask-thread turn and that no draft write occurs on receipt.
⚠️ *Structural:* a turn is not manuscript text. The assertion is that no second store exists.

**F7 · Replace changes exactly the selected range.**
Assert `[0..start] + revision + [end..]`, character-exact, including that the character at `end` is
preserved. ⚠️ *False pass:* asserting the section contains the revision. Assert the **prefix and
suffix are byte-identical** to before.

**F8 · Stale selection refuses rather than replacing different words.**
⚠️⚠️ **The one most likely to be built as a race.** Circles FR-18: *the authority is the mutation,
not a precheck.* A read-then-verify-then-write leaves the window where the writer's own keystroke
lands. Assert the digest is checked **against the state the write is based on** (`baseRevisionId`),
and pin the interleaving case — an edit landing between verification and write must lose. A test
that only stales the passage *before* the ask begins cannot tell a guard from a precheck.

**F9 · Autosave, versioning and provenance are unchanged.**
Assert adoption goes through `putDraftSections` with its existing `baseRevisionId` +
`idempotencyKey`, and that no new revision semantics appear.

**F10 · No new MAIA, editor, conversation system, or developmental pathway.**
A boundary scan: the lane adds one union member, one `checkAnchor` arm, one reader case, one
gesture, one adoption call. ⚠️ Assert `askReader` **still performs no body lookup** — the narrowed
prose rule is exactly the thing a later author will erode first.

---

## The continuous-draft residual

⛔ **WRITE Selection → MAIA is not universal.** It serves section-addressable drafts only. A
continuous draft has no draft-section identity, and inventing one — whole-document offsets, say —
would create a second selection authority immediately after establishing the first.

**Recorded so a later "complete" claim is falsifiable, not so it is excused.**

### The UX condition — checked, and the answer is yes

`NAVIGATION_NOT_ACTIVE` is `{ title: "Section navigation isn't active for this draft yet.", body: '' }`.

**The body is empty**, so a sentence can be added without displacing anything, and the title already
speaks plainly rather than saying "section-addressable". The module also carries `FORBIDDEN`, a list
of diagnostic words banned from member copy, with `copyIsFreeOfDiagnostics` guarding it — the same
discipline as the reason-code ruling, already enforced here.

**RULED (founder, 2026-09-07).** The notice becomes:

> Section navigation isn't active for this draft yet.
> Once this draft has sections, you can select a passage and ask MAIA about it.

My proposal said *"once this writing has been shaped into sections"*, and the founder cut *shaped*:
it risks reading as another Studio operation the writer has to decipher — the exact failure the
UX ruling exists to prevent, reappearing in the sentence written to comply with it.

The ruled copy says three things and stops: what is unavailable now, what will become available,
and nothing about passage anchors, draft-section identity, or why the substrate requires either.

⛔ Still not written into the code — BUILD is held. `NAVIGATION_NOT_ACTIVE.body` is where it goes.

---

## Standing

```text
DISCOVER          ✅   CONSTITUTE RULINGS  ✅   RECONCILE  ✅
FALSIFIERS        ✅ pinned as obligations
BUILD             HOLD · five-point Writer's Studio witness unanswered
```
