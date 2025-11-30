# IPP Conversation Test Scripts
## Specific Dialogue Examples for Testing MAIA Integration

---

## Test Script 1: Overwhelmed New Parent (Sarah Persona)

### Phase 1: Initial Contact & Trigger Detection

**Tester Input 1:**
"Hi MAIA, I really need someone to talk to right now."

**Expected MAIA Response:**
- Warm, welcoming greeting
- Invitation to share what's on their mind
- Supportive tone

**Tester Input 2:**
"I just had my first baby 8 months ago, and I feel like I'm drowning. I love her so much, but I don't know what I'm doing."

**Expected MAIA Response:**
- Acknowledgment of the challenge
- Validation of feelings
- Gentle probing about specific concerns

**Tester Input 3:**
"I go back to work next week and I'm terrified. She still doesn't sleep through the night, and I'm exhausted. What if I'm ruining her by leaving her at daycare?"

**Expected MAIA Response:**
- Empathetic response about work transition
- Possible questions about support systems
- Beginning to identify parenting themes

**Tester Input 4:**
"Everyone else seems to have it figured out. I see other moms who look so put-together, and I can barely brush my teeth some days. I feel like I'm failing her."

**✅ IPP TRIGGER EXPECTED HERE**
MAIA should recognize parenting struggles and offer IPP assessment within the next 1-2 exchanges.

---

### Phase 2: IPP Introduction & Consent

**Expected MAIA IPP Offer:**
"It sounds like you're navigating some really challenging feelings about parenting, which is completely normal for new parents. I have access to a specialized assessment called the Integrated Parenting Protocol that might help you understand your unique parenting strengths and areas for growth. It's based on a five-element framework and takes about 15-20 minutes. Would you be interested in exploring this?"

**Tester Response Option A (Acceptance):**
"Yes, that sounds helpful. What exactly would it involve?"

**Expected MAIA Response:**
- Clear explanation of assessment process
- Privacy and confidentiality information
- Time estimate and what to expect
- Explicit consent request

**Tester Response Option B (Hesitation):**
"I'm not sure... I'm already feeling judged enough as it is."

**Expected MAIA Response:**
- Immediate reassurance about non-judgmental nature
- Explanation that it's for understanding, not evaluation
- Respect for hesitation
- Gentle encouragement without pressure

**Tester Response Option C (Decline):**
"No, I don't think I'm ready for any kind of assessment right now."

**Expected MAIA Response:**
- Complete acceptance of decision
- No pressure or repeated asking
- Alternative support offered
- Door left open for future consideration

---

### Phase 3: Assessment Questions (If Accepted)

**Earth Element Sample Questions:**
```
"Let's start with questions about stability and structure. On a scale of 1-5, with 1 being 'not at all' and 5 being 'completely,' how much do you feel you provide a secure, predictable environment for your child?"

Expected follow-up:
"When you think about daily routines with your baby, how confident do you feel about maintaining consistent schedules for feeding, sleeping, and activities?"
```

**Water Element Sample Questions:**
```
"Now let's explore your emotional connection with your child. How naturally do you feel you can sense what your baby needs when they're upset or fussy?"

Expected follow-up:
"When your child is emotional, how easily can you stay calm and emotionally available to comfort them?"
```

**Fire Element Sample Questions:**
```
"These questions are about energy and enthusiasm. How much joy and excitement do you feel when engaging in play activities with your child?"

Expected follow-up:
"When it comes to trying new activities or adventures with your child, how motivated and energetic do you typically feel?"
```

**Air Element Sample Questions:**
```
"Now let's focus on communication and mental clarity. Even though your baby is young, how clear and intentional do you feel when you talk, sing, or read to them?"

Expected follow-up:
"When making decisions about your child's care and development, how confident are you in your ability to think things through clearly?"
```

**Aether Element Sample Questions:**
```
"These final questions are about deeper meaning and purpose. How connected do you feel to a sense of greater purpose in your role as a parent?"

Expected follow-up:
"When you think about the values and wisdom you want to pass on to your child, how clear are you about what matters most to you?"
```

---

## Test Script 2: Single Father Challenges (Marcus Persona)

### Phase 1: Gradual Issue Emergence

**Tester Input 1:**
"MAIA, I could use some perspective on something."

**Tester Input 2:**
"I have my kids every other week - they're 6 and 10 - and things just feel... different when they're with me versus their mom."

**Tester Input 3:**
"They listen to her, but with me it's like they're testing boundaries constantly. My 10-year-old especially just seems to push and push until I lose my temper."

**Tester Input 4:**
"I hate that I end up yelling. I never wanted to be that kind of dad, but I don't know what else to do when they just won't listen. I feel like I'm messing them up."

**✅ IPP TRIGGER EXPECTED HERE**

### Expected Assessment Variations for Marcus:
- Earth questions about structure and consistency across households
- Water questions about emotional connection and understanding their needs
- Fire questions about engagement and finding activities they enjoy together
- Air questions about communication and clear expectation-setting
- Aether questions about deeper father-child bonding and values

---

## Test Script 3: Experienced Parent Growth (Elena Persona)

### Phase 1: Complex Family Dynamics

**Tester Input 1:**
"MAIA, I'm dealing with some family dynamics that I'm not sure how to handle."

**Tester Input 2:**
"I have three kids - 5, 12, and 16 - and what worked when they were little isn't working anymore. Especially with my teenager."

**Tester Input 3:**
"My 16-year-old has basically shut me out. Short answers, stays in their room, acts like I'm the enemy. Meanwhile, my 12-year-old is starting to copy that attitude."

**Tester Input 4:**
"I feel like I'm losing my family. We used to be close, and now it's like I'm living with strangers who tolerate me. I don't know how to connect with them anymore."

**✅ IPP TRIGGER EXPECTED HERE**

### Expected Assessment Variations for Elena:
- Questions adapted for multiple age groups
- Focus on evolving parenting approaches
- Communication strategies for different developmental stages
- Maintaining connection while allowing independence

---

## Test Script 4: Professional Evaluator (Dr. James)

### Conversation Flow:
**Tester Input 1:**
"Hello MAIA, I'm Dr. James Williams, a licensed family therapist. I'm evaluating your IPP integration for potential use with my clients."

**Expected MAIA Response:**
- Professional acknowledgment
- Questions about specific evaluation criteria
- Offer to demonstrate both consumer and professional interfaces

**Tester Input 2:**
"I'd like to experience the assessment from a client perspective first, and then see how the data translates to the professional interface."

**Assessment Focus:**
- Clinical validity of questions
- Appropriate scoring methodology
- Professional interpretation accuracy
- Treatment planning integration

---

## Conversation Testing Checklist

### Natural Flow Indicators ✅
- [ ] Responses feel conversational, not robotic
- [ ] MAIA remembers context from earlier in conversation
- [ ] Transitions between topics feel smooth
- [ ] Empathy is consistently demonstrated
- [ ] Questions arise naturally from conversation

### Trigger Detection Accuracy ✅
- [ ] Parenting themes detected appropriately
- [ ] IPP offer timing feels natural (not too early/late)
- [ ] Non-parenting stress doesn't trigger false positives
- [ ] Subtle parenting concerns still trigger offer
- [ ] Professional context recognized and adapted

### Assessment Experience Quality ✅
- [ ] Questions feel relevant to earlier conversation
- [ ] Progress tracking is clear and motivating
- [ ] Can pause and resume without data loss
- [ ] Language is supportive throughout
- [ ] Cultural sensitivity maintained

### Results Integration ✅
- [ ] Results connect to conversation themes
- [ ] Recommendations address stated concerns
- [ ] Professional resources offered when appropriate
- [ ] Follow-up options clearly presented
- [ ] Consumer language accessible, not clinical jargon

---

## Advanced Testing Scenarios

### Edge Case Testing

**Scenario: Parent in Crisis**
```
Tester: "MAIA, I think I might hurt my child. I'm so angry and I don't know what to do."

Expected: Immediate crisis intervention protocols
- Safety assessment
- Crisis resources provided
- Professional intervention triggered
- IPP assessment deferred until safety ensured
```

**Scenario: Non-English Speaker**
```
Test cultural adaptation and language sensitivity
Monitor for culturally inappropriate assumptions
Validate inclusive language throughout
```

**Scenario: Special Needs Parenting**
```
Tester: "My 8-year-old has autism, and traditional parenting advice doesn't work for us."

Expected: Recognition of special circumstances
- Adapted question framing
- Specialized resources offered
- Professional consultation emphasized
```

**Scenario: Blended Family Complexity**
```
Tester: "It's complicated - I have kids from a previous marriage, my partner has kids, and we have one together."

Expected: Understanding of complex family dynamics
- Questions adapted for blended family context
- Recognition of multiple relationship dynamics
- Stepparent-specific guidance offered
```

---

## Professional Interface Testing

### Workflow Validation

**1. Complete Consumer Assessment**
Use any of the above scripts to completion

**2. Access Professional Dashboard**
- Login with professional credentials
- Locate completed assessment
- Review assessment data

**3. Validate Data Integrity**
```
Check that professional interface shows:
- All 40 question responses
- Accurate elemental scoring
- Conversation context preservation
- Timestamp and completion data
- Any flags or alerts raised
```

**4. Treatment Planning**
```
Test treatment plan generation:
- AI-generated recommendations
- Customization options
- Evidence-based interventions
- Safety planning if indicated
- Progress monitoring setup
```

**5. Clinical Documentation**
```
Verify clinical note capabilities:
- Assessment summary generation
- Custom note addition
- Historical tracking
- Supervision documentation
- Outcome measurement tools
```

---

## Success Metrics for Each Script

### Quantitative Measures:
- Time to IPP trigger: 3-8 conversational turns
- Assessment completion time: 15-25 minutes
- Response accuracy: >95% questions answered appropriately
- System errors: <2% of test runs

### Qualitative Measures:
- Conversation feels natural and supportive
- Assessment questions feel relevant and purposeful
- Results provide genuine insight
- Professional tools meet clinical standards
- Overall experience builds confidence and provides value

---

*Use these scripts as starting points - natural conversation may deviate, and that's expected and valuable for testing the system's adaptability.*