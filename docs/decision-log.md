# Decision Log

> Prevents re-deciding things. Every model reads this for context.

## Format

```
### YYYY-MM-DD — [short title]
Decision:
Why:
Implication:
Reversible: Y/N
```

---

### 2026-02-11 — Local-first AI development

**Decision:** Default all development to local Ollama models (Qwen3-Coder 30B). Cloud Claude reserved for architecture, debugging, security.

**Why:** $200/month is unsustainable. Local models handle 70-90% of daily work. AIN context compensates for model capability gap.

**Implication:** Development speed may vary. R&D log tracks where local fails. Cloud is metered, not abandoned.

**Reversible:** Yes — `maia-cloud-now` available anytime.

---

### 2026-02-11 — Model storage on T7 Shield SSD

**Decision:** Ollama models stored on T7 Shield external SSD via symlink, not internal drive.

**Why:** 134GB internal free vs 1.6TB on T7. Models are ~20GB each. SSD speed (592 MB/s) means acceptable cold starts.

**Implication:** T7 Shield must be connected for local AI to work. OLLAMA_KEEP_ALIVE=24h minimizes cold starts.

**Reversible:** Yes — move symlink back to internal if needed.

---

### 2026-02-11 — AIN as development constitution

**Decision:** Created maia-dev-mind.md as the cognitive environment prepended to all model sessions.

**Why:** Intelligence quality comes from coherence of context, not raw model power. A 30B model inside AIN context performs closer to frontier models for Soullab-specific work.

**Implication:** When local model output drifts, fix the context before switching models. This is the core AIN research hypothesis.

**Reversible:** N/A — additive, no downside.
