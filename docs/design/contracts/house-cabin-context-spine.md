# HOUSE-CABIN-CONTEXT-SPINE-01

**Status:** implementation candidate  
**Base:** canonical `04005ca7c`  
**Scope:** House → Writer’s Studio continuity; future local Cabin portability

## Governing sentence

> Context travels with meaning, not with data volume.

The House is not currently a `FacetCrossing` endpoint. This contract therefore does not create a second crossing registry. It defines a governed arrival envelope that a destination may consume according to its own local identity laws.

## Current payload

The only portable semantic identity the House may carry into Writer’s Studio is:

- source: House
- destination: Writer’s Studio
- explicit Work id
- authority: `member_explicit`
- return: `/house`

The payload deliberately does **not** carry:

- member id;
- manuscript id;
- inferred question;
- memory;
- relationship interpretation;
- MAIA interpretation;
- opaque context blobs.

The authenticated destination already knows the member. Writer’s Studio already owns manuscript resolution.

## Explicit Work rule

A member clicking a specific Work in House has made an explicit Work choice.

The Studio must then resolve:

1. **0 declared manuscripts** — do not invent one; offer to begin one.
2. **1 declared manuscript** — open that manuscript.
3. **2+ declared manuscripts** — ask the member which manuscript they mean.
4. **invalid Work id** — do not trust the URL claim; fall back to ordinary Studio arrival.

This prevents House continuity from bypassing WS2-03B or creating a second Work→manuscript authority.

## URL seam

The online threshold is intentionally inspectable:

`/writers-studio?from=house&work=<explicit-work-id>`

The URL is transport, not authority. The Studio validates the Work against the authenticated member’s own `LivingWork` declarations.

## Cabin portability

The same context is serializable as ordinary versioned JSON.

That matters because the eventual offline Cabin must be able to carry the same continuity object across:

- desktop sessions;
- local storage;
- hardware migration;
- model upgrades.

The package must remain inspectable and migratable rather than becoming an opaque vendor token.

## Acceptance

- A Work chosen in House survives the threshold.
- No manuscript is guessed by House.
- Multiple manuscripts remain multiple.
- The destination retains local authority.
- The member can return to House.
- The context object can be serialized and restored without network access.

## Not yet claimed

This contract does not yet make the entire House a local Cabin.

It establishes the first portable continuity seam from the canonical online House into an existing governed room.

The next Cabin work can add member-controlled memory and Grokker context to this same envelope without changing the Work identity law.
