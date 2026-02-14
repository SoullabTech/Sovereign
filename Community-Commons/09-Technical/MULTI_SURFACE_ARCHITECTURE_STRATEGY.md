# Multi-Surface Architecture Strategy: One Codebase, Every Screen

**A Technical Architecture Paper on Shipping iOS, Android, and PWA Without Fragmentation**

**Date**: February 2026
**Status**: Architecture Decision Record
**Principle**: "One codebase. No interstitial gates. Responsive-first from day one."

---

## Abstract

MAIA-SOVEREIGN serves members across phones, tablets, and desktops. This paper defines the strategy for shipping iOS, Android, and PWA from a single codebase without building separate products, without "desktop recommended" warnings, and without degrading the mobile experience. The approach uses capability-aware responsive layouts instead of platform detection, consent-driven native features instead of engagement hooks, and a three-bucket route classification (mobile-first, mobile-okay, desktop-preferred) that makes every route functional on every screen size.

**Key Insight**: The question is never "apps vs. PWA." It's: what experiences are genuinely good on a phone, what experiences are possible but less ideal, and what experiences require desktop affordances? Answer that once, and you can ship all three surfaces without fragmentation.

---

## Table of Contents

1. [The Corrected Principle](#the-corrected-principle)
2. [Architecture Overview](#architecture-overview)
3. [The Three-Bucket Route Classification](#the-three-bucket-route-classification)
4. [Complete Route Map](#complete-route-map)
5. [Mobile Layout System](#mobile-layout-system)
6. [Native Shell Value Proposition](#native-shell-value-proposition)
7. [Offline Strategy](#offline-strategy)
8. [Push Notification Strategy](#push-notification-strategy)
9. [Background Audio](#background-audio)
10. [Implementation Plan](#implementation-plan)
11. [UX Rules Per Bucket](#ux-rules-per-bucket)
12. [Marketing Positioning](#marketing-positioning)

---

## The Corrected Principle

One codebase. Multiple shells. Capability gates inside components, not as stop signs at the route level.

Instead of: *"This is desktop-only, go away politely"*

We do: *"This route renders a mobile layout that is complete enough."*

No "Desktop Recommended" interstitials. No dead ends. No polite confessions dressed as UX. If a route exists, it works at every screen size. The quality varies by bucket, but functionality never breaks.

### Why Not Separate Products

- Separate codebases create feature drift, doubled bugs, and tripled maintenance
- Members don't think in "platforms" -- they think in tasks
- MAIA's companion experience should feel continuous across devices
- The sovereignty principle extends to infrastructure: we control all surfaces

### Why Not Platform Detection

Platform detection (`navigator.platform`, user agent sniffing) is fragile and creates false boundaries. Instead, we use capability detection:

- **Screen size** (viewport width breakpoints)
- **Pointer type** (mouse vs. touch via CSS `pointer: coarse`)
- **Keyboard presence** (virtual vs. physical)
- **Audio capability** (WebAudio API + codec support)
- **Offline availability** (service worker registration status)

The app chooses the right interaction model, not the "right platform."

---

## Architecture Overview

### The Three Surfaces

**1. PWA = the full platform (canonical surface)**

- Best for Studio (multi-column, heavy workflows)
- Best for helpers/admin tools
- Best for content creation and review
- Easiest for deep links, keyboards, multi-tab

**2. iOS/Android apps = "field companion shell"**

Same web app inside Capacitor/WebView, plus a native layer only where it matters:

- Push notifications (consent-driven)
- Microphone + audio playback reliability
- Camera uploads
- Offline caching for capture workflows
- Background audio session handling

The apps CAN access Studio, but it's not why they exist.

**3. Desktop experience = progressive enhancement, not a different app**

- The same routes exist everywhere
- On desktop, layouts expand: split panes, multi-column, sidebar navigation
- On mobile, layouts contract: single column, drawers, list-to-detail patterns

---

## The Three-Bucket Route Classification

Every route in the application falls into one of three buckets based on the nature of the experience, not the platform.

### Bucket A -- Mobile-First

These experiences are genuinely good on a phone. The phone IS the natural device.

**Rules:**
- Single column layout, always
- 44px minimum touch targets
- No hover-only actions
- No split-pane UI
- No tiny icon-only affordances
- Voice controls visible, not hidden in menus
- Fast startup, minimal navigation depth

**Characteristics:** Conversation, voice, capture, practice, onboarding, settings.

### Bucket B -- Mobile-Okay

These work on a phone but have richer desktop UX. No special treatment needed beyond responsive design.

**Rules:**
- Single column on mobile, multi-column on desktop
- Charts support pinch/zoom or horizontal scroll containers
- Lists use filter drawers, not sidebars
- Large tap targets throughout
- Scroll-friendly layouts

**Characteristics:** Dashboards, community feeds, content browsing, insight views.

### Bucket C -- Desktop-Preferred (But Functional on Mobile)

Practitioner/Studio/Admin tools designed for desktop workflows. Work on mobile through a shared layout system. No interstitials. No gates.

**Rules:**
- On mobile: drawer navigation + stacked sections
- Tables become card lists
- Calendars become day view
- Split panes become list-to-detail navigation
- Queues become swipe-action cards

**Characteristics:** Studio command center, case management, communications, analytics.

### Bucket D -- Admin/Dev-Only

Internal tools, debug pages, experimental features. Not gated by interstitials but by auth + role guards.

**Rules:**
- Protected by authentication and role verification
- Render minimal "not available" view on mobile if needed (rare)
- This is an access boundary, not a UX warning

---

## Complete Route Map

### Bucket A -- Mobile-First (~40 routes)

#### Core Companion Experience
| Route | Purpose |
|-------|---------|
| `/maia` | Primary conversation interface (OracleConversation) |
| `/maia/compact` | Compact voice view |
| `/maia/privacy` | Sanctuary mode toggle |
| `/ask-maia` | Quick question interface |
| `/voice` | Voice interface (alt route) |

#### Oracle & Divination
| Route | Purpose |
|-------|---------|
| `/oracle` | Divination hub |
| `/oracle/iching` | I Ching consultation |
| `/oracle/tarot` | Tarot reading |
| `/oracle/runes` | Rune casting |
| `/oracle/yijing` | Yijing consultation |

#### Practice Tools
| Route | Purpose |
|-------|---------|
| `/capture` | Session note capture |
| `/journal` | Journal entry |
| `/labtools/journal` | Journal (lab context) |
| `/labtools/voice` | Voice interface (lab context) |
| `/labtools/beads` | Contemplative beads practice |
| `/labtools/breathwork` | Breathing exercises |
| `/labtools/regulation-minute` | Quick regulation exercise |
| `/labtools/parts-check-in` | IFS-style check-in |

#### Onboarding & Auth
| Route | Purpose |
|-------|---------|
| `/begin` | Journey start (full-screen, single CTA) |
| `/signin` | Returning member sign-in |
| `/test-elemental` | Passkey entry + elemental orientation |
| `/faq` | FAQ section |
| `/onboarding` | Preferences setup |
| `/welcome` | Welcome screen |
| `/welcome-back` | Return welcome |
| `/reset-password` | Password reset |

#### Settings & Account
| Route | Purpose |
|-------|---------|
| `/account/settings` | Account settings |
| `/account/security` | Security settings |
| `/settings` | General settings |

#### Astrology (Basic)
| Route | Purpose |
|-------|---------|
| `/astrology` | Astrology hub |
| `/birth-chart` | Birth chart display |
| `/chart` | Chart viewer |

#### Static Pages
| Route | Purpose |
|-------|---------|
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### Bucket B -- Mobile-Okay (~55 routes)

#### Dashboards & Insights
| Route | Purpose |
|-------|---------|
| `/dashboard` | Consciousness stats overview |
| `/dashboard/dreams` | Dream tracking |
| `/dashboard/reflections` | Reflection history |
| `/dashboard/evolution` | Evolution timeline |
| `/dashboard/shadow` | Shadow work tracking |
| `/dashboard/astrology` | Astrological insights |
| `/dashboard/relationships` | Relationship patterns |
| `/dashboard/overview` | Summary view |
| `/dashboard/help` | Help & guidance |

#### Community
| Route | Purpose |
|-------|---------|
| `/community` | Community hub |
| `/maia/community/*` | Community within MAIA context |
| `/community/chat` | Community chat |
| `/community/library` | Content library |
| `/community/events` | Community events |
| `/community/share` | Sharing interface |
| `/commons/circles` | Circle browser |
| `/commons/circles/[circleId]` | Circle detail |

#### Consciousness Tools
| Route | Purpose |
|-------|---------|
| `/consciousness/dashboard` | Consciousness overview |
| `/consciousness/meditation` | Meditation (nearly Bucket A) |
| `/consciousness/portals` | Portal browser |

#### Advanced Astrology
| Route | Purpose |
|-------|---------|
| `/astrology/synastry` | Synastry analysis |
| `/astrology/vedic` | Vedic astrology |
| `/astrology/chinese` | Chinese astrology |
| `/astrology/mayan` | Mayan astrology |

#### Lab Tools (Browse)
| Route | Purpose |
|-------|---------|
| `/labtools` | Tools grid hub |
| `/labtools/reflections` | Reflection browser |
| `/labtools/discover` | Tool discovery |
| `/labtools/guides` | Guide library |
| `/labtools/wisdom` | Wisdom collection |
| `/labtools/favorites` | Saved favorites |
| `/labtools/books` | Book companions |
| `/labtools/profile` | Member profile |

#### Other
| Route | Purpose |
|-------|---------|
| `/evolution` | Evolution tracking |
| `/patterns` | Pattern detection |
| `/sessions` | Session history |
| `/portal/[slug]` | Practitioner portal |
| `/portals` | Portal directory |
| `/helper-fund/*` | Contribution flow |
| `/library` | Library browser |
| `/maia/guide` | Guide view |
| `/maia/mandala` | Mandala visualization |
| `/maia/library` | Library within MAIA |

### Bucket C -- Desktop-Preferred, Mobile-Functional (~80 routes)

#### Studio (~35 routes)
| Route | Purpose | Mobile Layout |
|-------|---------|---------------|
| `/studio` | Dashboard (triage, tasks, log) | Stacked cards, tabbed sections |
| `/studio/comms` | Communications queue | Single-column inbox |
| `/studio/caseload` | Case management | List to full-screen detail |
| `/studio/clients` | Client list | List to full-screen detail |
| `/studio/clients/[id]` | Client detail | Full-screen |
| `/studio/sessions/*` | Session management | List to detail |
| `/studio/groups/*` | Group management | List to detail |
| `/studio/calendar` | Calendar | Day view (not week grid) |
| `/studio/marketing/*` | Marketing tools | Tabbed sections, stacked |
| `/studio/decisions/*` | Decision tracking | List to detail |
| `/studio/changes/*` | Change tracking | List to detail |
| `/studio/metrics` | Analytics | Stacked charts, horizontal scroll for tables |
| `/studio/tasks` | Task management | List with swipe actions |
| `/studio/review` | Review queue | Swipe-to-action cards |
| `/studio/triage` | Triage queue | Swipe-to-action cards |
| `/studio/vault` | Document vault | List to detail |
| `/studio/media` | Media management | Grid to detail |
| `/studio/scribe` | Scribe tool | Single column |
| `/studio/tools` | Tools overview | Grid |

#### Stellium (~10 routes)
| Route | Purpose | Mobile Layout |
|-------|---------|---------------|
| `/stellium` | Practitioner dashboard | Card stack |
| `/stellium/comms` | Communications | Inbox pattern |
| `/stellium/clients` | Client management | List to detail |
| `/stellium/sessions` | Session management | List to detail |
| `/stellium/marketing/*` | Marketing suite | Tabbed sections |
| `/stellium/messages` | Messaging | Chat list |

#### Practitioner (~15 routes)
| Route | Purpose | Mobile Layout |
|-------|---------|---------------|
| `/practitioner/dashboard` | Stewardship dashboard | Stacked commitment cards |
| `/practitioner/sessions/*` | Session management | List to detail |
| `/practitioner/containers/*` | Container management | List to detail |
| `/practitioner/labtools/*` | Practitioner tools | Grid to list |
| `/practitioner/billing` | Billing | Form + list |
| `/practitioner/agreements` | Agreements | List to detail |

#### Admin (~5 routes)
| Route | Purpose | Mobile Layout |
|-------|---------|---------------|
| `/admin` | Admin dashboard | Stacked panels |
| `/admin/beta-testers` | User management | Table to card list |
| `/admin/consciousness-analytics` | Analytics | Stacked charts |

#### Other Desktop Tools
| Route | Purpose | Mobile Layout |
|-------|---------|---------------|
| `/dashboard/metrics` | Operational metrics | Stacked charts |
| `/dashboard/ops` | Ops dashboard | Stacked charts |
| `/model-studio/*` | Model studio (~9 routes) | Same patterns as Studio |
| `/supervision` | Supervision tools | List to detail |

### Bucket D -- Admin/Dev/Experimental (~35 routes)

These are excluded from the Capacitor build and are web-only.

| Route | Status |
|-------|--------|
| `/demo/*` | Demo/test pages |
| `/chat-test`, `/enhanced-chat-test`, `/test-sage`, `/test` | Development test pages |
| `/ain-demo`, `/ain-evolution` | Experimental |
| `/consciousness-computing/*` | Research prototype |
| `/consciousness-lab`, `/consciousness-monitor`, `/consciousness-insights` | Experimental |
| `/consciousness/omnidimensional-test` | Test |
| `/beta-access`, `/beta-onboarding`, `/beta-welcome` | Legacy onboarding |
| `/book-companion/*`, `/book/*` | Book companion (unclear status) |
| `/debug/*` | Debug tools |
| `/public-demo`, `/simple`, `/enter`, `/intro`, `/journey`, `/soul-gateway` | Various legacy entry points |
| `/powered-by`, `/pitch`, `/downloads` | Marketing/static |
| `/research/*` | Research tools |
| `/labtools/admin/*` | Admin lab tools |

---

## Mobile Layout System

### The StudioMobileShell Pattern

Rather than fixing 80 Studio/Practitioner routes individually, we create one shared layout primitive that all Bucket C routes inherit.

**Components:**
- Top header with context (current section name, back navigation)
- Drawer navigation (Studio sections, accessible via hamburger icon)
- Content area with "list view" and "detail view" routing
- Optional bottom tab bar for the 4 highest-frequency items

**Bottom Tab Bar (Studio on mobile):**
1. Comms (inbox)
2. Caseload (clients)
3. Tasks (to-do)
4. Calendar (schedule)

**Layout Rules:**
- Split panes become list-to-detail navigation
- Tables become card lists with key info visible
- Sidebars become drawers
- Multi-column grids become single-column stacks
- Week calendar views become day views

### The List-to-Detail Pattern

This is the core mobile pattern for all Bucket C routes:

**Desktop:** Split pane -- list on left, detail on right. Clicking a list item updates the right panel.

**Mobile:** List fills the screen. Tapping an item navigates to a full-screen detail view. Back button returns to list. No split pane rendered.

This pattern applies to:
- `/studio/comms` (message list to message detail)
- `/studio/caseload` (client list to client profile)
- `/studio/sessions` (session list to session detail)
- `/studio/clients` (client list to client record)
- All Stellium and Practitioner equivalents

---

## Native Shell Value Proposition

### What the Native App Adds (and Why)

The iOS/Android Capacitor shell provides exactly three capabilities that the PWA cannot reliably deliver:

#### 1. Background Audio Session Control

The primary reason for the native shell. On iOS:
- Audio continues when the screen is locked or the app is backgrounded
- Lock screen controls (play/pause/skip) work
- Interruptions are handled gracefully (phone calls, Siri, Maps)
- Audio route changes work (AirPods connect/disconnect)

**Implementation:** iOS Audio Session configuration for playback category, using either a native audio player plugin or properly configured WKWebView audio settings. URL-based audio streams are more reliable than blob URLs in WebView.

#### 2. Push Notifications (Consent-Driven)

Not for engagement. Not for retention. Only for member-governed events.

See: Push Notification Strategy section below.

#### 3. Offline Capture Queue

The ability to capture journal entries, voice notes, and draft messages without network connectivity, with reliable sync when connection returns.

See: Offline Strategy section below.

### What the Native App Does NOT Add

- No exclusive features. Everything works in the PWA.
- No platform-gated content or capabilities.
- No engagement hooks, streak counters, or "come back" nudges.
- Studio is accessible in the app but is not the reason the app exists.

---

## Offline Strategy

### Principle

You don't need offline conversation to ship native apps. You DO need offline capture.

### Offline: YES (Phase 1)

- **Journal capture** -- text + attachments stored locally, synced later
- **Voice note capture** -- recorded and stored locally, uploaded when connected
- **Draft messages** -- queued for later send
- **Recent artifacts** -- cached list + last-opened detail view

### Offline: MAYBE (Phase 2)

- **TTS audio replay** -- previously generated audio stored locally after first playback
- **Cached threads** -- last N messages from recent conversations

### Offline: NO (Phase 1)

- **Claude/LLM conversation** -- requires API connectivity (local model is a separate initiative)

### The Critical Edge Case: Signal Loss Mid-Conversation

When network drops during an active conversation:

1. The UI does NOT lose the member's message
2. The message is marked as **Queued**
3. Retry happens automatically when network returns
4. Member can cancel the queued send
5. No false "delivered" confirmation

This is a sovereignty win: the system does not pretend it delivered something it didn't.

### Implementation Spine

A `pending_outbox` store in IndexedDB (or SQLite via Capacitor plugin):

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `created_at` | ISO datetime | When captured |
| `kind` | enum | journal, message, upload, voice_note |
| `payload` | JSON | Content to sync |
| `attempts` | integer | Retry count |
| `last_error` | string | Last failure reason |
| `status` | enum | pending, syncing, synced, failed |

**Sync behavior:**
- Background retry with exponential backoff
- Member can manually "Send now" or "Delete"
- Visual indicator shows pending items count
- On successful sync, item removed from outbox

---

## Push Notification Strategy

### Principle

MAIA does not ping for engagement. Notifications are member-governed, consent-first, and minimal.

### Default State

**Everything OFF** except account security alerts.

### Available Opt-Ins (Explicit Toggles)

| Notification Type | Description | Default |
|-------------------|-------------|---------|
| **Ritual Reminders** | "Remind me of rituals I scheduled" -- self-created only | OFF |
| **Direct Messages** | "Notify me when a facilitator or circle member messages me directly" | OFF |
| **Upload Complete** | "Notify me when an upload finishes processing" | OFF |
| **Security Alerts** | Account security events (password changes, new device sign-in) | ON |

### What We Never Send

- "We miss you" re-engagement nudges
- "Daily streak" gamification
- "New content available" marketing
- "Someone liked your post" social validation hooks
- Any notification designed to pull the member back for the system's benefit

### Additional Controls

- **Quiet hours**: Member sets "do not disturb" window
- **Per-channel control**: Each notification type toggleable independently
- **One-tap disable all**: Single toggle to silence everything except security

---

## Background Audio

### Why This Matters

Background audio is the primary technical reason for the native Capacitor shell. Without it, voice-forward experiences break when the member locks their phone or switches apps.

### Requirements

| Capability | Description |
|------------|-------------|
| **Background playback** | Audio continues with screen locked or app backgrounded |
| **Lock screen controls** | Play/pause/skip visible on lock screen |
| **Interruption handling** | Graceful pause/resume for phone calls, Siri, Maps audio |
| **Audio route changes** | Handles AirPods connect/disconnect, speaker switching |
| **Codec reliability** | Consistent playback across audio formats |

### Implementation Notes

For Capacitor on iOS:
- Configure `AVAudioSession` with `.playback` category
- Use a native audio player plugin or ensure WKWebView audio settings allow background playback
- URL-based audio streams are more reliable than blob URLs in WKWebView
- Test with: screen lock during playback, incoming call during playback, AirPods removal during playback

The existing voice architecture is well-suited for this:
- Conductor logic is server-side (portable across all surfaces)
- Voice preferences are stored in PostgreSQL (portable)
- TTS preview is the only mobile-sensitive piece (audio handling)

No voice logic needs to be split by platform. Only the audio playback layer needs native enhancement.

---

## Implementation Plan

### Phase 1 -- Studio Mobile Layout System (One-Time Foundation)

Create the `StudioMobileShell` layout primitive:
- Top header with section context
- Drawer navigation for Studio sections
- List view and detail view routing pattern
- Optional bottom tab bar (Comms, Caseload, Tasks, Calendar)

Once this exists, every Bucket C route wraps in it and gets 70% mobile usability immediately.

**Priority Studio routes (mobile must be solid first):**
1. `/studio/comms` -- communications queue
2. `/studio/caseload` + `/studio/clients/[id]` -- case management with client detail
3. `/studio/tasks` -- task management
4. `/studio/calendar` -- day view on mobile
5. `/studio/review` + `/studio/triage` -- review and triage queues

Everything else can be "works, but not optimized."

### Phase 2 -- Replace Split Panes with List-to-Detail

The main responsive pattern:
- **Desktop:** Split pane (list left, detail right)
- **Mobile:** List view navigates to full-screen detail view

No warnings. No gates. Just a different layout at a different viewport width.

Apply to: Comms, Caseload, Clients, Sessions, Groups, Decisions, Changes.

### Phase 3 -- Native Shell Value (Capacitor Enhancements)

Ship the three real reasons for native apps:

1. **Background audio session control** -- AVAudioSession configuration, lock screen controls
2. **Push notifications** -- consent-driven, member-governed toggles
3. **Offline capture queue** -- IndexedDB/SQLite outbox with background sync

This is the mobile app's value proposition. Not Studio.

### Phase 4 -- Route Cleanup

Address the ~35 Bucket D routes:
- Exclude from Capacitor build via `capacitor-patch-routes.sh`
- Evaluate for removal from codebase (legacy, experimental, superseded)
- Consolidate duplicate route groups (community, labtools, stellium/studio/model-studio overlap)

---

## UX Rules Per Bucket

### Bucket A Rules (Mobile-First)

| Rule | Specification |
|------|---------------|
| Layout | Single column, always |
| Touch targets | 44px minimum (Apple HIG) |
| Hover states | None. All actions accessible without hover. |
| Split panes | Never. |
| Icon-only buttons | Never without label or tooltip accessible by touch. |
| Voice controls | Visible in primary UI, not buried in menus. |
| Startup time | Fast. Minimal navigation depth to reach primary action. |
| Typography | 16px minimum body text (prevents iOS zoom on focus). |

### Bucket B Rules (Mobile-Okay)

| Rule | Specification |
|------|---------------|
| Layout | Single column on mobile, multi-column on desktop |
| Charts | Pinch/zoom support OR horizontal scroll container |
| Filters | Drawer (slide-in from edge), not persistent sidebar |
| Lists | Generous row height, clear tap areas |
| Images | Lazy loaded, aspect-ratio preserved |
| Navigation | Breadcrumb or back arrow, not sidebar context |

### Bucket C Rules (Desktop-Preferred, Mobile-Functional)

| Rule | Specification |
|------|---------------|
| Navigation | Drawer nav (hamburger menu), not persistent sidebar |
| Tables | Card list on mobile. Horizontal scroll only as last resort. |
| Calendars | Day view on mobile. Week/month views desktop-only. |
| Split panes | List-to-detail navigation on mobile. |
| Queues/Inboxes | Swipe-to-action cards on mobile. |
| Forms | Full-width inputs, stacked fields, sticky submit buttons. |
| Modals | Full-screen sheets on mobile, centered modals on desktop. |

---

## Marketing Positioning

Ship the same code, but set different expectations:

| Surface | Positioning | Lead Experience |
|---------|------------|-----------------|
| **PWA** | "Full MAIA + Studio" | Complete platform, all capabilities |
| **iOS/Android** | "MAIA Companion" | Voice, capture, offline, notifications |
| **Desktop browser** | "MAIA Studio" | Practitioner workspace, admin tools |

Studio is accessible in the mobile apps, but it's not the reason they exist. This keeps expectations realistic and reduces support burden.

---

## Route Duplication Note

The current codebase has overlapping route groups that should be consolidated over time:

- `/community/*` and `/maia/community/*` -- duplicate community surfaces
- `/labtools/*` and `/practitioner/labtools/*` -- overlapping tool sets
- `/stellium/*`, `/studio/*`, and `/model-studio/*` -- three practitioner surfaces

This isn't blocking for the multi-surface strategy, but maintaining three practitioner surface variants across three device surfaces compounds the maintenance burden. Consolidation reduces the total route count and simplifies the mobile layout work.

---

## Conclusion

The multi-surface strategy for MAIA-SOVEREIGN is not "apps vs. PWA." It's one product with:

- **Mobile-first journeys** (Bucket A) -- the companion experience IS the phone
- **Desktop-preferred workflows** (Bucket C) -- Studio IS the desk
- **Smart layout shifts** (all buckets) -- every route works at every size
- **Native shell value** (iOS/Android) -- background audio, push notifications, offline capture

No separate products. No interstitial gates. No "Desktop Recommended" warnings. Just capability-aware responsive design, applied consistently from day one.

The trick is not separate products. It's one product with the discipline to make every route responsive before it ships.

---

*This paper documents an architecture decision for the MAIA-SOVEREIGN project. It reflects the current state of planning as of February 2026 and will be updated as implementation progresses.*
