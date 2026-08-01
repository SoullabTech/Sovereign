# Studio Decision Ledger

> **What this is for.** The Constitution and the Experience Spec say **what**. This says
> **why**, once, permanently. Six months from now no one should have to rediscover that
> ambient metrics are absent *by decision* rather than by omission — or re-argue it from
> scratch because the reasoning was only ever in a conversation.
>
> **Rule of use:** a decision enters this ledger when it constrains future work. It is never
> silently changed — a reversal is a **new row** citing the row it supersedes.

---

## 0. Evidence classes — project-wide

Adopted 2026-07-31 (Kelly), generalized from the Comparative Study. **Every claim in a
design discussion, audit, review, or PR carries one.** The failure this prevents: on
2026-07-31 remembered experience, remembered research, rendered prototypes, and deployed
code had all blurred into a single undifferentiated "we know this."

| Tag | Means | May be used to |
| --- | --- | --- |
| **[S] Structural** | Derived directly from implementation — source, schema, config, route graph. | Ground a decision. |
| **[E] Experiential** | Observed through actual use — a walk, a session, a measurement in a live instance. | Ground a decision. |
| **[V] Verification required** | Recalled, inferred, reported by someone else, or read from a document about the thing rather than the thing. | **Never ground a decision.** Convert to [S] or [E] first. |

A claim with no tag is **[V] by default.** Absence of a tag is not neutrality.

---

## 1. The ledger

| # | Decision | Source | Property protected | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| D‑01 | **The Living Work governs the Studio.** A manuscript, course, retreat, workbook, or framework is an *expression*, not the ontology. | Founder ruling 2026‑07‑31 | Identity | [S] | **Ratified** |
| D‑02 | **No universal manuscript entrance.** A creator may begin from material, inquiry, conversation, or fragments. | Founder ruling 2026‑07‑31 (§6 L1) | Proximity | [S] | **Ratified** |
| D‑03 | **Relationships are authored, never computed.** The system holds and returns; it never decides what belongs with what. | Constitution · Comparative Study P4 | Truthfulness | [S] | **Ratified** |
| D‑04 | **The writing surface owns attention.** The creator's prose carries the highest contrast on the page; no chrome may exceed it. | Experience Spec W1–W7 · Comparative Study P5 | Quiet | [E] measured 2026‑07‑31 | **Ratified** |
| D‑05 | **The Studio shell persists across rooms, growing quieter inward — never absent.** A room that feels like a separate application is a design defect. | Audit 2026‑07‑31 · founder ruling same day · Comparative Study P8 | Continuity | [E] | **Ratified as a decision · implementation HELD** — the first attempt persisted the shell in the Room's *ready* state only; it still vanished during loading, unauthorized, and the whole import flow, mobile was unverified, and whether the 45% rail reads quiet or *disabled* is unjudged. A commit claiming the shell persists would have been untrue. |
| D‑06 | **No ambient metrics.** No word-count goals, streaks, scores, or progress meters. | Experience Spec §2.2 *Never* · Comparative Study P9 | Quiet | [S] | **Ratified** |
| D‑07 | **Nothing unbuilt is clickable.** An unavailable destination carries no href and is announced as unavailable. | `studioMap.ts` · Experience Spec A4 | Truthfulness | [S] verified in source | **Ratified** |
| D‑08 | **Failure never asserts absence.** A load error must be visually distinct from "you have nothing." | `app/press/manuscript/page.tsx` W‑2 | Truthfulness | [S] | **Ratified** |
| D‑09 | **The Source is never altered.** Imported work is preserved verbatim; writing happens in a Working Draft alongside it. | Import copy · substrate | Reversibility | [S] | **Ratified** |
| D‑10 | **The environment must never become the project.** Configuration is not creative work. | Comparative Study P9 (Obsidian/Notion failure mode) | Quiet | [E] | **Ratified** |
| D‑11 | **The yield clause.** Consent, refusal, safety, Sanctuary, security, and provenance surfaces may take attention — at least intrusion. | Founder ruling 2026‑07‑31 | Sovereignty | [S] | **Ratified** |
| D‑12 | **Cite a principle by number, or mark it intuition and hold it.** Verify a claimed corpus exists before building on it. | 2026‑07‑31 missing-corpus discovery | Truthfulness | [E] | **Ratified** |
| D‑13 | **The Studio references principles, never applications.** It does not become *like Ulysses*; it protects what makes Ulysses work. | Comparative Study §6 | Identity | [S] | **Ratified** |
| D‑15 | **The work is an identity, not a container that owns its contents' existence.** Deleting a work never destroys expressions; expressions can move; attachment is declared and reversible. | Founder 2026‑07‑31 | Reversibility | [S] | **Ratified** |
| D‑16 | **Identity and recognition are different moments.** A work exists on explicit declaration; the title comes when the creator is ready. Never invented, never demanded early. | Founder 2026‑07‑31 | Sovereignty | [S] | **Ratified** |
| D‑14 | **Global form styling does not reach the writing surface.** `textarea.writing-surface` opts out; form rules stay untouched. | Repair 2026‑07‑31 | Quiet | [E] measured before/after | **Ratified** |

---

## 2. Why the refusals are refusals

The rows most likely to be re-proposed, with the reasoning that must be answered first:

**D‑06 · Ambient metrics.** *Redirects attention from continuity to productivity.* A word
count makes the session the unit; the Living Work makes the relationship the unit. Any
proposal to add one must first explain why a creator should be measured by a day's output
in an environment built for work that spans years.

**D‑03 · Authored relationships.** The tempting version — *"we noticed this relates to
that"* — is the exact move the Living Work ruling excludes. It is not a capability gap. It
is refused because meaning-making is the creator's, and a system that offers it convincingly
displaces the person doing it.

**D‑10 · The environment is not the project.** Obsidian and Notion are both excellent and
both lose their users to configuration. The Studio currently satisfies this **by having
nothing to configure** — an accident of youth. Every stage from here threatens it, so it is
recorded now, while it is still free.

**D‑05 · Rooms are not applications.** Once a room becomes an application, the House stops
existing — it degrades into a launcher. This is why the shell must thin rather than vanish.

---

## 3. Exposed defects

**These are successes, not regressions.** A slice that improves one protected property will
often make an unrelated defect impossible to ignore. The slice did not create the defect —
it removed whatever was concealing it. **The revealed defect determines the next slice.**

Recording them here does two things: it stops the next session from logging an exposure as
a regression, and it keeps the build order honest — the house tells us what to do next
instead of us imagining the finished house all at once.

| Slice | Property improved | Defect exposed | Becomes |
| --- | --- | --- | --- |
| **D‑05** shell persists *(built, **HELD — not committed**)* | Continuity | **Artifact-first identity becomes continuously visible.** `CURRENT BOOK` sits beside the prose for the whole session. The previous implementation hid this by removing the shell. | Stage 2 |
| **D‑14** writing-surface opt-out | Quiet | Global form styling reaches surfaces it was never designed for. The Studio was one instance; the sweep across other member-facing surfaces has not been done. | [V] — unswept |
| **Phase B‑1** Working Draft as a page | Quiet | With the writing surface calm, the absence of any way to move *within* a 216-section work became obvious. There is no view of the whole. | Stage 6 (P6) |
| **Shell persistence** | House continuity | Room vocabulary is inconsistent: the rail says *Working Draft · Source*, the tab row says *Manuscript · Working Draft*, and both name software. | Stage 2 consequence |

---

## 4. Quiet is an attentional property, not a visual treatment

Adopted 2026‑07‑31 (Kelly). **A screenshot cannot settle whether a surface is quiet.**

The test, after ten minutes of real writing:

> **Did I stop noticing it?**

- *Yes* → **quiet.**
- *"It looked disabled."* / *"It looked faded."* → **dimmed.**

Dimmed is what you do to a control that is unavailable. Quiet is what a room does when you
are working in it. A writer's report after ten minutes outranks any measurement, including
mine. **Open at the time of writing:** the Layer‑3 rail at 45% has not yet been sat in.

---

## 5. Candidate for constitutional promotion — awaiting the founder's act

**Not ratified. Recorded, not operative outside the Studio.**

> **A room that feels like a separate application is a design defect.** Moving deeper into
> the House increases intimacy without breaking continuity: the environment grows quieter
> inward, never absent.

Operative **within the Studio** today via Experience Spec §3.8 (ratified 2026‑07‑31).
Promotion to `MAIA_SOVEREIGNTY_INVARIANTS.md` — where it would govern the House, MAIA,
Journal, Session Room, and every future surface — is the founder's explicit act and has not
been performed. Recorded here so the candidacy is not lost.
