# John of the Cross — Library Staging

Three primary-source texts staged for ingestion into MAIA's library
(`library_sources` / `library_chunks`).

## Files

| File | Author | Source-type |
|------|--------|-------------|
| `Dark Night of the Soul.txt` | St. John of the Cross | Primary text |
| `Saint John of the Cross - Paschasius (1919).txt` | Fr. Paschasius Heriz, O.C.D. | Biography |
| `Complete Works Volume 1.txt` | St. John of the Cross (tr. E. Allison Peers) | Primary text |

## Ingest

```bash
npx tsx scripts/library/ingestTxtSources.ts \
  --path data/library-sources/mystics/john-of-the-cross
```

Add `--dry-run` first to confirm chunk counts and titles.

The ingest script:
- Chunks each text (~1000 chars, paragraph/sentence-aware breaks, 100-char overlap)
- Computes SHA-256 checksums (re-runs are idempotent)
- Writes to `library_sources` (one row per file) and `library_chunks` (many per file)
- Generates embeddings via `libraryService.generateChunkEmbeddings`

## Classification

These are **wisdom-source / lens corpus** material:

- ✅ Retrieval, symbolic grounding, apophatic discernment
- ✅ Care-lens vocabulary (Christian mysticism strand)
- ❌ Style cloning / voice imitation
- ❌ SFT / instruction-pair conversion
- ❌ Chat-template fine-tuning data

See the LoRA training format note at:
`docs/training/lora-finetune-data-format.md` (LoRA expects MAIA's own gold
DB-stored responses in ChatML format — not external corpora).

## Companion Obsidian notes

`assets/obsidian/Soullab/Mystics/Christian/John of the Cross/`
- `_index.md` — folder overview + use-boundary
- `Dark Night of the Soul.md`
- `Saint John of the Cross — Paschasius (1919).md`
- `Complete Works Volume 1.md`
