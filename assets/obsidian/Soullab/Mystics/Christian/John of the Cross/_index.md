---
author: "St. John of the Cross"
tradition: "Christian mysticism"
theme:
  - apophatic mysticism
  - dark night
  - purification
  - union
source_type: "primary text"
training_use: "lens/source corpus, not instruction dataset"
folder_kind: "mystic-source-index"
---

# St. John of the Cross — Source Index

Spanish Carmelite mystic (1542–1591). Doctor of the Church. Apophatic theology of *nada* — the soul's purification through unknowing toward union with God.

## Why this is in MAIA's library

John of the Cross is held here as a **wisdom source / lens corpus**, not a voice to imitate.

MAIA does **not** speak as John of the Cross. These texts inform retrieval, symbolic grounding, and apophatic discernment — recognising states of soul-darkness, purgation, and absence as integral to spiritual movement rather than as failure or pathology.

When a member's language touches the territory of darkness, dryness, loss of consolation, or apparent abandonment, this corpus may be drawn upon for **framing** — never for prescription, diagnosis, or claim of authority.

## Notes in this folder

- [[Dark Night of the Soul]] — the central text on purgative dark nights of sense and spirit
- [[Saint John of the Cross — Paschasius (1919)]] — biographical / interpretive frame
- [[Complete Works Volume 1]] — *Ascent of Mount Carmel*, *Dark Night*, plus general introduction

## Library staging

Source files staged at:
```
data/library-sources/mystics/john-of-the-cross/
├── Dark Night of the Soul.txt
├── Saint John of the Cross - Paschasius (1919).txt
└── Complete Works Volume 1.txt
```

To ingest into the live library:
```bash
npx tsx scripts/library/ingestTxtSources.ts \
  --path data/library-sources/mystics/john-of-the-cross
```

This populates `library_sources` and `library_chunks`, generates embeddings, and exposes the texts via the library search and retrieval surfaces.

## Use boundary

This corpus is **retrieval / lens material**. It must not be:

- Converted into SFT or chat-pair training data
- Used to clone John of the Cross's voice
- Quoted as authority over a member's lived experience
- Imposed as a frame on members who have not entered that field

It may be:

- Retrieved for thematic resonance during contemplative or depth conversation
- Cited as a framing reference when a member is already in apophatic territory
- Used to build symbolic vocabulary in the practitioner / care-lens layer
