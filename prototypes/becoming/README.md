# Becoming — functional local candidate

This is an isolated review implementation, not an account-connected Soullab release.

From the repository root, using the already-installed dependencies:

```sh
node scripts/becoming/preview.mjs
```

Open `http://localhost:3797/becoming` on the same computer. The server binds only to loopback. It does not read application credentials or contact a model, account API, or production database. It serves only an explicit static-asset allowlist. Another process already using the port causes startup to fail rather than replacing that process.

The existing House illustration is read from the local current-review asset when available. No font files or new visual assets are required; a plain background remains available when the illustration is absent. The current House on port 3597 is not modified.

## Holding words

Unkept drafts remain in memory. Keep writes to IndexedDB on this browser and origin. This is not encrypted or account-protected storage. Use synthetic test material. Other browsers, devices, or ports have separate stores. Clearing browser storage removes reflections. Exports are independent files outside deletion control.

Saved revisions are retained until the whole reflection is deleted. Save and delete use revision checks within the browser transaction. A stale tab cannot overwrite the current revision. Exact source/version links retain identity, not copied source prose. Deleted sources remain unavailable.

The UI's invitations are authored prompts, not live MAIA responses. Future dialogue is entered by the person. The temporal view only compares selected local reflections; it does not search the person's account or infer a pattern.

## Verification

`node_modules/.bin/tsc -p tests/becoming/tsconfig.json --pretty false`

`node_modules/.bin/tsx --test tests/becoming/core.test.ts`

With the preview running: `node tests/becoming/browser-witness.mjs`

The browser witness uses fresh temporary Chromium contexts and visible UI controls. It is not a direct database audit, a Safari/iOS test, an independent semantic review, or clinical evidence. The 30 programme acceptance obligations are not all discharged by these local checks. Live MAIA, account storage, voice, admitted cross-facet persistence, independent review, founder visual acceptance, and production delivery remain separate work.
