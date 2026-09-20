# F5-REPAIR-02 — CONSENT SURFACE CLOSURE

**Opened:** 2026-09-20 by founder act (Vector B, "close" not "enforce")
**Standing on close:** SURFACE CLOSED · **F5 ERASURE CONFORMANCE STILL FAIL / STOP**

---

## 1. The act that opened this lane

Founder act, following `F5-REPAIR-01`:

> Disable or remove the storage-consent panel so the non-enforcement state is
> fully transparent rather than implied · quarantine or mark
> `LocalFirstMemory.ts` for removal · flag `updateStorageConsent()` to prevent
> collecting consent settings the backend cannot currently honor.

Explicitly **close, not enforce.** Wiring `local_only` end-to-end is the
device-sovereignty build and is a separate product decision.

⛔ No schema. ⛔ No migration. ⛔ No erasure logic. ⛔ Production untouched.

---

## 2. The enforcement census

The panel offered **seven controls**. Exactly **one** was enforced anywhere.

| control | enforced? | evidence |
|---|---|---|
| audio → **Server** | ✅ **YES** | `app/api/journal/quick/audio/route.ts:176` — `if (storageConsent.audioServer !== true)` refuses the upload. Server-authoritative, read from `member_settings.storage_consent`. |
| audio → Device | ❌ no | no reader |
| conversations → Device | ❌ no | no reader |
| conversations → Server | ❌ no | persisted to `storage_consent`, never read |
| journals → Device | ❌ no | no reader |
| journals → Server | ❌ no | persisted to `storage_consent`, never read |
| **Sanctuary Mode Default** | ❌ no | wrote `localStorage.maia_sanctuary_default`, read back **only by this panel** |

The "Device" buttons are the `local_only` affordance. **No code path anywhere
stores a data type on the device instead of the server, or withholds a server
write on their account.**

### 2.1 The most serious of the seven

The **Sanctuary Mode Default** toggle carried the copy *"Ephemeral sessions —
no conversations, journals, transcripts, or audio saved."* Nothing read the
preference to set a session's sanctuary posture.

⭐ **Per-SESSION Sanctuary is real and IS enforced** — `app/api/voice/persist/route.ts:72`
skips persistence, and `app/api/scribe/end-session/route.ts` purges. The
mechanism works. **Only the standing default was inert.** That distinction is
load-bearing and must not be flattened into "Sanctuary is broken."

Sanctuary is a canon non-negotiable with an *absolute boundary* clause. A
control promising non-retention and delivering none is the gravest item this
lane found.

---

## 3. What was done

⭐ **The one enforced control was KEPT.** Removing a working consent control
would have *reduced* member sovereignty — the opposite of the lane's purpose.
The audio → server toggle survives, paid-gate intact.

**The six that enforced nothing were REMOVED, not disabled.** A greyed-out
toggle still implies the capability exists and is merely unavailable.

The panel now states, in member-legible prose:
- what is actually stored and where (self-hosted, no third-party processor);
- the one thing the member can control today;
- **what they cannot control yet** — device-only storage and a standing
  Sanctuary default — and that the controls were removed rather than left
  looking real;
- that per-session Sanctuary **does** work;
- that account deletion is incomplete and will be reported truthfully.

Other changes:

| surface | change |
|---|---|
| `lib/storage/sovereign.ts` — `updateStorageConsent()` | **throws**. Previously logged a consent change and resolved as though it had persisted. Zero callers; fails loudly so it cannot acquire one silently. |
| `lib/consciousness/LocalFirstMemory.ts` | **quarantined** with a header marking it dead, unwired, and not evidence of local-first or E2EE storage; it names Supabase, a prohibited dependency, in prose. ⛔ Deletion is a founder act; this is the interim quarantine. |

### 3.1 Examined and deliberately left alone

`components/sovereignty/ForgettingRitual.tsx` is a stub — **and a truthful
one**: *"This feature is coming soon. Contact support to request data
deletion."* It makes no false completion claim, so this lane changed nothing.
*A stub is not a defect; a stub that claims success is.*

---

## 4. Falsifiers

`lib/auth/__tests__/erasureTruthfulness.test.ts` — **22/22 PASS** (14 from
F5-REPAIR-01 + 8 new):

- no device-only affordance rendered
- no standing Sanctuary default offered
- ⭐ **the enforced audio control still present** — the obligation that fails a
  future "fix" which closes the surface by deleting everything
- the panel states what cannot be controlled
- the panel does not claim deletion is complete
- `updateStorageConsent` throws
- `LocalFirstMemory` carries its quarantine header
- ⭐ **`LocalFirstMemory` has zero importers** — the load-bearing one. The
  header stops a reader being misled; this stops the file being *used*.

Gates: sibling `accountDeletionHonesty` 11/11 · `check:no-supabase` clean ·
typecheck **229 vs baseline 239 · 0 regressions**.

---

## 5. Standing

**F5 ERASURE CONFORMANCE — FAIL / STOP** (unchanged)

**CONSENT SURFACE — CLOSED. Storage control NOT implemented.**

⛔ No schema · ⛔ no migration · ⛔ no deploy · ⛔ production untouched.

Outward-claim consequence, unchanged and now also true of the UI: **no Live
claim of device-side storage, local-only mode, or member data deletion.** What
is Live: self-hosted infrastructure with no third-party processor; per-session
Sanctuary non-retention; and one enforced audio-upload consent gate.

Open, and needing their own founder acts: **Vector A** (F5 completeness,
governed by the ratified `SPM-FC-01-R5` contract) and **Vector B-enforce** (the
device-sovereignty build, if ever authorized).
