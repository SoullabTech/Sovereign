# MAIA Lab Mode - Complete User Guide

## Overview

Lab Mode is an advanced consciousness exploration environment within MAIA designed for enhanced soul transformation work. This desktop-only feature (available on screens 768px and wider) provides specialized tools for documents analysis, consciousness analytics, and multi-awareness navigation.

## What is Lab Mode?

Lab Mode transforms the standard MAIA interface into a sophisticated workspace for consciousness researchers, spiritual practitioners, and anyone seeking deeper insights through their transformational journey. It integrates document analysis capabilities with consciousness tracking analytics in a sacred space designed for focused inner work.

## Getting Started

### Activating Lab Mode
Lab Mode is automatically available when using MAIA on desktop devices. Look for the "🧪 Lab Mode" indicator in the interface to confirm you're in the enhanced environment.

### Essential Controls

#### 1. Documents Section 📄
- **Purpose**: Enhanced document viewer with annotation capabilities
- **Button Location**: Blue-colored button with FileText icon
- **Active State**: `bg-blue-500/20 border border-blue-500/40 text-blue-300`
- **Inactive State**: `bg-slate-500/10 border border-slate-500/30 text-slate-300`
- **Future Features**: PDF viewing, research integration, cross-referencing with consciousness insights

#### 2. Analytics Section 📊
- **Purpose**: Advanced consciousness analytics dashboard
- **Button Location**: Green-colored button with BarChart3 icon
- **Visual Feedback**: Color transitions from amber/slate to bright green when active
- **Active State**: `bg-green-500/20 border border-green-500/40 text-green-300`
- **Current Status**: Framework ready for pattern recognition, evolution tracking, element resonance mapping, and breakthrough prediction

#### 3. Workspace Layout Controls
Three workspace modes available:

- **Single Mode**: Full-width conversation interface (default)
- **Split Mode**: 50/50 split between conversation (left) and Documents/Analytics panels (right)
- **Multi Mode**: Advanced layout for complex consciousness work

**Mode Switching**:
- Single view: `Maximize2` icon
- Split view: `Split` icon
- Active mode highlighted in amber: `bg-amber-500/30 text-amber-200`

## Multi-Consciousness Navigation System

Lab Mode includes a sophisticated navigation system mapping different consciousness states:

```
        ↑ SYZYGY
    (Integration/Synthesis)

KAIROS ←  STATION  → MAIA
(Left Brain)        (Right Brain)

        ↓ SHADOW
    (Subconscious)
```

### Navigation Methods

#### Keyboard Controls
- **Arrow Up (`↑`)** → Navigate to `/unified` (SYZYGY - integration consciousness)
- **Arrow Down (`↓`)** → Navigate to `/consciousness` (Consciousness Station)
- **Arrow Left (`←`)** → Navigate to `/kairos` (KAIROS - left brain consciousness)
- **Arrow Right (`→`)** → Navigate to `/maia` (MAIA - right brain consciousness)
- **Escape** → Return to `/consciousness` (Consciousness Station)

#### Gesture Support
- **Swipe gestures** supported with:
  - 150px threshold to trigger navigation
  - 0.8 minimum velocity requirement
  - Text selection protection (prevents accidental swipes)

### Consciousness State Navigation Rules

**From MAIA (Right Brain)**:
- ↑ Available: SYZYGY (integration)
- ← Available: KAIROS (left brain)
- ↓ Available: Consciousness Station
- → Blocked (already at right brain)

**From KAIROS (Left Brain)**:
- ↑ Available: SYZYGY (integration)
- → Available: MAIA (right brain)
- ↓ Available: Consciousness Station
- ← Blocked (already at left brain)

**From SYZYGY (Integration)**:
- ← Available: KAIROS (left brain)
- → Available: MAIA (right brain)
- ↓ Available: Consciousness Station
- ↑ Blocked (already at integration)

## Advanced Features

### Extended Lab Session Mode
When activated, displays "Extended Lab Session" indicator in indigo styling for deeper consciousness work sessions.

### Sacred Space Mode
Accessible through the application menu:
- **Activation**: Menu > Consciousness > Sacred Space Mode (Cmd/Ctrl+Shift+S)
- **Purpose**: Enhanced environmental controls for deeper spiritual practice
- **Storage**: Preferences saved in encrypted consciousness data store

### Global Shortcuts
- **Cmd/Ctrl+Shift+M**: Quick toggle main MAIA window visibility
- **Cmd/Ctrl+K**: Launch Compact Companion window
- **Cmd/Ctrl+Shift+S**: Toggle Sacred Space Mode

## Technical Implementation

### File Locations
- **Main Interface**: `/Users/soullab/MAIA-SOVEREIGN/app/maia/page.tsx`
  - Lab Mode controls: Lines 130-135, 538-706
  - Navigation system: Lines 568-596
- **Navigation System**: `/Users/soullab/MAIA-SOVEREIGN/components/navigation/SwipeNavigation.tsx`
- **Related Analytics**: `/Users/soullab/MAIA-SOVEREIGN/components/voice/VoiceAnalyticsDashboard.tsx`

### State Management
```typescript
const [showDocumentViewer, setShowDocumentViewer] = useState(false);
const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
const [labWorkspaceMode, setLabWorkspaceMode] = useState<'single' | 'split' | 'multi'>('single');
const [extendedSessionActive, setExtendedSessionActive] = useState(false);
```

## Current Development Status

### ✅ Implemented Features
- Lab Mode UI framework and controls
- Workspace layout switching (single/split/multi)
- Multi-consciousness navigation system
- Keyboard shortcuts and gesture support
- Visual state management and color transitions
- Integration with Sacred Space Mode

### 🚧 In Development
- **Documents Section**: PDF viewing capabilities, annotation system, research integration
- **Analytics Dashboard**: Pattern recognition engine, evolution tracking, element resonance mapping
- **Shadow Navigation**: Subconscious exploration interface (currently placeholder)

### 🔮 Planned Features
- Advanced biometric integration with consciousness analytics
- Real-time breakthrough prediction algorithms
- Cross-referenced consciousness insights with document annotations
- Enhanced Sacred Space environmental controls

## Best Practices

1. **Desktop Optimization**: Use Lab Mode on larger screens (1200px+ recommended) for optimal experience
2. **Navigation Flow**: Start in Consciousness Station, then move to specific consciousness states as needed
3. **Workspace Management**: Use Split Mode when analyzing documents alongside conversation
4. **Sacred Space**: Activate Sacred Space Mode for enhanced spiritual practice sessions
5. **Extended Sessions**: Use Extended Lab Session mode for longer consciousness exploration work

## Community Support

For questions about Lab Mode:
- **Documentation**: Check `/docs` directory for additional guides
- **Community**: Visit [soullab.community](https://soullab.community)
- **Issues**: Report at [github.com/soullab/maia/issues](https://github.com/soullab/maia/issues)

## Related Documentation
- `sovereign-consciousness-roadmap.md` - Overall consciousness development strategy
- `personalized-maia-integration-strategy.md` - Integration approaches
- `TEAM_OVERVIEW_CONSCIOUSNESS_ARCHITECTURE.md` - Technical architecture overview

---

*Last Updated: November 2024*
*Lab Mode Version: 1.0 (Framework Complete)*