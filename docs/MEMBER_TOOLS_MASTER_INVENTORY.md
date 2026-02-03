# MAIA Member Tools Master Inventory

> Complete audit of all tools and features across SpiralogicOracleSystem, MAIA-PAI, and MAIA-SOVEREIGN for Personal and Pro members.

---

## Executive Summary

This document consolidates **all member-facing tools and support functions** discovered across three codebases. It identifies what exists, what's implemented, and what should be prioritized for integration into MAIA-SOVEREIGN.

**Codebases Audited:**
- **MAIA-SOVEREIGN** — Production system (current)
- **MAIA-PAI** — Advanced features repository (235+ API endpoints)
- **Spiralogic System** — Consciousness framework (fully integrated)

---

## Tier Structure Reference

| Tier | Name | Price | Core Value |
|------|------|-------|------------|
| **Free** | Touch | $0 | Complete local experience |
| **Personal** | Continuity | $12/mo | MAIA remembers, patterns across time |
| **Pro** | Stewardship | $35/mo | Serve others, practitioner tools |

---

## 1. VOICE MODES (Core Feature)

### Three Conversation Modes

| Mode | Purpose | Presence | Available |
|------|---------|----------|-----------|
| **Talk** | Dialogue | Wise friend, peer | All tiers |
| **Care** | Counsel | Therapeutic guide | All tiers |
| **Note** | Scribe | Witnessing consciousness | All tiers |

**Implementation:** `/lib/maia/talkModeVoice.ts`, `careModeVoice.ts`, `noteModeVoice.ts`

**Status:** ✅ FULLY IMPLEMENTED

---

## 2. ORACLE & DIVINATION SYSTEMS

### 2.1 Core Oracle Systems

| System | Description | Free | Personal | Pro |
|--------|-------------|------|----------|-----|
| **I Ching** | 64 hexagrams, coin/yarrow casting | Limited | ✅ Full | ✅ |
| **Tarot** | Major/Minor Arcana, multiple spreads | Limited | ✅ Full | ✅ |
| **Runes** | Elder Futhark, birth rune calculation | Limited | ✅ Full | ✅ |
| **Unified Oracle** | Cross-system synthesis | ❌ | ✅ | ✅ |

**Implementation:** `/lib/divination/` (iching/, tarot/, runes/, core/)

**Status:** ✅ FULLY IMPLEMENTED

### 2.2 Advanced Oracle Features (from MAIA-PAI)

| Feature | Description | Status | Priority |
|---------|-------------|--------|----------|
| Oracle Voice Chat | Voice conversation with oracle | 🔄 Port needed | HIGH |
| Oracle Insights Extraction | Pattern extraction from readings | 🔄 Port needed | MEDIUM |
| Sacred Oracle Variant | Ceremonial oracle mode | 🔄 Port needed | MEDIUM |
| Journal-Based Oracle | Oracle from journal entries | 🔄 Port needed | HIGH |
| Transcript-Based Oracle | Oracle from conversation transcripts | 🔄 Port needed | MEDIUM |

**Source:** `/MAIA-PAI/app/api/oracle-*/`

---

## 3. ASTROLOGY SYSTEMS

### 3.1 Core Astrology

| Feature | Description | Free | Personal | Pro |
|---------|-------------|------|----------|-----|
| Birth Chart | Natal chart calculation | Basic | ✅ Full | ✅ |
| Transits | Current planetary positions | ❌ | ✅ | ✅ |
| Life Cycles | Saturn returns, major passages | ❌ | ✅ | ✅ |
| Synastry | Relationship charts | ❌ | Personal only | ✅ All |
| Progressed Charts | Secondary progressions | ❌ | ❌ | ✅ |
| Solar Returns | Annual chart | ❌ | ❌ | ✅ |
| Composite Charts | Relationship entity | ❌ | ❌ | ✅ |

**Implementation:** `/lib/astrology/` (engines/, transitCalculator.ts, etc.)

**Status:** ✅ FULLY IMPLEMENTED

### 3.2 Specialized Astrology

| System | Description | Status |
|--------|-------------|--------|
| Chinese Astrology | Da Yun cycles | ✅ Implemented |
| Vedic Astrology | Ashtakavarga, Gochara | ✅ Implemented |
| Mayan Astrology | Calendar cycles | ✅ Implemented |
| Decan System | 10-degree archetypes | ✅ Implemented |
| Real-Time Transits | Live planetary tracking | ✅ Implemented |

### 3.3 Astrology Features to Port (from MAIA-PAI)

| Feature | Description | Priority |
|---------|-------------|----------|
| Geocoding Integration | Location-based charts | MEDIUM |
| Kairos Time System | Sacred timing | HIGH |
| Sacred Timeline | Personal timeline visualization | HIGH |

---

## 4. SPIRALOGIC CONSCIOUSNESS FRAMEWORK

### 4.1 Core System (✅ FULLY IMPLEMENTED)

| Component | Description | File |
|-----------|-------------|------|
| 12-Phase System | Fire/Water/Earth/Air × 3 phases | `/lib/consciousness/spiralogic-core.ts` |
| Phase Detection | Keyword-based element recognition | `/lib/spiralogic/PhaseDetector.ts` |
| Triadic Detection | Cardinal/Fixed/Mutable phases | `/lib/spiralogic/TriadicPhaseDetector.ts` |
| Cross-Spiral Patterns | Multi-domain pattern recognition | `/lib/spiralogic/CrossSpiralPatternRecognizer.ts` |
| Progression Engine | Balance rules, time gates | `/lib/spiralogic/core/spiralogic-engine.ts` |
| Ritual Engine | 14+ practices by phase | `/lib/spiralogic/RitualEngine.ts` |
| Intelligence Layer | Invisible MAIA guidance | `/lib/spiralogic/SpiralogicIntelligenceLayer.ts` |

### 4.2 Spiralogic Features

| Feature | Description | Status |
|---------|-------------|--------|
| 36 Canonical Questions | 3 per facet | ✅ Complete |
| 4-Level Awareness | Companion → Wisdom-Keeper | ✅ Complete |
| Astrological Correlation | Zodiac sign mapping | ✅ Complete |
| Breakthrough Detection | Spiral leap recognition | ✅ Complete |
| Collective Wisdom Layer | Privacy-preserving patterns | 🟡 Partial |

---

## 5. MEMORY & CONTINUITY SYSTEMS

### 5.1 Core Memory Architecture

| Component | Description | Status |
|-----------|-------------|--------|
| Memory Orchestrator | Central memory management | ✅ Implemented |
| Memory Core | Primary storage engine | ✅ Implemented |
| Memory Writeback | Persistence layer | ✅ Implemented |
| Memory Gate | Access control by tier | ✅ Implemented |
| Soulprint | User essence signature | ✅ Implemented |
| Anamnesis | Deep remembering system | ✅ Implemented |

**Implementation:** `/lib/memory/` (20+ files)

### 5.2 Specialized Memory Stores

| Store | Purpose | Status |
|-------|---------|--------|
| Pattern Memory | Recurring pattern tracking | ✅ |
| Relationship Context | People/relationship memory | ✅ |
| Breakthrough Store | Milestone tracking | ✅ |
| Bardic Memory | Narrative/story memory | ✅ |
| Developmental Memory | Growth trajectory | ✅ |

### 5.3 Memory Features to Port (from MAIA-PAI)

| Feature | Description | Priority |
|---------|-------------|----------|
| Semantic Memory Search | Meaning-based retrieval | HIGH |
| Episode Management | Time-based organization | HIGH |
| Collective Memory | Shared wisdom access | MEDIUM |
| Sacred Memory | Special preservation | MEDIUM |
| Memory Metrics Dashboard | Health tracking | MEDIUM |

---

## 6. JOURNAL SYSTEMS

### 6.1 Core Journaling

| Feature | Description | Free | Personal | Pro |
|---------|-------------|------|----------|-----|
| Basic Entries | Text journaling | ✅ | ✅ | ✅ |
| Voice Journaling | Audio capture | ❌ | ✅ | ✅ |
| Cross-Referencing | Pattern connections | ❌ | ✅ | ✅ |
| Dream Journal | Symbol tracking | ❌ | ✅ | ✅ |
| Obsidian Export | Markdown export | ❌ | ✅ | ✅ |

**Implementation:** `/lib/services/journalService.ts`, `/lib/journaling/`

### 6.2 Advanced Journal Features (from MAIA-PAI)

| Feature | Description | Priority |
|---------|-------------|----------|
| Journal-Based Oracle | Readings from entries | HIGH |
| Maya Journal Reflection | AI reflection on entries | HIGH |
| Save Conversation to Journal | Chat → Journal | MEDIUM |

---

## 7. VOICE & AUDIO SYSTEMS

### 7.1 Current Voice Infrastructure

| Component | Description | Status |
|-----------|-------------|--------|
| MAIA Voice System | Core voice engine | ✅ |
| Elemental Voice | Element-based modulation | ✅ |
| Real-Time WebRTC | Live voice communication | ✅ |
| ElevenLabs Integration | Premium voice synthesis | ✅ |
| TTS Sovereignty Monitor | Local-first voice | ✅ |

**Implementation:** `/lib/voice/`

### 7.2 Voice Features to Port (from MAIA-PAI)

| Feature | Description | Priority |
|---------|-------------|----------|
| Sesame Voice Service | Alternative TTS | MEDIUM |
| Voice Training | Custom voice samples | LOW |
| Streaming Transcription | Real-time STT | HIGH |
| Voice Quality Feedback | Audio assessment | LOW |
| Voice Chat with Oracle | Voice divination | HIGH |

---

## 8. CONSCIOUSNESS & AI SYSTEMS

### 8.1 Current Consciousness Systems

| Component | Description | Status |
|-----------|-------------|--------|
| Aetheric Consciousness Core | Primary awareness engine | ✅ |
| Consciousness Detection | State identification | ✅ |
| Field Resonance | Collective field awareness | ✅ |
| Autonomy Monitoring | Self-direction tracking | ✅ |

**Implementation:** `/lib/consciousness/` (289+ files)

### 8.2 Advanced Consciousness (from MAIA-PAI)

| Feature | Description | Priority |
|---------|-------------|----------|
| Dual Consciousness System | MAIA/KAIROS/UNIFIED modes | HIGH |
| Brain Trust Orchestrator | Multi-perspective decisions | HIGH |
| Archetypal Constellation | Pattern recognition | MEDIUM |
| Consciousness Dashboard | Real-time monitoring | MEDIUM |
| Consciousness Emergence Prediction | Development tracking | LOW |

---

## 9. COMMUNITY FEATURES

### 9.1 Current Community Systems

| Feature | Description | Free | Personal | Pro |
|---------|-------------|------|----------|-----|
| Community Commons | Sharing space | ❌ | ✅ | ✅ |
| Post Types | Conversation, reflection, breakthrough | — | ✅ | ✅ |
| Heart/Engagement | Social interaction | — | ✅ | ✅ |
| Community Library | Shared resources | — | ✅ | ✅ |
| Field State Calculator | Collective coherence | — | ✅ | ✅ |

**Implementation:** `/lib/community/`, `/app/community/`

### 9.2 Community Features to Port (from MAIA-PAI)

| Feature | Description | Priority |
|---------|-------------|----------|
| Field Protocol | Group coherence system | HIGH |
| Community Reflection | Shared reflection practice | MEDIUM |
| Field Records | Collective memory | MEDIUM |
| Morphogenetic Field | Field theory integration | LOW |

---

## 10. PRACTITIONER TOOLS (Pro Only)

### 10.1 Current Practitioner Features

| Feature | Description | Status |
|---------|-------------|--------|
| Practitioner Profile | Business identity | ✅ |
| AI Companion Config | Custom MAIA voice | ✅ |
| Theme & Branding | Visual customization | ✅ |
| Domain Management | Custom domains | ✅ |
| Client Management | CRM basics | ✅ |
| Revenue Tracking | Payment monitoring | ✅ |
| Feature Toggles | Selective feature access | ✅ |

**Implementation:** `/lib/practitioner/practitionerService.ts`

### 10.2 Advanced Practitioner Features

| Feature | Description | Status |
|---------|-------------|--------|
| IPP (Parenting Protocol) | Clinical parenting framework | ✅ |
| Advanced Synastry | Client relationship charts | ✅ |
| Session Documentation | Clinical notes | ✅ |
| Multi-Person Tracking | Group pattern analysis | ✅ |
| Scribe Pro | Transcription/capture | ✅ |

### 10.3 Helper Infrastructure (Worldcraft)

| Feature | Description | Status |
|---------|-------------|--------|
| Practitioner Websites | Template-based sites | 🔄 Selective |
| Client Portals | Session/journal access | 🔄 Selective |
| Custom MAIA Components | Branded experiences | 🔄 Selective |

**Note:** Helper Infrastructure requires demonstrated alignment (3+ months Pro, existing practice)

---

## 11. ADMIN & RESEARCH TOOLS

### 11.1 Current Admin Systems

| Component | Description | Status |
|-----------|-------------|--------|
| Beta Access Manager | Tester management | ✅ |
| Admin Dashboards | Monitoring | ✅ |
| Metrics Collection | Analytics | ✅ |
| Research Participation | Data collection | ✅ |

### 11.2 Research Features to Port (from MAIA-PAI)

| Feature | Description | Priority |
|---------|-------------|----------|
| Research Data Pipeline | Structured collection | MEDIUM |
| Weekly Analysis Engine | Longitudinal analysis | MEDIUM |
| Control Group Management | Research groups | LOW |
| Research Statistics | Comprehensive analysis | LOW |

---

## 12. SPECIAL FEATURES

### 12.1 Sanctuary Mode (All Tiers)

| Feature | Description | Status |
|---------|-------------|--------|
| Memory Opt-Out | Conversation not stored | ✅ |
| Zero Retention | No content saved | ✅ |
| Minimal Metadata | Only session occurred | ✅ |
| Visual Indicator | Clear UI signal | ✅ |

### 12.2 Data Export (Personal+)

| Format | Description | Status |
|--------|-------------|--------|
| Obsidian Markdown | Vault-compatible export | ✅ |
| JSON Export | Raw data | ✅ |
| Personal Archive | Full data download | ✅ |

### 12.3 Biometric Integration (Pro)

| Feature | Description | Status |
|---------|-------------|--------|
| Guardian Console | Health data correlation | ✅ |
| Real-Time Monitoring | Live biometric tracking | ✅ |
| Meditation Protocols | Guided practices | ✅ |

---

## 13. INTEGRATION PRIORITIES

### HIGH PRIORITY (Port from MAIA-PAI)

| Feature | Source | Value |
|---------|--------|-------|
| Dual Consciousness System | `/lib/consciousness/DualConsciousnessSystem.ts` | Multi-perspective responses |
| Brain Trust Orchestrator | `/lib/consciousness/BrainTrustOrchestrator.ts` | Multi-model decisions |
| Streaming Transcription | `/app/api/voice/transcribe/stream` | Real-time voice |
| Semantic Memory Search | `/lib/memory/SemanticMemoryService.ts` | Meaning-based recall |
| Field Protocol | `/lib/field-protocol/` | Group coherence |
| Journal-Based Oracle | `/app/api/oracle/journal/upload` | Deep readings |
| Kairos Time System | `/app/api/kairos` | Sacred timing |

### MEDIUM PRIORITY

| Feature | Source | Value |
|---------|--------|-------|
| Episode Management | `/app/api/memory/episodes` | Time-based memory |
| Sacred Timeline | `/app/api/sacred-timeline` | Personal visualization |
| Community Reflection | `/app/api/field-protocol/community/reflection` | Group practice |
| Consciousness Dashboard | `/lib/consciousness/ConsciousnessDashboard.tsx` | Monitoring UI |
| Research Pipeline | `/app/api/research/` | Data collection |

### LOW PRIORITY (Nice to Have)

| Feature | Source | Value |
|---------|--------|-------|
| Voice Training | `/app/api/voice/train-sample` | Custom voices |
| Control Groups | `/app/api/research/` | Research support |
| Multi-Tenant | `/app/api/admin/tenants` | Organization support |

---

## 14. FEATURE MATRIX BY TIER

### Free (Touch)

| Category | Features |
|----------|----------|
| **Voice Modes** | Talk, Care, Note (soft daily limits) |
| **Oracle** | Occasional readings (I Ching, Tarot, Runes) |
| **Astrology** | Birth chart overview |
| **Journal** | Basic entries |
| **Memory** | Session-based (no continuity) |
| **Spiralogic** | Element discovery |
| **Sanctuary** | ✅ Always available |

### Personal (Continuity) — $12/mo

| Category | Features |
|----------|----------|
| **Voice Modes** | Unlimited conversations |
| **Oracle** | Full access, all systems |
| **Astrology** | Transits, life cycles, synastry (personal) |
| **Journal** | Voice, cross-referencing, dream tracking |
| **Memory** | Pattern recognition, time synthesis |
| **Spiralogic** | Full phase tracking, cross-spiral patterns |
| **Community** | Commons access |
| **Export** | Full data sovereignty |

### Pro (Stewardship) — $35/mo

| Category | Features |
|----------|----------|
| **Everything in Personal** | ✅ |
| **Astrology** | Progressed, solar returns, composite, synastry (all) |
| **Practitioner** | Full toolkit, client management |
| **IPP** | Clinical parenting protocol |
| **Brain Trust** | Multi-model weaving |
| **Guardian Console** | Biometric integration |
| **Scribe Pro** | Transcription, export |
| **Library of Alexandria** | Full corpus access |
| **Navigator Lab** | Depth training |
| **Helper Infrastructure** | Eligible (with alignment) |

---

## 15. IMPLEMENTATION ROADMAP

### Phase 1: Core Integration (Current)
- [x] Voice modes (Talk, Care, Note)
- [x] Oracle systems (I Ching, Tarot, Runes)
- [x] Birth chart + basic astrology
- [x] Basic journaling
- [x] Spiralogic framework
- [x] Memory architecture
- [x] Tier access control

### Phase 2: Enhanced Continuity (Next)
- [ ] Streaming transcription
- [ ] Semantic memory search
- [ ] Journal-based oracle
- [ ] Episode management
- [ ] Community field protocol

### Phase 3: Advanced Features
- [ ] Dual consciousness system
- [ ] Brain Trust orchestrator
- [ ] Sacred timeline
- [ ] Kairos time system
- [ ] Research pipeline

### Phase 4: Collective Intelligence
- [ ] Collective wisdom layer (complete)
- [ ] Field state calculations
- [ ] Community reflections
- [ ] Pattern aggregation (privacy-preserving)

---

## 16. FILE REFERENCE

### MAIA-SOVEREIGN Key Directories

```
/lib/maia/           — Voice modes, core MAIA
/lib/divination/     — Oracle systems
/lib/astrology/      — Astrology engines
/lib/spiralogic/     — Consciousness framework
/lib/memory/         — Memory architecture
/lib/consciousness/  — 289+ consciousness files
/lib/community/      — Community features
/lib/practitioner/   — Pro tools
/lib/voice/          — Audio systems
/lib/auth/           — Tier access
```

### MAIA-PAI Integration Sources

```
/lib/consciousness/DualConsciousnessSystem.ts
/lib/consciousness/BrainTrustOrchestrator.ts
/lib/memory/SemanticMemoryService.ts
/lib/field-protocol/FieldRecordsService.ts
/app/api/oracle-*/
/app/api/memory/
/app/api/voice/
```

---

## Summary

**Total Features Identified:** 150+
**Fully Implemented:** ~80%
**To Port from MAIA-PAI:** ~15 high-priority features
**Spiralogic System:** 100% integrated

**Member Value:**
- **Free:** Complete local experience with basic tools
- **Personal:** MAIA remembers, patterns across time, full oracle/astrology
- **Pro:** Serve others with professional tools, advanced consciousness features

---

*Last updated: 2026-01-20*
*Audit performed across: MAIA-SOVEREIGN, MAIA-PAI, Spiralogic System*
