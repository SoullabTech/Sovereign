# Practitioner OS: MVP Module List & Build Checklist

## Purpose

This document defines the **minimum viable modules** for Practitioner OS and provides a **phase-by-phase build checklist** to prevent drift, overbuilding, and scope creep.

Each phase has clear exit criteria. Do not proceed to the next phase until the current phase is complete and validated.

---

## Guiding Principles

1. **Build the smallest thing that works**
2. **Validate with real practitioners before expanding**
3. **Resist "while we're at it" additions**
4. **Each module must justify its existence independently**
5. **If in doubt, don't build it yet**

---

## MVP Module List

### Required for Phase 2 (Skeleton)

| Module | Purpose | Complexity |
|--------|---------|------------|
| **Practice Container** | Define who you are and what you do | Low |
| **Client Container** | Hold client relationships | Medium |
| **Session Logs** | Record sessions (minimal) | Low |
| **Minimal Scheduling** | Availability + booking | Medium |

### Deferred to Phase 4 (Post-Validation)

| Module | Purpose | Why Deferred |
|--------|---------|--------------|
| **Billing & Payments** | Invoices, payments | Adds complexity; validate core first |
| **Intake & Agreements** | Forms, consent | Templates can be external initially |
| **Programs & Cohorts** | Group containers | Not all practitioners need this |
| **Compliance Modes** | HIPAA, coaching variants | Role-specific; add after patterns emerge |

---

## Phase 1: Foundation (Current)

### Objective
Establish architectural clarity before writing code.

### Checklist

- [x] Practitioner OS Overview document
- [x] Data Boundaries and Ownership Model
- [x] Anti-Features document
- [ ] Database schema design (tables, relationships)
- [ ] API contract definitions (endpoints, payloads)
- [ ] Authentication/authorization model
- [ ] Repository structure decision

### Exit Criteria

- [ ] All foundation docs reviewed and approved
- [ ] Schema design reviewed (no implementation yet)
- [ ] Clear answer to: "Where does Practitioner OS code live?"

### Decisions Required

| Decision | Options | Status |
|----------|---------|--------|
| Repository location | Same repo / Separate repo | Pending |
| Database | Same Postgres / Separate schema | Pending |
| Auth model | Extend MAIA auth / Separate auth | Pending |

---

## Phase 2: Skeleton Build

### Objective
Build the minimal structural bones—enough to hold a practice and clients.

### Module 2.1: Practice Container

The practitioner's "home" that defines their work.

**Data model:**
```
practices
├── id (UUID)
├── owner_id (→ members)
├── name
├── roles[] (therapist, coach, guide, etc.)
├── modalities[] (self-declared)
├── scope_included (text)
├── scope_excluded (text)
├── ethical_statement (text)
├── capacity_max_weekly (int)
├── referral_network (jsonb)
├── status (active, paused, closed)
├── created_at
└── updated_at
```

**Checklist:**
- [ ] Create `practices` table migration
- [ ] Create Practice CRUD API (`/api/practice`)
- [ ] Create Practice setup flow (UI)
- [ ] Create Practice profile view (public-facing)
- [ ] Create Practice dashboard (practitioner view)

**Exit criteria:**
- [ ] Practitioner can create and edit their practice profile
- [ ] Practice profile can be viewed (public or private)
- [ ] Scope and boundaries are clearly displayed

---

### Module 2.2: Client Container

Relational commitments, not CRM leads.

**Data model:**
```
clients
├── id (UUID)
├── practice_id (→ practices)
├── name
├── email
├── phone (optional)
├── status (inquiry, active, paused, completed, referred)
├── started_at
├── ended_at
├── boundaries (text)
├── special_considerations (text)
├── referral_source
├── created_at
└── updated_at

client_agreements
├── id (UUID)
├── client_id (→ clients)
├── agreement_type (informed_consent, boundaries, etc.)
├── content (text)
├── signed_at
├── expires_at
└── created_at
```

**Checklist:**
- [ ] Create `clients` table migration
- [ ] Create `client_agreements` table migration
- [ ] Create Client CRUD API (`/api/practice/clients`)
- [ ] Create Client list view
- [ ] Create Client detail view
- [ ] Create Client status workflow (inquiry → active → completed)
- [ ] Create Agreement attachment flow

**Exit criteria:**
- [ ] Practitioner can add and manage clients
- [ ] Client status transitions work correctly
- [ ] Agreements can be attached to clients

---

### Module 2.3: Session Logs

Minimal session recording for continuity.

**Data model:**
```
sessions
├── id (UUID)
├── client_id (→ clients)
├── practice_id (→ practices)
├── session_type (individual, group, consultation)
├── scheduled_at
├── started_at
├── ended_at
├── duration_minutes
├── status (scheduled, completed, cancelled, no_show)
├── practitioner_notes (text, private)
├── shared_notes (text, client-visible if consented)
├── follow_up (text)
├── created_at
└── updated_at
```

**Checklist:**
- [ ] Create `sessions` table migration
- [ ] Create Session CRUD API (`/api/practice/sessions`)
- [ ] Create Session logging UI (quick entry)
- [ ] Create Session history view (per client)
- [ ] Create Session notes editor (markdown)

**Exit criteria:**
- [ ] Practitioner can log sessions
- [ ] Session history is viewable per client
- [ ] Notes are private by default

---

### Module 2.4: Minimal Scheduling

Capacity management, not optimization.

**Data model:**
```
availability_windows
├── id (UUID)
├── practice_id (→ practices)
├── day_of_week (0-6)
├── start_time
├── end_time
├── session_types[] (what can be booked)
├── active (boolean)
└── created_at

bookings
├── id (UUID)
├── practice_id (→ practices)
├── client_id (→ clients, nullable for new inquiries)
├── session_type
├── scheduled_at
├── duration_minutes
├── status (pending, confirmed, cancelled)
├── client_name (for non-client bookings)
├── client_email
├── notes
├── created_at
└── updated_at
```

**Checklist:**
- [ ] Create `availability_windows` table migration
- [ ] Create `bookings` table migration
- [ ] Create Availability setup UI
- [ ] Create Booking creation flow
- [ ] Create Calendar view (practitioner)
- [ ] Create Booking confirmation flow
- [ ] Implement capacity limits (max per day/week)

**Exit criteria:**
- [ ] Practitioner can set availability
- [ ] Bookings can be created and confirmed
- [ ] Capacity limits are enforced

---

### Phase 2 Complete Criteria

- [ ] All four modules functional
- [ ] End-to-end flow works: Create practice → Add client → Log session → Book next session
- [ ] No billing, no payments, no fancy features
- [ ] Ready for quiet beta

---

## Phase 3: Quiet Beta

### Objective
Validate with real practitioners before expanding.

### Checklist

- [ ] Identify 3-5 trusted practitioners
- [ ] Onboard with hands-on support
- [ ] Collect feedback (structured interviews, not just bug reports)
- [ ] Document patterns of use and misuse
- [ ] Identify missing essentials vs. nice-to-haves

### Key Questions

1. What's missing that blocks real use?
2. What's confusing or friction-heavy?
3. What did they try to do that the system didn't support?
4. What did they try to do that the system *shouldn't* support?

### Exit Criteria

- [ ] At least 3 practitioners using for real work
- [ ] Core workflows validated
- [ ] Blocker issues resolved
- [ ] Clear prioritization for Phase 4

---

## Phase 4: Expansion (Post-Validation)

### Only after Phase 3 proves the skeleton works.

### Module 4.1: Billing & Payments

- [ ] Invoice generation
- [ ] Payment tracking
- [ ] Package/bundle support
- [ ] Sliding scale support
- [ ] Stripe integration (or equivalent)

### Module 4.2: Intake & Agreements

- [ ] Intake form builder
- [ ] Agreement templates
- [ ] Digital signature flow
- [ ] Consent tracking

### Module 4.3: Programs & Cohorts

- [ ] Program/course container
- [ ] Cohort enrollment
- [ ] Group session support
- [ ] Shared resource library

### Module 4.4: Compliance Modes

- [ ] Clinical mode (HIPAA patterns)
- [ ] Coaching mode (scope emphasis)
- [ ] Facilitation mode (group focus)
- [ ] Role-based defaults

---

## What We Are NOT Building (Phase 4 Anti-Scope)

Even in expansion, these remain excluded:

- Marketplace / directory features
- Rating / review systems
- Conversion analytics
- Marketing automation
- "Growth" dashboards
- AI-generated clinical content
- Automated matching

See [[ANTI_FEATURES]] for the full list.

---

## Progress Tracking

### Phase 1: Foundation
| Item | Status | Notes |
|------|--------|-------|
| Practitioner OS Overview | ✅ Done | |
| Data Boundaries doc | ✅ Done | |
| Anti-Features doc | ✅ Done | |
| Database schema design | ⬜ Pending | |
| API contracts | ⬜ Pending | |
| Auth model decision | ⬜ Pending | |
| Repo structure decision | ⬜ Pending | |

### Phase 2: Skeleton Build
| Module | Status | Notes |
|--------|--------|-------|
| Practice Container | ⬜ Pending | |
| Client Container | ⬜ Pending | |
| Session Logs | ⬜ Pending | |
| Minimal Scheduling | ⬜ Pending | |

### Phase 3: Quiet Beta
| Item | Status | Notes |
|------|--------|-------|
| Practitioner recruitment | ⬜ Pending | |
| Onboarding | ⬜ Pending | |
| Feedback collection | ⬜ Pending | |
| Iteration | ⬜ Pending | |

### Phase 4: Expansion
| Module | Status | Notes |
|--------|--------|-------|
| Billing & Payments | ⬜ Pending | |
| Intake & Agreements | ⬜ Pending | |
| Programs & Cohorts | ⬜ Pending | |
| Compliance Modes | ⬜ Pending | |

---

## Review Cadence

- **Weekly:** Check progress against current phase checklist
- **Phase transition:** Full review before proceeding
- **Quarterly:** Revisit anti-features and scope boundaries

---

**End of document**
