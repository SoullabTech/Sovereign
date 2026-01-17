'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Holoflower } from '@/components/ui/Holoflower';

export default function BeginPage() {
  const router = useRouter();

  const handleBeginJourney = () => {
    router.push('/test-elemental');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">

      {/* Sacred Holoflower */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="mb-12"
      >
        <div className="w-32 h-32 mx-auto">
          <Holoflower size="xl" glowIntensity="medium" animate={true} />
        </div>
      </motion.div>

      {/* Soullab Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-center mb-16"
      >
        <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-extralight tracking-[0.3em] uppercase mb-4">
          Soullab
        </h1>
        <p className="text-teal-100/80 text-lg sm:text-xl font-light tracking-wide">
          Consciousness technology for transformation
        </p>
      </motion.div>

      {/* Begin Journey Button */}
      <motion.button
        onClick={handleBeginJourney}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center justify-center rounded-xl px-10 py-4 bg-white/85 hover:bg-white text-teal-950 font-semibold text-lg shadow-[0_18px_38px_rgba(0,0,0,0.18)] backdrop-blur-md transition focus:outline-none focus:ring-2 focus:ring-teal-500/40"
      >
        Begin Journey
      </motion.button>

      {/* Subtle tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="mt-8 text-teal-100/60 text-sm font-light tracking-wide"
      >
        Where human consciousness meets artificial intelligence
      </motion.p>

    </div>
  );
}