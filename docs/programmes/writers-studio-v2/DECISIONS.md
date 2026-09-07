# WRITERS-STUDIO-V2 — Decisions

Settled matters. A session does not re-litigate these; it reads them and
proceeds. New decisions append. Nothing is edited away — a reversal is a new
entry that names the one it reverses.

---

### D-001 · The programme replaces the room, it does not decorate it
**2026-08-27 · founder**

The reference screens are a coherent product architecture, not inspiration for
improving Press. Existing capabilities move into the new architecture. The
framing "keep extending Press until it resembles the mockups" is withdrawn.

Consequence: `SHELL-01` is withdrawn as a standalone start. WS2-00 → WS2-01 →
WS2-02 + WS2-03 is the opening sequence. After WS2-03, every change lands inside
the new architecture.

### D-002 · Claude Code is the JARVIS console; Desktop is not on the critical path
**2026-08-27 · founder**

`WRITERS-STUDIO-V2` is priority NOW. `JARVIS-DESKTOP-REPAIR` is secondary and
must not block it. Claude Code holds the whole programme and issues bounded
units underneath it. Programme state lives in these files, never primarily in a
conversation.

### D-003 · Quality judgment is separated from computed fact
**2026-08-27 · founder**

Showable as measurement: word count, material count, chapter count, goal
progress against a writer-declared target, reading time, version count, finding
count, passage count.

Never shown as measurement: movement health %, cohesion %, "coherence: strong",
"high priority", or any MAIA-produced score, grade, or ranking.

MAIA notices, interprets, questions, and provides evidence. The writer assigns
importance. This is also the better product, not only the more honest one.
Consistent with the standing programme doctrine (no quality scores; provenance
stated at crossings; "reach", not "priority").

### D-004 · Identity correctness precedes everything visual
**2026-08-27 · founder**

WS2-01 is mandatory and may not be painted over. The resolution chain is
explicit and total:

```text
requested work → authenticated owner → work_id → manuscript_id →
section/chapter_id → content
```

No "most recent manuscript" substitution. No silent fallback. No transcript
promoted into manuscript content because another lookup failed. A failure at any
link opens an explicit empty/error state naming what was asked for.

### D-005 · Structure is attentional architecture, including exclusion
**carried forward from the R2 directive · founder**

WS2-07 does not build an organizing feature. Member-defined structure determines
what MAIA attends to *and what remains outside attention*. "Give MAIA
everything" is refused: it produces an omniscient assistant hovering over the
whole manuscript.

> Situated intelligence requires not only access, but exclusion.

### D-006 · The design contract is not frozen until the images are in the repo
**2026-08-27 · Claude Code, pending founder action**

The reference screens exist only in a conversation. A contract whose source
material is disposable is not a contract. WS2-00 does not close until the images
are committed under `reference/`. Written descriptions are planning material and
are insufficient for visual acceptance.

### D-007 · A deploy is verified by built artifacts, not by GIT_COMMIT alone
**2026-08-27 · carried forward from the R2 directive**

`GIT_COMMIT` is stamped from the SHA the deploy was *told* to build. It verifies
the deploy against its own instruction and cannot detect a later, legitimate
deploy of a different commit replacing the image. Verify both ways: the env var
**and** the presence of the built routes the commit introduced.

Open structural problem, named and unfixed: two lanes deploy to one production
and neither can see the other. Candidate repair — warn when the live SHA is not
an ancestor of the deploy target. Not built.

### D-008 · Identity failure may never masquerade as successful retrieval
**2026-08-27 · founder**

The defect WS2-01 exists to close was not "wrong text appeared". It was a
failed identity resolution that presented itself as a successful retrieval —
the room rendered confidently under the right title with the wrong content.

Permanent invariant, applying to every read path in the Studio, forever:

```text
requested nonexistent id → explicit failure → ZERO substitute content rendered
```

Zero is literal. Not a fallback, not the most recent, not an empty-looking
placeholder that is actually another member's or another work's material. A
resolution that cannot complete opens an explicit state naming what was asked
for.

### D-009 · A passing screen closes the defect; it does not prove the cause
**2026-08-27 · founder**

`90f447cd8` and `1feec9b1d` may eliminate the observed failure. A correct
result after deployment proves the defect is closed. It does not retroactively
prove which hypothesis caused it.

So WS2-01 acceptance does not rest on the screen. It rests on the captured
resolution chain (`ACCEPTANCE.md` § WS2-01) plus the nonexistent-id probe. Root
cause stays UNRESOLVED in `STATE.md` until the chain itself is observed —
closing a defect and explaining it are separate acts, and only one of them has
happened.

### D-010 · Identity custody at the emitting control
**2026-08-27 · founder**

The six findings of `WS2-01-READ-PATH-AUDIT.md` are one rule:

> A control that claims to open a particular writing must either emit that
> writing's exact identity or refuse to open. **Absence, loss, and invalidity
> must never collapse into "open something else."**

D-008 constrains the consumer: a named-but-unavailable identity must fail
explicitly and render zero substitute content. D-010 constrains the producer:
a control that cannot name what it claims to open must not open anything.

Together they close both directions of the failure, and neither is sufficient
alone:

```text
producer  may not lose or invent identity
consumer  may not compensate for lost or invalid identity
```

This is where the defect actually lives. The audit established that data
ownership is sound — every manuscript route gates on `member_id` and 404s
without leaking existence. What failed was **client identity custody**: the
moment a control decides what identity to hand forward. F-1 is the live
violation; F-2 and F-3 are why the contract did not prevent it; F-4 is how the
original parameter-drift class recurs; F-5 is the same weakness in the
predecessor Press path.

Design test for any new control that opens a writing: *can this emit a URL it
believes names something, when it does not?* If yes, it is F-3 again.

### D-011 · The legacy Press manuscript route is inside WS2-01
**2026-08-27 · Claude Code, adjudicating under D-010**

F-5 is admitted into WS2-01 rather than transferred.

The test the founder set is whether the legacy Press route is an active ingress
to the same writing identity system. It is, and by the Studio's own hand: the
Canvas emits `SOURCE_HREF` (`canvas/page.tsx:447`) and the Materials drawer
emits it again (`MaterialsDrawer.tsx:485`), both carrying `&m=`. It reads the
same parameter and resolves against the same manuscripts. The Studio is
therefore a producer of that ingress, and D-010 binds producers.

Transferring F-5 would require severing those two links — itself a Studio
change of the same size as the fix. Repairing custody in place is containment,
not extension, and does not violate the standing instruction not to extend the
old Press shell: nothing new is built there, a substitution is removed.

If the founder prefers severance, that is a one-line disposition and F-5
becomes a WS2-02/03 concern. Left as-is is the one option D-010 forbids.

### D-012 · Deploy per room, starting at WS2-03 — not once at WS2-13
**2026-08-27 · founder**

WS2-13 is the *final acceptance* unit, not the first deployment. The
redesigned Studio goes to production as soon as **WS2-02 + WS2-03** pass their
own acceptance, with core capability preserved underneath, and every vertical
room after that deploys as it finishes:

```text
design system → shell → DEPLOY → WRITE → DEPLOY → MATERIALS → DEPLOY
→ STRUCTURE → DEPLOY → REVIEW → DEPLOY → …
```

The failure this corrects is procedural: the old process repeatedly built a
large amount of code before the founder could feel the product, so correction
arrived after the cost was sunk. A room he can enter is worth more than a
branch he is told about.

What does NOT relax. Each deployment still carries exact lineage
(`IMMUTABLE_SHA_DEPLOY.md`), both-ways verification (D-007), and its unit's
acceptance evidence. Deploying more often is not deploying more loosely — it
is the same gate, applied more times.

WS2-13 keeps its meaning: the real-member experiential walk over the whole
environment, which no per-room deployment can substitute for.

## D-013 — Cut at the strongest heading level the document declares

**Settled 2026-08-27 (WS2-01C).**

Segmentation stays mechanical and stays refusing to infer structure. But a
document that uses `#` for its chapters and ALL-CAPS for its subheads has
*already declared* two levels, and reading both as one level is not neutrality —
it is a decision, and it was the wrong one. A 212-page book came back as a
hundred-plus one-page fragments with no chapters in it.

So: **cut at the strongest heading level the document actually uses**, skipping a
level only where it would yield a single section. Subheads are carried verbatim
inside the chapter they belong to. Nothing is invented, nothing is dropped, and
the member still confirms or redraws the cuts before anything is saved.

Two corollaries, both load-bearing:

- **A cap limits doors, never text.** `MAX_SECTIONS` stops us building more
  parts; it must never stop us keeping the member's words. The remainder is
  absorbed into the last section, verbatim and in order.
- **Unnamed is not missing.** A part carried without a heading has no line to
  make a door of. That is not drift, and saying "no longer in your draft" about
  text that is in the draft is a false statement about the member's own book.
  The leading unnamed part *is* the opening region and is not reported at all.

## D-014 — A refusal that leaves no record is not instrumented

**Settled 2026-08-27 (WS2-01B).**

Absence of logs was read as evidence that a request never arrived. It was not:
most of the ingest route's exit paths answered the screen and told the record
nothing, so a member-visible failure left the system with no memory of failing.

Any surface that can refuse a member's work must name the refusal in the record —
status and reason, counts only, never the member's content. Silence in the log is
never evidence about what happened; it is only evidence that we did not look.

## D-015 — The stamp is not the code

**Settled 2026-08-27 (WS2-01 candidate deploy).**

`GIT_COMMIT` is a build-arg consumed in the Dockerfile's **runner** stage. It
re-stamps the container on every deploy *even when every builder layer is a
cache hit* — including `COPY . .` and `npm run build`. So a deploy whose log
reads all-`CACHED` can report the correct SHA while running older code, and
`printenv GIT_COMMIT` will not tell you.

**`GIT_COMMIT` proves the stamp. Artifact inspection proves the code.**

The artifact leg of D-007 is therefore not optional garnish on a verified env
var; on an all-cached build it is the only leg carrying weight. Prove it with a
string that exists **only** in the candidate — new UI copy is ideal — found in
both the client chunk and the server bundle, corroborated by a moved chunk hash
on a route the candidate touched.

This deploy's cache hits turned out benign: a second run of the same deploy.
That was *established* by the grep, not assumed from the stamp. The distinction
between those two is the whole decision.

## D-016 — Visual convergence may never erase capability

**Settled 2026-08-27 (WS2-01).**

The rebuild judges itself against images. That is deliberate — a functional test
cannot tell you the manuscript stopped being the main event — but it introduces
a failure mode the old process did not have: a repair that improves the
screenshot and costs the writer something real.

**Any repair that moves the capture closer to the reference while weakening one
of these is a FAIL, and the divergence stays unrepaired until a repair exists
that does not cost it:**

```text
manuscript continuity     the draft is one document; a narrowed frame is
                          never a narrowed save
Materials ≠ Work          a material is not the work, and the distinction
                          survives every layout
Versions                  kept versions remain reachable and restorable
MAIA companionship        MAIA stays adjacent to the writing, not folded
                          behind a tab or reduced to a strip
authorship boundaries     MAIA notices; the writer adjudicates. No score, no
                          grade, no ranking presented as measurement
```

This is not a tiebreak between design and function. The reference images were
drawn from a product whose whole argument is those five things; a version of the
field that looks like 04 and has lost one of them is further from the designed
product, not closer, however well the pixels agree.

The practical form: when a divergence can only be closed by weakening one of the
five, the divergence is **recorded as accepted** with the reason, and the
implementation keeps the capability. An accepted divergence is a decision, not a
defect left lying around.

## D-017 — OBSERVATION-PROVENANCE-01

Founder, 2026-08-28. Generalizes D-015 beyond deploys, to every instrument this
programme uses to produce evidence.

> A witness is only valid if the artifact proves the provenance of the thing it
> actually observed.

```text
OBSERVATION-PROVENANCE-01

Before accepting any witness artifact:
1. identify the exact subject under observation;
2. prove the runtime/process came from the intended tree/build;
3. prove the visible surface is the intended authenticated/product state;
4. bind the artifact name/metadata to observed provenance, not requested
   provenance;
5. fail closed when any of those cannot be established.
```

### Why it is a rule and not an observation

Four instances inside one week, all of which returned success while answering a
different question than the one being asked:

```text
fresh SHA stamp on cached code            D-015 · the runner stage re-stamps
signed-out surface photographed as field  refused by the harness
error boundary photographed as field      refused by the harness
borrowed server named as the current tree  refused by the harness
```

None of these failed. That is the whole difficulty: a failing instrument is
self-announcing, and each of these would have deposited a plausible artifact
into the record. **Plausible evidence is more dangerous than obvious failure
when provenance is uncertain.**

### Where the capture harness stands against it

Honest scorecard, so the rule is not credited with more enforcement than exists:

```text
1  subject named          YES  field + manuscript are explicit arguments
2  runtime from the tree  YES  --serve starts it; a borrowed server is refused
3  intended surface       YES  crash · signed-out · field classified; two refused
4  name from observed     YES  the script reads HEAD; --sha that disagrees is
                               refused; a dirty tree is named -dirty
5  fail closed            YES  every one of the above exits before capturing
```

Clause 4 was the last to close, and it closed only because writing the rule down
exposed it: `--sha=$(git rev-parse --short HEAD)` is the caller asserting a
tree, not the instrument observing one. The script now reads the tree itself.

### What this does not license

The rule governs instruments, never the field. Nothing here authorizes changing
a Writer's Studio component, route, or substrate to make a witness easier to
obtain. Where the two conflict, D-016 governs and the witness gets harder.

## D-018 — The Writer's Studio object model follows the reference pack

**Founder, 2026-08-28.** Settles audit finding A and the object-model half of C.

The Work is the **primary persistent context**. Manuscripts and Materials relate
to a Work **explicitly**, not by inference through member ownership. Provenance
and member adoption/disposition are **architectural data, not decorative UI
state**.

```text
WORK            the persistent creative center
MANUSCRIPT      authored expression BELONGING TO a Work
MATERIAL        source/input RELATED TO a Work, not authored Work
MAIA EXCHANGE   relational activity belonging to a Work; may reference
                Manuscript, Material, Structure or findings WITHOUT
                becoming manuscript
```

> A Work can contain or relate to many Manuscripts and Materials. **A Manuscript
> is not the Work. Material is not Manuscript merely because it was imported,
> retrieved, summarized, displayed, or discussed.**

**The evidence is the pack, not an abstraction.** `05-materials-studio.png`
states the domain along its bottom edge — *Source: where it came from · Material:
what you've gathered · Work: what you're creating* — and puts a six-value
`RELATIONSHIP TO WORK` control on the material (`Core Material · Supporting ·
Background · Reference · Peripheral · Exclude`). A Material relates to a Work
without becoming it, as a control, in the frozen reference.

**Sequencing, carried from the C ruling:** provenance *presentation* may remain
WS2-06. Provenance *architecture* may not. The reference pack already draws a
`Provenance` tab and an "Imported from" record; the substrate permits one
provenance value. The design is ahead of the substrate, and implementation
brings the substrate up to the design — never the reverse.

## D-019 — MAIA is a relational mode, not a content owner

**Founder, 2026-08-28.** Settles audit finding B, on stronger evidence than the
abstract statement of it.

The Studio chrome's separation is **normative**:

```text
WORK SPACE    Home · Manuscript · Materials · Structure · Notes ·
              Versions · Goals
MAIA          Conversations · Discover · Insights · Suggestions
TOOLS         Find/Replace · Statistics · Timeline · Word Web · Export
```

Read from `04-writing-field-wide.png` on 2026-08-28. **The chrome itself carries
the ontology**: MAIA is not filed as one owner among seven in a list — it is
given its own band. That is why "MAIA region" is retired as an *architectural*
definition. A region is presentation; the architecture is
MAIA-in-relation-to-a-Work.

MAIA may converse, surface evidence, insights and suggestions. But:

> **Member material remains distinguishable from MAIA interpretation, and
> adoption into the Work requires an explicit member act.**

The act is drawn in the pack already — `Belongs to Air · Maybe · Not now` in
`05`, `Discuss / Keep / Unresolved / Dismiss` inline in `08`. These are **not
merely UI states**; they require persisted disposition (see WS2-SUBSTRATE-01).

Repeated retrieval or repeated suggestion never substitutes for the act. No
passage of time converts a proposal into authorship.

## D-020 — One lane

**Founder, 2026-08-28.** Writer's Studio work is consolidated to
`claude/writers-studio-organization-wxpb7q`. The governing documents reached it
by three authorized cherry-picks (`407d2f543`, `4e73182a6`, `eeb0cbba6`), each
recording its source with `-x`; no other lane's ancestry was merged.

There is no second Writer's Studio lane. **A document that exists on another
branch and not on this one is not governing.**

## D-021 — Substrate repair precedes the design system

> ### ⚠ REVISED BY CENSUS — 2026-08-28. Read with D-022.
>
> **The process decision stands. One factual premise was wrong.**
>
> D-021 was sound as process — substrate truth precedes UI assumptions, and
> presentation work must not share a unit with object-model repair. But it named
> Work↔Manuscript as the load-bearing missing edge. **Census established that
> explicit Work↔Manuscript declaration is already implemented** through
> `living_work_expressions`: member authorship, non-inferred placement,
> deliberate many-to-many optionality, and consumer-side ambiguity refusal.
>
> **Therefore Work↔Manuscript is not a substrate repair and does not block
> WS2-03.** Remaining substrate work is limited to provenance,
> adoption/disposition persistence, and companion-turn referential integrity.
>
> Nothing below is deleted — the decision and its correction both stand in the
> record, per this file's own rule.

**Founder, 2026-08-28.** The object-model repairs do not happen inside
WS2-02/03.

WS2-02/03 must be allowed to implement the Studio **against a substrate that
already tells the truth.** Otherwise presentation work and object-model repair
become entangled, and it later becomes impossible to distinguish *"the UI chose
this"* from *"the data model forced this."*

```text
WS2-00              reference/design grammar settled
   ↓
WS2-SUBSTRATE-01    make the object model capable of expressing that grammar
   ↓
WS2-02              design system
WS2-03              shell + persistent work context
```

**Work↔Manuscript is the load-bearing repair.** Without it, "persistent work
context" is **semantically false**: the system can know whose manuscript it is,
but not which Work it belongs to.

The unit creates **exactly enough substrate for the already-settled architecture
to be representable without loss.** It does not invent the full future schema.

## D-022 — Work↔Manuscript already exists as a member declaration

**Founder, 2026-08-28.** The WS2 substrate census corrected **D-021's factual
premise**. D-021 is not rewritten — this record is append-only, and a reversal
is a new entry that names the one it corrects.

Work↔Manuscript is already represented by `living_work_expressions`:

```text
living_work_id
expression_type / expression_id
declared_by
declared_at
```

The relationship is a **member-authored declaration**, not a column inferred
onto `member_manuscripts`.

An expression **may belong to multiple Works by design**. The schema says so in
its own comment, and says why: *"preservation of optionality, not an omission. A
relational constraint here would decide a constitutional question by accident."*

**Unassigned means NO declaration row exists** — not NULL in a membership row.

The current writer (`POST /api/sovereign/living-works/[id]/expressions`)
validates ownership on both sides and performs **no automatic placement**. The
Canvas unites Work and manuscript **only when exactly one Work declares that
manuscript**; zero or multiple declarations remain unresolved (the unite rule,
ruled 2026-08-05).

Therefore:

```text
Work↔Manuscript is NOT a repair and NOT a migration.
WS2-SUBSTRATE-01 shrinks to THREE repairs:
  1  provenance model
  2  adoption / disposition persistence
  3  companion-turn referential integrity

It remains an INVARIANT THIS UNIT MAY NOT BREAK.
```

**And WS2-02 is RELEASED.** The central structural relation the shell depends on
is already real, so the design system and shell no longer wait on this unit.
WS2-02 and WS2-SUBSTRATE-01 proceed as **separate bounded units**.

**WS2-03 is not semantically blocked.** Its gate is subtler than a hold: the room
may begin, because its core declaration mechanism exists. Any *portion* of WS2-03
that depends specifically on richer provenance or durable adoption waits for the
corresponding repair — rather than the whole room waiting.

What D-021 got right was that presentation work and object-model repair must not
share a unit. That rule is unchanged.

### Why this correction matters beyond arithmetic

This is not "one less repair." A piece of the deeper architecture was already
there, and the programme came close to replacing it with something weaker.

A `work_id` column can be backfilled by inference. A declaration row
**structurally cannot be written without an actor and a date**. The existing
design makes Work belonging a *dated member declaration* and the route refuses
automatic placement — which is more aligned with Writer's Studio, and with D-018
and D-019, than the convenient column would have been.

**The census standard that caught it:** the earlier read tested for a column,
found none, and concluded absence. Absence of the shape you expected is not
absence of the thing. Census the relation, not the column.

## D-023 — Artifact before assertion

**Founder, 2026-08-28.** Drawn from two corrections in one session, both of
which made the architecture more coherent once the artifact was allowed to
contradict the expectation.

> **Artifact-before-assertion.** Before declaring an architectural capability
> absent, a migration necessary, or a gate outstanding, **inspect the
> implementation artifact that would actually establish or falsify the claim.**
> Names, task descriptions, programme state, and previous summaries are
> navigation aids, not evidence.

> **Applicability precedes execution.** Before running a gate, establish that
> the gate **can observe the candidate**, and that its required environment is
> legitimate for the evidence being claimed.

### The order of operations

```text
WRONG   name / expectation → inference → recommendation → artifact check
RIGHT   artifact → observation → interpretation → recommendation
```

### The two instances

**Work↔Manuscript (D-022).** A census tested for a `work_id` column, found
none, and concluded the edge was absent. Reading the relational model revealed
`living_work_expressions` — a better, member-authored declaration edge that had
existed since 2026-08-01, with `declared_by`/`declared_at`, no automatic
placement, and consumer-side ambiguity refusal. The programme came within one
authorization of replacing something stronger with a `work_id` column, which is
weaker precisely because a column can be backfilled by inference.

**Co-Lab applicability (R2).** Programme language said a gate was outstanding.
Reading `verify-constitution-colab.ts` established that it is byte-identical at
base and candidate, queries thirteen tables with no `living_work*` dependency,
and cannot observe R2's table or trigger at all. The gate was never applicable —
and had the missing local principals been treated as the problem, seeding them
would have produced a green with no causal relationship to the candidate.

### Why this is a rule and not an observation

Both failures were assertions that survived only until someone looked
underneath. Neither was caused by poor reasoning; both were caused by reasoning
in the wrong order. A capability inferred absent gets scheduled as work. A gate
inferred outstanding gets chased, and its environment gets manufactured to make
it runnable.

**The repository gets the last word over our story about the repository.**

### What this does not license

> **Artifact-before-assertion is not artifact-instead-of-witness.**

Those are different epistemic jobs, and neither substitutes for the other:

```text
artifact read
    establishes what exists
    establishes what code/schema says
    establishes whether a gate can observe the candidate
    establishes whether a proposed test is applicable

execution / witness
    establishes what actually happens
    establishes concurrency/runtime behaviour
    establishes production behaviour
    establishes what a member encounters
```

R2 is the counter-example that fixes the boundary. Seeing `pg_advisory_xact_lock`
in the guard established that a lock was **present**. It did not establish that
the competing transactions **serialized correctly** — the differential 25/25 run
established that, and only after the same probe had been seen failing against
the unlocked guard.

So D-023 **strengthens D-007, D-013 and D-015 rather than superseding them**.
Deployed is not observed; the stamp is not the code; acceptance is re-measured at
the current referent. Reading an artifact never discharges a witness.

### Ratification, and its limit

This decision was committed as `2feb58418` **before authorization**, and was
**subsequently ratified explicitly** by the founder. Recorded so its authorship
is not ambiguous in the record.

It was safe to retain on specific grounds — docs-only; a discipline already
settled in conversation; the added corollary surfaced as authored rather than
laundered in as a founder ruling; no implementation or migration touched; and
ratified at the time.

**This ratification does not establish standing authority to commit future
programme decisions without authorization.** Future decisions retain the normal
authorization discipline. One ratified exception is not a precedent.
