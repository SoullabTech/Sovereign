# MAIA Desktop — Cabin Artifact Packaging Repair 02 · 2026-10-01

## Failed successor to the first repair

First repair candidate: 147815873090

The first repair moved the Cabin source outside the electron-builder project,
but kept its source parent as the same staging parent used for the builder
project.

Fresh packaging disproved that repair: the packaged artifact again contained
Resources/cabin-runtime but did not contain Resources/cabin-runtime/node_modules/next.

This is a second packaging defect witness. The first repair is not admitted.

## Observed mechanism

The real Next standalone source at the repair SHA contains:

    .next/standalone/node_modules/next

A direct fs.cpSync of that directory preserves node_modules/next.

During electron-builder packaging, however, the staged sibling source was not
preserved into the final artifact. The packaged result again failed the
standalone dependency witness.

The failure therefore remains at the electron-builder staging boundary.

## Smallest second repair

The Cabin standalone source is now staged:

- outside the electron-builder project directory;
- outside the electron-builder staging parent;
- under a distinct external source parent configurable by
  MAIA_DESKTOP_CABIN_STAGING_PARENT.

The staged package.json is rewritten only inside the temporary builder project
so its existing cabin-runtime extraResources entry points to the exact external
source path.

Before electron-builder runs, the build now asserts:

    cabinSource/node_modules/next/package.json

If that file is absent, packaging stops immediately.

No Cabin runtime code, context authority, supervisor, loopback policy, or
member-facing surface is changed.

## Standing

First repair 147815873090: **REJECTED — node_modules/next still lost.**

Second repair: **OPEN — source modified, fresh artifact witness pending.**

No production deployment. No external beta distribution. No signing admission.
