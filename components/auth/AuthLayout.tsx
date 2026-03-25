// AUTH DESIGN SYSTEM (NON-NEGOTIABLE)
// - Use maia.navy / maia.spice / maia.ink tokens only
// - No raw hex colors
// - No teal palette
// - All auth screens must render inside AuthLayout
// - Enforced by: scripts/check-no-teal-auth.sh (pre-commit + preflight)
'use client';

import { Suspense, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';

/**
 * AuthLayout — shared shell for all auth/onboarding pages.
 *
 * Owns the navy gradient background, Holoflower, glass card,
 * and breathing animation. Individual pages render content inside
 * the card via `children`, or outside it via `children` + `cardless`.
 *
 * Uses maia.navy / maia.spice / maia.ink Tailwind tokens so the
 * palette can be changed in one place (tailwind.config.js).
 */

interface AuthLayoutProps {
  children: ReactNode;

  /** Title shown above the card (e.g. "Soullab"). Omit to skip. */
  title?: string;
  /** Subtitle below the Holoflower (e.g. "Your space is waiting."). */
  subtitle?: string;

  /** Holoflower size. Default: 'lg'. */
  holoflowerSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the Holoflower animates. Default: false. */
  holoflowerAnimate?: boolean;
  /** Holoflower glow intensity. Default: 'low'. */
  holoflowerGlow?: 'none' | 'low' | 'medium' | 'high';

  /** Max-width of the glass card. Default: 'sm'. */
  cardWidth?: 'sm' | 'md' | 'lg';
  /** If true, children render directly (no glass card wrapper). */
  cardless?: boolean;

  /** Extra padding class overrides. */
  className?: string;
  /** Content rendered below the card (e.g. EthosFooter). */
  footer?: ReactNode;

  /** Loading fallback text. Default: 'Loading...' */
  loadingText?: string;
}

const cardWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
} as const;

function AuthLayoutInner({
  children,
  title,
  subtitle,
  holoflowerSize = 'lg',
  holoflowerAnimate = false,
  holoflowerGlow = 'low',
  cardWidth = 'sm',
  cardless = false,
  className = '',
  footer,
}: Omit<AuthLayoutProps, 'loadingText'>) {
  const holoContainerSize = holoflowerSize === 'xl' ? 'w-32 h-32' : 'w-28 h-28';

  return (
    <>
      {/* Brand + Holoflower */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="mb-8 z-10 relative flex flex-col items-center"
      >
        {title && (
          <h1 className="text-5xl font-extralight text-maia-ink-100/80 tracking-[0.12em] mb-6">
            {title}
          </h1>
        )}
        <div className={`${holoContainerSize} flex items-center justify-center animate-breathe`}>
          <Holoflower
            size={holoflowerSize}
            glowIntensity={holoflowerGlow}
            animate={holoflowerAnimate}
            theme="dark"
          />
        </div>
        {subtitle && (
          <p className="mt-4 text-sm text-maia-spice-500/60 font-light tracking-wide">
            {subtitle}
          </p>
        )}
      </motion.div>

      {/* Card or raw children */}
      {cardless ? (
        <div className={className}>{children}</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`rounded-2xl p-8 ${cardWidthMap[cardWidth]} w-full bg-maia-navy-850/80 border border-white/10 backdrop-blur-xl shadow-2xl ${className}`}
        >
          {children}
        </motion.div>
      )}

      {/* Footer slot */}
      {footer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          {footer}
        </motion.div>
      )}
    </>
  );
}

/**
 * Loading skeleton shown during Suspense.
 * Matches the auth layout structure so there's no layout shift.
 */
function AuthLoadingFallback({
  title,
  holoflowerSize = 'lg',
  cardWidth = 'sm',
  loadingText = 'Loading...',
}: Pick<AuthLayoutProps, 'title' | 'holoflowerSize' | 'cardWidth' | 'loadingText'>) {
  const holoContainerSize = holoflowerSize === 'xl' ? 'w-32 h-32' : 'w-28 h-28';

  return (
    <>
      <div className="mb-8 flex flex-col items-center">
        {title && (
          <h1 className="text-5xl font-extralight text-maia-ink-100/80 tracking-[0.12em] mb-6">
            {title}
          </h1>
        )}
        <div className={`${holoContainerSize} flex items-center justify-center`}>
          <Holoflower size={holoflowerSize} glowIntensity="low" animate={false} theme="dark" />
        </div>
        <p className="mt-4 text-sm text-maia-spice-500/60 font-light tracking-wide">
          {loadingText}
        </p>
      </div>
      <div
        className={`rounded-2xl p-8 ${cardWidthMap[cardWidth]} w-full bg-maia-navy-850/80 border border-white/10 backdrop-blur-xl`}
      >
        <div className="space-y-3 animate-pulse">
          <div className="h-12 bg-white/10 rounded-xl" />
          <div className="h-12 bg-white/10 rounded-xl" />
          <div className="h-12 bg-maia-spice-500/30 rounded-xl" />
        </div>
      </div>
    </>
  );
}

/**
 * Full auth page shell with Suspense boundary.
 *
 * Usage:
 * ```tsx
 * export default function SigninPage() {
 *   return (
 *     <AuthLayout title="Soullab" subtitle="Your space is waiting.">
 *       <Suspense fallback={null}>
 *         <SigninContent />
 *       </Suspense>
 *     </AuthLayout>
 *   );
 * }
 * ```
 */
export default function AuthLayout({
  children,
  loadingText,
  title,
  holoflowerSize,
  cardWidth,
  ...rest
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 to-maia-navy-800 flex flex-col items-center justify-center px-4 py-8">
      {/* Breathing animation for Holoflower */}
      <style jsx global>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        .animate-breathe {
          animation: breathe 20s ease-in-out infinite;
        }
      `}</style>

      <Suspense
        fallback={
          <AuthLoadingFallback
            title={title}
            holoflowerSize={holoflowerSize}
            cardWidth={cardWidth}
            loadingText={loadingText}
          />
        }
      >
        <AuthLayoutInner
          title={title}
          holoflowerSize={holoflowerSize}
          cardWidth={cardWidth}
          {...rest}
        >
          {children}
        </AuthLayoutInner>
      </Suspense>
    </div>
  );
}

/**
 * Glass card for modals inside auth pages.
 * Use this for recovery, magic link, migration, passkey modals.
 */
export function AuthModal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-6 max-w-md w-full shadow-2xl bg-maia-navy-850 border border-white/10 ${className}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
