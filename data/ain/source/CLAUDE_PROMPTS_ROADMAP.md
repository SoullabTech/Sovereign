# 🌸 Claude Code Prompt Series: Holoflower Roadmap Implementation

Complete prompt series for implementing the Sacred Technology roadmap features.

---

## 📊 Phase 1: Session Persistence (Week 1-2)

### Step 1.1 — Supabase Schema Creation

```prompt
Create Supabase migration for session persistence:

Tables needed:
1. holoflower_sessions
   - id (uuid, primary key)
   - user_id (uuid, references auth.users)
   - created_at (timestamp)
   - coherence_score (float)
   - shadow_integration (float)
   - aether_resonance (float)
   - session_data (jsonb) - full petal states
   - metadata (jsonb) - device, location, moon phase

2. petal_snapshots
   - id (uuid)
   - session_id (uuid, references holoflower_sessions)
   - timestamp (timestamp)
   - petal_states (jsonb) - all 12 petals with intensities
   - shadow_petals (jsonb) - shadow aspects
   - aether_field (jsonb) - transcendent state

3. coherence_timeline
   - id (uuid)
   - user_id (uuid)
   - timestamp (timestamp)
   - coherence_score (float)
   - dominant_element (text)
   - session_type (text) - ritual/conversation/document

Create migration file: supabase/migrations/001_holoflower_persistence.sql
Include RLS policies for user data isolation.
```

### Step 1.2 — Session Save API

```prompt
Create API endpoint for saving Holoflower sessions:

File: app/api/holoflower/sessions/route.ts

Requirements:
- POST endpoint to save current session
- Capture full petal states, shadow integration, Aether resonance
- Calculate coherence score from petal harmony
- Store device fingerprint for performance tracking
- Return session ID for future retrieval

Include:
- Supabase client initialization
- User authentication check
- Data validation with Zod schema
- Error handling for network issues
- Response with session URL for sharing
```

### Step 1.3 — Timeline Component

```prompt
Create Timeline visualization component:

File: components/holoflower/Timeline.tsx

Features:
- Display user's coherence journey over time
- Line chart showing coherence scores
- Colored dots for dominant elements
- Click to load previous session states
- Export data as CSV for personal tracking

Use:
- Recharts for visualization
- Framer Motion for entry animations
- Date formatting with Intl.DateTimeFormat
- Responsive design for mobile/desktop
```

---

## 📄 Phase 2: Document Upload (Week 2-3)

### Step 2.1 — Upload Interface

```prompt
Create document upload component with drag-and-drop:

File: components/sacred-library/DocumentUpload.tsx

Features:
- Drag & drop zone with sacred geometry border animation
- Support PDF, TXT, MD, DOCX formats
- File size limit: 10MB
- Progress indicator with Holoflower spinner
- Queue multiple files for batch processing

Visual design:
- Dashed border that glows on hover
- Sacred gold (#c9b037) accent colors
- "Drop your wisdom here" placeholder text
- File preview cards with type icons
```

### Step 2.2 — Claude Analysis Pipeline

```prompt
Create document analysis pipeline using Claude:

File: lib/document-analysis/analyzer.ts

Pipeline:
1. Extract text from uploaded document (use pdf-parse for PDFs)
2. Send to Claude with this prompt:
   "Analyze this text through the Spiralogic lens.
    Map content to the 12 petals (Life, Unity, Expression, etc).
    Score each petal 0-1 based on relevance.
    Detect Aether resonance (transcendent/mystical content).
    Extract key wisdom quotes.
    Return as structured JSON."

3. Store analysis in Supabase:
   Table: sacred_documents
   - document_id, user_id, filename, content_hash
   - petal_mapping (jsonb), aether_score (float)
   - key_passages (jsonb), upload_date

4. Update user's Holoflower state with document resonance
```

### Step 2.3 — Document-to-Holoflower Mapper

```prompt
Create visualization showing how documents affect the Holoflower:

File: components/sacred-library/DocumentResonance.tsx

Features:
- Show document as constellation point
- Draw light threads from document to affected petals
- Animate petal brightening based on document themes
- Display extracted wisdom quotes on hover
- "Integrate into Holoflower" button to merge states

Visual effects:
- Particle streams from document to petals
- Glow intensity based on resonance strength
- Sacred geometry patterns in connection lines
```

---

## 📚 Phase 3: Sacred Library (Week 3-4)

### Step 3.1 — Library Grid Interface

```prompt
Create Sacred Library main interface:

File: app/sacred-library/page.tsx

Layout:
- Grid of document cards (responsive 1-4 columns)
- Each card shows:
  - Document title and date
  - Mini Holoflower showing petal mapping
  - Aether resonance meter (0-100%)
  - Top 3 wisdom quotes
  - Dominant element color coding

Filters (sticky sidebar):
- Search by keyword (full-text)
- Filter by element (Fire/Water/Earth/Air/Aether)
- Date range selector
- Coherence score threshold
- "My resonant documents" toggle
```

### Step 3.2 — Full-Text Search Implementation

```prompt
Implement full-text search with Supabase:

File: lib/sacred-library/search.ts

Setup:
1. Add tsvector column to sacred_documents table
2. Create GIN index for performance
3. Implement search function with:
   - Keyword highlighting in results
   - Fuzzy matching for typos
   - Relevance ranking
   - Search within quotes vs full text

API endpoint: app/api/sacred-library/search/route.ts
- GET with query params: q, element, dateFrom, dateTo
- Return paginated results (20 per page)
- Include snippet generation for context
```

### Step 3.3 — Wisdom Quote Extraction

```prompt
Create wisdom quote management system:

File: components/sacred-library/WisdomQuotes.tsx

Features:
- Display quotes in sacred card format
- Golden ratio typography sizing
- Share quote as image (canvas rendering)
- Copy quote to clipboard
- "Meditate on this" mode (fullscreen quote)

Table: wisdom_quotes
- quote_id, document_id, user_id
- quote_text, context, page_number
- petal_associations (jsonb)
- user_notes, favorited, share_count
```

---

## ⚡ Phase 4: Performance Optimizations (Ongoing)

### Step 4.1 — Device Tier Detection

```prompt
Implement adaptive performance system:

File: lib/performance/device-detector.ts

Detection logic:
1. Check GPU capabilities (WebGL renderer info)
2. Measure CPU cores (navigator.hardwareConcurrency)
3. Test animation frame rate (requestAnimationFrame timing)
4. Check available memory (performance.memory if available)

Tiers:
- SACRED (high-end): All effects enabled
- RITUAL (mid-tier): Reduce particle count by 50%
- LIGHT (low-end): Static Holoflower, no particles
- ESSENCE (minimal): Pure CSS, no WebGL

Store tier in localStorage, allow manual override in settings
```

### Step 4.2 — Animation Queue Manager

```prompt
Create animation queue to prevent frame drops:

File: lib/animation/queue-manager.ts

System:
- Priority queue for animations (1-5 priority)
- Frame budget monitoring (target 60fps)
- Automatic throttling when budget exceeded
- Batching similar animations (multiple petals)

Implementation:
- Use requestAnimationFrame with time tracking
- Defer low-priority animations during interactions
- Precompute animation curves
- Cancel queued animations on route change
```

### Step 4.3 — Audio Layer Optimization

```prompt
Optimize sacred audio system:

File: lib/audio/sacred-audio-optimizer.ts

Optimizations:
1. Lazy load audio files (load on first ritual)
2. Use Web Audio API for mixing (not multiple Audio elements)
3. Implement audio sprite sheets for short sounds
4. Add "silent mode" for no-audio environments
5. Progressive enhancement (start silent, fade in when ready)

Fallback chain:
- Full 7-layer Solfeggio mix (high-end)
- 3 primary frequencies only (mid-tier)  
- Single base tone (low-end)
- Visual-only mode (no audio)
```

### Step 4.4 — Bundle Size Optimization

```prompt
Optimize bundle size for faster loads:

Tasks:
1. Implement dynamic imports for heavy components:
   - Holoflower WebGL (load after initial render)
   - Document analyzer (load on library route)
   - Audio system (load on first play)

2. Image optimization:
   - Convert all assets to WebP with PNG fallback
   - Implement responsive image loading
   - Use next/image with blur placeholders

3. Tree shaking audit:
   - Remove unused Radix UI components
   - Eliminate dead code paths
   - Extract rarely-used utilities to separate chunks

Target: <200KB initial bundle, <500KB total
```

---

## 🔄 Implementation Order

### Week 1: Foundation
1. Run Step 1.1 (Supabase schema)
2. Run Step 1.2 (Session API)
3. Run Step 4.1 (Device detection)

### Week 2: Core Features  
1. Run Step 1.3 (Timeline)
2. Run Step 2.1 (Upload interface)
3. Run Step 4.2 (Animation queue)

### Week 3: Intelligence Layer
1. Run Step 2.2 (Claude pipeline)
2. Run Step 2.3 (Document resonance)
3. Run Step 4.3 (Audio optimization)

### Week 4: Sacred Library
1. Run Step 3.1 (Library interface)
2. Run Step 3.2 (Search)
3. Run Step 3.3 (Wisdom quotes)
4. Run Step 4.4 (Bundle optimization)

---

## 🌟 Success Metrics

After implementation, you should have:
- ✅ Sessions persist across devices
- ✅ Documents integrate with Holoflower
- ✅ Searchable wisdom library
- ✅ <3s load time on 3G
- ✅ 60fps on mid-tier devices
- ✅ <500KB total bundle size

---

## 🔮 Next Horizons

Once this roadmap is complete:
- Multiplayer rituals (shared Holoflower states)
- Voice integration (speak to the Oracle)
- AR mode (Holoflower in physical space)
- Wisdom NFTs (tokenized sacred insights)

---

*"Build with intention, optimize with love, scale with wisdom"* ✨