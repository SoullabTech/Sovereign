# Cabin local desktop qualification — October 14, 2026

Founder request: continue until runtime startup, local MAIA conversation, and writing controls work.

## Delivered local slice

Cabin 0.2.0 packages its Node 22 runtime and bundled server rather than depending on a development server or a running Next build. The installed application is /Users/soullab/Applications/Cabin.app. The original launcher is preserved at /Users/soullab/Applications/Cabin-Launcher-Backup-20261014.app.

The workspace uses the existing CabinLocalStore, local identity, SQLite manuscript authority, TurnPosture and atomic conversation exchange writer. A bounded local MAIA adapter includes the repository's constitutional principles and integrative alchemy directive. It calls qwen2.5:7b through IPv4 loopback only. It does not run the complete online MAIA orchestration.

Implemented controls: Begin writing, TXT/Markdown import, manuscript Save, selected-passage editorial suggestions, explicit Apply, successive Undo, saved versions and Restore, native Save a copy, current-session conversation, new conversation and explicitly resumed saved conversation. The last selected manuscript and current conversation survive reopening.

Edits require the authoritative source revision. Stale proposals and stale writes fail. Suggestions do not alter manuscript text before Apply. Version restoration creates a new history entry. The local model sees the selected passage for an editorial request; conversation requests receive only the explicitly active conversation.

## Verification

Real packaged Electron windows, fictional content and isolated temporary SQLite storage:
- Automatic runtime startup, local conversation and a name correction: PASS.
- Local model-generated suggestion, Apply and Undo: PASS.
- Version history and native text copy content: PASS.
- Close/reopen of app with manuscript and completed conversation recovery: PASS.
- Close during an unfinished model response, immediate reopen and no half-exchange persistence: PASS.
- New conversation starts without earlier turns; explicit saved-conversation resume: PASS.
- Unauthenticated local HTTP read: denied (401).
- Non-JSON/cross-site mutation boundary: denied (403).
- Stale manuscript revision write: denied (409).
- Kernel-level runtime external network denial: PASS. Loopback inference still works.
- Focused installed-window TXT import, successive Undo, Restore and selected-writing persistence: PASS.
- Existing store, atomic-exchange and launcher-policy checks: 25/25 PASS.
- Bundling, JavaScript syntax, Git whitespace checks and deep ad-hoc signature verification: PASS.

The first download test used a browser download event that Electron did not deliver. Save a copy now reads authoritative saved text through a constrained main-process IPC handler and uses the native save dialog. Canary mode substitutes a temporary destination and verifies exact file contents.

The first successive-Undo assertion read the previous status before the next request finished. The focused test now waits for the controls to re-enable; both Undo operations and restoration pass.

## Boundaries

This is a single-owner local text workspace, not a full online-platform release. Voice, cloud tools, astrology, complete online MAIA cognition, member networking/mesh and DOCX/PDF import are not connected. Existing installed local Ollama and qwen2.5:7b are prerequisites; no model downloads or purchases were made.

The local server requires a per-launch capability token, exact loopback Host, same-origin JSON mutations and HttpOnly SameSite cookies. Renderer Node access is disabled. Main-process export validates the actual workspace frame and retrieves saved writing rather than accepting renderer-provided text or a path. The runtime runs under macOS external-egress denial; the app workspace restricts renderer requests to local resources. Runtime file creation uses a private umask.

Tests establish the bounded behavior above. They do not confer independent security review, full MAIA relational-quality acceptance, notarization, member beta release or production-deployment approval. Production, personal manuscripts and tester invitations were not changed.
