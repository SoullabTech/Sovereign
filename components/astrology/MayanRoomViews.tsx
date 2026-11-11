/**
 * The Mayan (Dreamspell) views as presentational components: a galactic
 * signature card (for the birth sign or today's energy) and the Path of Life
 * (youth, adulthood and future signs, Haab, direction, life-cycle reading).
 *
 * They take a computed sign or profile and nothing about the person, so the
 * Free Mayan page (computed in the browser) and the Pro Mayan room (computed on
 * the server, no birth date sent) show the same thing.
 */
'use client';

import { motion } from 'framer-motion';
import { Sparkles, Calendar } from 'lucide-react';
import type { MayanBirthSign, CompleteMayanProfile, PathOfLife } from '@/lib/astrology/mayanAstrology';

const getElementColor = (element: string) => {
  const colors = {
    fire: 'from-orange-500 to-red-600',
    water: 'from-blue-500 to-indigo-600',
    earth: 'from-green-500 to-emerald-600',
    air: 'from-cyan-500 to-sky-600',
  };
  return colors[element as keyof typeof colors] || colors.fire;
};

const getElementBorder = (element: string) => {
  const borders = {
    fire: 'border-orange-500/30',
    water: 'border-blue-500/30',
    earth: 'border-green-500/30',
    air: 'border-cyan-500/30',
  };
  return borders[element as keyof typeof borders] || borders.fire;
};

const getToneStageColor = (stage: string) => {
  const colors = {
    initiation: 'text-amber-400',
    challenge: 'text-orange-400',
    empowerment: 'text-yellow-400',
    completion: 'text-amber-300',
  };
  return colors[stage as keyof typeof colors] || colors.initiation;
};

const renderSignCard = (sign: MayanBirthSign, title: string, isToday: boolean = false) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-br from-stone-900/80 via-amber-950/40 to-stone-900/80 backdrop-blur-xl border ${getElementBorder(sign.daySign.element)} rounded-2xl p-8 shadow-2xl`}
  >
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-amber-100 mb-2">{title}</h2>
      <p className="text-amber-500/60 text-sm uppercase tracking-wider">
        {sign.tzolkinNumber} / 260 Days
      </p>
    </div>

    {/* Galactic Signature */}
    <div className="text-center mb-8">
      <div className="text-8xl mb-4">{sign.daySign.glyph}</div>
      <h3 className="text-4xl font-bold text-amber-100 mb-2">
        {sign.galacticSignature}
      </h3>
      <p className="text-amber-400/80 text-lg">
        {sign.daySign.meaning}
      </p>
    </div>

    {/* Tone Card */}
    <div className="bg-black/40 border border-amber-900/30 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xl font-bold text-amber-100">Tone {sign.tone.number}</h4>
          <p className="text-amber-500/80">{sign.tone.name}</p>
        </div>
        <div className={`text-2xl ${getToneStageColor(sign.tone.stage)}`}>
          {sign.tone.stage === 'initiation' && '◉'}
          {sign.tone.stage === 'challenge' && '◈'}
          {sign.tone.stage === 'empowerment' && '◆'}
          {sign.tone.stage === 'completion' && '◐'}
        </div>
      </div>
      <p className="text-amber-300/70 italic mb-3">"{sign.tone.intention}"</p>
      <p className="text-amber-400/60 text-sm">{sign.tone.description}</p>
    </div>

    {/* Day Sign Details */}
    <div className="bg-gradient-to-br from-amber-950/30 to-stone-900/50 border border-amber-900/30 rounded-xl p-6 mb-6">
      <h4 className="text-xl font-bold text-amber-100 mb-4">
        {sign.daySign.archetype}
      </h4>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-amber-600/60 text-xs uppercase mb-1">Power</p>
          <p className="text-amber-300 font-semibold">{sign.daySign.power}</p>
        </div>
        <div>
          <p className="text-amber-600/60 text-xs uppercase mb-1">Action</p>
          <p className="text-amber-300 font-semibold">{sign.daySign.action}</p>
        </div>
        <div>
          <p className="text-amber-600/60 text-xs uppercase mb-1">Essence</p>
          <p className="text-amber-300 font-semibold">{sign.daySign.essence}</p>
        </div>
      </div>

      <p className="text-amber-400/70 leading-relaxed mb-4">
        {sign.daySign.description}
      </p>

      <div className="flex items-center gap-2">
        <div className={`px-4 py-2 bg-gradient-to-r ${getElementColor(sign.daySign.element)} rounded-lg text-white text-sm font-semibold`}>
          {sign.daySign.element.toUpperCase()}
        </div>
        <div className="text-amber-600/60 text-sm">
          {sign.wavespell}
        </div>
      </div>
    </div>

    {/* Spiralogic Integration */}
    {!isToday && (
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-6">
        <h4 className="text-lg font-bold text-amber-100 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Spiralogic Integration
        </h4>
        <p className="text-amber-400/70 text-sm">
          Your Mayan {sign.daySign.name} essence ({sign.daySign.element} element) flows through the
          Spiralogic {sign.daySign.element} pathway, weaving ancient wisdom with conscious evolution.
        </p>
      </div>
    )}
  </motion.div>
);

const renderPathOfLife = (profile: CompleteMayanProfile) => {
  const { pathOfLife, cardinalDirection, lifeCycleInsight, haab } = profile;

  const getDirectionColor = (dir: string) => {
    const colors: Record<string, string> = {
      east: 'from-red-500 to-orange-500',
      north: 'from-gray-100 to-gray-300',
      west: 'from-gray-800 to-black',
      south: 'from-yellow-400 to-amber-500',
    };
    return colors[dir] || colors.east;
  };

  const getPillarGradient = (stage: 'youth' | 'adulthood' | 'future') => {
    const gradients = {
      youth: 'from-purple-900/60 via-indigo-900/40 to-purple-900/60',
      adulthood: 'from-amber-900/60 via-orange-900/40 to-amber-900/60',
      future: 'from-teal-900/60 via-cyan-900/40 to-teal-900/60',
    };
    return gradients[stage];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Life Cycle Insight */}
      <div className="bg-gradient-to-br from-stone-900/80 via-amber-950/40 to-stone-900/80 backdrop-blur-xl border border-amber-900/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-amber-100 mb-4 text-center">Your Life Cycle Reading</h2>
        <p className="text-amber-300/90 text-lg leading-relaxed text-center italic">
          "{lifeCycleInsight}"
        </p>
      </div>

      {/* Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Youth Pillar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${getPillarGradient('youth')} backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6`}
        >
          <div className="text-center mb-4">
            <span className="text-purple-400/60 text-xs uppercase tracking-wider">Past Influence</span>
            <h3 className="text-xl font-bold text-purple-100">Youth</h3>
            <p className="text-purple-300/60 text-sm">Birth to ~26 years</p>
          </div>
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">{pathOfLife.youth.daySign.glyph}</div>
            <h4 className="text-2xl font-bold text-purple-100">{pathOfLife.youth.galacticSignature}</h4>
            <p className="text-purple-400/80">{pathOfLife.youth.daySign.archetype}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-400/60">Power:</span>
              <span className="text-purple-200">{pathOfLife.youth.daySign.power}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-400/60">Essence:</span>
              <span className="text-purple-200">{pathOfLife.youth.daySign.essence}</span>
            </div>
            <p className="text-purple-300/70 text-xs mt-3 italic">
              Early life patterns shaped by {pathOfLife.youth.daySign.meaning.toLowerCase()}
            </p>
          </div>
        </motion.div>

        {/* Adulthood Pillar (Main) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-br ${getPillarGradient('adulthood')} backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 ring-2 ring-amber-500/20`}
        >
          <div className="text-center mb-4">
            <span className="text-amber-400/60 text-xs uppercase tracking-wider">Core Identity</span>
            <h3 className="text-xl font-bold text-amber-100">Adulthood</h3>
            <p className="text-amber-300/60 text-sm">Your Primary Signature</p>
          </div>
          <div className="text-center mb-4">
            <div className="text-7xl mb-2">{pathOfLife.adulthood.daySign.glyph}</div>
            <h4 className="text-2xl font-bold text-amber-100">{pathOfLife.adulthood.galacticSignature}</h4>
            <p className="text-amber-400/80">{pathOfLife.adulthood.daySign.archetype}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-400/60">Power:</span>
              <span className="text-amber-200">{pathOfLife.adulthood.daySign.power}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-400/60">Action:</span>
              <span className="text-amber-200">{pathOfLife.adulthood.daySign.action}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-400/60">Essence:</span>
              <span className="text-amber-200">{pathOfLife.adulthood.daySign.essence}</span>
            </div>
          </div>
        </motion.div>

        {/* Future Pillar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`bg-gradient-to-br ${getPillarGradient('future')} backdrop-blur-xl border border-teal-500/30 rounded-2xl p-6`}
        >
          <div className="text-center mb-4">
            <span className="text-teal-400/60 text-xs uppercase tracking-wider">Destiny</span>
            <h3 className="text-xl font-bold text-teal-100">Future</h3>
            <p className="text-teal-300/60 text-sm">Fading in from ~52 years</p>
          </div>
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">{pathOfLife.future.daySign.glyph}</div>
            <h4 className="text-2xl font-bold text-teal-100">{pathOfLife.future.galacticSignature}</h4>
            <p className="text-teal-400/80">{pathOfLife.future.daySign.archetype}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-teal-400/60">Power:</span>
              <span className="text-teal-200">{pathOfLife.future.daySign.power}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-teal-400/60">Essence:</span>
              <span className="text-teal-200">{pathOfLife.future.daySign.essence}</span>
            </div>
            <p className="text-teal-300/70 text-xs mt-3 italic">
              Your soul evolves toward {pathOfLife.future.daySign.meaning.toLowerCase()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Haab Solar Calendar & Cardinal Direction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Haab Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-stone-900/80 via-emerald-950/30 to-stone-900/80 backdrop-blur-xl border border-emerald-900/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-emerald-500" />
            <div>
              <h3 className="text-lg font-bold text-emerald-100">Haab Solar Calendar</h3>
              <p className="text-emerald-400/60 text-xs">365-day civil calendar</p>
            </div>
          </div>
          <div className="text-center py-4">
            <div className="text-4xl mb-2">{haab.month.glyph}</div>
            <h4 className="text-2xl font-bold text-emerald-100">{haab.fullDate}</h4>
            <p className="text-emerald-400/80">{haab.month.meaning}</p>
            <p className="text-emerald-400/60 text-xs mt-3">
              Traditional count (GMT 584283): {profile.traditional.number} {profile.traditional.yucatec}
              {' '}({profile.traditional.kiche} in K’iche’) · Long Count {profile.traditional.longCount}.
              The galactic signature above is the modern Dreamspell count, a different system.
            </p>
            {haab.isWayeb && (
              <div className="mt-3 bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-2">
                <p className="text-red-300 text-sm">Wayeb - The Nameless Days</p>
                <p className="text-red-400/70 text-xs">A time of reflection and caution</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Cardinal Direction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-stone-900/80 via-rose-950/30 to-stone-900/80 backdrop-blur-xl border border-rose-900/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getDirectionColor(cardinalDirection.direction)}`} />
            <div>
              <h3 className="text-lg font-bold text-rose-100">Cardinal Direction</h3>
              <p className="text-rose-400/60 text-xs">Your cosmic orientation</p>
            </div>
          </div>
          <div className="text-center py-4">
            <h4 className="text-3xl font-bold text-rose-100 uppercase tracking-wider">
              {cardinalDirection.direction}
            </h4>
            <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${getDirectionColor(cardinalDirection.direction)} mt-2`}>
              <span className="text-white text-sm font-semibold">{cardinalDirection.color}</span>
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-rose-400/60">Meaning:</span>
              <span className="text-rose-200">{cardinalDirection.meaning}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-rose-400/60">Activity:</span>
              <span className="text-rose-200">{cardinalDirection.activity}</span>
            </div>
            <p className="text-rose-300/70 text-xs mt-3">
              {cardinalDirection.description}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export function MayanSignCard({ sign, title, isToday = false }: { sign: MayanBirthSign; title: string; isToday?: boolean }) {
  return renderSignCard(sign, title, isToday);
}

export function MayanPathOfLife({ profile }: { profile: CompleteMayanProfile }) {
  return renderPathOfLife(profile);
}
