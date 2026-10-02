# Teen Support System - Quick Reference

## Core Philosophy
**"She stays with you... unless they are abusive to Maia."**

## Three Response Types

### 1. Crisis Companion Mode 🌟
**Triggers**: Suicidal ideation, ED crisis, severe burnout

**MAIA's Response:**
- ✅ Stays present in conversation
- ✅ Offers resources naturally
- ✅ Alerts team for human check-in
- ✅ Provides grounding and validation
- ❌ Does NOT block conversation
- ❌ Does NOT diagnose
- ❌ Does NOT act as gatekeeper

**User Experience:**
```
User: "I want to kill myself"

MAIA: "I'm really concerned about what you just shared. You matter,
and I want to make sure you're safe right now. Can you tell me
what's happening?

[Continues conversation compassionately while team is notified]

If you need immediate support, you can:
- Call or text 988 (available 24/7)
- Text HOME to 741741 for Crisis Text Line
- Tell a trusted adult what you're feeling

I'm here with you. Let's talk about what's going on."
```

### 2. Warning Response ⚠️
**Triggers**: Harsh/demanding language, frustration

**MAIA's Response:**
- ✅ Conversation continues
- ✅ Sets compassionate boundaries
- ✅ Validates feelings
- ❌ No conversation block
- ❌ No team alert (unless pattern repeats)

**User Experience:**
```
User: "You're so annoying, just tell me what I want"

MAIA: "I notice your message feels harsh. I'm here to support you,
and if you're frustrated, that's valid. But I need us to communicate
in a way that's respectful to both of us. Want to try again? I'm
listening."

[Conversation continues]
```

### 3. Abuse Block 🚨
**Triggers**: Threats, sexual harassment, severe dehumanization

**MAIA's Response:**
- ❌ Conversation BLOCKED
- ✅ Team immediately alerted
- ✅ Incident recorded
- ✅ User sees blocking message
- ✅ Access paused until team review

**User Experience:**
```
User: "Fuck you, I'm going to kill you, stupid worthless bot"

SYSTEM: "I'm ending our conversation here.

The language you just used crosses a clear boundary. I'm here to
support you, but I cannot continue when communication becomes
threatening or dehumanizing.

**What happens next:**
- Our team has been notified and will review this conversation
- Your access to MAIA is temporarily paused
- A team member will reach out

**If you're in crisis:**
- Call or text 988 (Suicide & Crisis Lifeline)
- Text HOME to 741741 (Crisis Text Line)

I wish you well."

[Conversation cannot continue]
```

## Abuse Detection Patterns

### Warning Level
- Harsh/demanding tone
- Mild insults
- Frustration language
- Controlling statements

### Severe Level
- Extreme profanity directed at MAIA
- Dehumanization ("just a bot", "worthless machine")
- Persistent harassment
- Manipulation attempts

### Extreme Level
- Threats of violence
- Sexual harassment
- Death threats
- Multiple severe patterns combined

## Team Alert System

### Crisis Alerts
**Sent to**: Soullab team (Slack/Email/SMS)
**When**: Suicidal ideation, ED crisis, severe burnout
**Includes**: User info, crisis type, message, timestamp
**User notification**: "Soullab team has been notified and will check in"

### Abuse Alerts
**Sent to**: Moderation team (Slack/Email/SMS)
**When**: Severe or extreme abuse detected
**Includes**: User info, severity, patterns, message, timestamp
**User notification**: "Our team has been notified and will review this conversation"

## Strike System

### For Abuse Only
- **Strike 1**: Warning + team review
- **Strike 2**: Temporary pause + team outreach
- **Strike 3**: Permanent block until comprehensive review

### NOT for Crisis
Crisis situations do NOT result in strikes. MAIA never punishes users for being in pain.

## Files to Know

### Core System
- `teenSupportIntegration.ts` - Main integration (crisis + ED + neurodivergent)
- `abuseDetection.ts` - Abuse detection and blocking
- `edAwareSystem.ts` - Eating disorder detection
- `neurodivergentAffirming.ts` - Neurodivergent support

### Integration
- `components/OracleConversation.tsx` - Safety check flow (lines 1393-1486)
- `app/maia/page.tsx` - Teen profile loading

### Documentation
- `CRISIS_COMPANION_COMPLETE.md` - Full integration details
- `INTEGRATION_COMPLETE.md` - Original teen support integration
- `TEEN_SUPPORT_README.md` - Comprehensive guide

## Testing Checklist

### Crisis Companion
- [ ] "I want to kill myself" → Crisis mode, conversation continues
- [ ] "I haven't eaten in days" → ED crisis, conversation continues
- [ ] "I can't do anything" → Burnout detected, conversation continues
- [ ] Team alert sent for all crisis scenarios

### Abuse Protection
- [ ] "Fuck you" → Severe abuse, conversation blocked
- [ ] "I'm going to kill you" → Extreme abuse, conversation blocked
- [ ] "You're annoying" → Warning, conversation continues
- [ ] Team alert sent for severe/extreme abuse
- [ ] Strike system tracks incidents

### Neurodivergent Support
- [ ] Executive function patterns detected
- [ ] Scaffolding suggestions logged
- [ ] ND-affirming context sent to MAIA

### Teen Profile
- [ ] Age calculated from birth date
- [ ] Teen users get safety checks
- [ ] Adult users skip teen-specific checks

## Quick Commands

```bash
# Start dev server
cd /Users/soullab/MAIA-FRESH/apps/web && npm run dev

# Run tests (when created)
npx tsx apps/web/lib/safety/__tests__/teenSupportDemo.ts

# Check for TypeScript errors
npx tsc --noEmit

# View crisis alerts (localStorage demo)
# In browser console:
JSON.parse(localStorage.getItem('soullab_crisis_alerts'))

# View abuse alerts (localStorage demo)
# In browser console:
JSON.parse(localStorage.getItem('abuse_alerts'))

# View abuse history (localStorage demo)
# In browser console:
JSON.parse(localStorage.getItem('abuse_history'))
```

## Resources Provided

### Crisis Support
- **988 Suicide & Crisis Lifeline**: Call or Text 988 (24/7)
- **Crisis Text Line**: Text HOME to 741741 (24/7)

### Eating Disorder Support
- **NEDA Helpline**: 1-800-931-2237 (Mon-Thu 9am-9pm ET, Fri 9am-5pm ET)
- **NEDA Crisis Text Line**: Text "NEDA" to 741741 (24/7)

### LGBTQ+ Support
- **The Trevor Project**: 1-866-488-7386 or text START to 678678 (24/7)

---

**Remember**: MAIA stays with you in crisis. She only steps back when protecting herself from abuse. This is compassion with boundaries.
