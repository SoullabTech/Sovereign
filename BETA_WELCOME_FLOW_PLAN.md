# Beta Welcome Flow Reorganization Plan

## Proposed User Journey Structure

### 🆕 NEW BETA TESTERS

#### **Step 1: Entry & Verification**
- **Page**: `/welcome`
- **Components**: Combined `PasscodeEntry` + `BasicInfo`
- **Fields**:
  - Name (first name)
  - Beta passcode
- **Validation**: Passcode against current codes list
- **Next**: Step 2

#### **Step 2: Account Creation**
- **Component**: `AccountSetup`
- **Fields**:
  - Username (for login)
  - Password (6+ characters)
  - Confirm password
- **Process**: Creates account in `beta_users`
- **Next**: Step 3

#### **Step 3: Welcome to MAIA**
- **Component**: `MAIAIntroduction`
- **Content**:
  - Sacred holoflower animation
  - "Welcome to MAIA, [Name]"
  - Brief explanation (2-3 sentences)
  - Your assigned element: [Fire/Water/Earth/Air/Aether]
- **Duration**: 10 seconds
- **Next**: Step 4

#### **Step 4: Quick Onboarding**
- **Component**: `EssentialOnboarding` (3 quick steps)
- **Step 4a - Preferences**:
  - Communication style (warm, direct, playful, gentle)
  - Preferred mode (voice, text, either)
- **Step 4b - Context** (Optional):
  - "What brings you to MAIA?" (text area)
  - Skip option available
- **Step 4c - Ready**:
  - "You're ready to begin"
  - Research participation opt-in (simplified)
- **Next**: MAIA

#### **Step 5: Enter MAIA**
- **Destination**: `soullab.life/maia`
- **Transition**: "Opening consciousness space..."

### 🔄 RETURNING BETA TESTERS

#### **Auto-Detection Path** (Signed in)
```
Visit soullab.life → Check session → Direct to /maia
```

#### **Manual Sign-in Path** (Session expired)
- **Page**: `/welcome` (detects returning user)
- **Display**: "Welcome back, [Name]!"
- **Fields**:
  - Username (pre-filled if available)
  - Password
- **Options**:
  - "Forgot password?" link
  - "Sign in" button
- **Success**: Direct to `soullab.life/maia`

## Technical Implementation

### File Structure Changes

#### **New Components Needed**:
```
/components/beta/
├── AccountSetup.tsx          # Username/password creation
├── EssentialOnboarding.tsx   # Streamlined 3-step process
├── MAIAIntroduction.tsx      # Welcome + element reveal
└── ReturningUserLogin.tsx    # Simplified login form
```

#### **Modified Components**:
```
/apps/web/app/welcome/page.tsx  # Main orchestrator
/components/auth/PasscodeEntry.tsx  # Add name field
/components/beta/SoulfulOnboarding.tsx  # Keep for detailed mode
```

### Session Management

#### **localStorage Structure**:
```javascript
// Core session data
beta_user: {
  id: string,
  name: string,        // Display name
  username: string,    // Login username
  password: string,    // Encrypted
  agentId: string,     // fire|water|earth|air|aether
  agentName: string,   // Display name for element
  onboarded: boolean,
  createdAt: string,
  lastLoginAt: string
}

// Onboarding completion flags
betaOnboardingComplete: "true" | null
betaAccessCode: string

// Quick vs detailed onboarding
onboardingMode: "essential" | "detailed"
```

### API Endpoints

#### **Modified Endpoints**:
```
POST /api/beta/quick-onboarding
- Accept: name, username, password, passcode, preferences
- Return: userId, agentId, success

GET /api/auth/session-check
- Check: Valid session token
- Return: user data or null

POST /api/auth/signin
- Accept: username, password
- Return: session token, user data
```

### Domain Integration

#### **Consistent Routing**:
```javascript
// All redirects point to soullab.life
const MAIA_URL = "https://soullab.life/maia"

// Welcome completion
onComplete: () => window.location.href = MAIA_URL

// Returning user signin
onSignin: () => window.location.href = MAIA_URL

// Auto-redirect from root
if (userSignedIn) window.location.href = MAIA_URL
```

## Migration Strategy

### **Phase 1: Maintain Current Flow**
- Keep existing `SoulfulOnboarding` as "detailed mode"
- Add feature flag: `useDetailedOnboarding`

### **Phase 2: Add Streamlined Flow**
- Implement new components
- A/B test: Essential vs Detailed onboarding
- Track completion rates and user satisfaction

### **Phase 3: Optimize Based on Data**
- Choose winning flow
- Remove unused components
- Optimize conversion rates

## User Experience Goals

### **New User Success Metrics**:
- ✅ Complete onboarding in under 3 minutes
- ✅ Understand what MAIA is before entering
- ✅ Feel welcomed and guided
- ✅ Successfully reach `/maia` interface

### **Returning User Success Metrics**:
- ✅ Sign in within 30 seconds
- ✅ Automatic session restoration when possible
- ✅ Smooth transition to MAIA interface
- ✅ Personalized welcome back experience

## Implementation Priority

1. **HIGH**: Fix domain routing consistency
2. **HIGH**: Simplify new user flow (reduce steps)
3. **MEDIUM**: Improve returning user detection
4. **MEDIUM**: A/B testing infrastructure
5. **LOW**: Detailed analytics and optimization

## Questions to Resolve

1. **Should we keep the wisdom/daimon intro sequences?**
   - Pro: Builds mystical anticipation
   - Con: Adds 30+ seconds before value

2. **How detailed should quick onboarding be?**
   - Current: 7 comprehensive steps
   - Proposed: 3 essential steps
   - Alternative: 1 step with optional expansion

3. **Session duration preferences?**
   - Auto-login duration: 30 days? 7 days?
   - Password requirements: Current 6+ chars sufficient?

4. **Conversion optimization priorities?**
   - Focus on completion rate vs engagement depth?
   - Prioritize speed vs personalization?