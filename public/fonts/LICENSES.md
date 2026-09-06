# Vendored typefaces — provenance and licenses

These font files are served from this host so that rendering the MAIA UI costs a
member no request to a third party. They were previously fetched at page load from
`fonts.googleapis.com` / `fonts.gstatic.com`.

All five families are licensed under the **SIL Open Font License 1.1**, which permits
self-hosting and redistribution. The upstream license text for each family is vendored
alongside its font files as `OFL.txt`, so provenance does not disappear into
`/public/fonts`.

| Family | Weights / styles served | License file | Upstream |
|---|---|---|---|
| Atkinson Hyperlegible | 400, 700 | `atkinson-hyperlegible/OFL.txt` | `google/fonts` → `ofl/atkinsonhyperlegible` |
| Spectral | 400, 600 · normal + italic | `spectral/OFL.txt` | `google/fonts` → `ofl/spectral` |
| Crimson Pro | 200, 300, 400, 600 | `crimson-pro/OFL.txt` | `google/fonts` → `ofl/crimsonpro` |
| Source Sans Pro | 300, 400, 600 | `source-sans-pro/OFL.txt` | `adobe-fonts/source-sans` @ `3.006R` (see note) |
| IBM Plex Sans | 300, 400, 500 | `ibm-plex-sans/OFL.txt` | `google/fonts` → `ofl/ibmplexsans` |

**Note on Source Sans Pro.** The Google Fonts API still serves the `Source Sans Pro`
family, but upstream `google/fonts` no longer carries an `ofl/sourcesanspro` directory:
Adobe renamed the project Source Sans 3. Rather than substitute the Source Sans 3
license text, the vendored `OFL.txt` is taken from the Adobe upstream at tag `3.006R` —
the last release carrying the Pro name, and therefore the applicable license for the
faces actually vendored here. It is SIL OFL 1.1, as is the current Source Sans lineage.
Recorded explicitly rather than passed off as a direct fetch.

This says only what is known. It does not assert that today's Source Sans 3 binaries are
identical to the Pro faces vendored here. If Source Sans Pro is ever dropped from the
API, these binaries keep working — that is the point of vendoring them.

## What was preserved

Every face and every subset the previous Google Fonts request would have produced is
vendored: 75 `.woff2` files across the five families, with the `unicode-range` of each
subset carried over unchanged into `app/fonts.css`. Cyrillic, Greek, Vietnamese and
Latin-Extended subsets were kept rather than trimmed to Latin — dropping them would have
silently degraded rendering for members writing in those scripts, which is a behaviour
change this repair is not permitted to make.

## Regenerating

`node scripts/vendor-google-fonts.mjs` from the repository root. It reads the exact
family/weight/italic specs recorded in the script, fetches Google's own `css2` output
with a modern browser user-agent (so `woff2` is served), downloads each face, and
rewrites `app/fonts.css`. It is a build-time provenance tool, not a runtime path:
nothing in the running application contacts Google.

## Acquisition plane

`scripts/vendor-google-fonts.mjs` is maintenance tooling, invoked by hand. It is not
referenced by any `package.json` script, `postinstall`, Next config, Dockerfile, compose
service, or CI build path — verified, not assumed. The only mention of it anywhere else
in the repository is the provenance comment at the top of `app/fonts.css`.

That makes the dependency direction:

```
Google
  ↑  explicit maintenance-time acquisition only
vendored WOFF2 + licenses
  ↓
AIN OS runtime
```

and not `build/runtime → Google`. The distinction is load-bearing for any later offline
accounting: a build step that reached out would make the acquisition a deployment-plane
dependency rather than a maintenance-plane one.
