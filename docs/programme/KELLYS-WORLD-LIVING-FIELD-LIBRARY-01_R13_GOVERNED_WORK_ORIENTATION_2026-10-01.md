# KELLY'S WORLD — LIVING FIELD LIBRARY 01 · R13 Governed Work Orientation · 2026-10-01

## Purpose

Make persistent canonical Work Units visible in Kelly's World without creating a second work store or changing canonical lifecycle semantics.

## Canonical read seam

The existing W0.v2 Desktop bridge now exposes a read-only `listCanonicalV2` projection through the already-existing generic `jarvis:work-unit-action` IPC channel as:

`action: canonical-list`

No new privileged IPC channel is introduced.

The list:
- reads the canonical `work-units-v2` store;
- excludes desktop metadata/temp files;
- returns canonical status projections;
- reports total / returned / truncated / unreadable population;
- reports unreadable Work Units rather than silently dropping them;
- creates no authority and performs no lifecycle mutation.

## Human orientation projection

A separate pure presentation layer groups the canonical facts as:

- **Needs Kelly** — canonical evidence is ready for explicit human adjudication;
- **In motion** — an open canonical Work Unit has no current adjudication hold or observed failure/challenge;
- **Watching** — unreadable custody, failed durable attempt, verifier challenge/disagreement/insufficiency, or canonical route blocker/refusal;
- **Historical** — closed canonical Work Units.

These are Kelly's World orientation labels. They are not W2 lifecycle states.

## Grokker continuity

When a listed Work Unit is recognizably Grokker-originated under R12, the orientation row shows:
- the originating inquiry;
- canonical lifecycle state;
- reason for its orientation group;
- exact source ranges;
- **Open in Work**.

No source packet is reconstructed merely by listing the Work Unit.

## Falsifiers

R11–R13 focused suite: **9/9 PASS**.

It proves:
1. readable and unreadable canonical population is reported honestly;
2. a DRAFT remains lifecycle `DRAFT` even when presentation calls it In motion;
3. EVIDENCE_READY + canonical adjudication action maps to Needs Kelly;
4. failed execution maps to Watching;
5. CLOSED maps to Historical;
6. Grokker origin survives as a read projection;
7. the existing generic Work Unit IPC is reused;
8. preload gains no `canonical-list` privileged channel.

No merge or deploy is authorized.

## Exact next boundary

**R14 — Dormant But Important / Unfinished Field Recovery.**

This must not equate age with importance.

The next census should distinguish:
- intentionally closed / superseded work;
- active governed work;
- recently touched programme records;
- older programme threads that carry unresolved founder rulings, explicit next acts, open tensions, or incomplete gates.

Only evidence-bearing unfinishedness may create a Dormant But Important candidate. Recency alone may not.
