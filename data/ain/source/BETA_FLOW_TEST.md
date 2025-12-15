# 🌸 Beta Onboarding Flow - Local Test Guide

## 🚀 Server Status
```
✓ Dev Server: http://localhost:3000
✓ All routes compiled and ready
✓ Hot reload active
```

---

## 🎯 Complete User Journey

### **Step 1: Portal Entry**
**URL:** `http://localhost:3000/beta-entry`

**What to Test:**
- [ ] Holoflower breathing animation appears
- [ ] Radiant amber glow pulses smoothly
- [ ] Sparkles emanate from center
- [ ] "Welcome to Soullab" text visible
- [ ] Name input field focused and responsive
- [ ] Enter button activates when name entered
- [ ] "Entering..." state shows on click

**Expected Behavior:**
- Holoflower scales (1.05x) and rotates (±5°) in 8-second cycle
- 6 sparkles radiate outward on 4-second cycles
- Smooth transition to orientation after name entry

**Data Stored:**
- `sessionStorage.explorerId`
- `sessionStorage.explorerName`
- `localStorage.explorerId`
- `localStorage.explorerName`

---

### **Step 2: Elemental Orientation**
**URL:** `http://localhost:3000/beta-orientation`

**What to Test:**

#### **Element 1: Fire △ - IF**
- [ ] Fire triangle glyph appears with rotation animation
- [ ] Orange/red color scheme
- [ ] "IF - The Potential" title
- [ ] Content about personal growth potential
- [ ] Progress dots show 1/5
- [ ] "Skip orientation" button visible
- [ ] "Continue" button appears after 1.5s

#### **Element 2: Water ▽ - WHY**
- [ ] Water inverted triangle glyph
- [ ] Cyan/blue color scheme
- [ ] "WHY - The Purpose" title
- [ ] Content about meaningful relationships
- [ ] Progress dots show 2/5

#### **Element 3: Earth △— - HOW**
- [ ] Earth triangle with horizontal line (SVG)
- [ ] Green/emerald color scheme
- [ ] "HOW - The System" title
- [ ] Content about Maya learning
- [ ] Progress dots show 3/5

#### **Element 4: Air △— - WHAT**
- [ ] Air triangle with horizontal line (SVG)
- [ ] Sky/cyan color scheme
- [ ] "WHAT - The Experience" title
- [ ] Content about platform features
- [ ] Progress dots show 4/5

#### **Element 5: Aether ⊕ - SOUL**
- [ ] Aether circle-dot glyph
- [ ] Amber/yellow color scheme
- [ ] "SOUL - The Heart" title
- [ ] Content about collective purpose
- [ ] Progress dots show 5/5
- [ ] "Begin your journey" button

#### **Feedback Screen**
- [ ] After 5th element, feedback prompt appears
- [ ] "How did this feel?" title
- [ ] 3 emoji options: ✨ Just right, 🤔 A bit much, ⚡ Too quick
- [ ] Clicking emoji enables continue
- [ ] Smooth transition to onboarding

**Expected Behavior:**
- Each glyph rotates in from scale 0
- Colors transition smoothly
- Content fades in progressively
- Skip button always accessible
- 1.5s delay before Continue activates

**Data Stored:**
- `localStorage.orientationFeedback` (perfect | too_long | too_short)

---

### **Step 3: Soulful Onboarding**
**URL:** `http://localhost:3000/beta-onboarding`

**What to Test:**

#### **Step 1: Welcome**
- [ ] Heart icon pulsing
- [ ] Personalized greeting with explorer name
- [ ] "Everything here is optional" messaging
- [ ] "Share a bit about yourself" button
- [ ] "Skip to Maya" option

#### **Step 2: Basics**
- [ ] Age range dropdown (optional)
- [ ] Pronouns dropdown (optional)
- [ ] Location text field (optional)
- [ ] All fields have "Prefer not to say" option
- [ ] Progress indicator shows step 2/5
- [ ] Back button works
- [ ] Skip button visible
- [ ] Continue button enabled

#### **Step 3: Your Story**
- [ ] Title: "Share what feels alive for you right now"
- [ ] Textarea with invitational placeholder
- [ ] Helper text about Maya understanding context
- [ ] File upload section visible
- [ ] Multiple file types accepted
- [ ] Uploaded files show in list
- [ ] Progress indicator shows step 3/5

#### **Step 4: Preferences**
- [ ] Greeting style grid (4 options with emojis)
- [ ] 🤗 Warm & nurturing
- [ ] 🕊️ Gentle & soft
- [ ] 💎 Direct & clear
- [ ] ✨ Playful & creative
- [ ] Communication preference (Voice/Chat/Either)
- [ ] Focus areas checklist (8 options)
- [ ] Multiple selections allowed
- [ ] Progress indicator shows step 4/5

#### **Step 5: Research**
- [ ] Research participation info box
- [ ] 3 consent checkboxes
- [ ] Usage Analytics
- [ ] Interview Invitations
- [ ] Conversation Analysis
- [ ] "Meet Maya" button with sparkle icon
- [ ] Progress indicator shows step 5/5

**Expected Behavior:**
- Smooth step transitions
- Back button navigates to previous step
- Skip advances to next step
- All data optional except name
- Final "Meet Maya" button triggers completion

**Data Stored:**
- `localStorage.onboardingData` (JSON with all fields)
- API POST to `/api/beta/onboarding` (async, non-blocking)

---

### **Step 4: Maya Interface**
**URL:** `http://localhost:3000/maya`

**What to Test:**

#### **Initial Load**
- [ ] Holoflower visualization in center
- [ ] Personalized greeting from Maya
- [ ] References onboarding data (if provided)
- [ ] Voice/Chat mode toggle visible
- [ ] Bottom navigation bar present

#### **Bottom Navigation**
- [ ] Voice mode button (mic icon)
- [ ] Heart/Favorites button
- [ ] Profile button (user icon) ← **NEW**
- [ ] Journal button (book icon)
- [ ] Chat mode button
- [ ] Text display toggle (voice mode only)
- [ ] File upload button
- [ ] Settings button
- [ ] Download transcript button

#### **Profile Access**
- [ ] Clicking profile button navigates to `/profile`
- [ ] Profile button highlighted in amber when active

**Expected Behavior:**
- Maya greets with chosen greeting style
- References biographical data in first message
- Voice mode auto-activates if preferred
- All navigation buttons responsive
- Smooth holoflower animations

---

### **Step 5: Profile Editor**
**URL:** `http://localhost:3000/profile`

**What to Test:**

#### **Page Layout**
- [ ] Back button to return to Maya
- [ ] User icon in header
- [ ] "Your Profile" title
- [ ] "Update your information anytime" subtitle

#### **Editable Fields**
- [ ] Name field (pre-filled)
- [ ] Age range dropdown (pre-filled if set)
- [ ] Pronouns dropdown (pre-filled if set)
- [ ] Location field (pre-filled if set)
- [ ] Biography textarea (pre-filled if set)
- [ ] Greeting style grid (pre-selected if set)
- [ ] Communication preference (pre-selected if set)
- [ ] Focus areas checkboxes (pre-checked if set)

#### **Save Functionality**
- [ ] "Save Changes" button at bottom
- [ ] Save button shows "Saving..." state
- [ ] Success message appears after save
- [ ] Message fades after 2 seconds
- [ ] Data persists in localStorage
- [ ] API POST to `/api/beta/onboarding` triggered

**Expected Behavior:**
- All data pre-populated from onboarding
- Changes save to localStorage immediately
- API sync happens asynchronously
- Back button returns to Maya
- No data loss on navigation

**Data Updated:**
- `localStorage.onboardingData`
- `localStorage.explorerName`
- `sessionStorage.explorerName`

---

## 🔍 Data Flow Verification

### **Check localStorage**
Open browser console:
```javascript
// View all stored data
console.log('Explorer ID:', localStorage.getItem('explorerId'));
console.log('Explorer Name:', localStorage.getItem('explorerName'));
console.log('Onboarding Data:', JSON.parse(localStorage.getItem('onboardingData') || '{}'));
console.log('Orientation Feedback:', localStorage.getItem('orientationFeedback'));
```

### **Expected Data Structure**
```javascript
{
  explorerId: "explorer_1727307600000",
  explorerName: "John",
  onboardingData: {
    name: "John",
    age: "25-34",
    pronouns: "he/him",
    location: "San Francisco, CA",
    biography: "Software engineer exploring consciousness...",
    greetingStyle: "warm",
    communicationPreference: "voice",
    focusAreas: ["Self-discovery", "Creative exploration"],
    researchConsent: {
      analytics: true,
      interviews: true,
      transcripts: false
    }
  },
  orientationFeedback: "perfect"
}
```

---

## ✅ Success Criteria

### **Visual**
- [ ] All animations smooth (no jank)
- [ ] Colors transition beautifully
- [ ] Typography readable and elegant
- [ ] Spacing feels generous
- [ ] Mobile responsive (test at different widths)

### **Functional**
- [ ] All navigation works
- [ ] All data persists
- [ ] No console errors
- [ ] Hot reload works
- [ ] Back/forward browser navigation works

### **Emotional**
- [ ] First impression feels magical
- [ ] Each step feels intentional
- [ ] Language feels inviting not demanding
- [ ] User feels in control
- [ ] Journey feels cohesive

---

## 🐛 Common Issues & Fixes

### **Issue: Fast Refresh errors in console**
- **Cause:** React component updates during development
- **Fix:** Ignore unless functionality broken
- **Action:** Refresh page manually if needed

### **Issue: Holoflower not visible**
- **Cause:** SVG file path incorrect
- **Fix:** Check `/public/holoflower.svg` exists
- **Action:** Verify image loads in browser

### **Issue: Orientation feedback not showing**
- **Cause:** State condition logic
- **Fix:** Ensure `currentIndex === ELEMENTS.length` triggers feedback
- **Action:** Check console for state logs

### **Issue: Data not persisting**
- **Cause:** localStorage blocked or incognito mode
- **Fix:** Check browser settings
- **Action:** Use normal browser window

### **Issue: Profile not pre-filling**
- **Cause:** localStorage data format mismatch
- **Fix:** Check data structure in console
- **Action:** Clear localStorage and re-onboard

---

## 📊 Analytics to Track

### **Orientation Metrics**
- Completion rate per element (1-5)
- Skip rate
- Feedback distribution (perfect/too_long/too_short)
- Time spent per element
- Drop-off points

### **Onboarding Metrics**
- Step completion rates
- Field fill rates
- Biography word count
- File upload usage
- Research consent rates
- Total time to completion

### **Profile Metrics**
- Edit frequency
- Fields most edited
- Time between edits
- Correlation with session length

---

## 🚀 Next Steps After Local Test

1. **Document Findings**
   - Note any UX friction
   - List visual improvements needed
   - Identify technical issues

2. **Iterate**
   - Fix critical bugs
   - Refine animations
   - Polish copy

3. **Deploy to Staging**
   - Test on production environment
   - Verify API integrations
   - Check performance

4. **Beta Launch**
   - Send invitations to first 20
   - Monitor analytics
   - Collect feedback

---

## 🎯 Test Scenarios

### **Scenario 1: Skip Everything**
- Enter name → Skip orientation → Skip onboarding → Land in Maya
- Expected: Minimal context, generic greeting

### **Scenario 2: Full Engagement**
- Complete all 5 elements → Provide feedback → Fill all onboarding fields → Meet Maya
- Expected: Highly personalized greeting, rich context

### **Scenario 3: Partial Fill**
- Complete orientation → Fill only biography → Skip preferences → Meet Maya
- Expected: Some personalization, adaptable greeting

### **Scenario 4: Return User**
- Complete full flow → Close browser → Reopen → Go to /maya
- Expected: Data persists, Maya recognizes returning user

### **Scenario 5: Profile Edit**
- Complete flow → Enter Maya → Click profile → Edit biography → Save → Return to Maya
- Expected: Updates persist, Maya uses new context

---

## 📝 Test Checklist Summary

**Pre-Test:**
- [ ] Dev server running on port 3000
- [ ] Browser DevTools open
- [ ] Console cleared
- [ ] localStorage cleared (for fresh test)

**During Test:**
- [ ] Note any visual glitches
- [ ] Check console for errors
- [ ] Verify data persistence
- [ ] Test all navigation paths
- [ ] Try edge cases (empty fields, special characters)

**Post-Test:**
- [ ] Export localStorage data
- [ ] Document findings
- [ ] Create bug tickets if needed
- [ ] Plan iterations

---

**Status: READY FOR FULL LOCAL TEST** ✨

The complete beta onboarding flow is integrated and running on `http://localhost:3000`.

Start at: `http://localhost:3000/beta-entry`

**Happy testing!** 🌸