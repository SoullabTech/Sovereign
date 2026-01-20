# Data Boundaries and Ownership Model

## The Three Domains

MAIA ecosystem consists of three distinct systems with clear data boundaries:

| Domain | Question It Answers | Owner |
|--------|---------------------|-------|
| **MAIA Core** | "Who am I, and how do I stay coherent?" | The member |
| **Practitioner OS** | "How do I support others with clarity and care?" | The practitioner |
| **Worldcraft** | "How do we house unusual work without distortion?" | The practitioner (bespoke) |

These are not tiers of the same product. They are **separate systems** that can interoperate when both parties consent.

---

## Domain 1: MAIA Core (Personal Sovereignty)

### What Lives Here

Everything related to the **member's inner world and personal development**.

| Data Type | Examples | Storage |
|-----------|----------|---------|
| **Identity** | Profile, passkey, preferences, tier | `members` table |
| **Journals** | Reflections, dreams, voice notes | `journal_entries` |
| **Symbolic Work** | Tarot pulls, I Ching readings, birth chart | `oracle_readings`, `astro_charts` |
| **Inner Patterns** | MAIA's memory of themes, growth edges | `member_patterns` |
| **Personal Practices** | Saved micro-practices, rituals | `member_practices` |
| **Learning** | Progress through content, bookmarks | `learning_progress` |
| **Contributions** | Offerings to the Commons | `commons_contributions` |

### Ownership Rules

1. **Member owns all personal data**
   - Can export at any time
   - Can delete (right to erasure)
   - Can enter Sanctuary Mode (no retention)

2. **MAIA processes but does not extract**
   - Pattern recognition serves the member
   - No behavioral data sold or shared
   - No training on member data without explicit consent

3. **Local-first when possible**
   - Free tier: local storage, no cloud sync
   - Personal/Pro tier: sovereign cloud sync (member-controlled)

### What Never Leaves MAIA Core

- Journal content (unless member explicitly shares)
- Dream material
- Oracle reading history
- Personal symbolic patterns
- Sanctuary session content (ever)

---

## Domain 2: Practitioner OS (Relational Responsibility)

### What Lives Here

Everything related to the **practitioner's business operations and client relationships**.

| Data Type | Examples | Storage |
|-----------|----------|---------|
| **Practice Profile** | Role, modalities, scope, ethics | `practices` |
| **Client Containers** | Identity, status, agreements | `clients` |
| **Sessions** | Date, type, duration, notes | `sessions` |
| **Agreements** | Consent forms, boundaries, disclaimers | `agreements` |
| **Scheduling** | Availability, bookings, capacity | `schedules`, `bookings` |
| **Billing** | Invoices, payments, packages | `invoices`, `payments` |
| **Programs** | Cohorts, group enrollments | `programs`, `enrollments` |

### Ownership Rules

1. **Practitioner owns business data**
   - Practice profile, templates, and operational data
   - Can export and migrate
   - Survives platform changes

2. **Client data is held in trust**
   - Practitioner is custodian, not owner
   - Client retains rights to their information
   - Consent governs all sharing
   - Clean deletion on relationship end (configurable)

3. **Notes are for care, not surveillance**
   - Session notes are practitioner's clinical/professional record
   - Not analyzed, mined, or used for metrics
   - Client can request access (per applicable law/ethics)

### What Never Leaves Practitioner OS

- Client contact information (without explicit consent)
- Session notes (unless legally required)
- Clinical assessments
- Payment/financial details

---

## Domain 3: Worldcraft (Bespoke Containers)

### What Lives Here

**Custom deployments** for practices that need unique infrastructure.

| Data Type | Examples | Storage |
|-----------|----------|---------|
| **Portal Configuration** | Branding, navigation, custom pages | `portals` |
| **Custom Templates** | Intake forms, agreement variants | `portal_templates` |
| **Specialized Workflows** | Unique session types, ritual structures | `portal_workflows` |
| **Community Spaces** | Private circles, cohort forums | `portal_communities` |

### Ownership Rules

1. **Practitioner owns portal configuration**
   - Theirs to modify, export, or shut down
   - Platform provides infrastructure, not content

2. **Worldcraft is exception handling**
   - Only exists when standard Practitioner OS doesn't fit
   - Should be rare, not the default path

3. **Data still follows domain rules**
   - Client data in Worldcraft follows Practitioner OS rules
   - Personal data follows MAIA Core rules
   - Worldcraft doesn't create new ownership categories

---

## Boundary Touch Points

These are the **only places** where data can cross domain boundaries.

### Touch Point 1: Member ↔ Practitioner (Explicit Consent)

A MAIA member may choose to work with a practitioner. This creates a **consent bridge**.

**What can cross (with consent):**
- Member's name and contact info → Practitioner's client container
- Practitioner's practice profile → Member's view
- Agreed-upon session summaries → Both parties

**What never crosses:**
- Member's journal content
- Member's oracle/astro history
- Member's pattern data
- Practitioner's notes about other clients

**Consent model:**
```
Member explicitly opts in → Bridge created
Either party can revoke → Bridge closed
No implicit data sharing ever
```

### Touch Point 2: Practitioner → Commons (Contribution)

A practitioner may contribute to the Commons (shared resources).

**What can cross:**
- Practices, prompts, agreements (anonymized or attributed by choice)
- Educational content
- Templates and frameworks

**What never crosses:**
- Client information (even anonymized without rigorous review)
- Session content
- Business operational data

### Touch Point 3: Member → Commons (Contribution)

A member may contribute personal insights to the Commons.

**What can cross:**
- Practices that helped them
- Reflection prompts
- Story-of-practice (first-person experience, not advice)

**What never crosses:**
- Journal entries (unless explicitly rewritten for public)
- Oracle readings
- Personal pattern data

### Touch Point 4: Worldcraft ↔ Core Systems

Worldcraft portals may integrate with MAIA Core or Practitioner OS.

**Integration rules:**
- Must use standard APIs (no direct database access)
- Must respect consent boundaries
- Must not create "super-user" access patterns
- Custom ≠ privileged

---

## Data Lifecycle

### Creation
- Data is created in the domain where it belongs
- No cross-domain data creation (e.g., practitioner can't create member journal entries)

### Storage
- Each domain has its own tables/schemas
- No shared tables across domains (except lookup/reference)
- Encryption at rest for all sensitive data

### Access
- Access requires authentication within domain
- Cross-domain access requires explicit consent + API
- No "god mode" that bypasses boundaries

### Modification
- Owner can modify their data
- Custodians (practitioners) can modify client operational data
- Neither party can modify the other's private data

### Deletion
- Member can delete all MAIA Core data
- Practitioner can delete practice data
- Client data deletion follows legal/ethical retention requirements
- Sanctuary content is never stored, so never needs deletion

---

## Consent Architecture

### Levels of Consent

| Level | Meaning | Example |
|-------|---------|---------|
| **None** | No data sharing | Default state |
| **View** | Can see, not copy | Practitioner views member's public profile |
| **Share** | Explicit copy across boundary | Member shares contact with practitioner |
| **Collaborate** | Ongoing bidirectional access | Active therapeutic relationship |
| **Revoke** | Consent withdrawn, access ends | Relationship concludes |

### Consent Records

Every cross-boundary data access must have:
- Who consented
- What was consented to
- When consent was given
- How to revoke
- Audit trail

---

## Anti-Patterns (What We Prevent)

### 1. Scope Creep
**Wrong:** Building client management features in MAIA Core
**Right:** Client containers live in Practitioner OS only

### 2. Implicit Sharing
**Wrong:** Auto-sharing member data with "recommended practitioners"
**Right:** All sharing requires explicit opt-in

### 3. Data Mining
**Wrong:** Analyzing journal patterns to "match" members with services
**Right:** Pattern analysis serves the member, not the platform

### 4. Custody Confusion
**Wrong:** Platform claiming ownership of practitioner's client notes
**Right:** Practitioner is custodian; platform is infrastructure

### 5. Worldcraft Sprawl
**Wrong:** Every practitioner gets a custom portal
**Right:** Worldcraft is rare; Practitioner OS serves most needs

---

## Implementation Boundaries

### MAIA-SOVEREIGN Repository Contains

- MAIA Core (all tiers)
- Commons contribution system
- Member-side of consent bridges

### MAIA-SOVEREIGN Does NOT Contain

- Practitioner OS operational features
- Client management
- Scheduling/billing infrastructure
- Worldcraft portal provisioning

### Future Repositories

| System | Repository | Status |
|--------|------------|--------|
| Practitioner OS | `practitioner-os` or similar | Not yet created |
| Worldcraft | `worldcraft` or similar | Not yet created |

---

## Summary Table

| Data | Domain | Owner | Can Share With | Consent Required |
|------|--------|-------|----------------|------------------|
| Member identity | MAIA Core | Member | Practitioner | Yes |
| Journals | MAIA Core | Member | No one | N/A |
| Oracle readings | MAIA Core | Member | No one | N/A |
| Sanctuary content | MAIA Core | Member | No one | N/A (never stored) |
| Commons contributions | MAIA Core | Member | Public | Submission = consent |
| Practice profile | Practitioner OS | Practitioner | Public/Members | Publication = consent |
| Client containers | Practitioner OS | Practitioner (custodian) | Client | Relationship = consent |
| Session notes | Practitioner OS | Practitioner | Client (if requested) | Per ethics/law |
| Portal config | Worldcraft | Practitioner | Public | Publication = consent |

---

## Guiding Principle

> **When in doubt, data stays in its domain.**
>
> Cross-boundary movement requires explicit consent, clear purpose, and audit trail. The default is separation, not integration.

---

**End of document**
