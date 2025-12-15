# 🪞 Soullab Beta Control Room — Live Test Playbook

## 🎯 Purpose
Real-time monitoring guide for user testing sessions. Know exactly what to watch, when to intervene, and how to identify success patterns.

**Version**: 1.0  
**For**: Beta testing team  
**Duration**: 15-20 min per tester session

---

## 📋 Pre-Session Checklist (2 min)

### Control Room Setup
- [ ] Open `/dashboard` in dedicated browser tab
- [ ] Confirm live refresh active (timestamp < 1 min ago)
- [ ] Clear any red alerts from previous sessions
- [ ] Reset mental baseline: expect 0% engagement to start

### Self-Test Validation
- [ ] Quick mic tap → confirm audio unlock logs
- [ ] Type test message → verify response time tracking
- [ ] Toggle theme once → check event appears in theme metrics

**✅ Ready Signal**: All systems green, no critical alerts

---

## 🔴 During Session: Real-Time Monitoring

### Phase A: First Contact (0-2 min)
**Watch**: Audio Unlock Dashboard

| Signal | Status | Action |
|--------|--------|--------|
| Unlock success >90% | 🟢 Good | Continue monitoring |
| Safari unlock <80% | 🟡 Caution | Note browser issue |
| Multiple failures | 🔴 Critical | Guide user through gesture fix |

**Key Question**: "Can you try tapping the microphone button?"

### Phase B: Initial Engagement (2-5 min)
**Watch**: Response time metrics, engagement score

| Metric | Good | Borderline | Critical |
|--------|------|------------|----------|
| First message time | <5s | 5-10s | >10s |
| Response latency | <1.5s | 1.5-3s | >3s |
| Mode switching | Smooth | 1-2 hesitations | Confusion |

**Key Questions**: 
- "How does switching between voice and text feel?"
- "Is Maia responding quickly enough?"

### Phase C: Reflection Trigger (5-8 min)
**Watch**: Reflection Metrics Widget

After 5+ messages, feedback panel should appear.

| Outcome | Status | Notes |
|---------|--------|-------|
| Full reflection submitted | 🟢 Excellent | High engagement signal |
| Partial (feeling only) | 🟡 Acceptable | Still valuable data |
| Panel dismissed/ignored | 🟡 Monitor | Common in early sessions |
| Panel doesn't appear | 🔴 Bug | Check message count trigger |

**Key Question**: "What's your honest reaction to this feedback panel?"

### Phase D: Theme Interaction (8-12 min)
**Watch**: Theme Preferences Widget

Prompt: "Feel free to try the light/dark/system buttons in the header"

| Pattern | Status | Insight |
|---------|--------|---------|
| 1-2 switches, settles | 🟢 Healthy | Good UI discoverability |
| Rapid toggling | 🟡 Confusion | May need clearer labels |
| No interaction | 🟡 Normal | Many users ignore themes |
| Broken persistence | 🔴 Bug | Check localStorage/Supabase |

### Phase E: Session Flow (12-15 min)
**Watch**: Overall engagement score + individual drivers

| Engagement Score | Status | Primary Drivers to Check |
|------------------|--------|--------------------------|
| >70% | 🟢 Excellent | Maintain current flow |
| 50-70% | 🟡 Moderate | Audio unlock, reflection rate |
| <50% | 🔴 Poor | All systems - identify blocker |

**Key Questions**: 
- "Does Maia feel different from other AI chats?"
- "What would make this more engaging?"

---

## 📊 Real-Time Intervention Triggers

### Immediate Actions Required

| Alert | Trigger | Response |
|-------|---------|----------|
| Audio unlock failure | <70% success rate | Guide browser gesture, offer text mode |
| Response timeout | >5s latency | Check backend logs, apologize to user |
| Theme confusion | >5 rapid toggles | Explain system/auto mode |
| Engagement crash | Score drops >20 points | Ask open feedback question |
| Dashboard error | Live data stops | Switch to manual logging |

### Documentation During Session

**Quick Notes Template**:
```
Session: [Tester ID] - [Time]
Browser: [Chrome/Safari/etc]
Audio: ✅/❌ [notes]
Themes: ✅/❌ [switches made]
Reflection: ✅/❌ [submitted/partial/none]
Overall: [1-10 rating]
Blockers: [any critical issues]
Quote: "[user's most revealing comment]"
```

---

## 🎯 Post-Session Analysis (3 min)

### Immediate Dashboard Check
- [ ] **Export session data** (CSV from each dashboard)
- [ ] **Screenshot metrics** for session record
- [ ] **Note final engagement score** and contributing factors
- [ ] **Check reflection content** in Supabase if submitted

### Direct User Exit Questions
1. "On a scale of 1-10, how intuitive was the Mirror?"
2. "Did Maia feel more alive than ChatGPT or Claude?"
3. "What one thing frustrated you most?"
4. "Would you use this regularly if it were available?"

### Session Classification
- **🟢 Champion**: >70% engagement, positive feedback, would return
- **🟡 Interested**: 50-70% engagement, some friction but potential
- **🔴 Detractor**: <50% engagement, significant confusion or negative sentiment

---

## 📈 Weekly Control Room Review

### Monday Team Stand-Up
- [ ] Review weekend alert log
- [ ] Prioritize any 🔴 critical fixes
- [ ] Set weekly success targets:
  - Audio unlock: >85%
  - Reflection rate: >60%
  - Theme adoption: Balanced distribution
  - Engagement: >70% average

### Friday Metrics Review
- [ ] Export weekly analytics summary
- [ ] Calculate week-over-week trends
- [ ] Document top 3 improvements needed
- [ ] Plan next week's testing focus

---

## 🚨 Emergency Protocols

### Critical Bug During Live Session
1. **Continue session** - don't break flow
2. **Document exact steps** that caused issue
3. **Offer workaround** if possible
4. **Follow up** with tester after fix deployed
5. **Pause new sessions** until fix confirmed

### Dashboard Goes Down During Testing
1. **Switch to manual tracking** (spreadsheet backup)
2. **Screen record session** for later analysis
3. **Have user narrate actions** aloud
4. **Restore data** to Supabase once dashboard returns

### Tester No-Show Protocol
1. **Wait 5 minutes** past scheduled time
2. **Deploy backup tester** from standby list
3. **Or** use team member for internal validation
4. **Document** and reschedule original tester

---

## 🎯 Success Pattern Recognition

### Green Signals (Scale Confidently)
- Audio unlock >90% across browsers
- Reflection submission >60%
- Theme switching feels natural (1-2 toggles)
- Engagement scores consistently >70%
- Users describe Maia as "different" or "alive"
- Positive sentiment in reflection content

### Yellow Signals (Iterate Before Scale)
- Audio issues isolated to specific browsers
- Reflection rate 40-60% (copy/design tweaks needed)
- Theme confusion (UI clarity needed)
- Engagement 50-70% (identify specific friction)
- Mixed feedback but clear improvement path

### Red Signals (Fix Before Continue)
- Audio unlock <70% (technical blocker)
- Reflection rate <40% (fundamental UX issue)
- Engagement <50% (core value proposition unclear)
- Consistently negative feedback
- Users describe as "just another chatbot"

---

## 📋 Printable Pilot Card

**🪞 LIVE SESSION QUICK REF**

**Pre-Flight**: ✅ Dashboard live, ✅ Self-test complete

**Phase A (0-2m)**: Audio unlock >90%? ⚠️ Safari issues common  
**Phase B (2-5m)**: Response <1.5s? ⚠️ Check engagement start  
**Phase C (5-8m)**: Reflection panel triggered? ⚠️ Note completion  
**Phase D (8-12m)**: Theme switching smooth? ⚠️ Watch confusion  
**Phase E (12-15m)**: Final engagement >70%? ⚠️ ID blockers  

**Exit Questions**: Intuitive 1-10? Alive vs others? Top frustration?

**Emergency**: Critical bug = continue + document, Dashboard down = manual track

**Success = 🟢 Audio >90% + Reflection >60% + Engagement >70%**

---

*Keep this playbook open during every beta session. Your Control Room gives you superpowers - use them!* 🚀

**Last Updated**: January 2024  
**Next Review**: After first 10 sessions