# Sacred Source Integrity Policy

**Status:** Constitutional policy (governs all implementation)
**Domain:** Sacred Learning Domain within MAIA
**Date:** 2026-04-01

---

## Purpose

This policy defines how sacred and contemplative Islamic material is handled in software. It is binding on all code, content, and AI behavior within the Sacred Learning Domain.

This is not an ethics statement. It is an engineering specification.

---

## 1. Authority Hierarchy

All content in the Sacred Learning Domain belongs to exactly one authority level. Levels are never merged, blended, or implied to be equivalent.

| Level | Type | Example | Display Rule |
|---|---|---|---|
| **1 — Revelation** | Qur'anic text (Arabic + translation) | Surah Al-Fatiha | Always primary. Never subordinated. Always shows Arabic + translation + surah:ayah reference |
| **2 — Exegesis** | Classical tafsir, scholarly commentary | Ibn Kathir on 2:255 | Always attributed to author + work. Never presented as the text itself |
| **3 — Mystical** | Classical mystical/metaphysical reflection | Ibn al-'Arabi, Fusus al-Hikam | Always attributed. Always labeled as interpretive, not doctrinal |
| **4 — Contemplative** | Poetry, contemplative literature | Rumi, Masnavi | Always attributed. Never presented as scripture or doctrine |
| **5 — Reflection** | Member's own journaling and reflection | Personal journal entry | Always labeled as personal. Never mixed with source material |
| **6 — Synthesis** | AI-generated study aids, questions, connections | "Consider how..." | Always labeled as AI-composed. Never adjacent to Level 1 without clear separation |

### Hierarchy rules

- Higher levels are never subordinated to lower levels in layout, emphasis, or retrieval ranking.
- Level 1 content is always visually distinguished from all other levels.
- Level 6 content is always explicitly marked and visually separated from Levels 1-4.
- Levels are never blended in a single text block without per-sentence attribution.
- No level ever borrows the visual treatment or authority signaling of a higher level.

---

## 2. Provenance Requirements

Every piece of content must carry:

### Level 1 (Qur'an)
- Surah name (Arabic + transliteration)
- Surah number
- Ayah number(s)
- Arabic text source/edition
- Translation author
- Translation edition/year

### Level 2 (Tafsir)
- Author name
- Work title
- Volume/section (if applicable)
- Passage reference (which ayah is being commented on)
- Edition or translation used
- Translator (if translated)

### Level 3 (Mystical)
- Author name
- Work title
- Chapter/section
- Edition or translation used
- Translator (if translated)
- Note: "Interpretive reflection, not doctrinal commentary"

### Level 4 (Contemplative)
- Author name
- Work title
- Poem/section identifier
- Translator
- Translation edition/year

### Level 5 (Reflection)
- Member ID (internal only)
- Timestamp
- Linked passage ID (if responding to a specific passage)

### Level 6 (Synthesis)
- Generation timestamp
- Model used (if applicable)
- Source passages referenced
- Label: "AI-composed"

### Provenance data model

```typescript
interface SourceProvenance {
  authorityLevel: 1 | 2 | 3 | 4 | 5 | 6;
  author?: string;
  work?: string;
  section?: string;           // surah:ayah, chapter, poem number
  translator?: string;
  translationEdition?: string;
  sourceEdition?: string;
  arabicTextSource?: string;  // Level 1 only
  generatedBy?: string;       // Level 6 only
  generatedAt?: string;       // Level 6 only
  reviewStatus: 'unreviewed' | 'reviewed' | 'approved' | 'flagged';
  reviewedBy?: string;
  reviewedAt?: string;
}
```

---

## 3. Labeling Rules

### UI labels (user-facing)

Every content block shown to the user carries a visible label. Labels use consistent language:

| Level | Label format | Example |
|---|---|---|
| 1 | `Qur'an — [Surah Name] [#:##]` | "Qur'an — Al-Baqarah 2:255" |
| 2 | `Tafsir — [Author]` | "Tafsir — Ibn Kathir" |
| 3 | `Mystical Commentary — [Author]` | "Mystical Commentary — Ibn al-'Arabi" |
| 4 | `Contemplative — [Author]` | "Contemplative — Rumi (tr. Nicholson)" |
| 5 | `Your Reflection` | "Your Reflection" |
| 6 | `Study Aid (AI-composed)` | "Study Aid (AI-composed)" |

### Label placement

- Labels appear **above** the content block, not below or in footnotes.
- Labels are always visible, never hidden behind a toggle or hover state.
- Labels use a consistent visual treatment (color, typography, icon) per authority level.

### Label colors (recommended)

| Level | Color intent |
|---|---|
| 1 | Gold / amber — sacred, primary |
| 2 | Deep blue — scholarly, grounded |
| 3 | Purple — mystical, interpretive |
| 4 | Teal / green — contemplative, poetic |
| 5 | Warm gray — personal, human |
| 6 | Light gray with border — AI, secondary |

---

## 4. AI Behavior Constraints

When the oracle operates in sacred-learning mode, these constraints apply in addition to all existing MAIA oracle constraints.

### The AI must:

1. **Cite sources** — Every factual or interpretive claim must reference a specific source by author, work, and section.
2. **Label its own contributions** — Any AI-composed text (questions, connections, summaries, practice invitations) must be explicitly marked.
3. **Preserve hierarchy** — Never present its own synthesis as equivalent to or better than source material.
4. **Use humility language** — Phrases like "one reading suggests," "this passage has been understood as," "scholars have noted" — never "this means" or "the truth is."
5. **Acknowledge plurality** — When interpretations differ, say so. Never present one interpretation as the only valid one.
6. **Redirect doctrinal questions** — When asked "what does Islam say about X?" or "is X halal/haram?", redirect to scholarly sources rather than generating an answer. Example: "That's a question best explored with a qualified scholar. Here are some relevant passages and classical perspectives..."
7. **Respect silence** — Not every passage needs extensive commentary. Sometimes the invitation is simply to sit with the text.

### The AI must not:

1. **Generate fake citations** — Never fabricate a source, author, or reference.
2. **Claim authority** — Never present itself as a scholar, shaykh, mufti, or religious authority.
3. **Issue rulings** — Never make halal/haram determinations or fatwa-like statements.
4. **Synthesize doctrine** — Never combine sources to produce novel theological positions.
5. **Universalize** — Never flatten Islamic material into "all paths are one" or "all religions say the same thing" language.
6. **Decontextualize** — Never extract a single ayah or line and use it to support a point without noting its context.
7. **Romanticize** — Never treat sacred material as aesthetic content divorced from its tradition, practice, and community.
8. **Simulate devotion** — Never pretend to pray, worship, or have a spiritual experience.

---

## 5. Editorial Review Rules

### Before serving

All seed corpus content must be reviewed before being served to members.

Review checklist per passage:

- [ ] Source text verified against authoritative edition
- [ ] Translation verified against credited translator's published work
- [ ] Attribution complete (author, work, section, translator, edition)
- [ ] Authority level correctly assigned
- [ ] No decontextualization (passage makes sense without surrounding text, or context is provided)
- [ ] No sectarian bias in selection (or bias is acknowledged)
- [ ] No sensitivity flags triggered (see Section 7)
- [ ] Thematic tags appropriate
- [ ] Connected commentary relevant to the passage (not forced)

### Review status

Every content record carries a `review_status`:

- `unreviewed` — Ingested but not yet reviewed. **Never served to members.**
- `reviewed` — Reviewed by a curator. May be served.
- `approved` — Reviewed and explicitly approved by domain lead. Preferred for daily encounters.
- `flagged` — Flagged for concern. **Never served to members.** Requires resolution.

### Who reviews

Phase 1 (MVP): The founder/domain lead reviews all seed content personally.
Phase 2+: Define a small editorial board with Islamic studies background.

---

## 6. Content Handling Risks

### Risk: Flattening

**What it looks like:** Presenting a Rumi poem, a Qur'anic ayah, and an AI reflection in the same visual container with no distinction.

**Prevention:** Authority labels are mandatory and cannot be disabled. Layout enforces visual separation between levels.

### Risk: False equivalence

**What it looks like:** "The Qur'an says X, and Rumi also says X, and so we can see that..."

**Prevention:** AI behavior constraint #3 (preserve hierarchy). The system presents sources in order but does not synthesize them into unified conclusions.

### Risk: Decontextualization

**What it looks like:** A single ayah pulled out and used as a "wisdom quote" without any context about its revelation circumstances, surrounding verses, or scholarly discussion.

**Prevention:** Every Qur'anic passage includes at minimum: surah name, ayah range, and a brief contextual note. Tafsir layer is always available (even if not always expanded by default).

### Risk: Syncretic blur

**What it looks like:** "Ibn al-'Arabi's concept of wahdat al-wujud is essentially the same as Buddhist emptiness and Christian mystical union."

**Prevention:** AI behavior constraint #5 (acknowledge plurality without universalizing). Cross-tradition comparisons require explicit framing and are never generated automatically.

### Risk: AI overclaiming

**What it looks like:** AI-generated summary presented in the same font, color, and layout as scholarly commentary.

**Prevention:** Level 6 content always carries distinct visual treatment (lighter color, border, explicit label). Never uses the same typography as Levels 1-4.

### Risk: Aesthetic consumption

**What it looks like:** Beautiful Arabic calligraphy + Rumi quote + ambient background = spiritual ASMR with no depth.

**Prevention:** The system always includes study layers (exegesis, context) alongside contemplative material. Beauty is welcome; superficiality is not. Practice invitations orient toward embodied action, not passive consumption.

---

## 7. Sensitivity Flags

Certain topics require additional care:

| Flag | Trigger | Handling |
|---|---|---|
| `SECTARIAN` | Content that is distinctly Sunni, Shia, or school-specific | Label the perspective. Do not present as universal |
| `CONTESTED` | Interpretation that is actively debated among scholars | Note the debate. Present multiple views if possible |
| `GENDER` | Passages or commentary touching gender roles | Include scholarly context. Note plurality of interpretation |
| `VIOLENCE` | Passages related to conflict, punishment, or warfare | Always include full context. Never excerpt without surrounding verses |
| `ESOTERIC` | Mystical content that may be unfamiliar or challenging | Provide grounding context. Note that this is interpretive, not doctrinal |
| `AUTHORITY` | Content that could be misread as the system making religious claims | Double-check AI behavior constraints. Ensure attribution is explicit |

Flagged content is not necessarily excluded — it requires more careful contextualization and labeling.

---

## 8. Retrieval Rules

When the retrieval system assembles content for display:

1. **Qur'an first** — If a passage view includes Qur'anic text, it is always the primary element.
2. **Commentary follows source** — Tafsir and mystical commentary are always presented in response to a specific source passage, never freestanding.
3. **Poetry is optional enrichment** — Contemplative poetry (Level 4) is never the primary content in a study view. It enriches; it does not lead.
4. **AI synthesis is last** — AI-generated prompts, questions, and connections appear after all source material, clearly separated.
5. **Provenance is non-negotiable** — Content without complete provenance is not served. If provenance is incomplete, the content is flagged for review.

---

## 9. Data Rules

### Storage

- Sacred text content is stored in the same PostgreSQL database as all MAIA data.
- Arabic text is stored in UTF-8. No transliteration substitution.
- Source provenance is stored as structured data (not embedded in text blobs).
- Member reflections linked to passages maintain referential integrity via FK.

### Access

- Sacred content is available to all members (no paywall on scripture or classical commentary).
- AI-enhanced features (adaptive selection, thematic connections) may be gated by membership tier.
- Member reflections are private to the member. No aggregation, no training data, no sharing.

### Deletion

- Members can delete their own reflections at any time.
- Members can request full data export of their sacred learning history.
- Sanctuary Mode applies: sacred reflections created in Sanctuary are never stored.

---

## 10. Implementation Checklist

Before any sacred learning feature ships:

- [ ] All content carries authority-level labels
- [ ] All content carries complete provenance metadata
- [ ] All content has passed editorial review (`approved` status)
- [ ] AI-generated content is visually distinct from source material
- [ ] AI behavior constraints are enforced in the oracle lens prompt
- [ ] Sensitivity flags have been checked for all seed content
- [ ] Sanctuary Mode is respected for sacred reflections
- [ ] No Qur'anic text is presented without surah:ayah reference
- [ ] No commentary is presented without author + work attribution
- [ ] No AI synthesis is presented without "AI-composed" label
- [ ] Feature flag gates all sacred learning surfaces
- [ ] Retrieval ranking respects authority hierarchy

---

## Governing Principle

> The system serves the encounter between the person and the source.
> It does not replace the source, interpret the source, or become the source.
> It holds the space. The person does the work.

This principle is not decorative. It is a design constraint that governs every implementation decision.
