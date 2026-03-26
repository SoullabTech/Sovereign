# Federated Master Fields — Architecture Overview

## The Core Question

> Can one system host multiple epistemologies without collapsing them into one tone or worldview?

Not scaling users. Not scaling content. **Scaling ways of knowing.**

---

## System Architecture (5 Layers)

```
┌─────────────────────────────────────────────────────────┐
│                    RUNTIME LAYER                         │
│                                                         │
│   User enters field → only that master's build loads    │
│   jondi.soullab.life → /fields/jondi → Jondi build     │
│   kelly.soullab.life → /fields/kelly → Kelly build     │
│                                                         │
│   One master. One field. One active build.              │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    MEMORY LAYER                          │
│                                                         │
│   Shared mechanics ──── Partitioned influence            │
│                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│   │  Kelly   │  │  Jondi   │  │ Master N │             │
│   │  memory  │  │  memory  │  │  memory  │             │
│   └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│   Kelly entries NEVER influence Jondi.                   │
│   Jondi sessions NEVER shape Kelly's field.             │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    BUILD LAYER                           │
│              (Versioned Compiled Artifacts)              │
│                                                         │
│   ┌─────────────────────────────────────────────┐       │
│   │  MasterBuild {                              │       │
│   │    master_id    : string                    │       │
│   │    version      : string                    │       │
│   │    voice_block  : string   ← how they sound │       │
│   │    stance_block : string   ← where they stand│      │
│   │    knowledge_block: string ← what they know │       │
│   │    perceptual_block: string ← how they see  │       │
│   │    method_block : string   ← what they DO   │       │
│   │    safety_block?: string                    │       │
│   │  }                                          │       │
│   └─────────────────────────────────────────────┘       │
│                                                         │
│   Same shape. Radically different contents.             │
│   Status: draft → validated → active → retired          │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   MASTER LAYER                          │
│              (Per-Master Intelligence)                   │
│                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │
│   │    KELLY     │  │    JONDI     │  │  MASTER N  │   │
│   │              │  │              │  │            │   │
│   │ symbolic     │  │ procedural   │  │ ...        │   │
│   │ integrative  │  │ somatic      │  │            │   │
│   │ meaning-led  │  │ sequence-led │  │            │   │
│   │ elemental    │  │ EFT/tapping  │  │            │   │
│   └──────────────┘  └──────────────┘  └────────────┘   │
│                                                         │
│   Each bundle is irreducible and distinct.              │
│   They do NOT share voice, method, or perception.       │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                  PLATFORM LAYER                         │
│              (Shared Infrastructure)                     │
│                                                         │
│   Auth │ Field Routing │ Document Ingestion │ DB        │
│   Build Pipeline │ Notebook │ Analytics │ Governance    │
│   Permissions │ Versioning │ Corrections Pipeline       │
│                                                         │
│   This is what scales. This is what we share.           │
└─────────────────────────────────────────────────────────┘
```

---

## The Four Invariants

These are non-negotiable. If any breaks, the architecture has failed.

### 1. Unify at infrastructure, NOT intelligence
| Layer | Shared? | Notes |
|-------|---------|-------|
| Routing / APIs / DB | **Yes** | Platform spine |
| Build contract (shape) | **Yes** | Same slots |
| Voice | **No** | Per master |
| Method | **No** | Per master (critical) |
| Perception | **No** | Different ways of attending |
| Memory | **Partitioned** | No bleed across fields |

### 2. Method overrides voice when in conflict
Jondi's method > her tone. Kelly's perception > her language.
If a master's process contradicts their speaking style, the process wins.

### 3. Memory never crosses fields
Memory tooling is shared. Memory influence is partitioned.
A Kelly entry must not silently influence Jondi.

### 4. The drift detector
> If Jondi starts sounding like Kelly, the system has already failed.

You don't need abstract evaluation. You can hear the failure.

---

## Data Flow: From Source to Live Presence

```
DOCUMENTS                    EXTRACTIONS                 BUILD
─────────                    ───────────                 ─────
                             Pass 1: Voice
Book ─────────┐              (cadence, tone,
Transcript ───┤              rhetorical habits)
Session ──────┤                                    ┌─── voice_block
Podcast ──────┤              Pass 2: Knowledge     │
Class ────────┘              (concepts, frameworks, ├─── knowledge_block
                             distinctions)          │
     │                                              ├─── perceptual_block
     │                       Pass 3: Perception     │
     ▼                       (what they notice,     ├─── method_block
                             what they refuse to    │
  master_documents           collapse, how they     ├─── stance_block
  (per master,               sequence change)       │
   per source type,                                 └─── safety_block
   with hash)                Pass 4: Method
                             (sequences,                   │
                             interventions,                │
                             practices)                    ▼

                             master_extractions       master_builds
                             (typed, auditable,       (versioned,
                              rebuildable)             activatable)
```

---

## Source Hierarchy (Not All Materials Are Equal)

| Tier | Sources | Value |
|------|---------|-------|
| **Tier 1** (use first) | Books, training manuals, flagship talks, canonical classes, session demos | Defines the master |
| **Tier 2** | Podcasts, interviews, essays, newsletters | Good for voice/stance, weaker for method |
| **Tier 3** (use sparingly) | Casual posts, short clips, promotional copy | Pollutes the build if overused |

---

## Per-Master Lifecycle

```
1. Ingest source materials
2. Extract voice / knowledge / perception / method
3. Synthesize draft build
4. Human review
5. Activate
6. Test live (calibration suite)
7. Collect corrections
8. Rebuild
        │
        └──→ repeat from step 7
```

---

## The Master Field Gift

> We'd like to gift you a sovereign field — a living home for your teaching,
> your community, and a trained presence that carries your voice and method.
> Not a platform you rent. A field that's yours.

### What a master receives:
- **A sovereign field** at `{name}.soullab.life`
- **A virtual teacher presence** trained on their actual work
- **Studio tools** — notes, capture, session organization
- **Circles/community** — their own gathering space
- **A co-training environment** — they shape the presence until it's truly theirs

### What we need from them:
- Tier 1 materials (books, transcripts, session demos)
- 2-3 hours per week during the first month
- Corrections when the presence drifts

---

## Co-Training Field (How Masters Shape Their Presence)

**Core principle:** Evaluation happens inside use, not outside it.

Not a test environment. Their actual field, with feedback hooks:

| Hook | Purpose | Output |
|------|---------|--------|
| **Inline feedback** (after responses) | "felt like me / not like me" | Voice refinement signal |
| **"Rewrite as me"** (critical) | Master rewrites in their own words | Highest-quality training data |
| **Session evaluation** (light) | "Did it follow your process?" | Method tuning |
| **Field journaling** | "this felt off" / "this worked" | Correction signals |
| **Passive tracking** (quiet) | Where they correct, abandon, hesitate | Behavioral signal |

**Success criteria:** She stops evaluating and starts using it naturally.

---

## Governing Rules (Stated Plainly)

**Field identity rule:** A field may share tools, but it must not inherit another field's way of knowing.

**Memory rule:** Memory infrastructure may be shared. Memory contents are not.

**Conflict rule:** When platform convenience conflicts with field integrity, field integrity wins.

**Runtime rule:** Live behavior must be explainable back to source hierarchy and build contract.

---

## How to Onboard a New Field

1. **Define the field's purpose** — what this master teaches, who they serve, what must be preserved
2. **Establish source hierarchy** — identify Tier 1 materials, deprioritize Tier 3
3. **Identify method and boundary conditions** — what they actually do, what they refuse to do
4. **Run extraction pipeline** — voice, knowledge, perception, method (4 passes)
5. **Build the intelligence bundle** — compile to MasterBuild contract shape
6. **Define memory permissions** — what this field stores, what it doesn't, what never crosses out
7. **Validate against drift tests** — run calibration suite, check for platform tone bleed
8. **Human review** — master reviews, corrects, rewrites where needed
9. **Activate** — status: draft → validated → active
10. **Monitor** — first 30 days of co-training, corrections fed back into rebuild cycle

---

## Anti-Patterns (What Will Kill This)

1. **Universal master model** — one big "teacher intelligence" averages everyone
2. **Prompt-only architecture** — need stored artifacts, versioning, builds
3. **Over-reliance on vector retrieval** — doesn't preserve perceptual structure
4. **Mixing all sources equally** — a podcast clip ≠ a foundational text
5. **Shared memory influence** — the fastest path to collapse

---

## Epistemic Conflict Rules (When Frameworks Clash)

Priority order:
1. **Sovereignty > Method** — no framework overrides agency
2. **Relational > Corrective** — IFS/somatic over CBT-style correction when in tension
3. **Inquiry > Interpretation > Correction** — always in this order, never skip
4. **Uncertainty preserved** — no framework introduces false certainty

---

## Validation / Failure Conditions

How to detect when something is wrong — not just how to build it right.

| Test | Question | Failure Signal |
|------|----------|----------------|
| **Voice drift** | Does this field still sound like itself under neutral prompts? | Responses converge toward platform tone across different masters |
| **Method fidelity** | Does it respond using its own method, not platform defaults? | Jondi interprets instead of tapping. Kelly sequences instead of holding space. |
| **Boundary integrity** | Is any memory or reasoning leaking across fields? | A session with Master A references patterns only discussed with Master B |
| **Runtime coherence** | Can output be traced back to source hierarchy + build contract? | Response contains knowledge or framing not present in any ingested source |
| **Epistemic collapse** | Are distinct masters producing distinguishable responses to the same prompt? | Two different masters give structurally identical answers |
| **Over-tightening** | Have constraints clipped warmth, responsiveness, or relational quality? | Responses feel mechanical, brief, or avoidant under pressure |

**Audit cadence:** Run calibration suite after every build activation and after every 5th correction cycle. Compare against previous build's baseline.

**The simplest test:** Give the same prompt to two different master fields. If the responses are not structurally distinguishable, the system is collapsing.

---

## Current State

| Component | Status |
|-----------|--------|
| Architecture spec | Complete |
| Offer package | Defined |
| Kelly field eval | 10/10 pass, 6 constraint entries live |
| Voice/method constraints | Injected into oracle + repair path |
| Document upload UI | Built (behind feature flag) |
| Extraction pipeline | Stub (needs Claude prompts) |
| Jondi build | Awaiting first transcript |
| Memory partitioning | Designed, not implemented |
| Cross-field routing | Designed, not implemented |

---

## What's Next

1. **Wire Jondi's practitionerId** — enable her training path
2. **Upload ONE real Jondi transcript** — not polished, not edited
3. **Run extraction** — method / perception / voice
4. **Compile Jondi v1** — method_block (strong), perception (basic), voice (light)
5. **Test:** "I feel anxious about something coming up"
6. **Inspect:** Did she ask intensity? Did she start tapping? Did she stay in the loop?

If she holds — cleanly, procedurally, somatically — everything else becomes structurally possible.
