# MAIA-WISDOM-WITNESS-01 · INSTRUMENT AMENDMENT 2F
## Carrier separation — a sidecar is not a document, and a non-attempt is not an absence

**Date:** 2026-09-15
**Instrument:** `scripts/witness/ain-corpus-census.mjs`
**Authorized by:** founder act, following verification of Amendment 2E at `56ef65a2d3409516b7df0761b3aae0de60415bfa`
**Status:** IMPLEMENTED · acceptance witness below · ⛔ **STOP for final instrument acceptance**

---

## 1. What 2E left open

2E was accepted as far as it went. The founder's verification of the committed SHA
found two leaks, both of them in code written by this lane:

**Leak A — carrier identity was established too late.** 2E computed `isSidecar` inside
the records loop, *after* `hashFile()` had already run and *after* the text-read block
had already incremented `textAttempts` and updated `domainHits` / `soullabSignal`. So
`doc.pdf.meta.json` was correctly excluded from the corpus-document total while still
contributing to:

- duplication clusters (it was hashed)
- the domain signal counts
- the authorship signal counts
- the text-read and hash-read trust denominators

A carrier that *describes* a document was being measured as though it *were* one.
⭐ The strong form of the defect: a `.meta.json` whose bytes happened to match an
authored document would have produced a duplication cluster between a document and a
statement about a document.

**Leak B — a deliberate non-attempt became a finding of absence.** 2E routed non-zero
Markdown to `unknown` only when it was ELIGIBLE for a text read:

```js
const textEligible = st.size > 0 && st.size < 16 * 1024 * 1024;
if (st.size === 0)                       { absent }
else if (textEligible && !textObserved)  { unknown }
else if (fmPresent === null)             { absent }   // ← a 17 MB .md lands HERE
```

A Markdown document of 16 MB or more was ineligible, skipped the `unknown` branch with
`fmPresent` still `null`, and was recorded as **absent frontmatter**. ⛔ *The instrument
chose not to look, and then reported what it had not seen as a finding.* That is the
original 2026-09-15 defect in its narrowest surviving form.

---

## 2. What 2F changes

**(1) Object kind is established before content analysis.** `isMetadataSidecar()` is
evaluated at the top of the records loop, before hashing and before any read.

**(2) Sidecars are counted as carriers and never opened.** A `metadata_sidecar` record
retains `rel`, `object_kind`, `ext`, `bytes`, `mtime` and `readability`. Every
content-derived field is `null`: `hash` · `frontmatter_fields_present` ·
`frontmatter_fields_missing` · `content_observed` · `domain_signal` ·
`soullab_authorship_signal`. `frontmatter_status` and `frontmatter_observation` are both
`not_applicable`. ⛔ Sidecar contents are not inspected, not deleted, not altered.

**(3) Content-derived denominators are corpus-document denominators.** Hash attempts,
text attempts, both trust rates, duplication, domain counts and authorship counts are
all over corpus documents. The startup read probe also samples corpus documents only —
a tree of readable carriers beside dataless documents must not be able to satisfy it.

**(4) Markdown standing follows observation, not eligibility.** The eligibility
predicate is gone:

```
zero bytes                            -> absent   (the size IS the observation)
content read                          -> complete | partial | absent
non-zero, not observed, ANY reason    -> unknown
```

**(5) Reason is preserved.** Every record carries `frontmatter_observation`:
`observed` · `read_failed` · `not_attempted_size_limit` · `not_attempted` ·
`not_applicable`.

**(6) Three populations, reported separately and never merged.**

| Population | Meaning |
|---|---|
| `filesystem_objects` | everything counted on disk |
| `metadata_sidecars` | `.meta.json` carriers — path and size only, never opened |
| `corpus_documents` | the denominator for every content-derived finding |

`census.population` carries all three plus `sidecar_contents_inspected: false`. The
extension, readability and top-level-directory tables are explicitly labelled as
filesystem-object tables — disk-format facts, not ingestion denominators.

**(7) Preserved unchanged.** Structural exactness (readdir/lstat must be 0) · both ≥95%
content gates · *unknown is not absence* · *not-applicable is not absence* · duplication
reported as an observed lower bound when hash coverage is partial · the containment
refusal · read-only by construction · exit codes `2 / 3 / 4 / 5 / 6`.

---

## 3. Acceptance witness

Fixtures under `/tmp/fx2`, disposable, built for this amendment. ⛔ The authoritative AIN
corpus was **not** touched and **no Part A Run #2 was performed**.

Control fixture `corpus/`: `a.md` (complete frontmatter, "Spiralogic") · `b.md` (partial,
"somatic") · `c.md` (no frontmatter, "Jung") · `empty.md` (zero bytes) · `doc.pdf`.

### A · object kind established before content analysis
`isMetadataSidecar()` is evaluated at the top of the records loop; the sidecar branch
`continue`s before `hashAttempts += 1` and before the text-read block. Verified by the
counter equalities in B.

### B · `.meta.json` counted as a carrier, absent from every content channel

| | control | `+ quiet sidecar` | `+ sidecar duplicating c.md` | `+ sidecar full of markers` |
|---|---|---|---|---|
| filesystem objects | 5 | **6** | **6** | **6** |
| metadata sidecars | 0 | **1** | **1** | **1** |
| corpus documents | 5 | **5** | **5** | **5** |
| hash attempts | 5 | **5** | **5** | **5** |
| text attempts | 3 | **3** | **3** | **3** |
| duplicate clusters | 0 | **0** | **0** | **0** |

⭐ The third fixture's sidecar is **byte-identical to `c.md`**. Under 2E it would have
been hashed and produced a cluster. Clusters remain **0** — the sidecar is absent from
duplication, not merely absent from the total.

Sidecar record, verbatim:

```json
{ "rel": "doc.pdf.meta.json", "object_kind": "metadata_sidecar", "ext": ".json",
  "bytes": 45, "readability": "immediate",
  "hash": null, "hashKind": null,
  "frontmatter_status": "not_applicable", "frontmatter_observation": "not_applicable",
  "frontmatter_fields_present": null, "frontmatter_fields_missing": null,
  "content_observed": null, "domain_signal": null, "soullab_authorship_signal": null }
```

### C · loud sidecar changes nothing
Fixture `sidemarkers/` carries `MAIA Spiralogic Soullab aether holoflower attunement
nafs qalb jung archetype somatic` inside the sidecar.

- domain counts: `{jungian_depth: 1, somatics: 1, spiralogic: 1}` — **identical to control**
- authorship signal files: `1` — **identical to control**

⛔ A Soullab term inside a carrier describes a document; it is not a term found in one.

### D · Markdown ≥ 16 MB
`huge.md`, 17 MB, no frontmatter:

```
frontmatter_status:        unknown
frontmatter_observation:   not_attempted_size_limit
frontmatter_fields_present: null
frontmatter_fields_missing: null
content_observed:          false
```

`markdown_frontmatter_unknown: 1`, `markdown_frontmatter_absent: 2` (unchanged from
control). ⛔ Never `absent`.

### E · zero-byte Markdown
`empty.md` → `frontmatter_status: absent`, `frontmatter_observation: observed`.
The size is itself the measurement.

### F · every previous gate unchanged

| Gate | Fixture | Exit | Observed |
|---|---|---|---|
| complete run | `corpus` · `side` · `sideloud` · `sidemarkers` · `bigmd` | **0** | reports written |
| usage | no `--out` | **2** | usage printed |
| containment | `--out` inside `--root` | **3** | REFUSED, nothing written |
| startup mass-read failure | `unread` (50 × mode 000, run as `nobody`) | **4** | `40 of 40 sampled files could not be read` |
| content channel < 95% | `p90` (10/100 md unreadable) | **5** | `text 90/100 · hash 90/100` |
| content channel < 95%, hash only | `h90` (10/100 pdf unreadable, 40 md readable) | **5** | `hash 130/140 (92.9%)` — ⭐ text channel at 100% did not rescue it |
| content channel ≥ 95% | `p96` (4/100 unreadable) | **0** | `text 96/100 · hash 96/100` |
| structural incompleteness | `sdir` (one subdirectory mode 000) | **6** | `readdir failures: 1` |

### G · corpus untouched
The authoritative vault is not reachable from this container. No run was performed
against it. ⛔ No Part A Run #2.

### H · STOP
⛔ **Final instrument acceptance is a founder act.** Nothing further is run until it is given.

---

## 4. Standing

**INSTRUMENT AMENDED THROUGH 2F · CARRIER IDENTITY SEPARATED FROM DOCUMENT IDENTITY ·
NON-ATTEMPT SEPARATED FROM ABSENCE · ALL REFUSAL CODES INTACT · ⛔ FINAL INSTRUMENT
ACCEPTANCE WITHHELD · ⛔ PART A RUN #2 NOT PERFORMED · ⛔ AUTHORITATIVE CORPUS UNTOUCHED ·
⛔ NOTHING INGESTED · ⛔ NOTHING INDEXED · ⛔ NOTHING EMBEDDED.**

> Visibility, readability, observation, applicability, carrier identity and claim scope
> now have separate semantics. The instrument can no longer say *absent* about anything
> it did not look at, and can no longer count a description of a document as a document.
