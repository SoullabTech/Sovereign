# COACHING-TEMPLATE-EXTRACTION-01 — NAMING RULING

**Date**: 2026-09-04
**Ruled by**: founder (Kelly)
**Kind**: naming + framing ruling. **No extraction work is authorized by this document.**
**Supersedes**: the working lane name `NOW-WHAT-PORTABILITY-01` (never on canonical; used in session only)
**Standing with the Anti-Drift Law**: the law in `docs/design/now-what/reconciliation/NOW_WHAT_MASTER_PROGRAMME.md`
freezes *generalized architecture* and *broad refactors* until the Jondi walk. This ruling
records a name so the future lane cannot open under the wrong one. It does not lift the freeze.

---

## 1. The ruling

Three layers, three names. Fixed now, before any extraction work, so that Larry is not
encoded into the thing Soullab intends to keep and sell.

| Layer | Name | What it is |
|---|---|---|
| Generic product | **Coaching Platform** | Soullab platform capability: auth, data, resources, rooms/spaces, program engine, AI interface, tenancy, deployment |
| Generic methodology / configuration layer | **Coaching Journey Template** | The architecture of an ongoing coaching relationship: places, sessions, reflection, work, resources, relationship over time |
| Larry's configured instance | **Now What?** | One customer configuration of the template: Larry's branding, language, content, methodology, configuration |

```text
COACHING PLATFORM
│
├── Coaching Journey Template
│   ├── rooms / spaces
│   ├── program structure
│   ├── prompts
│   ├── resources
│   ├── session flow
│   ├── reflection flow
│   ├── AI permissions
│   └── branding slots
│
└── Instance: Now What?
    ├── Larry branding
    ├── Larry language
    ├── Larry content
    ├── Larry methodology
    └── Larry-specific configuration
```

**Why "Coaching Journey Template"** over "Coaching Template": it names an architecture for an
ongoing coaching relationship, not a skin or a worksheet set. A client moves through places,
sessions, reflection, work, resources and relationship over time; the name carries that.

Considered and not chosen (all viable, all neutral): Coaching Practice Template · Coaching
Engagement Template · Coaching Workspace Template.

## 2. The lane rename

`NOW-WHAT-PORTABILITY-01` → **`COACHING-TEMPLATE-EXTRACTION-01`**

Explicit premise of the lane, binding when it opens:

> **Now What? is the first specimen used to discover and extract the generic coaching
> architecture. It is not the generic architecture itself.**

The old name framed the work as moving Larry's product somewhere. The new name frames it as
extracting Soullab's platform from its first worked example. The asset is not *Now What? without
Larry*; it is a white-label coaching platform in which Now What? was the first worked example.

## 3. Target extraction shape (recorded, not authorized)

```text
COACHING PLATFORM
        │
        ├── generic auth interface
        ├── generic data interface
        ├── generic resources
        ├── generic rooms/spaces
        ├── generic program engine
        └── generic AI interface
                    │
                    ▼
          Coaching Journey Template
                    │
             ┌──────┴──────┐
             ▼             ▼
        Now What?      Future Coach
         template        template
```

Sellable form, eventually: a new coach starts from the Coaching Journey Template → chooses
spaces → configures program → uploads resources → defines coaching prompts → sets AI
participation → applies branding → invites clients. Larry becomes one customer configuration,
not a permanent architectural dependency.

## 4. Ownership caution — renaming does not establish provenance

Renaming a thing does not establish that Larry does not own it. The extraction lane must
establish provenance per item, under the same discipline already governing the Larry corpus
(`docs/reviews/LARRY_IP_CORPUS_INVENTORY_AUDIT_2026-08-03.md`,
`docs/governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md` — **Attachment A is v0, unpopulated,
unsigned; custody is unestablished**, per NW-D00 §UNKNOWN).

| Provenance | Disposition |
|---|---|
| Generic structure developed independently by Soullab | → Coaching Platform / Coaching Journey Template |
| Larry-specific language, exercises, program concepts, branding, supplied materials | → stays in the Now What? configuration unless clearly licensed otherwise |
| Ambiguous | → **classify before generalizing.** Not moved until classified |

Worked example of the trap: renaming `My Question` → `Question Space` does **not** make the
room generic IP. The question is whether the underlying room architecture and behavioural model
originated in Soullab's product architecture or in Larry's methodology. That question is answered
per room, in the lane, not by the rename.

What is already fairly obvious at the software level as platform capability rather than Larry
content: programs · clients · sessions · resources · reflections · spaces · coach/client
permissions · AI participation boundaries · branding · configuration · deployment · tenancy.
Obvious is not classified; the lane still records each.

## 5. Census (founder-cited; not on canonical; not re-verified by this ruling)

The feasibility read that motivated the rename came from a session census that was never
committed:

```text
Now What source:       572 KB / 43 files
first-order coupling:   47 imports
MAIA/intelligence:       6 call sites
inbound MAIA coupling:   2 files
main blocker:            DATA BOUNDARY
```

Read: this is a small feature surface on shared MAIA infrastructure, with the database as the
main entanglement, not a large Larry application to carve out. A quick re-count on canonical
`27ec9f89` (2026-09-04) gives the same order of magnitude with different counting rules
(584 KB / 44 files across `app/now-what`, `components/now-what`, `lib/nowWhat`,
`app/api/now-what`; 31 *unique* first-order import targets; ~20 files outside the namespace
that reference it, of which the MAIA-owned ones are `lib/maia/presence/place.ts`,
`lib/maia/presence/postures.ts`, `lib/maia/roomComposition.ts`). The lane's FIND unit
re-runs the census with a stated method before anything is decided from it.

## 6. Opening gates (founder, 2026-09-04)

`COACHING-TEMPLATE-EXTRACTION-01` is correctly named and unopened. It becomes implementation
work only when all three hold:

1. **Anti-Drift condition** satisfied, or explicitly waived by the founder, after the Jondi walk.
2. **Provenance / custody adjudicated** sufficiently to distinguish reusable platform
   architecture from Larry-specific or otherwise licensed material. Abstraction and renaming
   never confer Soullab ownership; only adjudication does.
3. **Coupling census re-run reproducibly**, with method and transitive depth attached. The
   session-only numbers in §5 are orientation, not evidence.

When the lane opens, the first act is discovery, not copying code:

```text
CTE-01 FIND
───────────
generic platform capability
template-configurable capability
Now What?-specific material
shared Soullab dependency
MAIA intelligence dependency
data/schema dependency
auth dependency
deployment dependency
provenance status
```

Every Now What? surface, module, table and string receives one row across those columns.

**Likely technical hinge: the data boundary.** The first-order census suggests the visible
Now What? code is small and MAIA coupling is narrow. What prevents transferability is that its
persisted state has not been made an independent product boundary.

**State carried forward**: naming decided · product hierarchy decided · provenance constraint
binding · generalization frozen · extraction not opened. Nothing further is designed around
the lane until the condition that freezes it changes.

## 7. What this ruling does not do

- Does not open `COACHING-TEMPLATE-EXTRACTION-01`. Opening it requires a founder directive
  after the Anti-Drift Law's condition (Jondi walk) is met or explicitly waived.
- Does not rename any route, component, table, room key or member-facing string.
- Does not classify any Now What? surface as generic or Larry-owned.
- Does not amend the Now What? five-state UX roadmap.

## 8. Cross-references

- Master programme (deferred list updated to carry the lane name):
  `docs/design/now-what/reconciliation/NOW_WHAT_MASTER_PROGRAMME.md`
- Existing product census: `docs/design/now-what/reconciliation/NW_D00_EXISTING_PRODUCT_CENSUS_2026-08-26.md`
- Ontology custody: `docs/design/now-what/reconciliation/NW_D00_ONTOLOGY_CUSTODY_RECORD_2026-08-26.md`
- Room registry (the specimen's current five doors): `lib/nowWhat/rooms.ts`
