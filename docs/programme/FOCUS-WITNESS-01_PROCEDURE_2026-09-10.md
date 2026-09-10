# FOCUS-WITNESS-01 · the procedure

```text
SUBJECT      cbbb53dc694d298e97873d95c139cd3ec9253c2e   FROZEN
STATUS       PROCEDURE AUTHORED · ⛔ NOT RUN · witness UNSPENT
AUTHORED ON  claude/focus-witness-record — ⛔ never on the candidate branch,
             so authoring the ceremony cannot move the subject
```

**Purpose.** Demonstrate on the frozen candidate that a real Focus disclosure
encounter can begin, establish lawful authority, read the governed Work through
the real assembler and custody path, produce truthful crossing evidence, and
return — **without bypassing the ratified boundary**.

⛔ Not production. ⛔ Not a synthetic direct call to `assembleFocus`. A real
application-path walk.

---

## What the existing evidence does and does not mean

```text
F1a–F1l · F1m/F1n · fixture seeder · assembler gate ·
broken-custody discriminator · typecheck · no-supabase        ALL PASS
```

> ⭐ The candidate is **QUALIFIED TO UNDERGO** FOCUS-WITNESS-01.
> ⛔ That is **not** FOCUS-WITNESS-01 passing.

That distinction stays in the record permanently. A/B/D/E prove the machinery and
the invariants; C creates a lawful subject for an encounter; **the witness proves
the assembled system performs the ratified crossing as an experience.**

---

## ⚠️⚠️ PRECONDITION FINDING — W4 MAY NOT BE EXECUTABLE ON THIS CANDIDATE

Surveyed at `cbbb53dc6`: `/api/writers-studio/focus` exists and is founder-gated
(`WRITERS_STUDIO_FOCUS_ENABLED`, 404 when off). **No client calls it.** Every
non-test reference is server-side self-description —
`writersStudioCognition.ts` naming it as `originRoute`, `canonicalWriterTurn.ts`
as `ingressId`. There is **no member-reachable Focus gesture on the candidate.**

Consequences, stated before the walk rather than discovered inside it:

```text
W1  EXECUTABLE via the authenticated HTTP route — the real application seam,
    the real identity resolution, the real boundary. This is the 7R path.

W4  ⛔ AS WRITTEN, PROBABLY NOT EXECUTABLE. "Did it feel like an operation on
    the Work you were already inhabiting, or like being moved into another
    destination?" presupposes an inhabited surface. There is none: a human can
    drive the route and read what came back, but cannot inhabit a Focus
    experience that has no rendering.
```

⭐⭐ **RULED — founder, 2026-09-10: DISPOSITION (i).** Run W0–W3 now. ⛔ Do not
hold Focus hostage to a surface that does not exist on the frozen candidate.

```text
W0–W3   EXECUTABLE ON THIS SUBJECT · run now
W4      NOT ANSWERABLE ON THIS SUBJECT
        no member-reachable Focus surface exists at cbbb53dc6
P10     DEFERRED WITH W4 · transferred to D9-PHENOMENOLOGY-WITNESS-01,
        when an inhabited WRITE surface actually exists
```

⛔ **The result therefore cannot be called an unqualified FULL PASS.** On W0–W3
passing, the wording is exactly:

```text
FOCUS-WITNESS-01
TECHNICAL CROSSING PASS
PHENOMENOLOGY DEFERRED — SUBJECT HAS NO SURFACE
```

⭐ **W4 is DEFERRED, NOT WAIVED.** The claim *"the writer remains with the Work"*
still has to lose or survive later, when there is an actual writer experience to
witness. The original W4/P10 language below is preserved verbatim for that run.

**Why not (ii):** it creates a loop — the Focus witness waits for an inhabited
surface, Phase 4 builds the surface, and Phase 4 is paused until the Focus
witness closes. More fundamentally it would couple two different acceptance
questions: *is the crossing technically and evidentially truthful?* and *what does
that crossing feel like embodied in WRITE?* Keep them separate.

⛔ **This is not repaired here, and building a surface to make the witness
answerable would mutate the subject.** The two dispositions, as considered:

```text
(i)  RUN W0–W3 NOW, and record W4 as NOT ANSWERABLE ON THIS CANDIDATE
     → the witness returns a bounded, truthful result about the crossing
     → the inhabited question waits for a surface, and for
       D9-PHENOMENOLOGY-WITNESS-01, which is where it properly belongs

(ii) HOLD THE WHOLE WITNESS until a Focus surface exists
     → nothing is spent, and the candidate stays qualified but unwitnessed
```

⭐ A third option — asking the human the W4 question about an HTTP response —
is refused here. It would produce an answer, and the answer would be about
reading JSON, not about inhabiting the Work.

---

## Environment · two databases, deliberately

`gate:focus-assembler` bootstraps its own schema and **refuses a non-empty
database**; the walk requires a seeded one. Forcing both onto one database makes
one of them lie.

```text
DB-A   gate:focus-assembler
       bootstrap empty → execute → destroy

DB-B   FOCUS-WITNESS-01
       repository migrations → seed-focus-witness-work → application walk
       → inspect evidence → destroy
```

⛔ Neither database is production. ⛔ The seeder refuses any database already
holding member Works, structurally — not by hostname heuristic.

**Credential fixture — AUTHORIZED, and bounded.** `resolveCanonicalIdentity`
returns `verified` only when `getMemberIdFromRequest` resolves an
`auth_sessions`-backed credential:

```sql
SELECT member_id FROM auth_sessions
 WHERE session_token = $1 AND revoked = FALSE AND expires_at > NOW()
```

⭐ **The fixture creates that real row and nothing else.** The walk presents the
token as `x-session-token`, which is a real transport the resolver already
honours.

```text
⛔ MAY NOT   bypass, mock or replace resolveCanonicalIdentity
⛔ MAY NOT   introduce a witness authentication bypass, a hard-coded "verified"
             return, or a route-only test branch
⛔ MAY NOT   use a production credential, a real person's credential, or any
             committed secret
```

The token is generated per run, lives only in disposable DB-B, and dies with it.
⛔ **If making the route authenticate had required changing production runtime
behaviour, the instruction was to STOP and report the dependency rather than
build an auth exception. It did not: the resolver's real predicate is
satisfiable with substrate alone.**

---

## The walk

### W0 · establish custody

```text
candidate SHA is exactly cbbb53dc694d298e97873d95c139cd3ec9253c2e
working tree clean
fresh disposable DB-B
fixture seeded successfully
the member owns the seeded Work
the Work is section-addressable
Focus enabled ONLY in the witness environment
no pre-existing Focus crossing for this act
```

⛔ If `witness_focus_walk|f|begin|x` recurs → **STOP · FAIL/BLOCKED.**
⛔ **No repair during the witness.**

### W1 · enter Focus through the real application seam

⭐ **The authenticated HTTP route IS the real application seam for this
candidate. Do not downgrade it because there is no button — and do not upgrade it
into a UI claim.**

```text
W1 PROVES        authenticated application request → real boundary
                 → real capability → real assembler → real custody
                 → real evidence

W1 DOES NOT      how a writer encounters Focus
PROVE            whether Focus feels native to WRITE
                 whether navigation / orientation is preserved
```

The second group belongs to `D9-PHENOMENOLOGY-WITNESS-01`.

Exercise the actual candidate entry path.

```text
⛔ NOT   calling the assembler directly
⛔ NOT   minting authority by hand
⛔ NOT   inserting a receipt by hand
```

**The application must cause the crossing.** Observe that member identity → Work
identity → requested locus → consent/boundary → capability are established
through the real path.

### W2 · prove the real Work was read lawfully

The returned Focus context came from the governed working-draft substrate through
the real assembler.

⭐ The adversarial cases — foreign member, non-addressable Work,
`manuscript_sections` never the payload — are **already discharged by the gate**
and need not be re-run interactively. What the walk must show is that the
**successful** path traverses that same governed implementation.

### W3 · inspect crossing evidence

```text
receipt exists
boundary describes the crossing that actually occurred
scope / locus truth is correct
state is correct
request identity is correct
no invented evidence · no deleted evidence
```

⛔⛔ **DO NOT DELETE THE RECEIPT AS TEARDOWN. The disposable database is the
teardown.** Two instruments have already tried to tidy away governed evidence.

### W4 · human experience

⚠️ See the precondition finding. If run at all, the predeclared questions are:

> *Did Focus feel like an operation on the Work you were already inhabiting, or
> like being moved into another destination/system?*
> *Was it clear what MAIA was being allowed to encounter, and what happened as a
> result?*

⭐ This is **not** `D9-PHENOMENOLOGY-WITNESS-01`, which concerns the integrated
WRITE/MAIA experience. FOCUS-WITNESS-01's narrower experiential question is:
**does the Focus crossing correspond to what the system says happened?**

---

## PASS / FAIL

```text
P1   the exact frozen SHA was witnessed
P2   the real application path was used
P3   a real disclosure boundary was established
P4   the real capability-bound assembler executed
P5   the governed custody source was used
P6   the expected Work context was returned
P7   crossing evidence was truthfully recorded
P8   no prohibited evidence cleanup occurred
P9   the fixture blocker was absent
P10  the human witness can describe the encounter without contradicting the
     system's recorded crossing
```

⛔ Failure **or ambiguity** on any material point → **STOP · record the finding ·
the candidate remains unmerged.** ⛔ No repairs during the run.

---

## ⛔ Evidence rule for the witness record

```text
runtime-generated refusal / audit output MUST NOT be staged or committed as
part of the witness record merely because running the witness created it.
```

The record may **refer** to runtime evidence. It does not thereby acquire
authority to promote that evidence into authored repository history. (See
`AUDIT-LOG-SPILL-FINDING_2026-09-10.md` — the deletion direction has a guard; the
promotion direction has none.)

---

## Standing

```text
CANDIDATE                cbbb53dc694d298e97873d95c139cd3ec9253c2e · FROZEN
TECHNICAL QUALIFICATION  PASS
FOCUS-WITNESS-01         PROCEDURE AUTHORED · ⛔ NOT RUN · UNSPENT

OWED BEFORE RUNNING      a ruling on the W4 precondition finding — (i) or (ii)
                         a credential fixture for DB-B

MERGE                    NOT AUTHORIZED
DEPLOY                   NOT AUTHORIZED
PHASE 4 UI               PAUSED · 4be90954e preserved
PRODUCTION               5f65038d2 · Focus OFF · untouched
```
