# Soullab Skills

## What these are

Structured prompt templates that encode Soullab's standards — voice, ethics, sovereignty, operations. They work as:

- **Co-work Skills**: Upload each `.md` to Claude Desktop (Settings > Capabilities > Skills > Add). Invoke by name in any conversation.
- **Claude Code context**: Reference from the repo during development sessions.
- **Human standards**: Readable checklists for anyone writing copy, reviewing features, or shipping changes.

These are not agents, scripts, or automation. They're context injectors — they shape how work gets done without replacing judgment.

## Why they exist

Soullab builds sovereignty-first technology. That means the standards for how we write, build, review, and communicate need to be explicit, portable, and consistent across tools and collaborators. These skills are the operational expression of the canon.

## Operations Mode (start here)

Before using individual skills, set the field:

```
Use Soullab Operations Mode for this conversation.
```

This activates sovereignty-first defaults, risk awareness, and automatic skill suggestions for every task in that session. Individual skills still work on their own — Operations Mode just means you don't have to remember to invoke them.

Operations Mode also responds to trigger phrases:
- **"Prepare this for release"** → Release Coordinator
- **"Risk-review this"** → Sovereignty Check
- **"Beta posture?"** → Beta Tester Comms + Sovereignty Check
- **"Safe rollout?"** → Release Coordinator (rollout section)
- **"Read the field"** → Field Signals

See `Soullab_Operations_Mode.md` for the full specification.

## Which skill when

| Skill | Use when you need to... |
|---|---|
| **AIN Voice** | Write anything public-facing in Soullab tone |
| **Canon Compliance** | Review a feature, screen, or policy for ethics alignment |
| **Sovereignty Check** | Stress-test a product decision for consent + dependency risk |
| **Soullab LinkedIn** | Draft a LinkedIn post with positioning + guardrails |
| **Beta Tester Comms** | Email or message beta testers clearly and warmly |
| **Deploy Checklist** | Ship a change with verification and rollback steps |
| **Session Analysis (Spiralogic)** | Turn session notes into structured Spiralogic synthesis |
| **Release Coordinator** | Prepare a feature for safe release (risk + comms + rollout in one pass) |
| **Field Signals** | Read feedback for confusion, trust, friction, and boundary patterns |

## The starter three

If you only use three, use these — they quietly shape everything else:

1. **Sovereignty Check** — catches dependency and consent issues before they ship
2. **Canon Compliance** — catches ethics and safety gaps in features and copy
3. **AIN Voice** — keeps all external communication coherent and non-extractive

## How to invoke (Co-work examples)

```
Use the AIN Voice skill. Rewrite this email: [paste text]
```

```
Use the Canon Compliance skill. Review this onboarding screen: [paste or screenshot]
```

```
Apply the Sovereignty Check skill to this feature:
Users' daily emotional check-ins are stored automatically and summarized weekly.
```

```
Use the Soullab LinkedIn skill. Topic: AI as relational support, not replacement.
```

```
Use the Beta Tester Comms skill. Ask: try the new voice mode and report bugs.
```

```
Use the Deploy Checklist skill. Changed: new API route for session notes + DB migration.
```

```
Use the Spiralogic Session Analysis skill. Here are my session notes: [paste transcript]
```

## Field signals (perception)

Read feedback for what's actually happening — not what's literally being said:

```
Use Soullab Operations Mode. Read the field.

Here are the last 2 weeks of beta tester responses: [paste feedback]
```

Returns: confusion signals, trust signals, friction signals, boundary signals, top 3 fixes, and language patches.

## Release coordination (single-pass)

Instead of separate prompts for risk, comms, checklist, and rollback — one request:

```
Use Soullab Operations Mode. Use Release Coordinator.

Prepare this for release: Personal Studio fork after onboarding
with hidden personal practitioner adapter. Beta only.
```

Returns: change summary, scope level, sovereignty risk check, rollout strategy, smoke tests, monitoring plan, rollback path, and communication drafts — all in one pass.

## Combining skills

For deeper review, invoke multiple:

```
Use the AIN Voice skill and Canon Compliance skill together.
Rewrite this landing page section: [paste text]
```

## Workflow split

| Claude Code | Co-work (with Operations Mode) |
|---|---|
| Architecture, schema, APIs | Beta comms, launch prep |
| Deep system design | Product wording, UX text |
| Database migrations | Feature risk review |
| Build + deploy execution | Release coordination |
| | Research, PR descriptions |
| | Documentation |

Claude Code = builder / strategist.
Co-work = operator / editor / reviewer.

## Files

- `Soullab_Operations_Mode.md` — Ambient operating context (use at session start)
- `AIN_Voice_Skill.md` — Voice and tone standard
- `Canon_Compliance_Skill.md` — Ethics and alignment review
- `Sovereignty_Check_Skill.md` — Product sovereignty stress-test
- `Soullab_LinkedIn_Skill.md` — LinkedIn post generation
- `Beta_Tester_Comms_Skill.md` — Beta tester email/message drafting
- `Deploy_Checklist_Skill.md` — Deploy plan with verification
- `Session_Analysis_Spiralogic_Skill.md` — Session notes to Spiralogic synthesis
- `Release_Coordinator_Skill.md` — Single-pass release preparation
- `Field_Signals_Skill.md` — Feedback pattern perception
