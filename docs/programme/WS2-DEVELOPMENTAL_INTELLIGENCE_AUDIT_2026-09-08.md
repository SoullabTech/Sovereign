# Writer's Studio — Source Audit + Phase-0 Falsification · 2026-09-08

**Status**: **PARTIAL — 7 of ~20 citations audited · FALSIFICATION QUOTA NOT MET**
**Lane**: Step 1, READ / VERIFY. Opened by founder act 2026-09-08.
**Governs**: `WS2-DEVELOPMENTAL_INTELLIGENCE_RESEARCH_2026-09-08.md` §16 register.

---

## 0 · Method constraint — read this before trusting any row below

**No citation in this ledger has been read at source by this system.**

`WebFetch` is blocked by project policy; the `ctx_fetch_and_index` route CLAUDE.md prescribes as its replacement is not present in this session. What was performed is **corroboration**: DOI resolution, title/venue/author confirmation, and headline-figure agreement across independent URLs.

That is materially stronger than the original lead set — a resolving DOI at a real publisher, with a matching title, is evidence the lead set did not have. It is materially weaker than reading the page.

The four-value vocabulary (`SUPPORTED / QUALIFIED / NOT SUPPORTED / REMOVE`) cannot express this, and using `SUPPORTED` for it would reproduce the exact defect the restamp corrected. A fifth status is therefore added:

```text
CORROBORATED   DOI resolves; title, venue and headline figures agree across
               independent sources; NOT read at source. Page/section-level
               location is NOT established.
```

**No row below may be promoted to `SUPPORTED` without a page-level read.** Completing this audit to its declared standard requires an environment that can fetch primary sources.

---

## 1 · Citation ledger

| ID | Claim relied on | Primary source | Status | Note |
|---|---|---|---|---|
| **D1** | >880,000 texts, seven datasets; 21–50% writing-complexity variance reduction; identity cues altered | Sourati et al., *Nature Human Behaviour*, `10.1038/s41562-026-02550-0`; preprint `arXiv:2502.11266` | **CORROBORATED** | **DOI conflict RESOLVED — it was not a conflict.** `-02550-0` is the research article; `-02549-7` is a separate NHB item ("AI writing assistants shrink linguistic diversity and blur personal identity"), i.e. accompanying coverage, not a competing DOI. The document cites the primary correctly. §16 row to be rewritten. |
| **B5** | Artists wanted non-intrusive guidance preserving ownership, lifecycle adaptation, contextual memory, free-form input | *Co-Designing an AI Feedback Tool for Visual Artists*, ACM C&C 2026, `10.1145/3803784.3807569` | **CORROBORATED** | **Upgraded from STRUCTURALLY UNSUPPORTED.** The paper is real; the defect was the citation (index page), not the finding. Replace `cc.acm.org/2026/proceedings/` with the DOI. |
| **B2** | 253 participants; AI support at any stage reduced ownership; planning least, drafting most | Gero et al., *From Planning to Revision*, DIS 2026, `10.1145/3800645.3813003`; `arXiv:2604.11009` | **CORROBORATED · QUALIFIED** | Population is **short essay writing**, not book-length professional authorship. The document must carry this limit — the same discipline already applied to the L2 academic-writing study. Add the DOI; the document cites only the preprint. |
| **C1** | Models specific and mostly accurate, yet often miss the biggest issue and misjudge critical vs. positive feedback | Rashkin et al., *Help Me Write a Story*, ACL 2025, `2025.acl-long.1254`; `arXiv:2507.16007` | **CORROBORATED · QUALIFIED** | **Material design consequence — see §2.1.** The test set is **1,300 stories deliberately corrupted to plant writing issues**. That is a different task from ranking genuine observations on uncorrupted published prose. |
| **§7** | Claude Opus 5 — 1M context, $5/$25 per MTok | `anthropic.com/news/claude-opus-5`; Claude Platform pricing docs | **CORROBORATED** | 1M is default, no beta header, long-context billed at standard pricing. As documented. |
| **§7** | GPT-5.6 Sol — 1.05M context, 128K output, $4/$20 | `developers.openai.com/api/docs/models/gpt-5.6-sol` | **CORROBORATED · MATERIALLY INCOMPLETE** | **See §2.2. The document's cost comparison is wrong in the regime the bake-off runs in.** |
| **§7** | Gemini 3.8 Flash — ~1M context, $0.75/$3.75 promotional | `ai.google.dev/gemini-api/docs/pricing` | **CORROBORATED** | Introductory through 2026-12-31; standard $1.50/$7.50 from 2027-01-01. Document's promotional caveat is correct. |

**Not yet audited**: A1, A2, A3, A4, B1, B3, B4, C2, C3, D2, E1, E2, E3.

---

## 2 · Findings that change something

### 2.1 · C1 motivates SEL-0 but does not predict it — do not let it

The ACL study measures whether models identify **planted** issues in **deliberately corrupted** stories. SEL-0 measures whether MAIA ranks **genuine** observations on **uncorrupted published** prose.

The finding still justifies treating selection as a capability distinct from detection — that inference holds. What it does **not** do is establish that MAIA will fail selection, and it must not be cited as if it does. SEL-0 is a genuine open question, not a confirmation exercise with a known answer.

**Disposition**: C1 stays, with the corrupted-set design stated wherever it is relied on. R-L13 keeps its basis; its strength is reduced from "shown" to "motivated".

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

**Disposition**: §7 table must carry a long-context column and promotional-expiry dates. No benchmark spend may be planned against the current table.

---

## 3 · Phase-0 falsification matrix — **QUOTA NOT MET (2 of 5)**

| Frozen assumption | Contrary evidence found | Threat | Survival condition | Disposition |
|---|---|---|---|---|
| Reading opens conversation, not report | none yet | — | — | UNTESTED |
| Writer chooses developmental act | none yet | — | — | UNTESTED |
| Writer chooses scope | none yet | — | — | UNTESTED |
| Write feeds Develop | B2 measures short-essay tasks; no evidence yet that ownership effects transfer to book-length work, in either direction | Our ownership reasoning generalizes from a population unlike our writers | Show the ownership gradient holds at manuscript scale, or restate R-L7 as essay-scale evidence applied by analogy | **QUALIFIED** — record the limit; do not drop the claim |
| Work understanding may persist with permission | none yet | — | — | UNTESTED |
| Session is primary quality unit | none yet | — | — | UNTESTED |
| Complexity stays below writer experience | B5 participants wanted **configurable but "sticky" controls** and differing AI personas | Some exposed control is *wanted*, not merely tolerated; "below the experience" could hide controls writers would choose to hold | Distinguish hidden *machinery* from withheld *authority*. Complexity may stay below; **choice may not** | **TENSION** — sharpens the assumption rather than defeating it |
| Sovereignty decides eligibility; quality decides readiness | none yet | — | — | UNTESTED |

**Two candidate challenges, both qualifications rather than defeats. The quota requires five substantive challenges. It is not met, and convergence may not be claimed.**

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

### SEL-0 — frozen order

```text
1. freeze numerical threshold
2. founder records top-5
3. lock founder ranking
4. reveal MAIA ranking
5. measure overlap / containment / ordering disagreement
```

Independence alone is insufficient: if MAIA's ranking is visible first, "independent" degrades to "unanchored" and the ordering-disagreement measure loses most of its meaning.

---

## 5 · Standing

```text
CITATIONS AUDITED            7 of ~20
READ AT SOURCE               0 — environment cannot fetch primary sources
CLAIMS REMOVED               0
CLAIMS REPAIRED              2  (D1 DOI resolved · B5 citation located)
CLAIMS QUALIFIED             2  (B2 population · C1 corrupted-set design)
CLAIMS MATERIALLY INCOMPLETE 1  (§7 long-context pricing inverts ordering)
FALSIFICATION QUOTA          2 of 5 — NOT MET
CONVERGENCE                  MAY NOT BE CLAIMED
CANDIDATE CONSTRAINTS        UNADOPTED
STEP 2 (voice baseline)      NOT OPENED
BUILD / PR / MERGE / DEPLOY  NOT AUTHORIZED
```

The audit is **incomplete by environment, not by judgement**. Thirteen citations and six Phase-0 rows remain. Finishing to the declared standard requires primary-source reading this session cannot perform.
