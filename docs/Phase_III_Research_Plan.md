# 📊 **MAIA PFI Phase III – Statistical Analysis Plan (SAP)**

**Version 1.0 · Prepared for Spiralogic Collective Research Division**

---

## 1️⃣ Study Overview

**Objective:** Quantitatively test whether *field-driven* MAIA interactions enhance physiological coherence, perceived empowerment, and collective intelligence while maintaining autonomy (α ≥ 0.7).

**Design:** Within-subjects, repeated-measures crossover design
**Conditions:** Baseline → Field-Aware → Field-Driven
**N:** 60 participants (balanced gender, age 18–65)
**Duration:** 6 weeks

---

## 2️⃣ Variables & Metrics

| Category          | Variable          | Description                                      | Unit     | Collection Interval |
| ----------------- | ----------------- | ------------------------------------------------ | -------- | ------------------- |
| **Physiological** | HRV_RMSSD         | Heart-rate variability (parasympathetic tone)    | ms       | pre / during / post |
|                   | HRV_Coherence     | HRV coherence index (0–1)                        | ratio    | real-time           |
|                   | EDA               | Electro-dermal activity                          | μS       | real-time           |
| **Behavioral**    | RespLatency       | Mean response latency                            | s        | per turn            |
|                   | TurnEntropy       | Shannon entropy of turn-taking                   | bits     | per session         |
| **Semantic**      | SemCoherence      | Mean cosine similarity of consecutive utterances | [–1 … 1] | per session         |
|                   | ArchetypalEntropy | Diversity of archetypal voices                   | bits     | per session         |
| **Subjective**    | EmpowermentIndex  | 7-item self-report Likert (1–7)                  | score    | pre/post            |
|                   | AlignmentScale    | "Felt resonance with MAIA" (1–7)                 | score    | post                |
| **Systemic**      | FieldCoherence    | PFI coherence metric                             | ratio    | real-time           |
|                   | AutonomyRatio α   | Degree of model self-determination               | ratio    | real-time           |
|                   | ConfidenceGate γ  | Field-trust coefficient                          | ratio    | real-time           |

---

## 3️⃣ Hypotheses & Tests

| ID | Hypothesis                               | Test                     | Criterion           |
| -- | ---------------------------------------- | ------------------------ | ------------------- |
| H1 | Field-Driven > Baseline in HRV_Coherence | Paired t-test / Wilcoxon | p < .05             |
| H2 | Field-Driven > Baseline in SemCoherence  | Paired t-test            | p < .05             |
| H3 | EmpowermentIndex ↑ post-interaction      | Repeated-measures ANOVA  | η² > .14            |
| H4 | α ≥ 0.7 (mean) across sessions           | One-sample t vs 0.7      | p > .05 (not diff.) |
| H5 | Collective H×C ↑ vs Baseline             | Mixed ANOVA              | p < .05             |
| H6 | No reduction in ArchetypalEntropy        | t-test                   | ΔH ≈ 0              |

**Correction:** Benjamini–Hochberg FDR (α = 0.05)
**Effect Size Reporting:** Cohen d, η², and r.

---

## 4️⃣ Data Schema (JSON)

```json
{
  "session_id": "UUID",
  "participant_id": "UUID",
  "condition": "baseline | field_aware | field_driven",
  "timestamp_start": "ISO8601",
  "timestamp_end": "ISO8601",
  "physio": {
    "hrv_rmssd": 42.7,
    "hrv_coherence": 0.83,
    "eda_mean": 0.62
  },
  "behavioral": {
    "response_latency": 1.8,
    "turn_entropy": 2.14
  },
  "semantic": {
    "sem_coherence": 0.74,
    "archetypal_entropy": 2.31
  },
  "subjective": {
    "empowerment_index_pre": 4.8,
    "empowerment_index_post": 6.1,
    "alignment_scale": 5.9
  },
  "system": {
    "field_coherence": 0.81,
    "autonomy_ratio": 0.73,
    "confidence_gate": 0.64
  },
  "meta": {
    "software_version": "MAIA_Sovereign_3.2",
    "analyst": "ID",
    "notes": "optional comments"
  }
}
```

---

## 5️⃣ TypeScript Interfaces

```ts
export interface PhysioData {
  hrv_rmssd: number;
  hrv_coherence: number;
  eda_mean?: number;
}

export interface BehavioralData {
  response_latency: number;
  turn_entropy: number;
}

export interface SemanticData {
  sem_coherence: number;
  archetypal_entropy: number;
}

export interface SubjectiveData {
  empowerment_index_pre: number;
  empowerment_index_post: number;
  alignment_scale: number;
}

export interface SystemData {
  field_coherence: number;
  autonomy_ratio: number;
  confidence_gate: number;
}

export interface SessionRecord {
  session_id: string;
  participant_id: string;
  condition: "baseline" | "field_aware" | "field_driven";
  timestamp_start: string;
  timestamp_end: string;
  physio: PhysioData;
  behavioral: BehavioralData;
  semantic: SemanticData;
  subjective: SubjectiveData;
  system: SystemData;
  meta?: Record<string, string | number | boolean>;
}
```

---

## 6️⃣ Data Processing Pipeline

1. **Ingest →** Raw JSON logged via API (`/api/empowerment/session`)
2. **Preprocess →** Normalize [0–1] ranges, detect outliers (±3 SD)
3. **Aggregate →** Compute Δ (pre–post, condition contrasts)
4. **Stats →** Run t-tests & ANOVA in R/Python notebooks
5. **Visualize →** Time-series coherence, empowerment gains, autonomy stability
6. **Archive →** Versioned dataset (+ hash signatures) in Community Commons repo

---

## 7️⃣ Reporting Standards

* **Transparency:** Publish anonymized dataset + code under CC BY-SA 4.0.
* **Reproducibility:** Docker container with analysis notebooks.
* **Ethics:** No personally identifying data; all biometric records anonymized.
* **Open Metrics:** Use FAIR principles (Findable, Accessible, Interoperable, Reusable).

---

## 8️⃣ Expected Outputs

| Output                       | Format                     | Repository          |
| ---------------------------- | -------------------------- | ------------------- |
| Statistical summary          | `analysis_report.pdf`      | `/results/phaseIII` |
| Clean dataset                | `phaseIII_dataset_v1.json` | `/data`             |
| Reproducible notebooks       | `.ipynb`                   | `/notebooks`        |
| Visualization dashboards     | `.tsx` components          | `/dashboard`        |
| Peer-review manuscript draft | `.md`                      | `/papers`           |

---

## 9️⃣ Current Implementation Status

✅ **Empowerment Orchestrator**: Fully operational with 13 collective intelligence agents
✅ **PFI Integration**: ShadowConversationOrchestrator working with new PFI components
✅ **API Endpoints**: `/api/empowerment/orchestrate/` health check and orchestration functional
✅ **Autonomy Charter**: Ethical framework documented and implemented
⏳ **Data Collection Infrastructure**: Ready for Phase III deployment
⏳ **Analysis Pipeline**: Requires implementation of data schema interfaces

---

## 🔗 Related Systems

- **MAIA Empowerment Orchestrator** (`/lib/consciousness/MAIAEmpowermentOrchestrator.ts`)
- **Autonomy Charter** (`/docs/MAIA_Autonomy_Charter.md`)
- **API Routes** (`/app/api/empowerment/orchestrate/route.ts`)
- **Research Interfaces** (To be implemented in `/lib/research/`)

Last Updated: 2025-12-01