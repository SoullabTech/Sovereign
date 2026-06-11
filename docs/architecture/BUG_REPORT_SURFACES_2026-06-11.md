# Bug Report Surfaces — Authority Boundary

**Date:** 2026-06-11
**Origin:** PR #430 review (Kelly directive)
**Status:** Adopted — governs all future changes to bug-report surfaces

---

## Three surfaces, one source of truth

Bug reports flow through three surfaces. Each has a distinct role. `bug_reports` is the single source of truth; no surface duplicates authority over it.

```
Member submits → /api/bugs → bug_reports (DB, source of truth)
                                  ↓                    ↓
                          #Bugs channel          /admin/monitor
                         (Co-lab mirror)         (Monitor Field)
                                  ↓
                         /team/admin
                         (Bug Reports tab)
```

---

## Surface roles

### Co-lab Admin — `/team/admin` → Bug Reports tab

**Category: Team-facing operational awareness**

- Visibility into open reports
- Coordination signal (open count badge, severity, reporter)
- Navigation to Monitor for action

**Does not:** update status, assign ownership, add notes, close reports, or perform any state transition.

```
Co-lab Admin
  Awareness
  Visibility
  Coordination
```

### Monitor Field — `/admin/monitor`

**Category: System-facing workflow management**

- Status transitions (new → seen → resolved → wont_fix)
- Ownership and assignment
- Admin notes
- Attachment review (thumbnails, admin-gated)
- Resolution and release tracking

```
Monitor
  Workflow
  State transitions
  Ownership
  Resolution
  Release tracking
```

### #Bugs channel — Co-lab mirror

**Category: Attention surface**

- Real-time notification of new reports
- Discussion thread per report
- Clickable link → Monitor detail

---

## The boundary that must hold

> **Co-lab Admin is read-only with respect to bug_reports.**

Mutations (status, severity, notes, assignment, resolution) belong in Monitor. This is not a UX preference — it is an architectural constraint that prevents two surfaces from diverging on the same record's state.

**Anti-pattern to refuse:** adding a "quick status update" or "mark resolved" action to the Bug Reports tab because it is convenient. Convenience today becomes a second mutation path tomorrow.

**Test for any proposed addition to the Bug Reports tab:**
> Does this change require writing to `bug_reports`? If yes, it belongs in Monitor.

---

## Auth boundary (as of 2026-06-11)

| Surface | Auth |
|---------|------|
| Bug Reports tab | Co-lab admin session (`team_admin` / `admin` role via cookie) |
| Monitor Field | `LABTOOLS_ADMIN_PASSWORD` (separate gate — unification is a future step) |
| #Bugs channel | Visible to any Co-lab member who has channel access |

Auth unification (Monitor adopts Co-lab admin session) is a named future step — it does not change the authority boundary above.

---

*Captured because the failure mode was identified before it occurred: a convenience edit to Co-lab Admin becomes a duplicate Monitor over time. The line is drawn here.*
