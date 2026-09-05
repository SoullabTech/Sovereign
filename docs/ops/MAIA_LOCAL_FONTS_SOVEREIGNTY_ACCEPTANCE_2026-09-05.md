# Local Fonts Sovereignty Repair — Acceptance Record

```text
BRANCH      claude/local-fonts-sovereignty
BASE        e854ecc49 (canonical at the time of branching)
SUBJECT     49be729b1e50f49682e9ea35ab6331ef0612a370
STATE       RUNTIME GATES WITNESSED · G1a G1b G2 G3 G4a PASS · G4b DEFERRED
DATE        2026-09-05
```

This is an **acceptance record**. It was opened before the runtime gates ran and now
carries their results, filled back into this same versioned document rather than
recorded in a second one. §5 states what each gate observed and, equally, what it did
not reach. A gate result here never claims more than its instrument measured.

---

## 1. Scope claim

> Google Fonts runtime dependency removed from the live member path.

That is the whole claim. It is deliberately narrower than the repair might suggest,
and narrower than any offline claim.

## 2. What was found

`app/globals.css`, imported by `app/layout.tsx`, opened with four
`@import url('https://fonts.googleapis.com/...')` declarations covering five families.
The member UI therefore carried a **runtime dependency** on Google's font CDN: on any
page load where the stylesheet or a font binary was not already in the browser's cache,
the browser fetched it from Google infrastructure, disclosing the requesting IP at that
moment.

The earlier phrasing of this finding — *"every member page load"* — was withdrawn as a
scope error. Browsers cache both the stylesheet and the binaries, and this branch never
measured cache state. The correct statement is dependence plus disclosure-on-fetch, not
disclosure per load. What the repair removes is the dependency itself, which is the
architectural fact; per-load frequency was never the argument.

Two distinct problems, on the same line of CSS:

1. **Sovereignty.** An unnecessary third-party request from a member-facing sovereign
   UI. Google necessarily receives network-level information including the requesting
   IP. `/accounted-for` — the page that argues the sovereignty case — was itself
   fetching its typography this way.
2. **Runtime dependency plane.** A runtime internet dependency on the *ordinary page
   load* path, distinct in kind from cognition (ordinary turns), account recovery
   (conditional), and certificate renewal (maintenance).

## 3. What was changed

| Path | Change |
|---|---|
| `app/globals.css` | four remote `@import`s → one local `@import './fonts.css'` |
| `app/fonts.css` | **new** — 75 generated `@font-face` blocks |
| `public/fonts/**` | **new** — 75 `.woff2` (1.6 MB) + per-family `OFL.txt` + `LICENSES.md` |
| `scripts/vendor-google-fonts.mjs` | **new** — maintenance-time regeneration tool |

Preservation was exact rather than approximate: every face and every subset the prior
Google request would have produced, with each `unicode-range` carried across unchanged.
Cyrillic, Greek, Vietnamese and Latin-Extended subsets were kept rather than trimmed to
Latin — trimming would silently degrade rendering for members writing in those scripts,
a behaviour change outside this repair's contract and against Invariant 14.

Out of contract, and not done: typography redesign, family changes, `/accounted-for`
copy, offline claims, cognition or provider routing.

## 4. Static evidence

```text
A1  zero Google Font refs reachable from the live member runtime path     PASS
A2  75/75 local @font-face URLs resolve to vendored assets                PASS
A3  remaining repo-wide references classified by plane                    PASS
A4  repo-wide zero references                                     NOT REQUIRED
```

**A1** — verified by inspection of `app/layout.tsx` → `app/globals.css` → all eight
transitively imported stylesheets. Also verified dead rather than live:
`app/styles/dune-theme.css` and `app/styles/typography-refresh.css` have zero
importers; `components/theme/ApplyThemeVars.tsx` (which builds a Google Fonts URL at
runtime) has zero callers.

**A2** — every `url()` in `app/fonts.css` resolves to a file on disk; zero remote URLs
remain in the generated CSS; 75 blocks / 75 references / 75 files on disk.

**A3** — 38 repository references remain, none on the member path:

| Plane | Count | Disposition |
|---|---|---|
| `static-sites/**` | 25 | separate static artifacts, own decision |
| `docs/**` + `lib/design/IMPLEMENTATION_GUIDE.md` | 5 | documentation examples |
| `app/api/_backend/**` PDF service + form HTML | 2 | server-side render, different mechanism |
| dead code (`dune-theme`, `typography-refresh`, `themeCssVars`) | 3 | **deletion candidates, not font work** |
| `lib/manuscript/render/print*.css`, `public/now-what/preview.html` | 3 | separate surfaces |

**A4 is explicitly not required by this branch.** A dead stylesheet, a documentation
example, a static microsite and `app/layout.tsx` are not equivalent architectural
facts. The residual is a census result, not a reason to widen the repair. Do not
"repair" code whose correct disposition is removal.

## 5. Runtime acceptance — WITNESSED

Run on the Mac Studio against subject `49be729b`. Nothing broader.

```text
G1a  typecheck                                                            PASS
G1b  clean-generated-state build                                          PASS
G2   representative visual regression, incl. /accounted-for               PASS
G3   browser network witness                                              PASS
       → fonts served only from the AIN origin
       → zero fonts.googleapis.com / fonts.gstatic.com requests
G4a  Google-host blocking                                                 PASS
       → page and intended typography remain correct
       → no hidden fallback dependency
G4b  WAN unavailable, LAN / AIN origin still reachable                DEFERRED
       → optional by §6; not required for the permitted claim
```

### G1b — what the witness observed

G1b was first recorded PROVISIONAL, not PASS: that build ran over a `.next` left behind
by an `ENOSPC`-aborted run, so a success could not be attributed to the source tree
alone. It was re-run against observed clean generated state.

```text
subject              49be729b1e50f49682e9ea35ab6331ef0612a370
tracked tree         CLEAN
:3010                STOPPED
:3009                PID 21415 · UNTOUCHED

.next before         3.6G
df before            2.2 GiB
.next removed        OBSERVED ABSENT
df after removal     5.8 GiB
launch rule          ≥ 5.0 GiB free → build permitted

build command        npm run build
build count          EXACTLY ONE
build exit           0
runtime              131.53s
.next after          3.6G
df final             2.2 GiB

tracked tree after   CLEAN
:3010 after          STOPPED
:3009 after          PID 21415 · UNTOUCHED
```

The claim this licenses is exactly: *observed removal of `.next`, one build of
`49be729b`, observed successful completion.* Removal was observed rather than assumed,
because the provisional result existed precisely because that step had failed once.

**Borrowed-figure correction.** A free-space figure of 205 GB was in circulation for the
Mac Studio. It was not the Mac Studio's. It came from the minisforum deploy gate line
`Disk: 205 GB free on / (floor 60 GB)` — a different host, on a different lane, from a
different act. Direct observation of the Mac Studio Data volume gave 2.2 GiB. The build
proceeded on the observed figure after removal freed space to 5.8 GiB, not on the
borrowed one. Recorded because a number that travels between machines without its
subject is the same defect class as a gate result that travels beyond its instrument.

### What these gates did not reach

```text
build-plane independence      NOT TESTED
hermeticity                   NOT TESTED
build network independence    NOT TESTED
```

G1b ran with the network available and does not establish that the build would complete
without it. Independently of that untested question, the repository is known to use
`next/font/google`, which fetches from Google **at build time** and self-hosts the
result — a build-plane dependency on a different plane from the runtime one this branch
repairs, and outside its contract. Neither the gate nor this record asserts that the
build is Google-independent.

**G2 verifies intended typography, not pixel identity.** Browser rasterization and
platform rendering produce meaningless pixel differences even when the correct local
face has loaded. G2 asks whether the human-facing result regressed. G3 is what
establishes which font resources were actually fetched — do not let a pixel diff stand
in for a network fact, or vice versa.

**G4b trap.** A browser's "Offline" throttle kills the whole network stack including
the local origin: the page fails to load at all and a server failure gets misread as a
font failure. The condition to establish is *WAN absent, AIN origin reachable* — pull
the host's upstream link while the client stays on the LAN. G4a (DevTools request
blocking on the two Google hosts) is the fast, isolated font-independence test and is
**not** a substitute for G4b.

## 6. Claim rule

```text
G1a G1b G2 G3 G4a PASS permits exactly:

  "Google Fonts runtime dependency has been removed and witnessed
   on the live member path."

G4b is NOT required for that claim.
G4b establishes the separate environmental fact of WAN-independent UI operation.
```

**Witnessed on the Mac Studio, not in production.** The gates above ran against the
subject on the development host. They do not establish the state of the deployed
member path. Production earns its own witness after this branch merges and deploys, and
the `/accounted-for` typeface row stays `External today` until that witness exists.

### Not established by this branch, under any gate outcome

- AIN OS works fully offline
- cognition is presently local
- all repository artifacts are Google-independent

## 7. Dependency map after this repair

Stated by plane, because the planes are not interchangeable. This is more useful than
the binary claim "works offline": it shows where dependence remains and where it has
actually been removed.

```text
ordinary member UI       LOCAL                          (witnessed — G3)
database                 LOCAL
speech recognition       LOCAL
speech synthesis         LOCAL
ordinary cognition       EXTERNAL              — Anthropic
recovery email           CONDITIONAL EXTERNAL  — Resend
certificate renewal      MAINTENANCE EXTERNAL  — Let's Encrypt
local cognition          DESIGNED / not yet runtime-witnessed
```

## 8. Acquisition plane

`scripts/vendor-google-fonts.mjs` is maintenance tooling, invoked by hand. Verified
absent from `package.json` scripts, `postinstall`, `prepare`, the build script, Next
config, `Dockerfile`, compose, and the CI build path. Its only other mention in the
repository is the provenance comment atop `app/fonts.css`.

```text
explicit maintenance action
        ↓
Google Fonts acquisition
        ↓
vendored assets + applicable licenses
        ↓
build / deployment / runtime

NO reverse dependency on Google — for the vendored faces
```

That last line is scoped to the assets this branch vendored. It is **not** a claim that
the build as a whole is Google-independent: `next/font/google` remains a separate
build-time acquisition path, and build-plane independence is NOT TESTED (§5).

A future maintainer can refresh fonts deliberately while an installed AIN OS remains
independent of Google. Full provenance and licensing: `public/fonts/LICENSES.md`.
That file stays about provenance, licensing and acquisition plane; runtime acceptance
is a different epistemic object and lives here.

## 9. Standing note

A sovereignty audit has to inspect the mundane dependencies, not only the obvious
intelligence ones. A typeface, a telemetry call, a CDN asset, a recovery service, a
certificate issuer, a package fetch or a DNS dependency can cross a boundary while
everyone is looking at the model. The dependencies that survive an audit are the ones
that do not look like dependencies.
