# MAIA-MAVEN-CANON-01 — Founder Adjudication

**Status:** Founder rulings ENTERED as canon 2026-09-17. Lane closure QUALIFIED (see §0).
**Author of the rulings:** Kelly (founder). Entered verbatim in substance; not paraphrased into weaker form.
**Governing kin:** `MARKETING_CLAIM_DISCIPLINE.md` · `CLAIM_STATE_AUTHORITY.md` · `FOUR_LAYER_SUBSTITUTION.md` · `MAIA_MEMORY_CANON_v1.0.md` · `MAIA_SOVEREIGNTY_INVARIANTS.md` · `MAIA_OATH.md`

---

## §0 — Custody qualification (read first)

> ⚠️ **CORRECTED 2026-09-17 by `docs/programme/MAVEN-CUSTODY-01_RECONCILIATION_2026-09-17.md`.**
> Two claims in this section were wrong and are corrected there, not here:
> **(a)** `CAPABILITY_REGISTRY` is **NOT absent** — it is at `lib/maia/capabilities.ts`, on canonical and in
> the working tree. The prior search used a filename assumption (`*capabilityRegistry*`). **R3 is unaffected
> and is now evidenced**: 0 consumers, 0 callers, 0 emissions.
> **(b)** The searches ran in a **shallow clone** (10 grafts, 293 commits, 2 of 1,587 branches). Absence
> there carried no information about the repository. The cited commits `6adbc3bb` and `194e3054` **both
> exist** and are branch-local.
> The paragraph below is retained as authored.

⚠️ **The reconciliation object `MAIA-MAVEN-CANON-01` is NOT PRESENT IN THIS REPOSITORY.** A full-tree search
returns zero Maven documents and zero references to the lane identifier. `CAPABILITY_REGISTRY` is likewise
absent as an artifact.

This matters, and it is recorded rather than smoothed:

- **A ruling is authoritative from its author.** The founder rulings below stand on their own. They do not
  require this session to have read the reconciliation, and they are entered as canon.
- **A closure is a statement about a record.** It asserts that a named object reached a terminal state.
  This session has no custody of that object and therefore cannot witness its closure.

Accordingly: **rulings ENTERED · lane closure OWED a custody act** — the reconciliation record must land in
this repository (or its true location be named) before `MAIA-MAVEN-CANON-01` can be marked closed here.
Marking a lane closed against a record one has never held is the same defect class this canon exists to refuse.

⭐ **One consequence, favourable and worth stating**: the census finding that motivated R3 is *strengthened*,
not weakened, by this absence. This session cannot confirm `CAPABILITY_REGISTRY`'s "0 consumers / 0 callers"
because it cannot find the declaration at all. Either reading lands in the same place — **no runtime capability
authority exists here today.**

---

## R1 — `START_FRESH` means no continuity crossing

`MAIA_MEMORY_CANON_v1.0` may still require the base chain to be **queried** for a recognized member.
Querying is not the same act as admitting retrieved material into MAIA's generative context.

When the member chooses `START_FRESH`:

```text
base chain
    ↓
queried / continuity state known
    ↓
held outside generative context
    ↓
NO memory content crosses
    ↓
MAIA meets the member in the present interaction
```

**The law:**

> **Continuity may remain available without becoming present.**

The member may later reopen continuity deliberately.

**What this forecloses:** the dangerous interpretation in which MAIA announces a fresh start while retrieved
history silently shapes the response. Availability is not presence; a queried chain that reaches the prompt
has crossed, whatever the greeting says.

---

## R2 — Two independent maturity axes, never merged

Maven maturity does **not** merge with `Live / Designed / Vision`.

| Axis | Question it answers |
|---|---|
| **Maven standing** | How strongly is this knowledge/capability warranted internally? |
| **Platform maturity** | How materially instantiated is it in the product? |

Both combinations are representable and neither is incoherent:

```text
Maven: strongly warranted   ·   Platform: Designed
Maven: provisional          ·   Platform: Live
```

**Neither axis confers the other.** Most importantly:

> **Maven standing cannot authorize a member-facing claim of capability.**

The ratified outward maturity vocabulary is preserved intact.

---

## R3 — `CAPABILITY_REGISTRY` is not presently an authority

The census finding is decisive. A registry with `0 consumers · 0 callers · capability_available declared ·
0 capability_available emissions` is **declarative substrate / intended architecture**, not the runtime
capability authority.

**Canonized rule:**

> **A capability declaration does not establish capability availability.**

For a capability to become `Live`, the actual chain must be evidenced:

```text
declaration → live consumer → execution path → outcome → observable evidence → test/witness
```

**Repository truth, stated accurately (verified 2026-09-17):** `lib/maia/voiceNavigationBridge.ts` is
60 lines dispatching a `maia:voice-navigate` window `CustomEvent`, consumed by `components/maia/MaiaShell.tsx`
and `lib/voice/voiceCommands.ts`. Its own header names it *"a temporary transport layer… will be replaced by
an internal event bus when the capability system matures."* **That self-description is correct and is the
description of record.** It is transport, not capability authority.

**NODE-05 stays OPEN at J5. No retroactive PASS.**

---

## R4 — "Four-Layer" is permanently reserved

**Canonical, and confirmed present in this repository** at `docs/canon/FOUR_LAYER_SUBSTITUTION.md`:

> **Four-Layer = Content / Form / Meta / Frame.**

Maven may not reuse that noun for a different architecture. **Rename the Maven structure; do not redefine
existing canon.** Candidate terms: *Maven Operating Planes*, *Maven Dimensions*, or a term derived from what
those four things actually do. The name is open; the principle is not:

> **One canonical term, one canonical referent.**

---

## R5 — No Sanctuary content carve-out

Invariant 6 wins.

Sanctuary may emit the **minimum control state required to preserve Sanctuary** — e.g. `sanctuary_active = true`.
Sanctuary material itself may not escape through a side door. The prohibition covers:

- raw content
- quotations
- summaries
- embeddings
- inferred memories
- derived psychological characterization
- personalization derived from Sanctuary content

```text
Sanctuary state may govern the boundary.
Sanctuary content may not cross the boundary.
```

Any future exception requires an **explicit constitutional amendment**, never an implementation convenience.

### ⭐ R5 decides a live contradiction in member-facing copy — recorded here because R5 found it

The ratified invariant (`CLAUDE.md` Sanctuary §6, echoed at
`docs/canon/RELATIONSHIP_ROOM_CONSTITUTION_PRE_RATIFICATION_RECONCILIATION_2026-08-10.md:232`) reads:

> *"Nothing from a Sanctuary session can be saved, extracted, inferred, or converted into long-term memory,
> under any circumstances, **including by user request during the session**."*

**Member Manual v1 §12 contradicts this directly.** It tells members that inside Sanctuary they may say
*"Keep that sentence"* and that MAIA will answer *"I can save just that sentence separately if you want."*

That is precisely the side door R5 closes, and the invariant's own clause `including by user request during
the session` was written to foreclose it. The member act being deliberate does not convert a prohibited
crossing into a permitted one — **that is what "under any circumstances" means.**

⛔ **The manual yields to the invariant**, not the reverse: the invariant is ratified and R5 has just
re-affirmed it. Manual §12 is marked **SUPERSEDED IN PART** in place (never deleted), and **no derived
member-facing artifact may carry the save-one-sentence affordance.**

⚠️ **The alternative is available but is a founder act, not an editorial one**: amending Invariant 6 to admit
a narrow member-authored extraction. R5 explicitly requires that route to be a constitutional amendment.
**Not taken here.**

---

## Additional rulings falling from the census

### LF-SCOPE-01 — leave **UNATTESTED**
No artifact bears that evidence. Maven does not manufacture evidence by implication. The attestation is
created when the actual scope work is done, and not before.

### Astrology — **declared / unwired**, not "withheld"
These mean radically different things. *"Withheld"* implies working capability exists and has been deliberately
denied. **Repository truth currently supports only the former.** Use the accurate term.

### Keeps — solve the collision **ontologically**, not by arbitrary rename

> **Keep is the family concept / member gesture. Each implementation must carry a qualified identity.**

```text
KEEP
│
├── [Press-qualified Keep]
├── [Psyche/portfolio-qualified Keep]
└── [Capture implementation]
```

The organism retains the deeper idea of *keeping* without pretending three different objects are one object.

Already-earned doctrine remains intact:

> **Keeps may order what the member has chosen; they never select on the member's behalf.**

This unblocks the **naming** portion of T1-A. ⛔ It does **not** authorize its invocation seam.

---

## Standing

```text
MAIA-MAVEN-CANON-01
FOUNDER RULINGS:        ENTERED (R1–R5 + LF-SCOPE-01 · Astrology · Keeps)
Contradictions:         0 between rulings
Repository inflation:   REJECTED
Existing stronger law:  PRESERVED (Invariant 6 · Four-Layer · outward maturity vocabulary)
Unattested claims:      REMAIN UNATTESTED
Implementation:         UNOPENED
LANE CLOSURE:           ⚠️ OWED A CUSTODY ACT (§0) — reconciliation object not in this repository
NEW FINDING:            Member Manual v1 §12 vs Invariant 6 — decided by R5, manual superseded in part
```

> The canon earned the right to stand precisely because the reconciliation allowed it to say *not yet*.
> Do not edit Maven again merely to make it sound more complete.
