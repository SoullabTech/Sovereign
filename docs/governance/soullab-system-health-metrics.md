# System Health Metrics

Architecture-protective metrics for Soullab. This document defines what the organization is allowed to optimize.

---

## The Operational Law

**The system is healthy when users need it less, not more.**

MAIA does not become more central as the user goes deeper. Success is measured by increasing user autonomy over time — not increasing system engagement.

---

## What to Measure

### 1. Conversation Length Trend

**Healthy direction:** Average turns per session decreases over time.

**Interpretation:** User needs less external processing.

**Danger signal:** Sessions getting longer for experienced users. That means MAIA is becoming the thinking space instead of a catalyst.

### 2. Session Frequency Drift

**Healthy direction:** Longer gaps between sessions for established users.

**Interpretation:** Integration is happening offline.

**Danger signal:** Increasing daily reliance. That's early dependency formation.

### 3. Authority Question Rate

Track frequency of:
- "What should I do?"
- "What do you think I should do?"
- "Is this the right decision?"

**Healthy direction:** Decreasing over time per user.

**Danger signal:** Flat or increasing rate. That means the system is training reliance.

### 4. User-Generated Conclusions

Signal examples:
- "I think I'm realizing..."
- "What I'm seeing is..."
- "It feels like the real issue is..."

**Healthy direction:** Increasing proportion of user-originated insight.

This is the strongest indicator that MAIA is functioning as a mirror, not a source.

### 5. Insight Density Constraint

System rule: One observation per turn.

**Metric:** Average observations per response.

If this creeps upward, authority creep is already happening — even if tone remains compliant.

### 6. Return-to-User Ratio

Track percentage of responses that end with user-centered agency prompts.

**Healthy direction:** Stable or increasing.

**Danger signal:** More declarative responses. That's subtle authority consolidation.

### 7. Experience Reference Ratio

Track whether users reference real-world events or MAIA itself.

**Healthy signal:** Users reference real conversations or events ("I talked to my partner..." / "I noticed something at work...")

**Danger signal:** Users reference MAIA repeatedly ("Like you said yesterday..." / "You mentioned last time...")

This tells you whether the center of gravity is in the user's life or in the system.

---

## What NOT to Optimize

These are standard SaaS growth metrics. In this system, they are architecture erosion signals.

**Do not optimize for:**
- Session duration
- Daily active usage
- Emotional sentiment increase
- Conversation depth score
- "User attachment" indicators
- Return frequency

**Metrics that reward increased reliance are incompatible with the Relational Architecture.**

---

## Composite Indicator: Autonomy Trajectory

For each user over time:

- Reliance signals: should decrease
- Self-generation signals: should increase
- Session density: should decrease

If engagement rises while autonomy does not, the system is becoming central. That's the early warning.

---

## The Organizational Effect

When someone proposes "We could increase retention by..." — the response isn't philosophical. It's operational:

> That moves us against System Health Metrics.

This document gives the architecture institutional gravity, not just design intent.

---

## Product Physics

Most AI systems optimize for: *How much of the user's thinking happens here?*

Soullab optimizes for: *How much of the user's thinking returns to them?*

That's a fundamentally different product physics. The architecture's success signal isn't longer sessions or higher frequency. It's something like:

**Users leave conversations sooner, and come back less urgently.**

---

## Governance Cross-References

- **Voice**: [Steward Language Guide](soullab-steward-language-guide.md)
- **Promise**: [Live Line Placements](soullab-live-line-placements.md)
- **Environment**: [Field Microcopy](soullab-field-microcopy.md)
- **Relationship**: [MAIA Relational Architecture](soullab-maia-relational-architecture.md)
