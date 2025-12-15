# Claude Code Implementation Sequence
## Holoflower Soulprint System

This document contains step-by-step Claude Code prompts for implementing the complete Holoflower system.

---

## ✨ Step 1: HoloflowerMotion.tsx

**Task**: Implement the motion variants and transitions from the motion storyboard into a reusable HoloflowerMotion component.

**Claude Code Prompt:**

```
You are Claude Code. Please create a new file:

📂 components/MaiaCore/HoloflowerMotion.tsx

Requirements:
1. Use **React + Framer Motion**.
2. Implement smooth **morphing/sliding transitions** (no clunky switching).
3. Default animation cycle = **breathing rhythm** (scale 1.0 → 1.05 → 1.0 over ~4s).
4. Motion States (variants):
   - idle → gentle breathing
   - listening → petals expand slightly
   - processing → subtle spiral rotation
   - responding → radiating glow pulses
   - breakthrough → golden bloom (scale up, fade glow)
5. Props:
   - `state`: "idle" | "listening" | "processing" | "responding" | "breakthrough"
   - `children`: ReactNode (to render petals or overlay)
   - `onComplete?`: callback for when breakthrough animation finishes
6. Accessibility:
   - Reduce motion support: if user prefers reduced motion, fallback to static subtle glow
   - Keep animations GPU-friendly (transform + opacity only)
7. Style:
   - Colors: Use **earth-tone palette** (#C85450 fire, #6B9BD1 water, #7A9A65 earth, #D4B896 air, gold #FFD700 for breakthrough)
   - Keep motion sacred, natural, and elegant (not flashy)

Deliverable:
- Export `HoloflowerMotion` component
- Export `motionVariants` object for reuse in MilestoneStates
- Ensure type safety with TypeScript
```

**Expected Output**: Core motion engine that every milestone + petal scaffold will plug into.

---

## ✨ Step 2: EnhancedPetalScaffold.tsx

**Task**: Create an intimate exploration mandala that illuminates the user's everyday world through gentle self-discovery.

**Claude Code Prompt:**

```
You are Claude Code. Please create a new file:

📂 components/MaiaCore/EnhancedPetalScaffold.tsx

**Vision**: This is not a game or assessment tool — it's a gentle mirror that helps users discover what's already glowing within their everyday world. Each petal should feel like a tender invitation to notice patterns already present in their life.

Requirements:
1. Use **React + Framer Motion** with subtle, organic drag gestures.
2. Import facet data from `spiralogic-facets-complete.ts`.
3. Render **12 petals** in sacred mandala formation (30° spacing), but keep it whisper-soft and unobtrusive.

**Each Petal (Intimate Exploration)**:
   - **Whisper Labels**: Show facet names in gentle, lowercase typography (e.g., "creative fire", "deep listening")
   - **Soft Activation**: Draggable from center → edge, but feels like "bringing something forward" rather than scoring
   - **Living Intensity**: Distance = how present this quality feels in their current life (0.0 → 1.0)
   - **Element Colors**: Earth tones that feel warm and familiar, never clinical
   - **Contextual Wisdom**: Hover reveals gentle questions like "Where do you feel this stirring in your days?"

**Interaction Philosophy**:
   - **Organic Movement**: Smooth drag with natural momentum, like moving through water
   - **Gentle Guidance**: Soft haptic feedback (subtle glow) when petal finds resonant position
   - **No Wrong Answers**: Every position is valid — this illuminates, never judges
   - **Everyday Integration**: Visual feedback suggests "this is how this shows up in your world"

**Sacred Technical Details**:
5. Props:
   - `onResonanceChange`: (facetId: string, presence: number) => void (not "score")
   - `currentPresence?`: Record<string, number> (what's alive in their life now)
   - `explorationMode?`: "gentle" | "deep" (affects sensitivity)
6. Layout:
   - **Breathing Space**: Generous white space, never cramped
   - **Mobile Sacred**: Touch gestures feel like ritual, not UI manipulation
   - **Center Light**: Soft glow in center that grows as petals activate (their inner light responding)

**Emotional Intelligence**:
- Animations breathe with human rhythm (4-6 second cycles)
- Colors warm up as petals move outward (cold → alive → radiant)
- Subtle particle effects when high resonance is found (like recognizing truth)
- Sound-friendly: designed to work beautifully with ambient audio

Deliverable:
- Export `EnhancedPetalScaffold` component focused on **intimate self-discovery**
- Export `calculatePresence` utility (not "intensity")
- Gentle error states that never break the sacred mood
- Built-in wisdom: component guides users toward authentic self-recognition
```

---

## ✨ Step 3: MilestoneStates.tsx

**Task**: Create milestone containers that hold sacred space for different depths of self-exploration.

**Claude Code Prompt:**

```
You are Claude Code. Please create a new file:

📂 components/MaiaCore/MilestoneStates.tsx

**Vision**: Each milestone is a different quality of light — from the first gentle dawn to the full radiance of wisdom. They should feel like natural progressions in intimacy with oneself, never like levels to achieve.

Requirements:
1. Import `HoloflowerMotion` and `EnhancedPetalScaffold`.
2. Implement 5 sacred milestone containers that honor the user's natural unfolding:

**The Five Sacred Depths**:
   - `FirstBloom` (3 petals): **"What's stirring?"** — Gentle first touching of inner landscape
     - Copy: "Notice what feels most alive in you right now"
     - Only 3 most resonant facets visible, others soft-dimmed
     - Breathing space, no pressure, pure invitation
   
   - `PatternKeeper` (6 petals): **"What patterns do you see?"** — Recognition of recurring themes
     - Copy: "Your soul has rhythms. What keeps returning?"
     - 6 petals active, gentle pattern-recognition prompts appear
     - Soft connections between related petals (subtle lines)
   
   - `DepthSeeker` (9 petals): **"What wants to be known?"** — Deeper exploration of shadows + light
     - Copy: "Every depth has wisdom. What's asking for attention?"
     - 9 petals, including shadow elements, integration prompts
     - Guided questions that honor difficulty as doorways
   
   - `SacredGardener` (12 petals): **"How does it all weave together?"** — Full mandala awareness
     - Copy: "You are a living ecosystem. How do all parts serve the whole?"
     - All 12 petals, ecosystem view, interconnection awareness
     - Integration wisdom, seasonal cycles, natural wholeness
   
   - `WisdomKeeper` (12 petals + integration): **"How does this serve the world?"** — Outward expression
     - Copy: "Your unique configuration is medicine. How does it want to serve?"
     - All petals + sharing/offering interface, wisdom integration
     - Focus on how inner work becomes outer gift

**Sacred Technical Implementation**:
3. Each milestone creates **held space**, not UI:
   - Gentle entry transitions (never jarring)
   - Milestone-appropriate `explorationMode` passed to scaffold
   - Contextual guidance that feels like gentle companionship
   - Integration with `HoloflowerMotion` for sacred state changes

4. Props:
   - `currentMilestone`: milestone key
   - `soulPresence`: Record<string, number> (current authentic expression)
   - `onDepthening`: (newPresence: Record<string, number>) => void
   - `guidanceMode`: "whisper" | "gentle" | "supportive" (never pushy)

**Wisdom Integration**:
- Each milestone offers different **qualities of invitation**
- Built-in rest periods between explorations
- Gentle "return anytime" messaging
- No forced progression — only organic deepening when ready

Deliverable:
- Export individual milestone components that feel like **sacred containers**
- Export `MilestoneRenderer` with seamless depth-transitions
- Built-in wisdom: each milestone offers exactly the right invitation for that depth
- Integration wisdom that helps users see how their inner work serves their everyday world
```

---

*Additional steps (4-7) will be added as implementation progresses...*