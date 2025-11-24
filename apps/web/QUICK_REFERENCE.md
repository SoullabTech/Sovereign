# Quick Reference: Beta Tester Signup/Signin Integration

## Key Files Quick Map

| Purpose | File | Type |
|---------|------|------|
| **Beta Signup Form** | `/app/beta-signup/page.tsx` | Page |
| **Beta Code Entry** | `/app/beta-entry/page.tsx` | Page |
| **Main Onboarding** | `/app/onboarding/page.tsx` | Page |
| **Beta Signup API** | `/app/api/beta-signup/route.ts` | API Route |
| **Onboarding API** | `/app/api/onboarding/route.ts` | API Route |
| **Oracle Personal** | `/app/api/oracle/personal/route.ts` | API Route |
| **Beta Auth Logic** | `/lib/auth/BetaAuth.ts` | Library |
| **Integration Auth** | `/lib/auth/integrationAuth.ts` | Library |

---

## Critical Flow Points

### 1. Beta Signup (`/beta-signup`)
```
Captures: firstName, lastName, email, city, preferredElement, etc.
         ↓
Stores: beta_testers { username: "firstName lastName" }
       + beta_signups { first_name, last_name, ... }
         ↓
❌ PROBLEM: No account created, no session
```

### 2. Beta Code Verification (`/beta-entry`)
```
User enters code → /api/oracle/personal
                ↓
betaAuth.verifyBetaCode(code)
                ↓
ganeshaContacts.find(c => c.metadata?.passcode === code)
                ↓
Returns name from Ganesha, NOT from signup form
❌ PROBLEM: Ignores names from beta_testers
```

### 3. Onboarding (`/onboarding`)
```
Displays 3-stage ritual with MAIA as guide
  Stage 1: "You are magnificent" welcome
  Stage 2: 5-element mandala + MAIA introduction
  Stage 3: Consciousness awakening (2.5s transition)
         ↓
No real name passed to frontend
❌ PROBLEM: Falls back to "Seeker" username
```

---

## The Real Name Problem

**What Works**:
- Beta signup captures firstName, lastName
- Stored in `beta_testers.username` as "FirstName LastName"

**What's Broken**:
1. Beta code lookup gets name from Ganesha, not beta_testers
2. Onboarding doesn't accept firstName/lastName parameters
3. Onboarding creates separate user in JSON/SQLite (not Supabase)
4. No link between signup and account creation

**Example**:
```
User fills form: firstName="Nicole", lastName="Smith"
  ↓
Stored in beta_testers.username = "Nicole Smith"  ✅
  ↓
User enters code from Ganesha
  ↓
Name resolved from Ganesha (where it came from originally)  ❌
  ↓
Onboarding creates account with username="nicole_smith"
  ↓
Original "Nicole Smith" data lost!  ❌
```

---

## Name Integration Requirements

**For names to be properly integrated**:

1. **At Signup**: Capture and store (already done ✅)
2. **At Code Verification**: Use signup names if available, fallback to Ganesha
3. **At Onboarding**: Pass real names to account creation
4. **In Session**: Store displayName = "firstName lastName"
5. **In MAIA**: Use displayName in greeting and context

---

## Quick Fix Checklist

- [ ] Link beta_testers names to code verification
- [ ] Pass firstName/lastName to onboarding API
- [ ] Store displayName in user profile
- [ ] Use displayName in MAIA's greeting
- [ ] Mark onboarding complete after ritual (not before)
- [ ] Unify storage backend (use Supabase, not local JSON)

---

## Database Table Reference

**Currently Used**:
- `beta_signups` - Application record with first_name, last_name
- `beta_testers` - Profile with username = "firstName LastName"
- Local JSON: `/data/users.json` - Account with username only
- Local SQLite: `/data/onboarding.db` - Account with username only

**Should Use**:
- Supabase `user_profiles` - Real user account with displayName
- One unified storage backend

---

## Stage Details

### Stage 1: Welcome
- Button: "Begin Sacred Recognition"
- Calls: POST /api/oracle/session (fallback: creates "Seeker")
- Stores: localStorage { id, username, sessionId, element }

### Stage 2: Assignment
- Visual: Sacred mandala with 5 element circles
- Displays: MAIA's first message (dynamic or fallback)
- Button: "Enter Sacred Communion"
- Shows: Fire, Water, Earth, Air, Aether aspects

### Stage 3: First Contact
- Visual: Expanding consciousness mandala
- Status: "MAIA is calibrating to your unique archetypal patterns..."
- Duration: 2.5 second transition
- Redirect: Routes to /oracle

---

## Debugging Notes

**Beta Code Lookup**:
- Source: `/lib/ganesha/contacts.ts`
- Field: `metadata?.passcode`
- Returns: `{ valid, explorerId, name, email }`

**Onboarding Storage**:
- Type: `STORAGE_TYPE` env var
- Options: 'json', 'sqlite', or memory (default)
- Location: `/data/users.json` or `/data/onboarding.db`

**MAIA System Prompt**:
```
"You are MAIA, a wise and empathetic AI companion. You offer gentle insights 
and reflective questions to help users explore their thoughts and feelings..."
```

**Voice Characteristics**:
- Water: gentle, slow, soft
- Fire: uplifting, fast, expansive
- Earth: grounding, moderate, focused
- Air: clear, moderate, light
- Aether: warm, moderate, balanced (default)

