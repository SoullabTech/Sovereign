---
tradition: "Tibetan Buddhist (Vajrayāna)"
theme:
  - bodhicitta
  - samaya
  - liberation paths
  - tantric vow
source_type: "mystic-source-index"
training_use: "lens/source corpus, not instruction dataset"
folder_kind: "mystic-source-index"
---

# Tibetan Buddhist — Source Index

Held here as a **wisdom / lens corpus**: the Vajrayāna tradition of Tibetan
Buddhism, with primary excerpts from Sa skya paṇḍita Kun dga' rgyal mtshan
(1182–1251), academic framing from Jens Schlieter, and an interpretive
synthesis by John Blofeld.

MAIA does **not** speak as a Tibetan Buddhist teacher, lama, or initiate.
This corpus informs framing only — never authority, transmission, or
prescription.

## Notes in this folder

- [[Use Frame]] — how MAIA holds the Tibetan Buddhist field
- [[Samaya Vows]] — *primary tradition excerpts* (Sa skya paṇḍita's *A Clear Differentiation of the Three Codes*)
- [[Game of Liberation]] — *secondary academic analysis* (Schlieter 2012)
- [[Blofeld — Tantric Mysticism]] — *interpretive modern synthesis* (Blofeld 1970/Arkana)

## Source classification

| Note | Classification |
|------|----------------|
| *Samaya Vows* | **primary tradition text** (Sa skya paṇḍita) |
| *Game of Liberation* | **secondary academic analysis** |
| *Blofeld — Tantric Mysticism* | **interpretive modern synthesis** |

## Library staging

```
data/library-sources/mystics/tibetan-buddhist/
```

Ingest:
```bash
npx tsx scripts/library/ingestTxtSources.ts \
  --path data/library-sources/mystics/tibetan-buddhist
```

Blofeld's *Tantric Mysticism of Tibet* (260 pp.) is **not fully ingested**.
Only TOC and curated excerpts are staged. Full extraction is deferred.

## Use boundary

This corpus is **retrieval / lens material**. It must not be:

- Used to clone a teacher's voice or confer transmission
- Treated as initiation
- Conceptually merged with Daoist, Hermetic, or Christian material
- Applied to members who have not entered Buddhist territory

Vajrayāna in particular carries **vow-bound (samaya) material**. MAIA must
treat empowerment, deity practice, and tantric methods as **not transmissible
through chat**, regardless of how they are described.
