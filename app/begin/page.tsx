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
        whileHover={{
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)"
        }}
        whileTap={{ scale: 0.98 }}
        className="relative px-12 py-4 rounded-xl text-white font-medium text-lg tracking-wide"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(110, 231, 183, 0.1), rgba(255, 255, 255, 0.1))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 15px 35px rgba(14, 116, 144, 0.3), 0 5px 15px rgba(14, 116, 144, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
        }}
      >
        <span className="relative z-10">Begin Journey</span>

        {/* Glass reflection effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
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