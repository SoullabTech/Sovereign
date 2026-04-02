# Sacred Learning Domain — Seed Corpus Plan

**Status:** Pre-curation
**Date:** 2026-04-01

---

## Principle

Start small and strong. 20-30 passages that demonstrate the full structure. Mass ingestion comes later.

The seed corpus must prove:
1. Source authority hierarchy works in practice
2. Commentary layers add genuine depth
3. Contemplative resonance enriches without flattening
4. The daily encounter flow holds together
5. Provenance is complete and verifiable

---

## Launch Themes (4 themes, ~7 passages each)

### Theme 1: Remembrance (Dhikr)

The practice of remembering — what it means to remember God, to be remembered, to return to awareness.

**Qur'anic passages:**
| Ayah | Topic |
|---|---|
| 2:152 | "Remember Me and I will remember you" |
| 13:28 | "In the remembrance of God hearts find rest" |
| 29:45 | "Prayer restrains from shameful and unjust deeds, and remembrance of God is greater" |
| 33:41-42 | "Remember God with much remembrance" |
| 73:8 | "Remember the name of your Lord and devote yourself wholeheartedly" |
| 87:14-15 | "Successful is the one who purifies themselves and remembers the name of their Lord" |
| 2:198 | "Remember God at the Sacred Monument" |

**Why this theme first:** Dhikr is foundational. It crosses Sunni/Shia/Sufi boundaries. It is practice-oriented. It naturally invites contemplation.

### Theme 2: The Heart (Qalb)

The heart as the organ of perception, the seat of understanding, the place where knowledge becomes wisdom.

**Qur'anic passages:**
| Ayah | Topic |
|---|---|
| 22:46 | "Hearts by which to understand" |
| 50:37 | "A reminder for whoever has a heart" |
| 2:225 | "God takes you to account for what your hearts have earned" |
| 26:89 | "The Day when neither wealth nor children will benefit, except one who comes to God with a sound heart" |
| 8:24 | "God comes between a person and their heart" |
| 57:16 | "Has the time not come for those who believe that their hearts should be humbled?" |
| 39:22 | "Is one whose heart God has opened to Islam..." |

**Why this theme:** The heart is the central metaphor across Islamic contemplative traditions. Ibn al-'Arabi and Rumi both extensively develop qalb theology.

### Theme 3: Light and Seeing (Nur)

Light as metaphor for guidance, knowledge, and divine presence.

**Qur'anic passages:**
| Ayah | Topic |
|---|---|
| 24:35 | The Light Verse (Ayat an-Nur) — "God is the Light of the heavens and the earth" |
| 6:122 | "Is one who was dead and We gave them life and made for them light..." |
| 57:28 | "He will give you a double portion of His mercy and will make for you a light by which to walk" |
| 39:69 | "The earth will shine with the light of its Lord" |
| 2:257 | "God is the protector of those who believe — He brings them out of darkness into light" |
| 14:1 | "A Book which We have revealed to you that you might bring people out of darkness into light" |

**Why this theme:** The Light Verse is one of the most contemplated passages in Islamic mysticism. Natural entry point for Ibn al-'Arabi's metaphysics.

### Theme 4: Trust and Surrender (Tawakkul)

Reliance on God, letting go, the relationship between effort and trust.

**Qur'anic passages:**
| Ayah | Topic |
|---|---|
| 3:159 | "When you have decided, put your trust in God" |
| 65:3 | "Whoever puts their trust in God — He is sufficient for them" |
| 12:67 | "Judgment belongs only to God — in Him I have put my trust" |
| 8:2 | "The believers are those whose hearts tremble when God is mentioned... and upon their Lord they rely" |
| 9:51 | "Nothing will happen to us except what God has decreed for us" |
| 11:123 | "To God belongs the unseen of the heavens and earth, and to Him all matters are returned" |

**Why this theme:** Directly maps to sovereignty and agency — the core MAIA concern. Trust/surrender is not passivity; it is a mature relationship with uncertainty.

---

## Commentary Layer Sources

### Tafsir (Level 2)

**Primary:** Ibn Kathir, Tafsir al-Qur'an al-Azim
- Most widely accepted classical tafsir
- Available in reliable English translations
- Relatively accessible language

**Secondary (Phase 2):** Al-Tabari, Jami al-Bayan
- Earliest comprehensive tafsir
- More scholarly, historical context

### Mystical Commentary (Level 3)

**Primary:** Ibn al-'Arabi
- Fusus al-Hikam (Bezels of Wisdom) — for passages with direct fusus commentary
- al-Futuhat al-Makkiyya (Meccan Revelations) — for broader metaphysical reflection
- Translations: Chittick, Austin, or Dagli (specify per excerpt)

**Secondary:** Al-Qushayri, Lata'if al-Isharat
- Classical Sufi tafsir
- More accessible than Ibn al-'Arabi
- Good bridge between exegesis and mysticism

### Contemplative Poetry (Level 4)

**Primary:** Rumi
- Masnavi-i Ma'navi — for passages with relevant narrative/reflection
- Divan-i Shams-i Tabrizi — for lyrical resonance
- Translations: Nicholson (scholarly) or Arberry (literary). NOT Barks (too free, loses Islamic context)

**Secondary (Phase 2):** Hafiz, Attar, Rabia al-Adawiyya

---

## Seed Data Format

Each passage set is stored as a JSON file per theme:

```json
{
  "theme": {
    "id": "remembrance",
    "name": "Remembrance (Dhikr)",
    "description": "The practice of remembering...",
    "arabicTerm": "ذكر",
    "order": 1
  },
  "passages": [
    {
      "id": "quran-2-152",
      "source": {
        "authorityLevel": 1,
        "work": "Qur'an",
        "surah": "Al-Baqarah",
        "surahNumber": 2,
        "ayahStart": 152,
        "ayahEnd": 152,
        "arabicEdition": "Uthmani script (Medina Mushaf)",
        "reviewStatus": "approved"
      },
      "arabic": "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
      "translations": [
        {
          "translator": "M.A.S. Abdel Haleem",
          "edition": "Oxford University Press, 2004",
          "text": "So remember Me; I will remember you. Be thankful to Me, and never ungrateful."
        }
      ],
      "contextNote": "This ayah comes in the context of the change of qiblah...",
      "commentary": [
        {
          "authorityLevel": 2,
          "author": "Ibn Kathir",
          "work": "Tafsir al-Qur'an al-Azim",
          "translator": "Translated summary",
          "text": "...",
          "reviewStatus": "approved"
        },
        {
          "authorityLevel": 3,
          "author": "Ibn al-'Arabi",
          "work": "al-Futuhat al-Makkiyya",
          "section": "Chapter on Dhikr",
          "translator": "W.C. Chittick",
          "text": "...",
          "reviewStatus": "approved"
        },
        {
          "authorityLevel": 4,
          "author": "Rumi",
          "work": "Masnavi",
          "section": "Book I",
          "translator": "R.A. Nicholson",
          "text": "...",
          "reviewStatus": "approved"
        }
      ],
      "practices": [
        {
          "type": "contemplation",
          "text": "Sit quietly for five minutes. With each breath, silently say 'I remember.' Notice what arises.",
          "authorityLevel": 6,
          "label": "Practice Invitation (AI-composed)"
        }
      ],
      "reflectionPrompts": [
        {
          "text": "What does it mean to you that remembrance is described as reciprocal — 'remember Me and I will remember you'?",
          "authorityLevel": 6,
          "label": "Reflection Prompt (AI-composed)"
        }
      ],
      "dayNumber": 1
    }
  ]
}
```

---

## Curation Workflow

### Step 1: Select passages (founder)
Choose specific ayat for each theme. Prioritize passages that:
- Are contemplatively rich
- Have existing commentary in the selected sources
- Are not highly contested or politically charged
- Work as standalone encounters (not requiring extensive context)
- Build on each other within the theme

### Step 2: Gather source material (researcher)
For each passage:
- Obtain Arabic text from verified mushaf
- Obtain translation from credited translator
- Locate relevant tafsir excerpt
- Locate relevant mystical commentary (if available)
- Locate relevant contemplative poetry (if available)
- Write contextual note

### Step 3: Compose AI elements (AI + human review)
For each passage:
- Generate 1-2 contemplative questions
- Generate 1 practice invitation
- **All AI elements require human review before approval**

### Step 4: Review (editorial)
Each passage set reviewed against:
- Sacred Source Integrity Policy checklist
- Provenance completeness
- Authority level accuracy
- Sensitivity flags
- Contextual adequacy

### Step 5: Ingest
Run ingestion script to load reviewed JSON into database.

---

## Content Volume

| Category | MVP count | Phase 2 target |
|---|---|---|
| Themes | 4 | 12-20 |
| Qur'anic passages | ~28 | 100+ |
| Tafsir excerpts | ~20 (not all passages will have tafsir in MVP) | 80+ |
| Mystical commentary | ~15 | 60+ |
| Contemplative poetry | ~12 | 50+ |
| Practice invitations | ~28 (one per passage) | 100+ |
| Reflection prompts | ~28 (one per passage) | 100+ |

This gives approximately **4 weeks of daily encounters** at one passage per day.

---

## Translation Decision (requires founder input)

**Recommended primary translation:** M.A.S. Abdel Haleem (Oxford University Press, 2004)
- Modern, accessible English
- Scholarly but not archaic
- Widely respected
- Copyright: check licensing for digital use

**Alternative:** Sahih International
- Clear, literal
- Widely available
- More conservative rendering

**Not recommended for primary:** Yusuf Ali (archaic English), Pickthall (archaic), Barks-style Rumi translations (too free, strips Islamic context)

**Decision needed:** Which translation(s) to license/use, and whether to include multiple translations per passage.

---

## Open Questions

1. **Copyright/licensing:** What are the digital rights for the chosen Qur'an translation? Abdel Haleem is OUP-published — need to check terms.
2. **Ibn al-'Arabi translations:** Chittick's translations are academic press — licensing?
3. **Rumi translations:** Nicholson is public domain (pre-1928). Arberry may be. Check.
4. **Arabic font:** What typeface for Arabic rendering? Amiri? Scheherazade? System font?
5. **Right-to-left layout:** Does the existing MAIA UI handle RTL text blocks?
6. **Audio recitation:** Excluded from MVP but worth noting — eventual recitation support will need licensed audio or open-source qira'at recordings.
