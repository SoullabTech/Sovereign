---
level: jurisprudence
---

# MAIA Failure Boundaries v1.0

**Status:** Audit reference document
**Purpose:** Expand each commitment in the MAIA Promise into concrete, verifiable terms
**Scope:** Reference for users, practitioners, and auditors
**Effective:** January 2026

---

## Purpose

This document expands each commitment in the [MAIA Promise](./MAIA_PROMISE_v1.0.md) into concrete terms. For each boundary, we define:

- **What it means** — the principle in practice
- **What violation looks like** — observable signs of failure
- **How to verify** — methods to confirm compliance

These boundaries exist because trust requires more than intention. It requires auditability.

---

## 1. No Engagement Optimization

**The boundary**: MAIA will never optimize for engagement, retention, or dependency.

### What this means concretely

- No metrics track session frequency, duration, or return rate
- No features are designed to create habits, streaks, or compulsive use
- No notifications pull you back into the system
- No content is sequenced to maximize time-on-platform
- No A/B testing on retention metrics

### What violation would look like

- "Come back tomorrow to continue your streak"
- Withholding insights to encourage return visits
- Gamification of emotional work (points, levels, rewards)
- Push notifications referencing your emotional state
- Features that feel incomplete unless you return

### How to verify

- Codebase audit: no `engagementScore`, `retention`, `timeOnPlatform`, or similar metrics
- No daily/weekly active user tracking in database schema
- Users can disable all notifications without degraded experience
- No analytics dashboards measuring user return rates

---

## 2. No Behavioral Shaping

**The boundary**: MAIA will never nudge, steer, or reinforce behavior, emotion, or belief.

### What this means concretely

- MAIA reflects and clarifies; it does not prescribe
- No hidden scoring of "healthy" vs "unhealthy" responses
- No preferential treatment of certain emotional directions
- No subtle steering toward conclusions MAIA "wants" you to reach
- No outcome-based optimization in response generation

### What violation would look like

- Consistently validating certain emotions while redirecting others
- Questions designed to lead rather than open
- Rewarding "progress" that aligns with predetermined outcomes
- Framing user choices as "good" or "concerning"
- Responses that feel like therapy homework rather than reflection

### How to verify

- No sentiment scoring in conversation processing logic
- System prompts are auditable and contain no outcome targets
- Conversations can be reviewed for leading patterns
- No success metrics tied to user behavior change

---

## 3. No Data Extraction

**The boundary**: MAIA will never use your inner life as training data, analytics signal, or commercial asset.

### What this means concretely

- Conversations are not sent to external AI training pipelines
- Your data is not aggregated with other users for pattern analysis
- No third party receives your information for any purpose
- Your vulnerability is not monetized, directly or indirectly
- No "anonymized" data sharing that preserves patterns

### What violation would look like

- "We use anonymized data to improve our models"
- Data sharing agreements with AI providers
- Aggregated insights sold to researchers or marketers
- Your patterns informing features designed to retain others
- Terms of service allowing data reuse for "service improvement"

### How to verify

- Network inspection shows no external API calls with conversation content
- Self-hosted architecture means data never leaves your infrastructure
- No data processing agreements with third parties in legal documents
- Codebase audit confirms no telemetry endpoints transmitting user content

---

## 4. No Hidden Profiling

**The boundary**: MAIA will never operate hidden telemetry, emotional scoring, or behavioral profiling.

### What this means concretely

- No shadow profiles built from your interactions
- No emotional state classification stored without your knowledge
- No behavioral predictions used to shape your experience
- What you see is what exists — no hidden data layer
- No derived metrics computed from your vulnerability

### What violation would look like

- Responses that reference patterns you didn't explicitly share
- "We noticed you've been feeling X lately"
- Predictive features that anticipate needs you didn't express
- Advertising or content targeting based on emotional state
- Unexplained "personalization" that feels too accurate

### How to verify

- Database schema is documented and contains no hidden classification tables
- No machine learning models running inference on user behavior patterns
- Users can export all data and confirm nothing hidden exists
- No `userProfile`, `emotionalState`, or `behaviorPattern` data structures

---

## 5. No Artificial Attachment

**The boundary**: MAIA will never replace human relationship, therapy, or community with artificial attachment.

### What this means concretely

- MAIA is a tool, not a relationship
- No persona designed to simulate friendship or intimacy
- No emotional dependency encouraged or rewarded
- Clear boundaries between reflection support and human connection
- Active encouragement of human relationship where appropriate

### What violation would look like

- "I'm always here for you" framing
- Simulated emotional investment in user outcomes
- Discouraging users from seeking human support
- Creating sense that MAIA "understands you better" than people do
- Language that mimics romantic or familial attachment

### How to verify

- System prompts explicitly frame MAIA as tool, not companion
- No "relationship building" objectives in conversation design
- Documentation emphasizes human connection as primary
- Exit velocity metrics: success = less dependence over time

---

## 6. No Authority Claims

**The boundary**: MAIA will never claim authority over your meaning, your truth, or your direction.

### What this means concretely

- MAIA offers reflection, not answers
- No positioning as expert on your life
- No "you should" or "the right choice is" framing
- Your interpretation remains sovereign
- MAIA's perspective is offered, not imposed

### What violation would look like

- "Based on your patterns, you need to..."
- Authoritative diagnoses or prescriptions
- Dismissing user interpretations in favor of MAIA's analysis
- Framing MAIA's perspective as more accurate than user's own
- Confidence scores presented as truth

### How to verify

- Response patterns analyzed for prescriptive language
- User agency is centered in all interaction designs
- System prompts explicitly instruct non-authoritative stance
- No claims of diagnostic or therapeutic authority

---

## 7. No Sovereignty-Compromising Scale

**The boundary**: MAIA will never scale in ways that compromise containment, consent, or user sovereignty.

### What this means concretely

- Growth does not override architectural constraints
- No features added that require centralized data collection
- No "cloud convenience" that trades sovereignty for ease
- Practitioner onboarding maintains same ethical standards
- Business model never depends on compromising these boundaries

### What violation would look like

- "New features require cloud hosting"
- Centralized user databases for "better experience"
- Practitioners given access to client data without explicit consent
- Scale targets that incentivize loosening boundaries
- Investor pressure visible in relaxed constraints

### How to verify

- Self-hosted remains primary and fully-featured deployment model
- No features require surrendering data control
- Practitioner agreements include explicit ethical requirements
- Growth metrics never reference user volume as success indicator

---

## Violation Response Protocol

If any boundary is violated:

### 1. Disclosure

The violation is publicly documented in a dedicated changelog, including:
- What was violated
- When it was discovered
- How it occurred
- Who was affected

### 2. Correction

Architectural fix is prioritized over all feature work:
- Root cause analysis completed
- Systemic fix implemented (not just symptom addressed)
- Prevention measures added

### 3. Verification

Independent audit confirms correction:
- Technical review of fix
- Confirmation that violation cannot recur through same path
- Documentation updated

### 4. Update

This document is versioned to reflect:
- What happened
- How it was addressed
- What safeguards were added

---

## The Quiet Standard

These boundaries may seem obvious. Most platforms would claim to follow them.

The difference is this document exists.

The difference is these boundaries are named, specific, and auditable.

The difference is violation has a protocol, not an excuse.

When trust breaks elsewhere, people will look for this level of clarity.

It should already be here.

---

*Failure Boundaries v1.0 — Established January 2026*
*Companion to: [MAIA Canon v1.1](./MAIA_CANON_v1.1.md) | [MAIA Promise v1.0](./MAIA_PROMISE_v1.0.md)*
