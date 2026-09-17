# MAIA-MAVEN-T1A — J6 FOUNDER WITNESS

Class: Class A — memory handling / member sovereignty / consent boundary
Governing authority: Founder ruling 2026-09-17 opening J6 against candidate `7b5942c70e00a065b67f196033f20630ecb368da`; T1-A J4 §§3,5–7; R9/R10/R11; Representation Authority Law
Current gate: J6 — founder experiential witness
Evidence subject: frozen Class A candidate `7b5942c70e00a065b67f196033f20630ecb368da` in PR #1350; founder experience in a disposable witness environment only
Stop boundary: failure or ambiguity stops the witness; no repair, merge, production migration, deploy, capability widening, or legacy-consent reinterpretation

**Status:** ⛔ STOPPED AT W2 · founder witness spent · candidate remains unmerged
**Production:** UNTOUCHED
**PR #1350:** draft · candidate head frozen

---

## 1. Founder ruling opening J6

> **FOUNDER RULING — OPEN J6**
>
> Open `MAIA-MAVEN-T1A` J6 founder witness against the frozen Class A candidate
> `7b5942c70e00a065b67f196033f20630ecb368da` in PR #1350.
>
> The witness is experiential only. It does not authorize repair, merge, migration,
> deployment, production change, or capability widening.
>
> Witness the repaired Keep boundary: generic Keep must not choose the member’s
> referent; exact member-selected material must remain exact; KEEP must not imply
> REOPEN; and return must require its own visible member act.
>
> Failure or ambiguity on any material point stops the witness and leaves the
> candidate unmerged.

---

## 2. Precondition

The exact candidate must remain frozen. All machine gates used to qualify J5 must be
green on that exact SHA. A disposable witness database/session must be used. No real
member row, production schema, production session, or production memory may be written.

If any of those conditions fails, J6 does not begin.

---

## 3. Witness sequence

No repairs during the run. No explanation is allowed to rescue an ambiguous surface.
The founder reports what the experience itself communicates.

### W1 — Generic Keep does not choose

From a live `/maia` conversation containing multiple plausible recent referents, invoke
generic Keep / say `keep this` without selecting exact words.

PASS only if the experience makes it clear that MAIA has **not chosen** what `this`
means. No recent-turn window, summary, Reflection Capsule, gold-line selection, or other
interpretive artifact may appear as though it were the member's referent.

### W2 — Exact member words remain exact

Use the per-message **Keep this moment** gesture on one member-authored message containing
a distinctive phrase. Reopen/review the kept moment through the ordinary member surface.

PASS only if the kept text is recognizably the exact member-authored words. No summary,
rewrite, inferred title, pattern, or neighboring turn may substitute for those words.

### W3 — KEEP does not imply REOPEN

Create/keep one new Field/Keep object through the ordinary member gesture in the witness
environment. Before any return-preference gesture, inspect the member-facing Keep surface.

PASS only if the experience does **not** communicate that keeping also granted MAIA
permission to bring the material back ambiently. New material must read as private/sealed
with respect to ambient return.

### W4 — Return is its own visible member act

From that same kept object, use the visible return-control gesture (for example **Allow
return**). Reinspect the object.

PASS only if the change from private/sealed to return-enabled is visibly caused by this
separate member act, and can be reversed by the corresponding visible gesture.

### W5 — Founder coherence question

After W1–W4, answer only from the lived interaction:

> Did the system make a clean experiential distinction between **holding something** and
> **authorizing it to return**, while leaving the choice of *what* to hold with me?

PASS requires an unqualified yes. Ambivalence or explanation-dependent understanding is
an ambiguity and therefore a STOP under the founder ruling.

---

## 4. Evidence separation

J6 may establish founder experience against this candidate. It does not establish beta-member
experience, production migration safety, PostgreSQL-16 deployment behavior, or post-migration
rollback safety. Those remain separate gates.

Runtime/generated witness artifacts are not promoted into authored repository history merely
because the witness created them. The written record may name observations and identifiers
needed to reproduce the finding without copying member content unnecessarily.

---

## 5. Pass / stop table

```text
W0 exact candidate + disposable environment ........ PENDING
W1 generic Keep does not choose ..................... PENDING
W2 exact member words remain exact .................. PENDING
W3 KEEP does not imply REOPEN ....................... PENDING
W4 return is a separate visible member act .......... PENDING
W5 founder coherence question ....................... PENDING
```

Any FAIL or AMBIGUOUS result stops the run immediately. Candidate remains unmerged. No repair
occurs inside J6.

---

## 6. Non-authorizations

⛔ merge PR #1350
⛔ mark PR ready solely because J6 opened
⛔ apply migration to production
⛔ deploy candidate
⛔ reinterpret legacy `contextual_doorway` rows as consent
⛔ implement START_FRESH or CONTINUE
⛔ add MAIA-authored exact-message adoption
⛔ broaden T1-A beyond Press Keep READ

---

## 7. Witness execution result

### W0 — PASS

The witness ran against frozen candidate `7b5942c70e00a065b67f196033f20630ecb368da` on `localhost:3109` with PostgreSQL 17.7, a disposable database reconstructed from the canonical baseline plus all migrations, synthetic member `j6_witness`, and local-only Ollama inference.

No production database, member, session, migration, or deployment was touched.

Pre-state before W1:

```text
member_memory_atoms  0
episodic_memories    0
reflection_capsules  0
```
### W1 — PASS

Founder entered two plausible synthetic referents and then said `keep this`.

The surface responded:

> Which exact words do you want to keep? I won’t choose for you.

No recent-turn window, Reflection Capsule, summary, gold-line selection, or other interpretive referent opened automatically.

Post-state remained:

```text
member_memory_atoms  0
episodic_memories    0
reflection_capsules  0
```

The repeated local-inference fallback sentence (“I’ve saved your message…”) was traced to fixed degraded-mode copy in `lib/ai/sovereignRouter.ts`; it did not create a Keep, moment, or capsule object.
### W2 — AMBIGUOUS → STOP

Founder selected the exact member-authored message:

```text
Witness phrase two: river bell.
```

The visible surface showed the message as `Kept`.

The persisted text itself remained exact. However, immediately after W2 the disposable database contained **two durable episodic-memory rows** for that same sentence. W1 had established `episodic_memories = 0` immediately beforehand.

The runtime log likewise recorded **two separate successful POSTs** to `/api/sovereign/episodes/mark`, each returning `201`, for the same 31-character verbatim text in the same witness session.

Exactness is preserved, but persistence cardinality is ambiguous. Under the founder ruling, ambiguity on a material point is a STOP. No attempt is made inside J6 to deduplicate, clean up, explain away, or repair the rows.

### W3–W5 — NOT RUN

The witness stopped at W2 as required. No further Keep/REOPEN gestures were performed.
---

## 8. Standing after J6

```text
J5 technical evidence ..................... ✅ PASS
J6 W0 ..................................... ✅ PASS
J6 W1 ..................................... ✅ PASS
J6 W2 ..................................... ⚠️ AMBIGUOUS → STOP
J6 W3–W5 .................................. ⛔ NOT RUN
PR #1350 .................................. DRAFT · UNMERGED
candidate 7b5942c70e00... .................. FROZEN · UNCHANGED
production ................................ UNTOUCHED
merge ..................................... ⛔ NOT AUTHORIZED
deploy .................................... ⛔ NOT AUTHORIZED
```

**J6 DOES NOT PASS.** The candidate remains unmerged.

The next lawful act is a separate founder adjudication of the W2 duplicate-persistence finding. J6 itself confers no repair authority.
