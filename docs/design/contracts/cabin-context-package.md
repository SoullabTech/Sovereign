---
room: Cabin Context Package
human_activity: carrying a bounded continuity field between connected Soullab and a sovereign local Cabin without creating a universal context database

surfaces:
  - lib/cabin/contextPackage.ts
  - lib/cabin/__tests__/contextPackage.test.ts

change_class: architecture

principles:
  - PROJECTION_NOT_COLLAPSE — the package composes governed references rather than replacing their authorities
  - CONTEXT_WITH_MEANING — only already-authorized continuity travels
  - PROVENANCE — every item keeps its own source and permission basis
  - NO_STEALTH_MEMORY — no current/last state is introduced by packaging
  - QUESTION_AND_TRANSITION_HONESTY — closed domains remain absent rather than inferred

reference_surfaces:
  - docs/design/contracts/cabin-work-projection.md
  - docs/design/contracts/cabin-relationship-projection.md
  - docs/design/contracts/cabin-memory-projection.md
  - docs/design/contracts/house-continuity-thresholds.md

shared_with_house: member orientation, explicit authority, provenance, and refusal to turn movement into hidden state
distinct_to_room: this is the portable Cabin envelope; it does not become a universal Soullab context object or replace any source domain

experience_verification: >-
  H2.4 is a pure composition boundary. Twelve focused tests cover source
  preservation, identity exclusion, permission preservation, Question and
  Transition non-invention, graph non-invention, determinism, source
  immutability, invalid projection rejection, truthful emptiness, and JSON
  portability.
---

# Cabin Context Package — Architecture Contract

## What this surface is for

The package is the smallest sufficient portable field that can carry the
continuity already earned by governed source projections.

It currently contains:

- Work references;
- Relationship references;
- Memory references.

It deliberately does not contain Question or Transition because those domains
do not yet have canonical cross-product contracts.

## The package is not an authority

The package owns no Work, Relationship, or Memory identity.

If an item changes, the package is regenerated from its source projection.

If a source disappears, the package does not manufacture a replacement.

## Empty is truthful

A package with zero works, zero relationships, and zero memories is valid.

It means:

> Nothing is currently eligible to carry.

It does not mean:

> Nothing exists in the member's life.

## No universal graph

The package contains no edges, relevance scores, semantic relations, or
generated connections.

Grokker can later consume the package as a bounded field, but H2.4 does not
grant Grokker authority to create relationships among its contents.

## Question and Transition

The absence of Question and Transition is deliberate.

When their canonical contracts are opened later, they can become additional
governed projections without changing the authority of Work, Relationship, or
Memory.

## Portability

The package is ordinary versioned JSON.

It contains no member id, session id, browser state, generated timestamp, random
package id, network token, or vendor-specific opaque handle.

### Custody on re-entry

The same contract now has a strict offline parser.

Import accepts only the exact package schema and exact governed projection
shapes. Unknown fields are refused rather than carried forward. The parser
returns a fresh package object, so imported mutable state is not shared with
the serialized source representation.

This is a custody membrane, not a sync protocol.

## Stop boundary

H2.4 adds no database, migration, sync protocol, MAIA cognition, Grokker
ingestion, UI, Question object, or Transition object.
