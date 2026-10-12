# WRITER-DEVICE-COPY-01 — Writer-owned manuscript copies
Date: 2026-10-10
Standing: Local engineering candidate; **not deployed, not a general beta clearance**.

## Purpose
Writers should be able to take the complete text of their Work to their own device, without depending on Soullab for long-term access to their words. This is independent of Writer's Studio's current server-side drafting and does **not** authorize source upload, migration, automatic synchronization, or provider access.

## Beta slice
- The unified canonical Writer's Studio **Write** toolbar offers a single optional **Save a copy** entry.
- No download is begun on arrival, focus change, MAIA turn, or autosave. The writer explicitly opens the menu and chooses a format.
- **TXT:** original stored heading prefixes plus the *newest in-tab section bodies*, sorted by manuscript order. Section joins introduce necessary blank-line boundaries without trimming authored bodies.
- **Markdown:** headings represented with Markdown heading levels; bodies are unchanged. This is a portable reading/editing projection, not an exact round-trip reconstruction of all formatting.
- **JSON section archive:** complete section identities, source headings and prefixes, newest bodies, observed server version, exported-at time, and explicit pending-unsaved flag. The archive is a writer-controlled backup **not yet certified for re-import**.
- Browser download is locally generated from `bodyOf(sectionId)`, which already includes staged, queued and saved content. It does not trigger `flushPending()` or issue an API request. A status says the **download was requested** and tells the member to verify the downloaded file.
- Existing separately governed render/EPUB/PDF and Listen recording downloads are not changed.
- No write to browser localStorage; no provider token; no platform-owned external copy; no automatic MAIA ingestion; no cloud service claim.
- The action appears only in Write, not transient Develop Craft alternatives that have not been adopted into the manuscript.
- A different manuscript identity remounts the control to prevent a preceding Work's open menu or status carrying into the next Work.

## Storage choice and cloud pathway
The immediate beta uses the member's browser download location. The browser may save directly to Downloads; if they prefer Drive, iCloud Drive, OneDrive or another provider, they can place a downloaded copy in their personally synced folder. It is **not** an automatic or verified remote backup.

A future optional Google Drive connector must be consent-driven, least-privilege, member-scoped, revocable, folder- or file-limited where supported, and versioned rather than overwriting another copy without permission. No connector should grant MAIA general discovery of unrelated Drive contents. Other providers and device-first sync require separate architecture and conflict/recovery proofs.

## Evidence
- Unit pure serializer: 7/7 passed; verifies order, full text, recent unsaved text, prefix ownership, whitespace, CRLF, poetry line breaks, Unicode, invalid identity refusal, and archive provenance.
- Component interaction: 5/5 passed in jsdom; verifies explicit click, writer-owned formats, no network request, truthful browser-failure copy, and work switch.
- Canonical wiring guards: 3/3 passed; verifies Write host, live `bodyOf` source, and no cloud/server action.
- Additional focused Studio suites, including Publish, section return and canonical route, 29/29 passed.
- Chrome actual-UI witness, with an isolated synthetic manuscript: **PASS**. Verified download filename and bytes, inclusion of newest in-tab text, zero network requests, and pending-save warning. Fixture and reproducible script live under `scripts/witness`.
- **Native desktop Safari 26.5 PASS, October 11:** WebDriver opened the actual React Save a copy control in Safari, downloaded TXT, Markdown and JSON, verified all three byte/structure expectations including unsaved in-tab text, and removed only the exact synthetic test downloads. Localhost test page only (GET /); no production or member API. Witness: `scripts/witness/ws-device-copy-safari-native-20261011.cjs`. This closes desktop Safari download acceptance, **not iPhone Safari**.
- Full Write/Develop/Review browser rehearsal, accessibility and visual acceptance, source-data recovery, complete type-check/build and production release remain separate gates.

## No false claims
A download request is not proof that the writer retained a file: the writer must verify the browser download. Downloading does not revoke Soullab's existing draft custody or change the current save server. JSON storage is not a restore feature. Google Drive being connected on the founder's Mac is not a member Drive integration.

## Next release steps
1. Keep the native Safari/Chrome synthetic browser witnesses pinned to the exact code. Next run a separate real authenticated non-founder test-account rehearsal in an isolated environment, and test **iPhone Safari** directly before any mobile claim.
2. Reconcile broader inherited Studio test failures and obtain a full compatible build/cutover receipt.
3. Preserve the source-upload Sanctuary hold, Caddy fence and schema-migration governance, old-reader compatibility, crash recovery and rollback.
4. Only after an independently approved release, offer the first lead tester a limited, truthful beta.
