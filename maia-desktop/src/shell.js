// MAIA Desktop — the platform shell. DESKTOP-SHELL-01.
//
// WHAT THIS UNIT IS FOR. Not a feature. It is the proof that one Desktop
// process can hold two authority domains without them collapsing into each
// other: the privileged local MAIA renderer, and one authenticated window onto
// the canonical Soullab platform.
//
//     BrowserWindow
//     ├── webContents            file://index.html · preload.js · window.maia
//     │                          default session · microphone granted
//     └── platform view          https://soullab.life · NO preload
//                                partition 'maia-platform' · sandboxed
//                                every permission refused
//
// THE INVARIANT, which everything here exists to hold:
//
//     Remote platform content and the privileged MAIA bridge must never
//     coexist in the same webContents.
//
// It is held structurally, not by discipline. The MAIA webContents never
// navigates away from `file://`, and the platform view is constructed from a
// frozen webPreferences object that has no `preload` key. There is no code
// path that puts remote content in front of the bridge, because there is no
// code path that navigates the MAIA renderer at all.
//
// ⛔ WHY THIS IS A MODULE WITH INJECTED DEPENDENCIES. Electron cannot run in
// CI, so the alternative was to write this inline in main.js and "prove" it
// with regexes over source. A boundary nobody has exercised is a boundary
// nobody knows about. Every Electron surface it touches arrives as a
// parameter, so the falsification suite drives the real logic with fakes and
// asks the questions that matter: does the remote view get a preload, does a
// foreign URL ever load, does sign-out actually take the cookie away.
//
// ⛔ WHY THERE IS NO NEW PRELOAD CHANNEL. Switching destinations is window
// management, and window management is main's authority. Giving the renderer a
// `showPlatform()` verb would let a compromised MAIA renderer summon remote
// content into its own window — the precise move this unit exists to prevent.
// So navigation is driven from the application menu and its accelerators,
// which live in main. The ratified allow-list is unchanged by this unit.
//
// ⛔ WHY `BrowserView` AND NOT `WebContentsView`. `maia-desktop` pins
// `electron: ^28.0.0`; `WebContentsView`/`BaseWindow` arrived in Electron 30.
// Upgrading would change the Chromium audio stack underneath a voice path that
// cost two device walks to witness, which is not something a shell unit gets to
// do quietly. The containment properties are identical — own webContents, own
// session partition, own webPreferences — and the view lifecycle is confined to
// this file so the later migration is one file, not a programme. Recorded as a
// named follow-on rather than smuggled in here.

'use strict';

const {
  PLATFORM_ORIGIN,
  PLATFORM_PARTITION,
  PLATFORM_WEB_PREFERENCES,
  platformEntryUrl,
  navigationDecision,
  platformPermission,
} = require('./shell-policy');

const MAIA = 'maia';
const PLATFORM = 'platform';

/**
 * @param deps.BrowserView   Electron's BrowserView constructor
 * @param deps.sessionApi    Electron's `session` module (fromPartition)
 * @param deps.shellApi      Electron's `shell` module (openExternal)
 * @param deps.window        the BrowserWindow to attach into
 * @param deps.credential    the member session — used ONLY for `mintWebSession`
 * @param deps.onPlace       notified when the visible destination changes
 */
function createPlatformShell({
  BrowserView, sessionApi, shellApi, window, credential, onPlace,
} = {}) {
  let view = null;                       // at most ONE, ever
  let place = MAIA;
  let partitionArmed = false;

  /**
   * Refuse every permission the remote view asks for, and refuse the DEVICE
   * too.
   *
   * ⛔ Three handlers, not one. `setPermissionRequestHandler` answers a prompt;
   * `setPermissionCheckHandler` answers a synchronous check that never prompts
   * (`navigator.permissions.query`, and some getUserMedia paths); and
   * `setDevicePermissionHandler` refuses the device itself even if something
   * upstream said yes. A page that gets past the first two still gets no
   * microphone.
   *
   * Armed once per process, on the partition — not per view — so a view that
   * is destroyed and rebuilt cannot come back unguarded.
   */
  function armPartition() {
    if (partitionArmed) return;
    const ps = sessionApi.fromPartition(PLATFORM_PARTITION);
    ps.setPermissionRequestHandler((_wc, _permission, callback) => callback(platformPermission()));
    ps.setPermissionCheckHandler(() => platformPermission());
    if (typeof ps.setDevicePermissionHandler === 'function') {
      ps.setDevicePermissionHandler(() => platformPermission());
    }
    partitionArmed = true;
  }

  /** The platform partition's cookie jar. */
  function cookieJar() {
    return sessionApi.fromPartition(PLATFORM_PARTITION).cookies;
  }

  /**
   * Route one navigation attempt. Shared by `will-navigate`, `will-redirect`
   * and the window-open handler so all three cannot drift apart — a redirect
   * that escaped because only `will-navigate` was guarded is the classic
   * version of this defect.
   */
  function route(url, event) {
    const decision = navigationDecision(url);
    if (decision.action === 'allow') return decision;
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (decision.action === 'external' && shellApi && shellApi.openExternal) {
      // Only ever http/https — `navigationDecision` blocks every other scheme
      // outright rather than handing it to the OS.
      shellApi.openExternal(decision.url);
    }
    return decision;
  }

  function build() {
    armPartition();
    // ⛔ The frozen policy object, passed whole. Not spread, not extended: a
    // call site that could add a key could add `preload`.
    view = new BrowserView({ webPreferences: PLATFORM_WEB_PREFERENCES });

    const wc = view.webContents;
    wc.on('will-navigate', (event, url) => route(url, event));
    wc.on('will-redirect', (event, url) => route(url, event));
    // ⛔ THE ONE THAT WOULD HAVE MADE PATH AUTHORITY DECORATIVE. The platform
    // is a Next.js App Router app: moving from the House into a World is a
    // history.pushState transition, which fires NEITHER `will-navigate` NOR
    // `will-redirect`. Guarding only those two would leave every in-app
    // transition ungoverned — which is to say, most of them.
    //
    // It has already happened by the time this fires, so there is nothing to
    // prevent; the response is corrective rather than preventive. A path the
    // House does not name is walked back to the House; the conversation is
    // handed to main as a return-to-center.
    wc.on('did-navigate-in-page', (_event, url, isMainFrame) => {
      if (isMainFrame === false) return;   // a frame moving is not the member moving
      const decision = navigationDecision(url);
      if (decision.action === 'allow') return;
      if (decision.action === 'external' && shellApi && shellApi.openExternal) {
        shellApi.openExternal(decision.url);
      }
      if (typeof wc.loadURL === 'function') void wc.loadURL(platformEntryUrl());
    });
    // ⛔ DENY, always. A second renderer created by the remote page would be
    // ungoverned by construction — nothing here would have attached a policy
    // to it. An external address still reaches the member, in their browser.
    wc.setWindowOpenHandler(({ url }) => {
      const decision = navigationDecision(url);
      if (decision.action === 'external' && shellApi && shellApi.openExternal) {
        shellApi.openExternal(decision.url);
      }
      return { action: 'deny' };
    });
    return view;
  }

  /**
   * DESKTOP-MAIA-UNIFICATION-01 — move the platform view to a place.
   *
   * ⛔ Main's authority, not the renderer's. There is still no bridge verb for
   * navigation: this is called from the application menu, which lives in main.
   * A renderer able to drive this could steer the member's window.
   *
   * ⛔ The path is checked by the SAME `navigationDecision` that guards
   * `will-navigate`. A destination we open must be a destination we would have
   * allowed had the page asked for it — otherwise main would be a hole in its
   * own perimeter.
   */
  async function navigate(pathname) {
    const url = `${PLATFORM_ORIGIN}${pathname}`;
    const decision = navigationDecision(url);
    if (decision.action !== 'allow') {
      return { ok: false, error: `refused: ${decision.reason}` };
    }
    const shown = await show();
    if (!shown.ok) return shown;
    try {
      await view.webContents.loadURL(url);
      return { ok: true, url };
    } catch (e) {
      return { ok: false, error: (e && e.message) || 'navigation failed' };
    }
  }

  function fit() {
    if (!view || !window) return;
    const [width, height] = window.getContentSize();
    view.setBounds({ x: 0, y: 0, width, height });
    if (typeof view.setAutoResize === 'function') {
      view.setAutoResize({ width: true, height: true });
    }
  }

  /**
   * Show the platform surface.
   *
   * ⛔ The cookie is minted BEFORE the load, every time. Re-minting on an
   * already-built view is not redundant: the token may have been replaced by a
   * re-sign-in while the view sat detached, and loading first would send the
   * stale one.
   */
  async function show() {
    if (!credential || !credential.mintWebSession) {
      return { ok: false, error: 'no member session' };
    }
    const minted = await credential.mintWebSession(cookieJar());
    if (!minted.ok) return minted;       // never carries the token

    if (!view) build();
    window.setBrowserView(view);
    fit();
    await view.webContents.loadURL(platformEntryUrl());
    setPlace(PLATFORM);
    return { ok: true };
  }

  /**
   * Return to MAIA.
   *
   * ⭐ Detach, do not destroy — and above all do not touch the MAIA
   * webContents, which was never navigated, never reloaded, and never hidden
   * in a way it must recover from. The transcript, the voice state and the
   * adopted thread survive because nothing happened to them. That is why this
   * function is three lines: MAIA continuity here is a property of the
   * topology, not something the shell has to restore.
   */
  function hide() {
    if (window) window.setBrowserView(null);
    setPlace(MAIA);
  }

  /**
   * Tear the platform surface down completely and take the credential with it.
   *
   * ⛔ Called on sign-out and on an expired session. Detaching would leave a
   * live, authenticated cookie jar behind a hidden view — a signed-out member
   * whose session is still resident is the thing this prevents. The cookies go
   * too, not just the view.
   */
  async function destroy() {
    hide();
    if (view) {
      const wc = view.webContents;
      view = null;                       // drop the reference first
      try { if (wc && !wc.isDestroyed()) wc.destroy(); } catch { /* already gone */ }
    }
    try {
      await sessionApi.fromPartition(PLATFORM_PARTITION)
        .clearStorageData({ storages: ['cookies'] });
    } catch { /* teardown must not throw on the way out */ }
  }

  function setPlace(next) {
    place = next;
    if (typeof onPlace === 'function') onPlace(next);
  }

  return {
    navigate,
    show, hide, destroy, fit,
    place: () => place,
    isShowing: () => place === PLATFORM,
    // Test seams. Read-only views onto internal state — nothing here mutates.
    _view: () => view,
    _route: route,
    _cookieJar: cookieJar,
  };
}

module.exports = { createPlatformShell, MAIA, PLATFORM };
