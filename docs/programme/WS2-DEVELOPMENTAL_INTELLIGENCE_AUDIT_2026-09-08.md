# Writer's Studio — Source Audit + Phase-0 Falsification · 2026-09-08

**Status**: **PASS A COMPLETE FOR 7 LEADS · ZERO SOURCE-VERIFIED · QUOTA 0 of 5 LICENSED**
**Lane**: Step 1, READ / VERIFY. Opened by founder act 2026-09-08.
**Governs**: `WS2-DEVELOPMENTAL_INTELLIGENCE_RESEARCH_2026-09-08.md` §16 register.
**Revised**: 2026-09-08, founder ruling on ledger vocabulary. The first draft of this
file used a bare `CORROBORATED` status and applied `QUALIFIED` to two leads whose
primaries were never read. Both are corrected below; the prior draft stands in history
at `2f927db3f` rather than being erased.

---

## 0 · Two passes — the standard is not lowered to fit the environment

```text
PASS A — CORROBORATION                          executable here
  resolves source identity, obvious citation defects,
  headline figures, scope/generalization hazards

PASS B — PRIMARY-SOURCE VERIFICATION            still required
  page/section-level claim verification
```

**No research constraint graduates until Pass B.** This environment cannot perform Pass B: `WebFetch` is blocked by project policy and the `ctx_fetch_and_index` route CLAUDE.md prescribes is absent from this session. That is a limit on this session, not a revision of the standard.

The correct outcome of this session is therefore: **seven leads materially improved; zero source-verified.** That is a good audit result, not a failure.

### Ledger vocabulary — ruled

```text
SUPPORTED
Primary source was actually read and the cited claim is present at the stated
page/section/location.

QUALIFIED
Primary source was actually read, but the claim needs narrowing, caveat,
different population/task scope, or altered wording.

NOT SUPPORTED
Primary source was actually read and does not support the attributed claim,
or materially contradicts it.

REMOVE
Source cannot support the claim as used, cannot be established, or the claim
should leave the research record.

CORROBORATED — PRIMARY NOT READ
DOI/title/venue/authors and the attributed headline finding have been
independently corroborated, but the primary text itself was not inspected.
This status may guide what to audit next; it licenses no design constraint.
```

`SUPPORTED`, `QUALIFIED` and `NOT SUPPORTED` are **Pass B statuses only**. Nothing in this session can reach them.

Four columns are tracked separately so that no single status carries too much — in particular, **so that a DOI resolving successfully is never mistaken for evidentiary support**:

```text
SOURCE IDENTITY   resolved / unresolved
PRIMARY ACCESS    read / not read
CLAIM STATUS      supported / qualified / not supported / remove /
                  corroborated-only
LOCATION          page/section/table/figure — REQUIRED for SUPPORTED or QUALIFIED
```

---

## 1 · Citation ledger

| ID | Source identity | Primary access | Claim status | Location | Note |
|---|---|---|---|---|---|
| **D1** | RESOLVED — Sourati et al., *Nature Human Behaviour*, `10.1038/s41562-026-02550-0`; preprint `arXiv:2502.11266` | NOT READ | CORROBORATED — PRIMARY NOT READ | — | **Apparent DOI conflict dissolves.** `-02550-0` is the research article; `-02549-7` appears to be a separate NHB item ("AI writing assistants shrink linguistic diversity and blur personal identity"), i.e. accompanying coverage. The document cites the primary correctly. §16 row to be rewritten. |
| **B5** | RESOLVED — *Co-Designing an AI Feedback Tool for Visual Artists*, ACM C&C 2026, `10.1145/3803784.3807569` | NOT READ | CORROBORATED — PRIMARY NOT READ | — | **Citation defect narrowed from "unsupported finding" to "wrong/inadequate citation target".** The paper exists; replace `cc.acm.org/2026/proceedings/` with the DOI. No longer STRUCTURALLY UNSUPPORTED. |
| **B2** | RESOLVED — Gero et al., *From Planning to Revision*, DIS 2026, `10.1145/3800645.3813003`; `arXiv:2604.11009` | NOT READ | CORROBORATED — PRIMARY NOT READ | — | **Pass B hazard**: evidence population/task appears to be short-form essay writing; **book-length authorship generalization remains unlicensed**. Recorded as a hazard to verify, NOT as a `QUALIFIED` status. Add the DOI; the document cites only the preprint. |
| **C1** | RESOLVED — Rashkin et al., *Help Me Write a Story*, ACL 2025, `2025.acl-long.1254`; `arXiv:2507.16007` | NOT READ | CORROBORATED — PRIMARY NOT READ | — | **Pass B hazard, high design consequence** — see §2.1. Test set appears to be 1,300 deliberately corrupted stories with planted issues. SEL-0's rationale remains plausible; it **cannot yet become a verified research constraint**. |
| **§7** | RESOLVED — Claude Opus 5, `anthropic.com/news/claude-opus-5` + Claude Platform pricing docs | NOT READ | CORROBORATED — PRIMARY NOT READ | — | 1M context, $5/$25 per MTok; 1M default, long-context billed at standard pricing. Moves out of UNVERIFIED. Not SUPPORTED. |
| **§7** | RESOLVED — GPT-5.6 Sol, `developers.openai.com/api/docs/models/gpt-5.6-sol` | NOT READ | CORROBORATED — PRIMARY NOT READ | — | **Pass B hazard, high practical consequence** — see §2.2. |
| **§7** | RESOLVED — Gemini 3.8 Flash, `ai.google.dev/gemini-api/docs/pricing` | NOT READ | CORROBORATED — PRIMARY NOT READ | — | ~1M context; $0.75/$3.75 introductory through 2026-12-31, $1.50/$7.50 standard from 2027-01-01. Document's promotional caveat is correct. |

**Not yet audited**: A1, A2, A3, A4, B1, B3, B4, C2, C3, D2, E1, E2, E3.

---

## 2 · Pass B hazards — findings that would change something IF verified

> Every item in this section rests on a primary that was not read. Each is a **priority target for Pass B**, not an established finding. None licenses a design decision.

### 2.1 · C1 motivates SEL-0 but does not predict it — do not let it

The ACL study measures whether models identify **planted** issues in **deliberately corrupted** stories. SEL-0 measures whether MAIA ranks **genuine** observations on **uncorrupted published** prose.

The finding still justifies treating selection as a capability distinct from detection — that inference holds. What it does **not** do is establish that MAIA will fail selection, and it must not be cited as if it does. SEL-0 is a genuine open question, not a confirmation exercise with a known answer.

**Disposition**: C1 stays as a lead. If Pass B confirms the corrupted-set design, R-L13's strength drops from "shown" to "motivated" and the design must state it wherever relied on. Until then, R-L13 remains simply unadopted like every other candidate constraint.

### 2.2 · The §7 cost comparison inverts above 272K input tokens

OpenAI prices prompts **>272K input tokens at 2× input and 1.5× output for the full request**. The document omits this and presents $4/$20 as flat, describing GPT-5.6 Sol as having "lower listed cost than Opus 5".

At whole-Work scope — the regime Phases 7 and 8 operate in — the effective rates become:

```text
                     <=272K input        >272K input
GPT-5.6 Sol          $4 / $20            $8 / $30
Claude Opus 5        $5 / $25            $5 / $25   (standard at 1M)
Gemini 3.8 Flash     $0.75 / $3.75       $0.75 / $3.75  (through 2026-12-31)
```

**The stated ordering reverses.** Opus 5 is cheaper than GPT-5.6 Sol for any whole-manuscript pass. Additionally, GPT-5.6 Sol's $4/$20 is itself promotional (at least through 2026-11-21) — the document flags Gemini's promotional pricing but not OpenAI's.

**Disposition**: pending Pass B against the vendor pricing pages themselves. **No benchmark spend may be planned against the current table either way** — the existing table is corroborated-only, and this correction to it is corroborated-only as well. The registered Strand G protocol (research record §13) must carry verified pricing read at source.

---

## 3 · Phase-0 falsification matrix — **QUOTA 0 of 5 LICENSED · 2 candidates**

> **Consequence of the vocabulary ruling, applied here.** Both candidate challenges below are derived from primaries that were not read. A challenge built on an unread source cannot license a design constraint any more than a supporting claim can. **Pass A therefore cannot advance the quota at all.** The count is `0 of 5 licensed`; the two entries are candidates awaiting Pass B.

| Frozen assumption | Contrary evidence found | Threat | Survival condition | Disposition |
|---|---|---|---|---|
| Reading opens conversation, not report | none yet | — | — | UNTESTED |
| Writer chooses developmental act | none yet | — | — | UNTESTED |
| Writer chooses scope | none yet | — | — | UNTESTED |
| Write feeds Develop | B2 measures short-essay tasks; no evidence yet that ownership effects transfer to book-length work, in either direction | Our ownership reasoning generalizes from a population unlike our writers | Show the ownership gradient holds at manuscript scale, or restate R-L7 as essay-scale evidence applied by analogy | **CANDIDATE** — pending Pass B |
| Work understanding may persist with permission | none yet | — | — | UNTESTED |
| Session is primary quality unit | none yet | — | — | UNTESTED |
| Complexity stays below writer experience | B5 participants wanted **configurable but "sticky" controls** and differing AI personas | Some exposed control is *wanted*, not merely tolerated; "below the experience" could hide controls writers would choose to hold | Distinguish hidden *machinery* from withheld *authority*. Complexity may stay below; **choice may not** | **CANDIDATE** — pending Pass B; sharpens rather than defeats |
| Sovereignty decides eligibility; quality decides readiness | none yet | — | — | UNTESTED |

**Two candidates, both qualifications rather than defeats, and neither licensed until Pass B. The quota requires five substantive challenges. It stands at 0 licensed, and convergence may not be claimed.**

A third qualification (§2.1) was found, but it attacks *our reasoning about SEL-0* rather than a frozen Phase 0 assumption, so it does not count toward quota. Recorded, not counted.

---

## 4 · Folded-in safeguards (previously transcript-only)

### Voice baseline — opening conditions

```text
must record:
  source       published Elemental Alchemy corpus
  revision     named immutable revision
  digest       exact content digest
  captured_at  date / time
```

The baseline is the **published** corpus at a fixed digest — never "the manuscript as it stands in the Studio", which drifts with every session and would make the baseline a moving reference under a fixed label.

### SEL-0 — frozen order · **AMENDED 2026-09-08, step 0 added**

```text
0. FREEZE THE LAWFUL CANDIDATE CORPUS
     exact observation IDs
     exact count N
     digest / manifest
     exclusions named as constitutionally ineligible (F-7)
1. freeze numerical threshold      <- against the frozen N, never in the abstract
2. founder records top-5
3. lock founder ranking
4. reveal MAIA ranking
5. measure overlap / containment / ordering disagreement
```

**Why step 0 precedes the threshold — computed, not asserted.** The significance of any overlap depends on N. Under the null (MAIA's ranking random, founder marks 5 of N), the proposed `STRONG` criterion fires by chance at these rates:

| N | P(≥3/5 in MAIA top-5) | P(≥4/5 in MAIA top-10) |
|---:|---:|---:|
| 15 | **16.68%** | **43.36%** |
| 20 | **7.26%** | **15.17%** |
| 30 | 2.19% | 3.12% |
| 40 | 0.93% | 1.00% |
| 60 | 0.28% | 0.20% |
| 80 | 0.12% | 0.06% |
| 226 | 0.005% | 0.001% |

Two consequences, both predeclared **before the manifest exists**:

**(a) `3/5 + 4/10` is not evidence below N ≈ 30.** At N=15 it fires one time in six by chance; at N=20, one in fourteen. The same numbers that are near-impossible at N=226 are near-meaningless at N=15. **A threshold chosen without N is not a threshold.**

**(b) The top-10 containment measure is vacuous at small N, and which condition binds *flips*.** At N=15, MAIA's "top-10" is two-thirds of the entire corpus, so containment constrains almost nothing (43% by chance) — there, the top-5 condition is the stricter one. From N≈60 upward the relationship inverts and containment becomes the stricter test. Containment carries information only when `10 << N`.

**Predeclared floor**: SEL-0 as specified requires **N ≥ 40**. If the lawful corpus after F-7 exclusions is smaller, SEL-0 **must not be run against these measures and a weak result must not be read as a finding** — the instrument would need redesign (rank correlation over the full set rather than top-k overlap). *Recorded now so the floor cannot be reconsidered once N is known and a preferred reading exists.*

Independence alone is insufficient: if MAIA's ranking is visible first, "independent" degrades to "unanchored" and the ordering-disagreement measure loses most of its meaning.

---

## 5 · Standing

```text
PASS A (corroboration)       COMPLETE for 7 leads
PASS B (primary-source)      NOT STARTED — environment cannot perform it
LEADS AUDITED                7 of ~20
READ AT SOURCE               0
CLAIMS SUPPORTED             0
CLAIMS REMOVED               0
CITATION DEFECTS NARROWED    2  (D1 DOI dissolved · B5 target located)
PASS B HAZARDS RAISED        3  (B2 population · C1 corrupted set · §7 pricing)
FALSIFICATION QUOTA          0 of 5 LICENSED · 2 candidates
CONVERGENCE                  MAY NOT BE CLAIMED
CANDIDATE CONSTRAINTS        UNADOPTED
STEP 2 (voice baseline)      NOT OPENED
BUILD / PR / MERGE / DEPLOY  NOT AUTHORIZED
```

**Seven leads materially improved; zero source-verified.**

Pass A is incomplete by environment, not by judgement — thirteen leads and six Phase-0 rows remain. Pass B has not begun and cannot begin here. The audit standard was not lowered to fit what this session could do; doing so would recreate the exact defect Step 1 exists to remove.
