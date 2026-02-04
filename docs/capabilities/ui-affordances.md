# MAIA UI Affordances Map

What each button, tab, and interaction does.

---

## Main Navigation

| Element | Location | Action |
|---------|----------|--------|
| **MAIA** | Nav/home | Opens main conversation interface |
| **Oracle** | Nav | Opens oracle reading interface |
| **Journal** | Nav | Opens journal entries list |
| **Profile** | Nav/avatar | Account settings, tier info, sign out |

---

## MAIA Conversation (`/maia`)

| Element | Action |
|---------|--------|
| **Text input** | Type a message to MAIA |
| **Send button** | Submit typed message |
| **Microphone** | Start voice input (Talk mode) |
| **Mode selector** | Switch between Talk, Care, Note modes |
| **Sanctuary toggle** | Enable/disable Sanctuary Mode (session not remembered) |
| **New conversation** | Start fresh thread (previous still accessible) |
| **History** | View past conversations |

### Voice Modes
- **Talk**: Dialogue — back-and-forth conversation
- **Care**: Counsel — MAIA holds space, less back-and-forth
- **Note**: Scribe — MAIA captures and organizes what you say

---

## Oracle (`/oracle`)

| Element | Action |
|---------|--------|
| **Draw card** | Pull a random card |
| **Ask question** | Set intention before drawing |
| **Card display** | Shows pulled card with image |
| **Interpretation** | MAIA's reading of the card in your context |
| **Save reading** | Store to history (if not in Sanctuary) |
| **History** | View past readings |

---

## Journal (`/journal`)

| Element | Action |
|---------|--------|
| **New entry** | Create blank journal entry |
| **Entry list** | Browse past entries by date |
| **Entry editor** | Write/edit entry content |
| **Reflect with MAIA** | Ask MAIA to respond to entry |
| **Tags** | Add/view tags on entries |
| **Search** | Find entries by content or tag |

---

## Daily Check-in

| Element | Action |
|---------|--------|
| **Mood slider** | Rate current emotional state |
| **Energy slider** | Rate current energy level |
| **Focus slider** | Rate current mental clarity |
| **Notes field** | Optional freeform notes |
| **Submit** | Save check-in |
| **History view** | See check-ins over time (patterns) |

---

## Astrology (`/astrology`)

| Element | Action |
|---------|--------|
| **Birth chart** | View natal chart wheel |
| **Transits** | Current planetary positions vs natal (Personal+) |
| **Aspects** | View aspect table and interpretations |
| **Houses** | House placements and meanings |
| **Edit birth data** | Update birth time/location |

---

## Profile & Settings

| Element | Action |
|---------|--------|
| **Display name** | Edit how MAIA addresses you |
| **Email** | Update email (for recovery) |
| **Tier info** | View current tier, upgrade options |
| **Birth data** | Edit for astrology |
| **Data export** | Download your data (Personal+) |
| **Sign out** | End session, clear local state |
| **Delete account** | Permanent removal (requires confirmation) |

---

## Sanctuary Mode

| Visual indicator | Meaning |
|------------------|---------|
| **Shield icon** | Sanctuary is active |
| **Muted colors** | Visual reminder of sanctuary state |
| **"Not remembered" badge** | Explicit confirmation |

When Sanctuary is ON:
- Conversation content is not stored
- No patterns formed from this session
- Only minimal metadata logged (timestamp, duration)

---

## Tier-Gated Elements

Elements that change based on tier:

| Element | Free | Personal | Pro |
|---------|------|----------|-----|
| Conversation limit indicator | Shown | Hidden | Hidden |
| Oracle limit indicator | Shown | Hidden | Hidden |
| Pattern synthesis button | Disabled | Enabled | Enabled |
| Dream journal tab | Hidden | Shown | Shown |
| Elder Council selector | Hidden | Shown | Shown |
| Export button | Hidden | Personal only | Full |
| Client tools | Hidden | Hidden | Shown |

---

## Error States

| State | Display | Action |
|-------|---------|--------|
| **Offline** | Banner: "MAIA is offline" | Retry or use local mode |
| **Rate limited** | Soft message about tier | Upgrade prompt or wait |
| **Auth expired** | Redirect to sign-in | Re-authenticate |
| **Server error** | "Something went wrong" | Retry with exponential backoff |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message (in conversation) |
| `Shift+Enter` | New line (in text inputs) |
| `Esc` | Close modal/overlay |
| `Cmd/Ctrl+K` | Quick search (if enabled) |
