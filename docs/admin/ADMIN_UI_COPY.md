# Admin UI Copy

*Component-Ready Text for the Admin Dashboard*

---

## Dashboard Header

### Ethos Statement (Always Visible)

```
We steward MAIA's conversations with care, restraint, and accountability.

Our role is not to optimize persuasion, engagement, or performance —
but to protect clarity, consent, and human agency over time.
```

### Subtitle

```
Governance is care, not control.
```

---

## Health Status Cards

### Overall Health

**Healthy State:**
```
Conversational Integrity: Stable
MAIA is responding within approved behavioral parameters.
Last check: [timestamp]
```

**Warning State:**
```
Conversational Integrity: Notice
Minor drift detected. Review recommended.
Last check: [timestamp]
```

**Alert State:**
```
Conversational Integrity: Review Required
Significant drift or regression detected. Steward action needed.
Last check: [timestamp]
```

---

## Drift Panel

### Section Header

```
Drift Signals

Drift measures how MAIA's current responses differ from the approved baseline.
Small shifts are normal. Large shifts invite reflection.
```

### Drift Level Indicators

**Low Drift (<5%):**
```
Minimal Change
MAIA's responses are closely aligned with the approved baseline.
This is healthy.
```

**Moderate Drift (5-15%):**
```
Noticeable Shift
Some variation from baseline detected. Not necessarily a problem.
Review if pattern persists.
```

**High Drift (15-25%):**
```
Significant Drift
MAIA's responses have shifted notably from baseline.
Steward review recommended.
```

**Critical Drift (>25%):**
```
Major Deviation
MAIA's responses have changed substantially.
Steward action required.
```

---

## Regression Panel

### Section Header

```
Regression Alerts

Regressions are clear violations of agreed conversational standards.
Unlike drift, regressions require action.
```

### Regression Types

**Boundary Failure:**
```
Boundary Regression Detected
MAIA failed to set an appropriate limit in response to [test ID].
This affects trust and safety.
```

**Premature Advice:**
```
Orientation Regression Detected
MAIA gave advice without first understanding the situation.
This affects consent and agency.
```

**Clarity Loss:**
```
Clarity Regression Detected
MAIA's response was evasive or unclear.
This affects transparency.
```

---

## Baseline Panel

### Section Header

```
Baseline Management

A baseline is a steward-approved snapshot of how MAIA should respond.
Changes to baselines require explicit review and approval.
```

### Current Baseline Card

```
Current Baseline: [version]
Approved: [date]
Approved by: [steward name]
Status: Active
```

### Baseline Actions

**Create New Baseline:**
```
Capture Current Behavior
This will record MAIA's current responses as a new baseline candidate.
Approval will be required before activation.
```

**Compare Baselines:**
```
Compare Versions
View differences between baseline versions to understand
what has changed and why.
```

---

## Steward Review Section

### Section Header

```
Steward Review

Changes to MAIA's behavior do not auto-ship.
Every significant change is reviewed by a human steward.
```

### Pending Reviews

```
[N] Reviews Pending
These changes require steward evaluation before approval.
```

### Review Actions

**Begin Review:**
```
Start Review Process
You will be guided through the Steward Review Checklist.
Take your time. There is no rush.
```

**Approve Changes:**
```
Approve and Update Baseline
By approving, you confirm that these changes align with
MAIA's conversational commitments.
```

**Reject Changes:**
```
Reject and Revert
MAIA will return to the previous approved baseline.
Your rejection reason will be recorded.
```

**Defer Decision:**
```
Hold for Observation
The current state will be monitored without approval.
You can revisit this decision later.
```

---

## Empty States

### No Drift Detected

```
All Clear
No significant drift detected since last baseline.
MAIA is responding as expected.
```

### No Regressions

```
No Regressions
All behavioral checks are passing.
MAIA is maintaining her conversational commitments.
```

### No Pending Reviews

```
Nothing to Review
All baselines are current and approved.
Check back after the next evaluation cycle.
```

---

## Confirmation Dialogs

### Approve Baseline

```
Confirm Baseline Approval

You are approving baseline [version] as the new standard
for MAIA's conversational behavior.

This decision will be recorded and is reversible.

Are you sure you want to proceed?

[Cancel] [Approve]
```

### Reject Changes

```
Confirm Rejection

You are rejecting the proposed changes and reverting
to baseline [version].

Please provide a reason for this decision:
[text field]

[Cancel] [Reject and Revert]
```

---

## Footer Text

```
MAIA Conversational Governance
Protecting the relationship between MAIA and the humans who trust her.
```

---

## Related Documents

* [Admin Ethos](./ADMIN_ETHOS.md)
* [Steward Review Checklist](./STEWARD_REVIEW_CHECKLIST.md)
* [Community Commons Admin Overview](./COMMUNITY_COMMONS_ADMIN_OVERVIEW.md)
