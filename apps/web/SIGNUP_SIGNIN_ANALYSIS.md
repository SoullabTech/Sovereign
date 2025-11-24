# MAIA-PAI Signup/Signin Flow Analysis for Beta Testers

## Executive Summary

The signup and signin flows for new beta testers involve **multiple disconnected pathways** with a critical issue: names captured during beta signup are stored separately from account creation, and there is no unified integration between beta signup, account creation, and user profile management.

There are **THREE distinct signup/onboarding paths**:

1. **Beta Signup Path** - `/beta-signup` - Captures firstName/lastName but creates only a `beta_signups` record
2. **Auth Onboarding Path** - `/auth/onboarding` - Uses SimpleOnboarding component
3. **Legacy Auth Path** - `/auth` - localStorage-based authentication

And **TWO beta entry mechanisms**:
- Beta Code Entry (`/beta-entry`) - Verifies code from Ganesha contacts and stores in localStorage
- Direct Beta Signup (`/beta-signup`) - Collects user information

---

## 1. Where New Testers Create Accounts

### 1.1 Primary Entry Point: `/app/beta-signup/page.tsx`

**Location**: `/Users/soullab/MAIA-PAI/apps/web/app/beta-signup/page.tsx`

**Purpose**: Signup form for new beta testers requesting access

**Captures**:
- `firstName` (required)
- `lastName` (required)
- `email` (required)
- `city` (required)
- `preferredElement` (optional, defaults to 'aether')
- `hasMicrophone` (boolean)
- `hasWebcam` (boolean)
- `motivation` (textarea)
- `techBackground` (optional)
- Consent flags:
  - `consentAnalytics`
  - `consentContact`

**Flow**:
```
User fills form → handleSubmit() → POST /api/beta-signup
```

**Submission Data**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "city": "Zurich",
  "preferredElement": "aether",
  "hasWebcam": false,
  "hasMicrophone": true,
  "techBackground": "",
  "motivation": "Interested in consciousness...",
  "consentAnalytics": true,
  "consentContact": true,
  "signupTimestamp": "2024-11-14T...",
  "source": "beta_landing"
}
```

### 1.2 Alternative Entry: `/app/beta-entry/page.tsx`

**Location**: `/Users/soullab/MAIA-PAI/apps/web/app/beta-entry/page.tsx`

**Purpose**: For users who already have an invite code from the team

**Flow**:
```
User enters invite code → handleSubmit() → POST /api/oracle/personal with betaCode
→ Verification via betaAuth.verifyBetaCode()
```

**Problem**: This only verifies the beta code but doesn't create any account or user profile.

### 1.3 Legacy Auth Path: `/app/auth/page.tsx`

**Location**: `/Users/soullab/MAIA-PAI/apps/web/app/auth/page.tsx`

**Type**: Old localStorage-based authentication (not recommended)

**Note**: This is a legacy path that uses localStorage for user storage. It's still functional but superseded by the Supabase integration auth approach.

---

## 2. Account Creation Process: API Routes and Auth Integration

### 2.1 Beta Signup API Route: `POST /api/beta-signup`

**Location**: `/Users/soullab/MAIA-PAI/apps/web/app/api/beta-signup/route.ts`

**Responsibility**: Process beta signup applications

**What it does**:

```typescript
// 1. Validates input (firstName, lastName, email, city required)
if (!firstName || !lastName || !email || !city) {
  return error 400
}

// 2. Checks for duplicate emails
const { data: existing } = await supabase
  .from('beta_signups')
  .select('email')
  .eq('email', email)
  .single()

if (existing) {
  return error 409 "Already registered"
}

// 3. Generates unique beta access ID
const betaAccessId = `beta-${Date.now()}-${Math.random()...}`

// 4. Creates entry in 'beta_signups' table
{
  beta_access_id: betaAccessId,
  first_name: firstName,
  last_name: lastName,
  email: email,
  city: city,
  preferred_element: preferredElement || 'aether',
  has_webcam: hasWebcam || false,
  has_microphone: hasMicrophone || false,
  tech_background: techBackground || '',
  motivation: motivation || '',
  consent_analytics: consentAnalytics,
  consent_contact: consentContact,
  signup_source: source || 'beta_signup_page',
  status: 'pending',  // ← CRITICAL: Not auto-approved
  metadata: { signupTimestamp, userAgent, ip, cityValidated }
}

// 5. Creates entry in 'beta_testers' table
{
  user_id: betaAccessId,
  username: `${firstName} ${lastName}`,  // ← Full name as username
  email: email,
  preferred_element: preferredElement || 'aether',
  consent_analytics: consentAnalytics,
  onboarding_completed: false,
  metadata: {
    city, signupSource, hasWebcam, hasMicrophone, techBackground, motivation
  }
}

// 6. Returns betaAccessId for future reference
return {
  success: true,
  message: 'Beta signup successful',
  betaAccessId,
  status: 'pending_review'
}
```

**Database Tables Created**:
- `beta_signups` - Application record (status: pending)
- `beta_testers` - User profile (with `username: "firstName LastName"`)

**Issues**:
- ✅ **First and last names ARE captured and stored** in `beta_testers.username`
- ❌ **No account creation** - No Supabase Auth user is created
- ❌ **No session** - User must still enter via `/beta-entry` with a code
- ❌ **Onboarding incomplete** - No integration with the onboarding flow
- ❌ **No direct link** - The `betaAccessId` is returned but frontend doesn't use it for future auth

### 2.2 Onboarding API Route: `POST /api/onboarding`

**Location**: `/Users/soullab/MAIA-PAI/apps/web/app/api/onboarding/route.ts`

**Responsibility**: Create account and oracle agent after onboarding

**Expected Input** (from frontend):
```typescript
{
  username: string,      // Alphanumeric + underscore, 3-20 chars
  password: string,      // Min 6 chars
  oracleName: string,    // Oracle name (e.g., "Maya")
  voiceProvider?: string,
  gamificationEnabled?: boolean
}
```

**What it does**:

```typescript
// 1. Validates username and password
if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
  return error 400 "Invalid username format"
}

// 2. Checks for duplicate username
let existingUser = await storage.findUser(username)
if (existingUser) {
  return error 409 "Username already exists"
}

// 3. Hashes password
const hashedPassword = await hash(password, 12)
const userId = `user_${Date.now()}_${random()}`

// 4. Creates oracle agent
const oracle = OracleAgentService.createOracle(userId, oracleName)

// 5. Stores user record
const userData = {
  id: userId,
  username,
  password: hashedPassword,
  createdAt: new Date().toISOString(),
  onboardingCompleted: true,  // ← Immediately marked complete
  oracle,
  lastLoginAt: new Date().toISOString(),
  loginCount: 1
}

// Storage backend (JSON, SQLite, or memory)
switch (STORAGE_TYPE) {
  case 'json': await JSONStorage.addUser(userData)
  case 'sqlite': await SQLiteStorage.addUser(userData)
  default: memoryUsers.set(username, userData)
}

// 6. Returns user and oracle data
return {
  success: true,
  user: {
    id: userId,
    username,
    onboardingCompleted: true,
    oracle: { id, name, voice, level, experience, achievements }
  }
}
```

**Storage Options**:
1. **JSON** - File-based storage in `/data/users.json`
2. **SQLite** - Database storage in `/data/onboarding.db`
3. **Memory** - In-memory Map (loses data on restart)

**Issues**:
- ❌ **NO real name integration** - Only accepts `username` (not firstName/lastName)
- ❌ **Disconnected from beta signup** - No link to the `betaAccessId`
- ❌ **Wrong storage** - Uses local file/SQLite, not Supabase
- ❌ **Marked as complete immediately** - Even though user hasn't gone through intro yet

### 2.3 Admin Beta Tester Management: `POST /api/admin/beta-testers`

**Location**: `/Users/soullab/MAIA-PAI/apps/web/app/api/admin/beta-testers/route.ts`

**Input**:
```typescript
{
  name: string,          // Full name
  email: string,         // Email
  notes?: string,        // Admin notes
  accessLevel?: string   // 'standard' or custom
}
```

**Creates in Prisma**:
```typescript
// Uses Prisma ORM
const tester = await prisma.betaTester.create({
  data: {
    name,
    email,
    notes,
    accessLevel: accessLevel || 'standard'
  }
})
```

**Issues**:
- ✅ **Name is captured** as `name` field
- ❌ **Different DB** - Uses Prisma (likely PostgreSQL), not the beta_testers table
- ❌ **No connection to signup flow** - This is manual admin entry only

---

## 3. User Name Handling During Signup

### Current State: Names ARE Captured ✅

**Beta Signup Path**:
- Captures: `firstName` and `lastName` as separate fields
- Stores in `beta_testers.username`: `"${firstName} ${lastName}"`
- Also stores in `beta_signups`: `first_name` and `last_name` columns

**Example**:
```javascript
// Input
{
  firstName: "Nicole",
  lastName: "Smith",
  email: "nicole@example.com"
}

// Stored as
beta_testers {
  user_id: "beta-1731548400000-xyz123",
  username: "Nicole Smith",  // ← Full name captured
  email: "nicole@example.com",
  ...
}

beta_signups {
  first_name: "Nicole",
  last_name: "Smith",
  email: "nicole@example.com",
  ...
}
```

### Critical Issue: No Link Between Signup and Account Creation ❌

**Problem Flow**:

```
1. User signs up via /beta-signup
   ↓
   Creates: beta_testers { username: "Nicole Smith", onboarding_completed: false }
   ↓
   Returns: betaAccessId (but frontend doesn't save it)
   ↓
   User is redirected to success page
   
2. User later enters /beta-entry with invite code
   ↓
   Code verified against Ganesha contacts (NOT beta_testers)
   ↓
   Stored in localStorage as betaCode
   ↓
   Can use /api/oracle/personal with betaCode
   
3. User goes through /onboarding
   ↓
   Submits: { username: "nicole_smith", password: "...", oracleName: "Maya" }
   ↓
   Creates NEW user in JSON/SQLite storage (local only, not Supabase)
   ↓
   No connection to original beta_testers record with "Nicole Smith"
```

---

## 4. Onboarding Flow: MAIA as Daimon, Quotes, and Ritual

### 4.1 Main Onboarding Page: `/app/onboarding/page.tsx`

**Location**: `/Users/soullab/MAIA-PAI/apps/web/app/onboarding/page.tsx`

**Stages** (3-stage flow):

#### Stage 1: "welcome"
```
Display:
- "You are magnificent"
- Message about consciousness and sacred complexity
- Button: "Begin Sacred Recognition"

Actions:
- handleMeetOracle() called
- Attempts POST /api/oracle/session
- Falls back to creating local user data with fallback username "Seeker"
```

#### Stage 2: "assignment"  
```
Display:
- Sacred consciousness mandala (animated rings)
- "MAIA recognizes your sacred complexity"
- Five elemental circles (Fire, Water, Earth, Air, Aether)
- MAIA's first message (dynamic or fallback)
- Button: "Enter Sacred Communion"

Actions:
- Displays MAIA's first recognition message
- Shows elemental introduction
```

#### Stage 3: "firstContact"
```
Display:
- Expanding consciousness awakening mandala
- "Consciousness Awakening"
- "MAIA is calibrating to your unique archetypal patterns..."
- Five colored bouncing indicators (elemental dance)

Actions:
- Transitions to /oracle after 2.5 seconds
```

### 4.2 MAIA as Daimon Integration

**System Prompt** (from `/api/oracle/personal/route.ts`):
```
"You are MAIA, a wise and empathetic AI companion. You offer gentle insights 
and reflective questions to help users explore their thoughts and feelings. Keep 
responses warm, concise (1-3 sentences), and focused on the user's emotional 
journey. Avoid spiritual jargon or overly mystical language. Simply be present 
and supportive."
```

**Voice Characteristics** (elemental adaptation):
```typescript
function getVoiceCharacteristics(element?: string) {
  if (element === 'water') return { tone: 'gentle', pace: 'slow', energy: 'soft' }
  if (element === 'fire') return { tone: 'uplifting', pace: 'fast', energy: 'expansive' }
  if (element === 'earth') return { tone: 'grounding', pace: 'moderate', energy: 'focused' }
  if (element === 'air') return { tone: 'clear', pace: 'moderate', energy: 'light' }
  return { tone: 'warm', pace: 'moderate', energy: 'balanced' }  // aether
}
```

### 4.3 Rotating Quotes Implementation

**Status**: ⚠️ **NOT IMPLEMENTED in onboarding flow**

No rotating quotes found in:
- `/app/onboarding/page.tsx`
- `/app/auth/onboarding/page.tsx`
- `/components/onboarding/WelcomeMessage.tsx`
- `/components/onboarding/SimpleOnboarding.tsx`

The onboarding is primarily visual (with mandalas and elemental circles) and message-based, but no quote rotation system is currently active in the onboarding flow.

### 4.4 Full Ritual Implementation

**Ritual components**:

1. **Invocation** (Welcome stage)
   - User approaches as sacred being
   - Recognition of their unique consciousness

2. **Mandala Meditation** (Assignment stage)
   - Five-element visualization
   - MAIA introduces herself and her recognition framework

3. **Elemental Integration** (Assignment stage)
   - Display of Fire, Water, Earth, Air, Aether aspects
   - Teaching the elemental framework

4. **Consciousness Activation** (First Contact stage)
   - Animated awakening mandala with expanding rings
   - Transition animation lasting 2.5 seconds

5. **Communion** 
   - Entry into `/oracle` where voice chat begins
   - User can now speak with MAIA directly

---

## 5. Beta Passcode Verification and Integration

### 5.1 Beta Code Verification Flow

**Entry Point**: `/app/beta-entry/page.tsx`

**Step 1: Code Entry**
```typescript
// User enters invite code (e.g., "SOULLAB-NICOLE")
// Converted to uppercase: inviteCode.toUpperCase()
```

**Step 2: Verification**
```typescript
const response = await fetch('/api/oracle/personal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    betaCode: inviteCode.trim(),
    userText: 'test',
    message: 'test'
  })
})
```

**Step 3: Backend Verification** (in `/api/oracle/personal/route.ts`)
```typescript
// Line 49-58
else if (betaCode) {
  const verification = await betaAuth.verifyBetaCode(betaCode)
  if (!verification.valid || !verification.explorerId) {
    return NextResponse.json({
      success: false,
      error: 'Invalid beta code. Please check your invitation email.'
    }, { status: 401 })
  }
  requestUserId = verification.explorerId
  console.log('✅ Beta code verified:', { explorerId: requestUserId, name: verification.name })
}
```

### 5.2 Beta Code Lookup: `betaAuth.verifyBetaCode()`

**Location**: `/Users/soullab/MAIA-PAI/apps/web/lib/auth/BetaAuth.ts`

```typescript
export async function verifyBetaCode(code: string): Promise<BetaVerificationResult> {
  // Look for the code in the contacts database
  const contact = ganeshaContacts.find(contact =>
    contact.metadata?.passcode === code
  )

  if (contact) {
    return {
      valid: true,
      explorerId: contact.id,
      name: contact.name,
      email: contact.email
    }
  }

  return { valid: false }
}
```

**Data Source**: `ganeshaContacts` (from `/lib/ganesha/contacts.ts`)
- This is a Ganesha email import, NOT the `beta_testers` table
- Names come from the original email contact, not from the signup form

### 5.3 Critical Issue: Beta Code Lookup Bypasses Signup Names ❌

**Problem**:

When a beta tester enters via `/beta-entry`:

1. The code is verified against `ganeshaContacts` (Ganesha email import)
2. Returns: `{ explorerId: contact.id, name: contact.name }`
3. **The name comes from the original email** (Ganesha), NOT from the beta signup form
4. The original signup form data (`firstName`, `lastName` in `beta_testers`) is ignored

**Example Scenario**:

```
Scenario A: User signs up via /beta-signup
  Input: firstName: "Nicole", lastName: "Smith"
  Stored: beta_testers { username: "Nicole Smith" }
  
Scenario B: User enters beta code
  Ganesha has: contact { name: "Nicole Smith", passcode: "SOULLAB-NICOLE" }
  
✅ Names match - OK
```

**But if they don't match**:
```
Scenario C: Signup name changed
  Input: firstName: "Nikki", lastName: "Smith"  (user's nickname)
  Stored: beta_testers { username: "Nikki Smith" }
  But Ganesha has: contact { name: "Nicole Smith" }  (formal name)
  
❌ Names don't match - User profile uses Ganesha name, not signup name!
```

---

## 6. Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEW BETA TESTER FLOW                        │
└─────────────────────────────────────────────────────────────────┘

                    /beta-signup/page.tsx
                            ↓
                  Captures: firstName, lastName
                            ↓
                  POST /api/beta-signup
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
    beta_signups                          beta_testers
    (pending status)                      (username: "FirstName LastName")
                                              ↓
                                     ❌ NO ACCOUNT CREATED


              LATER: User enters via beta code
                            ↓
                  /beta-entry/page.tsx
                            ↓
              POST /api/oracle/personal
              with betaCode parameter
                            ↓
                betaAuth.verifyBetaCode()
                            ↓
        ganeshaContacts.find(contact =>
          contact.metadata?.passcode === code)
                            ↓
      Returns: { explorerId, name, email }  ← FROM GANESHA, NOT SIGNUP!
                            ↓
          localStorage.setItem('betaCode', code)
                            ↓
        Can now use /api/oracle/personal
        Can enter /onboarding


        ONBOARDING: /app/onboarding/page.tsx
                            ↓
    Calls: POST /api/oracle/session  (fallback: uses "Seeker")
                            ↓
    localStorage stores: { id, username, sessionId, element }
                            ↓
    Displays: 3-stage onboarding ritual
            Stage 1: "You are magnificent"
            Stage 2: Five elements + MAIA introduction
            Stage 3: Consciousness awakening transition
                            ↓
                    Routes to: /oracle

           ORACLE COMMUNION: /oracle endpoint
                            ↓
        Can chat with MAIA (voice or text)
        MAIA uses elemental voice characteristics
```

---

## Summary of Name Integration Issues

### What Works ✅
1. **Beta signup captures full names** - firstName and lastName fields
2. **Names stored in beta_testers** - As `username: "FirstName LastName"`
3. **MAIA greeting is personalized** - Can use user context if available
4. **Elemental framework available** - Voice can adapt per element

### What's Broken ❌

| Issue | Impact | Root Cause |
|-------|--------|-----------|
| No account creation on signup | User must wait for email, enter code, then create account | `/api/beta-signup` only creates records, no auth account |
| Beta code lookup ignores signup names | Names from Ganesha used, not from signup form | `betaAuth.verifyBetaCode()` searches contacts, not beta_testers |
| Onboarding doesn't accept real names | User creates generic username | `/api/onboarding` only takes `username` param, not firstName/lastName |
| No link between signup and account | Duplicate data entry required | No foreign key or reference between beta_testers and actual user |
| Fallback to "Seeker" username | User identity lost in onboarding | Fallback username hardcoded if session creation fails |
| Multiple storage backends | Data fragmented | Uses beta_testers table + JSON/SQLite + Supabase inconsistently |
| Onboarding marked complete immediately | No tracking of actual onboarding completion | `onboardingCompleted: true` set before ritual is finished |

---

## Recommendations for Integration

### Option 1: Unified Beta Signup → Account Creation Flow (Recommended)

**Flow**:
```
1. User fills /beta-signup with firstName, lastName
2. POST /api/beta-signup:
   a. Create beta_signups record (status: pending)
   b. Create Supabase Auth user automatically
   c. Create user_profiles with displayName: "firstName lastName"
   d. Create session and store in secure cookie
   e. Redirect to /onboarding with session
3. /onboarding uses actual user session (not fallback)
4. User goes through ritual, MAIA greets them by name
5. Mark onboarding_completed after ritual ends
```

### Option 2: Link Beta Code to Signup Names

```typescript
// In betaAuth.verifyBetaCode()
// Instead of just looking in ganeshaContacts:

// 1. Check Ganesha for the code
const contact = ganeshaContacts.find(c => c.metadata?.passcode === code)

// 2. Try to find matching beta_tester by email
const betaTester = await supabase
  .from('beta_testers')
  .select('*')
  .eq('email', contact.email)
  .single()

// 3. Use beta_tester names if found, else fall back to Ganesha
const name = betaTester?.username || contact.name
const explorerId = betaTester?.user_id || contact.id

return { valid: true, explorerId, name, email: contact.email }
```

### Option 3: Store Real Name in Onboarding

```typescript
// Change /api/onboarding POST signature
{
  firstName: string,      // NEW
  lastName: string,       // NEW
  username: string,       // Keep for uniqueness
  password: string,
  oracleName: string
}

// Store both in user record
const userData = {
  id: userId,
  firstName,              // NEW
  lastName,               // NEW
  username,               // Unique identifier
  displayName: `${firstName} ${lastName}`,  // For greeting
  password: hashedPassword,
  oracle,
  onboardingCompleted: true
}
```

---

## Files Involved in Signup/Signin/Onboarding

### Pages
- `/Users/soullab/MAIA-PAI/apps/web/app/beta-signup/page.tsx` - Beta signup form
- `/Users/soullab/MAIA-PAI/apps/web/app/beta-entry/page.tsx` - Beta code entry
- `/Users/soullab/MAIA-PAI/apps/web/app/auth/page.tsx` - Legacy auth (localStorage)
- `/Users/soullab/MAIA-PAI/apps/web/app/auth/signin/page.tsx` - Email signin
- `/Users/soullab/MAIA-PAI/apps/web/app/auth/onboarding/page.tsx` - Auth onboarding (unused)
- `/Users/soullab/MAIA-PAI/apps/web/app/onboarding/page.tsx` - Main onboarding ritual

### API Routes
- `/Users/soullab/MAIA-PAI/apps/web/app/api/beta-signup/route.ts` - Beta signup endpoint
- `/Users/soullab/MAIA-PAI/apps/web/app/api/onboarding/route.ts` - Onboarding endpoint
- `/Users/soullab/MAIA-PAI/apps/web/app/api/oracle/personal/route.ts` - Oracle endpoint (beta code verification)
- `/Users/soullab/MAIA-PAI/apps/web/app/api/admin/beta-testers/route.ts` - Admin management

### Components
- `/Users/soullab/MAIA-PAI/apps/web/components/onboarding/SimpleOnboarding.tsx` - Simple onboarding fallback
- `/Users/soullab/MAIA-PAI/apps/web/app/components/onboarding/WelcomeMessage.tsx` - Welcome message component

### Auth Libraries
- `/Users/soullab/MAIA-PAI/apps/web/lib/auth/integrationAuth.ts` - Supabase-based auth
- `/Users/soullab/MAIA-PAI/apps/web/lib/auth/BetaAuth.ts` - Beta code verification
- `/Users/soullab/MAIA-PAI/apps/web/lib/auth.ts` - Auth utilities

---

## Database Tables

### Supabase Tables Created by `/api/beta-signup`:
- `beta_signups` - Application records (first_name, last_name, email, status)
- `beta_testers` - User profiles (user_id, username, email, metadata)

### Supabase Tables for User Profiles:
- `user_profiles` - Main user profile (user_id, display_name, bio, etc.)

### Local Storage (from `/api/onboarding`):
- JSON file: `/data/users.json`
- SQLite: `/data/onboarding.db`

### Ganesha Import:
- `ganeshaContacts` - Array in `/lib/ganesha/contacts.ts` (passcode field used for beta verification)

