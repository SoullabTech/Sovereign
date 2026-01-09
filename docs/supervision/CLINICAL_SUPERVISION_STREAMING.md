# MAIA Clinical Supervision Streaming

## A Real-Time Transcript + Insight System Using SSE, Cursors, and Clinically-Safe UX

### Version

Draft v0.1 (Jan 2026)

### Authors

Kelly Nezat

---

## Abstract

This paper describes the design and implementation of a real-time **Clinical Supervision System** inside the MAIA-SOVEREIGN platform. The system streams live **transcript segments** and **clinical insights** to a supervision dashboard during an active session, while preserving reliability and safety through cursor-based delivery, reconnection semantics, and a polling fallback. It uses **Server-Sent Events (SSE)** rather than WebSockets to simplify operational complexity while supporting resilient "live mode" behavior: reconnection with resume via `Last-Event-ID`, adaptive backoff during idle periods, and explicit connection-state UI. The result is a clinically-friendly interface that supports *immediacy* without sacrificing *auditability*, *sovereignty*, or *operational stability*.

---

## 1. Problem Statement

Clinical supervision during live or semi-live sessions has a recurring tension:

* Supervisors and clinicians want **real-time awareness** of what's unfolding (transcript + signals).
* Systems must be robust under imperfect connectivity (mobile networks, proxies, transient drops).
* Clinical environments demand **high trust UX**: no "mystery behavior," clear states, and safe defaults.
* The system must support **post-session review** (history mode) with consistent interaction patterns.

Traditional approaches (polling-only) increase latency and server load; WebSockets add operational overhead and failure modes that can be disproportionate to the use case.

The goal: **make live supervision feel "present"** while remaining **simple, durable, and clinically interpretable**.

---

## 2. Design Goals

### Reliability

* Resume streams after disconnects without duplicating or skipping content.
* Avoid runaway server load when sessions are quiet.
* Provide graceful fallback behavior if streaming fails.

### Clinical UX Integrity

* Live mode should behave like history mode: clicks open details, not just highlight.
* Explicit connection status: users should *know* whether they're live-streaming or in fallback.

### Operational Simplicity

* Prefer infrastructure-light streaming (SSE) over stateful socket orchestration.
* Avoid additional brokers if not needed; rely on the database + cursor semantics.

### Sovereignty / Security Hygiene

* Environment secrets are not committed.
* Attribution guardrails ensure repo integrity and authorship constraints.
* Auditability is preserved through stored transcript segments and insight events.

---

## 3. System Overview

The system has two primary live streams:

1. **Transcript Stream**
   `GET /api/supervision/transcript/stream?sessionId=...&afterMs=...`

2. **Insights Stream**
   `GET /api/supervision/insights/stream?sessionId=...&afterMs=...`

Both streams follow the same contract pattern:

* The client opens an `EventSource`.
* The server emits:

  * `retry: 2000` (reconnect hint)
  * `event: ready`
  * `event: segments` or `event: insights`
  * periodic keepalive comments (`: keepalive ...`)
* On each payload:

  * the client merges + dedupes + updates cursor
* On error:

  * the client switches to polling fallback (existing behavior retained)

---

## 4. Why SSE (Not WebSockets)

SSE was chosen because it matches the problem constraints:

* **Unidirectional streaming** (server → client) is exactly the requirement.
* Built-in browser reconnection semantics.
* Simpler server implementation in Next.js routes.
* Compatible with proxies/CDNs when properly kept alive.
* Easy to reason about for auditability: "events are appended over time."

WebSockets may be appropriate later for bidirectional collaboration, but SSE gives a high-value "live feel" at low complexity.

---

## 5. Core Mechanisms

### 5.1 Cursor-Based Streaming

Both transcript and insights streams are cursor-driven. The client requests "everything after X":

* Query parameter: `afterMs`
* Resume header: `Last-Event-ID`

The server includes an `id: <cursor>` field in event frames. On reconnect, the browser sends `Last-Event-ID`, allowing the server to resume from the last confirmed cursor.

This yields "exactly-once-ish" delivery at the UX layer: duplicates are prevented via dedupe, and missing data is avoided via cursor continuity.

### 5.2 Adaptive Backoff

When no new events are found, the server backs off:

* 1s → 2s → 3s → 5s when idle
* snaps back to 1s when activity resumes

This reduces load without harming responsiveness when content is flowing.

### 5.3 Keepalive Comments

To avoid silent proxy timeouts, the server sends SSE comments:

`: keepalive <timestamp>`

This is operationally important in the real world, especially behind reverse proxies.

### 5.4 Polling Fallback

If SSE errors, the client:

* closes the EventSource
* switches to existing polling logic
* reflects the degraded state in the UI

This ensures "live supervision" never becomes "blank supervision."

---

## 6. Data Model Semantics

### 6.1 Transcript Segment Shape

Transcript segments are time-anchored:

```ts
interface TranscriptSegment {
  id: string;
  speaker: string;
  speakerConfidence?: number;
  startMs: number | null;
  endMs: number | null;
  text: string;
  confidence?: number;
  createdAt?: string;
}
```

This supports:

* chronological grouping
* time-based navigation
* segment-level highlighting and selection

### 6.2 Insight Shape

Insights may vary by mode (clinical vs practice), but they share:

* an `id`
* textual fields (summary/body/content)
* optional time anchoring (`time_range_start_ms` etc.)

The system standardizes "click handling" across live and history modes by using a unified `InsightLike` that carries optional variants.

---

## 7. UX: "Live Without Confusion"

### 7.1 Connection-State Indicator

Both TranscriptViewer and InsightsViewer display explicit connection status:

* **Green** = SSE connected ("LIVE")
* **Amber** = fallback mode ("LIVE (fallback)")
* **Red** = reconnecting
* **Neutral** = idle/starting

This avoids the common failure mode where clinicians assume they're "live" while the UI is stale.

### 7.2 Insight Detail Panel

Clicking an insight opens the **full body** in a detail panel (not just card highlight). If no `body`-like field exists, the panel falls back to a JSON view for transparency and debugging.

### 7.3 "Feel Magical" Feature: Transcript Auto-Jump

Clicking an insight with time anchoring triggers a jump:

1. Prefer segment containment: `startMs <= target <= endMs`
2. Fallback to nearest `startMs`

The transcript scrolls smoothly to the closest relevant segment, and briefly highlights the focused segment. Auto-scroll is disabled so the user doesn't get "pulled away" from the jumped context.

This creates the sensation of *clinical precision*: "the insight knows where it came from."

---

## 8. Safety and Governance

This system is designed to support clinical integrity rather than replace it.

* Insights are presented as supervisory signals, not final diagnoses.
* The UI favors interpretability: clear states, clear provenance, consistent behavior.
* Session history preserves auditability and post-hoc review.

Operational governance also matters:

* `.env.local` is not committed; only templates exist.
* A repo-portable commit hook blocks unwanted co-authorship lines.
* A setup script enables hooks for new clones.

---

## 9. Testing & Verification

### 9.1 Manual Stream Tests

Transcript stream:

```bash
curl -N "http://localhost:3000/api/supervision/transcript/stream?sessionId=YOUR_ID&afterMs=-1"
```

Insights stream:

```bash
curl -N "http://localhost:3000/api/supervision/insights/stream?sessionId=YOUR_ID&afterMs=-1"
```

Expected behaviors:

* `event: ready` arrives quickly
* periodic keepalive comments appear
* `event: segments` / `event: insights` appear on new data
* reconnect resumes with `Last-Event-ID`

### 9.2 UI Tests (Practical)

* Start a live session → verify green LIVE state
* Disconnect network briefly → verify reconnecting → recover
* Force SSE error (dev tools) → verify fallback amber LIVE (fallback)
* Click insight → detail opens + transcript jumps (when time fields exist)

---

## 10. Future Work

### Strong typing for insight payloads

Standardize insight schema across modes to avoid optional-field sprawl.

### Anchoring precision

Add explicit `segmentId` references when insights are generated, so navigation becomes exact rather than "closest by time."

### Multi-view layouts

Tabbed transcript/insights, split-pane, or a "timeline lane" that overlays insights directly onto transcript time.

### Supervisor annotations

Allow supervisors to add tags or notes linked to transcript timestamps and insight IDs (stored as structured events).

### Audit export

Generate review-ready supervision reports (PDF/Doc) with selected insights, transcript excerpts, and clinician notes.

---

## Appendix A: Streaming Event Contract (Recommended)

**Events**

* `ready`: `{ sessionId, afterMs }`
* `segments`: `{ segments: TranscriptSegment[], afterMs }`
* `insights`: `{ insights: InsightLike[], afterMs }`
* `error`: `{ message }`

**Headers / Meta**

* `retry: 2000`
* `id: <cursor>` for resumability
