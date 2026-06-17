---
level: architecture
---

# Sovereign Storage SOP v1.0

**Status:** Canon
**Date:** 2026-02-28
**Applies to:** Soullab physical infrastructure — Mac Studio + MinisForum 32TB

---

## Purpose

Maintain local data sovereignty while supporting creative work, system stability, and future Oracle indexing — without adding unnecessary infrastructure.

**Design priority:** Local control → operational simplicity → future indexability

---

## 1. System Roles

### Mac Studio — Execution Layer (Hot)

Primary working environment.

Runs:
- Docker stack (MAIA, PostgreSQL, Caddy)
- Development environment
- Active Obsidian vault
- Current working files

Characteristics:
- Fast access required
- Files change frequently
- Not treated as long-term archive

### MinisForum 32TB — Sovereign Corpus Layer (Cold)

Primary durable storage.

Houses:
```
/data/obsidian-master
/data/manuscripts
/data/pdfs
/data/media
/data/oracle-corpus     ← future indexing target
/data/archive
```

Characteristics:
- Large capacity
- Stable, append-oriented
- Source for future embedding/index pipelines
- Minimal direct editing

---

## 2. Sync Architecture

**Tool:** Syncthing
**Direction:** Mac Studio → MinisForum (primary flow)

Configuration:
- MinisForum folders set to **Receive Only**
- Mac Studio is the authoritative editing source

Why: prevents accidental deletions or corruption from propagating silently. MinisForum acts as a protected mirror, not a bidirectional peer.

---

## 3. Hot vs Cold Data Model

### Hot (Mac Studio)

```
~/Obsidian/Soullab-Vault
~/Documents/Active
~/Projects
```

Characteristics: frequent edits, drafts, notes, experimental material. Not indexed automatically.

### Cold (MinisForum — `/data/oracle-corpus`)

Only move or sync material into `/data/oracle-corpus` when it is **stable enough to be part of MAIA's long-term knowledge**.

**Promotion rule:** curate intentionally, don't auto-ingest.

This keeps future retrieval clean and avoids indexing unfinished work.

**Recommended subfolder structure inside `/data/oracle-corpus`:**
```
/books
/notes-curated
/transcripts
/research
/private-teachings
```

Keep this structure stable — future indexers depend on predictable paths.

### Obsidian promotion convention

Inside the working vault, maintain a single folder as the explicit promotion gate:

```
~/Obsidian/Soullab-Vault/_corpus-ready/
```

Syncthing mirrors `_corpus-ready/` → `/data/oracle-corpus/` on MinisForum. Nothing else flows into the corpus automatically. Finished artifacts are moved or copied here when ready to be indexed.

This prevents the indexing pipeline from chasing half-finished drafts and daily scratch notes.

---

## 4. Oracle Indexing (Future)

When retrieval is enabled, the pipeline geometry is:

```
/data/oracle-corpus
        ↓
Local embedding/index job (Mac Studio or MinisForum)
        ↓
PostgreSQL (Docker on Mac Studio)
        ↓
MAIA retrieval
```

No cloud services required. No network file editing required. Corpus remains physically sovereign.

---

## 5. Backup Strategy

MinisForum is the primary archive — but it is still a single device. **Mirror ≠ backup.**

Minimum:
- Periodic external backup (monthly or weekly)
- Or second Syncthing target to an offline drive

---

## 6. Remote Access

**Tool:** Tailscale

Benefits:
- No port exposure
- No server to operate
- End-to-end encrypted access to Mac Studio, MinisForum, and Docker services

Use Tailscale for personal remote access to any machine in this stack. No VPN infrastructure required.

---

## 7. Collaboration Policy

Do not introduce collaboration infrastructure until required.

| Need | Action |
|---|---|
| Single user, multiple devices | Syncthing |
| Remote personal access | Tailscale |
| External collaborators need file access | Introduce Nextcloud |
| External collaborators need Oracle access | Separate product decision |

Reason: avoid operational overhead before it solves a real problem.

---

## 8. Infrastructure Gravity Rules

Before adding any new service, ask:

1. Does this solve a **current** problem?
2. Can Syncthing + Tailscale already handle it?
3. Does it increase operational burden?
4. Does it reduce data sovereignty?

If the answer to (1) is no — defer.

---

## 9. Operational Principles

- Edit locally, sync automatically
- Promote intentionally, don't auto-ingest
- Keep execution (Mac Studio) separate from corpus (MinisForum)
- Avoid live network file systems
- Avoid cloud unless collaboration requires it
- Prefer fewer moving parts

---

## 10. The Isomorphism (Why This Architecture Feels Right)

This storage architecture mirrors the principles already governing MAIA's data layer:

| Storage layer | MAIA equivalent |
|---|---|
| `~/Obsidian` (hot working vault) | Oracle conversation state (in-session, fast, ephemeral) |
| `/data/oracle-corpus` (cold, curated) | `member_spiral_state` table (durable, structural, promoted not surveilled) |
| Syncthing (one-direction trust) | Fire-and-forget upsert (write path never blocks, never reverses) |
| Receive-only on MinisForum | Sanctuary Mode (data flows in one direction only, no extraction) |
| "Promote finished artifacts" | Bridge D principle: only structural position persists, not content |

The sovereignty pattern is not a MAIA pattern — it is a Soullab pattern. MAIA is the first system where it got formally encoded. The storage architecture extends the same logic into physical infrastructure.

---

## 11. System Philosophy

This architecture treats knowledge as:

- Living locally
- Durable physically
- Expandable without migration
- Indexable when ready

You are building a knowledge field, not a file share.
