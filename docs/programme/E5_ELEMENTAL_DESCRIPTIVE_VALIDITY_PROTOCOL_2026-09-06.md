# E5 — Elemental H1 descriptive validity · offline protocol (pre-registered design)

**Lane:** JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1, Phase 2, Plane B rank 2 · **Founder order:**
E5 offline → E11 shadow → E6 registered participation; *do not inject four interpretations
first* · **Status:** DESIGN — pre-registered; no run authorized; no live code · **Instrument
precedes observation** (CLAIM_STATE_AUTHORITY rule 5): thresholds below are fixed before any
coding begins; if the instrument changes materially it is versioned and re-run.

## 1 · Question (H1, descriptive)

Do simultaneous, differentiated readings of one member turn along Fire · Water · Earth · Air
(with Aether / Field as their configuration) carry reliable, non-redundant information that a
single-winner categorization discards — *or* is "four readings" just four names for one scalar?

What the census established (map §3 X8): today's live elemental substrate is regex keyword
counting collapsed to `dominant`; the Field layer computes over that scalar. H1 has therefore
never been tested; E5 is its first test and it runs entirely offline.

## 2 · Materials

- **Turns.** 50 member turns, each with the immediately preceding MAIA response for context. Sampling frame: consented transcripts only, once the Phase 4 consent act exists. **Until then, E5 may be developed and dry-run on synthetic transcripts authored for the purpose; synthetic runs calibrate the instrument and license nothing about H1.** Sanctuary content is never eligible.
- **Stratification.** ≥10 turns each from Talk, Care and Note modes; ≥10 turns the live substrate labelled with a single dominant element at high keyword ratio and ≥10 at low ratio; no member contributes more than 5 turns.
- **Raters.** Four independent raters blind to the live substrate's output, to each other, and to the hypothesis direction; at least one rater from outside Soullab (the R11 external-witness consequence applies to the instrument too). Training on 10 separate turns with the coding manual; training turns are excluded from the sample.

## 3 · Coding scheme (per turn, per rater)

For each of Fire, Water, Earth, Air the rater records:

| Field | Values | Note |
|---|---|---|
| presence | 0 absent · 1 faint · 2 present · 3 dominant | independent per element; several may be 3 |
| confidence | low · medium · high | rater's own |
| evidence span | the words that carry it, or "none" | kept offline, never leaves the coding sheet |
| contradiction flag | yes / no | this element reads *against* another present element in the same turn |

Plus one **Field** line: free-text description of the configuration among the present elements
(≤ 20 words), and a **single-winner** forced choice made *after* the four readings (which one
element would you pick if you could keep only one). The manual defines the four as *modes of
attending* (will/action · feeling/relation · body/material/place · meaning/language), not as
domains of life and not as traits (charter §11, §17).

## 4 · Measures, pre-registered

| Measure | Statistic | Threshold to count as *discriminating* |
|---|---|---|
| M1 per-element reliability | Krippendorff's α on presence (ordinal), per element, across four raters | α ≥ 0.67 on at least three of four elements |
| M2 non-redundancy | mean pairwise correlation of presence scores across elements (within turn, across turns) | mean |r| ≤ 0.5 (readings are not one axis in four names) |
| M3 multiplicity | proportion of turns where ≥ 2 elements are rated ≥ 2 by the majority of raters | ≥ 30 % (if < 30 %, a single winner loses little) |
| M4 contradiction | proportion of turns with a majority contradiction flag | reported, no threshold (this is P11's object) |
| M5 information loss of single-winner | for turns in M3, how often the raters' own forced single choice disagrees across raters (α on the forced choice) | reported; low α here with high α in M1 is the signature that *the collapse, not the readings, is unreliable* |
| M6 live-substrate agreement | agreement between the live `dominant` (regex) and the rater majority forced choice; and between live keyword presence and rater presence ≥ 2 | reported; no threshold — it measures the current substrate, not H1 |

**H1 counts as surviving E5** only if M1 and M2 pass and M3 is met. Any other pattern is
recorded as FAIL or INVALID (e.g. raters could not apply the manual → INVALID, licenses nothing).

## 5 · What a pass licenses, and what it does not

- **Licenses:** designing E11 (shadow ablation of the Field addendum) and the smallest E6 form — one registered `inferred.elemental_shadow` producer emitting counts/digests in the manifest with zero response diff. Nothing member-facing.
- **Does not license:** H2 (relational validity), H3 (developmental), any runtime elemental reading of a member, any claim that the Elements are validated psychology, any change to prompts. A reliable *reading* is not yet a *better encounter*.
- **A fail licenses:** renaming the substrate to what it is (map §7 candidate 2) and retiring "parallel knowing" from internal and public language; the Elements remain a human vocabulary Soullab finds meaningful.

## 6 · Method integrity

- Raters never see the live substrate's output until after coding (blinding log kept).
- The coding manual and this protocol are frozen by commit before the first coded turn; changes → protocol v2 and a fresh sample.
- No engagement, satisfaction or affect measure anywhere in E5.
- Result record: `docs/research/human-experience/experiments/elemental/E5_RESULT_<date>.md` with SHA of the manual, sample manifest (ids only), raw α tables, and the PASS / FAIL / INVALID verdict under CLAIM_STATE_AUTHORITY's three-verdict rule.

## 7 · Founder stops

Authorize the synthetic dry-run (instrument calibration only) · authorize the consented sample
once Phase 4 exists · appoint the external rater · rule on the verdict.
