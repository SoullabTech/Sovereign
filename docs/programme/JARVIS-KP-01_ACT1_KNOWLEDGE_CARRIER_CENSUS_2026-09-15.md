# JARVIS-KP-01 · ACT 1 — KNOWLEDGE-CARRIER CENSUS

**Lane:** `JARVIS-KP-01` — Shared Operational Knowledge Plane
**Act:** ACT 1 — KNOWLEDGE-CARRIER CENSUS ONLY
**Date:** 2026-09-15
**Performed by:** Claude (agent), under founder act opening ACT 1
**Branch:** `claude/clever-thompson-7wluhb`
**Repository state at census:** `53cd1852` (`docs(w4-schema-land): founder disposition of 5bd2c0426, and the landing preflight`)

---

## 0. Scope and standing of this record

**This record is a READ-ONLY inventory.** It reports where Soullab knowledge currently lives and
what standing each carrier possesses. It is evidence for adjudication.

⛔ **This record is not itself authority.** It ratifies nothing, closes nothing, supersedes nothing,
and creates no registry. Every finding below is an observation about carriers, not a ruling about
the objects those carriers describe.

### What was inspected

Everything reachable from a clean clone of `SoullabTech/Sovereign` in an isolated container:
the working tree, `git` history and refs, and the declared contents of committed files.

### ⚠️ What was NOT inspected, and why the distinction matters

| Not inspected | Reason |
|---|---|
| Production PostgreSQL (`schema_migrations`, member data, memory substrate) | Not reachable from this container. Named below as a carrier; **its contents are asserted by nobody here.** |
| Production runtime (`GIT_COMMIT`, `/api/health`, `DEPLOY_LANE`, image tags) | Same. |
| minisforum host state (`.deploy.lock`, `~/.bash_history`, `.env.production`) | Same. |
| Mac Studio local state (worktrees, `.env.docker`) | Machine-local by definition. |
| ChatGPT / Claude conversation history | Not a machine-reachable carrier from here. |
| Assistant memory entries | Not in the repository. |
| Google Drive / Docs | Reachable in principle via connector; **deliberately not enumerated** — reading member or founder documents is outside a read-only carrier census and was not authorized. |
| Obsidian vault | Does not exist yet; declared as ACT 7 intent only. |

⭐ **That table is itself a finding.** Roughly half the carriers that hold load-bearing Soullab truth
could not be read by an authorized agent doing exactly the work it was asked to do. The census
records their existence and standing from committed declarations, and marks every such entry
`UNVERIFIED-IN-THIS-CONTAINER`. ⛔ **No contents of an unreachable carrier are asserted anywhere below.**

---

## 1. Carrier families

```
A. REPOSITORY-BORNE      reachable from any clone, versioned, cross-machine
B. RUNTIME-BORNE         production only; authoritative for "what is live"
C. HOST-LOCAL            one machine; invisible to every other agent
D. CONVERSATIONAL        non-durable; disappears with the session
E. EXTERNAL              third-party surfaces
```

---

## 2. Family A — Repository-borne carriers

### A1 · Session anchor

```yaml
carrier: CLAUDE.md
location: /CLAUDE.md
purpose: orient a fresh session; declare non-negotiables, architecture entry points, current priority thread
authority: DECLARED PRIMARY ("SESSION ANCHOR — READ FIRST"); enforced by convention only
canonical_for:
  - project vows and prohibitions
  - infrastructure single-source-of-truth
  - the current priority thread
versioned: true (git)
provenance: strong for authorship; weak for currency
cross_machine_access: true
human_access: true (very long; ~1 screenful per bullet)
agent_access: true, but prose-only — no parseable status fields
write_authority: any agent or human with repo write; no mechanical distinction between
  recording a finding and declaring a ratification
supersession_mechanism: manual in-place edit; superseded clauses marked in prose
  ("⚠️ SUPERSEDED as of …"), never machine-checkable
known_failure_mode: ⭐ ANCHOR LAG — the anchor is the declared first read and is
  structurally the last thing updated
falsifier: "if the anchor is current, every lane with commits in the last 48h appears in it"
falsifier_result: ⛔ FAILED — see Finding F1
```

### A2 · Constitutional corpus

```yaml
carrier: canon
location: docs/canon/ (77 .md + use-frames/)
purpose: constitutional law — oath, invariants, claim discipline, authority direction
authority: HIGHEST in-repo; CLAUDE.md states canon governs all changes
canonical_for: vows, invariants, claim states, direction of authority, verification states
versioned: true
provenance: strong — most carry Status / Authority / Ratified headers
cross_machine_access: true
human_access: true
agent_access: partial — 39/77 carry a **Status:**/**Standing:** line in the first 15 lines;
  0/77 carry machine-parseable frontmatter
write_authority: undifferentiated repo write
supersession_mechanism: prose; some documents carry explicit supersession sections
known_failure_mode: ⚠️ MIXED RATIFICATION STATE — ratified canon, candidates, drafts and
  "recorded, not ratified" documents sit in one directory with no mechanical distinction
  (e.g. AIN_OS_..._DRAFT.md, ..._CANDIDATE_2026-07-31.md, THREE_AUTHORITY_CHAINS.md)
falsifier: "an agent can determine, without reading prose, which canon files are ratified law"
falsifier_result: ⛔ FAILED — 0/77 machine-parseable
```

### A3 · Programme records (lane work)

```yaml
carrier: programme records
location: docs/programme/ (199 .md + 8 .json + 1 other)
purpose: lane charters, censuses, designs, witnesses, closures, findings, rulings
authority: the de facto operational record of what happened and what was decided
canonical_for: lane state, act completion, witness results, founder rulings, routed-out findings
versioned: true
provenance: ⭐ STRONG WHERE PRESENT — witness records pin SHAs, JOP-04 carries structured
  .json evidence; this is the best evidence discipline in the repository
cross_machine_access: true
human_access: true, but ⚠️ unindexed — 208 records, 0 index/registry/README
agent_access: ⛔ WEAK — 0/199 frontmatter; 38/199 carry a **Status:**/**Standing:** line.
  ~81% of the operational record exposes no parseable standing at all
write_authority: undifferentiated repo write
supersession_mechanism: ⛔ NONE MECHANICAL — filename dates and in-prose "SUPERSEDED"
  markers only; no supersedes / superseded_by field; 0 git tags, 0 git notes
known_failure_mode: resolution requires reading many long prose records in full and
  reconstructing order from filenames
falsifier: "an agent can resolve the current standing of a named lane from structured fields"
falsifier_result: ⛔ FAILED
```

### A4 · Architecture / specs / ops / governance

```yaml
carrier: secondary doc corpora
location: docs/architecture/ (159) · docs/specs/ (75) · docs/ops/ (69) ·
  docs/governance/ (36) · docs/adr/ (6) · docs/incidents/ (2) · docs/decision-log.md (1)
purpose: design records, operational runbooks, governance covenants, decisions
authority: mixed and mostly undeclared
canonical_for: varies per document; frequently unstated
versioned: true
provenance: mixed; many undated and unattributed
cross_machine_access: true
human_access: true
agent_access: weak — same prose-only problem
write_authority: undifferentiated
supersession_mechanism: prose; frequently absent
known_failure_mode: ⚠️ FROZEN PLANS INDISTINGUISHABLE FROM ACTIVE ONES — CLAUDE.md's
  Cat-5 "frozen plan" category exists precisely because specs carry "does not authorize"
  language that only a careful reader finds
falsifier: "docs/decision-log.md and docs/adr/ together record the project's decisions"
falsifier_result: ⛔ FAILED — 1 file and 6 ADRs against 208 programme records;
  the decision record lives in docs/programme/, not in the surfaces named for it
```

### A5 · Root-level Markdown

```yaml
carrier: root-level status documents
location: /*.md (212 files)
purpose: historical — completion announcements, status reports, launch checklists
authority: ⛔ NONE. No document declares standing.
canonical_for: nothing
versioned: true
provenance: weak — mostly undated, unattributed
cross_machine_access: true
human_access: true (and prominent — first thing `ls` shows)
agent_access: true (and dangerous — see failure mode)
write_authority: undifferentiated
supersession_mechanism: ⛔ NONE
known_failure_mode: ⭐⭐ CLAIM-INFLATION RESERVOIR AND THE LARGEST AGENT-MISLEADING
  SURFACE IN THE REPOSITORY. 59 of 212 root files are named COMPLETE / READY / CERTIFIED /
  SUCCESS / BREAKTHROUGH (e.g. PERSISTENT_MEMORY_CERTIFIED.md, MEMORY_TRUTH_CONSTRAINTS_CERTIFIED.md,
  CONSCIOUSNESS_COMPUTING_LAUNCH_COMPLETE.md). A fresh agent that reads the repository root
  — the most natural orientation gesture there is — derives LIVE status for capabilities that
  CLAUDE.md classifies as Cat 1–5. These filenames assert in the exact register that
  MARKETING_CLAIM_DISCIPLINE.md forbids, and they are louder than the canon that forbids them.
falsifier: "a fresh agent reading only repository-root filenames forms an accurate picture of
  what is live"
falsifier_result: ⛔ FAILED — and failed in the inflating direction
```

### A6 · Git history, refs, and PRs

```yaml
carrier: git
location: .git/ + GitHub SoullabTech/Sovereign
purpose: immutable record of change; the only true chronology in the system
authority: ⭐ HIGHEST for "what actually changed, when, by whom"
canonical_for: content of every versioned carrier at every point in time; SHA identity
versioned: intrinsically
provenance: ⭐ STRONGEST IN THE SYSTEM — cryptographic, append-only in practice
cross_machine_access: true
human_access: partial — requires knowing what to look for
agent_access: ⭐ EXCELLENT for content and chronology; ⛔ NONE for standing
  (git knows a file changed; it does not know the file became law)
write_authority: repo write; ⚠️ branch policy exists (scripts/check-branch-allowed.sh, allowing
  main | clean-main-no-secrets | phase4.6-reflective-agentics | feature/* | fix/* | chore/*)
  but is enforced by a hook that is absent in remote containers
supersession_mechanism: commit order and merge topology — reliable for content, silent on authority
known_failure_mode: ⭐ 0 git tags and 0 git notes exist. The one carrier with perfect provenance
  carries no semantic layer at all. Nothing marks a SHA as "witnessed", "ratified" or "deployed".
  Every such binding lives in prose inside a record that points at the SHA, never on the SHA.
falsifier: "a governance-significant commit is mechanically distinguishable from a typo fix"
falsifier_result: ⛔ FAILED
live_observation: ⚠️ this census session runs on branch `claude/clever-thompson-7wluhb`,
  which the committed branch policy does NOT allow, with `core.hooksPath` unset — reproducing
  the 2026-09-13 branch-policy authority finding live rather than restating it
```

### A7 · Migrations (schema authority, repository half)

```yaml
carrier: migration files
location: database/migrations/ (487 .sql + 3 non-.sql)
purpose: declare schema change
authority: ⭐⭐ LATENT DEPLOY AUTHORITY — per the 2026-09-07 finding, merging a migration to
  clean-main-no-secrets authorizes the next unrelated full deploy to apply it
canonical_for: the intended schema
versioned: true
provenance: strong (filename timestamps + git)
cross_machine_access: true
human_access: true
agent_access: true (filenames are structured — the best-structured carrier in the repo)
write_authority: undifferentiated repo write; ⛔ and repo write is therefore, in effect,
  deferred production schema write
supersession_mechanism: additive convention; ⚠️ not universal (20260907000002 DROPs and
  narrows a CHECK constraint)
known_failure_mode: ⭐ SPLIT AND DRIFTING AUTHORITY — the files say what schema should exist;
  only production's ledger says what does. Counts observed: 487 .sql on this branch today;
  480 counted 2026-09-14; 529 ledger rows in production, of which ~52 name files that no
  longer exist (per the S3-O1 routed-out observation). ⛔ None of these numbers can be
  reconciled from a clone.
  Two migrations dated 2026-09-15 (20260915000001, 20260915000002) exist on this branch and
  appear in no anchor bullet.
falsifier: "the live schema can be determined from the repository"
falsifier_result: ⛔ FAILED BY CONSTRUCTION — requires carrier B1
```

### A8 · Executable law and gates

```yaml
carrier: constitutional tests, verifiers, guards
location: tests/constitutional/ (43 files: refusal-registry, s3, s3-substrate, sanctuary proofs) ·
  scripts/verify-*.{ts,sh} · scripts/guards/ (43 verify/guard entries)
purpose: make law checkable rather than assertable
authority: ⭐⭐ THE STRONGEST AGENT-USABLE AUTHORITY IN THE SYSTEM — a guard refuses; prose persuades
canonical_for: the specific invariants each guard encodes
versioned: true
provenance: strong — the verifier IS the evidence when it runs
cross_machine_access: true (code); ⚠️ execution needs node_modules and often a database
human_access: partial — requires reading code
agent_access: ⭐ EXCELLENT — machine-executable, exit-coded, unambiguous
write_authority: undifferentiated; ⚠️ an agent may weaken a guard in the same act that
  makes its change pass (the move the S3 lane repeatedly refused, by discipline not mechanism)
supersession_mechanism: code change; ⚠️ silent — a weakened guard still exits 0
known_failure_mode: ⛔ A GATE NAMED IN PROSE IS NOT A GATE. CLAUDE.md declared
  `verify-colab-boundaries.ts` mandatory before tester invites; VERIFIED: that filename exists
  nowhere in the repository. The real gate is scripts/verify-constitution-colab.ts (present,
  20,927 bytes). The mandatory gate was, as written, unrunnable — self-disclosed in the anchor
  and confirmed here.
falsifier: "every gate named as mandatory in canon or anchor resolves to an executable file"
falsifier_result: ⛔ FAILED (1 known instance, now corrected in prose but not mechanically prevented)
```

### A9 · Machine-authoritative configuration

```yaml
carrier: config + baselines
location: config/accessMatrix.ts · typecheck-baseline.json · tsconfig.*.json (10 variants)
purpose: authority that executes rather than describes
authority: ⭐ REAL AND ENFORCED — accessMatrix is enforced by middleware; the baseline gates CI
canonical_for: route access rules; accepted type-debt
versioned: true
provenance: ⚠️ WEAK AT THE SOURCE — accessMatrix.ts declares "Generated from:
  practitioner-os/docs/OFFERINGS_INVENTORY.md"; VERIFIED: that path does not exist, and no
  file of that name exists anywhere in the repository
cross_machine_access: true
human_access: partial
agent_access: ⭐ EXCELLENT — typed, structured, parseable
write_authority: undifferentiated
supersession_mechanism: ⭐ typecheck-baseline.json has a GOVERNED one
  (`npm run typecheck:baseline` refuses to write without `--accept-current`) — the single
  best supersession control found anywhere in this census, and the model ACT 6 should study
known_failure_mode: ORPHANED GENERATING SOURCE — a machine-authoritative file names a
  human source that does not exist, so its provenance chain terminates in nothing
falsifier: "every generated artifact's declared source is present"
falsifier_result: ⛔ FAILED
```

### A10 · Agent configuration

```yaml
carrier: agent-facing config
location: .claude/ (agents, commands, skills, plans, projects, project-context.md,
  AGENTS_MANUAL.md, launch.json) · AGENTS.md · PROJECT_CONTEXT.md
purpose: shape agent behaviour before any task begins
authority: OPERATIVE — these run
canonical_for: agent roles, available skills, project framing
versioned: true
cross_machine_access: true
human_access: partial
agent_access: true
write_authority: undifferentiated
supersession_mechanism: none declared
known_failure_mode: ⚠️ THREE COMPETING ORIENTATION SURFACES — CLAUDE.md,
  .claude/project-context.md and PROJECT_CONTEXT.md all orient a new agent, with no
  declared precedence among them
falsifier: "there is one declared orientation entry point"
falsifier_result: ⛔ FAILED
```

---

## 3. Family B — Runtime-borne carriers · ⚠️ ALL UNVERIFIED-IN-THIS-CONTAINER

⛔ Existence and standing below are taken from committed declarations. **No contents are asserted.**

```yaml
- carrier: production schema ledger
  location: maia-postgres · schema_migrations
  authority: ⭐⭐ CANONICAL FOR LIVE SCHEMA — outranks every repository file
  agent_access: ⛔ NONE without SSH to minisforum
  known_failure_mode: the authoritative answer to "what is deployed" is unreachable from
    every environment where agents actually work
  falsifier: "an authorized agent can answer 'is migration X live?' from its workspace" → ⛔ FAILS

- carrier: runtime provenance
  location: container env GIT_COMMIT · DEPLOY_LANE · /api/health · image tags current/previous/<sha>
  authority: ⭐ CANONICAL FOR "WHAT CODE IS LIVE"
  provenance: strong — verified three ways in the S3-O1 act
  agent_access: ⛔ NONE from a clone
  known_failure_mode: documented to have reported `unknown` when a deploy bypassed the lane

- carrier: member + memory substrate
  location: maia-postgres (members, atoms, agent_runs, receipts, ask_*)
  authority: canonical for member truth
  agent_access: ⛔ NONE — and correctly so; sovereignty, not a defect
  known_failure_mode: ⚠️ none as a carrier. ⛔ FLAGGED: this carrier must NEVER be folded
    into a shared knowledge plane. Sanctuary Mode and the memory-consent invariants bind
    JARVIS-KP-01 exactly as they bind MAIA.

- carrier: deploy lock holder record
  location: /home/soullab/MAIA-SOVEREIGN/.deploy.lock
  authority: incidental; became decisive evidence in the S3-O1 act
  versioned: false
  supersession_mechanism: ⛔ OVERWRITTEN BY EVERY ACQUISITION
  known_failure_mode: ⭐ the 2026-09-07 finding states its absence "carries ZERO information";
    a carrier that overwrites itself can prove presence but never absence

- carrier: shell history
  location: ~/.bash_history on minisforum
  authority: ⛔ NONE — accidental
  known_failure_mode: ⭐⭐ USED AS FORENSIC EVIDENCE IN A GOVERNANCE INVESTIGATION
    (2026-09-07 attribution) because no designed carrier existed. It has no timestamps,
    so attribution remains formally UNKNOWN. This is the clearest single argument for
    JARVIS-KP-01: when the designed record is absent, investigation falls back to artifacts
    that were never meant to bear weight, and the answer is permanently unavailable.
```

---

## 4. Family C — Host-local carriers

```yaml
- carrier: machine-local secrets and worktrees
  location: Mac Studio ~/MAIA-SOVEREIGN/.env.docker · minisforum .env.production · local worktrees
  authority: operationally load-bearing, epistemically none
  cross_machine_access: ⛔ FALSE BY DEFINITION
  known_failure_mode: ⭐ ALREADY A DOCUMENTED TRAP — `npm run preflight` fails in any fresh
    worktree because .env.docker exists only in the main checkout. A declared project-wide
    gate is not runnable project-wide. Same shape as A8's missing gate: the environment,
    not the law, decides whether the law applies.
  falsifier: "the documented preflight runs anywhere the repo is cloned" → ⛔ FAILS
```

---

## 5. Family D — Conversational and non-durable carriers

⭐⭐ **This family is the reason the lane exists.**

```yaml
- carrier: Claude Code session transcripts
  authority: ⛔ NONE formally; ⚠️ HIGH in practice — rulings are relayed, understood and acted on
    inside sessions before any record exists, and sometimes without one
  versioned: false
  cross_machine_access: false
  agent_access: ⛔ NONE — a fresh agent inherits nothing
  supersession_mechanism: ⛔ NONE
  known_failure_mode: ⭐ EVIDENCE OF LOSS IS ALREADY IN THE RECORD — the S3-O1 witness
    reports its transcript head lost, and the lane REFUSED to backfill it from the successful
    outcome, recovering the missing fact from a durable artifact instead. That refusal is
    exemplary discipline; it is also a lane spending effort to survive a carrier defect.
  falsifier: "a founder ruling given in session is recoverable after the session ends"
  falsifier_result: ⛔ FAILS unless someone wrote it down

- carrier: ChatGPT conversations
  authority: ⛔ NONE
  agent_access: ⛔ NONE
  known_failure_mode: origin-point knowledge with no path into any durable carrier

- carrier: assistant memory entries
  location: Claude memory (not in repository)
  authority: ⛔ NONE formally — ⚠️ BUT CITED AS AUTHORITY BY THE ANCHOR
  known_failure_mode: ⭐ VERIFIED — CLAUDE.md defers substantive detail to
    `memory project_anchor_consent_gate_live` and `memory project_six_category_artifact_typology`
    (the latter defining the six-category typology the anchor's whole state model rests on).
    Load-bearing content is addressed by reference into a carrier that is not versioned,
    not cross-machine, and not agent-reachable. ⛔ The anchor has a dangling pointer into
    conversational memory.
  falsifier: "every carrier CLAUDE.md cites as authority is reachable by a fresh agent"
  falsifier_result: ⛔ FAILED
```

---

## 6. Family E — External carriers

```yaml
- carrier: GitHub PRs, reviews, checks
  authority: ⚠️ DECISION-BEARING — review threads and PR bodies carry rulings
  agent_access: true via API
  known_failure_mode: ⭐ pushes to clean-main-no-secrets have reported
    "Bypassed rule violations … 4 of 4 required status checks are expected" — the production
    branch accepts writes without its declared checks, and (per A7) whatever lands there is
    schema the next deploy applies

- carrier: Google Drive / Docs
  authority: undeclared
  agent_access: reachable via connector; ⛔ NOT ENUMERATED in this census by choice
  known_failure_mode: unknown standing — no document declares what Drive is canonical for

- carrier: Obsidian
  status: ⛔ DOES NOT EXIST. Named in ACT 7 as a future projection target only.
  note: recorded so a later reader does not mistake the proposal for a carrier
```

---

## 7. Findings

### F1 · ⭐ Anchor lag is measurable, not hypothetical

`CLAUDE.md` was last modified `2572dc9b` (2026-09-14). Since then: **6 commits on 2026-09-15**
carrying the `W4-SCHEMA` and `W5-LANDING` lanes, 5 new programme records, and 2 new migrations.
Verified by grep: `W4-SCHEMA|W5-LANDING|W5_WITNESS` appears **0 times** in the anchor.
`S3-O1_ACT_REFUSED_SCOPE_DRIFT` appears **0 times**. `WS-DISCLOSURE-ORIENTATION` appears once —
as **NEXT** — while that lane has already produced a census, a ruling, a design and a merged PR.

⛔ The declared first read is behind the record by at least one working day, in a direction that
makes a fresh agent believe unstarted work is next and finished work has not happened.

### F2 · ⭐⭐ The operational record is unindexed and machine-opaque

| Measure | Result |
|---|---|
| Programme records | 208 |
| Index / registry / README in `docs/programme/` | **0** |
| Programme `.md` with YAML frontmatter | **0 / 199** |
| Programme `.md` with a `**Status:**`/`**Standing:**` line in first 15 lines | **38 / 199 (19%)** |
| Canon `.md` with frontmatter | **0 / 77** |
| Canon `.md` with a status line | **39 / 77 (51%)** |
| git tags | **0** |
| git notes | **0** |

⭐ **This is the single most consequential finding for ACT 3–5.** There is no field anywhere that a
resolver could read. Status exists only inside prose, in records that must be found before they can
be read, with nothing to find them by. Every reconstruction is therefore a full read of an unknown
subset of 208 long documents — which is exactly the cost the lane was opened to remove.

### F3 · ⭐ Supersession has no mechanism

Supersession is performed by editing a bullet in place and writing that it is superseded. This is
done **well** — the anchor's practice of marking a superseded claim rather than deleting it is
genuinely good discipline, and the 2026-09-07 bullet corrects two of its own earlier readings in
place rather than quietly rewriting them.

⛔ But it is unavailable to a machine. There is no `supersedes` / `superseded_by`, and with 0 tags
and 0 notes, nothing binds a claim to the SHA that settled it. **ACT 4's supersession resolution
step has nothing to resolve against today.**

### F4 · ⭐⭐ The authority ontology partly EXISTS — and its decisive axis is explicitly unruled

⛔ **ACT 2 must not be written as if starting from zero.** Found in canon:

- **`docs/canon/THREE_AUTHORITY_CHAINS.md`** — four dimensions: referential authority (*what artifact
  governs?*), evidence authority (*what evidence satisfies it?*), **state authority (*who may move an
  artifact through its lifecycle?*)**, approval authority (*who approves?*). It already states
  `Draft → Frozen → Executed → Accepted / Refused` and warns that approval authority is not state
  authority.
  ⚠️ **Its own status is `⏳ Recorded, not ratified — authorizes nothing and rules nothing until
  Kelly ratifies it`**, and **dimension 3 is marked `⏳ unruled`.**
  ⭐⭐ Dimension 3 is precisely the axis a resolver needs. The document that best anticipates this
  lane is itself unratified, and the question this lane most needs answered is the one it left open.
  It also carries a standing instruction: *"Resist adding any further governance mechanism until
  these three chains are explicitly documented."*

- **`docs/canon/CLAIM_STATE_AUTHORITY.md`** (ratified) — already rules the exact asymmetry ACT 6
  needs: *state is a finding, not a decision*; *authority does not manufacture warrant*; downgrade
  is mandatory when warrant is absent. ⭐ This is the admission rule for the write-back protocol,
  already law.

### F5 · ⭐⭐ Three state vocabularies are already in force; the proposal would make four

| Vocabulary | Source | Standing |
|---|---|---|
| `LIVE / WARNING / PENDING` | `docs/canon/VERIFICATION_STATES.md` | **Ratified canon (2026-07-01)** |
| `Live / Designed / Vision` | `MARKETING_CLAIM_DISCIPLINE.md` + `CLAIM_STATE_AUTHORITY.md` | **Ratified canon** |
| `Cat 1 … Cat 6` (six-category typology) | `CLAUDE.md` (+ assistant memory) | Operative in the anchor |
| `DISCOVERED / ATTESTED / VERIFIED / ADJUDICATED / RATIFIED / SUPERSEDED / CLOSED` | ACT 2 proposal | **Proposed** |

⛔ **Adding the fourth without adjudicating the first three would reproduce, inside the instrument
built to end ambiguity, the exact ambiguity it exists to end.** The proposal's own instinct to
separate epistemic standing from workflow status is sound and is **already partly ratified** —
`VERIFICATION_STATES` is capability-state, `Live/Designed/Vision` is claim-state, and they are
deliberately different axes. ACT 2's first question is therefore not *what states should exist* but
*which ratified vocabulary governs which axis, and what remains genuinely unnamed*.

### F6 · Orphaned authority references — three verified

| Reference | Cited by | Exists? |
|---|---|---|
| `WISDOM_IS_RECOVERED.md` | `CLAUDE.md`, `docs/architecture/REFUSAL_REGISTRY.md`, `LIVING_PROFILE_RECONCILIATION_2026-07-20.md`, `BECOMING_IMPLEMENTATION_GATE.md` | ⛔ **NO** |
| `verify-colab-boundaries.ts` (declared mandatory pre-invite gate) | `CLAUDE.md`, `docs/ops/COLAB_RELEASE_GATE.md` | ⛔ **NO** (self-disclosed; real gate is `verify-constitution-colab.ts`) |
| `practitioner-os/docs/OFFERINGS_INVENTORY.md` (declared source of `config/accessMatrix.ts`) | `config/accessMatrix.ts` | ⛔ **NO** |

⭐ Note the pattern: **one orphan is cited by four documents including the anchor and a refusal
registry; one was a mandatory gate; one is the provenance of an enforced access-control file.**
These are not stale footnotes — they are load-bearing citations pointing at nothing, and prose
cannot detect them. A resolver could, in one pass.

### F7 · ⭐⭐ Write authority is undifferentiated everywhere it matters

In every repository-borne carrier, the same permission — repo write — suffices to:
fix a typo · record a finding · author a new canon document · mark a lane CLOSED · edit the anchor's
priority thread · weaken a constitutional guard · add a migration that the next unrelated deploy
will apply to production.

⛔ There is no mechanical distinction between **recording** and **ratifying**. The distinction is
real, deeply developed in canon, and enforced entirely by the discipline of whoever is working.
⭐ The one counter-example found — `npm run typecheck:baseline` refusing to write without
`--accept-current` — proves the control is buildable and should be ACT 6's model.

### F8 · ⭐ Good practice exists and is not uniform

⛔ This census should not be read as "the record is bad". Found and worth preserving verbatim into
any future design: SHA-pinned witness records · structured `.json` evidence (JOP-04) · the
two-evidence-class discipline (WITNESSED vs ENTAILED) in `S3-O1_PRODUCTION_WITNESS` · in-place
correction that preserves the superseded claim · routed-out findings that refuse to open a lane
they discovered · the governed baseline.

⭐ **The problem is not the absence of epistemic discipline. It is that the discipline lives in
practitioners and prose rather than in structure, so each lane must re-derive it, and a fresh agent
inherits none of it.** That is the precise gap JARVIS-KP-01 names.

### F9 · The fallback carriers are the loudest evidence

When the designed record was absent, investigations fell back to: an overwriting lockfile
(`.deploy.lock`), a timestamp-free shell history, and Docker image build times. One of those
investigations ended in **permanently unanswerable attribution**.

⭐ An append-only line per governance-significant act would have answered it in one query. The
finding is already recorded in the anchor; this census confirms no such carrier has since been built.

---

## 8. Answering ACT 0's ten questions from carriers as they stand today

| # | Question | Answerable from durable carriers? |
|---|---|---|
| 1 | What object am I looking at? | ⚠️ Partly — by filename convention only; no registry |
| 2 | What is its current status? | ⛔ No — prose only; 19% of programme records expose any status line |
| 3 | What source is canonical? | ⛔ No — undeclared for most carriers; three orientation surfaces compete |
| 4 | What authority established that status? | ⚠️ Often, in prose, where a record says so |
| 5 | What evidence supports it? | ⭐ Yes where witness records exist — the strongest area |
| 6 | What supersedes it? | ⛔ No mechanism |
| 7 | What work is currently authorized? | ⚠️ Anchor only, and the anchor lags (F1) |
| 8 | What work is NOT authorized? | ⭐ Yes — stated emphatically and well throughout |
| 9 | What requires founder judgment? | ⭐ Yes — consistently marked |
| 10 | What may an agent execute without asking? | ⛔ No — inferred each session from prose |

⭐ **Pattern: the system is strong at prohibition and weak at location.** It states clearly what must
not happen; it cannot tell you where the thing you are looking at currently stands. That asymmetry
is coherent with the project's history — every one of those prohibitions was written after
something went wrong — and it is exactly what a resolver would complement rather than replace.

---

## 9. Collisions requiring adjudication before ACT 2

1. **State vocabulary** — four candidate vocabularies, two ratified (F5). Adjudicate; do not add.
2. **`THREE_AUTHORITY_CHAINS.md` standing** — the closest existing ancestor to this lane is
   `Recorded, not ratified`, and its dimension 3 is `unruled`. It also instructs that no further
   governance mechanism be added until the chains are documented. ⚠️ **A founder ruling on whether
   JARVIS-KP-01 is barred by that instruction, or is its discharge, is owed before ACT 2.**
3. **Orientation precedence** — `CLAUDE.md` vs `.claude/project-context.md` vs `PROJECT_CONTEXT.md`.
4. **Root-level Markdown** — 59 inflation-named files contradicting ratified claim discipline (A5).
   ⛔ No repair proposed here; the disposition is a founder call.
5. **Three orphaned authority references** (F6).

---

## 10. Standing

```
ACT 1 · KNOWLEDGE-CARRIER CENSUS ................................ COMPLETE (READ-ONLY)

Carriers inventoried ........................................... 5 families, 21 entries
Repository-borne carriers verified in-container ................ YES
Runtime / host / conversational carriers ....................... NAMED, UNVERIFIED, NO CONTENTS ASSERTED
Findings ....................................................... F1–F9
Collisions requiring adjudication ............................... 5

⛔ NO knowledge architecture proposed
⛔ NO schema designed
⛔ NO database created
⛔ NO migration authored
⛔ NO ingestion performed
⛔ NO reconciliation of conflicting records performed
⛔ NO synthesis of conflicting truth
⛔ NO registry created
⛔ NO Obsidian / Notion structure touched
⛔ NO agent autonomy changed
⛔ NO source file modified outside this record
⛔ ACT 2 NOT PROPOSED AND NOT OPENED

STOP CONDITION: census returned; awaiting founder adjudication.
```

⭐ **One observation offered, not as a proposal but because it bears on how ACT 2 should be
scoped:** the gap this lane names is narrower than it first appears. The project does not lack an
authority grammar — it has an unusually developed one, distributed across ratified canon, and in
`THREE_AUTHORITY_CHAINS.md` it has already identified the one axis that is missing. What it lacks
is any carrier that *holds* that grammar in a form a machine can read, and any index by which the
records carrying it can be found. ⛔ Whether that reading is correct, and what follows from it,
is a founder ruling, not a finding of this census.
