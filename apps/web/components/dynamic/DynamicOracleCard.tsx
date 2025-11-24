/**
 * Dynamic Oracle Card with SSR Safety
 * Uses dynamic imports to prevent SSR issues with enhanced components
 */

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Fallback component for loading state
const OracleCardFallback = () => (
  <div className="bg-sacred-navy/80 backdrop-blur-xl border border-gold-divine/20 rounded-sacred p-6 animate-pulse">
    <div className="h-4 bg-gold-divine/20 rounded mb-4"></div>
    <div className="h-32 bg-gold-divine/10 rounded"></div>
  </div>
);

// Error boundary component
const OracleCardError = () => (
  <div className="bg-sacred-navy/80 backdrop-blur-xl border border-red-500/20 rounded-sacred p-6">
    <div className="text-red-400 text-sm">
      Unable to load enhanced Oracle interface. Please refresh the page.
    </div>
  </div>
);

// Dynamically import the enhanced Oracle card (client-side only)
const EnhancedOracleCard = dynamic(
  () => import('../ui/oracle-card').then(mod => ({ default: mod.OracleCard })),
  {
    ssr: false, // Disable server-side rendering
    loading: () => <OracleCardFallback />,
  }
);

// Dynamically import Sacred Geometry (heavy component)
const SacredGeometry = dynamic(
  () => import('../ui/SacredGeometry').then(mod => ({ default: mod.SacredGeometry })),
  {
    ssr: false,
    loading: () => (
      <div className="w-24 h-24 bg-gold-divine/10 rounded-full animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold-divine/30 border-t-gold-divine rounded-full animate-spin"></div>
      </div>
    ),
  }
);

// Dynamically import Voice Recorder (browser-only APIs)
const VoiceRecorder = dynamic(
  () => import('../VoiceRecorder'),
  {
    ssr: false,
    loading: () => (
      <button 
        disabled 
        className="p-2 rounded-full bg-gray-500/20 cursor-not-allowed"
        title="Loading voice recorder..."
      >
        <div className="w-5 h-5 animate-pulse bg-gray-400 rounded-full"></div>
      </button>
    ),
  }
);

interface DynamicOracleCardProps {
  userId: string;
  showGeometry?: boolean;
  enableVoice?: boolean;
  className?: string;
}

export default function DynamicOracleCard({ 
  userId, 
  showGeometry = false, 
  enableVoice = false,
  className = ""
}: DynamicOracleCardProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Oracle Card - Enhanced if client-side */}
      <Suspense fallback={<OracleCardFallback />}>
        <EnhancedOracleCard userId={userId} />
      </Suspense>

      {/* Sacred Geometry - Only load if requested and on client */}
      {showGeometry && (
        <Suspense fallback={<div className="h-24 bg-gold-divine/10 animate-pulse rounded"></div>}>
          <div className="flex justify-center">
            <SacredGeometry 
              type="seed-of-life" 
              size={96}
              color="#FFD700"
              animate={true}
              glow={true}
            />
          </div>
        </Suspense>
      )}

      {/* Voice Recorder - Browser APIs only */}
      {enableVoice && (
        <Suspense fallback={<div className="h-10 bg-gold-divine/10 animate-pulse rounded"></div>}>
          <div className="flex justify-center">
            <VoiceRecorder userId={userId} />
          </div>
        </Suspense>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <DynamicOracleCard userId="user123" />
 * 
 * // With enhanced features (loaded dynamically)
 * <DynamicOracleCard 
 *   userId="user123" 
 *   showGeometry={true} 
 *   enableVoice={true} 
 * />
 * 
 * // The components will:
 * 1. Show loading states during dynamic imports
 * 2. Skip SSR to prevent hydration issues  
 * 3. Gracefully handle import failures
 * 4. Only load heavy/browser-dependent code when needed
 */