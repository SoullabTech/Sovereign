# AIN Obsidian Vault Interaction Audit — 2026-09-27

**Programme:** AIN-OBSIDIAN-VAULT-01
**Scope:** current-state audit + interaction map only
**Lineage inspected:** feature/astrology-live3597-reconcile-20260927
**Runtime inspected:** localhost:3597 on Kelly's Mac Studio
**Mutation ceiling:** no vault writes, deletes, moves, patches, connector configuration, or automatic retrieval changes in this act.

## Founder intent

Soullab should support a **full Obsidian AIN vault interaction** rather than treating the vault as an invisible export target or a dormant legacy corpus.

Eventually MAIA should be able to work with the vault as a governed knowledge environment: search, read, follow connections, cite exact sources, open notes, and — only under explicit authority — create or amend material.

This audit establishes what exists before any such authority is opened.
## Executive finding

> **The Obsidian interaction architecture is not absent. It is fragmented.**

The machine currently has multiple real Obsidian vaults, a running Obsidian desktop app, a healthy Local REST API, a filesystem ObsidianVaultBridge, an RLM vault navigator, a full REST CRUD client, Second Brain writers, legacy Journal exporters, and a newer Settings connector.

These pieces do not currently form one authenticated, governed interaction seam.

The sovereign MAIA runtime currently has no configured Obsidian vault path or REST credentials.

The correct next move is therefore reconciliation, not another parallel Obsidian implementation.
## 1. Physical vault topology

### Active iCloud AIN vault

Path: /Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN

Evidence:
- registered by Obsidian;
- currently open;
- real .obsidian vault;
- Local REST API plugin installed here;
- approximately **7,508 markdown files**.

Top-level distribution observed:
- _MAIA_SYSTEM — 6,395 notes;
- _EA-Working-Vault-2024-11_to_2025-02 — 484;
- root markdown files — 325;
- _ARCHIVE_CLEANUP — 230;
- 01-Sources — 24;
- Elemental Alchemy — 18;
- Library — 15;
- SecondBrain — 6.
The large _MAIA_SYSTEM branch is almost entirely:

**_MAIA_SYSTEM/05-Soullab-Dev-Team — 6,394 markdown files.**

That tree mixes many epistemic kinds: development logs, old prompts, architecture documents, concepts, client folders, business material, books, videos, research, frameworks, agent designs, marketing, historical experiments, and current working material.

It is not one homogeneous wisdom corpus.

### Documents/AIN vault

Path: /Users/soullab/Documents/AIN

Evidence:
- registered by Obsidian but not currently open;
- real .obsidian vault;
- approximately **559 markdown files**;
- includes **AIN Consciousness Intelligence System** with **205 notes**.

The 2026 orientation/reconnection documents identify this path as the intended Obsidian bridge source.
### MAIA-Consciousness vault

Path: /Users/soullab/Obsidian Vaults/MAIA-Consciousness

Evidence:
- real .obsidian vault;
- approximately **46 markdown files**;
- deliberately organized into Sources, Synthesis, Applications, AIN, Field Notes, Projects, People, and Logs.

This is much smaller and more curated than the active iCloud AIN vault.

### Stale T7 path

Legacy exporters reference /Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN.

That path does not currently exist.
## 2. Active Obsidian REST transport

Obsidian desktop is running.

Active Local REST API:
- plugin version 3.2.0;
- Obsidian version reported as 1.13.7;
- secure loopback endpoint at https://127.0.0.1:27124;
- insecure endpoint disabled;
- API key present in local plugin configuration.

Read-only probes proved:
1. health endpoint returns HTTP 200;
2. authenticated root listing works;
3. root listing reports 365 top-level entries;
4. authenticated exact-note GET works;
5. a non-empty AIN white-paper note returned bytes exactly matching the local file.

The active iCloud vault is therefore operationally reachable through Obsidian itself.
## 3. Existing REST client in the repo

lib/obsidian/ObsidianRestClient.ts already implements:

- health check;
- create/overwrite note;
- append to note;
- exact note read;
- heading/block/frontmatter patch;
- directory listing;
- note deletion;
- simple vault search.

Its singleton requires OBSIDIAN_REST_URL and OBSIDIAN_API_KEY.

Neither variable is present in the current localhost:3597 process environment.

So the client is substantial but **not live in the inspected app runtime**.
## 4. Existing filesystem bridge

lib/bridges/obsidian-vault-bridge.ts can index notes, parse frontmatter/tags/links, build backlinks, retrieve notes, query, retrieve frameworks/concepts/practices/integrations, retrieve Elemental wisdom, and inspect facets/hemispheres/books.

It depends on OBSIDIAN_VAULT_PATH.

localhost:3597 currently has no OBSIDIAN_VAULT_PATH.

With no path, connect() explicitly degrades to an initialized empty bridge.

### Retrieval quality

The bridge's semantic search is currently a placeholder over keyword search.

A bounded probe against Documents/AIN indexed 559 notes in about 23ms, but a plain Spiralogic-consciousness query returned 0 results.

Elemental Fire retrieval fell back to keyword heuristics and returned noisy historical/development material.

**Connectivity is real; retrieval semantics are not strong enough to be canonical.**
## 5. Relationship to sovereign MAIA

The sovereign MAIA service does not directly call the older fieldContextAdapter → SpiralogicEngine → ObsidianVaultBridge path.

Current findings:
- fieldContextAdapter exists;
- SpiralogicEngine.getFieldContext exists;
- the live route caller found for that adapter is legacy /api/oracle/conversation;
- the sovereign /api/sovereign/app/maia/list route does not call it.

The live fieldOrchestrator in maiaService is a different substrate: PFI + Resonance Field + Unified Elemental Field. It is not Obsidian retrieval.

MAIA's DEEP consciousness orchestration can instantiate an ObsidianVaultBridge indirectly, but without OBSIDIAN_VAULT_PATH it receives an empty knowledge stream.

Therefore the inspected sovereign MAIA runtime has **no actual AIN vault knowledge stream**.
## 6. RLM recursive vault navigator

services/rlm/main.py contains a more deliberate vault navigation shape.

For vault corpus mode it supports:
- vault_search using ripgrep with file paths, line numbers and snippets;
- vault_read for exact file or heading-level reads;
- explicit tool/read/time budgets;
- provenance with content hashes, file paths, headings and access order;
- explicit not-verified reporting when budget is exhausted.

This is closer to the epistemic shape needed for a large AIN vault than the legacy bridge search.

However no active app/MAIA call sites were found, and no live RLM dependency was established in this audit.

RLM is **implemented substrate, not current MAIA interaction**.
## 7. Existing write paths

Several incompatible generations coexist.

### Local REST / Second Brain

lib/secondbrain/secondBrainWriter.ts can:
- create classified notes;
- route People / Projects / Ideas / Admin;
- hold low-confidence items in Inbox;
- append receipts to an Inbox Log;
- patch People follow-ups;
- write daily digests;
- write weekly reviews.

No live member-facing route was found invoking it.

### Newer Settings connector

app/api/connectors/obsidian plus lib/connectors/obsidian/obsidianExport.ts provide a Settings connector and explicit markdown export.

This v1 path is write-only and uses direct filesystem writes rather than the Local REST API.
### Legacy exporters

Older paths remain in:
- lib/journaling/ObsidianJournalExporter.ts;
- lib/maia/obsidianExport.ts;
- lib/export;
- lib/obsidian/ObsidianExporter.ts.

Some default to the missing T7 path.
Some only download markdown in the browser.
Some write directly to disk.

These are not one coherent contract.

## 8. Connector operational standing

Account Settings exposes Obsidian connection UI.

The local database currently has:
- 0 Obsidian connector records;
- 0 connected Obsidian connectors;
- no recorded last use;
- no configured auto-export.

The product surface exists, but the connector is not configured here.
## 9. Connector authorization defects

The current connector routes are not safe enough to become the full interaction foundation.

Observed:
- status trusts query userId;
- configure trusts body userId;
- test trusts body userId;
- export trusts body userId;
- disconnect trusts body userId.

They do not establish member identity from the authenticated request before connector access.

The connector also accepts arbitrary filesystem vaultPath and exportFolder values.

Without server-owned admitted roots plus realpath containment, configuration can escape the intended vault boundary.

**Do not broaden or advertise this connector until identity and path containment are repaired.**
## 10. Stale member-facing claims

components/onboarding/ContextualHelp.tsx says:

> All your journal entries automatically export to Obsidian as markdown files.

That is false for the current Journal runtime inspected here.

lib/journaling/README.md also documents automatic export to the missing T7 path and an /api/journal/export route that does not exist in the current Journal API tree.

The Capture tool is described as exportable to Obsidian, while its current UI exposes Descript/Patreon exports rather than an Obsidian action.

These are product-truth debts, not evidence of working integration.
## 11. Why whole-vault retrieval is unsafe

The active vault mixes current architecture, historical architecture, duplicate/archive material, development journals, client folders, books, private notes, generated reports, marketing, experimental metaphysics, sources, synthesis, and Second Brain captures.

A file's presence in Obsidian does not establish equal:
- authorship;
- recency;
- truth status;
- consent status;
- rights status;
- epistemic kind;
- member relevance;
- authority.

The vault must be treated as a **federated knowledge field with named scopes**, not a bag of text.
## 12. Full interaction grammar

A full AIN vault interaction should eventually support six governed acts.

### Search
Search a named vault scope and return bounded candidates with vault alias, relative path, title, matched lines/headings, modified time, and source kind where known.

### Read
Read an exact note or heading and return a content hash.

### Navigate
Follow wikilinks and backlinks without treating graph centrality as truth authority.

### Bring into MAIA
The member explicitly carries chosen vault sources into conversation. MAIA cites exact source locations and keeps source words, MAIA synthesis, and member meaning distinct.

### Write
Create or append only after a member-visible preview of destination, exact markdown, authorship and operation type.

### Revise / link
Patch a heading/block/frontmatter or add a link through an explicit diff-and-confirm gesture.
## 13. Proposed vault registry

Do not expose one global vault path as if all content were equivalent.

Use a server-owned registry with stable aliases.

Candidate aliases requiring founder adjudication:

- **AIN_ACTIVE** — active iCloud AIN vault; broad personal/development environment;
- **AIN_FOUNDATIONAL** — the 205-note AIN Consciousness Intelligence System corpus under Documents/AIN;
- **MAIA_CONSCIOUSNESS** — curated source/synthesis vault;
- **AIN_SECOND_BRAIN** — designated write area within the active AIN vault;
- later, named book/source scopes rather than arbitrary client paths.

Each alias declares root, allowed subtrees, read eligibility, write eligibility, authority kind, and retrieval strategy.
## 14. Retrieval architecture

Recommended canonical read path:

1. explicit scope selection;
2. fast candidate discovery using indexed text/ripgrep, filename, tag and link cues;
3. exact source read;
4. optional semantic rerank only after candidates exist;
5. provenance packet with path, heading, hash and modified time;
6. MAIA synthesis downstream, clearly separated from source.

Do not use the legacy bridge's current semantic-search label as authority.

RLM's vault-search/read/provenance shape is a useful substrate candidate, but it should sit behind one canonical AIN Vault service rather than become another assistant.
## 15. Write architecture

Read and write authority must be separate.

Default:
- read-only;
- no silent auto-export;
- no silent note creation;
- no delete.

Later explicit write acts may allow create, append, patch and link.

Each write should produce a preview, destination, operation kind, before/after hash where applicable, timestamp, and receipt/undo information where possible.

MAIA-generated prose must never be silently stored as member-authored prose.

Sanctuary remains write-suppressed unless a separate explicit external-write law is ever ratified.
## 16. Privacy, credential and identity law

Vault access is not equivalent to memory consent.

Server-side interaction must:
- resolve canonical authenticated member identity;
- refuse client-supplied userId as authority;
- resolve allowed vault aliases server-side;
- canonicalize paths with realpath;
- require every resolved path to remain under its admitted root;
- keep REST credentials in Keychain/encrypted server custody or equivalent local secret storage;
- never return the REST key to browser code or logs.

The active Obsidian plugin proves local transport. It does not establish application authorization.

A note's presence in the vault does not authorize a claim that it is true, current or member-endorsed.
## 17. Current-state matrix

| Capability | Substrate exists | Live in sovereign MAIA | Safe now |
|---|---:|---:|---:|
| Obsidian health/list/exact read | yes | no | transport yes |
| Full CRUD via Local REST API | yes | no | needs auth/write law |
| Filesystem vault indexing | yes | indirect/empty | weak retrieval |
| Spiralogic vault wisdom | yes | legacy/empty in sovereign runtime | no |
| RLM vault search/read + provenance | yes | no | candidate |
| Second Brain writer + receipts | yes | no live route found | candidate after auth |
| Settings connector | yes | configured: no | no — auth/path defects |
| Journal automatic Obsidian export | legacy claim/code | no | false current claim |
| Full two-way AIN vault interaction | fragmented pieces | **no** | not yet |
## 18. Exact next boundary

> ### **AIN-OBSIDIAN-VAULT-02 — CANONICAL VAULT REGISTRY + AUTHENTICATED READ-ONLY AIN QUERY SERVICE ONLY**

That act should:

1. define admitted vault aliases and subtree scopes;
2. create one canonical server-side AIN Vault service;
3. resolve authenticated member identity server-side;
4. implement read-only list / search / read / links operations;
5. use fast scoped discovery followed by exact source reads;
6. return provenance packets with path, heading, hash and modification time;
7. expose vault context to sovereign MAIA only by explicit member query/context gesture;
8. preserve Sanctuary non-persistence;
9. repair or suppress stale automatic-Obsidian-export claims;
10. stop before every create / append / patch / delete / auto-export authority.

No write path should open until the read path has been founder-witnessed.
## Closure

AIN-OBSIDIAN-VAULT-01 establishes:

- physical vault reality;
- active Obsidian transport;
- current MAIA disconnection;
- retrieval limitations;
- dormant read/write substrates;
- connector security debt;
- stale member-facing claims;
- target interaction grammar;
- safe implementation sequence.

No vault contents were modified during this audit.

The next architectural move is not to create more Obsidian code.

It is to **reconcile the existing pieces into one governed AIN Vault boundary.**
