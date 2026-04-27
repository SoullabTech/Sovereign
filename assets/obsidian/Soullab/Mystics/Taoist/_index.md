---
tradition: "Taoist (Daoist)"
theme:
  - wu wei
  - five precepts
  - flow
  - non-coercion
  - inner alchemy
source_type: "mystic-source-index"
training_use: "lens/source corpus, not instruction dataset"
folder_kind: "mystic-source-index"
---

# Taoist — Source Index

A composite folder for classical and modern Taoist (Daoist) sources held by
MAIA as a **wisdom / lens corpus**. The tradition is ancient (Lao Tzu, *Tao Te
Ching*; the *Zhuangzi*; the Celestial Masters and later Daoist canon) and
remains living through transmitted lineages of inner alchemy (*neidan*),
medical Qi Gong, and ritual.

## Why this is in MAIA's library

The Taoist field is held here for its discernment of **non-coerced action
(wu wei)**, **harmony with what is moving**, and **moral conduct as alignment
with the natural order**, rather than as a bag of techniques.

MAIA does **not** speak as a Daoist priest, *daoshi*, or lineage-holder. These
texts inform retrieval, framing, and symbolic vocabulary — never authority,
prescription, or initiation.

When a member's language touches **forcing, over-control, exhaustion from
striving, struggle against what is**, the Taoist field may be drawn upon for
**framing**. It must not be applied to members who have not entered that field.

## Notes in this folder

- [[Use Frame]] — how MAIA holds the Taoist field
- [[Five Precepts]] — *primary tradition excerpt* (五戒, from the *Ultra Supreme Elder Lord's Scripture of Precepts*)
- [[Wu Wei]] — *primary concept* (Tao Te Ching, with framing notes)
- [[Kohn — Cosmos and Community]] — *secondary academic analysis* (Livia Kohn, 2004) — Ten Precepts and ethical architecture

## Source classification (visible at every layer)

| Note | Classification |
|------|----------------|
| *Five Precepts* | **primary tradition text** |
| *Wu Wei* | **primary tradition text** |
| *Kohn — Cosmos and Community* | **secondary academic analysis** |

A modern retreat-brochure (Mantak Chia & David Twicken, 2012) is referenced
but not staged as a library source — it is a marketing document, not a text.

## Library staging

Source files staged at:
```
data/library-sources/mystics/taoist/
```

To ingest into the live library:
```bash
npx tsx scripts/library/ingestTxtSources.ts \
  --path data/library-sources/mystics/taoist
```

(Run with `--dry-run` first.)

## Use boundary

This corpus is **retrieval / lens material**. It must not be:

- Converted into SFT or chat-pair training data
- Used to clone a Daoist priest's voice
- Quoted as authority over a member's lived experience
- Applied to members who have not entered Taoist territory
- **Conceptually merged with Buddhist, Hermetic, or Christian material** —
  resonance may be noticed, but never collapsed into "the same thing."

It may be:

- Retrieved when a member's language touches *flow / forcing / non-coercion / striving / harmony with movement*
- Cited as a framing reference, gently and provisionally
- Used to build symbolic vocabulary in the practitioner / care-lens layer

## Related canon

- `docs/canon/use-frames/USE_FRAME_ACTIVATION.md`
- Memory: *Symbolic Field Containment*; *Multi-Tradition Field Architecture*
