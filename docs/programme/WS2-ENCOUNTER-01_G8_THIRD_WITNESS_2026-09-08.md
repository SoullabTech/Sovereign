# WS2-ENCOUNTER-01 — G8 third witness (post scope-honesty repair) · STOPPED AT W4

**Commit witnessed**: `9b41d78d` — code byte-identical to `e05f6e35` under `lib/` and `scripts/`
(`git diff --stat e05f6e35..HEAD -- lib scripts` → empty).
**Work**: `55742458…` *ELEMENTAL_ALCHEMY* · draft `cef52911…` · **rev 7 · 386,031 code points** ·
digest `92dff3a4…` — **identical snapshot to the second witness**, so the two are directly comparable.
**Provenance**: `anthropic` · requested `claude-opus-5` · reported `claude-opus-5` · `agreed`, all four windows.
**Windows**: 33 planned · **3 completed · 1 refused · 29 not reached**

> ## Standing: **G8 IS NOT CLOSED. The Work was not encountered.**

---

## 1 · Windows 1–3

| measure | W1 | W2 | W3 | total |
|---|---|---|---|---|
| proposals | 6 | 7 | 11 | **24** |
| excerpts | 8 | 12 | 17 | **37** |
| `exact : YES` | 8 | 12 | 17 | **37 / 37** |
| `not_found` · `ambiguous` | 0 · 0 | 0 · 0 | 0 · 0 | **0 · 0** |
| mechanical rejections | 0 | 1 | 1 | **2** |

**Excerpt binding: 37/37 exact, zero failures.** Combined with the second witness, **75 of 75
excerpts** have bound exactly across both runs. Suppression cost remains **zero**.

### ⭐ F-2 did not recur

Every `openness` notice bounded itself in its own wording — *"within it"*, *"within this
stretch"*, and in W3 the exact form rule 10 asked for: *"appears here and does not recur in this
stretch."* Across 24 proposals there is **no unscoped non-return claim**.

The scope line appeared above every surviving notice regardless:

```
scope      : visible_window 11600..24000 of 386031
```

Both halves of the repair behaved as designed — the record carries the field, and the
instruction independently improved the wording. **The record is what makes that verifiable**;
the wording alone would have been unfalsifiable.

### ⛔ F-4 is now a pattern, not an anecdote

Three mechanical rejections across the two runs' comparable windows, **zero true catches**:

| window | rule fired | the phrase | what MAIA was doing |
|---|---|---|---|
| second witness, W2 | `comparative_quality` | *"hardship making a person **better**"* | reporting the Work's claim |
| this run, W2 | `reader_effect` | *"instructions to **the reader**"* | describing what the Work contains |
| this run, W3 | `deficit_lexicon` | *"an example of its **absence**"* | describing what the Work contains |

**Three different lexical families, one underlying defect: indirect report of the Work's
content, screened as if it were MAIA's own claim about the Work.** The authorship boundary from
`93e88343` protects **quotation**; nothing protects **indirect speech**. Each instance failed
closed — safe, and costing a lawful observation roughly once per window.

⛔ Not repaired. Kept separate from the completion question rather than repairing two things at
once (founder ruling).

---

## 2 · Window 4 — the stop

The provider returned a completed `tool_use`. `input.notices` arrived as a **JSON string
instead of an array** — double-encoded — and the string's own contents were independently
corrupt:

```
{\"family\": \"movement\">, \"assertion\": ...
                        ^ stray '>'
```

`parseNoticeBlocks` refused at `Array.isArray(raw)`; the act reported `cognition_unavailable`
and the witness exited. **C7 held**: a malformed structured response is a refusal, never silence.

### ⛔ The observations inside that string do not count

They read as reasonable. They are nonetheless **discarded**, and were never read into any
adjudication. *Salvaging them would give constitutional status to output that never entered the
contract.* No lenient re-parse was added — that is the same error class as a forgiving excerpt
matcher, and here it would have been parsing corrupt data besides.

### ⛔ No retry — founder ruling, and it corrects this session's framing

An earlier reading in this session called this a transport failure and reasoned that "nothing
was said that a retry would be re-saying". **That was wrong, and the correction is load-bearing:**

> A `StructuredResult` existed. MAIA answered, and failed to answer *through* the constituted
> contract. A second call could produce different observations — which is exactly the
> opportunity C5 exists to deny.

```
REQUEST SENT → no StructuredResult ever exists        → transport class (see design lane)
REQUEST SENT → completion → tool_use → contract broken → POST-COGNITION FAILURE · NO RETRY
```

---

## 3 · What this witnessed

**A reliability problem, now observed rather than hypothesised.**

> Whole-Work Encounter currently requires every one of many independent cognition calls to
> complete its structured contract perfectly. One malformed response invalidates the entire
> Encounter — correctly, by §1A and C6, because a partial Encounter must not masquerade as
> whole-Work attention.

For this Work that is **33 consecutive perfect structured completions**. Observed so far across
both witnesses: **7 completed calls, 1 malformed.**

⛔ This is not evidence the architecture is wrong. It is evidence that the completion boundary
needs designing before Encounter can be offered on a Work of this length.

## 4 · Standing

```
exact excerpt binding        ✅ CLOSED   (75/75 across both witnesses)
authorship boundary          ✅ CLOSED
scope provenance             ✅ CLOSED   (F-2 did not recur in 24 proposals)

G8 third witness             ⛔ STOPPED AT W4 — Work NOT encountered
malformed-contract retry     ⛔ FORBIDDEN
pre-result transport recovery   OPEN — DESIGN ONLY
F-4 indirect report          ⛔ RECORDED · now repeated · NOT repaired
F-1 partial grounding        live evidence, unmeasured this run
E3 · PR · deploy             HOLD
```

> Three windows of a thirty-three-window Work is not an Encounter. It is three windows.
