# 🌀 MAIA Observation Log Template

**File:** `observation_log_YYYY-MM-DD.md`
**Purpose:** Track real interactions and how MAIA's Skills Runtime + Beads memory respond.
**Use:** Duplicate this file each day → `observation_log_YYYY-MM-DD.md`

---

## 📅 Session Context

| Field                      | Entry                                     |
| -------------------------- | ----------------------------------------- |
| **Date**                   |                                           |
| **Phase**                  | (e.g. Water 2 – Transformation)           |
| **Dominant Element Today** |                                           |
| **Session ID**             | (auto or manual)                          |
| **Environment / Mood**     | (quiet, focused, scattered, grounded…)    |
| **Intent for the Day**     | (observe grounding, test tolerance, etc.) |

---

## 🧭 Interaction Log

| Time | Input / User Statement | Skill Triggered | Outcome (`success` \| `soft_fail` \| `hard_refusal`) | Felt Alignment (✅ aligned / ⚠ off / ❌ mis-aligned) | Notes / Observations / Felt Shift |
|------|------------------------|-----------------|-------------------------------------------------------|-------------------------------------------------------|-----------------------------------|
| 09:14 | "Feeling foggy this morning." | elemental-checkin | success | ✅ | Grounded me quickly; calm returned |
| 10:52 | "Can we slow down?" | window-of-tolerance | success | ✅ | Perfect pacing adjustment |
| 13:47 | "Too many tabs open!" | dialectical-scaffold | soft_fail | ⚠ | Prompt didn't quite fit |
| 18:10 | "Ready to integrate the day." | elemental-checkin + Beads ritual | success | ✅ | Strong closure feeling |
| 22:03 | "I can't settle." | window-of-tolerance | hard_refusal | ❌ | Possibly over-protective gate |

*Add as many rows as you like; aim for 10–20 authentic interactions per day.*

---

## 🧩 Emergent Patterns

| Observation                                    | Possible Cause         | Hypothesis / Next Action                         |
| ---------------------------------------------- | ---------------------- | ------------------------------------------------ |
| Check-ins often pair with tolerance regulation | Shared element = Water | Consider composite "Flow Regulation" proto-agent |
| Hard refusals at night                         | Circadian fatigue      | Adjust gating thresholds after 20:00           |

---

## 🧠 End-of-Day Reflection

* **Most Alive Skill:**
* **Skill That Mis-Fired:**
* **Overall Coherence Level (1–10):**
* **Surprises / Insights:**
* **Candidate for New Skill:**

---

## 🧮 Quick SQL Queries for Context

*(optional copy/paste into psql or Supabase UI)*

```sql
-- Skill performance for the past 24h
SELECT skill_id, outcome, COUNT(*) AS uses
FROM skill_usage_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY skill_id, outcome;

-- Emerging pairs
SELECT skill_set, cooccurrence_count, avg_success_rate
FROM v_skill_cooccurrence
ORDER BY cooccurrence_count DESC
LIMIT 10;
```

---

## 💫 End Note

> "Observe without fixing.
> Let the pattern reveal itself before you decide how to improve it."
