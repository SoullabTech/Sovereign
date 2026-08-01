# Studio Decision Ledger

> **What this is for.** The Constitution and the Experience Spec say **what**. This says
> **why**, once, permanently. Six months from now no one should have to rediscover that
> ambient metrics are absent *by decision* rather than by omission — or re-argue it from
> scratch because the reasoning was only ever in a conversation.
>
> **Rule of use:** a decision enters this ledger when it constrains future work. It is never
> silently changed — a reversal is a **new row** citing the row it supersedes.
>
> **Admission criterion (2026-08-01, Kelly).** A heuristic earns a row only if it can
> **name the mistake it would have prevented.** If a proposed principle cannot point to a
> concrete failure it would have caught, it is still an intuition, not a governing rule —
> leave it out. *This ledger is not a catalog of principles.* Its value is that every row
> is load-bearing; a row that constrains nothing dilutes the rows that do.
>
> **Scope, recorded not ruled:** several rows here — evidence before reasoning ·
> representation bound to referent · live instance before reasoning · one concept, one
> question · check the axes before escalating · *refusing #1 too hard produces #2* — are not
> Studio-specific. They read as **AIN design heuristics**. Promotion out of this ledger into
> platform canon is the founder's explicit act and **has not been performed**; recorded here
> so the candidacy is not lost.

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

## 0.1 The five evidence stages

Recorded 2026‑08‑01 (Kelly). **This is not a development process. It is an evidence
discipline** — a way of distinguishing what we know from what we think we know.

> **Govern → Implement → Verify → Experience → Decide**
>
> Each stage produces evidence that the next stage cannot substitute for.
>
> - **Govern** establishes what is permitted.
> - **Implement** establishes what exists.
> - **Verify** establishes that what exists is technically true.
> - **Experience** establishes what the implementation is actually like to inhabit.
> - **Decide** determines what changes because of that evidence.
>
> **No later stage may be replaced by reasoning from an earlier one.**

That last line is the whole rule. Stated as the four failures it forbids:

- Governance **cannot predict** experience.
- Implementation **cannot certify** experience.
- Verification **cannot substitute** for experience.
- Experience **should not immediately prescribe** implementation.

### The role separation

> **The observer reports evidence. The builder proposes changes. They may be the same
> person, but they must not perform both acts at once.**

Not because one person cannot do both — because deliberately separating them creates a
chance for error to be caught before it becomes architecture.

### Three kinds of mistake the discipline catches

Recorded 2026‑08‑01 (Kelly). Naming them separately matters, because the reflex that
prevents one causes another:

| # | Mistake | What it looks like |
| --- | --- | --- |
| 1 | **False reconciliation** | Merging two things that should stay distinct — quietly resolving two founder statements into one |
| 2 | **False collision** | Treating two compatible truths as if they compete — escalating a distinction to the founder as a conflict |
| 3 | **False abstraction** | Promoting an idea before there is evidence for it — a principle derived from one instance |

**Refusing #1 too hard produces #2.** On 2026‑08‑01 the Living Work / Field distinction was
reported as a governance collision when the two answer different questions (spec §5.1
axes). The correction is not to reconcile more freely; it is to **check the axes before
escalating**.

### Why this is recorded as working, not as aspiration

Every one of these was caught by the discipline on 2026‑07‑31 → 08‑01, and each would
otherwise have hardened into the repository:

| Caught | Would have become |
| --- | --- |
| A wrong diagnosis of the writing measure (it was never broken — the type had been forced from 19px to 16px) | Two invented defects instead of one real cause |
| Implementation scope conflated with observation scope (*"four states became two"*) | A committed D‑05 with the ready state never sat in |
| A commit name claiming more than the code did | *"The Studio shell persists"* when it persisted in one state |
| A governance collision — two founder rulings on the same object, same day, opposite scope | A schema merged against an instrument stating it authorized none |
| 281 documents stranded on a stale branch, and a second Studio governance lane | One lane's record mistaken for the Studio's record |
| A WCAG regression introduced by the quiet rail (2.25:1) | A founder judging *quiet vs dimmed* on an illegible surface |

**These are not failures logged after the fact. They are the process refusing to let an
unverified assumption become permanent.**

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
| D‑24 | **Every architectural concept answers one question and only one question.** Living Work → *what endures?* · Field → *where is attention?* · Practice Environment → *how am I relating to the work?* · Capability → *what can I do?* · MAIA → *who is accompanying me?* The moment a concept answers two, it begins absorbing responsibilities that belong elsewhere. | Founder 2026‑08‑01 | Identity | [E] — would have prevented *Living Work* becoming both the enduring relationship and the experiential center | **Ratified** |
| D‑20 | **Five questions before any code.** Which protected property moves · which creator failure disappears · which constitutional refusal is preserved · what remains deliberately unbuilt · what evidence will prove success. Unclear answers ⇒ the slice is not ready. | Founder 2026‑08‑01 | Truthfulness | [S] | **Ratified** |
| D‑21 | **Build vertical loops, not rooms.** A complete creative loop outranks a finished room. **A room that does not close a loop is storage.** Ask *"what part of a creator's practice is still unsupported?"*, never *"what feature is next?"* | Founder 2026‑08‑01 | Proximity | [S] | **Ratified** |
| D‑22 | **Internal language is not member language.** *Shelf · Hearth · Field · Integrate · Practice* are architecture words the member never sees. The interface may speak more plainly than the architecture thinks. | Founder 2026‑08‑01 | Quiet | [S] | **Ratified** |
| D‑23 | **The refusals are part of the product.** Never: infer relationships · infer titles · infer Living Works · insert material automatically · edit behind the creator · summarize without invitation · organize by surprise. | Founder 2026‑08‑01 (extends D‑03) | Sovereignty | [S] | **Ratified** |
| D‑18 | **No later evidence stage may be replaced by reasoning from an earlier one.** Govern → Implement → Verify → Experience → Decide; each answers a different question (§0.1). | Founder 2026‑08‑01 | Truthfulness | [E] — six catches recorded in §0.1 | **Ratified** |
| D‑19 | **The observer reports evidence; the builder proposes changes.** The same person may hold both roles, but never in the same act. | Founder 2026‑08‑01 | Truthfulness | [E] | **Ratified** |
| D‑17 | **A boundary the member has not crossed does not get the interior.** An unauthorized or unauthenticated surface must preserve truthfulness, orientation, and a clear way forward — but **must not** render the quiet interior rail around a threshold not yet crossed. Loading and import *are* inside the authorized journey and preserve the house, unless doing so creates a measured accessibility or comprehension failure. | Founder 2026‑07‑31 | Truthfulness | [S] | **Ratified** |
| D‑15 | **The work is an identity, not a container that owns its contents' existence.** Deleting a work never destroys expressions; expressions can move; attachment is declared and reversible. | Founder 2026‑07‑31 | Reversibility | [S] | **Ratified** |
| D‑16 | **Identity and recognition are different moments.** A work exists on explicit declaration; the title comes when the creator is ready. Never invented, never demanded early. | Founder 2026‑07‑31 | Sovereignty | [S] | **Ratified** |
| D‑14 | **Global form styling is not a safe default for Press surfaces. Every Press text-entry surface must explicitly declare whether it is a form field or a writing surface.** `textarea.writing-surface` for a page (colour, background, typography); `.press-field` for a field that holds the member's words (colour only). The global form rules stay untouched. | Repairs 2026‑07‑31 and 2026‑08‑01 | Quiet | [E] measured before/after, **twice** | **Ratified** — strengthened 2026‑08‑01 |

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

**D‑17 · Why continuity stops at the boundary.** D‑05 makes continuity a virtue, which makes
it tempting to extend the house over a sign-in wall so the seam never shows. That would be
continuity purchased with a false impression: the rail would depict an interior the member
is not standing in. **Truthfulness outranks continuity at a threshold**, and the yield
clause (D‑11) already says a surface holding a boundary may take attention. Continuity is
owed to states *inside* the authorized journey — loading and import — not to the door.

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
| **D‑14** writing-surface opt-out | Quiet | Global form styling reaches surfaces it was never designed for. **Converted from `[V] unswept` to `[E]` on 2026‑08‑01**: the import title and paste box measured `rgb(17,24,39)` too — a member pasting a whole manuscript would watch it vanish into near-black on near-black. Two instances is a pattern, not two bugs, so D‑14 was rewritten as a **declaration requirement** rather than a list of repairs. The sweep across non-Press member-facing surfaces is still undone. | D‑14 strengthened · sweep still `[V]` |
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
