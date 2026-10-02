# Voice restoration — class R witness

**Status:** CLOSED · operational consequence ended
**Witnessed:** 2026-09-07 · Kelly, on the production `/maia` surface

## The witness

```text
act        TAP TO SPEAK on production /maia
result     MAIA heard speaking
attested   "I hear her on /maia" — Kelly
class      R · deployed runtime, member path
SHA        891b33ee0
```

Recorded as **attestation**, not observation. This session has no browser, no
audio, and no production access; the act and the hearing are Kelly's.

## Why the acceptance was hearing, not a smoke test

The pass condition was tightened during the lane, and the tightening mattered:

```text
credential smoke passes    the key is valid
MAIA is heard              the member path works
```

A smoke could have passed while the app path still failed — the archetype
branch, the Capacitor path, a client break. Same lesson PDF-CLEAN taught with a
real book instead of a synthetic one: **the instrument must exercise the path a
member actually uses.**

## Incident closure

```text
exposed key           REVOKED — exposure closed at the revoke, not the rotate
replacement           provisioned · loaded · PASS (HTTP 200, audio/mpeg)
temp key file         deleted from the production host
~/Downloads copy      Kelly's to remove
```

## ⚠ Production advanced during the restoration

No redeploy was performed. The qualified I0.5 deployment had already recreated
production **after** the replacement credential was installed, so redeploying the
prior target would have been regressive.

```text
was        e535e6246
now        891b33ee0   = merge of #1258 (I0.5)
```

**Consequences to carry forward:**

```text
I0.5              NOW LIVE. Earlier in this session, /commons/circles was
                  observed unchanged and correctly explained as "not deployed."
                  That explanation was true then and is STALE now.
WS-DELETE-01      STILL NOT LIVE. #1259 merged as 3027ceaff, which is after
                  891b33ee0. "Kelly can delete Works" remains false.
production lag    891b33ee0 → canonical b4831d2a. Still deliberate, still a
                  separate act.
```

The distinction the whole day turned on holds: **merged ≠ deployed**, and it now
splits two ways at once — one release live, the next not.

## Standing

```text
OPERATIONAL       none. Nothing carries a clock.
OUTSTANDING ACTS  7 (was 8) — all design, governance or research
```
