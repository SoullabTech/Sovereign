# AIN ⇄ Obsidian Architecture Audit

**Date**: 2026-08-09
**Question asked**: Is Obsidian functioning as a connected file repository, or as an AIN-native sovereign memory substrate?
**Verdict**: **File repository.** Write-only, document-shaped, provenance-stripped, and — critically — *not currently reachable by any member gesture*. The architectural center of gravity is wrong, and adapters have already accumulated around it.

---

## I. What is actually there (evidence, main tree only)

### I.A The declared contract

`lib/connectors/obsidian/types.ts:1-6` states the design intent in its own header:

> *"v1 is write-only: MAIA → vault. No ingestion, no file watching, no two-way sync."*

This is honest and was a reasonable v1. It is also a precise statement of the limit: the vault is a **sink**, never a **source**.

### I.B The export ontology is a document ontology, not a memory ontology

```ts
export type ExportType =
  | 'session_summary' | 'journal_entry' | 'reflection'
  | 'practitioner_note' | 'key_themes' | 'transcript';
```

Every member of that union answers *"what shape of markdown file is this?"* — none answers *"what kind of truth is this?"* There is no `person`, `relationship`, `decision`, `declaration`, `keep`, `commitment`, `project`, `practice`, or `episode`. The vault therefore cannot represent AIN's ontology even in principle, because the boundary type does not carry it.

### I.C Epistemic character is destroyed at the boundary

`lib/connectors/obsidian/obsidianExport.ts:33-45` (`buildFrontmatter`) emits `type:` plus tags and a date. It does **not** emit:

- `authorship` (who authored this — member, MAIA, practitioner)
- `source` / `source_type` (declared vs. derived vs. observed)
- `confidence` (declared / tentative / inferred)
- `consent_scope` (private / shared / sanctuary-excluded)
- `derived_from` (the provenance chain)

This is the single most consequential finding. **AIN's rigor lives in the columns; the export writes prose.** A member-declared fact and a MAIA inference land in the vault as the same kind of object — the exact flattening the founder named as the thing AIN must not do.

### I.D The vault is not a retrieval substrate

No code path reads the vault into MAIA's context. The only read in the connector family is `lib/obsidian/ObsidianExporter.ts:108` — a `readFileSync` used for append-deduplication. `ObsidianRestClient` *has* `readNote()`, `search()`, `listFiles()` (`lib/obsidian/ObsidianRestClient.ts:130,164,181`), but it is referenced only as an optional field on `lib/secondbrain/*` types — never constructed into a retrieval path that reaches a prompt.

**Consequence**: MAIA cannot navigate the vault. There is no *"who is this about → what work → what happened → what was kept → what decisions constrain"* traversal, because there is nothing to traverse.

### I.E The write path has no member gesture

`exportToObsidian` has exactly one caller: `app/api/connectors/obsidian/export/route.ts:41`. No surface in `app/`, `components/`, `lib/`, or `scripts/` issues a `fetch` to `/api/connectors/obsidian/export`. `ObsidianConfig.autoExport` exists in the type and is persisted by `configure`, but **no auto-export implementation was found**.

Under the project's own stage-language: the export path is **wired and reachable**, not **live**. Only `status` / `configure` / `test` are exercised by a real surface (`components/settings/ObsidianConnectSection.tsx`).

### I.F Adapter accumulation has already occurred

At least **nine** independent Obsidian/vault implementations exist in the main tree:

| Path | Role |
|---|---|
| `lib/connectors/obsidian/obsidianExport.ts` | connector v1 (filesystem write) |
| `lib/obsidian/ObsidianExporter.ts` | parallel exporter (filesystem, append-dedupe) |
| `lib/obsidian/ObsidianRestClient.ts` | REST API client (read-capable, unused for read) |
| `lib/export/ObsidianExporter.ts` | third exporter |
| `lib/export/obsidian-exporter.ts` | fourth exporter |
| `lib/maia/obsidianExport.ts` | journal-entry exporter |
| `lib/journaling/ObsidianJournalExporter.ts` | fifth exporter |
| `lib/bridges/obsidian-vault-bridge.ts` | bridge |
| `lib/obsidian-knowledge-integration.ts` | knowledge integration |

Plus vault-adjacent readers with their own models: `lib/memory/VaultSymbolIndex.ts`, `lib/knowledge/VaultWisdomLoader.ts`, `lib/maia/wisdom-vault-ingestion.ts`, `lib/soulprint/{fileWriter,syncManager}.ts`.

This is the diagnostic signature of a wrong center of gravity: when the model does not fit, each new need grows a new adapter rather than extending the model. **The instruction "do not accumulate adapters around a flawed model" is not a forward-looking caution here. It is a description of what has already happened.**

---

## II. What AIN already does better than the prior art

This matters, because the temptation is to import a second-brain ontology wholesale. AIN should not — it is **already more rigorous** in the places that count.

`database/migrations/20260521000001_member_memory_atoms.sql` encodes distinctions that PARA, Zettelkasten, and every Claude/Obsidian "second brain" architecture lack:

- **Source bridge, not copy** — *"The atom points at the source; the source remains in its native table."* A keep does not duplicate content; it *references* it. Provenance survives.
- **`source_type` as a closed, checked vocabulary** — `idea | idea_block | journal | dream | reflection | decision | change | session_excerpt | spontaneous`. The kind of material is schema-bound, not a tag.
- **Registers and lenses are member-placed, never system-assigned** — the migration states it explicitly: *"The system NEVER auto-assigns registers, lenses…"* No second-brain system enforces this. It is the structural refusal of interpretive displacement.
- **Consent as a column, not a policy doc** — `return_preference` (atoms) and `member_daily_anchors.surface_preference` gate whether kept material may surface at all, defaulting to private.
- **Member-marked significance** — `is_breakthrough` is a member act, with a `crossing_must_be_false` sibling constraint.

Beyond atoms, the ontology the founder listed **already exists as tables**: `field_people`, `member_relationships`, `relationship_entries`, `episodic_memories`, `episodes`, `encounters`, `field_decisions`, `decision_experiences`, `member_organizing_principles`, `recognitions`, `member_sessions`, `member_manuscripts`, `member_ideas`, `capture_notes`, `corpus_documents`.

**The ontology is not missing. It is landlocked.** It exists in Postgres and stops at the connector boundary.

---

## III. What we are actually missing (from the prior art, taken selectively)

Judged against contemporary Claude/Obsidian architectures, the genuinely useful mechanisms AIN lacks:

1. **Navigable retrieval over files** — a traversal (who → what work → what happened → what was kept → what constrains) instead of dumping or full-text grep. AIN has the graph in SQL; it has no file-side expression of it.
2. **Stable identity and backlinks** — `[[Larry Closs]]` as a durable referent that survives renames, so a human clicking through the vault sees the same relational graph AIN reasons over.
3. **Round-trip authorship** — the human edits the file; the system respects the edit as a *member declaration* rather than overwriting it. This is where most second-brain systems are actually good and AIN is absent (write-only).
4. **Index/MOC pages that are generated but human-readable** — `People/`, `Works/`, `Decisions/` maps as artifacts, not as a UI.

What we should **not** import: PARA/Zettelkasten category systems (AIN's registers/lenses are stronger and member-placed), auto-tagging, auto-summarization into "notes", and "the AI maintains your knowledge graph" — all of which manufacture interpretation and would violate the atoms migration's own rule.

---

## IV. The structural finding

The current stack is:

```
MAIA renderer  →  markdown string  →  vault folder
```

Obsidian sits downstream of the **renderer**. That is what makes it a plugin.

The required stack is:

```
AIN orientation
   ↓
memory ontology            (already exists — Postgres, member-authored)
   ↓
projection + provenance    (MISSING — the actual gap)
   ↓
vault as materialized view (files carry epistemic character)
   ↓
retrieval traversal        (MISSING — vault as source, not sink)
```

Obsidian must sit downstream of the **ontology**, not the renderer. That single relocation is the whole architectural change; everything else follows from it.

**Naming the gap precisely**: we do not need a better exporter. We need a **projection layer** — one component that maps AIN ontology records to vault records *with their epistemic character intact*, and one **traversal layer** that reads them back as typed records rather than text. Nine exporters exist because the projection layer does not.

---

## V. Minimum coherent architectural change

Deliberately minimal. Each step is independently valuable and independently reversible.

### Step 1 — Author the AIN Vault Record spec (no code)

One document defining, for each ontology kind, the frontmatter contract. Non-negotiable fields on **every** record:

```yaml
ain_type: relational_event | person | decision | declaration | keep | episode | session | project | practice | question | source
ain_id: <uuid>              # the Postgres row this projects
authorship: member | maia | practitioner
epistemic_status: declared | observed | derived   # ← the load-bearing field
confidence: declared | tentative                  # only meaningful when derived
consent_scope: private | shared | sanctuary_excluded
derived_from: [<ain_id>, ...]                     # required when derived
projected_at: <iso8601>
```

`epistemic_status` is the field that makes this AIN rather than a second brain. **A `derived` record may never be written into a file whose frontmatter claims `declared`** — that is the invariant the whole design exists to enforce.

Sanctuary content is `sanctuary_excluded` and is **never projected**, under any circumstance, including member request during the session (existing Sanctuary invariant 6 applies unchanged).

### Step 2 — Build one projection module, delete nothing yet

`lib/ain/vault/projectRecord.ts` — takes an ontology record + its provenance, returns a vault record. One module, one contract. Prove it on **one** kind first: `keep` (memory atoms), because atoms already carry source_type, consent, and member-authorship — the projection is nearly lossless and requires no new interpretation.

Do not migrate the other nine implementations in this step. Prove the model, then retire them by attrition.

### Step 3 — Traversal, not search

`lib/ain/vault/traverse.ts` — reads vault records back as **typed records**, entered from a subject (person / work / episode), not from a query string. MAIA navigates: subject → recent → kept → constraining decisions. Never a full-vault dump into context.

Gate: traversal returns only records whose `consent_scope` permits surfacing, mirroring the atoms `return_preference` gate. The vault does not become a consent bypass.

### Step 4 — Member gesture

Wire *one* real gesture — "keep this to my vault" — to the projection path. Until a member act projects a record, this remains **wired**, not **live** (project stage-language).

### Step 5 — Round-trip (later, gated)

Human edits a projected file → AIN reads the edit as a **member declaration** (`authorship: member`, `epistemic_status: declared`), never silently overwritten. This is the step that makes the vault sovereign rather than a mirror. It requires its own consent + conflict spec and is **not** authorized by this audit.

### Then, and only then — retire the adapters

Once projection + traversal carry real traffic, the nine implementations in §I.F are deletable, one by one, each with its callers named. Deleting them first would just move the problem.

---

## VI. On `MEMORY.md`

The founder's read is consistent with what the code shows. `MEMORY.md` is large because it is doing retrieval's job. Once traversal exists, the root reduces to: *who am I · what system · what are the memory laws · where do I look · what must I never infer*.

**But**: this audit does **not** authorize compacting `MEMORY.md`. The routing index has its own governance and its own founder rulings. Reduction becomes *possible* when traversal is live — it does not become *authorized*.

---

## VII. Claim discipline

Per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`:

- **Live**: Obsidian connector configure / status / test. Vault path validation. Nothing else.
- **Designed**: `exportToObsidian` write path (wired, no member gesture, no auto-export implementation).
- **Vision**: everything in §V. Not built. Not authorized by this document — this is an audit, and §V is a proposal awaiting founder decision.

**Failure test**: if the projection layer ships and members' vaults fill with files whose frontmatter says `declared` over MAIA-derived content, the design has failed and must be withdrawn — not patched.

---

## VIII. Growth-obligation answers (CLAUDE.md, required)

**What uncertainty does this introduce, and how is it preserved?**
Projection creates a second copy of memory outside the consent-gated database. The uncertainty preserved is epistemic status itself: `derived` records must remain visibly derived in the file, and `derived_from` must remain resolvable. If provenance cannot be written, the record is not projected.

**What provenance and ownership boundaries does this require?**
Every vault record carries `ain_id`, `authorship`, `epistemic_status`, `derived_from`. The member owns the file; AIN owns only the projection. `consent_scope` governs both projection and traversal. Sanctuary is never projected.

**What new responsibility does this capability create?**
The vault becomes durable and portable — it outlives MAIA and cannot be recalled. Anything projected is effectively permanent from AIN's side. That makes the projection decision heavier than a database write, and is why Step 4 gates it behind an explicit member gesture rather than `autoExport`.

---

## IX. The recommendation in one line

Do not improve the Obsidian connector. **Build the projection layer the nine exporters have been substituting for**, prove it on keeps, add traversal, and let the adapters die of disuse.
