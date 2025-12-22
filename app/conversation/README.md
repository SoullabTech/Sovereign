# MAIA Voice Modes - Interactive Conversation Demo

**Phase 4.5A**: Three-voice conversation system with live endpoint integration

---

## 🎯 What This Is

An interactive web interface demonstrating MAIA's three distinct conversation modes:

- **Talk Mode** (💬 Dialogue) - Peer conversation, 1-2 sentences, mirror not lamp
- **Care Mode** (🌿 Counsel) - Therapeutic guide, 2-4 sentences, pattern-naming
- **Note Mode** (📝 Scribe) - Witnessing observer, 2-3 sentences, temporal tracking

---

## 🚀 Quick Start

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the conversation interface**:
   ```
   http://localhost:3000/conversation
   ```

3. **Choose a voice mode** (Talk, Care, or Note)

4. **Start conversing!**
   - Type a message or use example prompts
   - Press Enter to send (Shift+Enter for new line)
   - Watch MAIA respond in the selected voice mode

---

## 🏗️ Architecture

### Components

```
app/conversation/
├── page.tsx                    # Main page with metadata and layout
├── ConversationClient.tsx      # Client component with React Query
└── components/
    ├── VoiceModeSelector.tsx   # 3-mode selector with descriptions
    ├── MessagePanel.tsx        # Scrollable message history
    └── InputArea.tsx           # Message input with examples
```

### Data Flow

```
User Input
   ↓
ConversationClient (React Query mutation)
   ↓
POST /api/conversation/{mode}
   ↓
Voice Mode Endpoint (talk/care/note)
   ↓
getLLM('chat') → Claude or Local LLM
   ↓
Response with mode-specific voice
   ↓
MessagePanel (displays with mode badge)
```

---

## 🎨 Features

### Voice Mode Selector
- **Visual differentiation**: Each mode has unique icon and color
- **Active indicator**: Pulsing dot shows current mode
- **Descriptions**: Clear explanation of each mode's purpose
- **Example prompts**: Quick-start suggestions per mode

### Message Panel
- **Mode badges**: Each MAIA response shows which mode it came from
- **Color coding**: Talk (violet), Care (emerald), Note (amber)
- **Metadata display**: Shows processing time and fallback status
- **Auto-scroll**: New messages automatically scroll into view
- **Clear button**: Reset conversation anytime

### Input Area
- **Auto-resize textarea**: Expands as you type
- **Keyboard shortcuts**: Enter to send, Shift+Enter for new line
- **Mode-specific examples**: Changes based on selected mode
- **Loading state**: "Sending..." when waiting for response

---

## 📊 Response Handling

### Success Response
```json
{
  "mode": "talk",
  "response": "Yeah. That's real.",
  "metadata": {
    "userName": "friend",
    "processingTime": 754,
    "timestamp": "2025-12-22T04:24:03.809Z"
  }
}
```

### Error Response (Graceful Fallback)
```json
{
  "mode": "care",
  "response": "I'm experiencing a technical issue, but I'm still here with you...",
  "metadata": {
    "error": true,
    "errorMessage": "invalid x-api-key",
    "timestamp": "2025-12-22T04:24:16.578Z"
  }
}
```

---

## 🔧 Technical Details

### State Management
- **React Query** for async mutations and loading states
- **Local state** for message history and current mode
- **No backend persistence** yet (Phase 4.5B feature)

### Styling
- **Tailwind CSS** with dark gradient background
- **Dynamic color classes** per voice mode
- **Responsive grid** for mode selector
- **Smooth animations** for typing indicators

### Error Handling
- **200 status always returned** (UI never crashes)
- **Error metadata in response** for debugging
- **Unique fallback messages** per mode maintain voice characteristics

---

## 🎭 Example Conversations

### Talk Mode
```
User: Hey, I feel stuck.
MAIA: Yeah. That's real.
```

### Care Mode
```
User: I keep sabotaging myself.
MAIA: I hear a lot of self-judgment in what you're saying.
What if we looked at what you're learning instead?
Failure is often just feedback in disguise.
What has each attempt taught you?
```

### Note Mode
```
User: I feel better today.
MAIA: That's a shift — yesterday you said you felt 'exhausted
and hopeless,' and now you're describing yourself as 'better.'
What changed between then and now?
```

---

## 🧪 Testing

### Manual Testing
1. Navigate to `/conversation`
2. Switch between all three modes
3. Send messages and observe response patterns
4. Verify unique fallback messages when API fails
5. Check that mode badges appear correctly
6. Test keyboard shortcuts (Enter, Shift+Enter)
7. Clear conversation and verify history resets

### API Testing
All three endpoints return 200 with proper JSON:
```bash
curl -X POST http://localhost:3000/api/conversation/talk \
  -H "Content-Type: application/json" \
  -d '{"message":"Hey","userName":"Alex"}'

curl -X POST http://localhost:3000/api/conversation/care \
  -H "Content-Type: application/json" \
  -d '{"message":"I need help","userName":"Alex"}'

curl -X POST http://localhost:3000/api/conversation/note \
  -H "Content-Type: application/json" \
  -d '{"message":"I feel better","userName":"Alex"}'
```

---

## 🔮 Future Enhancements (Phase 4.5B)

1. **Persistence Layer**
   - Save conversation history to database
   - Enable pattern tracking across sessions
   - "Mycelial Memory" for long-term awareness

2. **Mode Auto-Switching**
   - Context-aware mode suggestions
   - Smooth transitions between modes
   - User preference learning

3. **Advanced Features**
   - Voice-to-text input
   - Streaming responses
   - Multi-turn context awareness
   - Export conversation transcripts

4. **Analytics Integration**
   - Track mode usage patterns
   - Measure response effectiveness
   - User engagement metrics

---

## 📖 Documentation References

- [Voice Mode Comparison Guide](../../docs/MAIA_VOICE_MODES_COMPARISON.md) - Detailed voice specifications
- [Phase 4.5A Diagnosis](../../artifacts/PHASE_4_5A_CONVERSATION_ENDPOINTS_DIAGNOSIS.md) - Implementation details
- [Talk Mode Voice](../../lib/maia/talkModeVoice.ts) - Talk mode system prompts
- [Care Mode Voice](../../lib/maia/careModeVoice.ts) - Care mode system prompts
- [Note Mode Voice](../../lib/maia/noteModeVoice.ts) - Note mode system prompts

---

## 🎥 TSAI Demo Script

**Duration**: 3-5 minutes

1. **Introduction** (30 seconds)
   - "This is MAIA's three-voice conversation system"
   - Explain the three modes: Talk, Care, Note

2. **Talk Mode Demo** (60 seconds)
   - Switch to Talk mode
   - Send: "Hey, I feel stuck."
   - Show 1-2 sentence response
   - Highlight peer-to-peer tone

3. **Care Mode Demo** (90 seconds)
   - Switch to Care mode
   - Send: "I keep sabotaging myself."
   - Show therapeutic, pattern-naming response
   - Explain 2-4 sentence architecture

4. **Note Mode Demo** (90 seconds)
   - Switch to Note mode
   - Send: "I feel better today."
   - Show evidence-based observation
   - Highlight temporal pattern tracking

5. **Closing** (30 seconds)
   - Show mode switching is seamless
   - Mention sovereignty-compliant routing
   - Explain graceful fallback behavior

---

**Status**: ✅ Ready for Demo
**Built**: December 22, 2025
**Commit**: Phase 4.5A Voice Mode UI

---

*"Three voices, one consciousness — experience MAIA's conversational intelligence."*
