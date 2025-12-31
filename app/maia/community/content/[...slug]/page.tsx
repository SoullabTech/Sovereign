'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Lightbulb,
  Quote,
  Image,
  Link as LinkIcon,
  Clock,
  User,
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

/**
 * Community Commons Content Viewer
 *
 * Displays content from the Community-Commons folder based on URL slugs.
 * Routes like /maia/community/content/concepts/nigredo map to content files.
 */

// Content mapping - maps URL paths to content metadata
const contentMap: Record<string, {
  title: string;
  description: string;
  type: 'concept' | 'essay' | 'practice' | 'voice' | 'image' | 'resource';
  readTime?: string;
  content: string;
}> = {
  // Core Concepts
  'concepts/nigredo': {
    title: 'Nigredo - The Sacred Descent',
    description: 'The alchemical stage of breakdown and purification',
    type: 'concept',
    readTime: '8 min',
    content: `
# Nigredo - The Sacred Descent

Nigredo, meaning "blackening" in Latin, represents the first stage of the alchemical process. In psychological terms, it corresponds to the confrontation with the shadow and the initial breakdown of ego structures.

## The Nature of Nigredo

In alchemical psychology, nigredo is not a failure but a necessary beginning. It represents:

- **Dissolution of the old self** - The breaking down of rigid patterns and defenses
- **Confrontation with shadow** - Meeting the rejected and repressed aspects of psyche
- **The dark night of the soul** - A period of confusion, disorientation, and apparent loss

## Working with Nigredo

When experiencing nigredo:

1. **Don't rush through it** - This stage requires patience and presence
2. **Witness without judgment** - Observe what emerges without trying to fix or change it
3. **Stay embodied** - Ground yourself in physical sensation
4. **Seek support** - This work is best done with guidance and community

## The Gift of Darkness

As Jung wrote, "One does not become enlightened by imagining figures of light, but by making the darkness conscious." The nigredo stage, while difficult, is where the most profound transformation begins.

> "The alchemists knew that the value was to be found in the shadow, in the darkness, in what we normally reject." — James Hillman

---

*This content is part of the MAIA Community Commons - a sacred repository for consciousness exploration.*
    `
  },
  'concepts/albedo': {
    title: 'Albedo - The Whitening',
    description: 'Essential concept cards for understanding alchemical psychology',
    type: 'concept',
    readTime: '6 min',
    content: `
# Albedo - The Whitening

Albedo, or "whitening," is the second major stage of the alchemical opus. Following the darkness of nigredo, albedo represents the emergence of clarity and the first glimpse of transformation.

## The Dawn After Darkness

In the albedo stage:

- **Purification occurs** - The prima materia begins to be refined
- **Reflection emerges** - Self-awareness and insight develop
- **Feminine principle awakens** - The anima or soul-image becomes visible

## Psychological Correlates

In depth psychology, albedo corresponds to:

1. **Gaining perspective** on previously unconscious material
2. **Integration of shadow** content encountered in nigredo
3. **Development of psychological insight** and self-reflection

## The Silver Work

Albedo is associated with silver, the moon, and feminine wisdom. It represents the receptive, reflective quality of consciousness that can hold and transform experience.

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'concepts/citrinitas': {
    title: 'Citrinitas - The Yellowing',
    description: 'The dawn of consciousness and insight',
    type: 'concept',
    readTime: '7 min',
    content: `
# Citrinitas - The Yellowing

Citrinitas, the "yellowing," represents the third stage of alchemical transformation. This is the dawn stage, where the first rays of solar consciousness illuminate the work.

## The Rising Sun

Citrinitas marks:

- **The emergence of consciousness** - Awareness becomes active rather than merely receptive
- **Solar illumination** - The masculine principle of logos begins to organize experience
- **Integration of opposites** - The conjunction of lunar and solar, feeling and thinking

## The Gold Begins to Show

In this stage, the golden nature of the self begins to become visible. Not yet the full rubedo, but hints of the treasure that lies within.

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'concepts/soul-spirit': {
    title: 'Soul vs Spirit',
    description: 'Understanding the fundamental distinction',
    type: 'concept',
    readTime: '10 min',
    content: `
# Soul vs Spirit: The Fundamental Distinction

One of the most important distinctions in depth psychology is between soul (anima) and spirit (animus/pneuma). This distinction shapes how we approach psychological and spiritual work.

## Spirit: The Way Up

Spirit tends toward:
- Ascent and transcendence
- Unity and the universal
- Light and clarity
- Abstraction and principle

## Soul: The Way Down

Soul tends toward:
- Descent and depth
- Particularity and image
- Shadow and complexity
- Embodiment and feeling

## Why This Matters

As James Hillman emphasized, much of what passes for spiritual growth is actually a flight from soul. True psychological work honors both movements.

> "The soul has been abandoned by spirit. We must now learn to care for the soul, to make soul."

---

*This content is part of the MAIA Community Commons.*
    `
  },
  // Thematic Essays
  'essays/against-literalization': {
    title: 'Against Literalization',
    description: 'Deep explorations of key themes in depth psychology',
    type: 'essay',
    readTime: '15 min',
    content: `
# Against Literalization

One of the greatest dangers in psychological work is the tendency to literalize - to take symbolic, imaginal content and reduce it to literal, concrete meaning.

## The Problem of Literalism

When we literalize:
- Dreams become predictions rather than poetry
- Archetypes become personality types
- Symptoms become problems to be solved
- Images become allegories with fixed meanings

## The Soul Speaks in Images

Jung understood that the psyche thinks in images, not concepts. When we literalize these images, we kill their living meaning.

## Staying with the Image

The practice of "sticking with the image" (Hillman) means:
- Resisting the urge to interpret immediately
- Allowing images to unfold and reveal themselves
- Honoring ambiguity and multiplicity
- Letting the image work on us

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'essays/stick-with-image': {
    title: 'Stick with the Image',
    description: 'Staying with the symbolic rather than reducing to literal',
    type: 'essay',
    readTime: '12 min',
    content: `
# Stick with the Image

"Stick with the image" was one of James Hillman's most important clinical instructions. It represents a fundamental shift in how we work with psychological material.

## The Temptation to Move Away

We naturally want to:
- Explain what the image "means"
- Connect it to past events
- Find the "real" content behind it
- Move quickly to solutions

## The Practice of Staying

Instead, we learn to:
- Describe the image in detail
- Notice our responses to it
- Ask what the image wants
- Let it speak in its own terms

## Why This Works

Images carry their own intelligence. When we stay with them rather than translating them into concepts, they can work on us, transforming consciousness from within.

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'essays/depression-soul-work': {
    title: 'Depression as Soul Work',
    description: 'Reframing depression as meaningful psychological work',
    type: 'essay',
    readTime: '18 min',
    content: `
# Depression as Soul Work

What if depression, rather than being a malfunction to be corrected, is actually the soul attempting to do important work?

## The Conventional View

Modern psychology often treats depression as:
- A chemical imbalance
- A negative state to be eliminated
- A failure of positive thinking
- A problem to be solved

## The Depth Perspective

From a depth psychology perspective, depression may be:
- The psyche's attempt to go deeper
- A slowing down that allows reflection
- Saturn's necessary heaviness
- The soul demanding attention

## Working With Rather Than Against

This doesn't mean suffering is good or that treatment is wrong. Rather, it means listening to what the depression might be trying to communicate before rushing to eliminate it.

> "The soul requires what it requires. To deny the descent is to be dragged down anyway." — James Hillman

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'essays/spiralogic': {
    title: 'Spiralogic of Soul Integration',
    description: 'Deep integration of Jung, Edinger, and Hillman approaches',
    type: 'essay',
    readTime: '25 min',
    content: `
# The Spiralogic of Soul Integration

Spiralogic represents a synthesis of depth psychological approaches, recognizing that psychological development moves not in a line but in a spiral.

## The Spiral Path

Unlike linear models of growth, spiralogic recognizes that:
- We return to the same themes at different levels
- Progress includes regress
- Each return is also a deepening
- The path curves back on itself while moving forward

## Integration of Approaches

Spiralogic brings together:
- Jung's individuation process
- Hillman's archetypal psychology
- Edinger's ego-Self axis
- Marlan's work on the black sun

## The 12 Facets

The spiralogic model identifies 12 facets of psychological experience, each with its own wisdom and shadow:

1. Origin - The source and beginning
2. Formation - Taking shape and structure
3. Expression - Creative manifestation
4. Foundation - Grounding and stability
...and more

---

*This content is part of the MAIA Community Commons.*
    `
  },
  // Practices
  'practices/active-imagination': {
    title: 'Active Imagination Practice',
    description: "Jung's revolutionary method for engaging unconscious content",
    type: 'practice',
    readTime: '15 min',
    content: `
# Active Imagination Practice

Active imagination is Jung's method for consciously engaging with unconscious content. Unlike passive fantasy, it involves the ego as an active participant in the imaginal dialogue.

## The Basic Method

1. **Begin in stillness** - Find a quiet space and settle into a relaxed but alert state
2. **Evoke an image** - Allow an image, figure, or feeling to emerge
3. **Engage actively** - Enter into dialogue or interaction with what appears
4. **Record the experience** - Write, draw, or otherwise capture what occurred

## Important Guidelines

- Maintain ego presence - Don't be overwhelmed by the material
- Take it seriously - The figures you meet are real psychic entities
- Follow ethical principles - Even in imagination, act with integrity
- Process afterward - Work with what emerged

## Cautions

Active imagination is powerful work and not appropriate for everyone. If you have a history of psychosis or severe dissociation, work only with professional guidance.

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'practices/shadow-work': {
    title: 'Shadow Work Techniques',
    description: 'Step-by-step guides for personal and clinical work',
    type: 'practice',
    readTime: '20 min',
    content: `
# Shadow Work Techniques

The shadow contains all the parts of ourselves that we have rejected, denied, or never developed. Shadow work involves consciously engaging with this material.

## Recognizing the Shadow

The shadow often appears as:
- Strong emotional reactions to others
- Recurring dreams with dark figures
- Behaviors we criticize in others
- Parts of ourselves we try to hide

## Working with Shadow

1. **Identify projections** - Notice when you have intense reactions to others
2. **Reclaim the projection** - Ask "How is this also true of me?"
3. **Dialogue with shadow** - Use active imagination to engage
4. **Integrate gradually** - This is slow, careful work

## The Gold in the Shadow

Jung noted that "90% of the shadow is pure gold." Much of our creative potential and authentic self lies in shadow.

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'practices/dream-work': {
    title: 'Dream Work Methods',
    description: 'Approaches to working with dreams therapeutically',
    type: 'practice',
    readTime: '14 min',
    content: `
# Dream Work Methods

Dreams are the royal road to the unconscious. Here are approaches for working with dreams that honor their depth and complexity.

## Recording Dreams

- Keep a journal by your bed
- Write immediately upon waking
- Include feelings, not just events
- Note recurring elements over time

## Working with Dreams

1. **Describe, don't interpret** - First, just describe the dream in detail
2. **Amplify** - What associations does each element evoke?
3. **Notice affect** - What feelings arise in the dream and after?
4. **Stay with images** - Resist quick meanings

## The Dream Ego

Pay attention to what "you" do in the dream. The dream ego often shows patterns and potentials we don't see in waking life.

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'practices/embodied-awareness': {
    title: 'Embodied Awareness',
    description: 'Somatic approaches to psychological transformation',
    type: 'practice',
    readTime: '12 min',
    content: `
# Embodied Awareness

The soul is not separate from the body. Embodied awareness practices help us access psychological material through somatic experience.

## The Body Knows

The body holds:
- Memories not accessible to conscious mind
- Emotional patterns and defenses
- Wisdom about what we need
- The felt sense of experience

## Basic Practices

1. **Body scan** - Move attention slowly through the body
2. **Breath awareness** - Notice the breath without changing it
3. **Grounding** - Feel your connection to the earth
4. **Tracking sensation** - Follow physical sensations with curiosity

## Integration

Embodied awareness supports all other psychological work by keeping us grounded in lived experience rather than floating in concepts.

---

*This content is part of the MAIA Community Commons.*
    `
  },
  // Voices
  'voices/jung': {
    title: 'Jung Collection',
    description: 'Direct quotes and dialogues from C.G. Jung',
    type: 'voice',
    content: `
# C.G. Jung - Collected Wisdom

Selected quotes and passages from the founder of analytical psychology.

---

> "One does not become enlightened by imagining figures of light, but by making the darkness conscious."

---

> "Until you make the unconscious conscious, it will direct your life and you will call it fate."

---

> "The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed."

---

> "I am not what happened to me, I am what I choose to become."

---

> "The privilege of a lifetime is to become who you truly are."

---

> "Everything that irritates us about others can lead us to an understanding of ourselves."

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'voices/hillman': {
    title: 'Hillman Wisdom',
    description: 'James Hillman on archetypal psychology',
    type: 'voice',
    content: `
# James Hillman - Archetypal Wisdom

Selected quotes from the founder of archetypal psychology.

---

> "The soul has been abandoned by spirit. We must now learn to care for the soul, to make soul."

---

> "The great task of any culture is the tending of soul, the cultivation of its images, and the examination of its fantasies."

---

> "We are not cured of our pathology; we are revealed by it."

---

> "Stick with the image."

---

> "Psychology is ultimately mythology, the study of the stories of the soul."

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'voices/marlan': {
    title: 'Marlan Insights',
    description: 'Stanton Marlan on the black sun and darkness',
    type: 'voice',
    content: `
# Stanton Marlan - The Black Sun

Insights on the role of darkness in psychological transformation.

---

> "The black sun illuminates what cannot be seen in ordinary light."

---

> "In the depth of the nigredo, the sol niger shines with a different kind of knowing."

---

> "The black sun is not the absence of light but a different order of illumination."

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'voices/edinger': {
    title: 'Edinger Teachings',
    description: 'Edward Edinger on ego-Self axis',
    type: 'voice',
    content: `
# Edward Edinger - Ego and Self

Teachings on the relationship between ego and Self.

---

> "The ego-Self axis is the vital connecting link between ego and Self that ensures the integrity of the ego and its ongoing relationship with the unconscious."

---

> "Inflation and alienation are the two poles between which the ego oscillates in its relationship to the Self."

---

> "Individuation is the conscious realization and integration of all the possibilities inherent in the individual."

---

*This content is part of the MAIA Community Commons.*
    `
  },
  // Images
  'images/classical-alchemical': {
    title: 'Classical Alchemical Art',
    description: 'Traditional alchemical illustrations and symbolism',
    type: 'image',
    content: `
# Classical Alchemical Art

A collection of traditional alchemical imagery from the Western tradition.

## The Alchemical Tradition

Alchemy developed a rich visual language to communicate psychological and spiritual truths:

- **The Philosopher's Stone** - Symbol of the completed work
- **The Hermaphrodite** - Union of opposites
- **The Ouroboros** - Cyclical nature of the work
- **The Athanor** - The vessel of transformation

## Featured Works

*This section would include carefully selected public domain alchemical illustrations with commentary on their psychological significance.*

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'images/contemporary': {
    title: 'Contemporary Interpretations',
    description: 'Modern artistic expressions of depth psychology',
    type: 'image',
    content: `
# Contemporary Interpretations

Modern artistic expressions that engage with depth psychological themes.

## The Living Tradition

Contemporary artists continue to work with archetypal and alchemical imagery, bringing new life to ancient symbols.

*This section would feature curated contemporary artwork with artist permission.*

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'images/dreams-visions': {
    title: 'Dreams & Visions',
    description: 'Visual material supporting psychological work',
    type: 'image',
    content: `
# Dreams & Visions Gallery

Visual resources for dreamwork and active imagination.

## Working with Visual Material

Images can serve as portals into psychological experience:
- Meditation aids
- Active imagination starting points
- Dream amplification resources

---

*This content is part of the MAIA Community Commons.*
    `
  },
  // Resources
  'resources/books': {
    title: 'Essential Books',
    description: 'Curated reading list for depth psychology',
    type: 'resource',
    content: `
# Essential Books for Depth Psychology

A curated reading list for those exploring consciousness and transformation.

## Foundational Texts

### C.G. Jung
- *Memories, Dreams, Reflections* - Jung's autobiography
- *Man and His Symbols* - Accessible introduction
- *The Red Book* - Jung's personal journey

### James Hillman
- *Re-Visioning Psychology* - Foundational archetypal text
- *The Soul's Code* - On calling and destiny
- *The Dream and the Underworld* - Dreams from an archetypal perspective

### Other Essential Authors
- Marion Woodman - Body and soul
- Robert Johnson - Working with shadow
- Edward Edinger - Ego and Self
- Stanton Marlan - The black sun

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'resources/articles': {
    title: 'Research Articles',
    description: 'Academic papers and scholarly works',
    type: 'resource',
    content: `
# Research Articles

Academic and scholarly resources for deeper study.

## Recommended Papers

*This section would contain curated academic articles on depth psychology, consciousness studies, and related fields.*

## Journals
- *Journal of Analytical Psychology*
- *Spring: A Journal of Archetype and Culture*
- *Psychological Perspectives*

---

*This content is part of the MAIA Community Commons.*
    `
  },
  'resources/videos': {
    title: 'Video Resources',
    description: 'Lectures, documentaries, and presentations',
    type: 'resource',
    content: `
# Video Resources

Lectures, documentaries, and presentations on depth psychology.

## Recommended Viewing

### Documentaries
- *Matter of Heart* - Documentary on Jung
- *The Way of the Dream* - Marie-Louise von Franz

### Lectures
*Curated collection of talks by major figures in the field.*

---

*This content is part of the MAIA Community Commons.*
    `
  }
};

const typeColors: Record<string, { bg: string; text: string }> = {
  concept: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  essay: { bg: 'bg-green-500/20', text: 'text-green-400' },
  practice: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  voice: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  image: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  resource: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' }
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  concept: BookOpen,
  essay: FileText,
  practice: Lightbulb,
  voice: Quote,
  image: Image,
  resource: LinkIcon
};

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const slugArray = params?.slug as string[];
  const fullSlug = slugArray?.join('/') || '';

  const content = contentMap[fullSlug];

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/maia/community/commons')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Commons
          </button>

          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#D4B896] mb-2">Content Not Found</h1>
            <p className="text-white/60 mb-6">
              The requested content "{fullSlug}" could not be found.
            </p>
            <button
              onClick={() => router.push('/maia/community/commons')}
              className="px-6 py-3 bg-[#D4B896]/20 border border-[#D4B896]/30 text-[#D4B896]
                       rounded-lg hover:bg-[#D4B896]/30 transition-all"
            >
              Browse All Content
            </button>
          </div>
        </div>
      </div>
    );
  }

  const TypeIcon = typeIcons[content.type] || BookOpen;
  const colors = typeColors[content.type] || typeColors.concept;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/maia/community/commons')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Commons
          </button>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-md text-sm ${colors.bg} ${colors.text}`}>
              {content.type}
            </span>
            {content.readTime && (
              <span className="flex items-center gap-1 text-white/50 text-sm">
                <Clock className="w-4 h-4" />
                {content.readTime}
              </span>
            )}
          </div>
        </div>

        {/* Content Header - Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative py-8">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-[0.02]"
                 style={{
                   backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                   backgroundSize: '24px 24px'
                 }} />

            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Icon with glow effect */}
              <div className="relative">
                <div className={`absolute inset-0 ${colors.bg} blur-xl opacity-50`} />
                <div className={`relative p-4 rounded-2xl ${colors.bg} border border-white/10`}>
                  <TypeIcon className={`w-10 h-10 ${colors.text}`} />
                </div>
              </div>

              <div className="flex-1">
                {/* Title with elegant typography */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-[#D4B896]
                             tracking-tight mb-4 leading-[1.15]">
                  {content.title}
                </h1>

                {/* Description */}
                <p className="text-lg text-white/60 mb-6 max-w-2xl leading-relaxed">
                  {content.description}
                </p>

                {/* Meta info bar */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className={`px-3 py-1.5 rounded-full ${colors.bg} ${colors.text}
                                 border border-white/5 uppercase tracking-wider text-xs font-medium`}>
                    {content.type}
                  </span>
                  {content.readTime && (
                    <span className="flex items-center gap-2 text-white/40">
                      <Clock className="w-4 h-4" />
                      {content.readTime} read
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-white/40">
                    <BookOpen className="w-4 h-4" />
                    Community Commons
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative line */}
            <div className="mt-10 h-px bg-gradient-to-r from-[#D4B896]/20 via-[#D4B896]/10 to-transparent" />
          </div>
        </motion.div>

        {/* Content Body - Frosted Glass Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          {/* Ambient glow behind container */}
          <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 blur-3xl" />

          {/* Main frosted glass container */}
          <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02]
                        backdrop-blur-xl border border-white/[0.08] rounded-2xl
                        shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">

            {/* Subtle top border accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4B896]/30 to-transparent" />

            {/* Inner content with generous padding */}
            <div className="p-8 md:p-12 lg:p-16">
              {/* Article content */}
              <article className="prose-article">
                {content.content.split('\n').map((line, i) => {
                  // Main title (H1) - elegant serif styling
                  if (line.startsWith('# ')) {
                    return (
                      <h1 key={i} className="text-3xl md:text-4xl font-serif font-light text-[#D4B896]
                                           tracking-tight mt-0 mb-8 leading-tight">
                        {line.slice(2)}
                      </h1>
                    );
                  }
                  // Section headers (H2)
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={i} className="text-xl md:text-2xl font-semibold text-[#D4B896]/90
                                           mt-12 mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-gradient-to-r from-[#D4B896]/50 to-transparent" />
                        {line.slice(3)}
                      </h2>
                    );
                  }
                  // Subsection headers (H3)
                  if (line.startsWith('### ')) {
                    return (
                      <h3 key={i} className="text-lg font-medium text-[#D4B896]/80 mt-8 mb-4
                                           uppercase tracking-wider text-sm">
                        {line.slice(4)}
                      </h3>
                    );
                  }
                  // Blockquotes - elegant pull quote styling
                  if (line.startsWith('> ')) {
                    return (
                      <blockquote key={i} className="relative my-10 py-6 px-8
                                                   bg-gradient-to-r from-[#D4B896]/5 to-transparent
                                                   border-l-2 border-[#D4B896]/40 rounded-r-lg">
                        <span className="absolute -top-4 left-4 text-5xl text-[#D4B896]/20 font-serif">"</span>
                        <p className="text-lg md:text-xl italic text-white/80 leading-relaxed font-light">
                          {line.slice(2).replace(/— (.*)$/, '')}
                        </p>
                        {line.includes('—') && (
                          <cite className="block mt-4 text-sm text-[#D4B896]/70 not-italic">
                            — {line.match(/— (.*)$/)?.[1]}
                          </cite>
                        )}
                      </blockquote>
                    );
                  }
                  // Lists - refined bullet styling
                  if (line.startsWith('- ')) {
                    const textContent = line.slice(2);
                    const hasStrong = textContent.includes('**');
                    return (
                      <div key={i} className="flex gap-3 mb-3 group">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#D4B896]/40
                                       group-hover:bg-[#D4B896]/70 transition-colors flex-shrink-0" />
                        <span className="text-white/75 leading-relaxed">
                          {hasStrong ? (
                            <>
                              <strong className="text-[#D4B896] font-medium">
                                {textContent.match(/\*\*(.*?)\*\*/)?.[1]}
                              </strong>
                              {textContent.replace(/\*\*(.*?)\*\*/, '').replace(' - ', ' — ')}
                            </>
                          ) : (
                            textContent
                          )}
                        </span>
                      </div>
                    );
                  }
                  // Numbered lists
                  if (line.match(/^\d+\. /)) {
                    const num = line.match(/^(\d+)\./)?.[1];
                    const textContent = line.replace(/^\d+\. /, '');
                    const hasStrong = textContent.includes('**');
                    return (
                      <div key={i} className="flex gap-4 mb-4">
                        <span className="w-7 h-7 rounded-full bg-[#D4B896]/10 border border-[#D4B896]/20
                                       flex items-center justify-center text-sm text-[#D4B896]/70 flex-shrink-0">
                          {num}
                        </span>
                        <span className="text-white/75 leading-relaxed pt-0.5">
                          {hasStrong ? (
                            <>
                              <strong className="text-[#D4B896] font-medium">
                                {textContent.match(/\*\*(.*?)\*\*/)?.[1]}
                              </strong>
                              {textContent.replace(/\*\*(.*?)\*\*/, '').replace(' - ', ' — ')}
                            </>
                          ) : (
                            textContent
                          )}
                        </span>
                      </div>
                    );
                  }
                  // Horizontal rule - elegant divider
                  if (line.startsWith('---')) {
                    return (
                      <div key={i} className="my-12 flex items-center justify-center gap-4">
                        <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#D4B896]/30" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4B896]/30" />
                        <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#D4B896]/30" />
                      </div>
                    );
                  }
                  // Italic text (for footnotes) - subtle footer styling
                  if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                    return (
                      <p key={i} className="text-white/40 text-sm italic mt-12 pt-6
                                          border-t border-white/5 text-center">
                        {line.slice(1, -1)}
                      </p>
                    );
                  }
                  // Regular paragraphs - refined typography
                  if (line.trim()) {
                    return (
                      <p key={i} className="text-white/75 leading-[1.8] mb-6 text-[1.05rem]">
                        {line}
                      </p>
                    );
                  }
                  return null;
                })}
              </article>
            </div>

            {/* Subtle bottom border accent */}
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        </motion.div>

        {/* Navigation Footer */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => router.push('/maia/community/commons')}
            className="flex items-center gap-2 text-[#D4B896]/70 hover:text-[#D4B896] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Commons
          </button>

          <div className="text-white/40 text-sm">
            Part of the MAIA Community Commons
          </div>
        </div>
      </div>
    </div>
  );
}
