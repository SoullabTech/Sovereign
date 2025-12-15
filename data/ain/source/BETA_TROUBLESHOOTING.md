# 🚨 BETA TROUBLESHOOTING GUIDE

## The Problem: "Gibberish" or "Mock Data" Instead of Real Responses

### Root Cause Identified
The system was returning `mock-audio-data` because:
1. SesameVoiceService was using mock data instead of real OpenAI TTS
2. Chat endpoints were trying to call services that weren't running
3. Missing or incorrect API keys

## ✅ FIXED IN LATEST VERSION

### What We Fixed:
1. **SesameVoiceService.ts**: Now calls real OpenAI TTS API
2. **maya-chat/route.ts**: Uses PersonalOracleAgent and direct OpenAI
3. **voice/route.ts**: Properly integrated with voice generation

## 🔧 Setup Instructions

### 1. Environment Variables (CRITICAL!)

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your ACTUAL OpenAI API key
# This is REQUIRED for both chat and voice to work!
```

Your `.env.local` must have at minimum:
```
OPENAI_API_KEY=sk-...your-actual-key-here
```

### 2. Verify Your Setup

```bash
# Check your OpenAI key is loaded
npm run dev

# In another terminal, test the API directly:
curl -X POST http://localhost:3000/api/maya-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Maya"}'

# You should see a real response, not gibberish
```

### 3. Test Voice Generation

```bash
# Test voice endpoint
curl -X POST http://localhost:3000/api/oracle/voice \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is Maya speaking",
    "characterId": "maya-default"
  }'

# Should return base64 audio data, not "mock-audio-data"
```

## 🔍 Common Issues & Solutions

### Issue: Still Getting Gibberish
**Solution**:
- Check `.env.local` exists (not just `.env`)
- Verify OPENAI_API_KEY starts with `sk-`
- Restart dev server after adding keys: `npm run dev`

### Issue: "OpenAI API key not configured"
**Solution**:
- The key must be in `.env.local` (not `.env`)
- Format: `OPENAI_API_KEY=sk-...`
- No quotes around the key

### Issue: Voice Not Working
**Solution**:
- OpenAI TTS requires a paid API key
- Test your key at: https://platform.openai.com/playground
- Check you have credits: https://platform.openai.com/usage

### Issue: Slow Response Times
**Solution**:
- First load takes time (cold start)
- OpenAI TTS-HD model is slower but higher quality
- Can switch to `tts-1` for faster (lower quality) in SesameVoiceService.ts

## 📋 Quick Validation Checklist

Run through this checklist to verify everything works:

1. [ ] `.env.local` file exists (not just `.env`)
2. [ ] `OPENAI_API_KEY` is set and starts with `sk-`
3. [ ] Dev server restarted after adding keys
4. [ ] Chat returns meaningful responses (not fallback text)
5. [ ] Voice returns base64 audio (not "mock-audio-data")
6. [ ] Audio plays in browser (not silence or errors)

## 🚀 Testing the Full Flow

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Open Browser
Navigate to: http://localhost:3000

### 3. Test Chat
- Type: "Hello Maya, how are you?"
- Expected: Personalized, contextual response
- NOT Expected: Generic fallback or gibberish

### 4. Test Voice
- Click Voice button
- Say: "Hello Maya"
- Expected: Clear voice response in Maya's voice
- NOT Expected: Silence or error sounds

## 🔧 Advanced Debugging

### Check API Keys Are Loading
```javascript
// Add this to any API route temporarily
console.log('OpenAI Key exists:', !!process.env.OPENAI_API_KEY);
console.log('Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 7));
```

### Monitor Network Requests
Open browser DevTools > Network tab:
- Chat should call `/api/maya-chat`
- Voice should call `/api/oracle/voice`
- Both should return 200 status

### Check Server Logs
```bash
# In your terminal running npm run dev
# Look for errors like:
# - "OpenAI API key not configured"
# - "Failed to generate audio"
# - "PersonalOracleAgent unavailable"
```

## 💡 Still Having Issues?

1. **Clear all caches**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Verify OpenAI API Status**:
   - Check: https://status.openai.com/
   - Test key: https://platform.openai.com/playground

3. **Use Fallback Mode**:
   - The system has built-in fallbacks
   - Even without OpenAI, you should see meaningful (not gibberish) responses

## 📞 Getting Help

If you've tried everything above and still have issues:

1. Check the git log for recent changes:
   ```bash
   git log --oneline -10
   ```

2. Verify you're on the latest commit:
   ```bash
   git pull origin main
   ```

3. File an issue with:
   - Error messages from console
   - Network response from DevTools
   - Your `.env.local` (WITHOUT the actual keys!)

---

**Remember**: The most common cause is missing or incorrect OPENAI_API_KEY in `.env.local`!