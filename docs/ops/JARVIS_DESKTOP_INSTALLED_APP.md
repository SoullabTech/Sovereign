# JARVIS Desktop — installed macOS application

Status: **installed and verified** at `/Applications/JARVIS.app`, 2026-08-11.

JARVIS is a normal Mac application. It launches from Finder, Spotlight, the
Dock, or `open -a JARVIS`, with no Terminal, no `JARVIS_REPO_ROOT`, and no
dependence on the Claude worktree it was built in.

---

## The launch defect this closes

The packaged app appeared not to launch: it exited immediately with `EXIT=0`
and, depending on the shell, either no output or a single line —

```
ERROR:node_bindings.cc(368) Most NODE_OPTIONs are not supported in packaged apps.
```

That line was **not the cause**. It is a warning Electron prints and continues
past. Disproved by control: launching with `env -u NODE_OPTIONS` produced the
same immediate exit with an *empty* log.

The actual cause was `src/main.js` —

```js
if (!app.requestSingleInstanceLock()) { app.quit(); }
```

`requestSingleInstanceLock()` keys on the **userData directory**, which Electron
derives from the app *name*. The dev build and the packaged build therefore
requested the *same* lock. A dev instance had been running since 19:48, so every
packaged launch lost the lock and quit cleanly — hence the silent `EXIT=0`.

Two things hid this:

- The dev process is named **`Electron`**, not `JARVIS`, so `killall JARVIS`
  never matched it and always appeared to succeed.
- `app.quit()` only *requests* termination. Without a `return`, the module kept
  initialising while shutting down, so the exit had no single legible moment.

**Confirmed empirically**: with the lock holder killed, the *old, unmodified*
build — `NODE_OPTIONS` still inherited — launched and stayed alive. The lock was
the cause; `NODE_OPTIONS` was irrelevant in both directions.

Fixed by giving dev and packaged builds distinct userData (so they no longer
evict each other), and by returning after `app.quit()`. Two *packaged* copies
still collide, which is what the F5 guard actually wanted.

---

## Repository binding

The app resolves its execution substrate in this order, re-verifying against all
four canonical markers on every launch:

| Order | Source | Reported as |
|---|---|---|
| 1 | `JARVIS_REPO_ROOT` in the launch environment | `explicit-env` — explicit but not durable |
| 2 | Persisted choice, `~/Library/Application Support/JARVIS/config.json` | `explicit-config` — **AVAILABLE** |
| 3 | Hard-coded candidate `/Users/soullab/MAIA-SOVEREIGN` | `implicit-default` — **DEGRADED**, nobody chose it |
| 4 | none | `unresolved` — **UNAVAILABLE** |

A configured root is re-validated, never trusted because it was once valid. A
repo that moved or lost its markers reads as a named problem, not a silent
fallback.

Change it in **JARVIS ▸ Preferences (⌘,)**, which shows three facts separately
and refuses to merge them: *which* repository is active, *whether* it validates,
and *how* it was reached. A green "valid" badge on a checkout nobody named would
be exactly the reassurance this project's provenance rules exist to prevent.

### Two traps found while verifying

**A launchd-level `JARVIS_REPO_ROOT` silently outranks Preferences.**
This machine has one set:

```bash
launchctl getenv JARVIS_REPO_ROOT      # → /Users/soullab/jarvis-runtime
```

`launchctl setenv` variables are inherited by *every* GUI launch — Finder, Dock,
Spotlight, `open` — with no Terminal involved, and `env -u` does not affect them
because `open` hands off to launchd. A founder could pick a repository in
Preferences and watch the app keep using another, with nothing explaining why.
The app now **detects and displays this conflict** rather than resolving it
silently. To remove the ambient binding:

```bash
launchctl unsetenv JARVIS_REPO_ROOT
```

**The hard-coded default is not currently valid.**
`/Users/soullab/MAIA-SOVEREIGN` is missing `scripts/builder/deterministic.mjs`
and `router.mjs` on its current branch, so the fallback resolves to *nothing*.
The app correctly reported "No execution substrate resolved" rather than
half-binding. The durable substrate is `/Users/soullab/jarvis-runtime` — all four
markers, a standalone checkout, not a worktree.

---

## Environment hygiene for child processes

`src/child-env.js` strips `NODE_OPTIONS`, `NODE_V8_COVERAGE`,
`NODE_REPL_EXTERNAL_MODULE`, and `ELECTRON_RUN_AS_NODE` from the environment of
processes the app spawns.

This does **not** fix the launch defect above and must not be cited as if it
did. It addresses a separate, real exposure: the console shells out to
`node scripts/builder/session.mjs`, `router.mjs`, and `deterministic.mjs`, and
plain Node children honour `NODE_OPTIONS` in full — unlike Electron. A developer
shell exporting an inspector flag or a `--require` hook would silently apply to
the governor the console invokes, so the Desktop could report a different
governance answer than the terminal, for reasons neither surface displays.

---

## Signing and notarization

| | |
|---|---|
| Bundle identifier | `life.soullab.jarvis` |
| Signing identity | `Apple Development: Kelly Nezat (N9DTF6434L)` |
| `codesign --verify` | **valid on disk**, satisfies its Designated Requirement |
| `spctl -a` | **rejected** — expected |
| Notarization | **not performed** |

`spctl` rejection is correct for an Apple *Development* certificate. The app runs
on this machine because it is signed by this machine's own developer identity.

**Remaining before the app can be distributed to anyone else:**

1. A **Developer ID Application** certificate (Development certs cannot notarize).
2. Notarization credentials in the environment (`APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`) — electron-builder skipped notarization because these could not be generated.
3. `hardenedRuntime: true` plus an entitlements file.
4. Then `npm run dist` for a stapled DMG rather than `npm run pack`.

Nothing above blocks local use. All of it blocks handing the `.app` to a second
machine.

---

## Install and verify

```bash
cd jarvis-desktop && npm run install:app
```

Builds, stamps build identity, and `ditto`s to `/Applications/JARVIS.app`.

Verification actually performed (not merely "electron-builder produced an .app"):

| Check | Result |
|---|---|
| `/Applications/JARVIS.app` exists | pass |
| `open -a JARVIS`, no `JARVIS_REPO_ROOT` | pass |
| process remains alive | pass — 4 processes |
| desktop window appears | pass — titled `JARVIS — build 2d9eb671c` |
| artifact identity | AVAILABLE — `build 2d9eb671c · packaged 2026-08-12T01:18:26Z` |
| execution substrate | AVAILABLE — `/Users/soullab/jarvis-runtime @ 5767d5d41, dirty=false` |
| live Builder OS state | pass — claim `s-cad54855` LIVE, 1 capacity hold |
| C0 registry reachable | pass — 15 capabilities; router returns `C0 / deterministic` |
| quit + relaunch | pass — config survived |
| worktree independence | pass — 0 references to `jarvis-desktop-c0-explorer` in the installed bundle |

**Not verified:** reboot persistence (the config is an ordinary file in
Application Support and has no reason to fail, but no reboot was performed), and
the Work-tab render of the capability list — web content is not AX-scriptable, so
the registry was verified through the app's own `capability-form` + router code
paths instead of by clicking the tab.
