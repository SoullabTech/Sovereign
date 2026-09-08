# WS2-ENCOUNTER-01 — Exact-excerpt evidence primitive · REPAIR LANDED, NOT WITNESSED

**Lane**: `JARVIS-WRITERS-STUDIO` / WS2-ENCOUNTER-01
**Branch**: `claude/studio-bring-work-back-icvfaa`
**Authorizing act**: founder ruling 2026-09-08 (post-G8), one repair act, narrow file scope.
**Standing**: ⛔ **IMPLEMENTED · GATED · NOT WITNESSED.** G8 has NOT been re-run. Nothing deployed.

---

## 1 · What was ruled, and what this discharges

G8 — the first live Encounter of a real Work — **FAILED on grounding**. The founder ruling
that followed selected the repair and bounded it:

> **The cognition identifies the evidence by reproducing it.
> The server establishes where that evidence actually is.**
>
> The server may establish an **EXACT** correspondence.
> It may never infer an **INTENDED** correspondence.

Quotation-as-primitive was ruled **lawful** — distinct from the barred "automatic quote
lookup", whose subject is *repairing a location claim after the model got it wrong*. There is
now no model-authored location claim to repair, because there is no field in which to make one.

Server-enumerated units (paragraph / section IDs) were **NOT selected** — section
addressability returning by another route. Part B (authorship-aware screening) is discharged
only to the extent Part A makes it structural; **no lexicon was redesigned**.

---

## 2 · The primitive

```
ModelNoticeProposal { family, assertion, evidence: [ { excerpt } ] }
```

No model coordinate. No model digest. No unit, paragraph, section or line id.

| excerpts matching **exactly** inside what THIS call was shown | outcome |
|---|---|
| 0 | does not bind — fabricated, altered, or not shown to this call |
| 1 | binds; **the server** computes the code-point range and the digest |
| 2+ | does not bind — ambiguous; the server chooses **nothing** |

The lawful remedy for ambiguity belongs to the model, not the server: quote a longer
surrounding passage until it is unique. A server that picked an occurrence would be doing the
exact thing the prohibition exists to prevent.

**Exactness means exactness.** No apostrophe folding, no whitespace normalization, no case
folding, no punctuation repair, no fuzzy match, no edit distance, no similarity. This will
suppress some lawful observations. That is to be **measured later**, not hidden behind a
forgiving matcher.

**Code points, never UTF-16.** The matcher searches in UTF-16 and converts before any offset
leaves the module, so an em dash, an emoji or an astral character cannot silently shift an
anchor. E1 pins this with a fixture whose two index spaces disagree.

---

## 3 · The authorship boundary (Finding B, first half)

The live run showed the vocabulary screen reading MAIA's words and the Work's quoted words as
one undifferentiated utterance. The repair is **structural, not lexical**:

- the model reports `assertion` (its own words) and `evidence` (the Work's words) separately;
- `bindProposals()` puts **only the assertion** in `CandidateNotice.text`;
- the evidence becomes anchors — a range and a digest — and nothing else;
- so the screen is unchanged and still screens everything MAIA asserts, while a Work is free
  to contain sentences MAIA may never assert.

> Quoting the Work does not make MAIA the author of it. Quotation marks would not have carried
> this: they are presentation syntax, not provenance. The exemption is earned by the binding —
> by the server having proved the excerpt is literally Work material.

Evidence is **not** a second, unscreened assertion channel: anything MAIA composed is by
definition not present in the Work, so it does not bind, and the notice dies with it (E8).

---

## 4 · Files changed (the authorized scope, and nothing else)

| file | change |
|---|---|
| `lib/manuscript/encounter/parse.ts` | `ModelNoticeProposal` = `family` + `assertion` + `evidence[{excerpt}]`; closed key sets at every level; coordinates removed |
| `lib/manuscript/encounter/bind.ts` | `bindExcerpt()` exact/unique matching inside the visible window, UTF-16 → code-point conversion; `bindProposals()` sets `text = assertion` |
| `lib/manuscript/encounter/render.ts` | tool schema: `spans` → `evidence`; `text` → `assertion`; system rules 6–9 (two parts, verbatim, quote-until-unique, report no positions); the window message no longer carries offsets |
| `lib/manuscript/encounter/structuredGenerator.ts` | call-site documentation only; whole-Work traversal, one-call-per-window and no-retry laws untouched |
| `lib/manuscript/encounter/vocabulary.ts` | documentation only — **no lexicon change**; records that `c.text` is the assertion alone |
| `scripts/witness/encounter-g8-live-ear.ts` | prints the model's quote, the server-bound text, the range and the digest; per-excerpt `not_found` / `ambiguous` are surfaced as findings, never repaired |
| `lib/manuscript/encounter/__tests__/cognition.test.ts` | existing G-series repaired to the new shape; **E1–E10 added** |

Not touched: the route, `read.ts`, `traversal.ts`, `contract.ts`, the structured seam, the
PT-3 constitutional set, any schema, any deployment path.

---

## 5 · E1–E10 (the ruled falsifier set)

| # | obligation | discharged by |
|---|---|---|
| E1 | an exact, unique excerpt binds — anchor correct **in code points** | `E1 · …binds, and the anchor addresses the same characters the model quoted` |
| E2 | a fabricated excerpt does not bind | `E2 · ⛔ not_found — never the nearest plausible text` |
| E3 | a repeated excerpt does not bind; extending the quote is the remedy | `E3 · ⛔ ambiguous…` + `extending the quotation…` |
| E4 | any normalization change does not bind; no normalization machinery exists | `E4 · exactness means exactness` (5 cases + source scan) |
| E5 | the tool schema has no `startCodePoint` / `endCodePoint` / `spanDigest` / `unitId`, and a volunteered coordinate is **refused, not ignored** | `E5 · the model has no field in which to make a location claim` |
| E6 | exposure still holds — an excerpt real in the Work but shown to another call does not bind; overlap remains lawful | `E6 · existence is not exposure` |
| E7 | the Work's own forbidden vocabulary, quoted as evidence, does not trip the screen | `E7 · quoting the Work does not make MAIA the author of it` |
| E8 | evidence cannot be an unscreened assertion channel | `E8 · evidence is not a second, unscreened assertion channel` |
| E9 | the assertion is still screened, unchanged | `E9 · the assertion is still screened, exactly as before` |
| E10 | one failed evidence member invalidates the whole notice | `E10 · one failed evidence member invalidates the whole notice` |

**One finding surfaced while writing E4, and it is recorded rather than smoothed over.** A
*shorter* exact substring (the same sentence minus its closing period) **binds** — to the
shorter span it actually names. That is exact correspondence working as ruled, not leniency:
the server certifies what the model quoted, no more and no less. It is pinned as its own test
so a later reader does not mistake it for a hole.

---

## 6 · Gates

| gate | result |
|---|---|
| Encounter suite (`lib/manuscript/encounter/__tests__`) | **88 passed · 0 failed** |
| PT-3 constitutional set (`npm run test:source-custody`) | **39 passed · 0 failed** |
| Structured seam (`lib/ai/structured/__tests__`, incl. the byte-pin) | **60 passed · 0 failed** |
| `npm run typecheck` | **229 errors vs baseline 239 · 0 regressions · exit 0** |
| `npm run check:no-supabase` | clean |
| witness script typecheck (standalone) | clean |

⛔ The seam baseline was **not** moved. No `typecheck:baseline` was recorded.

---

## 7 · What is still owed

1. ⛔ **G8 RE-RUN — the only thing that can close this.** Founder-run, from the product
   execution environment, never from an authoring session. Deployed-and-gated is a claim about
   code; G8 is a claim about MAIA. The two adjudication questions are unchanged: *(a)*
   recognition, or the beginning of a case? *(b)* does the cited text **ground** the assertion,
   or merely exist there? An anchor now proves the excerpt is real and was shown. It still
   cannot prove grounding — that remains a human judgment, by design.
2. **Suppression is unmeasured.** How often lawful observations are lost to a near-miss quote
   is unknown, and the honest way to learn it is the re-run's `not_found` / `ambiguous` lines.
3. ⛔ **Finding B2 residue is NOT repaired** — the screen still cannot catch a developmental
   *move* made in lawful vocabulary. Recorded, not fixed; that is the ruled two-evidence-class
   architecture, and the semantic ear remains the instrument for it.
4. ⛔ **No PR. No deploy. No migration. No schema change.**

> The server proved what it was asked to prove. It is now asked the right question. Whether
> MAIA can answer it is still unwitnessed.
