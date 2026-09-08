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

## 4. Standing

```
WG-LAW-1       RATIFIED
A1             OPEN → constitution recorded (WG-B1..WG-B8, WG-F1..WG-F9)
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
