# Federated Master Fields Architecture

## Core Principle

Scale **shared infrastructure** with **distinct intelligences** — not shared intelligence with distinct branding.

The system standardizes containers and contracts, not the teachers' minds.

### The Real Test

> Can one system host multiple epistemologies without collapsing them into one tone or worldview?

Not scaling users. Not scaling content. **Scaling ways of knowing.**

This is plural depth — not horizontal scale (more users) or vertical scale (more capability).

---

## Architectural Invariants

### 1. Do NOT unify at the intelligence layer. ONLY unify at the infrastructure layer.

| Layer | Shared? | Notes |
|-------|---------|-------|
| Routing / APIs / DB | Yes | Platform spine |
| Build contract (shape) | Yes | Same slots |
| Voice | No | Per master |
| Method | No | Per master (critical) |
| Perception | No | Different ways of attending |
| Memory | Strictly partitioned | No bleed across fields |

### 2. Method must override voice when in conflict.

- Jondi's method > her tone
- Kelly's perception > his language
- Any master's logic > shared patterns

If method and voice conflict, method wins. Always.

### 3. Memory must shape, not speak; compress, not surface; never cross fields.

A Kelly entry must not silently influence Jondi. A Jondi session memory must not shape a Jungian field. Memory tooling is shared. Memory influence is partitioned.

### 4. The drift test: does everyone slowly start sounding like the platform's native tone?

The system naturally leans symbolic, integrative, meaning-oriented. Jondi introduces the counter-force: procedure over interpretation, body over meaning, sequence over insight. If she drifts toward the platform tone, the architecture is already collapsing.

---

## Architecture Layers

### 1. Shared Platform Spine

Common services for all masters:
- Auth, field routing, document ingestion
- Build pipeline, notebook/memory
- Analytics, versioning, governance, permissions

### 2. Per-Master Intelligence Bundles

Each master gets a separate bundle:
- `voice_block` — how they sound
- `stance_block` — where they stand
- `knowledge_block` — what they know
- `perceptual_block` — how they organize experience
- `method_block` (optional) — what they actually do
- `practice_block` (optional) — specific practices

**Critical separation:** Voice / Knowledge / Perception / Method must stay distinct. Without separating perception from method, masters blur together.

### 3. Common Build Contract

Every master build compiles to the same output shape:

```typescript
type MasterBuild = {
  master_id: string
  version: string
  voice_block: string
  stance_block: string
  knowledge_block: string
  perceptual_block: string
  safety_block?: string
  method_block?: string
  metadata: {
    source_counts: Record<string, number>
    validated_by?: string
    activated_at?: string
  }
}
```

---

## Data Model

### A. Masters Table

- `id`, `slug`, `display_name`
- `domain`, `modality`
- `active_build_id`, `field_id`, `status`

### B. Source Documents (`master_documents`)

- `id`, `master_id`, `title`
- `source_type` (book, transcript, podcast, class, notes)
- `format` (md, pdf, txt, html, json)
- `raw_content`, `content_hash`, `source_url`
- `uploaded_by`, `processing_status`, `created_at`

### C. Extractions (`master_extractions`)

Normalized extraction table (not just processed blobs):
- `id`, `master_id`, `document_id`
- `extraction_type` (voice, knowledge, perception, method, constraint, distortion, sequence, language_pattern)
- `content`, `confidence`, `tags`, `section_ref`
- `created_at`

This gives auditability and rebuildability.

### D. Builds (`master_builds`)

- `id`, `master_id`, `build_version`
- `voice_block`, `stance_block`, `knowledge_block`
- `perceptual_block`, `method_block`
- `validation_notes`
- `status` (draft, validated, active, retired)
- `created_by`, `activated_by`
- `created_at`, `activated_at`

---

## Source Hierarchy

**Tier 1 (highest value)** — use first:
- Books, training manuals, flagship talks, canonical classes, session demos

**Tier 2:**
- Podcasts, interviews, essays, newsletters
- Good for voice/stance, weaker for method

**Tier 3:**
- Casual posts, short clips, promotional copy
- Useful only in small doses; too much pollutes the build

---

## Extraction Pipeline (Per Master)

### Pass 1 — Voice
Cadence, rhetorical habits, tone, preferred language, phrases to avoid

### Pass 2 — Knowledge
Concepts, frameworks, definitions, distinctions, named models

### Pass 3 — Perception (most important)
- What they notice first
- What they refuse to collapse
- What must be distinguished
- How they sequence transformation
- What errors they prevent

### Pass 4 — Method
Sequences, interventions, practices, routines, question patterns, decision branches

---

## Routing Architecture

**Default mode:** User enters a master field, only that master's active build loads.

**Comparison mode (future):** Carefully controlled cross-master views, never by default.

**Aether/platform mode:** System knows about all masters, but active conversation = one master, one field, one build. This prevents convergence.

---

## Memory Architecture

**Shared:** Notebook tables, capture logic, filters, activation mechanics.

**Partitioned:** Memory influence scoped by field, master, user, context.

A Kelly entry must not silently influence Jondi. A Jondi session memory must not shape a Jungian field. Memory tooling shared; memory influence partitioned.

---

## Governance

Required:
- Build validation before activation
- Rollback to previous build
- Source traceability
- Activation audit trail
- Clear distinction between raw document, extraction, and build

### Per-Master Lifecycle
1. Ingest source materials
2. Extract voice / knowledge / perception / method
3. Synthesize draft build
4. Human review
5. Activate
6. Test live
7. Collect corrections
8. Rebuild

---

## Anti-Patterns to Avoid

1. **Universal master model** — one big "teacher intelligence" will average everyone
2. **Prompt-only architecture** — need stored artifacts, versioning, builds
3. **Over-reliance on vector retrieval alone** — does not preserve perceptual structure
4. **Mixing all sources equally** — a random podcast clip != foundational text

---

## Implementation Sequence

1. `master_documents` table + ingestion
2. `master_extractions` table + extraction pipeline
3. Builder update: support `perceptual_block` and `method_block`
4. Full case study with Jondi (method-heavy = reveals weak spots fast)
5. Generalize to remaining masters

---

## Epistemic Conflict Rules (from Care Lens Architecture)

When frameworks conflict, priority order:
1. **Sovereignty > Method** — no framework overrides agency
2. **Relational > Corrective** — IFS/somatic over CBT-style correction when in tension
3. **Inquiry > Interpretation > Correction** — always in this order, never skip
4. **Uncertainty preserved** — no framework introduces false certainty
