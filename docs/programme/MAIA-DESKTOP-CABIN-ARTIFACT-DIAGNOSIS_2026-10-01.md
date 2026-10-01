# MAIA Desktop — Cabin Artifact Packaging Diagnosis · 2026-10-01

## Boundary observed

Candidate: e3688fce20dde0b539988ebdd27c06162783a1ea

The second packaging repair correctly moved the Cabin source outside both the
electron-builder project and its staging parent and dynamically pointed the
staged package at that source.

The fresh artifact still omitted:

    Resources/cabin-runtime/node_modules/next

The source witness immediately before packaging contained:

    cabinSource/node_modules/next/package.json

Therefore the loss occurs inside electron-builder's extraResources copy
semantics, not during standalone creation or source staging.

## Root cause

The installed electron-builder app-builder-lib filter implementation was read
at the exact packaging boundary.

Its FileMatcher createFilter explicitly rejects the root node_modules directory:

    if (relative === "node_modules") return false;

A reproduction using the same FileMatcher and a synthetic resource containing:

    server.js
    public/index.html
    .next/static/a.js
    node_modules/next/package.json

matched the first three classes of files but did not match node_modules or its
contents.

This is why pointing extraResources directly at the Cabin runtime root cannot
carry its root node_modules directory, even when the source is outside the
builder project and staging parent.

## Final bounded repair

Preserve the existing main extraResources entry for the Cabin runtime body.

Add one additional staged extraResources entry:

    source: cabinSource/node_modules
    destination: cabin-runtime/node_modules
    filter: **/*

Because the FileMatcher source root is now the node_modules directory itself,
node_modules is no longer the root directory being excluded. Its package tree
becomes ordinary child content and is copied to the intended runtime location.

The build also retains the pre-package assertion that:

    cabinSource/node_modules/next/package.json

must exist before electron-builder is invoked.

No Cabin runtime code, supervisor, loopback policy, context authority, memory
substrate, cognition boundary, or member-facing surface changes.

## Provenance

The web runtime substrate remains the previously built SHA:

    147815873090

The Desktop packaging source is:

    e3688fce20dde0b539988ebdd27c06162783a1ea

The only diff between those source states is in maia-desktop and docs; no
app/lib/components/public/Next configuration path changes exist. This is the
accepted Desktop-only provenance split: the web runtime SHA is named rather
than falsely attributed to the Desktop packaging commit.

## Standing

The root-node_modules diagnosis is complete.

The final bounded packaging repair is staged for a fresh artifact witness.

No production deployment. No external beta distribution. No signing or
notarization admission yet.
