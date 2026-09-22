# JARVIS-KP-01 / I5-P0R2R1 — HOST-PLANE SNI CORRECTION + REPAIRED-INSTRUMENT FALSIFICATION

STATUS: RECORD (⛔ not an authorization)
**Date**: 2026-09-22

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. Accepted production diagnosis

- host `minisforum`; Docker daemon responsive, `server=29.3.1`
- `maia-sovereign` **Up 3 hours (healthy)**, `status=running`
- image `sha256:0ced1e8065dae613f2f7ea4e74f15b50461333f54964dd009c33c672271f3fc2`
- Docker-independent local serving witness with **correct TLS SNI**:
  `/api/health` **200** · `/api/version` **200** · `/api/ready` **200**, body `ready=true`

⭐ **No production service incident was established.** The earlier dry-run-2 stall
was a Docker control-plane condition on a *different* machine, and the apparent
Part B failure was **my probe's defect, not an outage**.

## 2. ⭐⭐ The defect: an HTTP header cannot establish TLS SNI

The probe used `-H "Host: soullab.life" https://127.0.0.1/…`. The `Host:` header is
sent **after** the TLS handshake, so Caddy's SNI-based site matching never saw the
public name and judged the request against `127.0.0.1`.

**I conflated HTTP-layer routing with TLS-layer routing**, and the consequence ran
in the dangerous direction: **a healthy serving plane read as broken.** An
instrument whose failure mode is a false alarm about production is worse than one
that refuses.

Corrected to the authorized form:

```
curl --resolve soullab.life:443:127.0.0.1 https://soullab.life/api/<endpoint>
```

This satisfies both constraints at once — the URL authority is the public name, so
SNI is right, while only the **address** is forced to loopback, so no DNS lookup
and no hairpin path is involved. ⭐ `-k` was **dropped**: with correct SNI the real
certificate must validate, and that validation is itself serving-plane evidence.

⛔ No other semantic probe change was made, per §I.

## 3. ⚠️ The second lesson, ROUTED OUT and ⛔ NOT REPAIRED

The probe says *"Run on minisforum"* in a comment and **enforces nothing**, so its
first execution diagnosed the Mac Studio's Docker Desktop and the Mac's localhost
and presented that as a reading.

⭐ **The discriminator was already in the output and was not labelled as one**:
`context-show` returned `desktop-linux` on the Mac and `default` on minisforum.
The signal was present; nothing cued anyone to read it as a host identity.

A host guard would be a **semantic** probe change, which §I does not authorize. So
it is **named here and left unbuilt**: *the lane that finds a defect does not
thereby own it.* Part B now prints a one-line warning that the probe diagnoses the
host it runs on — reporting, ⛔ not refusing. **Recommendation for a later act: the
probe should refuse outright when it is not on the production host**, because an
instrument that can produce confident evidence about the wrong substrate is the
same defect class as this SNI bug.

## 4. §II falsification of the ceiling-repaired instrument — **6/6 PASS**

`scripts/witness/i5-p0r2-ceiling-falsifiers.sh` (committed, read-only, fixtures removed).

| # | Proposition | Result |
|---|---|---|
| F1 | a hanging Docker call returns within the ceiling | PASS — returned in 2s against a `sleep 120` stub |
| F2 | exactly one causal STOP is emitted | PASS — `DOCKER_CONTROL_PLANE_TIMEOUT` |
| F3 | no generic second STOP obscures it | PASS — `CONTAINER_UNREADABLE` occurrences: **0** |
| F4 | a non-timeout failure retains its original reason | PASS — `STOP CONTAINER_UNREADABLE` |
| **F5a** | **substantive checks unchanged vs authorized `e2f7d806`** | **PASS — invariant diff EMPTY** |
| F5b | no pre-existing refusal removed | PASS — added only `DOCKER_CONTROL_PLANE_TIMEOUT`, `INSTRUMENT_MISSING`, `INSTRUMENT_BLOB_MISMATCH` |

F5a compares, against the Founder-authorized bytes: `EXPECT_FULL` · `EXPECT_IMAGE`
· `MODEL` · the five-flag set · both `set_key` mutation targets · the Compose
reload argument vector · both SQL count queries · the ordered phase headers.
**Empty diff.**

⚠️ **The falsifier's own extractor was defective first**: it collected only codes
routed through `stop`/`refuse`, so its ADDED list omitted
`DOCKER_CONTROL_PLANE_TIMEOUT` — which is `echo`ed — and read as complete while it
was not. Corrected to collect echoed codes too. *F5b's proposition (nothing
removed) was never affected; the inventory it printed was.*

## 5. Custody — exact bytes for §IV reauthorization

```
remediation instrument   1ecf0cbdbd528f0b78d1f8f83161eb0c31d11147   (unchanged by this act)
host-plane probe         <see commit>                               (SNI-corrected)
ceiling falsifiers       <see commit>                               (new)
seam-identity.mjs        b86a7e3982a0bf809022c2fdfe2b7f28c203d223   (unchanged)
seam-identity-container  85bdba16753cceb4d5991ca4c8c69b57f79f1585   (unchanged)
```

⛔ The `e2f7d806` authorization **must not be spent against altered instrument
bytes.** The remediation instrument at `1ecf0cbd…` is a **candidate awaiting
reauthorization**; this record does not treat the earlier acceptance as carrying.

## 6. Standing

production serving plane **HEALTHY** · production service incident **NOT
ESTABLISHED** · SNI defect **CORRECTED** · host-identity defect **ROUTED OUT,
UNREPAIRED** · ceiling repair **FALSIFIED 6/6** · substantive checks **PROVEN
UNCHANGED** · digests `195b16bc…` / `a63cf931…` **UNMOVED** · `--apply` **NOT
RUN** · `.env.production` **UNMUTATED** · recreation **NONE** · flags **ALL OFF** ·
model execution **NONE** · rows **NONE** · B1 **UNREPAIRED** · B2 **UNREPAIRED** ·
`I5-P0R2` **UNSPENT** · instrument **NOT FROZEN** · ⛔ I5-P1 NOT OPENED ·
**PRODUCTION UNTOUCHED.**
