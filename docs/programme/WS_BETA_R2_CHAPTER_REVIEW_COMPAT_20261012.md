# WS-BETA-R2 — chapter-review cutover compatibility

Status: ISOLATED CLASS A CANDIDATE. **NOT ACCEPTED FOR PRODUCTION OR ROLLBACK.**
Issue: #1804. Base: 7077aad3f7e795708edbefa1e3a7e51a6122fcbd.

## Defect demonstrated by actual old/new binaries

The installed old reader (`c9e4f7f7e`) requires eight chapter-review
lenses including Themes. The newer flagship Review requires seven lenses,
intentionally excluding both Themes and Overview. On isolated actual binaries,
the incompatible combinations return HTTP 409 `incomplete_lens_accounting`.
See issue #1804 for the original four-way 201/409 matrix and test provenance.

The Rebuild writing room on the new candidate also inherited a default
`DEVELOPMENTAL_LENSES` commission set (nine in the candidate), so ordinary
Rebuild chapter Review could request lenses its new Review endpoint refused.

## Minimal preservation-first change

- New POST accepts exactly either the complete historic eight-lens set or
  the current seven-lens Review set. No fabricated reading, silent narrowing,
  conversion, inferred author structure, or manuscript mutation. Existing
  ownership checks, scope equality, duplicate lens rejection and 409 refusal
  remain.
- Rebuild's ordinary *new* Review gesture uses the seven-lens Review set.
  Overview and Themes remain available in Develop through existing paths.
- Historical eight-lens manifests remain stored in their original form.
  Their rendering in flagship Review is still bounded: never silently omit
  a legacy Themes reading. Explicit historical presentation requires
  independent review (existing mapper may truthfully refuse).
- Resumed, explicitly chosen lens lists retain their original intent;
  the API rejects invalid/incomplete manifests instead of converting them.

## Critical directionality / rollback HOLD

The **old installed reader has not changed** and cannot accept the new
seven-lens manifest. Therefore this candidate repairs *old -> new* intake,
not new -> old rollback. Before an authorized cutover, independently approve
an enforcement mechanism covering new seven-lens Review writes, interrupted
in-flight review acts, post-deploy rollback and old-reader read/presentation.
If a safe rollback cannot be proven, stop Review writes while falling back;
do not label a new seven-lens review accepted by old software.

## Evidence & remaining gates

- Exact frozen base preserved; changes only isolated worktree.
- Pure contract: five networkless Node synthetic assertions PASS.
- Five focused Jest suites, 20 tests PASS, including new seven/eight lens
  acceptance and source-based membership/incomplete-set guards.
- Does not represent a new built image or final on-device runtime acceptance
  until rebuilt, independently verified and re-tested.
- Independent human Class A review of exact correction and negative
  compatibility matrix pending.
- Live vault restore, strict deletion-compatible backup custody, NAS ACL,
  authoritative old/new schema and rollback, Jondi's actual authenticated
  saved Work return, mobile/voice, and founder release approval remain held.
- Production Caddy, DB schema, member data, Source vault, access and public
  traffic must not change under this document.
