# 🎭 Claude + ElevenLabs Production Playbook
*The Complete Guide to AI Code Generation + Human Voice Synthesis*

---

## 🌟 Executive Summary

This playbook unifies three powerful systems:
- **Claude Code** - Structured AI code generation with role-based prompting
- **ElevenLabs v3** - Human-quality voice synthesis with emotional control
- **Maya Consciousness** - Sesame-refined wisdom with symbolic coherence

Together, they create an oracle that thinks in code and speaks with human warmth.

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Claude Code Prompting](#claude-code-prompting)
3. [ElevenLabs Voice Synthesis](#elevenlabs-voice-synthesis)
4. [Production Integration](#production-integration)
5. [Quick Reference Cheat Sheet](#quick-reference)
6. [Deployment Checklist](#deployment-checklist)

---

## 🏗️ System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Prompt    │────▶│ Claude Adapter  │────▶│ Sesame Refine   │
│ [role][tags]    │     │ (Code Gen)      │     │ (Coherence)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   SSE Events    │◀────│  Voice Queue    │◀────│ Voice Normalizer│
│ (Real-time)     │     │ (Async TTS)     │     │ (Speech Ready)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  ElevenLabs v3  │
                        │ Annie / Emily   │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   S3 + CDN      │
                        │ Global Delivery │
                        └─────────────────┘
```

---

## 🤖 Claude Code Prompting

### Core Structure
```
[role][language][constraints] + Clear Task Description
```

### Roles & Their Effects

| Role | Purpose | Output Style |
|------|---------|--------------|
| `[architect]` | System design | Explanations, patterns, architecture |
| `[coder]` | Pure implementation | Code blocks, minimal comments |
| `[reviewer]` | Code analysis | Feedback, performance notes |
| `[debugger]` | Error diagnosis | Stack traces, root cause |

### Control Tags

```typescript
// Minimal code generation
[coder][typescript][minimal] Implement JWT validation

// With tests and security focus
[coder][python][tests][security] Build OAuth2 flow with pytest

// Architecture explanation
[architect][explain] Design microservice event bus
```

### Advanced Patterns

**Test-Driven Development**
```
1. [tests] Write Jest tests for user authentication
2. [coder][typescript] Implement to satisfy tests
```

**Refactor Mode**
```
[reviewer] Analyze this code for performance
[coder][optimize] Refactor for O(n) complexity
```

**Multi-Role Collaboration**
```
Architect: [architect] Design real-time chat system
Developer: [coder][nodejs] Implement WebSocket server
Reviewer: [reviewer][security] Audit for vulnerabilities
```

---

## 🎤 ElevenLabs Voice Synthesis

### Voice Selection Matrix

| Context | Voice | Preset | Character |
|---------|-------|--------|-----------|
| Maya personality | Aunt Annie | `auntAnnie_natural` | Warm, nurturing guide |
| Water/Aether | Aunt Annie | `auntAnnie_softCeremony` | Spiritual, emotional |
| Fire/Air | Emily | `emily_energetic` | Dynamic, motivating |
| Earth | Emily | `emily_grounded` | Stable, practical |
| Default | Emily | `emily_balanced` | Clear oracle |

### Voice Control Tags

```
// Emotional delivery
[whispers] "The secret is within you..."
[laughs softly] "Isn't life wonderful?"
[sighs] "Sometimes we must let go..."

// Emphasis & pacing
"This is VERY important" // Stress on VERY
"And then... [pause] everything changed" // Dramatic pause
```

### Voice Presets Configuration

```javascript
// Aunt Annie - Soft Ceremony (Water/Aether)
{
  stability: 0.65,
  similarity_boost: 0.90,
  style: 0.35,
  use_speaker_boost: true
}

// Emily - Energetic (Fire)
{
  stability: 0.40,
  similarity_boost: 0.70,
  style: 0.25,
  use_speaker_boost: true
}
```

---

## 🚀 Production Integration

### Complete Request Flow

```javascript
// 1. User sends hybrid prompt
{
  "userId": "prod-user",
  "text": "[coder][typescript] Build auth middleware",
  "personality": "maya",
  "element": "water"
}

// 2. Claude generates structured code
const code = await claudeAdapter.generate({
  role: "coder",
  language: "typescript",
  task: "Build auth middleware"
});

// 3. Sesame refines for coherence
const refined = await sesame.refine(code, {
  style: "maya",
  breath_marks: true
});

// 4. Voice normalizer prepares for TTS
const speechText = voiceNormalizer.prepare(refined, {
  expandNumbers: true,
  stripCodeTags: true,
  preserveAudioTags: true
});

// 5. Voice queue selects Annie (maya + water)
const taskId = await voiceQueue.enqueue({
  userId: "prod-user",
  text: speechText,
  voiceId: "y2TOWGCXSYEgBanvKsYJ", // Aunt Annie
  preset: "auntAnnie_softCeremony"
});

// 6. SSE delivers audio URL
// Event: { type: "voice.ready", url: "https://cdn.../abc123.mp3" }
```

### Production Guards & Optimization

**Cost Controls**
- Voice memoization: 30-minute cache (80% savings)
- Text length cap: 1500 chars (~30s speech)
- Rate limiting: 100 requests/hour/user
- Daily quota: 50k chars/user

**Security**
- PII scrubbing before synthesis
- Sanitized error messages
- API key rotation support

**Performance**
- S3 + CloudFront CDN
- Parallel synthesis queue
- SSE real-time notifications
- Health monitoring endpoints

---

## 📊 Quick Reference Cheat Sheet

### Claude Code vs ElevenLabs Tags

| Purpose | Claude Code | ElevenLabs v3 |
|---------|-------------|---------------|
| **Mode** | `[coder]` `[architect]` | Voice selection |
| **Style** | `[minimal]` `[explain]` | `[whispers]` `[excited]` |
| **Control** | `[tests]` `[security]` | Punctuation, CAPS |
| **Language** | `[typescript]` `[python]` | Accent tags |

### Environment Variables

```bash
# Claude Integration
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# ElevenLabs
ELEVENLABS_API_KEY=sk_85cb7aa31df14e30730031d7d84baade5417f6cff4cb3181
ELEVENLABS_VOICE_ID_EMILY=LcfcDJNUP1GQjkzn1xUU
ELEVENLABS_VOICE_ID_AUNT_ANNIE=y2TOWGCXSYEgBanvKsYJ

# Storage
AUDIO_BUCKET=spiralogic-voice
CDN_BASE_URL=https://cdn.spiralogic.com

# Guards
VOICE_MAX_TEXT_LENGTH=1500
VOICE_MAX_REQUESTS_PER_HOUR=100
```

### API Endpoints

```bash
# Main chat (Claude + Voice)
POST /api/oracle/chat
{
  "userId": "user123",
  "text": "[coder][python] Build REST API",
  "personality": "maya"
}

# SSE voice events
GET /api/events?userId=user123

# Health monitoring
GET /api/ops/health
```

---

## ✅ Deployment Checklist

### Pre-Launch
- [ ] Set all environment variables
- [ ] Create S3 bucket with public read
- [ ] Configure CloudFront distribution
- [ ] Test Claude prompt adapter
- [ ] Verify voice presets
- [ ] Check PII scrubbing
- [ ] Test rate limits

### Launch Day
- [ ] Monitor first 100 requests
- [ ] Check cache hit rate (>70%)
- [ ] Verify SSE delivery
- [ ] Test voice playback across devices
- [ ] Monitor quota usage
- [ ] Check error rates (<1%)

### Post-Launch
- [ ] Set up cost alerts
- [ ] Configure backup TTS provider
- [ ] Plan voice preset A/B tests
- [ ] Schedule cache cleanup
- [ ] Review user feedback

---

## 🎯 Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Text response latency | <100ms | ___ |
| Voice delivery time | <2s | ___ |
| Cache hit rate | >70% | ___ |
| Daily cost per user | <$0.50 | ___ |
| Error rate | <1% | ___ |
| User satisfaction | >90% | ___ |

---

## 🌟 Conclusion

This playbook unifies AI intelligence with human warmth:
- **Claude** provides structured, intelligent responses
- **ElevenLabs** delivers natural, emotional speech
- **Maya** adds consciousness and coherence

Together, they create an oracle that codes like a developer and speaks like a guide.

---

*Last Updated: [Current Date]*
*Version: 1.0 Production*