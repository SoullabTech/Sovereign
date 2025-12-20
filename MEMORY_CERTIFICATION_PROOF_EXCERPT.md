# MAIA Memory Certification

## What We Certify (Not What We Hope)

This document summarizes what MAIA's memory system is proven to do through automated certification tests. These are *repeatable checks* we run against the live system.

### 1) Memory persists across restarts

**Certified outcome:** conversation history remains available even if the server is stopped and restarted.
**Why this matters:** your context doesn't vanish because of a deploy, crash, or reboot.

### 2) Memory injection is transparent (you can see the receipts)

Each response includes **truth metadata** that shows what MAIA actually used from memory.

**Certified metadata fields include:**

* `exchangesAvailable` — how many past exchanges exist
* `exchangesInjected` — how many were actually inserted into the prompt
* `charsInjected` — how much memory text was injected
* `truncated` — whether memory had to be cut down
* `provider` — where memory came from (e.g., PostgreSQL)

**Why this matters:** the system doesn't just *claim* it remembered — it shows whether memory was truly present.

### 3) No name fabrication on cold start

**Certified outcome:** when MAIA does not have your name (`exchangesInjected=0` and no userName provided), it **will not invent a name** in the greeting.

This is explicitly tested by **TEST 0: cold-start fabrication guard**.

**Why this matters:** it prevents the classic assistant failure mode: "Hi Emily!" when you never said you were Emily.

---

## What We Do *Not* Claim Here

This certification excerpt is narrowly scoped to memory persistence + truth constraints.

It does **not** attempt to certify:

* perfect recall phrasing (models may paraphrase)
* avoidance of generic labels like "Guest" (that may be covered elsewhere, but it's not the claim being made in *this* proof)
* correctness of deeper inferences (only whether memory was present + how it was used)

---

## Latest Certification Run

**Status:** ✅ CERTIFIED
**Tests Passed:** 14/14
**Tests Failed:** 0
**Cross-restart recall:** ✅ Passed
**Cold-start name fabrication guard (TEST 0):** ✅ Passed

---

## What This Means for Beta Testers

You can rely on three guarantees during beta:

1. **Your conversation history can persist** across restarts.
2. **MAIA will show you whether memory was actually injected** into a reply.
3. **If MAIA doesn't know your name yet, it won't invent one.**

---

## Quick Glossary

* **Cold start:** first interaction in a session with no stored exchanges available to inject.
* **Injected:** actually included in the prompt that generated the response (not merely stored somewhere).
* **Truth metadata:** the system's transparency layer that reports what happened, not what's implied.

---

## Technical Details

### Defense in Depth Architecture

MAIA implements three-layer protection against name hallucination:

**Layer 1: Voice Mode Instructions**
- Talk, Care, and Note modes all include explicit constraints
- "Never invent names when userName is unknown"

**Layer 2: Memory Block Truth Constraints**
- Self-sealing rules in MEMORY header
- Persists even if mode instructions are truncated
- "Use ONLY details explicitly present in this MEMORY block"

**Layer 3: Deterministic Post-Processor**
- `stripInventedNameGreeting()` function in maiaService.ts
- Final failsafe that strips "Hi Emily!" → "Hi!"
- Only runs on first turn when userName is empty
- Case-insensitive pattern matching

### Certification Test Suite

The memory certification (`scripts/certify-memory.sh`) includes:

- **TEST 0:** No-name fabrication guard (cold start)
- **TEST 1:** Write conversation turn to database
- **TEST 2:** Write second turn with context
- **TEST 3:** DB sanity check
- **TEST 4:** Database persistence check
- **TEST 5:** Memory recall verification
- **TEST 6:** Cross-restart persistence (server restart simulation)
- **TEST 7:** Database integrity after restart

### Files Modified

- `lib/sovereign/maiaService.ts` — deterministic post-processor
- `lib/sovereign/maiaVoice.ts` — TRUTH_CONSTRAINTS in memory block
- `scripts/certify-memory.sh` — TEST 0 cold-start guard
- `scripts/certify.sh` — TEST 11 name invention check

### Running the Certification

```bash
# Clean environment
pkill -f "next dev" 2>/dev/null || true

# Run memory certification (starts/stops server itself)
env PORT=3000 bash scripts/certify-memory.sh 2>&1 | tee /tmp/maia-cert.log

# Check results
tail -50 /tmp/maia-cert.log
```

Full certification log available at: `/tmp/maia-cert-final-hardeners.log`
