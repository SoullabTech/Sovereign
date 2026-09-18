# JARVIS Research Studio J4 interactive experience prototype

This is a **non-production, synthetic/static founder-witness prototype** for:

JARVIS-DESKTOP-EXPERIENCE-ARCHITECTURE-01 / J4

It implements the experience contract from exact J3 candidate:

f3f078ba384e3ee765e49455be8d314d885d4515

## Boundary

This prototype contains:

- static HTML/CSS/JavaScript only;
- in-memory fixture state only;
- no localStorage/sessionStorage/IndexedDB;
- no fetch/XHR/WebSocket;
- no Electron APIs;
- no IPC;
- no filesystem access;
- no credentials;
- no provider/model call;
- no canonical provider execution;
- no database;
- no deployment;
- no production state.

Refresh intentionally resets the prototype.

## Founder witness: native macOS app

Build the standalone native prototype:

    prototypes/jarvis-research-studio-j4/build-native.command

Then open:

    /private/tmp/JARVIS Research Studio Prototype.app

The app is a one-window AppKit/WKWebView wrapper around the static prototype. It uses a non-persistent web data store and permits only file:// navigation to its own bundled prototype resources.

No Electron IPC, browser URL, network service, filesystem chooser, model/provider connection, persistence layer, or production JARVIS runtime is involved.

The raw index.html may still be opened in a browser for development inspection, but the Founder witness should use the native .app.

## Founder witness

The small top-right **Witness states** control is a prototype-only test instrument and is not proposed product UI.

Witness sequence:

1. W0 Native arrival
2. W1 Return to Project
3. W2 Project Home
4. W3 Research Studio
5. W3A JARVIS collapsed
6. W4 Claim focus
7. W5 Source Reader
8. W6 Ask JARVIS / proposal
9. W7 Compare Sources
10. W8 Challenge Claim
11. W9 Custody hold
12. Source unavailable
13. Source changed
14. Synthesis Artifact
15. System escape
16. Return-after-absence reprise

The prototype also supports ordinary clickable navigation without the witness-state jumper.

## Prototype-only interaction

Option-H / Alt-H opens the synthetic custody-hold sheet from Research Studio. This is a test affordance only.

## Decision vocabulary

After witness:

- TAKE
- REFINE
- REBUILD
- PARK
- REJECT

No real Desktop implementation is authorized by this prototype.
