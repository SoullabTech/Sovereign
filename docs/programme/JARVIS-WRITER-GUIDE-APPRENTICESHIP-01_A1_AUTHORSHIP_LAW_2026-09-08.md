# A1 — AUTHORSHIP LAW & THE GENERATIVE BOUNDARY

**Lane**: `JARVIS-WRITER-GUIDE-APPRENTICESHIP-01`
**Founder act, 2026-09-08**: **WG-LAW-1 RATIFIED · A1 AUTHORIZED**
**Standing**: constitution recorded · nothing built · no generative capability authorized.

---

## 1. WG-LAW-1 — RATIFIED *(recorded as given)*

> The original aspiration remains: **after sustained use of Writer Guide, the human should
> become more capable of writing rather than more dependent upon MAIA to produce language for
> them.** But **the member is not the instrument of proof.**
>
> ⛔ Do not create writer scores · skill ladders · longitudinal ability ratings ·
> creative-progress metrics · comparative assessments · inferred levels of writing competence
> — **to prove this law. The falsifier belongs to the system design.**
>
> **WG-LAW-1.** Writer Guide must be designed to increase human creative agency and capacity
> rather than increase dependence upon MAIA-generated language. **A compliant Writer Guide
> must permit a member to develop and complete a Work through a path in which MAIA supplies
> none of the Work's prose.**
>
> MAIA may notice · question · reflect · teach · explain craft · identify possibilities · help
> the writer compare choices · support research · help the writer perceive what their own
> language is doing — **where the relevant commissioned stance permits those acts.**
>
> **Generation of language for the Work must never become the invisible or necessary
> default.** When generation is eventually permitted it must be: explicitly commissioned ·
> bounded · legible as MAIA-generated · distinguishable from observation or teaching · under
> member control · **incapable of silently becoming the member's voice.**
>
> The governing question is not *"Is this member now a better writer?"* It is: **"Does this
> system repeatedly return authorship, judgment, imagination, and choice to the writer?"**

### The seven falsifiers, as named obligations

| # | The design FAILS WG-LAW-1 if… |
|---|---|
| **WG-F1** | A member must accept MAIA-authored prose in order to progress. |
| **WG-F2** | Generation is the default response to creative difficulty. |
| **WG-F3** | MAIA routinely resolves creative decisions that could have been returned to the writer. |
| **WG-F4** | Craft teaching is replaced by production of examples intended to become the Work. |
| **WG-F5** | Repeated use structurally encourages dependence upon generated continuation. |
| **WG-F6** | The system cannot support a finished Work containing zero MAIA-authored language. |
| **WG-F7** | MAIA-generated language can enter the Work without an explicit member act. |

**Every one is answered against system design. None is answered by measuring a member.**

---

## 2. What A1 found

### ⭐ WG-A1-01 — "Zero MAIA language" is true today by ABSENCE, and unprovable.

**WG-F6** requires the system to *support* a finished Work containing no MAIA-authored
language. Today every Work satisfies this trivially: the Studio has no generative path, so
all prose is member-authored **by construction**.

But the property is currently **unprovable from the Work**. Nothing in a manuscript records
who authored a passage, because until now nothing else could have. The moment generation
exists, WG-F6 stops being free and becomes a claim requiring evidence — and a system that
cannot distinguish the two kinds of prose cannot honour **WG-F7** either, since "entered
without a member act" is undetectable if entry is unmarked.

> **Ordering rule, and A1's principal output: prose-level authorship provenance is a
> PRECONDITION of generation, not a companion to it.** It must exist and be proven against
> an all-member-authored corpus — where the correct answer is known — **before** the first
> generative path ships. Built afterward, it can only ever attest to prose whose origin was
> already ambiguous.

### 🔴 WG-A1-02 — An existing ratified invariant breaks SILENTLY the day generation ships.

`lastWrittenAt` (`app/api/sovereign/manuscripts/__tests__/writingProvenance.test.ts`) means
*a member act, not a row mutation*. Three successive definitions were disproved by
production rows before the current one. Its exactness rests on an explicit enumeration:

> *"The discriminator is `updated_at > created_at`, which is exact rather than heuristic
> **ONLY because every writer to that column was enumerated on this SHA**: both INSERT paths
> omit updated_at, **both UPDATE paths are member acts** (save/autosave, restore-a-revision),
> and no migration backfills it."*

**A generative writer is a new writer to that column.** The day MAIA can write prose into a
working draft, "both UPDATE paths are member acts" becomes false, and `lastWrittenAt` reports
*the member wrote* when MAIA did — Studio Home offering to "continue writing" work the member
never wrote, the exact defect those tests were built to kill, returning by a door they could
not have anticipated.

**This is not a reason to refuse generation. It is a named obligation on whoever introduces
it** → **WG-F8** below. The enumeration must be re-established, not inherited.

### ✅ WG-A1-03 — WG-F7 already has its mechanism: propose → adopt.

`structure/proposals → /adopt` is the built grammar: **MAIA proposes; only the member
adopts.** No client POST can create a reading, and the surface may not restate MAIA's account
because *"a rewrite here would be the surface speaking in her voice."* Any future generative
path should reuse this shape rather than invent a second one. ⛔ Autocomplete, inline
continuation, and any "accept" that is a keystroke rather than an act are outside it.

### ✅ WG-A1-04 — MAIA-act attribution already has its shape: `ReaderProvenance`.

`lib/manuscript/structure/readerProvenance.ts` attributes a *reading*: the resolved model
string actually sent (never the default's name), a SHA-256 over the system prompt and tool
contract together, and an ISO-8601 stamp written by the store. Deliberately separable from
the thing that reads — *"the store must be able to describe who read a Work without being
able to reach the thing that reads."*

**That is the shape prose attribution should take**, extended from readings to language.

---

## 3. Constituted — the authorship boundary

**WG-B1 — THE UNAIDED PATH IS A REQUIREMENT, NOT A FALLBACK.** A member must be able to
develop and finish a Work with MAIA supplying no prose, and that path must be first-class:
not degraded, not slower by design, not hidden behind a setting, not presented as the
lesser option.

**WG-B2 — STANCES ARE COMMISSIONED.** MAIA's permitted acts are those the *commissioned
stance* allows — following the ratified lens grammar (exactly one lens per reading, closed
vocabulary, meanings rendered verbatim). No stance carries capability it was not commissioned
for, and no act is available outside a stance.

**WG-B3 — NON-GENERATIVE ACTS ARE THE WHOLE OF WRITER GUIDE TODAY.** Notice · question ·
reflect · teach · explain craft · identify possibilities · compare choices · research · help
the writer perceive what their own language is doing. **No generative capability is
authorized by this act.**

**WG-B4 — THE DEVELOPMENTAL READER IS CONSUMED AS RATIFIED.** WS2-07 v1 is observation-only:
interpretation · questions · possibilities · uncertainty · severity · priority · confidence ·
score · rank · any prose of the Work are **absent by construction**. ⛔ This lane may not
widen it. Greater developmental latitude returns as a **WS2-07 v2 founder act** in its own
governance lane. *"What wants development"* is not available to Writer Guide today.

**WG-B5 — EXTEND THE LENS; DO NOT DUPLICATE IT.** `structure · development · continuity ·
arc · voice · coherence · reader` is the existing stance/lens architecture. Poetry, fiction,
memoir and documentary are investigated through lens · commissioning grammar · form-sensitive
craft knowledge · bounded stance behaviour. **Any new abstraction must first demonstrate why
the lens architecture cannot carry the distinction.**

**WG-B6 — TEACHING IS NOT DEMONSTRATION-INTO-THE-WORK.** Craft may be explained and its
effects named. An example produced to *become* the Work is generation (**WG-F4**), whatever
it is called. The line: *name the effect, offer the experiment, return the choice.*

**WG-B7 — THE GENERATIVE BOUNDARY, if and when generation is ever authorized.** All six,
jointly and structurally — none by policy or prompt:
explicitly commissioned · bounded · legible as MAIA-generated · distinguishable from
observation and teaching · under member control · **incapable of silently becoming the
member's voice.**

**WG-B8 — PROVENANCE PRECEDES GENERATION.** Per WG-A1-01: prose-level authorship provenance
ships, and is proven against an all-member-authored corpus, **before** any generative path.

### Two obligations added by A1

**WG-F8 — THE WRITER ENUMERATION IS RE-ESTABLISHED, NOT INHERITED.** Any change introducing
a non-member writer to manuscript prose must re-prove `lastWrittenAt`'s discriminator and
every invariant resting on *"both UPDATE paths are member acts."* Inheriting that sentence
unexamined is the failure (WG-A1-02).

**WG-F9 — GENERATION IS NEVER A SIDE EFFECT.** No generative act occurs as a consequence of
reading, commissioning, opening, saving, or any other gesture. It is only ever the thing the
member asked for.

---

## 4a. Amended by founder ruling, 2026-09-08

`docs/programme/WRITER_GUIDE_FOUNDER_RULING_PROVENANCE_RESTRAINT_ROOM_2026-09-08.md` **governs**.

- **WG-B8 is RULED, not recommended**, and specified: provenance must distinguish
  member-authored · MAIA-authored · member revision of MAIA-authored (where materially
  relevant) · MAIA transformation of member-authored. **Never inferred from style or model
  behaviour — it arises from the act.**
- **Restraint is structural, never performed** (clause 3). No stance may narrate holding back.
  The boundary lives in permissions, commissioning, route capability, stance contracts,
  provenance and module structure.
- **WG-Q1 opens under A1** — the revision threshold. Provenance must neither launder silently
  through incremental edits nor stain permanently a passage the member has wholly rewritten.
  Answerable only from edit acts, not text similarity.
- **A1 ∥ A3.** Coupled in substance: restraint must be *experienced as room*, and the room is
  A3's to build (ruling §8 C-1).

## 4b. A1's FIRST EVIDENTIARY OBLIGATION *(founder, 2026-09-08)*

> **The current corpus is all member-authored by construction. It is the only corpus against
> which prose provenance can be proven with the correct answer known in advance. That
> evidentiary window closes permanently the first time MAIA writes into a Work.**

### WG-W1 — THE PRE-GENERATION BASELINE

> **Before authorizing any MAIA-generated Work prose, prove that prose-level provenance
> correctly identifies the existing corpus as entirely member-authored. Preserve that witness
> permanently as the pre-generation baseline.**

A clean-room moment that cannot be recreated. Every word in every existing Work is
member-authored **by construction**, so the instrument can be falsified against a known
answer — the only time that will ever be true.

⛔ **A1 therefore does not begin by constraining an unruly generator. It begins by making
authorship visible before mixed authorship exists at all.** The Studio already knows how not
to take the pen (§2, WG-A1-03/04); what it does not yet know is how to say who held it.

### WG-W2 — THE POST-AUTHORIZATION CONTROLLED CASES

Deliberately introduced once generation is authorized, forming a before/after experimental
boundary with WG-W1:

| # | Case | Required |
|---|---|---|
| 1 | member writes prose | `member` |
| 2 | MAIA generates by **explicit commission** | `maia` |
| 3 | member revises MAIA prose | **lineage preserved** |
| 4 | MAIA transforms member prose | **lineage preserved** |
| 5 | copy / move / reorder | **authorship does not mysteriously change** |
| 6 | deletion | provenance **disappears with the deleted text** rather than corrupting neighbouring lineage |

**Case 3 is where WG-Q1 is answered** — the revision threshold, which must neither launder
silently nor stain permanently. It is a rule about edit acts, never text similarity (ruling
clause 2).

⭐ **Cases 5 and 6 are the structural ones, and they name a collision worth flagging now**:
split, merge, rename and reorder are exactly the operations **WS2-08** governs (08C's topology
commands, held). Lineage across a split is not merely an authorship-provenance problem — it is
**also a section-identity / topology problem**, the same question 08C asks, arriving from the
other side.

> **Founder guard, 2026-09-08: A1 may DISCOVER and SPECIFY that dependency. A1 may NOT
> silently solve 08C from the provenance side.**

⛔ The failure mode is not opening 08C — it is **answering it without opening it.** When cases
5 and 6 block, the available move is to define section identity from whatever provenance
needs, because that unblocks the work. That is the ownership inversion this programme
repeatedly guards against, arriving through a blocked test rather than through a proposal.
**Specify the dependency and return it. Recorded so that whoever opens either finds the
other.**

### Why this cannot be deferred

Beyond auditing: **a pre-generation population whose authorship is certain rather than
retrospectively inferred** is what makes it possible, years from now, to ask whether Writer
Guide achieved *"not more MAIA, more them"* — and to answer from evidence rather than from
inference over prose whose origins were never recorded.

## 4. Standing

```
WG-LAW-1       RATIFIED
A1             OPEN → constitution recorded (WG-B1..WG-B8, WG-F1..WG-F9)
               FIRST JOB: WG-W1 pre-generation baseline (§4b) — window is time-bound
               WG-W2 controlled cases follow authorization; case 3 answers WG-Q1
A2             follows A1 — must not outrun this law
WS2-07         PRESERVED as ratified; v2 is a founder act in its own lane
A3             open in parallel (Writer's Studio R&D) — does not block A1

no generative capability authorized · no code · no schema · no route · no UI · no deploy
bridge lane NOT coupled to this lane
```

**The design problem, in the founder's framing**: *how do we add enough capability for MAIA
to become a remarkable teacher and creative companion without destroying the very boundary
that makes Writer's Studio different?* A1's answer is that the boundary is kept by building
its evidence first — **provenance before generation** — so the boundary never depends on
remembering to honour it.

---

## 5. The north star *(founder, 2026-09-08)*

> **The better MAIA becomes at Writer Guide, the more the writer's own voice should appear.
> Not more MAIA. More them.**

Plain-language form of WG-LAW-1, from the same act:

> **Do not make writing easier by making the writer unnecessary. Make writing more possible by
> helping the writer come fully into the act.**

And the outcome that would mean it worked — *not* *"MAIA wrote an amazing book for me"* but:

> *"I never thought I was a writer. Then somewhere along the way, I realized I was writing."*

### ⭐ Why this is measurable exactly where WG-LAW-1 permits

*More them, not more MAIA* is a property of **the Work's composition** — how much of its
language the member authored — and **not a property of the member**. It therefore needs no
writer score, no ladder, no longitudinal rating: precisely the instruments WG-LAW-1 forbids.

**The north star and the falsifiers converge on one substrate.** Prose-level authorship
provenance (WG-A1-01, WG-B8) is what makes WG-F6 provable, WG-F7 detectable, and *"more them"*
observable — all three from the same record, none of them from measuring a person.

> That convergence is the argument for building provenance first. It is not only the
> precondition of safe generation; **it is the only way the north star can ever be more than a
> sentiment.**

⚠️ One caution it also implies: the ratio is evidence, never a target. A system that optimized
for *less MAIA language* would satisfy the number by withholding help — failing WG-B1's
requirement that the unaided path be first-class rather than the only good one, and failing the
design ethic's *"does not answer by eliminating the difficulty."* **The measure tells you
whether authorship stayed with the writer. It does not tell you whether the writer was
served.** Nothing in this lane may treat it as a goal to maximize.
