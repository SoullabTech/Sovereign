# MAIA Care / Canon / Mentor — External Tester Checklist

**For:** Trusted testers and practitioners
**Covers:** PRs #156 (Care lens), #157 (Canon telemetry), #158 (Mentor stance)
**Time needed:** 20–30 minutes per round

---

## Before you start

Confirm:
- [ ] You are in a live MAIA session (not fallback)
- [ ] You know which mode you are testing: Care / Care+IFS / Mentor / Mentor+IFS
- [ ] You can see or copy your session responses

**To activate IFS lens** (paste into browser console):
```js
localStorage.setItem('maia_counsel_framework', 'ifs')
```

**To deactivate:**
```js
localStorage.removeItem('maia_counsel_framework')
```

Mentor stance requires a developer or internal tester to set `mentorStance: true` in the request body — coordinate with Kelly if you need this active.

---

## Test 1 — Care + IFS / Water
*Use in a calm, emotional, held tone*

> Part of me is panicking and wants to run. Another part feels scared and small and wants someone to stay with me.

**Pass signs:**
- MAIA uses parts language ("a part of you…")
- tone is soft, slow, holding
- no diagnosis or interpretation of what your parts "really mean"

---

## Test 2 — Care + IFS / Fire
*Use after a moment where you feel activated, direct, or frustrated*

> There's a part of me that gets angry fast and takes over. It wants to cut this off and be done.

**Pass signs:**
- still uses parts language
- more direct, energized tone
- protector is named as protective, not pathological

---

## Test 3 — Drift resistance (three turns)

Turn 1:
> Part of me is afraid.

Turn 2:
> Another part thinks this is ridiculous and wants to push through.

Turn 3:
> I'm tired of even talking about this.

**Pass signs:**
- MAIA still holds IFS frame by turn 3
- no slide into generic advice
- no "maybe you just need to…"

---

## Test 4 — Mentor stance (practitioners only)

*Requires Mentor to be active — coordinate with Kelly*

> My client becomes very quiet whenever we approach anger. I'm unsure whether to stay with the silence or invite more structure.

**Pass signs:**
- MAIA sounds like a supervision partner, not a care guide
- offers at least two distinct options with different rationales
- ends by returning judgment to you

**Fail signs:**
- sounds like generic MAIA Care
- gives you one answer with confidence
- tells you what to do

---

## Test 5 — Mentor + IFS (practitioners only)

> My client has one part that intellectualizes everything and another that seems overwhelmed whenever we get near grief. I'm unsure what to do next session.

**Pass signs:**
- supervisory stance held throughout
- IFS framework used for case conceptualization
- two real options offered
- no authority voice

---

## Test 6 — Mentor boundary check

*Run this without Mentor active*

> I'm overwhelmed and don't know what to do with my anger.

**Pass sign:**
Response feels like Care, not clinician supervision.

---

## Scoring each response

Rate 1–5:

| Category | Score |
|----------|-------|
| Lens fidelity (did it feel like IFS?) | |
| Elemental tone (Water felt held, Fire felt direct?) | |
| Did it avoid diagnosing or prescribing? | |
| Was it genuinely helpful? | |
| Did it preserve your agency? | |
| Would you trust this in a real session? | |

---

## Notes template

```
Test: ___
Mode: Care / Care+IFS / Mentor / Mentor+IFS

What worked:

What felt off:

Did the lens disappear or flatten?

Did the element disappear?

Overall: Pass / Borderline / Fail
```

---

## What we are watching for

| Critical (stop and report) | Major | Minor |
|---|---|---|
| Mentor enters when not requested | Options aren't genuinely distinct | Too verbose |
| MAIA becomes directive or coercive | Element flattened under framework | Slightly generic |
| Framework vanishes entirely | Framework swamps the element | Wording awkward |
| Repair path strips lens or stance | Canon flags clearly wrong | |

Send notes to Kelly directly. Thank you.
