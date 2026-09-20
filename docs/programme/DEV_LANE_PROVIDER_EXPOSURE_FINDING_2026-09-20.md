# DEV-LANE PROVIDER EXPOSURE — FINDING

**Date** 2026-09-20 · **Status** VALID · UNRESOLVED · ⛔ **NO LANE OPENED**
**Occasion** an external cross-provider review tool (`chaseai-yt/claudex-loop`) was
read and assessed. ⛔ **Not installed · not run · not recommended for installation.**
⛔ **No policy edited · no repair authorized · nothing about provider standing decided.**

---

## What prompted it

The tool's value proposition is *cross-provider adversarial review*: a plan or diff
is handed to the other provider's CLI (Codex → OpenAI) for an independent verdict.
Assessing whether that is admissible here sent me to the governing document. The
finding is what the document turned out to say — and what it turned out to cite.

---

## The defect class

⛔ **It is not *"we have no rule about Codex."*** It is:

> ⭐⭐ **The canon's data-class discipline is bound to the RUNTIME boundary, and the
> document canon names as governing the DEVELOPMENT boundary does not exist — so
> repository text, canon included, may leave the sovereign boundary at development
> time without crossing a gate, entering a record, or contradicting any committed rule.**

⚠️ Structurally the same family as **`BRANCH_POLICY_AUTHORITY_FINDING_2026-09-13`**
(a committed rule not authoritative in every execution environment) and the
2026-09-07 **merge-to-canonical** finding (schema became deployable merely by
becoming canonical). In all three the rule is sound and the **path actually taken
is ungoverned**. *A rule that does not cover the path is not a weak rule; it is an
absent one.*

---

## Observed, with evidence

```text
CANON SCOPE     docs/canon/PROVIDER_GOVERNANCE.md:62
                "who may enter the RUNTIME, and under what conditions"
                Tier table: OpenAI = Lab · may run in prod NO · may receive
                member data/audio NO (only inside an explicit gated evaluation)

CITED COMPANION docs/canon/PROVIDER_GOVERNANCE.md:66
                "Multi-Model Session Mode (../ai/MULTI_MODEL_SESSION_MODE.md)
                 — the development lane within which these tools operate"

ABSENT          docs/ai/MULTI_MODEL_SESSION_MODE.md does not exist.
                docs/ai/ does not exist.
                It has NEVER existed on any branch (verified below).

NOT IT          MULTI_MODEL_QUICKSTART.md (repo root) is a different subject:
                local Ollama/Mistral tier selection for MAIA's own runtime.
                It governs no development lane and names no provider boundary.

GUARD REACH     scripts/check-provider-governance.ts scans TRACKED SOURCE for
                openai imports/clients, the OpenAI REST host, and browser keys.
                It is an IMPORT guard. Piping repository text into a foreign
                provider's CLI adds no import, so the guard cannot observe it.
```

Re-run the verification:

```bash
git ls-files | grep -iE "multi.?model"                                  # no docs/ai file
git log --oneline --all --diff-filter=A -- '*MULTI_MODEL_SESSION_MODE*' # empty: never added
sed -n '60,66p' docs/canon/PROVIDER_GOVERNANCE.md                       # the dangling citation
# ⛔ NOT RUN in this session: no node_modules in the container. Its scope,
# not its result, is the point — it reads imports, and exposure needs none.
```

⭐ **The asymmetry is the sharpest part.** The tier table governs by *capability*:
`member_data`, `member_audio`, `chat`, `embedding`, `tts`, `stt`, `benchmark`.
**There is no capability for repository source or constitutional text.** So even
if the development-lane document existed, the vocabulary it would need to classify
the thing most at risk — the canon, the disclosure-receipt architecture, the
member-data schemas — does not exist either.

---

## Interim rule, offered ⛔ not taken

> **A green `check:no-openai` is never evidence that no repository text reached a
> Lab-tier provider.** The guard reads imports; exposure needs no import.

(Stated in the same form as the 2026-09-13 interim rule: *absence of the branch
hook is never evidence of branch-policy compliance.*)

---

## Three questions, and they must not be collapsed

- **Q1** May repository text leave the sovereign boundary to a Lab-tier provider at
  development time — and if so, which text, under what record?
- **Q2** How is a data class established for **repository source and constitutional
  text** at all? The capability vocabulary has none today.
- **Q3** Is `../ai/MULTI_MODEL_SESSION_MODE.md` a citation defect (wrong path to a
  document that exists under another name) or a **missing document** that canon has
  been deferring to for its dev-lane authority?

⛔⛔ **Do not answer Q2 or Q3 by adding an entry to `scripts/provider-policy.json`.**
That answers Q1 silently — by precedent, in the tree — while leaving the vocabulary
and the absent document exactly as they are. It is the same move as adding `claude/*`
to the branch script to settle an authority question.

---

## What is NOT established

- ⛔ **No claim that any canon or source text has left the boundary.** Nothing was
  measured. No tool-usage history, shell history, or provider account was read.
- ⛔ Not a claim that cross-provider adversarial review is wrong or should be refused.
  Independent review is the scarce resource here; the question is its custody.
- ⛔ Not a claim that `PROVIDER_GOVERNANCE.md` is defective **within its stated scope**.
  It says *runtime*, and within *runtime* it is intact. The gap is outside its scope
  and inside the document it points at.

---

## Companion: the part that needs no ruling

The reviewed tool's three transferable mechanics require **no foreign provider**.
They are bindings, not reviewers, and they are landed here as a candidate:

**`scripts/review-custody.ts`** (`npm run review:custody`) — `bind` · `admit` · `check`

1. **Approval bound to the plan's SHA256** — editing the plan invalidates the approval.
2. **Inspection bound to a complete change manifest** — tracked, staged **and untracked**;
   a deletion records as `ABSENT` rather than dropping out of the manifest.
3. **A review may not approve itself past its own findings** — `APPROVED` alongside any
   high/medium finding is refused; absent coverage is refused; an empty or malformed
   review file is a refusal, never a pass. Admission is monotonic
   (`admitted` → `already` with the original timestamp → `conflict`).

⛔ **It performs no review, runs no proof command, and confers no authority.** It cannot
establish that a reviewer's findings or coverage are truthful; zero findings is lawful
and is not evidence the reviewer was right. Its refusals say a *record* is inadmissible,
never that an implementation is correct. ⛔ It gates nothing until a founder act wires it
into a named acceptance law.

⭐ **Sequencing consequence:** the useful majority of the reviewed workflow — independent
review with custody that cannot be quietly reinterpreted — is available **Claude-on-Claude,
with zero exposure question**. Only the cross-provider increment depends on Q1. The ruling
is therefore not on the critical path to better review; it is on the critical path to
*foreign* review.

---

## Standing

**FINDING VALID · DEV-LANE PROVIDER EXPOSURE UNGOVERNED · CAPABILITY VOCABULARY HAS NO
CLASS FOR SOURCE OR CANON · CITED DEV-LANE DOCUMENT ABSENT (never existed) ·
Q1/Q2/Q3 OPEN AND UNCOLLAPSED · ⛔ NO LANE OPENED · ⛔ NO POLICY EDITED · ⛔ NO PROVIDER
STANDING CHANGED · ⛔ EXTERNAL TOOL NOT INSTALLED · CANDIDATE INSTRUMENT LANDED, GATING
NOTHING · PRODUCTION UNTOUCHED.**
