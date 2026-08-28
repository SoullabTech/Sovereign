# DESKTOP-SHELL-01 — device witness, 2026-08-28

Founder walk on the Mac, against a pinned detached checkout. Recorded before the
checkout moved, so the record names a tree that cannot have changed under it.

```
candidate    a341ebd4fa014b90a7a5619b574ca4ec20ebc591
launch       cd maia-desktop && npm install && npm start   (unpackaged)
witness      founder, macOS, built-in microphone
```

---

## PASS — continuity

A turn spoken while the remote platform view was visible appeared in the local
Desktop transcript. The pre-Journey conversation survived the round trip; no
second thread appeared.

⚠️ This is also the device-level causal witness for `DESKTOP-HIDDEN-CAPTURE`
(see §Defects): the turn landed there because the local renderer never
relinquished the microphone when it stopped being the visible surface. The same
observation is a continuity PASS and a defect witness. Both readings are true
and neither cancels the other.

## PASS — bridge isolation

```
file:///…/maia-desktop/src/index.html     typeof window.maia → "object"
https://soullab.life/maia                 typeof window.maia → "undefined"
```

**The programme invariant, witnessed live:** remote platform content and the
privileged MAIA bridge do not coexist in one `webContents`.

⚠️ **The remote reading was taken at `/maia`, not `/journey`.** The walk
scripted `/journey`; the member had navigated within the platform view before
the reading was taken, which is itself `DESKTOP-SHELL-ORIGIN-SCOPE-01`. Recorded
as what happened rather than as what was scripted. It does not weaken the
result — `/maia` is the surface that most resembles the privileged renderer, so
finding the bridge absent there is the stronger of the two readings.

---

## ⛔ NOT WITNESSED — named, not implied

The walk defined seven legs. Three were taken. These four were not, and
`UNWITNESSED is not a pass`:

```
§5  auth_sessions row count for the member/session/time window
§6  sign-out teardown — Journey destroyed, cookie gone from the partition
§7  foreign navigation handed to the OS browser
§7  Journey never prompting for microphone or camera
```

§5 in particular remains the one open leg of F1: every source assertion proves
Desktop makes no second authentication request and reuses the one token; none
observes postgres.

---

## Defects found ON DEVICE — none of them containment failures

| unit | what the device showed |
|---|---|
| `DESKTOP-SHELL-ORIGIN-SCOPE-01` | same-origin allow is too coarse. Two clicks from Journey reached web `/maia`, the House, Keeps and Studio links — a second MAIA surface inside the Desktop window, with the title still reading "Journey". |
| `DESKTOP-VIEW-CAPTURE-SUSPEND-01` | the view transition is blind to capture. An already-running local capture kept the microphone, kept transcribing, kept answering, and played her audio into a window the member could not see. |
| `DESKTOP-SHELL-MENU-VIEWROLE-01` | the custom menu drops `viewMenu`, so DevTools is unreachable in-app; `⌥⌘M` also appears shadowed by the macOS Window menu. |
| `DESKTOP-SHELL-ERROR-SURFACE-01` | the shell has no member-facing error channel and borrows `maia:turn`'s error phase. |

Credential containment, identity, and permission refusal were unaffected by all
four. What the shell had not established was **truthful attention** — which
MAIA is listening, and which one the member is looking at.

---

## Standing

```
containment   PASS
identity      PASS  (§5 runtime leg open)
continuity    PASS

unit closure  BLOCKED on ORIGIN-SCOPE-01 + VIEW-CAPTURE-SUSPEND-01
              (founder ruling, same session)
```

`475be3a DESKTOP-CAPTURE-RELEASE-01` is **not** credited against either blocker:
it releases capture on sign-out and expiry, and a view change is neither.

---

## Erratum — witness provenance correction (2026-08-28, DESKTOP-PLATFORM-ORIGIN-01)

The Desktop remote BrowserView was hardwired to `https://soullab.life` during
DS01. `MAIA_BASE_URL` redirects the API/session side only; the platform view's
origin was a hard-coded constant in `shell-policy.js`.

Therefore **DS01's remote-view observations were observations of the production
platform surface**, not of a remote surface served by the pinned local candidate.
The split went unnoticed because DS01's entry path was `/journey`, which exists in
production — nothing in the walk could reveal that the two halves were talking to
different servers. It surfaced only when `DESKTOP-HOUSE-01` moved the entry to
`/house`, a route that exists on the branch and not in production, and the walk
returned production's genuine 404.

What this does and does not change:

- **Preserved.** The bridge-isolation evidence stands: production remote content
  did not receive `window.maia`. Containment behaved correctly.
- **Withdrawn.** It must NOT be cited as proof that the pinned local candidate's
  remote half was exercised. It was not.

Recorded as `WITNESS-ORIGIN-01` (the finding — the apparatus could not contain the
platform view) and repaired by `DESKTOP-PLATFORM-ORIGIN-01` (validated origin
authority, explicit-but-invalid values fatal rather than falling back).
