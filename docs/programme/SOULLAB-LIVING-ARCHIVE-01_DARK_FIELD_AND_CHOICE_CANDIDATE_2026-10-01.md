# SOULLAB-LIVING-ARCHIVE-01 · §30a–36 — The Dark Field and the Choice

**Status:** CANDIDATE (founder-directed record, 2026-10-01). ⛔ Not ratified · ⛔ no implementation · ⛔ no Source Vault schema · ⛔ no telemetry · production untouched.

**Scope note.** LA1–LA3-B (artifact constitution LA-07…LA-26, the Ten Artifact Dossiers, *From Inner Worlds to MAIA*) exist in founder conversation and are **not yet in the repository**. This record covers only the end of the first journey (§30a–36) and the review that followed. Law numbers continue the conversational series; they gain standing only by ratification.

---

## 1. The moment

Near the end of *From Inner Worlds to MAIA*: a dark field, the ten anchor artifacts suspended in chronology, then the rest of the catalogued archive appearing around them as faint points. *You have followed one thread. There are thousands more.* Then the visitor chooses where to go, or chooses nothing.

## 2. Candidate laws

**LA-27 — The scale of the archive may be revealed, never performed.** Every visible point corresponds to one catalogued artifact **at the fixed cataloguing unit** (§3.1). Generated or decorative points are counterfeit evidence (LA-11).

**LA-28 — The archive offers doors; it does not decide which door fits the visitor.** Navigation never becomes a reading of the person. **Telemetry clause:** navigation is not logged (§3.5).

**LA-29 — Another person's life is not the founder's to signal.** Material that involves a third party is **withheld**: not rendered, not positioned, not adjacent to any thread. LA-10's *"something mattered here"* applies only to the founder's own material (§3.3).

## 3. Review amendments (2026-10-01)

### 3.1 Cataloguing unit — ⚠️ OWED IN LA2
LA-27 means nothing without a fixed unit: one notebook can be one item or 200 pages, and density could triple with no new archaeology.
- **Candidate unit:** the provenance-bearing object as it was made (a notebook, a dream record, an audio file, a programme record). Pages, excerpts and sections are **sub-artifacts**. They are addressable inside their parent and never render as separate points.
- Any change to the unit definition is recorded in a **visible catalogue changelog**. Density is always computed at the unit in force, and a unit change never registers as recovery.
- Falsifier **LA30-F7**.

### 3.2 Haze
The uncatalogued layer marks **location only**: places where material is known to exist (a box, a drive, an export). In v1 it is **uniform**. Its density and extent carry no meaning.
If haze ever reflects an estimate, it must be labeled as an estimate and state its basis. Otherwise it reintroduces performed scale. Falsifier **LA30-F8**.

### 3.3 Sealed vs Withheld — ⚠️ OWED IN LA2
This replaces the original single "private" class:

| Class | Covers | Rendered | Position | Thread adjacency |
|---|---|---|---|---|
| **Sealed (self)** | Founder's own private material | Present, closed | Yes | Yes, unless adjacency would itself disclose third-party existence |
| **Withheld (third-party)** | Clients, correspondents, family, collaborators, anyone whose life the artifact carries | **No** | **None** | **None** |

- Withheld items contribute at most to **one archive-wide count with no position**, and only if that count cannot be localized.
- **When classification is uncertain, the item is Withheld.**
- Example of leakage this prevents: a sealed cluster along *"What did clinical work teach?"* announces that client-adjacent material exists. LA-08 already forbids making someone's intimate life an artifact. LA-29 extends that to its **shadow**.
- Falsifier **LA30-F9**.

### 3.4 Absent = catalogued known gaps only
True darkness is rendered **only** where the Source Vault holds a **known-gap record**: a lost manuscript, a destroyed drive, a period with no surviving source. Each record carries what is missing, how it is known to be missing, and the date range.
Unrecorded empty space is layout. It carries no label and no claim. Without this rule LA30-F2 cannot be evaluated.

### 3.5 Telemetry — recommended: none
- **No navigation telemetry:** no per-visitor and no aggregate thread counts. Aggregates are the classic drift vector: *"Why the elements?" gets 60%, so move it up.*
- Bookmarks live with the visitor (§5). An account copy exists only through an explicit act.
- ⚠️ **Obligation:** thread choice must not leak through infrastructure. If a thread is encoded in a request path, the Caddy and app access logs record it. Either archive routes keep thread state out of loggable paths, or access logs for those routes are not retained. **Verify against the deployed Caddyfile before build.**
- Falsifier **LA30-F10**.

### 3.6 Stable coordinates — layout-engine requirement
- An artifact's position is a **deterministic function of its archive ID and date**. It never depends on catalogue size, insertion order or neighbors. **Growth never moves an existing point.**
- **Shrinkage stays honest without re-disclosing:**
  - Founder re-seals own material → the point stays in place and becomes sealed.
  - Founder withdraws own material → the point becomes a labeled withdrawal at the same position.
  - Third-party material withdrawn or reclassified → it is removed **with no positional trace**. The catalogue changelog records the withdrawal without position. A trace at the old position would re-disclose what LA-29 protects.
- Falsifier **LA30-F11**.

### 3.7 Navigation grammar (minor)
- The menu mixed **questions** ("Why the elements?") with **places** ("Enter RGR", "Take me to the Edge"). They are now two grammars, shown separately: **Questions** (threads through artifacts) and **Places** (regions of the field).
- First-position salience is resolved spatially rather than by list order. Each thread is drawn **where its artifacts actually lie**, so the evidence decides placement and no curator's order does.
- *Stay with the field* remains a lawful, unranked option.

## 4. Falsifiers

| ID | Wrong world |
|---|---|
| LA30-F1 | Decorative scale: points that map to no catalogued artifact |
| LA30-F2 | Collapsed darkness: uncatalogued, sealed and absent rendered alike |
| LA30-F3 | Recommended thread: ordering or highlighting derived from visitor behavior |
| LA30-F4 | Completion pressure: progress meters, percentages, badges |
| LA30-F5 | Narrated awe: MAIA describing the archive's vastness instead of letting the field show it |
| LA30-F6 | Wandering penalized: *Stay with the field* treated as an abandoned journey |
| LA30-F7 | Granularity inflation: density changes with no matching change in recovered artifacts at the fixed unit |
| LA30-F8 | Performed haze: haze density or extent implying an unlabeled quantity |
| LA30-F9 | Shadow disclosure: any rendered signal (point, cluster, adjacency, positioned count) from which third-party material can be inferred |
| LA30-F10 | Telemetry drift: navigation logged, aggregated, or recoverable from access logs |
| LA30-F11 | Coordinate drift: an existing point moves because the catalogue grew, or a withdrawal leaves a trace that re-discloses |

Each falsifier must be paired with a defeat candidate before any implementation, per the programme's lethality-first discipline.

## 5. ⚠️ Open founder question — Q1: who may enter?

**Anonymous visitors or authenticated only?** The answer determines where bookmarks live, whether *My path through the archive* exists without an account, and how much sealed-point metadata is safe to show.

**Recommendation (not ruled):** layered entry.
- **Anonymous:** PUBLIC artifacts only. **Sealed points are not rendered at all**, because even the existence of private founder material is member-level. Bookmarks are kept in browser storage only, and the copy says plainly that they are lost if cleared.
- **Member:** sealed (self) points become visible as sealed. Account bookmarks exist by explicit act.
- **Withheld:** invisible at every level, including founder-facing views of the field. It exists only in the Source Vault.

## 6. Sequencing

1. **LA2 resolves §3.1 (cataloguing unit) and §3.3 (Sealed/Withheld classification).** The census decides both. The dark field **cannot be prototyped honestly** before they are settled.
2. Q1 ruled.
3. Telemetry rule (§3.5) ruled, and Caddy logging verified.
4. Coordinate function (§3.6) specified.
5. Only then: falsifiers authored, defeat candidates built, lethality proved, prototype.

**Standing:** CANDIDATE · LA-27/28/29 unratified · Q1 OPEN · LA2 obligations named · ⛔ no build.
