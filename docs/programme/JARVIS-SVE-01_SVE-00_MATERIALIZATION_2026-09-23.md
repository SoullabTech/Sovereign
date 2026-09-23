# JARVIS-SVE-01 · SVE-00 — CONSTITUTION MATERIALIZED

**Date:** 2026-09-23 · founder supplied the constitution text; this record is the SVE-00 act it prescribes
**Canonical base:** `clean-main-no-secrets @ 3f63ca65` (branch head contains it; verified `git merge-base --is-ancestor`)
**Branch:** `claude/lucid-hopper-2hz7ty`
**Constitution:** `docs/programme/JARVIS-SVE-01_CONSTITUTION_2026-09-23.md`

```text
Act: SVE-00 — CONSTITUTION (constitution §XXII)
Scope: two documentary files + one CLAUDE.md priority-thread bullet
Exclusions: no runtime change · no lib/app/scripts/database change · no existing programme semantics changed
Standing: CANDIDATE — materialized, ⛔ NOT RATIFIED
Gate: STOP for Founder adjudication
```

## 1 · What was done

1. The founder's JARVIS-SVE-01 text was landed verbatim under a provenance header. Nothing in the
   body was rewritten, reordered, or "tidied"; the fourteen laws were laid out as a table for
   reference but their wording is unchanged.
2. This record was written.
3. One bullet was added to the CLAUDE.md priority thread so a future session finds the candidate.

Nothing else moved. `git diff --stat` against the canonical base names exactly these three paths.

## 2 · What this act does NOT do

- ⛔ It does not ratify SVE-01. Materialization is custody, not adoption; ratification is a founder act.
- ⛔ It does not open SVE-01 through SVE-07. Each is its own STOP-bounded act per §XXII.
- ⛔ It does not change how any existing programme (KP-01, ORCHESTRATION-OPERATOR-01, JEV-01,
  REVIEW-CUSTODY-01, the S3 lineage) is governed. §XXI says SVE *wraps*; nothing is wrapped yet.
- ⛔ It does not establish that any SVE stage is implemented, enforced, or witnessed anywhere in the
  repository or runtime. Every stage is INSTRUCTIONAL LAW in the constitution's own §VII sense
  until an enforcement or governance mechanism exists for it.

## 3 · Reconciliation observations (for adjudication, ⛔ not adjudicated here)

These are read-only observations about how the candidate sits against law already in force.
They are offered so the founder can rule on them; the constitution text was not edited to resolve any.

**3.1 Precedence.** The canonical designation of `JARVIS_INSTRUCTIONAL_MANUAL_v1.md` (2026-09-17) fixes
`founder → ratified programme/constitutional law → manual → lane charters → implementation`. If ratified,
SVE-01 would sit at the *ratified constitutional law* tier and the manual would remain the operating
manual beneath it. The constitution does not say this itself; §XXI says only that it wraps programmes.
**Open:** where SVE-01 sits relative to the manual, and whether the manual's §5–18 operating cycle is
the same thing as the SVE flow or an implementation of it.

**3.2 Already-ratified law the candidate restates.** Several SVE laws are already in force under
other names, which is evidence of fit rather than redundancy — but a ratification should say
whether SVE becomes the *governing* statement or a *derived* one:

| SVE law | Existing law in force |
|---|---|
| L3, L6, L10 (verify before result; falsifiers; never weaken a verifier) | S3 Class-B discipline: *implementation fails suite → repair the implementation, ⛔ never reinterpret the law*; REVIEW-CUSTODY-01 freeze law; TESTING-01 §0 lethality-first |
| L5 (agent testimony is not world-state evidence) | Witness discipline: WITNESSED vs ENTAILED (S3-O1 production witness); *a probe is not the record* |
| L11 (repair may not become redesign) | JARVIS manual repair-lane instrument; Class-B collateral rule |
| L12 (passing execution ≠ canonical standing) | CLAIM_STATE_AUTHORITY: *evidence licenses; it does not itself edit the public record*; merge ≠ deploy ≠ live |
| L7, L8 (instructions are not boundaries; enforce mechanically) | Dockerfile deploy-lane tripwire; `askRuntimeCannotWrite`; BRANCH_POLICY_AUTHORITY_FINDING (a rule present but not authoritative in every environment) |
| §XII (critic must not inherit executor persuasion) | REVIEW-CUSTODY-01 Step 2: the reviewer must be a **separate process whose stream is captured**, never an in-process subagent |

**3.3 Programmes named in §XXI.** Of the six, `JARVIS-KP-01`, `JARVIS-ORCHESTRATION-OPERATOR-01`,
`JARVIS-NATIVE-PATCH` (as `scripts/builder/jarvis-native-patch-admission.mjs`) and `SERVING-IDENTITY`
(as `docs/architecture/SERVING_IDENTITY_*`) resolve to repository objects. `JARVIS-AGENT-MODE-01` and
`PRODUCTION-BUILD-SECURITY` resolve to nothing in `docs/`, `scripts/` or `CLAUDE.md` on this base.
⭐ This is the same defect class as the 2026-09-20 provider-governance finding (a governing document
citing a document that does not exist). **Open:** whether those two are names for things held outside
the repository, planned programmes, or citation defects. Not repaired here; the text is the founder's.

**3.4 External source.** The text refers to "the source", "the transcript" and "the uploaded source".
That material is not in the repository. The provenance header says so. ⛔ No claim is made about
what it contains, and nothing in this repository should later cite SVE-01 as evidence of what that
source says.

**3.5 §XXIII makes SVE self-falsifying.** *If the additional structure creates ceremony without
improving evidence, control or understanding, the framework SHALL be revised.* For that clause to
be operative rather than decorative, the first dogfood act (§XXIII) needs a predeclared measure of
"ceremony without improvement" before it runs — otherwise SVE would be assessed the way the
constitution forbids assessing anything else. **Open:** which existing bounded act is the dogfood
target, and what its falsifier is.

**3.6 Branch policy.** This act landed on a session-designated `claude/*` branch. Per the
2026-09-13 BRANCH_POLICY_AUTHORITY finding, `scripts/check-branch-allowed.sh` does not admit
`claude/*`, and the hook is not installed in this container (`core.hooksPath` unset). The interim
rule applies: **absence of the branch hook is never evidence of branch-policy compliance.** Recorded,
not repaired; merge to canonical is a separate act in any case.

## 4 · Owed before SVE-01 (spec contract) may open

- Founder adjudication of this materialization: **RATIFY · REVISE · WITHDRAW**.
- Rulings on 3.1 (precedence) and 3.3 (the two unresolved programme names), because SVE-01's
  spec object will need to name what it wraps.
- A named dogfood target for §XXIII, with its falsifier declared first.

## 5 · Standing

```text
SVE-00 ✅ MATERIALIZED · ⛔ NOT RATIFIED
SVE-01…07 ⛔ NOT OPENED
NO RUNTIME CHANGE · NO PROGRAMME SEMANTICS CHANGED · NO MERGE · NO DEPLOY · PRODUCTION UNTOUCHED
```
