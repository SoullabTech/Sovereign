# Youth Pilot Rollout Checklist

## Step 0: Dry Run (adults only)

Before any teen touches the system, verify with adult testers:

### Registration + Onboarding
- [ ] Register with birth date in future (adult) — confirm tier = adult, no youth routing
- [ ] Register with birth date = 14yo — confirm tier = tier2, routes to /onboarding/youth
- [ ] Register with birth date = 16yo — confirm tier = tier3, routes to /onboarding/youth
- [ ] Register with birth date = 11yo — confirm routes to /onboarding/youth-coming-soon
- [ ] Complete TeenOnboarding flow — verify all 5 steps render and persist
- [ ] Skip TeenOnboarding — verify skip is recorded, main onboarding proceeds

### Safety Detection
- [ ] Type crisis language as tier2 user — verify crisis resource card appears in chat
- [ ] Type casual slang ("this killed me lol") — verify NO crisis flag
- [ ] Type burnout language — verify burnout scaffold suggestions appear
- [ ] Type ED language — verify ED-aware context activates
- [ ] Type abuse disclosure — verify conversation blocks + intervention message

### Session Limits
- [ ] As tier2 user, open session selector — verify only 5-25 min options shown
- [ ] As tier3 user, open session selector — verify options up to 50 min
- [ ] As adult user, open session selector — verify full 15-120 min range

### Inner Lands
- [ ] As tier2 user, open Inner Lands — verify Undercroft shows "Not yet" and is locked
- [ ] As tier3 user — verify Undercroft is accessible
- [ ] As adult user — verify all territories accessible

### Incident Logging
- [ ] Trigger a safety flag — verify console logs fire
- [ ] Fill in incident record template — verify it can be completed without any content

---

## Step 1: Guardian Setup (before teen gets passkey)

For each teen tester:

- [ ] Guardian receives consent packet (`GUARDIAN_CONSENT.md`)
- [ ] Guardian signs consent form
- [ ] Teen signs assent form
- [ ] Guardian email + phone recorded in secure roster
- [ ] Guardian passkey format decided (e.g., `SOULLAB-AVERY`)
- [ ] On-call person identified and briefed
- [ ] On-call person has guardian contact template ready

---

## Step 2: Teen Pilot (3-5 teens, 2 weeks)

### Setup
- [ ] Passkeys created and distributed
- [ ] Each teen has confirmed they can access soullab.life
- [ ] Each teen knows: "You can stop anytime, no explanation needed"
- [ ] Post-session form link distributed
- [ ] Feedback channel set up (anonymous form or moderated group)

### Daily (during pilot)
- [ ] Review safety flag logs (even if none fired)
- [ ] Check for pending incidents requiring human review
- [ ] Scan post-session feedback submissions

### Weekly
- [ ] Count safety flags by type (crisis/burnout/ED/abuse)
- [ ] Count false positives
- [ ] Review "felt weird" feedback
- [ ] Calibration decision: any threshold tuning needed?
- [ ] Check: is tone respectful for tier2? For tier3?
- [ ] Check: session boundaries felt caring, not punitive?
- [ ] Check: practice variety sufficient (not "breathe/move forever")?

### End of Pilot (week 2)
- [ ] Collect final feedback
- [ ] Compile incident log summary (metadata only)
- [ ] Decision: proceed to Step 3, calibrate more, or pause

---

## Step 3: Expanded Pilot (10 teens, 4 weeks)

### Additional setup
- [ ] Second on-call backup assigned
- [ ] Weekly calibration review scheduled
- [ ] Guardian FAQ updated based on Step 2 feedback

### Pass criteria for wider release
- [ ] < 10% false positive rate on safety flags
- [ ] Zero unhandled critical incidents
- [ ] > 70% of feedback says "felt respectful"
- [ ] Zero reports of "felt worse" without follow-up
- [ ] Session boundaries feel like container, not cutoff
- [ ] Practice router offers meaningful variety per tier

---

## North Star

"MAIA is a reflective tool that helps you stabilize and choose next steps — and if something serious shows up, humans step in."

This is the sentence that governs every decision above.
