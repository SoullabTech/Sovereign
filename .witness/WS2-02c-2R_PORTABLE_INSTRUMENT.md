# WS2 02c-2R — Portable Successor Instrument

Companion to `WS2-02c-2R_REMOTE_CONTAINER_WITNESS.md`, which is the immutable
record of the remote-container run and **is not amended by this commit.**

Still true of this branch: it is an instrument and evidence carrier, never the
runtime object being witnessed. The witnessed product SHA remains
`58ac95a779278bda427fb869aa188e618442d756`.

---

## The two instruments

```text
5e69c8234   REMOTE WITNESS INSTRUMENT
            The exact bytes that produced the remote-container PASS.
            Chromium path is a container-specific literal.

this commit PORTABLE SUCCESSOR INSTRUMENT
            Same witness logic. The browser executable becomes a host-supplied
            parameter. The Mac Studio executes these bytes UNCHANGED.
```

| file | instrument | sha256 |
|---|---|---|
| `.witness/seed.ts` | both (unchanged) | `7c7988745011b52058be4a51f4b96a710971e723d28eadeffd902a76c16bdbe1` |
| `.witness/browser-witness.mjs` | remote (`5e69c8234`) | `8ac90d297c5f1eaec3cf5f5e38de29bc3e86733759cf332d037d6aa492d58364` |
| `.witness/browser-witness.mjs` | portable (this commit) | `855e24eada8162e252e752c139b4f7d1332d81410cfe48d410f4dbbf9772cd86` |

`seed.ts` is byte-identical across both. Only the browser binding changed:

```js
executablePath:
  process.env.CHROMIUM_PATH ||
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
```

Nothing else in the file differs — not the route, the cookie, the console
capture, the DOM assertions, or the mark gesture that runs `takeUpMark`.

---

## What may and may not be claimed

**Do NOT claim** byte-identical instrumentation between the remote run and the
Mac Studio run. It is not. The claim that holds is:

> Instrument logic is identical except for the removal of one host-specific
> executable-path constant into an environment parameter.

Literal cross-host byte identity is establishable — rerun the remote witness
with the portable instrument — but is not required unless the Mac result
disagrees with the remote one.

---

## Extraction on the Mac Studio — pin by commit, not by branch name

The historical record's recipe names the branch. **The branch tip has moved**,
so a bare branch-name extraction now yields the PORTABLE bytes, not the ones
whose hashes that record carries. Pin explicitly to the instrument you want.

```bash
cd /private/tmp/ws2-02c-2r-runtime-witness
mkdir -p .witness
git fetch origin claude/ws2-02c-2r-witness-ltdfvw

# PORTABLE instrument — what the Mac Studio run uses.
git show origin/claude/ws2-02c-2r-witness-ltdfvw:.witness/seed.ts \
  > .witness/seed.ts
git show origin/claude/ws2-02c-2r-witness-ltdfvw:.witness/browser-witness.mjs \
  > .witness/browser-witness.mjs

# REMOTE instrument, if the exact bytes of the remote run are ever wanted:
#   git show 5e69c8234:.witness/browser-witness.mjs
```

Verify before running, and **do not edit the files after hashing**:

```bash
shasum -a 256 .witness/seed.ts .witness/browser-witness.mjs
# expect 7c79887450... and 855e24eada...
git rev-parse HEAD       # 58ac95a779278bda427fb869aa188e618442d756
git branch --show-current # empty — detached
git status --porcelain   # tracked clean; .witness/ untracked only
```

---

## Invocation

```bash
export DATABASE_URL=...          # scratch database, migrations applied
npx tsx .witness/seed.ts         # prints m / p / sessionToken as JSON
npx next dev -p 3100

CHROMIUM_PATH="/actual/mac/path/to/Chromium-or-Chrome" \
node .witness/browser-witness.mjs \
  http://127.0.0.1:3100 \
  "$MANUSCRIPT_ID" "$PROPOSAL_ID" "$SESSION_TOKEN"
```

Capture alongside the result:

```bash
shasum -a 256 .witness/seed.ts .witness/browser-witness.mjs
printf 'CHROMIUM_PATH=%s\n' "$CHROMIUM_PATH"
"$CHROMIUM_PATH" --version
git rev-parse HEAD
git branch --show-current
git status --porcelain
```

The host difference is then explicit in the evidence rather than hidden inside
an edited file.

---

## Adjudication rule, unchanged

A Mac Studio FAIL is not pre-classified. The remote PASS shows `58ac95a77` can
behave correctly under one real runtime; it does not exclude a
platform-dependent implementation defect. Classify that run from its own
evidence, with implementation behaviour on the table alongside host-environment
behaviour and witness-object divergence.
