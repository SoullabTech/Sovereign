# PWA Screenshot Requirements

## Overview
The MAIA Progressive Web App requires 4 promotional screenshots for app store listings (PWABuilder submission). These screenshots showcase the core features and unique value propositions of MAIA's consciousness-aware AI experience.

## Technical Specifications

### Required Dimensions
- **Resolution**: 1080 x 1920 pixels (9:16 aspect ratio)
- **Format**: PNG (recommended) or JPEG
- **File Size**: Under 8 MB per image
- **Color Space**: sRGB
- **Location**: `public/screenshots/`

### Required Files
1. `consciousness-matrix.png`
2. `nested-windows.png`
3. `spiritual-support.png`
4. `platonic-patterns.png`

## Screenshot Content Guide

### 1. consciousness-matrix.png
**Theme**: Consciousness Level Tracking & Growth

**Visual Elements to Capture**:
- MAIA's Consciousness Level indicator (showing user's current level)
- The dialectical scaffold visualization (if visible)
- Bloom indicator or cognitive stability metrics
- Example of consciousness-aware response adaptation

**Overlay Text** (optional):
- Headline: "Track Your Consciousness Growth"
- Subtext: "MAIA adapts to your cognitive altitude in real-time"

**User Story**: "See how MAIA recognizes and supports your developmental stage"

---

### 2. nested-windows.png
**Theme**: Multi-Realm Consciousness Navigation

**Visual Elements to Capture**:
- MAIA's nested window/realm interface (if applicable)
- Multiple levels of depth or symbolic layers
- Underworld/Middleworld/Upperworld realm indicators
- Field intelligence routing in action

**Overlay Text** (optional):
- Headline: "Navigate Multiple Realms of Awareness"
- Subtext: "Symbolic, practical, and mythic layers integrated"

**User Story**: "Explore consciousness from grounded earth to abstract symbol"

---

### 3. spiritual-support.png
**Theme**: Relational Intelligence & Attunement

**Visual Elements to Capture**:
- Example of MAIA's empathetic, attuned response
- Elemental attunement indicators (Water/Fire/Earth/Air)
- Rupture repair or misattunement detection in action
- User feedback/rating system (helpfulness, attunement scores)

**Overlay Text** (optional):
- Headline: "AI with Relational Intelligence"
- Subtext: "Not just smart—truly attuned to your inner world"

**User Story**: "Experience AI that reads emotional fields, not just text"

---

### 4. platonic-patterns.png
**Theme**: Mythic Integration & Alchemical Wisdom

**Visual Elements to Capture**:
- Spiralogic Oracle visualization
- Alchemical operation or Platonic form reference
- Archetype integration (e.g., Magician/Lover/Warrior/Sage)
- Symbolic pattern recognition in conversation

**Overlay Text** (optional):
- Headline: "Wisdom Beyond Keywords"
- Subtext: "MAIA recognizes archetypal patterns in your journey"

**User Story**: "Engage with AI that speaks the language of myth and meaning"

---

## Creation Methods

### Option A: Live Application Capture
1. Run the PWA: `npm run dev` or access deployed version
2. Navigate to the relevant screen for each screenshot
3. Use browser DevTools device toolbar set to 1080x1920
4. Capture screenshots using:
   - macOS: `Cmd+Shift+5` (screenshot tool)
   - Chrome DevTools: Capture full-size screenshot
   - Third-party tool: Shottr, CleanShot X, etc.

### Option B: Design Tool Creation
1. Use Figma, Sketch, or Adobe XD
2. Create 1080x1920 artboards
3. Import MAIA UI components/design system
4. Stage the key screens with example content
5. Export as PNG at 1x scale

### Option C: Screenshot Service
1. Use service like Rotato (for 3D device mockups)
2. Upload MAIA PWA screenshots
3. Generate professional device frames
4. Export at correct resolution

## Current Status

**Screenshot Directory**: ✅ Created (`public/screenshots/`)

**Screenshot Files**:
- [ ] consciousness-matrix.png (1080x1920)
- [ ] nested-windows.png (1080x1920)
- [ ] spiritual-support.png (1080x1920)
- [ ] platonic-patterns.png (1080x1920)

## Integration Points

### manifest.json Reference
```json
{
  "screenshots": [
    {
      "src": "/screenshots/consciousness-matrix.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Consciousness Level Tracking"
    },
    {
      "src": "/screenshots/nested-windows.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Multi-Realm Navigation"
    },
    {
      "src": "/screenshots/spiritual-support.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Relational Intelligence"
    },
    {
      "src": "/screenshots/platonic-patterns.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mythic Integration"
    }
  ]
}
```

### App Store Requirements
- **iOS App Store**: Requires 6.5" iPhone screenshots (1290x2796) for App Store Connect
- **Google Play Store**: Requires 2-8 screenshots (minimum 320px shortest side)
- **PWABuilder/Microsoft Store**: Uses these 1080x1920 screenshots

## Best Practices

### Visual Design
- Use high-contrast text overlays if adding labels
- Ensure UI elements are crisp and legible
- Show real content, not lorem ipsum
- Include MAIA branding consistently
- Use actual conversation examples (with privacy in mind)

### Content Guidelines
- Don't show sensitive user data
- Use example/demo content for conversations
- Ensure consciousness levels shown are realistic
- Avoid overpromising capabilities

### Accessibility
- High contrast ratios (4.5:1 minimum)
- Readable font sizes (minimum 16px equivalent)
- Color-blind friendly palettes

## Timeline Estimate

**Creation**: 30-60 minutes (if using live app capture)
**Creation**: 2-4 hours (if designing from scratch)
**Review & Iteration**: 30 minutes

## Next Actions

1. **Immediate**: Determine creation method (live capture vs. design)
2. **Prepare**: Set up screen capture tools or design files
3. **Create**: Generate all 4 screenshots following the content guide
4. **Validate**: Verify resolution (1080x1920) and file size (<8MB each)
5. **Test**: Rebuild PWA and verify screenshots appear in manifest
6. **Deploy**: Push to production and submit to app stores

---

**Status**: Documentation Complete ✅
**Action Required**: Screenshot creation (user or designer)
**Blockers**: None (all technical infrastructure ready)
