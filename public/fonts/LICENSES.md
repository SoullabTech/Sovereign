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
| Source Sans Pro | 300, 400, 600 | `source-sans-pro/OFL.txt` | `google/fonts` → `ofl/sourcesans3` (see note) |
| IBM Plex Sans | 300, 400, 500 | `ibm-plex-sans/OFL.txt` | `google/fonts` → `ofl/ibmplexsans` |

**Note on Source Sans Pro.** The Google Fonts API still serves the `Source Sans Pro`
family, but upstream `google/fonts` no longer carries an `ofl/sourcesanspro` directory —
the family was superseded by Source Sans 3. The vendored `OFL.txt` is therefore the
Adobe SIL OFL 1.1 text taken from `ofl/sourcesans3`, which is the same license covering
the same Adobe originals. Recorded here rather than silently substituted. If Source Sans
Pro is ever dropped from the API, the font binaries here keep working — that is the point
of vendoring them.

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
