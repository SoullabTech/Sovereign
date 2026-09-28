# AIN Obsidian Vault 02 — Read-Only Founder Witness

**Programme:** AIN-OBSIDIAN-VAULT-02
**Date:** 2026-09-27
**Lineage:** feature/ain-obsidian-vault-02-20260927
**Runtime:** localhost:3597
**Boundary:** canonical vault registry + authenticated read-only AIN query service only

## Governing law

> named scopes → founder-authenticated identity → search → exact read → links/backlinks → source provenance → explicit MAIA handoff

No create, append, patch, delete, move, rename, auto-export, or automatic vault search is authorized by this act.
## 1. Admitted vault registry

Live authenticated GET /api/sovereign/ain-vault returned:

- **AIN_ACTIVE** — available · read-only · founder personal/development archive
- **AIN_FOUNDATIONAL** — available · read-only · founder architectural corpus
- **MAIA_CONSCIOUSNESS** — available · read-only · curated source/synthesis

No root filesystem paths are returned in the public scope payload.
All three scopes report writeEligible false.
## 2. Authentication and verb boundary

Unauthenticated GET /api/sovereign/ain-vault returned HTTP **401** with Authentication required.

An authenticated attempt to invoke action: write returned HTTP **400 / UNSUPPORTED_ACTION**.

The route names only these actions:
- list
- search
- read
- links
- context-preview

The route exports no PUT, PATCH, or DELETE handler.
## 3. Custody and path containment

Two live founder-authenticated denial probes passed.

Denied subtree:
AIN_ACTIVE / _MAIA_SYSTEM/05-Soullab-Dev-Team/Clients
→ HTTP **403 / DENIED_PATH**

Traversal:
AIN_FOUNDATIONAL / ../secret.md
→ HTTP **403 / DENIED_PATH**

The service resolves real paths server-side and rejects paths outside admitted roots.
## 4. Search witness

Query:
- scope: **AIN_FOUNDATIONAL**
- text: **field intelligence**

Result:
- HTTP 200
- bounded candidate list
- vault alias
- relative path
- title
- score
- modified time
- matched line numbers
- source snippets

No generated wisdom bucket or automatic MAIA interpretation was returned by search.
Representative results included:
- 🌐 AIN - Afferent Intelligence Network.md
- The Work Revealing Its Own Intelligence.md
- The (fully integrated) Crystal Observer Model- A Theoretical and Integrative Framework for Participatory Intelligence.md
- The Field Protocol- A Guide to Collaborative Consciousness Research.md
- The Spiralogic Field Protocol v1.0.md

This is candidate discovery, not authority ranking.
## 5. Exact read + provenance witness

Witness source:
**AIN_FOUNDATIONAL / The Spiralogic Field Protocol v1.0.md**

Exact read returned:
- authority: founder_architectural_corpus
- file bytes: **4007**
- modified: **2025-10-15T14:12:43.227Z**
- file SHA-256: **960769743e20df313eda4087ac6956cf15fed9f5e0082871d0e8076ffc6dfe83**
- selected-content SHA-256: identical for the whole-file read

The returned body began with the note's own Purpose section rather than a generated summary.
## 6. Link-graph witness

The same source was inspected through the links action.

Result:
- outbound wikilinks: **0**
- backlinks under admitted scope: **0**

An empty graph was returned honestly rather than fabricated.
The source provenance packet was carried unchanged into the result.
## 7. Explicit MAIA handoff witness

The founder explicitly selected exactly one source:
**AIN_FOUNDATIONAL / The Spiralogic Field Protocol v1.0.md**

A dedicated MAIA turn asked for a one-sentence source-grounded summary and the source name.

Result:
- HTTP 200
- processing profile: **CORE**
- MAIA named The Spiralogic Field Protocol v1.0
- response summarized the note's stated purpose
- response metadata carried the exact vault provenance packet
- no automatic vault search occurred
The AIN vault source entered cognition through a distinct current-turn source class:

**retrieved.ain_vault**

It is not mislabeled as member memory, published governed knowledge, member-authored text, or current truth merely because it exists in the vault.

The source-context block instructs MAIA to name conflicts rather than silently harmonize them.
## 8. Persistence witness

Normal non-Sanctuary serving produced one user row and one assistant row for the dedicated witness session.

Database inspection proved:
- persisted conversation rows containing the vault source body: **0**
- persisted conversation rows containing the source SHA-256: **0**

The vault source remained current-turn cognition context rather than being copied into the conversation transcript.
After the witness, all base-table rows tied to the dedicated synthetic session were removed, including conversation turns, MAIA turn/session rows, agent runs, integration pass, decision record, field/shape telemetry, runtime consent state, memory-transition receipts, and validator event.

Final residue check over text session-id tables plus maia_sessions returned **0**.

No vault content was modified during witness or cleanup.
## 9. Sanctuary posture

VAULT-02 preserves the current canonical retrieval rule: exact external/retrieved sources are not consulted during Sanctuary turns.

Explicit AIN vault context in Sanctuary returns VAULT_CONTEXT_SANCTUARY_REFUSED.

This act does not widen Sanctuary semantics.
## 10. Stale product-truth repair

VAULT-01 found member-facing copy falsely claiming that Journal entries automatically export to Obsidian.

VAULT-02 removes that Help topic.
Capture registry copy also no longer claims Obsidian export capability, and the stale obsidian discovery tag is removed.

No replacement write promise is introduced.
## 11. Automated conformance

Focused suites:
- AinVaultReadService.test.ts
- VaultRouteContract.test.ts

Result: **16 / 16 PASS**

Design canon: **PASS**

Static no-write audit found no write primitive in the new AIN vault service or API route.
## 12. Type-health standing

Full type-health is externally red on one unrelated Writer's Studio dev surface:

app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient.tsx:78 — TS2304 Cannot find name LARGER

VAULT-02 does not modify that file, and the diagnostic is not absorbed into the baseline.
## 13. Acceptance

**AIN-OBSIDIAN-VAULT-02 — READ-ONLY IMPLEMENTATION: PASS CANDIDATE**

Established:
- canonical server-side vault registry
- three admitted named scopes
- founder-only authorization
- realpath containment and denied subtrees
- bounded text search
- exact file/heading read
- wikilinks/backlinks
- file + selected-content hashing
- source modification timestamp
- source authority class
- explicit current-turn MAIA handoff
- distinct canonical provenance class
- no automatic retrieval
- no write verbs
- no vault mutation
## Exact next boundary

> ### **AIN-OBSIDIAN-VAULT-03 — FOUNDER VAULT INTERACTION SURFACE + EXPLICIT SOURCE PICKER ONLY**

The next act should make the proven read-only service inhabitable:

1. founder-facing vault scope selector;
2. search field;
3. result list with source identity;
4. exact note / heading reader;
5. links / backlinks view;
6. explicit Bring this into MAIA selection;
7. source chips/provenance visible beside the resulting MAIA turn;
8. preserve read-only law;
9. no write controls;
10. stop before create / append / patch / delete / auto-export.

Write authority remains unopened.
