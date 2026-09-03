# NW-D02 — Talk-Derivation Review

**Date:** 2026-09-02
**Subject:** Two founder-supplied analyses of Larry's Tiger 21 presentation, reviewed against the built system.
**Status:** `TRANSCRIPT SUPPLIED · GOVERNED PRESERVATION PENDING · AUDIO NOT HELD · SPEAKER ATTRIBUTION UNVERIFIED · DOMAIN TAXONOMY NOT RATIFIED`
⚠️ Records no ratification, authorizes no change.
**Amended 2026-09-02** — first cut of this document asserted the talk source was unknown or unreachable, and cited Attachment A §0 as attesting Larry's six domains. Both were wrong. See §7.
**Related:** [NW-D01 Larry doctrine reconciliation](./NW_D01_LARRY_DOCTRINE_RECONCILIATION.md) ·
[NW-D01.5 vocabulary convergence census](./NW_D01_5_FLOURISHING_VOCABULARY_CONVERGENCE_CENSUS.md) ·
[Attachment A instrument](../../../governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md) ·
[Source & custody sitting agenda](../../../governance/LARRY_SOURCE_AND_CUSTODY_SITTING_AGENDA_v1.md)

---

## 0. What the two documents are

Doc 1 — a product reading of the presentation ("the presentation in one sentence" → 14 sections → threshold onboarding proposal).
Doc 2 — a positioning argument ("relationship as operating system"; the AIN-vs-conventional-coaching table).

Both are **derived artifacts** — readings of the talk, not Larry's language.

**A transcript of the talk has been supplied.** Its governed preservation under `00_PROVENANCE/` is pending, not complete. What follows from that:

| Fact | Status |
|---|---|
| Transcript text | **supplied** — exists, reachable to the founder |
| Governed preservation (unchanged, under `00_PROVENANCE/`, with a source note) | **pending** — the next act |
| Original audio | **not held** |
| Speaker attribution within the transcript | **unverified** — who said what is not yet established line by line |
| Domain taxonomy | **not ratified** — no list of domains is settled by the transcript's existence |

The custody agenda names the failure mode this preservation closes:

> "An interview *was* conducted before; only speaker-labeled highlights survive […] treat every derived summary as derived — never as the source."

This review is filed as a **reading of derived material**. It does not move any item toward ratification. The transcript's existence does not change that: a supplied transcript is a source to be preserved and read *with Larry*, not a ratification of anything read out of it.

---

## 1. Vocabulary drift — the urgent finding

Three incompatible flourishing vocabularies are now in circulation, two of them produced within a single session:

| Source | Domain list |
|---|---|
| **Currently enforced** — `database/migrations/20260805200001_flourishing_dimension.sql`, mirrored by `lib/nowWhat/flourishingDomains.ts` | relationships · meaning · presence · health · contribution · **time** |
| Attachment A §0 — ⚠️ **Soullab-authored draft instrument, not evidence** | Relationships · Meaning and Purpose · Time Affluence · Presence · Health and Energy · Contribution |
| **Doc 1** | relationships · meaning · presence · health · contribution · time · **leisure** |
| **Doc 2 §4** | relationships · health · meaning · presence · **money** · contribution · **leisure** (no time) |

⛔ **Attachment A cannot attest its own list.** §0 of that instrument is Soullab-authored drafting — it is the document that exists in order to *ask* Larry what the domains are. Citing it as evidence that Larry holds these six is circular provenance, and an earlier cut of this review committed exactly that error. Absent a Larry-authored source, these are **the currently enforced six**, never "Larry's six." 

Two derived documents producing two *different* seven-item lists is the signature of re-derivation from memory rather than from a source.

**Disposition:** neither list may touch the CHECK constraint, the constant, or the seed.
`lib/nowWhat/flourishingDomains.ts` exists precisely because this drift already happened, and its instruction is explicit — the domains "must be captured in Larry's own language at the custody sitting — never re-derived from our own documents."
`leisure` and `money` are **source-supported but unratified**: the supplied transcript contains a leisure discussion and the phrase "time and money well spent." So the open question is *not whether Larry used these concepts* — he did. It is **what status each holds**:

> a domain · an aspect of another domain · a practice · an illustrative example · something else entirely

That question is Larry's to answer, and it cannot be answered by counting occurrences in a transcript. It enters Attachment A §4 as an open gap for the sitting.

Noted for the record: Doc 2 §4's own argument — *do not build the domains as siloed modules* — describes the system as it already is. `flourishing_dimension` is a tag on member-authored work. There are no domain modules.

---

## 2. Already live — read as description, not proposal

Both documents propose, in good faith, mechanisms the repository already carries. Recording the mapping so the analyses are not mistaken for a build backlog:

| Claim | Where it already lives | Note |
|---|---|---|
| Doc 2 §1 — relationship as a first-class object | `lib/coachField/bringForward.ts` | Stronger than described. The doc says "with permission"; the implementation makes permission a **third member-authored object** with opaque lineage — the source stays unreachable from any practitioner-scoped query. |
| Doc 2 §2 — continuity between sessions | `lib/nowWhat/carriedThread.ts`, `lib/nowWhat/livedRelation.ts` | "session → life → noticing → reflection → session" *is* the V1 return loop. |
| Doc 2 §5 — returning the person to themselves | `carriedThread.ts` | Stricter than described: `livedRelation.ts` forbids anything downstream reading the relation as progress. |
| Doc 2 §6 — peer stance, no expert hierarchy | `lib/nowWhat/roomGrammar.ts` | The person's own words are primary; the elemental lens is optional and last. |
| Doc 2 §7 — pattern without declared identity | `tests/constitutional/refusal-registry/refusal-24-cross-session-continuity-truthfulness.ts` | The observed-vs-asserted boundary is already a constitutional refusal. |
| Doc 1 §3, §5, §6, §8, §9, §13 | Five-room ontology (`lib/nowWhat/rooms.ts`), `roomGrammar.ts`, member-owned boundary | No score, no gamification, conversation as the room, Larry visible but not central, MAIA not Synthetic Larry. |

**Risk this section exists to manage:** both documents are coherent and persuasive. Their coherence should not trigger a redesign of settled surfaces. Where an analysis and the build agree, the build is the record.

---

## 3. Genuinely ahead of the build

Preserved as direction. Unbuilt, unauthorized, no schema implication.

- **Doc 2 §3 — relational field decomposition.** Decomposing a presenting problem into the relations that constitute it (`SELF ↔ WORK`, `SELF ↔ FATHER'S EXPECTATIONS`, `SELF ↔ FUTURE`). Nothing in the repository models relations *between* a member's relations. The most architecturally consequential idea in either document.
- **Doc 2 §8 — relationships as participants.** A spouse or friend brought into the work is a third party with no account, no consent, and no withdrawal path. This requires its own consent instrument before any design work; it is not an extension of `bringForward`.
- **Doc 2 §9 — "Now What?" across decades.** Argues the return anchor should survive across life chapters, not weeks. Cheap to reason about, and a real constraint on `carriedThread.ts`'s selection rule if pursued.
- **Doc 1 §4 — the threshold.** The last ten minutes of the talk as the first ten minutes of the product. There is currently no post-talk entry: `/now-what/welcome` has zero inbound links by design and `/now-what/arrive` is the auth door. The only place where software presently interrupts the continuity of the coaching relationship.
- **Doc 1 §10 — doorway ≠ method.** The method may generalize; the achievement-threshold story does not. Argues against hard-coding one entry narrative.

---

## 4. One contested claim

Doc 2 §1 illustrates relational intelligence with MAIA saying:

> "This decision touches something you've been exploring with Larry for several weeks."

This inverts `bringForward`. That channel is deliberately **one-directional — member → practitioner**. MAIA reading the coach field back into the member's conversation would make MAIA an observer of the coaching relationship rather than a participant in the member's own work.

The document's instruction to "stop there" does not resolve it: the sentence preceding the stop already asserts both a pattern *and* Larry's relevance to it. Two assertions, neither the member's.

**Disposition:** MAIA stays with the member's own kept acts. Larry remembers Larry.

---

## 5. Representation disposition

Doc 2's closing formulation — *"other coaching software manages clients; AIN helps sustain a developmental relationship"* — passes claim discipline **only with its Center of Gravity stated**:

| Register | Sections |
|---|---|
| **Live** | Doc 2 §1, §2, §5, §6, §7 |
| **Designed** | Doc 2 §3, §9 · Doc 1 §4, §10 |
| **Vision** | Doc 2 §8 |

Without that split the documents read as uniformly Live and fail the Failure Test. See `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`.

---

## 6. The next act — governed preservation

The transcript exists. The open item is therefore **not** whether a source is reachable, but that it has not yet been preserved under governance.

**Next act:** place the transcript **unchanged** under `00_PROVENANCE/` with a source note recording how it was produced, by whom, from what, and when. Unchanged means no cleanup, no speaker inference, no excerpting, no summarisation — the value of a preserved source is precisely that it has not been improved.

What preservation does **not** settle, and must not be read as settling:

- **Audio** is not held. The transcript is itself one remove from the event.
- **Speaker attribution is unverified.** Group discussion appears throughout both analyses ("one participant says…", "his mother raises…"). Which words are Larry's is not established line by line, and Class A / B / C in Attachment A turns on exactly that.
- **The domain taxonomy is not ratified.** No count and no list becomes settled by the transcript being held. See §1.

Until preservation is complete, both analyses remain derived readings of a source the repository does not carry.

---

## 7. Correction record

The first cut of this document (commit on `claude/google-docs-link-review-6rj0yz`, 2026-09-02) carried three provenance errors, corrected here and recorded rather than silently overwritten:

1. **Claimed the talk source was unknown or unreachable**, and closed on the question "does a transcript exist?" It does; it was supplied. The live item is governed preservation, not discovery. (§0, §6)
2. **Framed `leisure` and `money` as unsupported by any source.** Both are present in the transcript. The open question is their *status* in the taxonomy, not their existence. (§1)
3. **Cited Attachment A §0 as attesting Larry's six domains** — circular provenance. That instrument is Soullab-authored drafting whose purpose is to ask Larry the question; it cannot answer it. The six are the *currently enforced* six. (§1)

Error 3 is the one worth keeping visible: it is the same move the whole custody protocol exists to prevent — treating a Soullab document as evidence for the thing it was written to ask about. It survived a review whose explicit subject was that failure mode.
