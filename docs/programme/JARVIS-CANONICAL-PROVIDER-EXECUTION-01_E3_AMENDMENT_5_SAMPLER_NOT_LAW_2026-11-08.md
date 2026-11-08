# E3 — AMENDMENT 5 · THE CAPACITY LAWS ARE SOUND; THE DARWIN SAMPLER IS THE DEFECT

Canonical read at commit:`b46113f8d41cce7703b631b614b1bb2e99742c1d`.

## 1 · The controlled observation

Docker Desktop, which reserves 12.25 GiB per `docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md`, was quit. The enforced metric moved **48 MB**:

| | `os.freemem()` |
|---|---|
| before quit | 290,324,480 B (0.27 GiB) |
| after quitting a 12.25 GiB reservation | 338,640,896 B (0.32 GiB) |
| required | 27,146,623,328 B (25.28 GiB) |

⭐ **Releasing ~12 GiB changed the gate's input by 0.4% of what was released.** The enforced quantity does not track availability.

## 2 · ⭐⭐ The laws are calibrated in a quantity the Darwin sampler cannot produce

`capacity/falsifiers.mjs` `HEALTHY`:
```js
platform: 'darwin',
total_ram_bytes: 48 * GiB,
free_ram_bytes:  32 * GiB,   // 67% of installed, labelled darwin
```
**LC-1 asserts 32 GiB free on a 48 GiB Darwin host.** Measured on that exact machine: **0.32 GiB (0.66%)**, insensitive to a 12 GiB release.

And **LC-2's panic window is 5.5 GiB free**, taken from the Walk #3 incident where `FREEZE.json` says those figures were what **"Ollama reported"**.

⭐ So the thresholds were set from one quantity (Ollama's free-RAM report) and are enforced against another (`os.freemem()`, libuv's `free_count` — truly free pages only, excluding inactive, cached and purgeable). The sampler makes this explicit without meaning to:

```js
} else if (platform === 'linux') {
  if (Number.isFinite(mem.MemAvailable)) freeRam = mem.MemAvailable;   // corrected
```

**Linux reads `MemAvailable`. Darwin is left at `free_count` and was never corrected.** Not a design choice — an unfinished branch, in the one place the programme actually runs.

## 3 · ⛔ Two of my own claims withdrawn

**(a) "The host is genuinely in a bad memory state" — WITHDRAWN.** Last turn I accepted the gate's refusal as truthful because the panic anchor was in the same units. The Docker observation shows the enforced metric is not comparable to the calibration source, so the refusal is not evidence about this host's capability.

**(b) "Open a capacity lane to change the gate" — remains withdrawn, and now for the right reason.** `FREEZE.json`: *"repaired, never by weakening LC-1 through LC-8."* ⭐ **No law needs weakening.** LC-1–LC-8 can stand byte-for-byte; the repair is in `sampleLocalCapacity`'s Darwin branch — read a quantity comparable to what the laws were calibrated against.

## 4 · D2 corrected

D2 said the module has "no charter, falsifiers or owning record." **Falsifiers exist and are frozen** — `capacity/{falsifiers,candidates,matrix}.mjs`, blob-pinned in `FREEZE.json`, owned by **`JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R3`** under law **RB-A6**. The finding always had an owner; I named the wrong addressee. The non-delivery was mine, not the system's.

## 5 · Standing

**Finding belongs to O5-R3 / RB-A6**, as a sampler repair under unchanged law. ⛔ Not opened here. ⛔ No law weakened. ⛔ No source modified.

**E3 ⛔ BLOCKED at AC-9 by a Darwin sampler defect, not by host capability · UNSPENT · no Work Unit · no grant · production untouched.**

⚠️ **Not established**: that this host can safely launch the 65K realization. Walk #3's panic is real, and the right threshold in a corrected metric is O5-R3's to determine — ⛔ not something to assume generous because the current number is wrong.
