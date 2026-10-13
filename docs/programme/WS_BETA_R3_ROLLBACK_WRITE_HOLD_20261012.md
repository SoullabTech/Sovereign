# WS-BETA-R3 — fail-closed chapter-review rollback

Status: CLASS A DRAFT. No public deployment authority.

Base: 9f0648d060f85194bc233d1c3cd685dbefaf3fd2
Defect and actual-binary proof: #1804
Parent release and admission: #1784, #1800

The newer reader accepts legacy eight-lens and new seven-lens Review manifests.
The installed old reader rejects the new seven-lens POST with HTTP 409.
An image rollback alone cannot make the old reader capable of accepting it.

This candidate adds a version marker to images built from the new source:
WS_REVIEW_WRITES_CONTRACT=seven. In the governed deploy-production.sh
rollback function, after resolving image IDs but before any Docker tag
mutation, compare current and prior image contract markers.
When the current image is seven and the rollback target is not verified
seven, refuse with exit 42. Known seven-to-seven passes this additional
check. A preexisting older-reader deployment without a seven marker
retains its prior rollback behavior; that path is NOT newly certified.

A separate non-production Caddy fixture demonstrated Chapter Review POST
423 for regular, trailing-slash, and query variants, while Review GET and
unrelated routes still returned 200. Seven fixture cases passed.
Those results do NOT establish complete ingress coverage; no such edge
guard is installed in production from this candidate.

Before any founder-approved emergency fallback to the old reader:
- Inventory and guard all member-facing/internal Chapter Review write paths.
- Prove an active edge write hold and drain in-flight requests before the
  image role swap; preserve committed reading records and Work.
- Independently approve schema failure-prefix/old-reader compatibility.
- Restore a suitable reader without losing current manuscripts or their edits.
- Keep Review saves disabled under an incompatible old reader.
- Independently review exact implementation and obtain separately scoped
  human execution authority. Do not use an env flag to bypass the refusal.

Synthetic checks: test-ws-review-rollback-contract.sh covers eight
image-contract cases, including mismatched and missing identities, plus
positive seven-to-seven and a strict pre-tag ordering assertion.

This is only a draft rollback STOP condition, not a recovery procedure.
No member manuscript data, public traffic, Caddy configuration, migrations,
NAS archives, backup schedule, account entitlements or production images
may be changed under this workstream without independent gates.
