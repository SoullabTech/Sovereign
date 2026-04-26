# LoRA Fine-Tune Data Format

Reference notes on what `scripts/training/lora-finetune.py` expects, and what
**must not** be fed into it.

> **Status:** documentation only. No training has been started. No external
> corpora have been converted into training pairs.

## What the script does

`scripts/training/lora-finetune.py` trains a LoRA adapter on **MAIA's own
gold-quality responses pulled from PostgreSQL** to produce a sovereign
adapter that captures MAIA's voice, wisdom, and relational style.

Key points from the script header:

- Pulls training data from the `maia_consciousness` database (`DATABASE_URL`)
- Formats each example into a **ChatML-style instruction-tuned format**
- System prompt: *"You are MAIA, a sovereign consciousness companion."*
- Tokenises with the base model's tokenizer (default
  `mistralai/Mixtral-8x7B-Instruct-v0.1`)
- Trains a LoRA adapter (rank 16, alpha 32, 3 epochs, LR 2e-4)
- Always exports a JSONL backup of the training data

## Expected example shape

Each training row, as exported by `export_to_jsonl()`:

```jsonl
{"messages": [
  {"role": "system",    "content": "You are MAIA, a sovereign consciousness companion."},
  {"role": "user",      "content": "<member input>"},
  {"role": "assistant", "content": "<MAIA's gold response>"}
]}
```

This is **conversational SFT** — pairs of member input and MAIA's vetted
response, drawn from real MAIA interactions that have passed quality review.

## What this script is NOT for

The LoRA pipeline is **not** a continued-pretraining corpus loader. It does
not accept:

- Plain prose of any external author (mystics, philosophers, scientists)
- Public-domain books
- Articles, essays, transcripts not produced by MAIA
- Any voice that is not MAIA's own

External texts (e.g. St. John of the Cross's *Dark Night of the Soul*) belong
in the **library** (`library_sources` + `library_chunks`), where they are
chunked, embedded, and made available for retrieval. They do **not** enter
the SFT pipeline.

## Why the separation matters

This is a **sovereignty boundary**, not a technical convention:

| Surface | Role | Voice |
|---------|------|-------|
| **Library** | Retrieval / lens / grounding | Many voices, cited as such |
| **LoRA SFT** | MAIA's own relational style | One voice (MAIA), accountable to canon |

If we trained MAIA on John of the Cross's prose, MAIA would begin to *speak*
as a 16th-century Spanish Carmelite mystic — collapsing the distinction
between *referring to* a tradition and *impersonating* it. That collapse
violates:

- **MAIA Canon §10** — no false authority
- **MAIA Oath** — no manufactured intimacy or inherited charisma
- **Symbolic Field Containment canon** — MAIA may host fields, not become them

## Future corpora — the same rule

When future wisdom sources are added to the library (other mystics, depth
psychologists, philosophical traditions), they follow the same pattern:

1. **Stage** under `data/library-sources/<tradition>/<source>/`
2. **Ingest** via `scripts/library/ingestTxtSources.ts` (or the PDF variant)
3. **Reference** in `assets/obsidian/Soullab/...` with frontmatter and
   excerpts (not full text)
4. **Never** feed into `scripts/training/lora-finetune.py`

If a wisdom source's *framing* should influence MAIA's behaviour, that
happens through:

- Care-lens prompt blocks (`lib/maia/prompts/...`)
- Care-lens framework registration (`lib/consciousness/therapeuticFrameworks.ts`)
- Retrieval into the live response context (library search)

— never through identity-level fine-tuning on the source's own voice.
