'use client';

/**
 * Elemental Pathway Detail Page
 *
 * Shows the 3 houses in each elemental pathway (Fire/Water/Earth/Air)
 * and the archetypal journey through consciousness
 *
 * Dune/Blade Runner aesthetic: Desert mysticism meets cyberpunk precision
 */

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flame, Droplet, Globe, Wind, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Pathway definitions matching Spiralogic model
const PATHWAYS = {
  fire: {
    name: 'Fire Pathway',
    icon: Flame,
    houses: [1, 5, 9],
    journey: ['Experience', 'Expression', 'Expansion'],
    subtitle: 'Vision & Projection',
    description: 'The Fire pathway illuminates consciousness through direct encounter, creative manifestation, and philosophical exploration. This is the path of the seer, the artist, and the sage.',
    houseDetails: [
      {
        number: 1,
        name: 'I Am / Vision / Identity',
        theme: 'Experience',
        description: 'Self-Awareness & Identity. The initiating intelligence of consciousness meeting itself. Right Prefrontal Cortex generating compelling vision for the future. This is the vector—the arrow of conscious identity pointing toward possibility.',
        questions: [
          'How do you experience your own aliveness?',
          'What vision wants to move through you?',
          'Where does your identity feel most authentic?'
        ]
      },
      {
        number: 5,
        name: 'Self-Expression / Creation',
        theme: 'Expression',
        description: 'Creative Expression & Passion. The circle—vision becomes cyclical creative output. Right Prefrontal expressing through joy, art, romance, play. Consciousness discovers itself by creating.',
        questions: [
          'What wants to be created through you?',
          'Where does your passion demand embodiment?',
          'How do you express your authentic fire?'
        ]
      },
      {
        number: 9,
        name: 'Higher Meaning / Quest',
        theme: 'Expansion',
        description: 'Higher Purpose & Expansion. The spiral—vision expands into spiritual fulfillment. Philosophy, teaching, distant horizons. Your personal fire serves collective illumination.',
        questions: [
          'What higher meaning calls you forward?',
          'Where must you journey to meet expanded self?',
          'How does your vision serve the whole?'
        ]
      }
    ],
    color: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-950/20 to-red-950/20',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    glowColor: 'shadow-orange-600/30'
  },
  water: {
    name: 'Water Pathway',
    icon: Droplet,
    houses: [4, 8, 12],
    journey: ['Heart', 'Healing', 'Holiness'],
    subtitle: 'Introspection & Depth',
    description: 'The Water pathway descends into the depths of soul, emotion, and the unconscious. This is the path of the mystic, the healer, and the one who surrenders to the mystery.',
    houseDetails: [
      {
        number: 4,
        name: 'Inner Child / Ancestry',
        theme: 'Heart',
        description: 'Emotional Intelligence & Inner Stability. The vector—Right Hemisphere reflecting depth and fluidity of inner self. Roots, home, family lineage. The primal waters of belonging where heart first learns to feel.',
        questions: [
          'What does "home" mean to your soul?',
          'Which ancestral patterns ask for healing?',
          'Where do you touch the eternal mother?'
        ]
      },
      {
        number: 8,
        name: 'Shadow / Rebirth',
        theme: 'Healing',
        description: 'Shadow Work & Power Mastery. The circle—Right Hemisphere uncovering deepest truths through transformation. Death, sex, merger, shared resources. Water dissolves ego boundaries to reveal hidden power.',
        questions: [
          'What must die so you can be reborn?',
          'Where does intimacy terrify and call you?',
          'What power emerges when you surrender control?'
        ]
      },
      {
        number: 12,
        name: 'Dream / Mystic / Transcendent',
        theme: 'Holiness',
        description: 'Mysticism & Past-Life Karma. The spiral—Right Hemisphere facilitating internal alignment and spiritual awareness. Dreams, solitude, dissolution. The individual droplet remembers it is the entire ocean.',
        questions: [
          'What wants to dissolve into oneness?',
          'Where do you meet the nameless sacred?',
          'How does your dream-life guide waking reality?'
        ]
      }
    ],
    color: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-950/20 to-indigo-950/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    glowColor: 'shadow-blue-600/30'
  },
  earth: {
    name: 'Earth Pathway',
    icon: Globe,
    houses: [2, 6, 10],
    journey: ['Mission', 'Means', 'Medicine'],
    subtitle: 'Manifestation & Grounding',
    description: 'The Earth pathway brings consciousness into form, skill, and mastery. This is the path of the craftsperson, the healer, and the elder who serves the community.',
    houseDetails: [
      {
        number: 2,
        name: 'Resources / Value',
        theme: 'Means',
        description: 'Resources & Material Stability. The circle—Left Hemisphere shaping passions into concrete plans. Values, talents, possessions. Earth teaches that resources flow through skillful stewardship.',
        questions: [
          'What resources already live in you?',
          'What do you truly value beyond money?',
          'How do you shape raw gifts into usable form?'
        ]
      },
      {
        number: 6,
        name: 'Structure / Service',
        theme: 'Medicine',
        description: 'Health & Disciplined Growth. The spiral—Left Hemisphere nurturing the mission through discipline. Daily practice, health, service, devotion. The apprenticeship where skill becomes mastery.',
        questions: [
          'What daily practices shape your being?',
          'How does your body become your medicine?',
          'Where does discipline become devotion?'
        ]
      },
      {
        number: 10,
        name: 'Mission / Purpose',
        theme: 'Mission',
        description: 'Career, Authority & Life Mission. The vector—Left Hemisphere grounding visions into tangible reality. Public role, legacy, contribution. Earth demands your gifts become offerings that feed the collective.',
        questions: [
          'What mission calls you toward mastery?',
          'How does your work serve the whole?',
          'What will remain when you return to earth?'
        ]
      }
    ],
    color: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-950/20 to-emerald-950/20',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    glowColor: 'shadow-green-600/30'
  },
  air: {
    name: 'Air Pathway',
    icon: Wind,
    houses: [3, 7, 11],
    journey: ['Connection', 'Community', 'Consciousness'],
    subtitle: 'Communication & Connection',
    description: 'The Air pathway moves through relationship, thought, and collective vision. This is the path of the messenger, the partner, and the revolutionary who serves the future.',
    houseDetails: [
      {
        number: 3,
        name: 'Mind / Messaging',
        theme: 'Consciousness',
        description: 'Communication & Learning. The spiral—Left Prefrontal transforming experience into clear intelligence. Siblings, early learning, local environment. Air carries messages that shape collective thought.',
        questions: [
          'How do you naturally communicate truth?',
          'What ideas demand to move through you?',
          'Where does your mind serve collective awakening?'
        ]
      },
      {
        number: 7,
        name: 'Mirror / Relationships',
        theme: 'Connection',
        description: 'Relationships & Balance. The vector—Left Prefrontal involved in communication and relationships. One-on-one partnership, marriage, contracts. Air becomes dialogue where you discover self through other.',
        questions: [
          'What does partnership teach you about yourself?',
          'Where do you need to listen rather than speak?',
          'How does relationship become your mirror?'
        ]
      },
      {
        number: 11,
        name: 'Tribe / Visionary Network',
        theme: 'Community',
        description: 'Social Influence & Collective Impact. The circle—Left Prefrontal building cooperative communities. Groups, networks, social movements. Air expands individual consciousness into collective vision.',
        questions: [
          'What future calls you to co-create?',
          'Which collective movements need your gifts?',
          'How does your network become medicine?'
        ]
      }
    ],
    color: 'from-cyan-500 to-sky-600',
    bgGradient: 'from-cyan-950/20 to-sky-950/20',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    glowColor: 'shadow-cyan-600/30'
  }
};

export default function PathwayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const element = params.element as string;

  const pathway = PATHWAYS[element as keyof typeof PATHWAYS];

  if (!pathway) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/20 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-400/60 mb-4">Pathway not found</p>
          <Link href="/astrology" className="text-amber-500 hover:text-amber-400">
            ← Return to chart
          </Link>
        </div>
      </div>
    );
  }

  const Icon = pathway.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950/20 to-black">
      {/* Ambient background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link
          href="/astrology"
          className="inline-flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cosmic Blueprint
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${pathway.color} rounded-full mb-6`}>
            <Icon className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">{pathway.name}</span>
          </div>

          <h1 className="text-5xl font-bold text-amber-100 mb-4">
            {pathway.subtitle}
          </h1>

          <p className="text-amber-300/80 text-lg max-w-3xl mx-auto leading-relaxed">
            {pathway.description}
          </p>
        </motion.div>

        {/* Journey Flow */}
        <div className="flex items-center justify-center gap-4 mb-16">
          {pathway.journey.map((stage, i) => (
            <div key={stage} className="flex items-center">
              <div className={`px-6 py-3 bg-gradient-to-br ${pathway.bgGradient} border ${pathway.borderColor} rounded-lg`}>
                <span className={`${pathway.textColor} font-semibold`}>{stage}</span>
              </div>
              {i < pathway.journey.length - 1 && (
                <div className="mx-2 text-amber-600">→</div>
              )}
            </div>
          ))}
        </div>

        {/* House Cards */}
        <div className="space-y-12">
          {pathway.houseDetails.map((house, index) => (
            <motion.div
              key={house.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br from-stone-900/80 via-amber-950/40 to-stone-900/80 backdrop-blur-xl border ${pathway.borderColor} rounded-2xl p-8 shadow-2xl ${pathway.glowColor}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`text-4xl font-bold ${pathway.textColor}`}>
                      {house.number}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-amber-100">{house.name}</h2>
                      <p className="text-amber-500/60 text-sm uppercase tracking-wider">
                        {house.theme}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`p-3 bg-gradient-to-br ${pathway.bgGradient} border ${pathway.borderColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${pathway.textColor}`} />
                </div>
              </div>

              <p className="text-amber-300/80 text-lg leading-relaxed mb-8">
                {house.description}
              </p>

              {/* Soul Questions */}
              <div className="space-y-4">
                <h3 className="text-amber-100 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Soul Questions
                </h3>
                <div className="space-y-3">
                  {house.questions.map((question, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-amber-400/70 italic"
                    >
                      <span className={`${pathway.textColor} mt-1`}>•</span>
                      <span>{question}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TODO: Show planets in this house from user's chart */}
              <div className="mt-8 pt-6 border-t border-amber-900/30">
                <p className="text-amber-600/60 text-sm">
                  Connect your birth chart to see which planets activate this house in your life
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Talk to MAIA CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-amber-950/40 to-stone-900/80 border border-amber-900/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-amber-100 mb-4">
              Explore This Pathway with MAIA
            </h3>
            <p className="text-amber-400/70 mb-6 max-w-2xl mx-auto">
              Have a conversation with MAIA about how the {pathway.name.toLowerCase()} shows up in your life.
              She can help you understand the archetypal journey through these houses.
            </p>
            <Link
              href="/maia"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-600/30 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              Talk to MAIA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
