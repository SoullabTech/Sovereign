# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## ACT 2 — RECONCILE · intended product vs implementation reality

**Act** RECONCILE (RECOVER → **RECONCILE** → PRESENT → FOUNDER ACT → BUILD)
**Governing intent** `docs/programmes/writers-studio-v2/` (now on branch, FR-04)
· `CAPABILITY-COVENANT.md` · `FIELD-MAP.md` · `DECISIONS.md` D-001…D-023
· Founder Rulings II, FR-01…FR-04
**Mode** READ-ONLY. No product judgement. **Where code and ratified R&D
disagree, CODE IS THE DEFECT.**

---

## 0 · THE ARCHITECTURE MOVED, AND THE MAP DID NOT

The `FIELD-MAP` names one object as MAIA's whole per-turn situation:

```text
RoomFacts   workTitle · workPurpose · workForm · workStage · materials[]
            manuscriptTitle · draftChars · draftExcerpt   (6,000 chars — the opening)
```

**Verified on this branch: `lib/studio/companionStance.ts` does not exist.
`RoomFacts` does not exist. `app/api/sovereign/studio/` does not exist.**

They were not deleted and left a hole. They were **superseded by three
bounded perception paths**, each with its own exclusion discipline:

| path | what MAIA may perceive | discipline |
|---|---|---|
| **Situated conversation** `lib/writersStudio/workSituation.ts` | the member's own words about their Work — title, purpose, form, stage | **no manuscript prose**; client sends only a `workId`; unowned id resolves null; fails closed and quiet |
| **Developmental reader** `lib/manuscript/developmentalReader/` | whole sections of prose, digest-verified against frozen state | coverage may not lie; `DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 60_000`, **refused whole, nothing trimmed** |
| **Ask** `lib/writersStudio/askClient.ts` | anchors (ids and indices) + what the author typed | **no prose up the wire**; structurally incapable of a write to the Work |

> **The FIELD-MAP's "single largest EXTEND" was substantially performed — in a
> better architecture than the map anticipated.** Not one enlarged `RoomFacts`,
> but three bounded relationships, each refusing by construction rather than by
> policy. That is precisely *"extend what MAIA can perceive with deliberate
> exclusion"* (FR-03), arrived at before FR-03 named it.

**The map is stale here, not the code.** This is the one place in the whole
lane where implementation is ahead of the record.

---

## 1 · DIVERGENCE, PER DESTINATION

```text
BUILT AS INTENDED     intent and implementation agree
BUILT DIFFERENTLY     capability present under a superseding architecture
MISDECLARED           built and reachable, but the Studio calls it unavailable
NOT BUILT             ratified intent, no implementation  (a GAP, never a retirement)
SUBSTRATE LOST        the R&D names substrate that no longer exists anywhere
UNBOUND               ratified by FR-01…FR-03, no implementation and no spec yet
```

### MEMBER FIELD

| Destination | Ratified intent | Implementation reality | Divergence |
|---|---|---|---|
| **Materials** | `FIELD-MAP §2`, covenant 3 · 9 | `MaterialsDrawer`, `/api/sovereign/living-works/[id]/materials`; satisfied-in-room | **MISDECLARED** — `availability: 'later'` in `STUDIO_MAP` |
| **Structure** | `§3`, covenant 6 | outline column, `manuscript_sections`, `heading_depth` (WS2-08A) | **MISDECLARED** — same |
| **Versions / Keeps** | `§3`, covenant 8; FR-02 *Keep = preserved writing state* | revision list in `StudioLowerBand`; `/keeps` live and verbatim-verified | **MISDECLARED** (Versions) · Keeps **BUILT AS INTENDED** |
| **Notes** | FR-02 — *mutable thinking beside the Work*, Work- and optionally section-scoped, outside manuscript prose | nothing. Label and icon only | **NOT BUILT** — and now, for the first time, **specified** |
| **Goals** | `§1` Goals strip · `§5` active goals · `§7` progress against a **writer-declared** target is computable and showable | nothing. `StudioLowerBand` renders a Goals region that states it has no substrate | **NOT BUILT** — intent ratified twice, permission already written |

### MAIA FIELD

| Destination | Ratified intent | Implementation reality | Divergence |
|---|---|---|---|
| **Discover** | FR-03 — *"Something may be here worth looking at"*; across-the-Work connections, echoes, tensions | nothing | **UNBOUND → NOT BUILT** |
| **Insights** | `§5` recent MAIA insights; FR-03 — *"Here is a reading that has emerged"* | **the capability exists as the Develop mode**: `developmental_readings`, frozen evidence, `keep\|dismiss\|unresolved` standing, `developSurfaceCannotAct` | **BUILT DIFFERENTLY** — shipped as a *mode*, while the *destination* stays declared unavailable |
| **Suggestions** | FR-03 — *"You could…"*, never *"You should…"*; nothing gains standing by being suggested | nothing. `MaiaReading`'s `evidenceNoun: 'suggestions'` is a **citation count**, not this capability | **NOT BUILT** |
| **Conversations** | `§6` one MAIA, contextual per field; D-019 | `StudioConversation` + `workSituation`; satisfied-in-room, promotable via `situatedHrefs` | **BUILT DIFFERENTLY**, and **blocked** — see §3 |

### TOOLS

| Destination | Ratified intent | Implementation reality | Divergence |
|---|---|---|---|
| **Statistics** | `§7` counted, never judged: word · section · material · version · finding · passage counts | live in `StudioLowerBand` via `countDraftWords`; **the rail draws it unavailable on the same screen** | **MISDECLARED — the sharpest contradiction in the Studio** |
| **Find / Replace** | `§1` find in chapter / find in manuscript — **REUSE AS-IS** on `findInDraft`, `lib/studio/manuscriptTools.ts` | **neither exists on either branch.** `[id]/candidates` is the Recognition Room quote extractor, not find/replace | **SUBSTRATE LOST** — the R&D is wrong about its own substrate |
| **Timeline** | `§3` a **view of structure** ("Timeline · Threads · Flow · Table") | nothing | **NOT BUILT.** The Studio represents order, not time — a **design constraint on how it is built**, never grounds to retire it |
| **Threads** | `§3` twice — views row **and** "Themes & Threads ribbon"; `§4` *Threads is a Structure concept in the target* | declared once, in `STRUCTURE_SURFACES`, `available: false` | **NOT BUILT.** The lone declaration is **the ratified concept's only landing site**, not an orphan |
| **Word Web** | **FR-01** — mechanical lexical instrument; may not infer meaning | nothing | **UNBOUND → NOT BUILT**, now bound |

---

## 2 · COVENANT CONFORMANCE

`CAPABILITY-COVENANT.md` is *binding on every WS2 unit from WS2-02 onward*:

> **A unit may introduce these capabilities incrementally. No unit may
> architect them away.**
>
> **Visual fidelity cannot justify capability loss.**
> **Implementation convenience cannot silently alter product meaning.**

Measured against it:

- ✅ **Nothing has been architected away.** Every ratified destination is either
  built, built differently, or declared-and-unbuilt. No capability was removed
  from the architecture.
- ⛔ **But eight destinations are declared unavailable while the Studio's own
  covenant says they must remain reachable in principle** — and five of those
  (Materials, Structure, Versions, Statistics, Insights-as-Develop) **are
  actually built.** The Studio under-reports itself.
- ⛔ **FR-C regression stands**: `StudioRailItem` renders an unavailable
  destination as a dimmed `<span aria-disabled>` with **no state ever said**.
  Dimmed, not said.

**The covenant was kept in architecture and broken in declaration.**

---

## 3 · THE MAIA PRECONDITION, RECONCILED

FR-03 makes the `RoomFacts` extend the precondition for the MAIA band. §0 shows
that extend has **already happened**, under a different architecture. So the
precondition is not "build RoomFacts". It is narrower and sharper:

> **How much of the Work may each MAIA path perceive, and who decides?**

That question already has a live, load-bearing answer in code:

```text
DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 60_000    refused whole, nothing trimmed
```

**A 262-section Work does not fit.** The member is told *"This work is longer
than MAIA reads in one sitting, so she did not read it. Nothing has changed."*

⚠️ **This is not an unrelated defect. It is the current answer to FR-03's
precondition**, and it currently answers it as *refusal*. `contract.ts:129`
states the number is **a ruling, not an edit**.

Recorded, unresolved, **not repaired here**. It belongs to WS2-07 by custody but
it **gates the whole MAIA field** by consequence.

**Also gating, and separately recorded** (census Finding X-6): a manuscript
declared in two Works loses the withdraw gesture, so `Conversations` — a built
capability — becomes unreachable from inside the room.

---

## 4 · WHAT IS A DEFECT AND WHAT IS A GAP

**Defects — code diverging from ratified intent:**

1. Five built capabilities declared unavailable (Materials · Structure ·
   Versions · Statistics · Insights-as-Develop).
2. FR-C regression — unavailable state dimmed, never said.
3. Three declaration sites able to independently invent product reality
   (`STUDIO_MAP` · `STUDIO_MODES` · `STRUCTURE_SURFACES`).
4. Finding X-6 — the Work-ambiguity dead end blocking `Conversations`.

**Gaps — ratified intent, honestly unbuilt:** Notes · Goals · Discover ·
Suggestions · Timeline · Threads · Word Web · Find/Replace.

**Stale record — R&D diverging from reality:** `FIELD-MAP §6`'s `RoomFacts`
architecture · `CAPABILITY-MAP`'s `manuscriptTools.ts`, `findInDraft`,
`[id]/candidates` label, and several room component names.

---

## 5 · STANDING

```text
RECOVER      COMPLETE
RECONCILE    COMPLETE (this document)
PRESENT      this document
FOUNDER ACT  NOT PERFORMED
BUILD        NOT AUTHORIZED
DEPLOY       NOT AUTHORIZED

No capability retired. No capability redefined. No sequencing proposed.
The ceiling is NOT repaired. X-6 is NOT repaired. The rail is NOT touched.
```
