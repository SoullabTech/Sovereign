# Becoming — functional local candidate

This is an isolated review implementation, not an account-connected Soullab release.

From the repository root, using the already-installed dependencies:

```sh
node scripts/becoming/preview.mjs
```

Open the configured local preview (default `http://localhost:3797/becoming`) on the same computer. The server binds only to loopback. It does not read application credentials directly. It exposes two fixed localhost MAIA seams: `/api/maia-guide` for opt-in in-journey guidance and `/api/maia` for the explicit post-Return conversation. Both refuse requests without their dedicated explicit-act headers. The guide proxy forces sanctuary + ephemeral memory mode and rejects conversation history; the post-Return lane preserves the already-accepted continuity behavior. Another process already using the port causes startup to fail rather than replacing that process.

The existing House illustration is read from the local current-review asset when available. No font files or new visual assets are required; a plain background remains available when the illustration is absent. The current House on port 3597 is not modified.

## Holding words

Unkept drafts remain in memory. Keep writes to IndexedDB on this browser and origin. This is not encrypted or account-protected storage. Use synthetic test material. Other browsers, devices, or ports have separate stores. Clearing browser storage removes journeys. Exports are independent files outside deletion control.

Saved revisions are retained until the whole journey is deleted. Save and delete use revision checks within the browser transaction. A stale tab cannot overwrite the current revision. Exact source/version links retain identity, not copied source prose. Deleted sources remain unavailable.

The companion guide begins with authored fallback prompts. If the member chooses **Journey with MAIA**, MAIA replaces that guide position one invitation at a time using only current-journey material. Movement/element changes may trigger the next invitation; keystrokes do not. `Ask MAIA to deepen` is explicit. Future dialogue remains member-authored. After Return, the member may separately hand the whole journey to continuity-enabled MAIA for synthesis and follow-up; the handoff text is inspectable and preserves imaginal provenance. Across Time only compares journeys the member explicitly selects; it does not search the person's account or infer a pattern.

BECOMING-UX-01R1 makes the Future Self journey primary: threshold → present-life arrival → time opening → encounter → optional dialogue → discernment → return → optional carry. The internal seven-movement model remains in the logical core but is not exposed as seven operator tabs. Across Time appears only after at least one journey has been kept.

## Verification

`node_modules/.bin/tsc -p tests/becoming/tsconfig.json --pretty false`

`node_modules/.bin/tsx --test tests/becoming/core.test.ts`

With the preview running: `node tests/becoming/browser-witness.mjs`

Automated browser witnesses use fresh temporary Chromium contexts and mocked MAIA responses so no witness spends a provider call or writes synthetic chat history. The guide proxy witness uses a synthetic local upstream and proves sanctuary/ephemeral forwarding, empty guide history, rejection of history smuggling, and separation from the post-Return continuity lane. These are not a direct database audit, Safari/iOS test, independent semantic review, or clinical evidence. Account-grade Becoming storage, real human live-guide acceptance, voice, admitted cross-facet persistence, independent review, canonical merge, and production delivery remain separate work.
