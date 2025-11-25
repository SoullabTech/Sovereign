'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DirectionalPanel as PanelDirection, PANEL_METADATA, getPanelContent } from '@/lib/extensions/registry';
import { useExtensionConfig } from '@/hooks/useExtensionConfig';
import { Suspense, lazy } from 'react';

interface DirectionalPanelProps {
  direction: PanelDirection;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

/**
 * Directional Panel Container
 *
 * Slides in from the appropriate edge based on direction
 * Dynamically loads extension components registered for this direction
 */
export function DirectionalPanel({ direction, isOpen, onClose, userId }: DirectionalPanelProps) {
  const { config } = useExtensionConfig(userId);
  const metadata = PANEL_METADATA[direction];

  // Get all enabled extension content for this panel direction
  const panelContent = getPanelContent(
    direction,
    config?.extensions
      ? Object.fromEntries(
          Object.entries(config.extensions).map(([id, cfg]) => [id, cfg.enabled])
        )
      : undefined
  );

  // Animation variants based on direction
  const getAnimationVariants = () => {
    switch (direction) {
      case 'right':
        return {
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' },
        };
      case 'left':
        return {
          initial: { x: '-100%' },
          animate: { x: 0 },
          exit: { x: '-100%' },
        };
      case 'up':
        return {
          initial: { y: '-100%' },
          animate: { y: 0 },
          exit: { y: '-100%' },
        };
      case 'down':
        return {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
        };
    }
  };

  // Panel positioning based on direction
  const getPanelPosition = () => {
    switch (direction) {
      case 'right':
        return 'top-0 right-0 h-full w-full md:w-[480px]';
      case 'left':
        return 'top-0 left-0 h-full w-full md:w-[480px]';
      case 'up':
        return 'top-0 left-0 w-full h-full md:h-[60vh]';
      case 'down':
        return 'bottom-0 left-0 w-full h-full md:h-[60vh]';
    }
  };

  const getColorScheme = () => {
    switch (direction) {
      case 'right':
        return {
          bg: 'bg-gradient-to-br from-blue-950/95 to-black/95',
          border: 'border-blue-500/30',
          accent: 'text-blue-400',
        };
      case 'left':
        return {
          bg: 'bg-gradient-to-br from-purple-950/95 to-black/95',
          border: 'border-purple-500/30',
          accent: 'text-purple-400',
        };
      case 'up':
        return {
          bg: 'bg-gradient-to-br from-red-950/95 to-black/95',
          border: 'border-red-500/30',
          accent: 'text-red-400',
        };
      case 'down':
        return {
          bg: 'bg-gradient-to-br from-amber-950/95 to-black/95',
          border: 'border-amber-500/30',
          accent: 'text-amber-400',
        };
    }
  };

  const variants = getAnimationVariants();
  const position = getPanelPosition();
  const colors = getColorScheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed ${position} z-50
              ${colors.bg}
              border ${colors.border}
              shadow-2xl
              overflow-hidden
            `}
          >
            {/* Header */}
            <div className={`
              p-6 border-b ${colors.border}
              flex items-start justify-between
            `}>
              <div>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${colors.accent}`}>{metadata.icon}</span>
                  <h2 className="text-xl font-serif text-white">{metadata.title}</h2>
                </div>
                <p className="text-sm text-white/60 mt-1">{metadata.subtitle}</p>
                <p className="text-xs text-white/40 mt-2">{metadata.description}</p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                aria-label="Close panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-[calc(100%-120px)] space-y-6">
              {panelContent.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 text-sm">
                    No extensions enabled for this direction.
                  </p>
                  <p className="text-white/30 text-xs mt-2">
                    Visit Settings → Extensions to activate content.
                  </p>
                </div>
              ) : (
                panelContent.map((content, index) => (
                  <ExtensionContentSection
                    key={`${content.component}-${index}`}
                    content={content}
                    userId={userId}
                    config={config}
                    colorScheme={colors}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ExtensionContentSectionProps {
  content: ReturnType<typeof getPanelContent>[0];
  userId: string;
  config: any;
  colorScheme: { bg: string; border: string; accent: string };
}

function ExtensionContentSection({
  content,
  userId,
  config,
  colorScheme,
}: ExtensionContentSectionProps) {
  // Dynamically import the component
  // Note: In production, we'd use a proper component registry
  // For now, we'll show a placeholder

  return (
    <div
      className={`
        border ${colorScheme.border} rounded-lg p-4
        bg-black/20
      `}
    >
      <div className="mb-3">
        <h3 className={`text-sm font-semibold ${colorScheme.accent}`}>{content.title}</h3>
        {content.description && (
          <p className="text-xs text-white/50 mt-1">{content.description}</p>
        )}
      </div>

      {/* Component will render here */}
      <Suspense
        fallback={
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white/80" />
            <p className="text-xs text-white/40 mt-2">Loading...</p>
          </div>
        }
      >
        <ExtensionComponentLoader
          componentPath={content.component}
          userId={userId}
          settings={config?.extensions[content.component.split('/')[3]]?.settings ?? {}}
        />
      </Suspense>
    </div>
  );
}

interface ExtensionComponentLoaderProps {
  componentPath: string;
  userId: string;
  settings: Record<string, any>;
}

function ExtensionComponentLoader({
  componentPath,
  userId,
  settings,
}: ExtensionComponentLoaderProps) {
  // Dynamic component loading based on path
  // For feel testing, we'll directly import the components we've built

  // Extract component name from path
  const componentName = componentPath.split('/').pop();

  // Import actual components
  if (componentPath.includes('astrology/WeatherReport')) {
    const { WeatherReport } = require('@/components/extensions/astrology/WeatherReport');
    return <WeatherReport userId={userId} settings={settings} />;
  }

  if (componentPath.includes('astrology/BirthChartSummary')) {
    const { BirthChartSummary } = require('@/components/extensions/astrology/BirthChartSummary');
    return <BirthChartSummary userId={userId} settings={settings} />;
  }

  if (componentPath.includes('astrology/ArchetypalVoices')) {
    const { ArchetypalVoices } = require('@/components/extensions/astrology/ArchetypalVoices');
    return <ArchetypalVoices userId={userId} settings={settings} />;
  }

  // Fallback for unimplemented components
  return (
    <div className="py-4">
      <p className="text-xs text-white/60">
        Extension component: <code className="text-white/80">{componentName}</code>
      </p>
      <p className="text-xs text-white/40 mt-2">
        Component not yet implemented. This is a placeholder.
      </p>
    </div>
  );
}
