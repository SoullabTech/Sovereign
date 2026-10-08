# MAIA Sanctuary controls — coordinated integration gate

Status: implementation staged, UI NOT ADMITTED, no production authority.

## Human activity
A member enters or leaves Sanctuary in one continuous MAIA conversation. The interface must reflect what has been acknowledged rather than suggesting that a local toggle alone authorizes saving.

## Required surfaces
- `components/voice/VoiceHUD.tsx` — visible voice-room toggle
- `components/QuickSettingsSheet.tsx` — session-level toggle
- `components/OracleConversation.tsx` — conversation commands and privacy events
- `app/maia/page.tsx` — page-level session state and event integration

## Contracts and required evidence
- Govern under the existing MAIA room/conversation and settings Experience Contracts, or add a dedicated Sanctuary contract that explicitly lists all affected surfaces.
- Consult `docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md`, `docs/canon/SOULLAB_THEME.md` and `docs/design/contracts/README.md`.
- Produce truthful desktop and mobile captures of the actual changed controls. None are claimed yet.
- Record real experience verification: what visible state is displayed while the POST is pending, on 423 / 503, on a successful Sanctuary entry, and after a reload.

## Security decisions already upheld
- `lib/sanctuary/sourcePostureCoordinator.ts` receives the shared `maia-settings-changed` event. A `sanctuary: true` event can notify the separate source-save gate.
- `sanctuary: false` from local settings never unlocks saving.
- Source POST/PATCH still respond 423; a completed client event is never evidence of an authorized write.
- Voice commands that bypass the common settings event need reconciliation before claiming all control surfaces are integrated.

## Release admission
1. One server-acknowledged visual state across all controls, tested on desktop and mobile.
2. Safe initial resolution and reload; legacy and missing server state remain non-writable.
3. Competing transitions, expired sessions and offline failures remain truthful.
4. Actual source write leases, crash recovery and storage cleanup evidenced end to end.
5. Migration custody and old-reader compatibility reviewed before deployment.

Disposition: HOLD. Do not add screenshot fields or claim experience verification without actual visual inspection.
