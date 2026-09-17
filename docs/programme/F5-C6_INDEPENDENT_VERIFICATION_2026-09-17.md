# F5-C6 — INDEPENDENT VERIFICATION OF J6 ADVERSARIAL FALSIFICATION

```text
TYPE      INDEPENDENT SPOT-VERIFICATION before the J7 founder witness
SUBJECTS  LAW b52c53eae · ORGANISM 89b79a4a — both fetched from origin here
RESULT    every claim tested CONFIRMED · one understated · one upstream correction owed
SCOPE     4 of 25 FAILs tested · 21 NOT tested and not attested

⛔ not ratification · ⛔ not repair · ⛔ no source, schema or production change
```

**Custody.** Both bound SHAs resolve after fetch. `89b79a4a` is a **descendant of `7ee173db`**,
the subject of F5-A/B/C, so this is the same organism further along — findings here and there are
comparable without re-binding.

---

## 1 · I-4 / I-27 — CONFIRMED, and J6 understated the mechanism

J6's description ("accepts caller-supplied content/source information") is correct but soft. The
exact shape, at `app/api/psyche/portfolio/keep/route.ts` and `lib/psyche/portfolio.ts`:

```
POST /api/psyche/portfolio/keep
  sourceType  ← caller, validated ONLY against a 9-value allowlist incl. session_excerpt
  title       ← caller, validated ONLY as a non-empty string
  body        ← caller
  sourceId    ← caller, validated ONLY as a non-empty string
  memberId    ← overridden from verified session
        ↓
keepSource()  →  generated_by = 'member-gesture'
```

`keepSource` has **exactly one source-resolving branch**: `capsule`, which calls
`resolveCapsuleDeclarationSource(memberId, sourceId)` and verifies existence, ownership and
eligibility. For **`session_excerpt`, `journal`, `dream`, `reflection`, `idea`, `idea_block`,
`decision`, `change`** the only check is that `sourceId` is a non-empty string. Nothing resolves it,
nothing proves it belongs to the member, and **nothing relates the supplied `title` to anything
inside it**.

So MAIA-authored prose reaches member provenance by the simplest available route. **I-4 FAIL and
I-27 FAIL confirmed.**

### 1.1 · ⚠️ UPSTREAM CORRECTION OWED — D9-B B9 cites a blocker that does not gate the writer

D9-B B9 ruled `session_excerpt` **"not constructible at this SHA"** because `listSourceCandidates`
returns `[]` (*"tables don't exist yet … Return empty for Phase 1"*).

**`listSourceCandidates` is a read-side discovery helper and is never called by the write path.**
Neither `keepSource` nor the keep route references it. B9 tested the surface that *offers* sources,
not the surface that *accepts* one.

B9 recorded its own result as *"contingent on absence, not on a guard"* — **that was too generous.
There is no absence either.** The path is open, validated, and reachable by an authenticated member.

⛔ Not repaired and not edited: D9-B is frozen and in another lane. **Marked here so the finding
travels with B9 rather than being discovered a third time.** My own SPM-FC-01 I-4 cited B9 as its
evidence and inherited this error; the law was right, part of the evidence for it was not.

### 1.2 · The organism already holds the correct pattern

This sharpens J6's R4 root. The conforming shape exists and is documented in source:

- **`capsule`** — a resolver that *"may verify and read; it never inserts"*, enforcing existence,
  ownership and eligibility before the mint.
- **`practitioner_observation`** — refused at the door, because `keepSource` has no facilitator
  context and an unattributed practitioner atom would be unattributable.

**Two of nine source types carry origin verification. Seven do not.** R4 is therefore an
*unfinished application of a pattern the organism has*, not an architectural absence — a materially
different fact for any later repair decision.

---

## 2 · I-33 — CONFIRMED, with a nuance that changes how it should be read

`MemoryBundle.ts` Cut-1 path:

```
recordCut1Trace(...) throws
        ↓
console.warn('[cut1_trace_write_failed]')
        ↓
return candidates        ← the turn proceeds
```

Exactly as J6 described. **But the comment immediately above it is load-bearing:** *"The LIVE
candidates above are already decided. Trace persistence cannot alter them."*

That is the **non-perturbation requirement** the temporal-memory lane made its central risk — *a
recording mechanism that perturbs the thing it records.* The trace was deliberately built unable to
affect retrieval. A trace write that cannot block retrieval is also a trace write whose failure
cannot stop the turn.

**I-33's FAIL is a consequence of a correct constitutional choice in another lane, not negligence.**
The two requirements — *never perturb* and *never act without the occasion record* — are in genuine
tension. ⛔ No resolution proposed; naming the tension is the finding.

---

## 3 · I-29 — CONFIRMED, marginally worse than stated

`components/account/AccountSettings.tsx` → `deleteAccount`:

```ts
if (res.ok) { /* clear localStorage; redirect to '/' */ }
// no else
catch (err) { console.error(...) }
finally { setDeleting(false) }
```

There is no `else` branch and no deletion-error state. On the governed 409 the spinner stops and the
dialog returns to idle: **the member's most consequential request produces a surface indistinguishable
from a no-op they never made.** `message`, `retained`, `accountChanged: false` and `nextStep` are all
present in the response and none is read.

Note the same component's comment explaining why it deliberately sends no `memberId` — the client
was carefully reasoned about on the request side and not on the response side.

---

## 4 · Scope of this verification

```
TESTED and CONFIRMED     I-4 · I-27 · I-33 · I-29
NOT TESTED HERE          the remaining 21 FAILs, and all 6 PASSes
```

⛔ **This record attests to four findings.** It is not an independent re-run of J6 and must not be
quoted as one. Where F5-C (`76702850`) independently found `circle_memberships` and `shared_artifacts`
among 14 multi-sovereign loci no located erasure path names, that corroborates I-20/I-24 at the
earlier subject — it is corroboration, not verification at `89b79a4a`.

---

## 5 · Verdict for J7

```
faithful to the organism on everything tested        YES
finding that should go back                          none for more evidence
marking owed upstream                                D9-B B9 (§1.1)
characterization owed                                R4 root, sharpened (§1.2)
reading owed                                         I-33 as lane tension, not negligence (§2)

RATIFICATION   ⛔ founder act, not taken here
IMPLEMENTATION ⛔ CLOSED
PRODUCTION     ⛔ UNTOUCHED
```

> *J6 found the seam. The seam is wider than J6 said, the blocker an earlier lane cited was never
> in the path, and the organism already knows how to close it — on two of nine doors.*
