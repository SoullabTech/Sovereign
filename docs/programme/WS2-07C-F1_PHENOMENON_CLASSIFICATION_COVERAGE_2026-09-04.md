# WS2-07C-F1 — PHENOMENON CLASSIFICATION COVERAGE

> **Bounded follow-up, opened by founder act 2026-09-04. DIAGNOSIS ONLY. This does not reopen
> BUILD-07C, and it authorizes no repair, no ruling and no change to any unit.**

```text
LANE              WS2-07C-F1 · PHENOMENON CLASSIFICATION COVERAGE
PARENT            JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
STATE             OPEN · DIAGNOSIS ONLY · no determination made

TRIGGER           07D Gate B measured `classifier_unclassifiable` on 3 of 5 commissioned acts
                  over the same invented Work

AUTHORIZES        inspect the exact failing claim(s)
                  compare them against the closed eight phenomena
                  compare successful classifications from the same fixture
                  determine A / B / C below

DOES NOT AUTHORIZE  prompt tuning
                    vocabulary expansion
                    changing refuse-whole semantics
                    changing 07B
                    changing 07D
```

## The measurement that opened this

Five commissioned acts, one invented Work (*The Lantern Road*), lens `development`, classifier
`DEVELOPMENTAL-PHENOMENON-01`, model `claude-opus-5`:

```text
07C Gate B run 3   act 1 frozen (7 observations) · act 2 unclassifiable · act 3 frozen
07D Gate B run 1   act 1 unclassifiable · act 2 unclassifiable
                   ────────────────────────────────────────────────────────
                   2 froze · 3 refused at classify
```

Founder, 2026-09-04: *"That is no longer a one-off stochastic curiosity. It is a measured product
dependency. But it still does not tell us which thing is wrong."*

## The three possibilities — the determination this lane exists to make

```text
A. EXISTING FAMILY COVERS THE CLAIM
   the classifier failed to map it
   → 07C classifier / prompt reliability defect
   → repair implementation, family unchanged

B. EXISTING FAMILY DOES NOT COVER THE CLAIM
   → the eight-value phenomenon vocabulary is incomplete
   → founder ruling required before anything is added

C. THE CLAIM IS NOT A DEVELOPMENTAL PHENOMENON AT ALL
   → reader / classifier boundary problem
   → the correct behaviour may be to drop or refuse that claim, but that is a
     contract ruling and is not invented here
```

The test the founder set: *if a reasonable editor can point to one of the existing eight without
stretching its meaning* → A. *If none fits* → B. *If the claim exceeds what a phenomenon classifier
should receive at all* → C.

## What was NOT recoverable, and why this lane needed an instrument

The founder's sequence was: read the `history` array → identify the failing claim indexes → recover
those exact `ReaderClaimDraft`s from the Gate B record → determine A / B / C.

**The third step is not possible against any existing record.** Confirmed in the code
(`lib/manuscript/developmentalReading/classify.ts`):

```text
the refusal detail   `claim ${index} does not fit the v1 phenomenon family; the freeze is
                      refused rather than a category invented`
                      → the INDEX survives. The claim TEXT does not.
the persistence      a refused commission stores NOTHING (07C §10) — there is no row to read
the witness          records the route's JSON response only: {refusal, stage, detail}
and one more         `parseClassifierBlocks` refuses on the FIRST unclassifiable index it meets,
                      which is right for a freeze and blind for a census: three failing claims
                      are reported as one
```

So the failing claim text exists nowhere after the act that produced it. Recovering it is the
mechanically necessary first step of the diagnosis this lane authorizes, and it takes an
instrument.

## The instrument — `scripts/ws2-07c-f1-classification-diagnosis.ts`

```bash
cd "/Volumes/T7 Shield/maia-07c-gate-b" || exit 1
git fetch origin claude/writer-author-studios-roadmap-b2tqf5 || exit 1
git checkout -q <branch tip> || exit 1
test -n "${ANTHROPIC_API_KEY:-}" || { echo "STOP: no ANTHROPIC_API_KEY in this shell"; exit 1; }
DATABASE_URL="postgresql://soullab@localhost:5432/maia_07a_witness" \
  npx tsx scripts/ws2-07c-f1-classification-diagnosis.ts \
    --acts 3 --scope whole --lens development \
    --out ~/maia-witness-logs/ws2-07c-f1-whole.json
```

**What it is.** Fixture through the real draft route (the same invented Work as both Gate B
witnesses, so the runs are comparable) → 07A capture → 07A recover → the real 07B reader → the
production classifier request through the production seam. For each claim it prints the full text,
its evidence refs, its non-conclusions, and the classifier's verdict for that index.

**What it is not.** Not a commission. It never calls `commissionReading`, never calls the store,
and writes no row — the *one commission, one reading* rule governs commissions; this is an
observation, and running it cannot produce, retry or repair a reading. Its fixture member,
manuscript and session are removed at the end.

**What it may not change, and how that is held.** It **imports** `CLASSIFIER_SYSTEM` and
`classifierTool()` verbatim rather than restating them, and prints `classifierPromptHash()` so a
run whose prompt differs from production's by one byte is visible immediately. Prompt, family and
refuse-whole semantics are untouched.

**The one deliberate difference.** It reads the RAW tool blocks so it can report a verdict for
**every** index, then runs production's own `parseClassifierBlocks` over those same blocks and
records that it agrees. Production semantics are observed, never bypassed.

**Wiring proved** 2026-09-04 in the remote session against the scratch database with a deliberately
invalid key: fixture, structure, capture, recover, reader call, seam, refusal handling, record and
cleanup all exercised; the run ended at `provider_unavailable — 401`, exactly as a refused reader
should. Only the model call itself awaits the founder's key.

## The scope hypothesis — recorded as a question, not a diagnosis

07C Gate B read four sections at body depth (`w1 w2 w3 w5`). The 07D route derives the scope the
07D opening act specifies: the **whole** addressable draft, six sections, structure supplied. More
sections → more claims → and 07C refuses the whole freeze if **any** claim is unclassifiable, so a
single classification miss costs the entire reading.

Founder, 2026-09-04: *"Don't use whole-section scope as the diagnosis yet… right now that is only a
hypothesis."* The instrument therefore takes `--scope whole | 07c` so the two can be **measured**
side by side on the same fixture. Measuring it settles nothing on its own; the failing claim text is
still the first evidence.

## Sequence

```text
1  run the instrument (founder; --acts 3, then --scope 07c for comparison)
2  read the failing claims in full, beside the successful classifications from the same fixture
3  founder determines A / B / C
4  only then is a repair or a ruling authorized — in its own act, in its own lane
```

## What this lane does not do

It does not reopen BUILD-07C, whose closure stands. It does not touch BUILD-07D, which is
structurally proved and not closed. It proposes no phenomenon, tunes no prompt, and relaxes no
refuse-whole rule. It produces evidence and stops.
