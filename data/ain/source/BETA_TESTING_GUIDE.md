# 🧪 Beta Testing Guide

## 🚀 Quick Start - Running the System

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Start the backend with automatic port detection
./scripts/start-beta-bulletproof.sh

# The backend will find an available port (3002-3005+)
# Watch for: "✅ Backend is running on port XXXX"
```

### 2. Frontend Setup (New Terminal)

```bash
# Navigate to project root
cd /Volumes/T7\ Shield/Projects/SpiralogicOracleSystem

# Install dependencies (if not done)
npm install

# Start the frontend
npm run dev

# Frontend will run on http://localhost:3000
```

### 3. Voice Service (Optional - New Terminal)

```bash
# If Sesame CSM isn't running, use the mock service
cd backend
./scripts/setup-csm-clean.sh

# This starts a mock voice service on port 8000
```

## 📋 Testing Checklist

### 1. Initial Access
- [ ] Open http://localhost:3000
- [ ] Verify the app loads without errors
- [ ] Check browser console for any errors

### 2. Onboarding Flow Test
- [ ] Click through the 6-step onboarding
- [ ] Test "Skip setup" option
- [ ] Verify profile saves to localStorage
- [ ] Complete full onboarding:
  - Enter name
  - Select spiritual paths
  - Choose challenge areas
  - Select guidance types
  - Pick elemental agents
  - Set experience level & intentions

### 3. Oracle Chat Test
- [ ] Send a text message to Maya
- [ ] Verify streaming response appears
- [ ] Test element switching (air, fire, water, earth, aether)
- [ ] Check response quality for each element

### 4. Voice Features Test
- [ ] Click microphone button
- [ ] Allow microphone permissions
- [ ] Speak a question
- [ ] Verify auto-stop after silence
- [ ] Test voice response playback
- [ ] Toggle auto-speak on/off
- [ ] Use Space key shortcut for voice

### 5. Journaling Test
- [ ] Navigate to Journal tab
- [ ] Create a new journal entry
- [ ] View saved entries
- [ ] Delete an entry
- [ ] Test with mood/tags

### 6. File Upload Test
- [ ] Test uploading:
  - [ ] PDF file
  - [ ] Text file
  - [ ] Image (JPG/PNG)
  - [ ] Audio file (if applicable)
- [ ] Verify file appears in list
- [ ] Check file size limit (10MB)
- [ ] Delete uploaded file

### 7. Authentication Test (If Enabled)
- [ ] Sign up with email/password
- [ ] Sign out
- [ ] Sign in
- [ ] Test magic link (if email configured)
- [ ] Update profile

### 8. UI/UX Test
- [ ] Verify Tesla-like dark theme
- [ ] Check responsive design:
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)
- [ ] Test all animations
- [ ] Verify loading states
- [ ] Check error states

### 9. Performance Test
- [ ] Long conversation (20+ messages)
- [ ] Multiple file uploads
- [ ] Quick element switching
- [ ] Rapid voice inputs

## 🛠️ Test Commands

### Backend Health Check
```bash
curl http://localhost:3002/health
# Should return: {"status":"ok","timestamp":"..."}
```

### API Endpoints Test
```bash
# Test Oracle chat
curl -X POST http://localhost:3002/api/v1/oracle/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Maya","element":"water","userId":"test-user"}'

# Test Journal
curl http://localhost:3002/api/v1/journal?userId=test-user

# Test Voice Health
curl http://localhost:3002/api/v1/voice/health
```

### Frontend Build Test
```bash
npm run build
# Should complete without errors
```

## 🐛 Common Issues & Solutions

### 1. Port Already in Use
```bash
# The backend auto-detects ports, but if needed:
PORT=3005 npm run dev:backend
```

### 2. CORS Errors
- Check backend is running
- Verify BACKEND_URL in frontend env

### 3. Voice Not Working
- Check browser permissions
- Try different browser (Chrome recommended)
- Verify Sesame/mock service is running

### 4. Database Connection Issues
- Check Supabase credentials in .env
- Verify internet connection
- Check Supabase dashboard status

## 📊 Test Scenarios

### Scenario 1: New User Journey
1. Land on home page
2. Complete onboarding
3. Ask Maya about life purpose
4. Switch to Fire element
5. Journal about the insight
6. Upload a relevant document

### Scenario 2: Power User Flow
1. Skip onboarding
2. Rapid-fire questions to Maya
3. Test all elements quickly
4. Use voice exclusively
5. Create multiple journal entries
6. Upload various file types

### Scenario 3: Mobile Experience
1. Access on phone
2. Test touch interactions
3. Use voice input
4. Check responsive layouts
5. Test in portrait/landscape

## 🎯 Success Criteria

✅ **Core Functions Work**
- Chat responses stream smoothly
- Voice input/output functions
- Data persists between sessions
- No console errors

✅ **Performance Acceptable**
- Page loads < 3 seconds
- Chat responses start < 1 second
- Voice recognition responsive
- No memory leaks

✅ **UX is Smooth**
- Intuitive navigation
- Clear feedback
- Smooth animations
- Error recovery

## 📝 Bug Reporting Template

```markdown
**Issue**: [Brief description]
**Steps to Reproduce**:
1. 
2. 
**Expected**: 
**Actual**: 
**Browser/Device**: 
**Console Errors**: 
```

## 🚦 Ready to Test!

Start with the Quick Start steps above and work through the testing checklist. The system should be fully functional for beta testing!