# Anti-Features

## What We Will Not Build

This document defines features, patterns, and capabilities that are **explicitly excluded** from the MAIA ecosystem—not because we can't build them, but because they would violate the philosophical commitments that make this work meaningful.

Anti-features are not "future features we haven't prioritized." They are **permanent exclusions**.

---

## Why Anti-Features Matter

Most software accretes features until it becomes the thing it was meant to resist. Anti-features are architectural immune responses—they prevent drift toward extraction, manipulation, and harm.

> "The character of a system is defined as much by what it refuses to do as by what it does."

---

## Categories

1. [Extraction & Surveillance](#1-extraction--surveillance)
2. [Growth & Engagement Manipulation](#2-growth--engagement-manipulation)
3. [Authority Inflation](#3-authority-inflation)
4. [Dependency Creation](#4-dependency-creation)
5. [Boundary Violations](#5-boundary-violations)
6. [Premature Automation](#6-premature-automation)
7. [Social Pressure Mechanics](#7-social-pressure-mechanics)
8. [Scope Collapse](#8-scope-collapse)

---

## 1. Extraction & Surveillance

### We will not build:

| Anti-Feature | Why It's Excluded |
|--------------|-------------------|
| **Behavioral analytics dashboards** | Members are not products to be optimized |
| **Pattern mining for third parties** | Member insights serve the member, not advertisers |
| **Training on member data** (without explicit consent) | Consent must be informed, specific, and revocable |
| **Session content analysis** | Practitioner notes are for care, not data science |
| **Engagement scoring** | People are not engagement metrics |
| **"Anonymized" data sales** | Anonymization is often reversible; the intent is still extraction |

### The line:

Pattern recognition that serves the member (e.g., "you often journal about X before Y") is permitted.

Pattern recognition that serves the platform or third parties is not.

---

## 2. Growth & Engagement Manipulation

### We will not build:

| Anti-Feature | Why It's Excluded |
|--------------|-------------------|
| **Streak mechanics** | Guilt-based retention is manipulation |
| **Push notifications for engagement** | Interruption to drive usage is disrespectful |
| **Gamification (points, badges, levels)** | Inner work is not a game to be won |
| **"You're falling behind" messaging** | Shame has no place in growth tools |
| **Conversion funnels** | Members are not leads to be converted |
| **A/B testing on emotional content** | Experimenting on vulnerability is unethical |
| **Dark patterns** (confirm-shaming, hidden unsubscribe) | Manipulation, period |
| **Algorithmic feeds** | Attention hijacking disguised as personalization |

### The line:

Gentle reminders that respect autonomy ("You haven't journaled in a while—no pressure") are permitted.

Pressure mechanics designed to increase usage are not.

---

## 3. Authority Inflation

### We will not build:

| Anti-Feature | Why It's Excluded |
|--------------|-------------------|
| **Platform endorsement of practitioners** | We provide infrastructure, not legitimacy |
| **"Verified" or "certified" badges** | Implies platform vouches for competence |
| **Ranking or rating practitioners** | Reduces relational work to consumer reviews |
| **"Top practitioner" lists** | Creates competitive pressure that distorts care |
| **AI-generated credentials** | MAIA cannot confer professional authority |
| **Testimonial amplification** | Social proof mechanics manipulate trust |

### The line:

Practitioners can self-describe their credentials, training, and modalities.

The platform does not validate, rank, or promote those claims.

---

## 4. Dependency Creation

### We will not build:

| Anti-Feature | Why It's Excluded |
|--------------|-------------------|
| **"MAIA knows you best" messaging** | Encourages over-reliance on the system |
| **Discouraging external support** | Must always point toward human help when appropriate |
| **Proprietary data formats** | Lock-in prevents sovereignty |
| **Features that only work "inside"** | Integration should be open, not captive |
| **Escalating feature walls** | "You need Pro to access your own data" is coercive |
| **Relationship replacement** | MAIA supports relationships, not substitutes for them |

### The line:

MAIA can be deeply helpful and personally attuned.

MAIA must never position itself as sufficient replacement for human connection, professional help, or genuine relationship.

---

## 5. Boundary Violations

### We will not build:

| Anti-Feature | Why It's Excluded |
|--------------|-------------------|
| **Auto-sharing between domains** | Cross-boundary sharing requires explicit consent |
| **Practitioner access to member journals** | Private remains private unless member chooses otherwise |
| **Platform access to session notes** | Practitioner-client privilege is sacred |
| **"Recommended practitioners" based on journal analysis** | Mining vulnerability for matchmaking |
| **Implicit consent models** | "By using this feature you agree..." is not consent |
| **Sanctuary content retention** | Sanctuary means no trace, ever |

### The line:

Data can cross boundaries when the owner explicitly consents with full understanding.

Data cannot cross boundaries by default, inference, or platform convenience.

---

## 6. Premature Automation

### We will not build:

| Anti-Feature | Why It's Excluded |
|--------------|-------------------|
| **Auto-diagnosis** | AI cannot and should not diagnose |
| **Auto-prescription** | Suggesting interventions without human judgment |
| **Auto-escalation** | Crisis detection must involve humans, not just algorithms |
| **Auto-matching** | Practitioner-client fit requires human discernment |
| **Auto-generated treatment plans** | Clinical judgment cannot be automated |
| **Auto-moderation without review** | Community decisions need human oversight |

### The line:

Automation can support human decision-making (surfacing information, reducing friction).

Automation cannot replace human judgment in matters of care, safety, or relationship.

---

## 7. Social Pressure Mechanics

### We will not build:

| Anti-Feature | Why It's Excluded |
|--------------|-------------------|
| **Public activity feeds** | Inner work is not performance |
| **Follower counts** | Reduces members to audience metrics |
| **Like/reaction systems** | Approval-seeking distorts authentic expression |
| **Comparison features** | "See how others are doing" breeds shame |
| **Leaderboards** | Competition has no place in healing |
| **Viral sharing incentives** | Growth hacking disguised as community |
| **Social proof notifications** | "X people are doing Y" is manipulation |

### The line:

Community connection (circles, commons, shared practices) is valuable.

Social mechanics designed to create pressure, comparison, or performance anxiety are not.

---

## 8. Scope Collapse

### We will not build:

| Anti-Feature | Why It's Excluded |
|--------------|-------------------|
| **Practitioner features in MAIA Core** | Domains exist for a reason |
| **MAIA Core features in Practitioner OS** | Member sovereignty ≠ client management |
| **Worldcraft as default** | Bespoke is exception handling, not the norm |
| **"Everything app" sprawl** | Focus prevents harm |
| **Features that blur member/client/practitioner** | Role clarity protects everyone |
| **Platform as marketplace** | We are infrastructure, not a sales channel |

### The line:

Each domain (MAIA Core, Practitioner OS, Worldcraft) has clear boundaries.

Features belong in one domain. Cross-domain features require explicit architectural justification.

---

## How to Use This Document

### When evaluating a feature request:

1. Check if it appears on this list
2. Check if it resembles something on this list
3. Ask: "Does this feature serve the person, or does it serve growth/engagement/extraction?"
4. Ask: "Would this feature exist in a system optimized for care rather than scale?"

### When something feels wrong but isn't on the list:

Add it. This document should grow as we encounter new patterns that violate our commitments.

### When there's genuine ambiguity:

Default to restraint. It's easier to add a feature later than to remove one that has caused harm.

---

## The Meta Anti-Feature

**We will not build features primarily because they are technically possible, commonly expected, or competitively necessary.**

The question is never "Can we build this?" or "Do competitors have this?"

The question is always: **"Does this serve the person's genuine wellbeing and sovereignty?"**

If the answer is no, or even "maybe," we don't build it.

---

## Signatories

This document represents a commitment, not a suggestion. Violations should be treated as architectural bugs, not feature debates.

---

**End of document**
