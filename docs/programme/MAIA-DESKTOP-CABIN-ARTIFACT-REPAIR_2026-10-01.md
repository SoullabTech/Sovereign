# MAIA Desktop — Cabin Artifact Packaging Repair · 2026-10-01

## Failed candidate

Source SHA: c6102a347af14600ea49edc108dd720f649d7e2c

The candidate was the exact canonical convergence result after PR #1605.

The source and application tests were green, and a production Next standalone
build completed from this SHA on the external T7 Shield volume.

## Observed artifact defect

The first packaged arm64 Desktop artifact was produced at:

    /Volumes/T7 Shield/maia-desktop-artifacts/c6102a347/mac-arm64/MAIA Desktop.app

The embedded Desktop marker was:

    maiaBuildSha = c6102a347af1

The packaged Cabin runtime contained server.js, .next, public, and application
source/traced files, but did not contain cabin-runtime/node_modules/next.

Direct execution of the packaged runtime therefore failed before health:

    Error: Cannot find module 'next'
    Require stack:
    .../Resources/cabin-runtime/server.js

The Desktop supervisor witnessed the same failure:

    local runtime exited before health witness (code=1, signal=none)

No production deployment occurred. The candidate is rejected for release and
is not external-distribution evidence.

## Additional artifact observations

The first artifact was intentionally built without external signing discovery
for the initial packaging witness.

Application identity:

    life.soullab.maia.desktop
    0.1.0-beta.1
    arm64

Embedded build marker:

    c6102a347af1

Observed hashes:

    executable
    c803dc22bbd4fa3e90c395b43296bda3442c0d1df9d2747985029fa5b1452df2

    app.asar
    0293fd52410bdb269c7de73640ad8498623435072b680a0eada393211f08aac1

The package was ad-hoc signed by electron-builder in this witness and did not
meet the external Developer ID / Gatekeeper distribution boundary.

## Smallest repair surface

Only the Desktop packaging boundary is being repaired.

1. Keep the real Next standalone runtime as the source artifact.
2. Stage the standalone Cabin runtime outside the electron-builder project
   root, so electron-builder's npm dependency installation cannot prune its
   nested standalone node_modules.
3. Point the existing extraResources entry at that sibling runtime source.
4. Preserve the existing runtime supervisor, loopback policy, Context Package
   custody, and Cabin application code unchanged.
5. Add a focused packaging falsifier proving that the runtime source is outside
   the builder project root.

No new runtime authority is introduced.

## Existing evidence retained

Desktop test suite before repair:

    406 / 406 PASS

Production:

    unchanged
    /cabin remains unavailable publicly

The repair does not authorize:
- production deployment;
- external beta distribution;
- tester enrollment;
- Developer ID claims;
- notarization claims;
- second-Mac acceptance.

## Fresh witness requirement

The repair is not admitted by source tests alone.

After the repair commit:

1. freeze the resulting exact SHA;
2. rerun the full Desktop suite;
3. rebuild the real Next standalone runtime from that SHA;
4. package a fresh arm64 artifact;
5. prove Resources/cabin-runtime/node_modules/next exists;
6. launch the packaged runtime through the Desktop host in offline mode;
7. witness /api/cabin/health and /cabin;
8. verify the embedded build SHA against the source SHA;
9. record final artifact digests;
10. only then reopen the signing/notarization/clean-device boundary.

Standing: FAILED CANDIDATE REJECTED · REPAIR UNIT OPEN · NO RELEASE ADMISSION.
