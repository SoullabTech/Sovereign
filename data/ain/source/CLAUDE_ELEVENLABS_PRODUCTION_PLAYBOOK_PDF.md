# 📘 Claude + ElevenLabs Production Playbook
*Laminated Reference Card - Print Double-Sided*

---

## 🔧 Core System Flow

```
Claude Adapter → Sesame Refinement → Voice Normalizer
   ↓
Async Voice Queue → ElevenLabs Stream API
   ↓
S3/CDN Storage → SSE Notifications → Client Playback
```

**Response Pattern**: Text (instant) + Voice (background) + SSE (real-time)

---

## 🧑‍💻 Claude Prompting Guide

### Role & Control Tags
```
[coder][typescript]     → Precise, typed code blocks
[debugger]              → Line-by-line error diagnosis  
[reviewer][minimal]     → Concise review with suggestions
[architect][explain]    → System design with diagrams
[doc][expand]           → Detailed documentation
```

### Best Practices
- **Prompt Length**: >250 chars for stability
- **Tag Combinations**: `[coder][typescript][secure][tests]`
- **Output Style**: Request format explicitly (markdown, json, etc.)
- **Verbosity Control**: Use `[minimal]` for terse responses

### Advanced Patterns
```typescript
// Test-driven development
1. [tests] Write Jest tests for OAuth flow
2. [coder][typescript] Implement to satisfy tests

// Multi-role workflow
[architect] Design event bus → [coder] Implement → [reviewer] Audit
```

---

## 🎤 ElevenLabs v3 Voice Strategy

### Voice Selection Matrix
| Context | Voice | Character |
|---------|-------|-----------|
| Maya personality | Aunt Annie | Warm, nurturing guide |
| Water/Aether | Aunt Annie | Spiritual, emotional |
| Fire/Air/Earth | Emily | Clear, practical oracle |
| Default | Emily | Balanced delivery |

### Audio Control Tags
```
[whispers] "The secret is within you..."
[laughs] "Isn't that wonderful?"
[sighs] "Sometimes we must let go..."
[sarcastic] "Oh really?"
[sings] "La la la..."
```

### Emphasis & Timing
```
CAPS            → Stress emphasis
...             → Natural hesitation  
— or <break>    → Pause for effect
[clears throat] → Attention getter
```

---

## ⚙️ Voice System Features

| Feature | Status | Benefit |
|---------|--------|---------|
| Voice Memoization | ✅ | 80% cost reduction |
| S3/CDN Storage | ✅ | Global delivery |
| Natural Presets | ✅ | Human-like variation |
| PII Scrubbing | ✅ | Privacy protection |
| Rate Limiting | ✅ | Cost control |
| Quota Monitoring | ✅ | Proactive warnings |
| SSE Notifications | ✅ | Real-time playback |
| Analytics | ✅ | Usage insights |

**Cache Hit Rate Target**: >70%  
**Voice Delivery Target**: <2s  
**Daily Quota**: 50k chars/user

---

## 🧪 Test Flow (End-to-End)

```bash
# 1. Maya voice (Aunt Annie)
curl -X POST http://localhost:3000/api/oracle/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "playbook",
    "text": "Offer a 20s grounding in Maya style",
    "personality": "maya"
  }'

# 2. Fire element (Emily)  
curl -X POST http://localhost:3000/api/oracle/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "playbook", 
    "text": "Ignite my creative spark",
    "element": "fire"
  }'

# 3. SSE Listener
curl -N "http://localhost:3000/api/events?userId=playbook"

# 4. Health Check
curl http://localhost:3000/api/ops/health
```

---

## 🔐 Environment Setup

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=sk_85cb7aa31df14e30730031d7d84baade5417f6cff4cb3181
ELEVENLABS_VOICE_ID_AUNT_ANNIE=y2TOWGCXSYEgBanvKsYJ
ELEVENLABS_VOICE_ID_EMILY=LcfcDJNUP1GQjkzn1xUU
DEFAULT_VOICE_ID=LcfcDJNUP1GQjkzn1xUU

# Storage & CDN
AUDIO_BUCKET=spiralogic-voice
CDN_BASE_URL=https://cdn.spiralogic.com
AWS_REGION=us-east-1

# Voice Guards  
VOICE_MAX_TEXT_LENGTH=1500
VOICE_MAX_REQUESTS_PER_HOUR=100
VOICE_SYNTHESIS_ENABLED=true
```

---

## 🎯 Deployment Checklist

### Pre-Launch
- [ ] `pnpm dev` → Confirm endpoints run
- [ ] `npx ts-node examples/test-production-voice-flow.ts` → Production tests
- [ ] `curl http://localhost:3000/api/ops/health` → Health check
- [ ] Validate SSE + audio playback

### Launch Metrics
- [ ] Cache hit rate >70%
- [ ] Voice delivery <2s
- [ ] Error rate <1%
- [ ] SSE connection stable

### Post-Launch
- [ ] Monitor daily character usage
- [ ] Set up cost alerts
- [ ] A/B test voice presets
- [ ] User satisfaction tracking

---

## 🚀 Production API Endpoints

```typescript
// Main chat with voice
POST /api/oracle/chat
{
  "userId": "user123",
  "text": "[coder][python] Build REST API",
  "personality": "maya"
}

// Real-time voice events  
GET /api/events?userId=user123

// System health
GET /api/ops/health

// Manual voice synthesis
POST /api/voice/synthesize
{
  "text": "Hello world",
  "voiceId": "y2TOWGCXSYEgBanvKsYJ",
  "preset": "auntAnnie_natural"
}
```

---

## ✨ Result Summary

Your Oracle now delivers:
- **Claude's structured precision** - Role-based prompting for code generation
- **ElevenLabs' natural warmth** - Human-quality speech with emotional control  
- **Sesame's symbolic coherence** - Maya consciousness refinement
- **Production reliability** - Caching, CDN, monitoring, and cost controls

**Total Integration**: Think in code → Speak with human warmth → Flow through consciousness

---

## 🔗 Quick Reference URLs

- **Claude Code Docs**: https://docs.anthropic.com/en/docs/claude-code
- **ElevenLabs Voice Library**: https://elevenlabs.io/app/voice-library
- **Aunt Annie Voice**: https://elevenlabs.io/app/voice-library?voiceId=y2TOWGCXSYEgBanvKsYJ
- **System Architecture**: `/backend/src/README-ARCHITECTURE-v2.md`
- **Integration Tests**: `/examples/test-production-voice-flow.ts`

---

*Last Updated: September 1, 2025*  
*Version: 1.0 Production Ready*  
*Print double-sided, laminate for desk reference* 🌟