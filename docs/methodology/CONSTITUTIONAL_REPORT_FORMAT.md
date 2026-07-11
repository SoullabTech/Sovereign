# Constitutional Report Format

**Status: Candidate methodology.** Proposed, not house standard. Inspect it, adopt it, challenge it, or ignore it. See *Ratification criterion* below.

## 1. Purpose

Align claims with evidence and make verification state explicit. A report should say *what reality currently supports* — not "done." Every success is stated together with its bound: what is not yet proven, and what remains pending.

## 2. Report structure

Answer six questions, in order:

1. **What was intended?**
2. **What was built?**
3. **What is proven?** — only observable facts: code exists, tests ran, output was observed. Never *effectiveness* or *adoption* — those are Not-proven until measured. (Artifact existence ≠ artifact effectiveness.)
4. **What is not yet proven?** — evidence that does *not* yet exist (guards against overclaim).
5. **What remains pending?** — untested or deferred.
6. **What is the next proving step?** — the next thing reality must answer.

Questions 3–5 compress to a **Proven / Not proven / Pending** block. Always end on 6.

## 3. Title discipline

The title must not claim a stronger verification state than the report supports. A strong "Proven" section does not license a title that skips "Not proven / Pending."

- **Worked example (the correction that produced this doc):** a report titled *"Voice Lab MVP — shipped and verified"* whose own body stated *"nothing committed or deployed."* The title borrowed authority from a deployment that never happened. Accurate title: **"Voice Lab MVP — implemented and locally verified; deployment pending."**

## 4. Ratification criterion

This is a **Candidate** methodology. It graduates to house standard only through **repeated successful use without reinterpretation** — contributors applying it correctly from this document alone, without it being re-explained — demonstrating it consistently improves clarity and reduces overclaiming. Promotion comes from accumulated practice, not declaration.

A practice that must be re-explained every time has not stabilized. A practice contributors use correctly *because the document is sufficient* has become shared language — and that is the evidence for promotion.

---

## Appendix — verification vocabulary (provisional)

A shared *language*, not a maturity model: precise terms so titles converge and distinct states don't collapse into "done" or "verified." Use the strongest term the evidence actually supports.

| State | Meaning |
| --- | --- |
| **Implemented** | Code exists. |
| **Locally verified** | Local tests or inspection support the implementation. |
| **Integrated** | Connected into the intended system. |
| **Deployed** | Running in the target environment. |
| **Runtime verified** | Observed functioning in the target environment. |
| **Field validated** | Demonstrated under real user or operational conditions. |

This table is **explicitly provisional**. If, after several months, contributors keep using these terms without needing to reinterpret them, *that* is the evidence that the vocabulary itself has earned promotion from candidate practice to house standard.
