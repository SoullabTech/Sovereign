# 🎨 Soullab Designer Quick Reference

*Print, laminate, keep on desk - one-page cheat sheet*

---

## 🌿 Core Philosophy
**Atmospheric + Brand + Natural** = Soul (depth) + Lab (clarity) + Soullab (balance)

---

## 🎨 Color Codes (Copy-Paste Ready)

### Primary Palette
```
Terracotta: #b85f42  /* Alerts, energy */
Sage: #6a8f6b        /* Success, balance */  
Ocean: #1c94b3       /* Primary, trust */
Amber: #f28c15       /* Highlights, joy */
Stone: #918c7e       /* System, neutral */
```

### Gradients
```css
Warmth: linear-gradient(135deg, #b85f42 0%, #f28c15 100%)
Nature: linear-gradient(135deg, #6a8f6b 0%, #1c94b3 100%)
Earth: linear-gradient(180deg, #b85f42 0%, #6a8f6b 100%)
Aura: radial-gradient(circle, rgba(242,140,21,0.1) 0%, transparent 70%)
```

---

## ✏️ Typography Stack

### Fonts
- **Headers**: Blair Serif (or Georgia)
- **Body**: Lato Sans (or -apple-system)  
- **Code**: JetBrains Mono

### Hierarchy
```
Display: 48px/56px Blair 700
H1: 32px/40px Blair 600
H2: 24px/32px Blair 500
H3: 18px/24px Blair 500
Body: 14px/20px Lato 400
Small: 12px/16px Lato 400
```

---

## 📐 Spacing & Layout

### 8px Grid System
```
4px  8px  12px  16px  24px  32px  48px  64px
```

### Border Radius
```
4px: Subtle elements
8px: Default buttons/inputs
12px: Cards
16px: Modals  
24px: Large containers
9999px: Pills/circular
```

---

## 🎞️ Motion Timing

### Animation Durations
```css
Hover: 150ms ease-out
Transitions: 300ms ease-in-out  
Breathing: 1.6s ease-in-out infinite
Stagger: 150ms delay between items
Voice Pulse: 2s ease-in-out infinite
```

### Scale Rules
```
Hover Growth: 1.05x max (never jarring)
Breathing: 1.0 → 1.02 → 1.0
Button Press: 0.98x momentary
```

---

## 🧩 Component Quick Specs

### Buttons
```css
Primary: Warmth gradient, white text, rounded-full
Secondary: Transparent + terracotta border, 8px radius
Ghost: No background, ocean text
Voice: 48px circle, nature gradient, white mic icon
```

### Chat Bubbles  
```css
User: Ocean solid, 16px 16px 4px 16px radius, right-align
Maia: Earth gradient, 16px 16px 16px 4px radius, left-align
Max-width: 70%, generous padding: 12px 16px
```

### Cards
```css
Standard: White, 1px gray border, 16px radius, 24px padding
Metric: White, subtle shadow, icon + value + label layout
Sacred: Mesh gradient background, soft borders
```

### Inputs
```css
Text: White, 1px border, 8px radius, 12px 16px padding
Focus: Ocean border, subtle glow ring
Textarea: 16px radius, auto-resize, 48px min-height
```

---

## ✅ DO's (Atmospheric Clarity)
- Earthy gradients for depth and warmth
- Breathing rhythms (1.6s) for alive presence  
- Generous whitespace for sacred feeling
- Organic flowing shapes over rigid geometry
- Layer: background → context → content → interactive
- Soullab palette consistently applied

## ❌ DON'Ts (Avoid Mystical Woo)
- **Never**: Purple, indigo, violet, neon colors
- **Never**: Mystical symbols, chakras, crystals
- **Never**: Harsh shadows, stark contrasts
- **Never**: Synthetic/digital feeling elements
- **Never**: Overwhelming effects or jarring motion
- **Never**: Sacrifice usability for aesthetics

---

## 🌊 Layering Hierarchy
1. **Background**: Light gradients, mesh textures
2. **Context**: Aura glows, atmospheric elements  
3. **Content**: Clean cards, readable text
4. **Interactive**: Buttons, inputs, hover states
5. **Focus**: Clear selection, accessibility indicators

---

## 📊 Chart & Data Colors
```
Primary Line: Ocean #1c94b3
Secondary Line: Sage #6a8f6b  
Highlight: Amber #f28c15
Alert: Terracotta #b85f42
Neutral: Stone #918c7e
Grid: Gray-200 #e5e5e5, 1px, dashed
```

---

## 🚫 Brand Guardrails

### Forbidden Elements
- Purple/indigo/violet in any form
- Mystical symbols or new-age imagery  
- Harsh drop shadows or stark contrasts
- Neon or synthetic feeling colors
- Overwhelming visual effects
- Cold corporate sterility

### Required Elements  
- Earthy Soullab palette throughout
- Blair + Lato typography hierarchy
- Breathing motion for sacred moments
- Generous whitespace and clean structure
- Professional warmth, never mystical
- Functionality-first, beauty-enhanced

---

## 🤖 AI Prompt Templates

### Uizard
```
Design soulful chat interface: earthy terracotta sage ocean amber palette, Blair serif headers + Lato body, minimal Apple clarity, breathing animations, NO purple/neon/mystical, professional warmth, mobile-first
```

### Figma Make
```
4-screen onboarding flow: breathing logo (terracotta-sage), Maia intro bubble, four navigation cards, voice attunement slider. Soullab earthy palette, organic shapes, generous spacing, everyday sacred not mystical
```

---

## 🔥 Emergency Debug
```bash
# Check brand compliance
grep -r "purple\|indigo\|violet" . 
# Should return zero results

# Verify color usage  
grep -r "#[a-fA-F0-9]{6}" . | grep -v "b85f42\|6a8f6b\|1c94b3\|f28c15\|918c7e"
# Should only show approved Soullab colors
```

---

**📍 Key Files**: `/docs/SOULLAB_DESIGN_LANGUAGE.md` | `/docs/FIGMA_STARTER_STRUCTURE.md`
**🎯 Target**: Atmospheric + Professional + Natural | **🚫 Avoid**: Mystical + Synthetic + Cold

*Keep this pinned while designing - every choice should feel intentionally sacred yet everyday usable*