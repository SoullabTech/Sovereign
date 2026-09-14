# Wisdom Corpus D3 — provenance audit of the `Books` folder

**Date:** 2026-08-11 · **Mode:** READ ONLY — no admission, exclusion, reclassification, retagging, migration, deduplication, consent change, schema write, or deployment. No source modified.
**Authorizing ruling:** D3 Founder Ruling (2026-08-11) — *"prepare evidence for founder review only."*
**Upstream:** D2 provenance trace · D4 ratification proof · House-Source Admissibility Record plan.

---

## Headline — the bottleneck is D1, not provenance

Provenance turned out to be **recoverable**: 104 of 122 sources reach HIGH or
MEDIUM identity confidence from structural evidence alone, and the population is
far less ambiguous than `Books` as a folder name suggested.

But the queue that produces is lopsided:

> **97 of 122 sources are blocked on copyright policy alone. Exactly 3 are
> LIKELY ADMITTABLE today.**

⭐ **This vindicates holding the admissibility-record build.** Built now, the
mechanism would be near-empty infrastructure: a founder review queue containing
**three** items. **D1 is what fills it.** The sequencing insight is stronger than
"no cost to learning" — there is a real cost to building first, and D3 found it.

## 1. Count by provenance class

| Provenance | Count | Share |
|---|---:|---:|
| **COMMERCIAL / PUBLISHED BOOK** | **111** | 91% |
| MAIA CONVERSATION / TRANSCRIPT | 4 | 3% |
| FOUNDER-AUTHORED MATERIAL | 3 | 2% |
| AMBIGUOUS | 4 | 3% |
| PUBLIC-DOMAIN / CLASSIC TEXT | **0 asserted** | — |
| CLIENT / MEMBER-DERIVED MATERIAL | **0** | — |
| SOULLAB / AIN INTERNAL | 0 | — |

⚠️ **PUBLIC-DOMAIN is deliberately unasserted.** Several sources are very likely
public domain (Manly P. Hall 1920s–30s, the Hermetica, I Ching, Rosicrucian
material). Determining public-domain status requires publication-date and
edition facts that **are not in the corpus** — a scanned modern edition of an
old text is still an in-copyright edition. Per the ruling (*"use
UNKNOWN/AMBIGUOUS rather than guessing"*), these remain COMMERCIAL pending D1.
**This is a D1 input, not a D3 output.**

✅ **No client or member-derived material found in Books.** Consistent with D2.

## 2. Count by identity confidence

| Confidence | Count |
|---|---:|
| HIGH | 71 |
| MEDIUM | 33 |
| LOW | 17 |
| UNKNOWN | 1 |

Identity rests on **filename slugs**, which proved to be the corpus's most
reliable metadata: 111 carry a scribd-style `<numeric-id>-<descriptive-slug>`
pattern (e.g. `162698945-Invisible-Partners-How-the-Male-and-Female-in-Each-of-Us…`).
HIGH additionally required internal book markers (chapter/contents/foreword/
bibliography) or copyright markers.

⚠️ **Stored `author` is unreliable and must not be used as an admission
signal**: **83 of 122 (68%)** fail a basic plausibility check; **14** are empty.
This confirms the corpus-wide author defect from the Phase 1/2 findings, now
measured within Books.

⚠️ **Stored `title` is also not ground truth** — `extractIdentity()` prefers a
validating in-content `# ` H1 over the filename. That is exactly how a
conversation export came to be titled as though it were a book (D2 §A).

## 3. Transcript / private-material risk

**4 sources** — and only the four already known from D2.

⚠️ **A first pass flagged 36. That was wrong, and the correction matters more
than the number.** Decomposing the signals:

| Signal | Sources | Verdict |
|---|---:|---|
| speaker labels ≥3 | 3 | ✅ real (the Maya transcripts) |
| speaker labels =2 in a 2-chunk file | 1 | ✅ real (the Maya fragment) |
| speaker label =1 in a 12-chunk doc | 1 | ❌ single bold heading — false positive |
| email address present | 15 | ❌ publisher/author contact inside published books |
| platform vocabulary | 20 | ❌ **the word "sanctuary"** in Jung, Von Franz, Manly P. Hall, Hollis — 1–2 hits in 300–800 chunk books |
| session UUIDs | 0 | — |

A privacy signal that fires on the word *"sanctuary"* in a book about alchemy is
not a privacy signal. Had the first pass been reported, **32 published works
would have been wrongly flagged as private-consent risks**, and the queue would
have been unusable. Density and co-occurrence — not presence — separate
structure from vocabulary.

## 4. Duplication (reported separately from provenance, per ruling)

| Pattern | Sources |
|---|---:|
| no duplication | 114 |
| cross-source + internal | 3 (the large Maya exports) |
| internal + fragment | 1 (the Maya fragment) |
| fragment only | 4 |
| exact checksum duplicates | **0** |

`library_sources.checksum` carries a UNIQUE index, so byte-identical files
cannot both be ingested. **That is precisely why the Maya problem got through:**
three exports of one conversation differ by bytes, so each passed the uniqueness
check as a distinct source.

⭐ Per the ruling — *"a duplicate published book is still a published book"* —
duplication never altered a provenance class here. The 4 fragment-flagged
non-Maya sources keep their provenance and confidence; the flag is advisory.

## 5. Count requiring a D1 copyright ruling

**111** classified COMMERCIAL; **97** have copyright as their *sole* remaining
blocker (the other 14 are also held for provenance or exclusion).

## 6. Sources with unreliable identity metadata

- Unreliable `author`: **83** (68%)
- Empty `author`: **14**
- LOW/UNKNOWN identity confidence: **18**
- Title derived from in-content H1 rather than filename: **the known failure mode; 4 confirmed cases**

## 7. How many are clean enough to present for admission review

**3.**

**LIKELY ADMITTABLE (3)**

- `Integrating astropsychology, archetypal psychology, and depth psycho` — FOUNDER-AUTHORED MATERIAL · MEDIUM · dup:no · **LIKELY ADMITTABLE**
- `The Alchemy of Awakening.txt` — FOUNDER-AUTHORED MATERIAL · MEDIUM · dup:no · **LIKELY ADMITTABLE**
- `The Alchemy Of You Workshop-Complete.txt` — FOUNDER-AUTHORED MATERIAL · MEDIUM · dup:no · **LIKELY ADMITTABLE**

All three are non-scribd, project-vocabulary-bearing, house-owned material with
MEDIUM+ confidence and no duplication or privacy signal. *"LIKELY ADMITTABLE"
is not admission* — it means provenance presents no obvious blocker before
D1/admission review.

## 8. Broader scan required outside Books

**No new scan required.** D2 already ran the corpus-wide transcript-shape scan:
Books contained exactly one transcript defect. Two carry-forward items, neither
urgent, both belonging to a future house-corpus pass rather than to v1:

- `AIN/Clients/…` — 18 sources under client-named folders. Excluded from v1 by
  the folder ruling; worth their own look before any AIN admission is ever
  contemplated.
- `Soullab Dev Team` (1,112) and `AIN` (516) remain unclassified by provenance.
  Out of v1 scope by ruling.

## 9. Importer defects to repair later (Phase 6 — NOT implemented)

Traced in `scripts/library/ingestTxtSources.ts` and `LibraryService.createSource()`:

| # | Defect | Evidence | Smallest correction |
|---|---|---|---|
| 1 | **Title derived from in-content H1** | `extractIdentity()` prefers a validating `# ` heading over the filename | Prefer filename; record any H1 as a *separate* `meta.content_heading` field, never as identity |
| 2 | **Author extracted by regex from the first N bytes** | 68% unreliable in Books alone | Stop persisting inferred authors. Leave NULL; author is a curation input, not an extraction output |
| 3 | **Class inferred from directory** | `folder` is the only classification signal that exists | Record an explicit `source_class` at ingest, required, no directory default |
| 4 | **Consent never evaluated** | `createSource()` INSERT omits `consent_required`/`consent_granted`; both take column DEFAULT `false`. The file header claims *"consent-first"* | Make consent an explicit required ingest parameter — a doctrine/implementation contradiction, not an oversight |
| 5 | **`review_status` never set** | Same INSERT omits it; DEFAULT `'uploaded'` (D4 §3) | Correct as-is under D4 — but should be *deliberate*, not incidental |
| 6 | **Dedup is byte-exact only** | UNIQUE checksum index; three near-identical Maya exports all admitted | Add near-duplicate detection at ingest (chunk-hash overlap ≥ threshold → flag, do not auto-skip) |
| 7 | **`type` is uniformly `'txt'`** | 2,228/2,228 | Set real types; the CHECK vocabulary already supports `book\|transcript\|article` |

⛔ None implemented. Defect 4 is the one that produced D2.

## 10. Proposed founder-review instrument

The queue below is the instrument. Given §7, the practical recommendation is
**not** to review 122 rows now:

1. **Take D1 first.** It resolves the disposition of 97 sources at once. Reviewing
   them individually beforehand asks the same copyright question 97 times.
2. **Then admit in three passes** — (a) the 3 house-owned items, (b) whatever D1
   admits by class, (c) the 18 provenance-held items individually.
3. **Record the 4 exclusions whenever the mechanism exists** — they are already
   ineligible under the allowlist shape; the rows add the *record of judgment*.

Reviewing per-source is the right granularity for admission; it is the wrong
granularity for a policy question that applies uniformly to 97 sources.

---

## Full review queue (122 rows)

⚠️ `Books` holds **122** rows, not 121: 121 `completed` + **1 `failed`**
(no chunks, UNKNOWN confidence). The failed row is included for completeness.

| # | Source (filename) | Provenance | Conf | Dup | Priv | Copyright | Recommendation |
|---:|---|---|---|---|---|---|---|
| 1 | `conversation-Maya-2025-10-30 (1).md` | MAIA CONVERSATION / TRANSCRIPT | HIGH | cross-source+internal | YES | house-owned | **EXCLUDE RECOMMENDED** |
| 2 | `conversation-Maya-2025-10-30 (2).md` | MAIA CONVERSATION / TRANSCRIPT | HIGH | cross-source+internal | YES | house-owned | **EXCLUDE RECOMMENDED** |
| 3 | `conversation-Maya-2025-10-30.md` | MAIA CONVERSATION / TRANSCRIPT | HIGH | fragment | no | house-owned | **EXCLUDE RECOMMENDED** |
| 4 | `conversation-Maya-2025-10-31.md` | MAIA CONVERSATION / TRANSCRIPT | HIGH | cross-source+internal | YES | house-owned | **EXCLUDE RECOMMENDED** |
| 5 | `195992281-Code-to-the-Matrix.txt` | AMBIGUOUS | UNKNOWN | fragment | no | UNDETERMINED | **HOLD — PROVENANCE** |
| 6 | `367153405-Norse-Mythology.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 7 | `391507123-active-imagination.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 8 | `40019372-Personal-Mythology.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 9 | `412556921-02-Enneagram-Handbook.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 10 | `425430834-9-Realms.txt` | AMBIGUOUS | LOW | no | no | UNDETERMINED | **HOLD — PROVENANCE** |
| 11 | `428150665-MBTI-Template.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 12 | `456521179-shared-realities.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 13 | `478298463-psychedelicpraye00learrich-pdf.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 14 | `555440603-16-Personality-Types.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 15 | `561775055-Q3-Archetypal.txt` | AMBIGUOUS | LOW | no | no | UNDETERMINED | **HOLD — PROVENANCE** |
| 16 | `601456806-E1-Emotional-Intelligence.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 17 | `620775889-IntuitiveHumanDesign-2.txt` | AMBIGUOUS | LOW | no | no | UNDETERMINED | **HOLD — PROVENANCE** |
| 18 | `636045628-Untitled (1).txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 19 | `640799655-Untitled.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 20 | `660665662-TheKybalion.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 21 | `72826422-Enneagram-chart.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 22 | `80031579-Richard-Tarnas.txt` | COMMERCIAL | LOW | no | no | COMMERCIAL — needs D1 | **HOLD — PROVENANCE** |
| 23 | `132663001-the-enneagram-info-from-the-underground.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 24 | `162698945-Invisible-Partners-How-the-Male-and-Female-in-Each-of-Us-Aff` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 25 | `170525308-The-Soul-and-Free-Will.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 26 | `172724816-Keiron-Le-Grice-The-Birth-of-a-New-Discipline.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 27 | `183565028-Horoscope-Personality-Traits.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 28 | `185687742-Archetypal-Astrology-and-Transpersonal-Psychology-Richard-Ta` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 29 | `219139161-FRANCES-YATES-S-HERMETIC-RENAISSANCE-IN-THE-DOCUMENTS-HELD-I` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 30 | `227163434-Jung-Red-Book-Guide.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 31 | `229475446-Manly-P-Hall-Wisdom-of-the-Knowing-Ones-1-eBook-PDF.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 32 | `250318274-the-holotropic-mind-essay.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 33 | `253862249-C-G-Jung-and-the-Tradition-of-Gnosis.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 34 | `282720428-Intructors-Manual-for-James-Hillman-on-Archetypal-Psychother` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 35 | `290754579-Richard-Rudd-Human-Design-Pt2-Final.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 36 | `29081655-Collective-Unconsciousness-Carl-Jung.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 37 | `295270724-The-Secret-Teachings-of-All-Ages-Manly-P-Hall.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 38 | `305536207-Alchemical-Psychology-Uniform-Edition-o-Hillman.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 39 | `323573350-The-Secret-of-the-Golden-Flower-Original.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 40 | `329520202-Archetypal-Cosmology-Past-and-Present-by-Richard-Tarnas.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 41 | `332179661-The-Dark-Night-of-the-Soul-Manly-Palmer-Hall.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 42 | `332812539-On-Active-Imagination-by-Marie-Louise-Von-Franz.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 43 | `33725362-Carl-Gustav-Jung-Theories-of-Personality.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 44 | `353619346-Psyche-and-Matter-by-Marie-Louise-von-Franz-selected-passage` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 45 | `358153761-Active-Imagination-Encounters-With-the-Soul (1).txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 46 | `376235858-Generators-Course-Human-Design.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 47 | `37747540-Jung-Alchemy-and-Active-Imagination-Part-3-of-Alchemy-and-the` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 48 | `387182544-234901868-Marie-Louise-Von-Franz-Alchemy-PDF.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 49 | `393806354-Ancient-Sumerian-Mythology-the-Chronicles-of-the-Sumerian-Pe` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 50 | `400928715-356275811-INNER-WORK-Using-Dreams-and-Active-Imagination-Rob` | COMMERCIAL | HIGH | fragment | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 51 | `406871468-Searles-and-Penroses-noncomputational-frameworks-for-natural` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 52 | `413373081-241711266-Mysterium-coniunctionis-pdf-pdf.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 53 | `413373516-Mysterium-Coniunctionis-La-Obra-Maest.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 54 | `424432075-MYTHOLOGY-AND-FOLKLORE-ppt-pptx.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 55 | `424489628-Moon-s-Nodes-pdf.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 56 | `438009650-Archetypes-LIST-pdf.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 57 | `440947438-Thomas-Moore-The-Planets-Within-Lindisfarne-Books-1990-pdf.t` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 58 | `442239220-Two-in-One-the-Union-of-Jungs-Anima-and-Animus-in-Beauty-and` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 59 | `442900731-Perennial-library-Johnson-R-A-Jung-C-G-He-Understanding-Masc` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 60 | `444198426-Nature-of-Mythology-and-Folklore (1).txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 61 | `458449028-Anatomy-of-the-Psyche-Alchemical-Symbolism-in-Psychotherapy.` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 62 | `459678115-Hannah-The-Animus.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 63 | `467090130-The-Enneagram-Types-and-Personality-Disorders.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 64 | `472232723-The-Rosicrucian-Enlightenment-Revisited.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 65 | `474068301-Antero-Alli-The-Eight-Circuit-Brain-Navigational-Strategies-` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 66 | `478961062-roger-penrose-shadows-of-the-mind-a-search-for-the-missing-s` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 67 | `481343054-The-Hermetica-The-Lost-Wisdom-of-the-Pharaohs-by-Timothy-Fre` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 68 | `487864637-Initiation-The-Living-Reality-of-an-Archetype-PDFDrive.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 69 | `488665715-Alchemical-Divination-Accessing-Your-Spiritual-Intelligence-` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 70 | `492034477-Living-Design-Workbook-English.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 71 | `493348727-Lectures-on-Jung-s-Typology-by-Marie-Louise-Von-Franz-and-Ja` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 72 | `511128212-Maps-of-Consciousness-Yi-King-Tarot.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 73 | `521247577-The-Wild-Unknown-Archetypes-Guidebook-Full-1.txt` | COMMERCIAL | MEDIUM | internal+fragment | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 74 | `524034641-Mystical-Shaman-Oracle-Cards.txt` | COMMERCIAL | MEDIUM | fragment | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 75 | `541567837-Becoming-Whole-a-Jungian-Guide-to-Individuation.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 76 | `541969751-Ancient-Secret-of-the-Flower-of-Life-Vol-I-Drunvalo-Melchize` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 77 | `556048844-The-Enneagram-Triads.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 78 | `569255701-Understanding-the-Centers-in-Human-Design-Robin-Winn.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 79 | `583061092-THE-BOOK-OF-LINES-chetan-parkyn.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 80 | `58441558-Myers-Briggs-Personality-Traits.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 81 | `588503572-Edward-Edinger-Individuation-a-Myth-for-Modern-Man.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 82 | `595487000-Enneagram-Spiritual-Formation-Plan.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 83 | `599011707-Human-Design-Gates-Cheat-Sheet-by-Christie-Inge.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 84 | `601180601-Tracking-The-Planets-in-Human-Design-Gates-Keynotes-and-Chan` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 85 | `610445892-The-64-Gates-Guide-Human-Design.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 86 | `617894944-Alchemy-Orders-of-the-Great-Work-Alchemy-Part-2-Manly-P-Hall` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 87 | `61828354-The-Archetypal-Imagination-James-Hollis.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 88 | `622782326-1-THE-HOLY-BOOK-OF-BALANCE.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 89 | `631865921-The-Philosophy-of-the-I-Ching-PDFDrive.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 90 | `652554587-The-Variables-of-Human-Design.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 91 | `673677695-Enneagram-Psychology-230729-134525.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 92 | `675113971-A-Jungian-Approach-to-Coaching-Laurence-Barrett-Z-Library.tx` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 93 | `6759542-Four-Theories-of-Myth (1).txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 94 | `683872326-The-Instinctual-Drives-and-the-Enneagram-Luckovich-John-z-li` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 95 | `691240285-a-neuroscientific-view-on-the-enneagram-of-personality.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 96 | `693436508-The-Twenty-Seven-Enneagram-Type-and-Instinctual-Type-Combina` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 97 | `699182036-12-Magical-Laws-of-The-Universe-Full-Book-PDF.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 98 | `702204781-Introduction-to-Mythology-and-Folklore.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 99 | `706493220-Egyptians-Myths-and-Legends.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 100 | `709011239-Titus-Burckhardt-Alchemy-Science-of-the-Cosmos-Science-of-th` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 101 | `717257909-Third-Eye-Code-Book.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 102 | `733561954-Jolande-Jacobi-The-Psychology-of-C-G-Jung-1942-Routledge-Lib` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 103 | `738129543-Book-of-Wisdom-Part-1-Revival-of-Wisdom-22-28.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 104 | `738336070-Jungian-Psychology-Active-Imagination-An.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 105 | `744420999-OceanofPDF-com-the-Modern-Enneagram-Kacie-Berghoef.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 106 | `75293427-Cleary-Thomas-Understanding-Reality-by-Chang-Po-tuan.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 107 | `754779598-Mythology-and-Folklore-Module.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 108 | `755015051-7-The-Creation-of-Consciousness-E-Edinger.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 109 | `755868522-Human-Health-Guide-Revival-of-Wisdom-Copyright-1.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 110 | `763457903-Ancient-and-Modern-Theories-in-Mythology-Zoleta-Erika-Joy-F.` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 111 | `76669667-Stanislav-Grof-The-Adventure-of-Self-Discovery.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 112 | `784637589-The-Path-to-Source-and-Sacred-Geometry.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 113 | `788423574-Psychedelics-and-Individuation-Leslie-Stein.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 114 | `863006531-Quantum-and-the-unknowable-universe.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 115 | `900102035-Consciousness-Beyond-Materialism.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 116 | `902400115-She-Understanding-Feminine-Psychology-Robert-A-Johnson-downl` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 117 | `905231468-Erich-Neumann-Depth-Psychology-and-a-New-Ethic.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 118 | `912410099-Stanford-Enneagram-Discovery-Inventory.txt` | COMMERCIAL | MEDIUM | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 119 | `9272251-Alchemy-The-Science-of-Enlightenment.txt` | COMMERCIAL | HIGH | no | no | COMMERCIAL — needs D1 | **HOLD — COPYRIGHT POLICY** |
| 120 | `Integrating astropsychology, archetypal psychology, and depth psycholo` | FOUNDER-AUTHORED MATERIAL | MEDIUM | no | no | house-owned | **LIKELY ADMITTABLE** |
| 121 | `The Alchemy Of You Workshop-Complete.txt` | FOUNDER-AUTHORED MATERIAL | MEDIUM | no | no | house-owned | **LIKELY ADMITTABLE** |
| 122 | `The Alchemy of Awakening.txt` | FOUNDER-AUTHORED MATERIAL | MEDIUM | no | no | house-owned | **LIKELY ADMITTABLE** |

---

## Evidence

Production `maia-postgres` on minisforum, read-only `SELECT` only, 2026-08-11.
All signals computed as SQL aggregates over `library_chunks.content`; **no chunk
text was extracted, stored, or reproduced**, and no transcript content appears in
this report. Classification is deterministic from those aggregates plus filename
structure — the script and its inputs are in the session scratchpad. Code
references: working tree on `feature/labtools-redesign`.
