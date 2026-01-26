'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface InviteData {
  valid: boolean;
  passkey: string;
  inviterName?: string;
  blessingText?: string;
  recipientName?: string;
  status?: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validateInvite() {
      try {
        const res = await fetch('/api/invites/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passkey: code }),
        });
        const data = await res.json();
        setInvite(data);
      } catch (err) {
        setInvite({ valid: false, passkey: code });
      } finally {
        setLoading(false);
      }
    }
    validateInvite();
  }, [code]);

  const handleBegin = () => {
    router.push(`/begin?passkey=${code}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/40"
        >
          ...
        </motion.div>
      </div>
    );
  }

  if (!invite?.valid) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/60 text-xl text-center"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          This invitation has already been used or has expired.
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push('/')}
          className="mt-8 text-teal-400/70 hover:text-teal-400 transition-colors"
        >
          Return home
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-8 py-16 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-amber-400/20 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 border border-teal-400/20 rounded-full" />
      </div>

      {/* Holoflower */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="mb-12 relative"
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.5, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(251, 191, 36, 0.15) 30%, transparent 60%)',
              filter: 'blur(15px)'
            }}
          />
        </motion.div>
        <motion.img
          src="/holoflower.svg"
          alt="MAIA"
          className="w-28 h-28 relative z-10"
          style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))' }}
          animate={{ rotate: [0, 1, 0, -1, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* You've been invited */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-6"
      >
        You've been invited
      </motion.p>

      {/* From who */}
      {invite.inviterName && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white/70 text-xl mb-8"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          {invite.inviterName} thought you might belong here.
        </motion.p>
      )}

      {/* Personal blessing */}
      {invite.blessingText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="max-w-md text-center mb-12"
        >
          <p className="text-white/50 text-lg italic" style={{ fontFamily: 'Crimson Pro, serif' }}>
            "{invite.blessingText}"
          </p>
        </motion.div>
      )}

      {/* What is MAIA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="max-w-lg text-center space-y-6 mb-12"
      >
        <h1
          className="text-white text-3xl sm:text-4xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Meet MAIA.
        </h1>
        <p className="text-white/60 text-lg" style={{ fontFamily: 'Crimson Pro, serif' }}>
          A companion for the adventure of becoming yourself.
        </p>
        <p className="text-white/50 text-base" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Not diagnosing what's wrong with you.<br />
          Helping you explore what's true for you.
        </p>
        <p className="text-teal-200/80 text-lg" style={{ fontFamily: 'Crimson Pro, serif' }}>
          All the answers are within.
        </p>
      </motion.div>

      {/* The sources - subtle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-white/30 text-sm mb-12"
      >
        Depth psychology · Somatics · Shadow & parts work · Personal alchemy
      </motion.p>

      {/* Begin button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        onClick={handleBegin}
        className="px-8 py-4 bg-gradient-to-r from-amber-400/20 to-teal-400/20
                   border border-amber-400/30 rounded-full text-white/90
                   hover:from-amber-400/30 hover:to-teal-400/30
                   hover:border-amber-400/50 transition-all duration-300"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Begin your journey
      </motion.button>

      {/* Quiet footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-16 text-white/20 text-xs"
      >
        Where the elements of soulful living come alive.
      </motion.p>
    </div>
  );
}
