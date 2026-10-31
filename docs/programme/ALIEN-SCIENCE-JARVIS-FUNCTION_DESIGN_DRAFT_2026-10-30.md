# ALIEN-SCIENCE JARVIS FUNCTION — design draft (2026-10-30)

**Status: GRANTED AND BUILT (founder, chat, 2026-10-30: "Grant everything now").** The grant covers all three layers including Layer 2 repo-reading now, which supersedes — for this founder-only tool — the lane's "census after the Writer gate" deferral (§6, §7 below preserved as the state at the time of asking).
Built artifacts, all outside the repo: skill `~/.claude/skills/alien-science-research/SKILL.md`; notebook `~/SoullabResearch/alien-science/` (README + three UNOPENED seed entries). No repo, schema, deploy or production change. Not authorized beyond this scope: §8 stands.
Companion to `RESEARCH-TO-DISCOVERY-01_PROPOSAL_DRAFT_2026-10-30.md`. That document is the lane's governance; this one is the founder's own working tool.

## 1. What it is

A **founder-only research function** for exploring unfamiliar science and testing whether any of it yields new principles for consciousness, human development and relational geometry. It is a JARVIS-style capability: a Claude Code skill plus a private notebook. Per charter §4, JARVIS is "founder-directed operational intelligence within a separate privilege domain".

**It is not MAIA.** It touches no member, no member data, no Sanctuary content, no MAIA prompt or behavior. Nothing it produces reaches members without a separate founder act under the Sovereignty Invariants.

## 2. Shape: no app, no server, no database, no deploy

- **Skill:** `~/.claude/skills/alien-science-research/SKILL.md` (user-level, alongside the other JARVIS skills).
- **Notebook:** a private folder of markdown files, **outside the repository** (proposed `~/SoullabResearch/alien-science/`). Founder-owned, not committed, not synced to any service.
- **No change** to `lib/`, `app/`, `database/`, schema, containers or production.

This is deliberately small. `lib/research/` already exists but is MAIA's member-metrics pipeline; it is not a base for this.

## 3. The three layers

**Layer 1 — Notebook (capture).** Each entry is one markdown file with frontmatter:
`title · domain · source · source_status (UNOPENED | OPENED) · evidence_class · created · status (open | tested | retired)`.
`evidence_class` is exactly one of the nine in charter §9: hypothesis · founder articulation · accepted design · source presence · isolated prototype · synthetic test · integrated behavior · human acceptance · production release. Anything arriving from a paper or from a chat starts as **hypothesis** with `source_status: UNOPENED`; it changes only when the source is actually opened and read.

**Layer 2 — Comparison (against what Soullab already has).** Given an entry, the skill reads the named repo documents (Spiralogic reference, FIS field primitive, Spiral Continuity Engine, Corpus Callosum map, resonant field intelligence) and returns, per entry: **adds** (nothing existing says this) vs **renames** (existing material already says it in other words) vs **conflicts**. The inventory is *source presence*; the mapping is *hypothesis*; it never reports a capability as Live without runtime evidence.

**Layer 3 — Exploration partner (hypothesis and challenge).** For an entry or a question, the skill proposes candidate principles, and **every candidate must carry**: what is genuinely new · what could be observed · what evidence would disconfirm it. It marks phenomenological/experiential ideas as such (not falsifiable ≠ not worth exploring) but never words them as mechanism. Mechanism first, metaphor after measurement.

## 4. Standing rules the skill enforces

1. One evidence class per claim; none presented as another (charter §9).
2. External literature is **UNOPENED** until fetched and read; a citation recalled from memory is a lead, not a source.
3. No claim that a psychological transition *is* a physical phase transition: investigate the correspondence only.
4. No member data, no Sanctuary content, ever. No ingest from production.
5. No repository text sent to non-Anthropic model providers (dev-lane provider hold, 2026-09-20, stands).
6. Nothing leaves the notebook toward MAIA, the public site, decks or case studies without a founder act and `MARKETING_CLAIM_DISCIPLINE.md` (Live / Designed / Vision). Nothing here is Live.
7. Every discovered gap is reported, not fixed: finding grants standing to report only.

## 5. Seed content (the first three domains)

Intelligence across scales (cellular/collective intelligence) · interaction as the unit (second-person neuroscience, interpersonal dynamical systems) · transformation as reorganization (complexity science, transitions between stable patterns). Seeded as **UNOPENED hypothesis** entries. Reading the literature is the first real work.

## 6. Relation to RESEARCH-TO-DISCOVERY-01

Layer 2 over the repo **is** the lane's §6 census. The lane defers that census until the Writer gate. Two lawful ways to reconcile; the founder chooses (§7).

## 7. Decisions owed (founder)

1. **Is the founder's chat instruction the grant to build this?** The 30 Oct record says Claude Code asks for each grant through the JARVIS Desktop process and does not self-issue one. Recommended: the founder states the grant explicitly (below) or issues it through that process.
2. **Layer 2 timing.** Recommended: build Layers 1 and 3 and the skill now (they read no repo and cost Writer nothing); build Layer 2's repo-reading only after the Writer gate, preserving the lane ruling.

## 8. Not authorized by this draft

Any build · any file outside this document · repo, schema, deploy or production change · member or Sanctuary data · non-Anthropic provider use of repository text · MAIA behavior change · any public claim · posting to #1982.

## 9. Stopping condition

Done when: skill file exists and loads, notebook folder exists with the three seed entries as UNOPENED hypotheses, and one entry has been taken end to end (open source → classify → compare → one candidate with its disconfirmation). Then stop and report.
