# Soullab Press — Constitutional Authority Matrix (Document #3)

**Date:** 2026-07-22 · **Status:** working instrument · **Authority source:** *applies* existing canon — authors none.
Derives from: [MAIA Canon v1.1](../canon/MAIA_CANON_v1.1.md) · [Sovereignty Invariants](../canon/MAIA_SOVEREIGNTY_INVARIANTS.md) (Recognition Integrity / Inv 16) · [Constitutional Direction of Authority](../canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md) · [Current-State Audit #1](./SOULLAB_PRESS_CURRENT_STATE_AUDIT_2026-07-22.md).

**Why this is written now, while #2 (ontology) is held:** it is independent of fit evidence. It answers *"what may this system lawfully do, regardless of whether the category succeeds?"* — and stays true whether Soullab becomes a Book Studio, a developmental publishing platform, a body-of-work environment, or something unnamed. The audit found the system is **entirely Mechanical/Descriptive today**; the value of this matrix is therefore **prospective** — it is the gate the first generative capability must pass.

---

## The ten rules (from canon)

1. The system may **preserve and present** the creator's material.
2. The system may **reveal provenance-grounded relationships** among the creator's own material.
3. The system may **ask questions over member-selected evidence.**
4. The system may **not manufacture higher-order meaning.**
5. The system may **not tell a creator what the work really means.**
6. The system may **not tell a creator what the work wants to become.**
7. **Recognition ≠ interpretation.**
8. **Juxtaposition ≠ synthesis.**
9. **Consent does not transfer authorship** — a member *asking* the system to name their meaning does not unlock it (parallels Sanctuary's absolute boundary: not even by request).
10. The creator remains the **author of meaning and direction**; and **the system may support the making, but must never author the desire.**

---

## The authority ladder — and where the line is drawn

| Rung | Level | Definition | Held by | Lawful as system authority? |
|---|---|---|---|---|
| 1 | **Mechanical** | Move / store / render the creator's material without reading it for meaning | System | ✅ Yes |
| 2 | **Descriptive** | Report literal facts about the material (counts, lengths, chronology, missing metadata, exact recurrences) | System | ✅ Yes |
| 3 | **Recognition-supporting** | Surface the creator's *own* selections, structure, provenance, and juxtapositions; **ask** questions over member-selected evidence | System *presents*; **creator names** | ✅ Yes — provided it never asserts the answer |
| — | **⎯⎯ THE LINE ⎯⎯** | Above: the system's ceiling. Below: the creator's exclusive authority. | | |
| 4 | **Interpretive** | Assign meaning to the material ("this passage is about grief") | **Creator only** | ❌ Prohibited |
| 5 | **Synthetic** | Manufacture higher-order structure the creator didn't author ("your true theme is X"; auto-generated thematic clusters) | **Creator only** | ❌ Prohibited |
| 6 | **Directive** | Tell the creator what to do or make ("this should become a deck"; "cut this chapter") | **Creator only** | ❌ Prohibited |
| ⊥ | **Tripwire** | Name what the work *means* or what it is *trying to become* | **Creator only, always** | ❌❌ Absolute — the deepest violation |

**The system may ask the meaning question. It may never answer it.** Rung 3 is the whole art of a lawful developmental environment: it makes the creator's own patterns *visible enough to be named by the creator*, and stops.

---

## Decision procedure (apply to any proposed capability)

1. Does the output consist **only of the creator's own material, or literal facts about it**? → lawful (rung 1–2).
2. Does it **present relationships/selections the creator could see and name themselves**, or **ask** the creator a question — without asserting an answer? → lawful (rung 3).
3. Does it **assert what the material means, what it is about, what it should become, or what to do**? → **prohibited (rung 4–6/⊥) — no matter how it is requested, framed, or how helpful it feels.**

If a capability is prohibited, it usually has a **lawful sibling one rung up** (see below). Redesign to the sibling; do not ship the prohibited form behind a disclaimer.

---

## Current state (from audit — all lawful today)

| Surface | file:line | Rung |
|---|---|---|
| `graduateGroup` — concatenate creator's cards in arranger order | `lib/workbench/graduate.ts` | 1 Mechanical |
| `from-idea` / `import-docx` / `render` (PDF/EPUB) | `app/api/book-studio/…` | 1 Mechanical |
| Illustration list (authored anchors/role/tone) | `app/book-studio/illustrations/page.tsx:24` | 2 Descriptive |
| Epigraph detection (tags the author's own blockquote-after-heading) | `app/book-studio/_lib/StudioMarkdown.tsx:54` | 3 Recognition-supporting |

The code already defends the line explicitly: *"No suggested clusters, no synthesis. That silence is structural, not stylistic"* (`workbench/page.tsx:9`); *"No competing voice — no interpretive affordances"* (`book/BookReader.tsx:23`). **Nothing currently crosses.**

---

## Prospective classification (the reason this document exists)

For each tempting future capability: the **prohibited form**, the rung it lands on, and the **lawful sibling** to build instead.

| Tempting capability | Prohibited form → rung | Lawful sibling → rung |
|---|---|---|
| "Show the themes" | System names the theme → 5 Synthetic ❌ | Show frequency/co-occurrence of the creator's **own words**; let the creator name the cluster → 3 ✅ |
| "Cluster my passages by topic" | System groups by inferred meaning → 5 ❌ | Surface the creator's **kept** passages and their provenance; the creator groups → 3 ✅ |
| "What is this chapter about?" (abstractive summary) | System asserts the subject in its own words → 4 Interpretive ❌ | Table of contents from the creator's **own headings**; extractive quote of the creator's sentences → 2 ✅ |
| "Detect the emotional/narrative arc" | System reads meaning across the work → 4/5 ❌ | Show chronology / length / where the creator's own marked moments fall → 2 ✅ |
| "Draft from my material" | Generative prose the creator didn't write, presented as their draft → 5 ❌ (+ first provider call) | Mechanical assembly of the creator's **own** words in the order they arranged → 1 ✅ |
| "This should become a deck / retreat / workbook" | System proposes the artifact → 6 Directive ❌ | Once the creator says *"I want a deck,"* help make it → 1 ✅. **Support the making; never author the desire.** |
| "This character represents…" / "your work is really about…" | → ⊥ Tripwire ❌❌ | Never. Ask, at most: *"you kept these six — is there a relationship you'd name?"* → 3 ✅ |

---

## The one PR this document is really for

The audit's key forward finding: **the first future PR that adds a generative / theme / recognition-beyond-structure layer is simultaneously (a) the first AI provider call on the Press surface and (b) potentially the first interpretive affordance.** That PR must:

- pass the decision procedure above (land at rung ≤3);
- if it calls a model, use **Claude/Anthropic** per provider sovereignty (the audit found *zero* provider calls today — the sovereignty baseline is currently perfect; do not break it with an OpenAI convenience);
- keep the creator as the namer — the system may make patterns visible and **ask**, never assert;
- honor rule 9 — a member requesting interpretation does not unlock rungs 4–⊥.

**This matrix is the gate for that PR.** Until such a PR exists, the Press surface remains lawful by construction, and this document is preservation, not correction.
