# 📁 Soullab-Beta-Starter.fig Structure

*Complete Figma file organization for immediate Soullab beta design work*

---

## 🗂 Page Structure

### Page 1: 🎨 Foundations
**Purpose**: All design tokens, styles, and core elements

#### Frames:
1. **Color Swatches**
   - Terracotta scale (50-900)
   - Sage scale (50-900) 
   - Ocean scale (50-900)
   - Amber scale (50-900)
   - Stone/neutral scale (50-900)
   - Support colors (White, Charcoal, Grays)

2. **Typography Specimens**
   - Blair Serif: Display, H1, H2, H3 with sample text
   - Lato Sans: Body Large, Body, Small, Code with sample text
   - Line height demonstrations
   - Color combinations (text on background)

3. **Gradient Library**
   - Warmth (Terracotta → Amber)
   - Nature (Sage → Ocean)  
   - Earth (Terracotta → Sage)
   - Sunset (Amber → Ocean)
   - Light (White → Gray-50)
   - Mesh (Subtle atmospheric)
   - Aura (Radial for voice states)

4. **Spacing Grid**
   - 8px base unit demonstration
   - Padding examples (12px, 16px, 20px, 24px)
   - Margin relationships
   - Card spacing templates

5. **Border Radius Scale**
   - 4px, 8px, 12px, 16px, 24px, Full examples
   - Applied to buttons, cards, inputs

---

### Page 2: 🧩 Components
**Purpose**: Reusable UI component library

#### Component Sets:

1. **Buttons**
   - Primary (Warmth gradient, white text)
   - Secondary (Terracotta outline, transparent fill)
   - Ghost (No background, Ocean text)
   - Voice Button (Circular, Nature gradient, mic icon)
   - States: Default, Hover, Active, Disabled, Loading

2. **Input Fields**
   - Text Input (Default, Focus, Error, Disabled)
   - Textarea (Auto-resize, chat style)
   - Search Input (with icon)
   - Voice Input Toggle (hybrid text/voice)

3. **Chat Elements**
   - User Message Bubble (Ocean blue, right-aligned)
   - Maia Message Bubble (Earth gradient, left-aligned)
   - Thinking Indicator (Three dots with breathing animation)
   - Voice Recording State (Pulsing rings)
   - Timestamp (Small gray text)

4. **Cards**
   - Standard Card (White background, subtle border)
   - Metric Card (Dashboard style, icon + value + label)
   - Sacred Card (Mesh gradient background)
   - Floating Card (Elevated shadow)

5. **Navigation**
   - Tab Bar (Light/Dark/System theme toggle)
   - Breadcrumbs (Sage colored, slash separators)
   - Menu Items (Hover states, active indication)

---

### Page 3: 📱 Onboarding Flows
**Purpose**: Complete user introduction sequence

#### Screens:

1. **Welcome Threshold**
   - Breathing logo (Terracotta→Sage gradient)
   - "Welcome to your Sacred Mirror" (Blair Serif H1)
   - Subtle mesh background
   - Continue button (Warmth gradient)
   - Progress indicator (4 dots)

2. **Meet Maia**
   - Maia introduction bubble with aura glow
   - "I'm Maia, your guide..." message
   - Voice/text preference toggles
   - "I understand" confirmation button
   - Back navigation

3. **Four Doors Navigation**
   - Grid layout: Mirror, Spiral, Journal, Attune
   - Each card: Icon, title, 1-line description
   - Hover states with gentle growth (1.05x)
   - "Explore Mirror" primary selection

4. **Voice Attunement**
   - Tone slider (Sage→Ocean gradient track)
   - Voice settings toggles
   - Test recording button with pulse animation
   - "Begin Sacred Conversation" CTA
   - Skip option for text-only users

---

### Page 4: 💬 Mirror Chat UI
**Purpose**: Main conversation interface

#### Layouts:

1. **Desktop Chat (1280px)**
   - Left sidebar: Navigation, settings
   - Center: Chat messages, streaming area
   - Right panel: Context, memory, tools
   - Hybrid input: Textarea + circular voice button
   - Theme toggle in header

2. **Mobile Chat (375px)**
   - Full-screen chat view
   - Bottom input with voice button
   - Slide-up panels for navigation
   - Responsive message bubbles
   - Floating action buttons

3. **Voice States**
   - Listening: Pulsing microphone with rings
   - Processing: Thinking dots with breathing
   - Speaking: Audio waveform visualization
   - Error states: Clear messaging, retry options

4. **Message Types**
   - Text messages (standard bubbles)
   - Voice transcripts (with play button)
   - System messages (centered, muted)
   - Reflection prompts (highlighted, sage border)

---

### Page 5: 📊 Dashboard Layouts
**Purpose**: Analytics and control interfaces

#### Dashboard Views:

1. **Beta Control Room**
   - Header: Title, live data indicator, refresh button
   - Key metrics: 4-card grid (Audio, Reflections, Theme, Sessions)
   - Trend charts: 3-column layout (line graphs)
   - Alert panel: Status indicators with icons
   - Quick actions: Link buttons to detailed views

2. **Audio Analytics**
   - Browser success rates (horizontal bar chart)
   - Daily unlock trends (line chart)
   - Safari vs Chrome comparison
   - Error breakdown pie chart

3. **Reflection Insights** 
   - Completion rate gauge
   - Top feelings word cloud
   - Weekly submission trends
   - User engagement metrics

4. **Theme Preferences**
   - Distribution pie chart (Light/Dark/System)
   - Switch frequency line graph
   - Time-of-day patterns heatmap
   - User preference breakdowns

---

### Page 6: ✨ Motion Studies
**Purpose**: Animation specifications and examples

#### Animation Examples:

1. **Breathing Elements**
   - Logo breathing (1.6s cycle)
   - Voice button active state
   - Sacred card pulsing
   - Scale: 1.0 → 1.02 → 1.0

2. **Stagger Reveals**
   - Onboarding step transitions
   - Card grid animations  
   - List item appearances
   - Delay: 150ms between elements

3. **Micro-interactions**
   - Button hover growth (1.05x)
   - Input field focus glow
   - Toggle switch flips
   - Notification slide-ins

4. **Voice Animations**
   - Recording pulse rings
   - Audio waveform bars
   - Thinking dot sequence
   - Transcription typing effect

---

### Page 7: 🌓 Dark Mode Variants
**Purpose**: All components in dark theme

#### Dark Mode Adaptations:
- Background: #0f0f0f → #1a1a1a gradient
- Cards: #1a1a1a with rgba(255,255,255,0.1) borders  
- Text: White primary, #a0a0a0 secondary
- Colors: Warmer variants of Soullab palette
- Gradients: Higher contrast for visibility
- Shadows: Subtle glows instead of drop shadows

---

### Page 8: 📱 Mobile Responsive
**Purpose**: Mobile-first component adaptations

#### Breakpoint Demonstrations:
- **375px**: iPhone SE, compact interactions
- **390px**: iPhone 12/13/14, standard mobile
- **768px**: iPad portrait, tablet adaptations  
- **1024px**: iPad landscape, small desktop

#### Mobile Considerations:
- Touch targets minimum 44px
- Thumb-friendly navigation placement
- Collapsible panels and drawers
- Swipe gestures for navigation
- Voice button accessibility

---

## 🔧 Figma Setup Instructions

### Initial Setup:
1. Create new Figma file: "Soullab-Beta-Starter"
2. Set up 8 pages with names above
3. Import Lato and Blair fonts (or use system fallbacks)
4. Create base 8px grid system

### Styles to Create:

#### Color Styles:
- Primary/Terracotta-50 through 900
- Secondary/Sage-50 through 900  
- Accent/Ocean-50 through 900
- Highlight/Amber-50 through 900
- Neutral/Stone-50 through 900

#### Text Styles:
- Display/Blair-48px-700
- H1/Blair-32px-600
- H2/Blair-24px-500
- H3/Blair-18px-500
- Body-Large/Lato-16px-400
- Body/Lato-14px-400  
- Small/Lato-12px-400
- Code/Mono-14px-400

#### Effect Styles:
- Card-Shadow (0 4px 16px rgba(0,0,0,0.08))
- Button-Hover-Glow (0 4px 20px terracotta-30%)
- Input-Focus-Ring (0 0 0 3px ocean-10%)
- Voice-Aura (0 0 40px amber-20%)

### Component Properties:
- Size variants: SM, MD, LG, XL
- State variants: Default, Hover, Active, Disabled
- Theme variants: Light, Dark
- Type variants: Primary, Secondary, Ghost

---

## 📤 Export Settings

### For Development:
- SVG icons at 24x24px
- PNG assets at @1x and @2x  
- Color tokens as CSS custom properties
- Typography scale as rem values
- Spacing system as utility classes

### For Production:
- Optimized images (WebP format)
- Icon sprite sheets
- Design token JSON export
- Component documentation

---

*This structure provides everything needed to design consistently within the Soullab system, from atomic elements to complete user flows.*

**Ready for**: Figma Make import, Uizard generation, development handoff