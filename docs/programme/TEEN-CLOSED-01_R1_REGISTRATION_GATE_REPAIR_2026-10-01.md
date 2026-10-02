# TEEN-CLOSED-01 R1 — Registration Gate Repair

Date: 2026-10-01
Branch: \`fix/teen-closed-registration-gate-20261001\`
Canonical base: \`edf656496450795fa5c8089b4eb6e314ccc7bfd8\`
Class: A — Sacred Boundary

## Existing ruling

\`lib/youth/youthAdmissionGate.ts\` states the founder ruling:

Teen registration is closed until server-side crisis detection is live and teen safety is separately decided.

The gate is pure and already refuses any supplied birth date that computes to under 18.

## Defect

The gate's own header says it runs wherever a member birth date is written, including registration and profile update.

Canonical reality before this repair:
- profile update invoked \`checkYouthAdmission()\`
- registration accepted \`birthDate\` and inserted it directly
- no registration-route call to \`checkYouthAdmission()\` existed

Therefore a registrant with a valid invite and a supplied under-18 birth date could cross the registration boundary despite TEEN-CLOSED-01.

## Repair

\`app/api/members/register/route.ts\` now invokes the existing \`checkYouthAdmission(birthDate)\` before:
- admission/invite lookup
- username lookup
- password hashing
- member INSERT
- invite redemption
- session mint

A refusal returns the existing gate's status/code/error.

No new age policy or threshold is introduced.

## Lethal route tests

The registration route test now proves:

1. a supplied under-18 birth date returns 403 / YOUTH_NOT_YET_OPEN
2. no database query occurs
3. no session is minted
4. an invalid supplied date returns 400 / INVALID_BIRTH_DATE
5. invalid-date refusal also occurs before database mutation

Existing youth-gate unit tests continue to define:
- absent birth date is currently allowed
- age 18+ is allowed
- all youth tiers are refused
- invalid/future dates are refused

## Explicit residual gap

TEEN-CLOSED-01 is not a universal proof that no minor can enter.

The gate intentionally allows an absent birth date because birth date remains optional.

Therefore:
- known under-18 age -> structurally refused
- unknown age -> not detectable by this gate

Closing the unknown-age gap requires a separate product/admission decision about mandatory age collection or another lawful age signal.

This PR does not make that decision.

## Verification

Local:
- \`git diff --check\` PASS
- dependency-backed Jest is not available in this fresh worktree

Admission requires normal CI test/typecheck/build/constitutional gates.

## Closure

R1 closes the discrepancy between the TEEN-CLOSED-01 header and the registration route.

The broader youth-admission programme remains closed-by-policy but incomplete for members whose age is unknown.
