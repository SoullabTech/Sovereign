# Larry IP Corpus — Inventory Audit

**Date:** 2026-08-03 · **Status:** REVISED after scope correction (Kelly, same day)
**Method:** git inventory of `clean-main-no-secrets`, then direct filesystem traversal of Desktop / Downloads / Documents / iCloud / Obsidian vault
**Governing question:** *"Does this surface faithfully express Larry's Flourishing practice, or have we built a beautiful generic reflection environment?"*

---

## 0. Retraction of the first pass

The first version of this audit concluded **"Zero Larry-authored primary material exists."** That claim was scoped to the git repository and should never have been stated without its scope attached. **It was wrong as written.**

Two defects, both of the kind this project's governance exists to catch:

1. **Overbroad claim from a bounded search.** I searched one location and reported a universal absence. Corpus material exists in quantity outside the repo.
2. **⚠️ A non-measurement read as a measurement.** The first pass ran `mdfind 'Larry Closs'` and got 0 results. **Spotlight indexing is OFF on this machine** (`mdutil -s /` → `No index`). That 0 was an instrument failure, not evidence. Per `feedback_empty_measurement_is_not_absence`: the instrument was never shown capable of seeing the object. A control test (`mdfind` for a word certain to exist) also returns 0 — which is how the defect was caught.

The accurate original finding was narrower and still stands: **no Larry-authored primary corpus with explicit provenance exists in the runtime-facing location (`docs/fields/larry/`).** That is a provenance and ingestion gap, not a corpus loss.

---

## 1. Corrected corpus map

```
Larry's authored corpus (books, manuals, exercises, recordings, presentation)
        ↓  ← ⛔ NEVER INGESTED. The gap.
Loose derived artifacts on Desktop/Downloads  ← EXISTS, unversioned, uninventoried
        ↓
docs/fields/larry/  (Soullab synthesis + design)  ← EXISTS, correctly labeled
        ↓
Now What? runtime  ← carries NO Larry-specific content (both seeds unrun in prod)
```

## 2. What was found outside the repo

### 2a. ⭐ The rights instrument EXISTS — and is unsigned

| Artifact | Location | State |
|---|---|---|
| **Larry Materials Agreement — One Page** | `~/Desktop/Larry Materials Agreement — One Page.docx` | **v1.2 · 2026-07-15 · UNSIGNED** (blank signature lines) |
| IP instrument skeleton | `~/Downloads/LARRY_IP_INSTRUMENT_SKELETON_v1.md` | earlier draft of the same |

This is the single most important correction. The agreement is well-drafted, sovereignty-consistent (no model training, no impersonation, no cross-environment use, full deletion on exit, ownership never transfers), and it **already specifies the exact gate this audit was commissioned to serve**:

> "**Attachment A: Materials inventory** (built together, item by item)."
> "**If it's not on the list, it's not in the system.**"
> "**Nothing moves — no book ingested, no client enters — until both versions are signed.**"

⛔ **The agreement's own precondition is currently unmet.** It is unsigned, and Attachment A does not exist. By the instrument's own terms, no ingestion is authorized today.

### 2b. ⭐ Larry's own words DO exist — in derived form

`~/Downloads/Now_What_Development_Package.docx` contains **"Speaker-Labeled Interview Highlights"** — direct `Larry:` quotations:

> "People spend decades building businesses, raising families, and achieving success, then wake up asking: 'Now what?'" · "What got me here is not going to get me there." · "The work creates clarity and confidence." · "The relationship with the practitioner must remain primary."

Plus a **developmental journey map** (Stage 1 Achievement → 2 Disorientation → 3 The Question → 4 …).

**So an interview WAS conducted.** `VISION_FIELD_INTERVIEW_R1.md` being an unconducted instrument was correct about *that document*; it was wrong to generalize to "no interview happened." ⚠️ But this is a **derived artifact** — speaker-labeled highlights, not a raw transcript. The recording/transcript it was drawn from is **not on this machine**.

### 2c. Larry has a presentation we have read but do not hold

`~/Desktop/From Flourishing Framework to Flourishing Platform.pdf` is written *to* Larry and repeatedly references **"Your presentation"** — meaning Larry's deck was reviewed. **The deck itself is not on disk.** This is the clearest single instance of the pattern: we responded to his primary material without ever ingesting it.

### 2d. Soullab-authored, Larry-directed (all `~/Desktop`, `~/Downloads`)

`WHAT_NOW_FOR_LARRY.docx` · `NOW_WHAT_OWNERS_GUIDE_LARRY_v1.md` · `Now_What_Human_Experience_Review_Framework.docx` · `NOW_WHAT_Founder_Deck_v2.pptx` · `NOW_WHAT_Dynamic_Founding_Practitioner_Deck.pptx` · `Larry's Studio — the Practitioner Field Admin Surface.pdf` · `Now What? — Year Two (STRAWMAN v1.1).pdf` · `Now What? — The First Five Minutes (STRAWMAN v1).pdf` · `Now What? — Hospitality Audit (2026-07-15).pdf` · `larry-studio-mockup.html` · `now_what_client_tap_flow.png`

⚠️ These are **untracked, unversioned, and outside governance** — living on Desktop/Downloads where no referent-pass or claim-discipline check reaches them.

### 2e. Commercial relationship confirmed

Eight `AINOS_LLC_Invoice_Larry_*.pdf` variants in `~/Downloads`. A real engagement exists; the paperwork governing *materials* does not yet.

### 2f-bis. ⛔⛔ RESOLVED BY METADATA: the lecture slides are Prof. Jason Mitchell's, not Larry's

Kelly's working classification (2026-08-03) proposed **"Larry lecture slides → Larry-authored teaching IP."** Direct extraction refutes this:

- `1_Lecture1_Introduction.pdf` contains **`JASON_MITCHELL@HARVARD.EDU`** — Jason Mitchell, Professor of Psychology, Harvard.
- Course identifiers throughout: **`PSY 1060 / PSYC E-1680`**, `REASON #1 FOR PSY 1060`, `PSY 1060 / E1680` (repeated on running slides).
- **Zero** occurrences of "Closs" in any lecture PDF.
- PDF `CreationDate` runs **2025-09-04 → 2025-11-18**, in weekly/biweekly steps — the exact cadence of a **Fall 2025 semester**, slides produced lecture-by-lecture.

⇒ These are **Harvard course lecture slides authored by Jason Mitchell**. Larry was a **recipient** — student or auditor — who forwarded his course pack. The email subject Kelly read as *"Slides from Clss"* is far better explained as *"Slides from **Class**"* than *"from **Closs**"*, and the metadata settles it.

The 38 readings (Gilbert, Haidt, Lyubomirsky, Twenge, Denizet-Lewis, Hamblin, Alter, Dunn/Aknin/Norton, Oishi/Schimmack, Neal/Wood/Quinn, Kross) and the later 2026-07-21 batch (Van Boven & Gilovich, Brown & Ryan 2003, Killingsworth & Gilbert *A Wandering Mind*, O'Brien & Kassirer, Dunn/Aknin/Norton) are that course's **assigned reading list** — third-party published research, not Larry's writing.

**Consequence — this is a rights hazard, not a bookkeeping detail.** Placing Mitchell's slides on Attachment A would license a third party's copyrighted teaching materials under Larry's name, and ingesting them would put another professor's course into MAIA's composition. ⛔ Both are refused. Correct classification:

| Material | Classification | Attachment A? |
|---|---|---|
| PSY 1060 lecture slides | **Jason Mitchell / Harvard — third-party** | ⛔ NEVER |
| The ~44 research papers/chapters | **Third-party published research** | ⛔ NEVER (Larry-*selected*, not Larry-*authored*) |
| Larry's talk / Flourishing landscape | **Larry-authored** — the real corpus | ✅ once located + signed |
| Larry's Now What? framework docs | **Larry-authored** | ✅ once located + signed |
| Larry's exercises / workbooks | **Larry-authored** (if they exist) | ✅ once located + signed |

**What the email corpus DOES establish** (Kelly is right on this): Larry transferred material by **email over time** (June 26 batch, July 21 *"here are some more to add in"*), so the source channel was email/cloud, never the repo. The repo-only search boundary was wrong. But the transferred material located so far is a **curated reading list**, which evidences *what Larry reads and teaches from* — his influences, not his authorship. That is genuinely useful context and **it is not licensable IP**.

### 2f. ⛔⛔ The positive-psychology corpus is NOT Larry's IP

38 module-prefixed files in `~/Downloads` (dated 2026-06-28) — 19 lectures plus readings. Extracted attribution:

> **"The Science of Happiness — PSY 1060 / PSYC E-1680"**

That is a **Harvard Extension School course**. Zero Larry attribution in any PDF sampled. The readings are third-party published work (Gilbert *Stumbling on Happiness*, Haidt *Happiness Hypothesis*, Lyubomirsky *How of Happiness*, plus JPSP/Science/PLoS ONE papers).

**This is coursework, not practitioner IP.** It must **not** go on Attachment A, must **not** be ingested, and must **not** be treated as the "Positive Psychology material" row of the inventory. Doing so would license someone else's copyrighted material under Larry's name — the precise inversion of what the agreement protects. If Larry's practice draws on this literature, what is licensable is **his** synthesis of it, authored by him.

### 2g. Obsidian vault — ruled out

`/Users/soullab/Documents/AIN` (5.0 MB, 344 entries). `Clients/` holds `_Template`, `Loralee`, `OldHead` — **no Larry**. Content grep for `larry|closs`: **0 files**. The vault is not the source location.

---

## 3. Corrected inventory table

| Category | Exists? | Location | Provenance |
|---|---|---|---|
| **Rights instrument** | ✅ | `~/Desktop/Larry Materials Agreement.docx` v1.2 | ⛔ **UNSIGNED** — blocks everything below |
| Attachment A (materials inventory) | ❌ | — | Required by §1 of the agreement |
| Larry interview — raw recording/transcript | ❌ | — | Conducted; source not on this machine |
| Larry interview — derived highlights | ⚠️ | `Now_What_Development_Package.docx` | Speaker-labeled quotes, Soullab-compiled |
| Larry's presentation/deck | ❌ | — | Read by Kelly, never ingested |
| Flourishing framework (Larry-authored) | ❌ | — | Described secondhand throughout |
| Positive Psychology materials | ⛔ | `~/Downloads` (38 files) | **Harvard PSY 1060 — third-party, NOT Larry's** |
| Books / manuals / worksheets | ❌ | — | Named in agreement §1; none held |
| Programs / modules | ⚠️ placeholder | `scripts/seed-larry-program-doors.ts` | Invented titles; **unrun in prod** |
| Client examples | ⚠️ fictional | `NOW_WHAT_DEMO_SPEC.md` | "Michael" is authored persona |
| Language glossary | ⚠️ 1 sentence | `seed-flourishing-field.ts` | Kelly-authored; circular provenance |
| Soullab synthesis about Larry | ✅ (large) | `docs/fields/larry/` + Desktop/Downloads | Correctly labeled in-repo; **ungoverned out-of-repo** |

---

## 3a. ⭐ The talk corpus — described but NOT received, and it already falsifies our derived version

Kelly reports (2026-08-03) a substantial Larry-authored teaching corpus — narrative arc, teaching structure, examples, his synthesis of Positive Psychology / Behavioral Science / Neuroscience, opening thesis *"What comes after Success — Now What?"*, and the unifying claim *"Flourishing is not a destination. It is a practice."*

⛔ **That file did not arrive in this session and is not on this machine.** Searched: Desktop, Downloads, Documents, iCloud, Google Drive (~40 Now What? docs, all Soullab-authored), Obsidian vault, all repo clones. Not present. It must be located or re-supplied before it can be preserved — it cannot be cited as held.

**But the description alone already proves the drift this audit was commissioned to find.** Larry's actual landscape, per Kelly:

| # | Larry's actual dimension | In our seed? |
|---|---|---|
| 1 | Relationships | ✅ |
| 2 | Meaning and Purpose | ✅ (as "meaning") |
| 3 | **Time Affluence** | ❌ **MISSING** |
| 4 | Presence | ✅ |
| 5 | **Health and Energy** | ❌ **MISSING** |
| 6 | Contribution | ✅ |
| — | *(no such dimension)* | ⚠️ **"Attention" — INVENTED by us** |

`scripts/seed/seed-flourishing-field.ts` declares *"five practice domains: attention, relationships, meaning, contribution, and presence."* Larry's framework has **six**, and **"Attention" is not one of them** — while **Time Affluence** and **Health and Energy** were dropped.

⛔⛔ This is the concrete instance of the failure class: a derived representation diverged from the source **and was written into runtime-bound code citing that source as its provenance**. Not a hypothetical risk — a measured 3-way error (1 invented, 2 dropped) in the only file carrying Flourishing vocabulary toward runtime. It is also why re-deriving the ontology from our own documents would compound the error rather than correct it: **the ontology must be built from Larry's language, not from our summary of it.**

## 4. ⚠️ Open question requiring verification, not assumption

`WHAT_NOW_FOR_LARRY.docx` states, under the heading **"What it already does — witnessed, not promised"**:

> "It knows your work — and Kelly tested it himself. **Your full program composes into every conversation in your room.**"

This asserts Larry's program content is **live in a production field**. The repo audit found only `larry.demo` seed content (Kelly-authored, unrun in prod). **These cannot both be true.** Either:
- (a) a real Larry field was authored directly in the production DB in a working session — in which case **Larry material is in runtime today, ungoverned and pre-agreement**, or
- (b) the claim describes the demo field and overstates its provenance.

⛔ **Do not resolve this by reasoning.** Verify against production:

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c "SELECT slug, holder_username, length(about_practice) FROM practice_fields;"'
```

This is the highest-priority unknown in the lane. If (a), it needs immediate attention — content in runtime ahead of a signed instrument.

---

## 5. What this gates

**Substrate readiness** (strong) ⊥ **corpus governance** (absent). The architecture is the right container; the correction is to the *provenance claim*, not the architecture.

**Ordering — set by the agreement itself, not by this audit:**

1. **Verify §4** — is Larry material already in production?
2. **Build Attachment A** *with Larry* — the item-by-item inventory. This audit is the Soullab-side input to it, not a substitute for it.
3. **Sign both versions** — plain-words + attorney-formalized. Until then, §1's *"if it's not on the list, it's not in the system"* is the binding rule.
4. **Collect primary source** against the signed list — deck, books, manuals, exercises, recordings, transcripts.
5. **Ingest with per-item provenance** (author · date · medium · consent basis · Attachment A line).
6. **Only then** does Flourishing vocabulary reach runtime.

**Immediate hygiene, independent of Larry:**
- Move the loose Desktop/Downloads Larry artifacts into governed storage — untracked founder-authored material about a practitioner's work is exactly what claim discipline exists to catch.
- Decide the fate of the circular-provenance `larry.demo` seed (§2f of the prior pass): remove, or re-label as fully Soullab-invented with no Larry-materials citation.
- ⛔ Quarantine the Harvard course PDFs away from anything labeled "Larry corpus."

---

**Classification:** Class A (structural evidence — filesystem state, extracted document text). No experience or interpretation claims. Nothing here rules the ordering; §4 is a verification task, not a finding.
