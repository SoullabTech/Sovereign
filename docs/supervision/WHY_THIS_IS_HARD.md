# Why This Is Hard

## The Engineering Moat Behind Clinical Supervision Streaming

This system looks straightforward until you try to make it **trustworthy under real conditions**. The "moat" isn't SSE itself — it's the **clinical-grade reliability + UX truthfulness + cursor semantics + evidence anchoring** as a cohesive whole.

---

## What's Non-Obvious / Hard in Practice

### A) "Live" has to mean live (truthful UI)

Most systems fail clinically because they don't tell the truth about freshness.

**Problem:** Users assume they're seeing real-time data when they're actually viewing stale content.

**Moat:** Connection-state UX + fallback mode that preserves continuity. The UI explicitly shows green/amber/red states so clinicians always know what they're seeing.

---

### B) Resume semantics without duplication or gaps

Reconnections happen constantly (mobile networks, proxies, laptop sleeps).

**Problem:** Naive implementations either duplicate content on reconnect or lose data during the gap.

**Moat:** `id:` cursor + `Last-Event-ID` resume + dedupe/merge logic. The browser sends the last-seen cursor on reconnect, and the server resumes from there.

---

### C) Load control without losing responsiveness

Naive polling hammers the backend; naive streaming can hang or stall.

**Problem:** Either you overload the server or you miss time-sensitive updates.

**Moat:** Adaptive backoff when idle (1s → 2s → 3s → 5s) + keepalive comments for proxy friendliness. Activity snaps interval back to 1s.

---

### D) Evidence anchoring (the "magical" demo is also a safety feature)

The transcript auto-jump feature isn't just cool — it's the mechanism that keeps insight interpretation grounded in the actual record.

**Problem:** Without anchoring, insights become "floating opinions" disconnected from what was actually said.

**Moat:** Insights become navigational anchors into evidence, reducing interpretive drift. Click an insight → see the exact moment it references.

---

### E) Consistency across live and history modes

Clinicians develop mistrust if live mode behaves differently than review mode.

**Problem:** Different interaction patterns between modes create confusion and errors.

**Moat:** Unified click/open behavior, shared selection semantics, same mental model. What works in live works in history.

---

## Failure Modes Handled

| Failure | Response |
|---------|----------|
| Network drops | Reconnect + resume from cursor |
| Proxy idle timeout | Keepalive comments prevent silent disconnect |
| SSE fails entirely | Polling fallback with explicit UI state change |
| Out-of-order arrivals | Merge + sort by timestamp |
| Duplicate events after reconnect | Dedupe via seen-set + cursor advancement |

---

## Scaling Notes (Without Over-Claiming)

SSE keeps infrastructure simple, but still requires thought around:

* **Per-session concurrency:** How many supervisors can watch one session?
* **DB query efficiency:** "Since cursor" queries need proper indexing
* **Batching for bursty periods:** Transcript segments can arrive rapidly during active speech

The architecture is naturally extensible:

* Add additional streams (markers, supervisor notes)
* Add "segmentId anchoring" later for exact jumps (stronger than time proximity)
* Add collaborative features (multiple supervisors, shared annotations)

---

## Why This Matters (Market Position)

1. **Trust is the product.** Clinical software that lies about its state loses users permanently.

2. **Simplicity compounds.** SSE + cursors is boring technology that actually works. No message brokers, no WebSocket state machines, no deployment complexity.

3. **Evidence anchoring is defensible.** The jump-to-moment feature isn't a gimmick — it's the mechanism that makes AI insights clinically usable rather than clinically dangerous.

4. **Sovereignty matters.** Local processing + no cloud dependencies isn't just a privacy story — it's operational independence for practices that can't afford vendor lock-in.
