# PRACTITIONER-FIELD-RELATIONSHIP-BOUNDARY-01

**Date:** 2026-10-01
**Evidence base:** commit:`298414555bbe7eccdf453b09e026737d4f7f4e29`
**Class:** A — privacy / authorization boundary

## Finding

The Living Field facilitator page at `app/studio/fields/[memberId]/page.tsx` correctly filtered field threads to those the member explicitly marked `can_be_shown_to_practitioner = TRUE`.

But its viewer gate checked only that the authenticated viewer held any active practitioner record.

It did not establish that the practitioner had a relationship with the requested member.

Therefore the member's share gesture was narrower than the read authority enforced by the page.

This is a source-level authorization finding. No cross-member production request was sent to prove exploitability, because a successful request could expose another member's shared field material. The repair is justified by the code path itself.

## Why this matters

`can_be_shown_to_practitioner` means a member chose practitioner visibility for a thread. It is not a grant to every practitioner on the platform.

The repository already has a named identity invariant:

- the authenticated actor is `members.id`;
- `practitioner_clients.practitioner_id` is `practitioners.id`;
- a practitioner-client relationship is the bounded professional relationship.

A practitioner role without the target relationship is insufficient authority.

## Repair

A new testable helper, `app/studio/fields/fieldAccess.ts`, authorizes the read only when:

1. the authenticated member owns an active practitioner record;
2. that practice has a `practitioner_clients` row for the requested member;
3. the relationship is `active` or `paused`.

The page calls this relationship gate before reading either the member row or field evidence.

An unauthorized practitioner receives the same not-found outcome as an absent target, so the route does not become a member-id probing oracle.

## Unchanged laws

- threads still require `can_be_shown_to_practitioner = TRUE`;
- the member's share decision is unchanged;
- withdrawal semantics are unchanged;
- ended and pending relationships do not grant present access;
- paused relationships remain readable, matching the canonical coach-field relationship law;
- no practitioner gains edit authority over member-authored field material.

## Relation to SAFETY-DISCLOSURE-01

This repair is independent of crisis detection.

It closes the recipient-scope side of member-act disclosure: when a member chooses practitioner visibility, the read is bounded to their practitioner relationship rather than practitioner role globally.

It does not make `can_be_shown_to_practitioner` an automatic safety escalation mechanism.

## Tests

`app/studio/fields/__tests__/fieldAccess.test.ts` proves:

- actor identity translates through `practitioners` before matching `practitioner_clients`;
- the target member id is part of the authorization predicate;
- only active/paused relationships are admitted;
- missing or unrelated relationships fail closed;
- the page performs the relationship authorization before target-member reads.

## Standing

**PRIVACY BOUNDARY REPAIRED IN CANDIDATE · member share scope narrowed to the actual practitioner-client relationship · no disclosure behavior widened.**
