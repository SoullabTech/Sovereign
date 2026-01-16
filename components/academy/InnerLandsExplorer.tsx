'use client';

/**
 * InnerLandsExplorer
 * Immersive exploration interface for Young Explorers
 *
 * De-cringed for 14-year-olds who play Zelda/Fortnite/Roblox.
 * Short. Direct. No self-help language. Game-world feel.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Flame,
  Moon,
  Droplets,
  Users,
  Anvil,
  Map,
  Compass
} from 'lucide-react';

interface InnerLandsExplorerProps {
  onClose: () => void;
  onAskMaia?: (content: string) => void;
}

type LandId = 'map' | 'watchtower' | 'furnace' | 'undercroft' | 'well' | 'crossroads' | 'forge';

interface Land {
  id: LandId;
  name: string;
  tagline: string;
  icon: typeof Eye;
  color: string;
  bgGradient: string;
  description: string;
  maiaQuote: string;
  encounters: Encounter[];
}

interface Encounter {
  title: string;
  setup: string;
  prompt: string;
}

const LANDS: Land[] = [
  {
    id: 'watchtower',
    name: 'The Watchtower',
    tagline: 'See what you actually see',
    icon: Eye,
    color: 'text-sky-400',
    bgGradient: 'from-sky-950 via-slate-900 to-black',
    description: `High up. Cold. You can see everything from here.

Except you can't. Not really.

The Watchtower shows you the difference between what's actually there and what your brain decided was there before you even looked.

Most people never notice. They think they see clearly. They don't.`,
    maiaQuote: "This one's tricky. You'll think you already get it. You don't. Stay longer.",
    encounters: [
      {
        title: 'The Mirror',
        setup: "There's a mirror here. It doesn't show your face. It shows you in a moment you'd rather forget — not how you looked, but how you actually were.",
        prompt: "What moment?"
      },
      {
        title: 'Signal vs Noise',
        setup: "The wind carries voices. Hundreds. Everyone wants your attention. Somewhere under all of it, there's one that's actually yours.",
        prompt: "What's it saying?"
      },
      {
        title: 'Blind Spot',
        setup: "There's a corner you can't look at directly. Your eyes keep sliding away. Something's there that you trained yourself not to see.",
        prompt: "What is it?"
      },
      {
        title: 'The Crack',
        setup: "A stone carved with something you've always believed. Something so obvious you never questioned it. The carving is cracking.",
        prompt: "What's the belief?"
      },
      {
        title: 'Instant Reaction',
        setup: "You see something. You feel something about it instantly — before you even know what you're looking at.",
        prompt: "What did you feel? Why did you feel it before you understood it?"
      }
    ]
  },
  {
    id: 'furnace',
    name: 'The Furnace',
    tagline: 'Everything louder',
    icon: Flame,
    color: 'text-orange-400',
    bgGradient: 'from-orange-950 via-red-950 to-black',
    description: `Underground. Hot. The walls glow.

Everything you feel gets amplified here. Way up.

Most people spend their whole lives avoiding this place. They numb out, distract, pretend they're fine.

The only exit is on the other side.`,
    maiaQuote: "It won't kill you. I know it feels like it will. Keep moving.",
    encounters: [
      {
        title: 'Turned Up',
        setup: "The moment you enter, a feeling you've been carrying gets cranked to maximum. Almost too much.",
        prompt: "What feeling? Can you stay with it?"
      },
      {
        title: 'The Locked Room',
        setup: "There's a chamber you've been avoiding. Behind the door is something you decided was too dangerous to feel. Door's open now.",
        prompt: "What's in there?"
      },
      {
        title: 'The Question',
        setup: "The fire shapes itself into words. Asks you something you don't want to answer.",
        prompt: "What's it asking?"
      },
      {
        title: 'Still Here',
        setup: "You thought this feeling would destroy you. You felt it anyway. You're still standing.",
        prompt: "What did you learn?"
      },
      {
        title: 'Fuel',
        setup: "Every fire has a source. Something keeps feeding this one without you knowing.",
        prompt: "What's the fuel?"
      }
    ]
  },
  {
    id: 'undercroft',
    name: 'The Undercroft',
    tagline: 'What you buried',
    icon: Moon,
    color: 'text-violet-400',
    bgGradient: 'from-violet-950 via-purple-950 to-black',
    description: `Below the Furnace. Darker.

This is where you put everything that didn't fit. The embarrassing stuff. The parts of you that weren't acceptable.

You didn't kill them. Just buried them. They've been waiting.

The things down here look wrong. But they're not enemies. They're yours.`,
    maiaQuote: "Everyone's scared the first time. Everything down here is you. That's the part people forget.",
    encounters: [
      {
        title: 'The Shadow',
        setup: "Something follows you. Moves when you move. Looks like you but wrong. Says things you'd never say out loud.",
        prompt: "What's it saying?"
      },
      {
        title: 'Left Behind',
        setup: "You meet a version of yourself you abandoned. Too soft, too angry, too weird — didn't fit. It's been down here the whole time.",
        prompt: "What does it want you to know?"
      },
      {
        title: 'The Mirror Person',
        setup: "Someone in your life you can't stand. Something about them makes you react. Down here, you see why. They're showing you something you won't accept in yourself.",
        prompt: "What is it?"
      },
      {
        title: 'Buried Gold',
        setup: "Not everything down here is ugly. Sometimes you bury the good stuff too — things that were too bright, too much, didn't fit the life you were living.",
        prompt: "What did you bury that was actually valuable?"
      },
      {
        title: 'Conversation',
        setup: "One of the shadow-things wants to talk. Not angry. Just tired. Wants to be seen.",
        prompt: "What do you say to each other?"
      }
    ]
  },
  {
    id: 'well',
    name: 'The Well',
    tagline: 'What actually matters',
    icon: Droplets,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-950 via-teal-950 to-black',
    description: `Still. Silent. Deep.

You can't rush this one. The Well doesn't answer fast questions. Only real ones.

Most people drop a question and leave before anything comes up. They think silence means empty. It doesn't.`,
    maiaQuote: "Sit with it. Don't force anything. What comes up usually knows more than you do.",
    encounters: [
      {
        title: 'The Real Question',
        setup: "You've got a question that won't leave you alone. The kind without an easy answer. Drop it in. Wait.",
        prompt: "What did you ask? What came back?"
      },
      {
        title: 'What Matters',
        setup: "The Well shows you something you care about. Can't explain it. Can't justify it. Just yours.",
        prompt: "What is it?"
      },
      {
        title: 'Symbol',
        setup: "An image floats up. Not literal. Means something only to you.",
        prompt: "What do you see? What might it mean?"
      },
      {
        title: 'The Story',
        setup: "The Well shows your life as a story. Chapters. Arcs. A main character who's been through some things.",
        prompt: "What chapter is this? What's it about?"
      },
      {
        title: 'The Knowing',
        setup: "Some things you know without being taught. Truths that just showed up.",
        prompt: "What do you know that nobody told you?"
      }
    ]
  },
  {
    id: 'crossroads',
    name: 'The Crossroads',
    tagline: 'Other people',
    icon: Users,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-950 via-green-950 to-black',
    description: `Where paths cross.

Some things you can't figure out alone. Other people show up here — helpful ones, annoying ones, complicated ones.

This is where you learn the difference between performing and actually connecting.`,
    maiaQuote: "We figure ourselves out through other people. But not all of them. The real ones.",
    encounters: [
      {
        title: 'The Adjustment',
        setup: "Someone approaches. Before you even speak, you notice yourself changing. Adjusting. Putting something on.",
        prompt: "What are you changing? Why?"
      },
      {
        title: 'Seen',
        setup: "Someone shows up who isn't buying it. Sees past the version you show everyone. Uncomfortable. Also kind of a relief.",
        prompt: "What do they see?"
      },
      {
        title: 'The Hard One',
        setup: "There's someone in your life who's difficult. Every interaction costs something. Here, you see the shape of it clearly.",
        prompt: "What's actually happening between you?"
      },
      {
        title: 'The Line',
        setup: "There's a line between you and not-you. Some people respect it. Some don't. Sometimes you forget where it is.",
        prompt: "Where's the line? Is anyone crossing it?"
      },
      {
        title: 'Unsaid',
        setup: "You're here with someone specific. There's something between you that neither of you has said.",
        prompt: "What is it?"
      }
    ]
  },
  {
    id: 'forge',
    name: 'The Forge',
    tagline: 'Now what',
    icon: Anvil,
    color: 'text-amber-400',
    bgGradient: 'from-amber-950 via-yellow-950 to-black',
    description: `Where it gets real.

You've seen things. Felt things. Met things you buried.

Now: what are you going to do about it?

This is where knowing turns into doing. Doesn't have to be big. Just has to be real.`,
    maiaQuote: "Doesn't have to be perfect. Has to be real. Small counts.",
    encounters: [
      {
        title: 'One Thing',
        setup: "You learned something in these places. The Forge asks: will you actually do anything about it?",
        prompt: "What's one real thing you could do? Even small?"
      },
      {
        title: 'The Gap',
        setup: "There's a gap between who you are inside and how you actually live. The Forge shows you the gap.",
        prompt: "Where is it? What would close it?"
      },
      {
        title: "The Thing You Haven't Started",
        setup: "Something you want to make, start, or become. You've been putting it off. Excuses. Not yet.",
        prompt: "What if you started now?"
      },
      {
        title: 'Going Back',
        setup: "You're about to leave. Go back to the noise. Everything that made you forget this place existed.",
        prompt: "What are you taking with you?"
      },
      {
        title: 'Name',
        setup: "The Forge asks you to name yourself. Not your given name. The one you earned. The one that fits who you're becoming.",
        prompt: "What is it?"
      }
    ]
  }
];

export function InnerLandsExplorer({ onClose, onAskMaia }: InnerLandsExplorerProps) {
  const [currentView, setCurrentView] = useState<LandId>('map');
  const [selectedEncounter, setSelectedEncounter] = useState<number | null>(null);

  const currentLand = LANDS.find(l => l.id === currentView);

  const handleEncounterSelect = (index: number) => {
    setSelectedEncounter(index);
  };

  const handleAskMaia = (prompt: string) => {
    if (onAskMaia) {
      onAskMaia(prompt);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black"
    >
      {/* Map View */}
      {currentView === 'map' && (
        <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-stone-900 to-black">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <Compass className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl font-medium text-white">The Inner Lands</h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>

          {/* Intro - shorter, less cringe */}
          <div className="px-6 py-6 text-center">
            <p className="text-stone-400 text-sm">
              Six places. Each one shows you something different.
              <br />
              No right order. No completion. Just pick one.
            </p>
          </div>

          {/* Land Grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {LANDS.map((land) => {
                const Icon = land.icon;
                return (
                  <motion.button
                    key={land.id}
                    onClick={() => setCurrentView(land.id)}
                    className={`p-4 rounded-xl bg-gradient-to-br ${land.bgGradient} border border-white/10
                             hover:border-white/20 transition-all text-left`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-6 h-6 ${land.color} mb-2`} />
                    <div className="text-white font-medium text-sm">{land.name}</div>
                    <div className="text-stone-400 text-xs mt-0.5">{land.tagline}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Footer - minimal */}
          <div className="p-4 border-t border-stone-800 text-center">
            <p className="text-stone-600 text-xs">
              No tracking. No grades.
            </p>
          </div>
        </div>
      )}

      {/* Land View */}
      {currentView !== 'map' && currentLand && selectedEncounter === null && (
        <div className={`h-full flex flex-col bg-gradient-to-b ${currentLand.bgGradient}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button
              onClick={() => setCurrentView('map')}
              className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>

          {/* Land Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Title */}
            <div className="px-6 pt-6 pb-3">
              {(() => {
                const Icon = currentLand.icon;
                return <Icon className={`w-8 h-8 ${currentLand.color} mb-2`} />;
              })()}
              <h1 className="text-xl font-medium text-white">{currentLand.name}</h1>
              <p className={`${currentLand.color} text-sm`}>{currentLand.tagline}</p>
            </div>

            {/* Description - tighter */}
            <div className="px-6 pb-4">
              <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                {currentLand.description}
              </p>
            </div>

            {/* MAIA Quote - less soft */}
            <div className="px-6 pb-4">
              <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                <p className="text-stone-400 text-xs mb-1">MAIA:</p>
                <p className="text-stone-300 text-sm">
                  "{currentLand.maiaQuote}"
                </p>
              </div>
            </div>

            {/* Encounters */}
            <div className="px-6 pb-8">
              <h2 className="text-stone-500 text-xs uppercase tracking-wider mb-2">Encounters</h2>
              <div className="space-y-2">
                {currentLand.encounters.map((encounter, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleEncounterSelect(index)}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10
                             hover:bg-white/10 hover:border-white/20 transition-all
                             flex items-center justify-between text-left"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-white text-sm">{encounter.title}</span>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Encounter View */}
      {currentView !== 'map' && currentLand && selectedEncounter !== null && (
        <div className={`h-full flex flex-col bg-gradient-to-b ${currentLand.bgGradient}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button
              onClick={() => setSelectedEncounter(null)}
              className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>

            {/* Phase indicator - three states: arrive, hold, speak */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <div className={`w-1.5 h-1.5 rounded-full ${
                currentLand.id === 'watchtower' ? 'bg-sky-400' :
                currentLand.id === 'furnace' ? 'bg-orange-400' :
                currentLand.id === 'undercroft' ? 'bg-violet-400' :
                currentLand.id === 'well' ? 'bg-cyan-400' :
                currentLand.id === 'crossroads' ? 'bg-emerald-400' :
                'bg-amber-400'
              }`} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>

          {/* Encounter Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <h1 className="text-lg font-medium text-white mb-4">
              {currentLand.encounters[selectedEncounter].title}
            </h1>

            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              {currentLand.encounters[selectedEncounter].setup}
            </p>

            <div className="p-4 rounded-lg bg-white/5 border border-white/20 mb-4">
              <p className={`${currentLand.color} text-base`}>
                {currentLand.encounters[selectedEncounter].prompt}
              </p>
            </div>

            {/* Orientation - the gentle invitation */}
            <p className="text-stone-500 text-xs text-center">
              If anything stirs — even a memory, image, or feeling — MAIA is here.
            </p>
          </div>

          {/* Actions - MAIA is the primary path */}
          <div className="p-4 border-t border-white/10">
            {onAskMaia && (
              <motion.button
                onClick={() => handleAskMaia(
                  `I'm in ${currentLand.name}, facing "${currentLand.encounters[selectedEncounter].title}". The prompt: ${currentLand.encounters[selectedEncounter].prompt}`
                )}
                className="w-full py-4 rounded-xl bg-amber-500/20 border border-amber-500/40
                         text-amber-200 font-medium transition-all hover:bg-amber-500/30
                         hover:border-amber-400/60"
                whileTap={{ scale: 0.98 }}
              >
                Talk to MAIA
              </motion.button>
            )}
            <button
              onClick={() => setSelectedEncounter(null)}
              className="w-full py-3 mt-2 text-stone-600 text-xs transition-all hover:text-stone-400"
            >
              Different encounter
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
