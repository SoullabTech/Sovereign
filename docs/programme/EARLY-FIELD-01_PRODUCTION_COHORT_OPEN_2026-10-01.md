# EARLY-FIELD-01 — Production Cohort Open

**Date:** 2026-10-01
**Production runtime SHA:** `975a208b8`
**Canonical at operational record branch start:** `cb208a26a`
**Standing:** SMALL CONTROLLED COHORT OPEN · FIRST HUMAN WITNESS PENDING

> The ordinary Living Field remains universal. The early instrument is admitted separately.
> Opening a member's dimension does not begin a MAIA encounter; MAIA entry remains explicit.

## 1 · Founder-designated cohort

The Early Field production cohort was opened to **four previously founder-designated members**.

The installed human set is the same four-person set already present in the H1 controlled cohort,
but the authorities remain separate:

- `HOUSE_STUDIO_H1_MEMBER_IDS` governs the H1 House → Writer's Studio crossing.
- `EARLY_FIELD_MEMBER_IDS` governs only the Early Field instrument.
- Neither variable is read as authority for the other.

The Early Field list was copied as a one-time operational installation from the already-verified
four-person production set. The runtime still evaluates the two gates independently.

No member UUID is copied into source control or this record.
## 2 · Pre-change witness

Before the environment change:

- production `maia-sovereign` SHA: `975a208b8`;
- Docker health: `healthy`;
- production deploy lock: free;
- `HOUSE_STUDIO_H1_MEMBER_IDS`: four unique valid UUIDs;
- `EARLY_FIELD_ENABLED`: previously closed;
- `EARLY_FIELD_MEMBER_IDS`: previously empty.

The four source UUIDs were validated for count, uniqueness, and UUID shape before use.

## 3 · Environment mutation

A pre-change backup was created:

```text
/home/soullab/MAIA-SOVEREIGN/.env.production.early-field-20261001T050408Z.bak
```

Production `.env.production` was changed to:

```text
EARLY_FIELD_ENABLED=true
EARLY_FIELD_MEMBER_IDS=<four explicit production member UUIDs>
```

The existing H1 settings were not changed.
## 4 · Recreate boundary

The environment edit and service recreate ran while holding the production deploy lock.

Only the `maia` service was recreated from the already-current production image.
No image was rebuilt, no source SHA changed, and no migration ran.

Post-recreate assertions:

- runtime SHA remained exactly `975a208b8`;
- Docker image identity was unchanged;
- Docker health returned `healthy`;
- Early Field switch = `true`;
- Early Field configured cohort count = `4`;
- H1 switch remained `true`;
- H1 configured cohort count remained `4`;
- the two installed four-person sets matched exactly at installation time.

The deploy lock was released after the operation.

## 5 · Post-open network witness

Follow-up checks after the recreate:

- public `https://soullab.life/api/health` → `health=ok`, version `975a208b8`;
- unauthenticated `GET /api/early-field/admission` → HTTP `401`;
- production runtime SHA → `975a208b8`;
- Docker health → `healthy`.

The first wrapper command exited non-zero only because its local Python reporting expression for
the public-health line had a quoting syntax error **after** the service had already restarted and
passed the runtime/image/config assertions. The follow-up health and 401 checks were then run
directly and passed. This is recorded rather than hidden.
## 6 · Rollback

Immediate rollback is environmental and does not remove the ordinary Living Field:

1. set `EARLY_FIELD_ENABLED=false` (or unset it);
2. recreate only the `maia` service from the current image;
3. verify public health and that the instrument is absent for a cohort member.

The pre-change env backup above is also available.

Rollback does not alter Living Field records, member-authored material, H1 membership,
or the explicit MAIA-entry consent boundary.

## 7 · Human witness boundary

Opening the cohort does not count as a human usability witness.

The first real member witness remains governed by:

`docs/programme/LIVING-FIELD-FIRST-HUMAN-WITNESS_PROTOCOL_2026-09-30.md`

The witness must use the participant's ordinary production account and existing session.
It must not copy or manufacture their session credentials.

Current valid state:

```text
EARLY FIELD COHORT OPEN · 4 MEMBERS
CONSENT REPAIR LIVE
R1R3 INSTRUMENT AVAILABLE TO ADMITTED MEMBERS
FIRST HUMAN WITNESS PENDING
R2 PRESENTATION NOT ADMITTED
```

No widening beyond these four is authorized by this record.
