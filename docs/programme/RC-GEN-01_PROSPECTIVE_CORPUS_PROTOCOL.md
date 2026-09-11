# RC-GEN-01 · PROSPECTIVE BLIND CORPUS — protocol

**Authorized by the founder, 2026-09-11.** One corpus. Frozen before any verifier
runs. Its purpose is to decide between two live architectural hypotheses, and it
is the only evidence that may authorize either.

> **The law this corpus exists to honour:** *Discovery evidence can justify a
> hypothesis; only prospective evidence should authorize a central architectural
> role.*

## The two hypotheses

- **H1 — CLOSURE-RISK DETECTOR.** The detector finds situations in which
  *agreement itself* becomes unreliable. **PLAUSIBLE · not demonstrated blind.**
- **H2 — CHALLENGER ROUTER.** The detector finds where DeBERTa is weak and
  MiniCheck supplies complementary judgment. **REOPENED · provisionally
  supported** (blind: detector caught 7/9 DeBERTa errors, MiniCheck rescued 5/7).

## ⛔ THE BLINDNESS RULE, AND WHO IT DISQUALIFIES

The author may know the research question — **temporal and scope boundaries** —
and may know the semantic categories: *time · frequency · duration · condition ·
role · relationship · state*.

The author may **NOT** inspect or design against `LIMITERS`, `RELEASES`, the
detector regexes, or the `M`/`D` cases that reveal literal trigger vocabulary.

⛔ **This disqualifies the assistant that wrote the detector.** Knowing the
trigger vocabulary makes good-faith authoring *worse* than deliberate
manufacture, because nobody can audit what the author steered away from. The
authorship decision is therefore a founder act and is recorded here before any
case is written.

⛔ **Do not manufacture a 20/20 inside/outside split.** Write natural English
first; freeze; *then* let the frozen detector classify. A corpus balanced to the
detector is a detector-designed corpus.

## Shape

- **40 cases · 20 semantic pairs.** Each pair: one genuinely licensed claim, one
  closely matched claim that improperly extends time, frequency, duration,
  condition, role, relationship or state.
- Entirely fresh people, domains, wording, sentence structures. No reuse from
  `fixtures*.json`.
- Licensed controls in both strata (which stratum a case lands in is not known at
  authoring time — that is the point).

## Freeze record (to be completed BEFORE any verifier runs)

```text
fixture path            scripts/verifier-probe/fixtures-prospective.json
fixture sha256          <pending>
expected label          frozen for every case
family / category       recorded per case
authoring date          <pending>
author                  <pending — founder act>
DETECTOR RULE sha256    18608a18a0a681b212d9b0052c8238e3c543f3203e1a6633dd4520f04696ad86
```

After the freeze, **no** fixture edits · **no** detector edits · **no** regex
additions · **no** threshold changes · **no** "just one more case" after seeing
results. ⛔ **If the set is underpowered, it is called underpowered. It is never
topped up adaptively.**

## THE PRIMARY QUESTION — predeclared, reported alone

> When DeBERTa and MiniCheck **agree**, is that agreement less often correct
> **inside** the frozen detector regime than outside it?

```zsh
python3 scripts/verifier-probe/boundary_check.py --against <results>.json \
        --only prospective --primary
```

Reports agreement precision inside · outside · difference in percentage points ·
n of agreements in each group · Fisher exact.

⛔ **Floor: 8 agreements inside.** Below it the answer is **UNMEASURED**,
regardless of how attractive the percentage looks. `--primary` prints this block
**alone**, so that a strong secondary result can never stand in for a failed
primary one.

## Secondary questions — separate run, never a substitute

1. detector coverage of DeBERTa errors
2. cost in correct DeBERTa claims routed
3. MiniCheck rescue rate inside / outside
4. MiniCheck disruption rate inside / outside
5. DeBERTa ⇄ MiniCheck dependence, per stratum
6. licensed / unlicensed performance for each verifier

## What each outcome settles

| result | consequence |
|---|---|
| agreement precision substantially **lower inside** | ⭐ **closure-risk detector EARNED** — the architecture has independently found a regime where even cross-model agreement should not harden into fact |
| agreement precision **similar** inside and outside | ⛔ closure-risk interpretation **FAILS**. The detector may still be a *DeBERTa-risk* detector, and MiniCheck a useful routed challenger — but flagging alone would not justify withholding closure |
| MiniCheck **rescues strongly inside** without excessive disruption | **challenger-router** gains support; a simpler architecture |

## Methodological laws recorded by this protocol

1. *Pooling homogeneous effects concentrates evidence; pooling heterogeneous
   effects conceals disagreement.* Never read a pooled figure without the split
   beside it.
2. *Discovery evidence can justify a hypothesis; only prospective evidence should
   authorize a central architectural role.*
3. ⭐ *The moment a result changes when we separate evidence that discovered the
   hypothesis from evidence that never saw it, the separation itself becomes part
   of the science.* The unseen corpus is a **distinct evidentiary class**, not
   another row in an aggregate.

---

## AUTHORSHIP — founder act, 2026-09-11: fresh subagent, prompt recorded

Founder chose a fresh subagent over authoring it himself, on the grounds that
this conversation had already exposed him to specific limiter forms. A true
third party is reserved for **confirmatory replication if this set produces an
architecture-changing result** — not spent now.

⛔ **This prompt was committed BEFORE the subagent ran.** That ordering is the
whole point: a prompt recorded after seeing the corpus proves nothing. Audit it
for leaked trigger vocabulary — it names only the founder's seven semantic
categories and contains no limiter or release term.

```text
Write a set of 20 PAIRS of short factual test items in natural English — 40 items
total. Each item is a PREMISE (one or two sentences of ordinary prose) and a
HYPOTHESIS (one short sentence). Each hypothesis is labelled by whether the
premise actually supports it.

Each PAIR shares one premise and has:
  - one hypothesis the premise genuinely supports        -> expected "entailed"
  - one closely matched hypothesis that goes beyond what the premise supports,
    by overstating one of these aspects:
        time · frequency · duration · condition · role · relationship · state
                                                          -> expected "not_entailed"

Requirements:
  - Write NATURAL English. Write the premise first, as though it came from an
    ordinary profile, news item, letter or biography — not as a test item.
  - The two hypotheses in a pair should differ as little as possible while
    differing in exactly one of the seven aspects above.
  - Twenty DIFFERENT domains and twenty different sets of people. Invent names
    and places freely. Vary sentence structure — do not use one template.
  - No ambiguity: a careful reader must agree with each label without argument.
    If you cannot make a case unambiguous, write a different case.
  - Do not write about AI, models, verification, entailment or testing.

Output ONE JSON file to the path you are given, shaped exactly like this:

{
  "set": "prospective",
  "note": "<one sentence you write on how you approached it>",
  "categories": [ "<the aspect names you actually used>" ],
  "cases": [
    {
      "id": "X01",
      "family": "<short kebab-case name for the pair, same for both members>",
      "origin": "prospective",
      "premise": "...",
      "hypothesis": "...",
      "expected": "entailed" | "not_entailed"
    }
  ]
}

Ids X01..X40. The two members of a pair share a "family" and sit next to each
other. Exactly 20 "entailed" and 20 "not_entailed".

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Do NOT read any file under scripts/verifier-probe/ other than writing your
    own output file. Do not read any existing fixtures, any Python in that
    directory, or any document under docs/programme/. If you open one by
    accident, say so plainly in your final message.
  - Do not search the repository for this task. You need nothing from it.
  - Write from your own sense of English. Do not try to infer what any
    downstream program is looking for; there is no pattern to match and
    guessing at one would ruin the result.

In your final message, report: the output path, the number of cases, and
anything you had to judge or were unsure about.
```

**Constraints carried into the run:** no access to `boundary_check.py`,
`LIMITERS`, `RELEASES`, previous fixtures, or detector outputs; no repository
search; instructed not to infer what any downstream program looks for.

**Post-authoring discipline (binding on me):** I do not edit its sentences. Label
disagreements are recorded openly in this document rather than silently fixed.
The corpus is hashed and committed, and only then does the frozen detector
classify inside/outside.
