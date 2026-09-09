# Authorial Restoration — lane charter

**Founder ruling · 2026-09-10 · lane OPENED as direction · ⛔ NOT BUILT, NOT AUTHORIZED TO EDIT**

> ⭐ **THE GOVERNING RULE**
> **"Preserve what editing clarified. Recover what editing accidentally erased. Let the writer
> decide what belongs in the Work."**

**Framing, founder-ruled: this is AUTHORIAL RESTORATION, not "undoing the editor."**

---

## 1 · The two symmetric refusals

```text
⛔ NOT   everything the human editor removed was a mistake
⛔ NOT   the polished manuscript is more authoritative because it came later
```

### ⚠️ A third refusal, added here — **earlier is not automatically more authorial**

**The lane's own inversion hazard.** Recovery work drifts naturally toward *original = authentic*,
which is the **same normalization error running backwards**: substituting a rule about where text
came from for a judgment about what the Work needs.

⭐ **And there is a third possibility neither layer contains: what the writer would write NOW.**
A passage may have been rightly cut, wrongly cut, **or superseded by something the writer has not
yet written.** ⛔ **Restoration must not become archaeology that forecloses present authorship** —
the writer today holds authority over both past versions, and *"neither, I'd write it differently
now"* must be a first-class outcome, not an off-menu answer.

## 2 · Source hierarchy

```text
1  EARLY / PRE-EDITOR MANUSCRIPT     what the writer originally wrote
2  HUMAN-EDITED / INTERMEDIATE       what changed, moved, disappeared, was rewritten
3  CURRENT MANUSCRIPT                the destination — ⛔ NOT automatically the authority
```

**What is searched for, chapter by chapter — not merely sentences:**
lived scenes · rituals · dreams · family moments · encounters with nature · sensory detail ·
personal struggle · stories from practice · unusual metaphors · idiosyncratic turns of thought ·
repetitions functioning as spiral or return · **moments where the writer experiences an idea before
explaining it.**

> **Precisely the things a conventional editor may treat as digressive though they are central to
> the method.** (Law 2 · presumption against normalization.)

## 3 · Classification — nothing is pasted back automatically

```text
RECOVER     clearly strengthens the Work and restores authorial method
DEVELOP     valuable original material, needs shaping before return
HOLD        interesting, uncertain whether it belongs
LEAVE OUT   removal genuinely improved the Work

⭐ WRITE ANEW   none of the above — the writer writes it fresh
```

⭐ **WRITE ANEW is the founder-ratified fifth outcome.** ⛔ **Not another storage class** — the
architecture needs no new object. **The writer needs an explicit way to refuse the premise that the
answer is hidden somewhere in the archive.** Without it, *"authorial restoration"* quietly converts
historical provenance into authority, contradicting everything already ruled about standings over
time. **The present writer holds authority over both versions.**

**Disclosure format for anything substantial — this IS Law 4 applied:**

```text
Here is what was originally here.
Here is what the editor changed or removed.
Here is what I think was gained.
Here is what I think was lost.
Here are the options for restoring it.
YOU DECIDE.
```

⚠️ **And Law 4 applies to the PASS, not only to each item — founder-ratified.** A whole-manuscript
restoration sweep **can itself impose a theory**:

```text
⛔ "We are now restoring the original Kelly."
   is exactly as dangerous as
⛔ "We are now making Kelly more concise."
```

**The writer authorizes the sweep's parameters BEFORE it runs:**

```text
which versions are compared
which chapters are in scope
what kinds of loss are being looked for
whether moved material counts as loss
how much evidence is surfaced at once
where the pass STOPS before another decision is required
```

⛔ **Otherwise the restoration becomes another silent strategic transformation** — the writer
reverse-engineering a restoration exactly as they had to reverse-engineer an edit.

## 4 · ⭐ The second benefit — editing history as evidence of authorial grammar

**This does not merely find deleted text. It asks:**

> **What did the editing history reveal about this writer — and where did the editing improve or
> accidentally suppress that writer?**

```text
e.g.  "Lived encounter is written first and conceptualized afterward.
       Editors repeatedly compressed those encounters into exposition."
e.g.  "This was rightly cut here because the same experiential movement
       survives more powerfully three chapters later."
```

⭐ **Cross-version evidence is the strongest possible input to the Law 2 authorial grammar**, because
it shows the writer's method **surviving or failing contact with another intelligence** — and it is
the one place the grammar can be derived from behaviour rather than from self-report.

⚠️ **It is therefore also the strongest possible claim about a writer, and Law 5 §5.5.2 governs it:**
dated, superseded-by-successor, shown and correctable. ⛔ Never a static verdict about who this
writer is.

## 5 · Product surface (founder direction, 2026-09-10)

> *"we could have a section or an option that allows for works to be reworked based on old/new
> materials"*

**Recorded as direction. ⛔ Not designed, not specified, not authorized.** It belongs to the same
architecture already amended at D8 — a restored passage is an **observation with an evidence basis
in another version**, not a new class of object. **Do not invent a fifth store for it.**

## 6 · ⚠️ CORPUS FINDING — the recovery baseline does NOT exist in this repository

**Searched 2026-09-10.** Four manuscript artifacts exist under
`app/api/_backend/data/founder-knowledge/`:

```text
elemental-alchemy-full.json        3.7 MB   full prose  (chapters[].sections + fullContent)
elemental-alchemy-book.json         91 KB   headings only
elemental-alchemy-processed.json    57 KB   headings only
elemental-alchemy-summary.json      2.3 KB  summary
```

⛔ **None is a pre-human-editor manuscript.** All are derivatives of the published text. **The
founder's independent search of the file library reached the same conclusion.** The recovery corpus
must come from outside: earliest surviving DOCX, PDF, Scrivener export, Google Doc export, or a
tracked-changes version.

### 6.1 🔴 DEFECT — the production corpus reduces lived encounter to a teaching label

```text
                              full.json   book.json   processed.json
"My Morning Ritual"                 3          2             2      (heading survives)
"Chi Kung"                         11          0             0      (the practice does not)
"ancestors, guides"                 3          0             0      (the encounter does not)
```

⛔ **`book.json` and `processed.json` keep the TITLE of every lived encounter and discard the
encounter.** They render the book as `keyTeachings` — *"the information itself could be
compressed"*, which the Fire chapter explicitly says is **not** what this book is.

⭐ **This is Law 2's failure mode already live in production data, upstream of any model.** Whatever
MAIA retrieves from those files gets the writer's headings with the phenomenology removed —
**normalization performed by an ingest script rather than an editor.**

### 6.2 🔴 DEFECT — corroborated: `full.json`'s Chapter 4 section order is wrong

⚠️ **PROVENANCE CORRECTION (founder, same day).** An earlier wording here called `book.json` and
`processed.json` **"two independent files."** ⛔ **They are not independent witnesses.** They share
lineage from the published manuscript, so they are **two representations, not two witnesses** —
per the law already established: *two analytical views are not independent witnesses when their
evidence shares an influence lineage.* **The conclusion does not weaken; the provenance becomes
correct.**

```text
PRIMARY SOURCE              published manuscript
                            Chapter 4 → My Morning Ritual
                            (prayer · ancestors and guides · the elements · Chi Kung)

DERIVATIVE REPRESENTATIONS  book.json       → My Morning Ritual
                            processed.json  → My Morning Ritual

CONFLICTING REPRESENTATION  full.json       → starts at "Integrating the Elements"
                                              Morning Ritual misfiled under Chapter 3
```

> **The published book establishes the order directly. Two derivative representations preserve it.
> `full.json` conflicts with all three** — and it is the file the acceptance instrument read.
> **F-ABSENCE, with its cause now identified.**

⛔ **No repair authorized here.** Recorded for SEL-0, whose *freeze the lawful corpus before the
threshold* ruling this makes concrete and urgent.

## 7 · Standing

```text
LANE           OPENED as direction
GOVERNING RULE ratified (§0)
CALIBRATION    Chapter 4, once a genuine pre-editor source exists
BLOCKED ON     a recovery corpus that does not exist in this repository
⛔ NOT AUTHORIZED   no manuscript edit · no corpus repair · no surface built ·
                    no restoration pass run
```

---

## 8 · ⭐⭐ THE SUPERIMPOSED FAILURES — representation precedes cognition

**Founder ruling · 2026-09-10.** The Chapter 4 event was **two different failures superimposed**,
and separating them changes what must be fixed.

```text
SOURCE WORK              Morning Ritual belongs to Chapter 4
        ↓
INGEST / REPRESENTATION  Morning Ritual assigned elsewhere        ← FAILURE 1
        ↓
DEVELOPMENTAL READING    chapter appears to begin with exposition
        ↓
EDITORIAL POSSIBILITY    expository architecture becomes plausible ← FAILURE 2
```

⭐ **The system was partly reasoning CORRECTLY from an INCORRECT representation of the Work.** The
Morning Ritual was not judged expendable — **it was not present as Chapter 4 material at all.**

**The headings-only compression is the more disturbing of the two.** A representation that keeps
*"My Morning Ritual"* as a teaching label while losing meditation, prayer, guides, the harmonizing
of inner and outer, the elements and Chi Kung has not summarized prose. It has transformed:

> **a way of knowing → into → a topic about knowing.**

**That is the exact inversion the editorial laws exist to prevent — occurring UPSTREAM of the
model.**

### ⭐ The architectural law

> **Authorial sovereignty can be violated by representation before the model ever speaks.**
> **A perfectly governed editor cannot honor phenomenology it was never given.**
> **The Work must survive ingestion in the dimensions that make it the Work — not merely in
> informational content.**

⚠️ **Candidate acceptance criterion for manuscript ingestion (recorded, not adopted):** scenes,
stories, rituals, sequence, narrative position and embodied context **may not be collapsed into
topic labels without that loss being explicitly represented.**

### ⭐ SEL-0 is reframed

```text
WAS   "is retrieval good enough?"
NOW   "When MAIA believes she is reading the Work, what dimensions of the
       Work actually survived the journey into cognition?"
```

> **Before asking whether cognition is good enough, we must know whether the cognition was allowed
> to encounter the Work at all.** ⭐ **Founder: this now looks foundational.**
