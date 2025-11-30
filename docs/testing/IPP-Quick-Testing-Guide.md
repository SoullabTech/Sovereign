# IPP Testing Quick Reference Guide
## MAIA Conversational Assessment Testing

### 🚀 Quick Start (15 minutes)

**1. Basic Setup**
- Open browser to `http://localhost:3000`
- Clear cache/cookies
- Open developer console (F12)

**2. Start Conversation**
```
"Hi MAIA, I've been struggling with parenting lately."
```

**3. Trigger IPP Offer**
Continue conversation until MAIA offers IPP assessment (usually 3-5 exchanges)

**4. Complete Assessment**
- Accept assessment offer
- Answer 40 questions honestly
- Note timing (should be 15-25 minutes)

**5. Review Results**
- Check elemental scores make sense
- Verify recommendations are relevant
- Test professional handoff if available

---

### 📝 Test Personas (Pick One)

**Sarah - New Mom**: *"I'm exhausted and don't know if I'm doing anything right with my 8-month-old"*

**Marcus - Single Dad**: *"My kids behave differently with me than their mom, and I'm struggling with discipline"*

**Elena - Teen Parent**: *"My teenager won't talk to me anymore and our family feels disconnected"*

---

### ✅ Success Checklist

**Conversational Flow**:
- [ ] MAIA detects parenting themes naturally
- [ ] IPP offer feels organic, not forced
- [ ] Questions are clear and non-judgmental
- [ ] Progress tracking works
- [ ] Can pause/resume assessment

**Assessment Quality**:
- [ ] 40 questions completed
- [ ] All 5 elements covered (Earth, Water, Fire, Air, Aether)
- [ ] Results feel accurate to responses
- [ ] Recommendations are actionable
- [ ] Professional resources offered when appropriate

**Technical Performance**:
- [ ] No errors in browser console
- [ ] Response times under 3 seconds
- [ ] Assessment completes without issues
- [ ] Data saves properly
- [ ] Professional interface accessible

---

### 🔧 Common Test Scenarios

**Trigger Testing**:
```
High Confidence: "I'm failing as a parent"
Medium Confidence: "My child is acting out"
Subtle: "Things are stressful at home"
```

**Response Pattern Testing**:
- **Consistent**: Answer similarly across element groups
- **Mixed**: Distribute responses across all elements
- **Extreme**: Use only 1s and 5s on scales

**Error Testing**:
- Incomplete responses
- Rapid clicking
- Browser refresh mid-assessment
- Invalid data entry

---

### 🚨 Report Issues Immediately

**Critical (Stop Testing)**:
- System crashes or becomes unresponsive
- Data loss or corruption
- Sensitive information exposed
- Security vulnerabilities found

**High Priority**:
- Assessment cannot complete
- Scores calculate incorrectly
- Professional interface broken
- Major UX problems

---

### 📞 Quick Contacts

**Technical Issues**: tech-support@maiasovereign.com
**Clinical Questions**: clinical@maiasovereign.com
**Testing Coordination**: testing@maiasovereign.com

---

### 🎯 What We're Looking For

1. **Natural Conversation**: Does it feel like talking to a knowledgeable, empathetic guide?
2. **Accurate Assessment**: Do results reflect your responses appropriately?
3. **Practical Value**: Are insights and recommendations useful?
4. **Professional Quality**: Would you trust this for real clinical use?
5. **User Experience**: Is it easy, engaging, and supportive?

---

*For detailed procedures, see the complete IPP Testing Protocol Manual*