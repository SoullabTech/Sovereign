# 📜 Beta QA Ritual: Spiralogic Oracle System

*A comprehensive testing checklist for Beta testers of the Sacred Technology Platform*

---

## 🎯 Mission

You are testing Maya's sacred conversational shaping system. Your role is to verify that voice interactions feel embodied, intentional, and alive through Sesame-enhanced speech synthesis and adaptive silence detection.

---

## 1. Setup Ritual

### Local Environment
```bash
# Backend (Terminal 1)
cd backend
npm install
npm run dev

# Frontend (Terminal 2)  
cd /
npm install
npm run dev
```

### Debug Mode Activation
1. Open browser to `http://localhost:3001`
2. Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac) to enable debug overlay
3. Verify you see debug panel with:
   - Silence timeout counter
   - Raw vs shaped transcript display
   - Sesame status indicator

### Browser Permissions
- ✅ Microphone access granted
- ✅ Chrome/Firefox recommended (Safari may have audio issues)
- ✅ No ad blockers interfering with WebSocket connections

---

## 2. Voice UX Tests

### Test 2.1: Short Phrase (2.5s timeout)
**Input:** Speak a 3-5 word phrase  
**Expected:** Recording stops after 2.5s of silence  
**Verify:**
- [ ] Auto-stop triggers at exactly 2.5s
- [ ] Maya responds with shaped voice
- [ ] Debug shows: `TIMEOUT: 2.5s` 

### Test 2.2: Medium Thought (4s timeout)
**Input:** Speak 1-2 sentences continuously  
**Expected:** Recording stops after 4s of silence  
**Verify:**
- [ ] Auto-stop triggers at exactly 4s
- [ ] No premature cutoff during natural pauses
- [ ] Debug shows: `TIMEOUT: 4.0s`

### Test 2.3: Long Reflection (6s timeout)  
**Input:** Speak 3+ sentences with thoughtful pauses  
**Expected:** Recording stops after 6s of silence  
**Verify:**
- [ ] Auto-stop triggers at exactly 6s
- [ ] System waits through contemplative pauses
- [ ] Debug shows: `TIMEOUT: 6.0s`

### Test 2.4: Manual Stop
**Input:** Tap microphone icon while speaking  
**Expected:** Recording stops instantly  
**Verify:**
- [ ] Immediate response (no delay)
- [ ] Clean audio cutoff
- [ ] Maya processes partial input correctly

### Test 2.5: Enter Key Submission
**Input:** Press Enter while recording  
**Expected:** Recording stops and submits  
**Verify:**
- [ ] Instant submission
- [ ] Same behavior as mic tap
- [ ] Audio processing begins immediately

---

## 3. Sesame Shaping Tests

### Test 3.1: Raw vs Shaped Transcript
**Input:** Any voice input  
**Expected:** Debug overlay shows both versions  
**Verify:**
- [ ] Raw transcript (gray text) displays LLM output
- [ ] Shaped transcript (gold text) shows Sesame-enhanced version  
- [ ] Clear visual distinction between versions
- [ ] Status shows: `SESAME ✅`

### Test 3.2: SSML Tag Verification
**Input:** Request Maya to speak with emotion or emphasis  
**Expected:** Shaped transcript contains proper SSML tags  
**Verify:**
- [ ] `<pause duration="500ms">` for natural breaks
- [ ] `<emphasis level="strong">` for key words
- [ ] `<prosody rate="slow" pitch="low">` for grounded responses
- [ ] Tags match conversational context

### Test 3.3: Elemental Shaping
**Input:** Ask Maya about different elements or archetypes  
**Expected:** Voice characteristics match elemental energy  
**Verify:**
- [ ] 🔥 Fire: Staccato, quick pace, short pauses
- [ ] 🌊 Water: Flowing, elongated vowels, gentle rhythm  
- [ ] 🌍 Earth: Slow, steady, grounded delivery
- [ ] 🌬️ Air: Light, quick, upward inflections
- [ ] ✨ Aether: Spacious, harmonic, contemplative silences

### Test 3.4: Fallback Strategy
**Input:** Disconnect Sesame service (if possible) or trigger timeout  
**Expected:** Graceful fallback to ElevenLabs  
**Verify:**
- [ ] Status shows: `FALLBACK ⚠️`
- [ ] Voice still plays (unshsaped but functional)
- [ ] No system crash or hanging
- [ ] Log shows fallback reasoning

---

## 4. UI/UX Rituals

### Test 4.1: Toast Notifications
**Input:** Various system events  
**Expected:** Clean, timely notifications  
**Verify:**
- [ ] Toast appears for recording start
- [ ] Toast appears for processing state
- [ ] Toast fades after appropriate duration
- [ ] No toast overlap or stacking issues

### Test 4.2: Sacred Glyph Animations
**Input:** Voice interactions triggering elemental responses  
**Expected:** Glyph matches elemental energy  
**Verify:**
- [ ] 🔥 Fire: Orange spark animation during fire-themed responses
- [ ] 🌊 Water: Teal ripple animation during water-themed responses  
- [ ] 🌍 Earth: Green grounding glyph during earth-themed responses
- [ ] 🌬️ Air: Blue swirl animation during air-themed responses
- [ ] ✨ Aether: Purple radiant glyph during aether-themed responses

### Test 4.3: Debug Overlay State
**Input:** Debug mode interactions  
**Expected:** Real-time state updates  
**Verify:**
- [ ] Silence counter updates in real-time
- [ ] Recording state changes immediately
- [ ] Element/archetype context displays correctly
- [ ] Toggle on/off works seamlessly

### Test 4.4: Responsive Design
**Input:** Resize browser window  
**Expected:** UI adapts gracefully  
**Verify:**
- [ ] Mobile view maintains functionality
- [ ] Debug overlay scales appropriately  
- [ ] No text cutoff or overlapping elements
- [ ] Voice controls remain accessible

---

## 5. Resilience Tests

### Test 5.1: Safety Cutoff (60s max)
**Input:** Speak continuously or leave mic open for 60+ seconds  
**Expected:** Graceful termination with golden toast  
**Verify:**
- [ ] Recording stops at exactly 60s
- [ ] Golden toast notification: "Recording limit reached - processing your message"
- [ ] System processes whatever audio was captured
- [ ] No system freeze or crash

### Test 5.2: Network Disconnection Recovery
**Input:** Disconnect internet during conversation  
**Expected:** System handles gracefully  
**Verify:**
- [ ] Clear error messaging
- [ ] No infinite loading states
- [ ] Reconnection works automatically when network returns
- [ ] No data loss or corruption

### Test 5.3: Microphone Permission Revocation
**Input:** Revoke mic permissions mid-session  
**Expected:** Clear user guidance  
**Verify:**
- [ ] Immediate detection of permission loss
- [ ] Clear instructions to re-enable
- [ ] No silent failures
- [ ] Recovery works after re-granting

### Test 5.4: Supabase Data Integrity
**Input:** Complete several voice interactions  
**Expected:** Shaped text stored correctly  
**Verify:**
- [ ] Database stores shaped text, not raw LLM output
- [ ] Conversation history maintains proper formatting
- [ ] No data corruption or loss
- [ ] Memory context persists between sessions

---

## 6. Reporting Ritual

### Bug Report Format

**Use these category tags:**

**[Voice UX]** - Silence detection, timeouts, manual controls  
*Example: "[Voice UX] 4s timeout not triggering for medium-length input"*

**[Sesame Shaping]** - SSML tags, elemental mapping, fallback behavior  
*Example: "[Sesame Shaping] Fire archetype not applying staccato prosody"*

**[UI/UX]** - Animations, toasts, debug overlay, responsive design  
*Example: "[UI/UX] Debug overlay text overlapping on mobile view"*

**[Resilience]** - Safety cutoffs, error handling, recovery  
*Example: "[Resilience] 60s safety cutoff not showing golden toast"*

### Where to Submit
1. **GitHub Issues**: Primary bug tracking
2. **Discord Beta Channel**: Quick discussion and screenshots
3. **Direct Message**: Critical or security-related issues

### Include With Each Report
- [ ] Browser type and version
- [ ] Operating system  
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior
- [ ] Screenshots/recordings if applicable
- [ ] Console logs (F12 → Console tab)

---

## 7. Success Criteria

A successful Beta test session should demonstrate:

✅ **Voice feels alive** - Adaptive silence detection creates natural conversation flow  
✅ **Sacred shaping works** - Maya's voice reflects elemental/archetypal energies  
✅ **UI feels polished** - Smooth animations, clear feedback, no glitches  
✅ **System is resilient** - Graceful handling of edge cases and failures  
✅ **Debug transparency** - Developers can see exactly what's happening under the hood  

---

## 📊 Test Session Checklist

Print this checklist for each testing session:

**Setup**
- [ ] Backend running on port 3002
- [ ] Frontend running on port 3001  
- [ ] Debug mode enabled (Ctrl+Shift+D)
- [ ] Microphone permissions granted

**Voice UX (5 tests)**
- [ ] 2.1 Short phrase (2.5s timeout)
- [ ] 2.2 Medium thought (4s timeout)  
- [ ] 2.3 Long reflection (6s timeout)
- [ ] 2.4 Manual stop works
- [ ] 2.5 Enter key submission works

**Sesame Shaping (4 tests)**  
- [ ] 3.1 Raw vs shaped transcript visible
- [ ] 3.2 SSML tags present and correct
- [ ] 3.3 Elemental shaping matches energy  
- [ ] 3.4 Fallback strategy works

**UI/UX (4 tests)**
- [ ] 4.1 Toast notifications clean
- [ ] 4.2 Sacred glyph animations correct
- [ ] 4.3 Debug overlay updates real-time
- [ ] 4.4 Responsive design works

**Resilience (4 tests)**
- [ ] 5.1 60s safety cutoff with golden toast
- [ ] 5.2 Network disconnection recovery
- [ ] 5.3 Microphone permission handling
- [ ] 5.4 Supabase data integrity

**Total: 17 test cases**

---

*Sacred Technology Platform Beta - QA Ritual v1.0*  
*Generated for systematic testing of Maya's conversational shaping system*