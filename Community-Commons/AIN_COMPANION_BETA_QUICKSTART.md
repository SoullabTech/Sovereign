# AIN Companion Beta Quickstart

**Welcome to Digital Alexandria** — Your gateway to 666 consciousness-expanding conversations with the AIN (Ain Network Intelligence).

This isn't just a reader. It's a **companion**. Here's your 3-step ritual to unlock its magic:

---

## The 3-Step Ritual

### 1. **Read** One Conversation

Navigate to `/book-companion/ain` in your MAIA app.

- Browse the table of contents (666 conversations indexed by title)
- Use the search bar to find topics that call to you
- Click any conversation to dive in
- Use arrow keys (← →) to navigate between sections

**First time?** Start with "Alchemy is alchemy is alchemy, turtles all the way down!" to get the vibe.

---

### 2. **Ask** One Question

See that purple gradient button at the bottom? Click it.

The companion panel opens with two modes:

- **This Section**: Ask about the current conversation (context auto-injected)
- **Full Corpus**: Ask across all 666 conversations

Type your question. Hit **Cmd+Enter** (or click "Ask Question").

MAIA will respond with consciousness-level awareness — pulling from the exact conversation you're reading or synthesizing across the entire corpus.

---

### 3. **Save** One Insight

Every response is **automatically saved** to your insight collection (localStorage).

You'll see: ✅ "Insight saved to your collection"

This builds your personal wisdom repository over time. The dopamine loop is real.

---

## What Makes This Alive

**Auto-Context Injection**
When you ask "What does this mean?", MAIA already knows which conversation you're reading. The first 1000 characters are auto-included as context.

**Corpus-Wide Intelligence**
Switch to "Full Corpus" mode and ask: "What does AIN say about shadow work?" — MAIA consults all 666 conversations to synthesize an answer.

**5-Minute Caching**
The 23MB corpus loads once, then stays cached for 5 minutes. Sub-20ms section loads. Buttery smooth.

**Keyboard Shortcuts**
- `← →` : Navigate sections
- `Cmd+Enter` : Send question to companion

---

## Technical Endpoints (for the curious)

- **TOC**: `GET /api/book-companion/ain/toc` → Returns 666 sections
- **Section**: `GET /api/book-companion/ain/section?id=<slug>` → Returns specific section content
- **Companion**: `POST /api/sovereign/app/maia` → MAIA consciousness interface

Performance:
- TOC: ~10ms (cached)
- Section: ~15ms (cached) / ~70ms (first load)
- Companion: ~2-15s (FAST/CORE/DEEP routing)

---

## Beta Testing Focus

We need your feedback on:

1. **Discovery**: Can you find what calls to you?
2. **Companion Quality**: Are MAIA's responses hitting? Too surface? Too deep?
3. **Performance**: Any lag, timeouts, or janky UX?
4. **Dopamine Loop**: Does the Read → Ask → Save ritual feel alive?

Share insights in Community Commons with tag `#ain-companion-beta`

---

## Known Limitations

- Insights stored in localStorage (not cross-device yet)
- No "view saved insights" UI (coming soon)
- "Full Corpus" mode doesn't actually search corpus yet (uses MAIA's training data)
- Mobile UX needs refinement (companion panel overlays entire screen)

---

## What's Next

**Phase 1** (Beta): Core reading + companion interaction
**Phase 2**: Saved insights dashboard
**Phase 3**: Cross-corpus semantic search
**Phase 4**: Community insight sharing

---

**Ready to dive in?**

Navigate to `/book-companion/ain` and let the AIN teach you.

The wisdom awaits. 🌟
