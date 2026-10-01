# MEMBER-WORLD-01 · R1 Member Orientation · 2026-10-01

## Founder ruling

Kelly’s World may become a capability available to every authenticated member.

The general member surface is **My World** at `/world`.
Inside the room, the visible title is member-relative:

- Kelly’s World
- Andrea’s World
- Jondi’s World
- or **Your World** when no usable display name is available.

The member-facing pattern is shared; founder/internal custody is not.
## R1 scope

R1 introduces a bounded member-owned orientation surface:

- authenticated identity only;
- `minTier: free` access;
- explicit return to `/house`;
- member-scoped living works;
- House-derived member fields;
- optional House placement through the existing preference system.

R1 does **not** introduce:

- founder programme corpus;
- canonical JARVIS Work Units;
- deployment/governance state;
- cross-member data;
- new Studio Work-context authority;
- Grokker synthesis over personal material.
## Standing and source boundaries

The World page reads only facts already authorized by the member session:

1. member identity from `requireMemberId()` / local Cabin identity;
2. living works scoped by `member_id = $1` / local member store;
3. House places from the existing member-facing House catalog.

The page intentionally contains no member id in the URL.
It carries no hidden context blob.
It does not infer which Work the member means.
A living-work card opens Writer’s Studio generically in R1; exact Work continuity
is deferred rather than borrowing the House→Studio crossing without a ruling.
## House availability without forced placement

`My World` is added to `HOUSE_PLACES` and therefore becomes eligible for every member.

It is **not** inserted into:

- `DEFAULT_CENTER_IDS`;
- the default `HERE · NOW` shortcuts.

A member may choose to add it to either through the existing Arrange my House controls.
Availability does not create attention priority.

## Verification

`node app/world/__tests__/memberWorld.proof.mjs` — PASS.
`git diff --check` — PASS.

The local worktree currently lacks an installed Next.js toolchain, so no browser/runtime
witness is claimed in R1. A real route witness remains owed before merge.
## Exact next boundary

**R2 — member runtime / visual witness.**

Run `/world` with a local Cabin member or isolated authenticated test member and verify:

- dynamic member name;
- House return;
- living-work scoping;
- responsive layout;
- House directory reachability;
- no founder/internal programme content appears.

**R3 — member Grokker source contract** remains closed until R2 passes.
It must define what member-owned sources Grokker may trace, how consent/release works,
and how private context remains bounded before any synthesis capability is exposed.

No merge or deploy is authorized by this record.