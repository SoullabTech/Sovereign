/**
 * ExperienceLayout - Dynamic component layout engine for disposable pixels
 */

import React from 'react';
import { MODULE_REGISTRY, ExperienceModuleConfig, validateModuleConfig } from './ModuleRegistry';

interface AwarenessData {
  level: number;
  confidence: number;
}

interface Suggestion {
  title: string;
  body: string;
}

interface ExperienceLayoutProps {
  modules: ExperienceModuleConfig[];
  awareness?: AwarenessData;
  suggestions?: Suggestion[];
  onNewSession?: (prompt: string) => void;
  onSaveReflection?: (text: string) => void;
  loading?: boolean;
  className?: string;
}

export const ExperienceLayout: React.FC<ExperienceLayoutProps> = ({
  modules,
  awareness,
  suggestions,
  onNewSession,
  onSaveReflection,
  loading = false,
  className = ""
}) => {

  // Group modules by region and sort by priority
  const modulesByRegion = modules.reduce((acc, moduleConfig) => {
    if (!validateModuleConfig(moduleConfig)) {
      console.warn(`Invalid module config:`, moduleConfig);
      return acc;
    }

    if (!acc[moduleConfig.region]) {
      acc[moduleConfig.region] = [];
    }

    acc[moduleConfig.region].push(moduleConfig);
    return acc;
  }, {} as Record<string, ExperienceModuleConfig[]>);

  // Sort each region by priority (higher = first)
  Object.keys(modulesByRegion).forEach(region => {
    modulesByRegion[region].sort((a, b) => b.priority - a.priority);
  });

  // Render a module with enriched props based on its type
  const renderModule = (moduleConfig: ExperienceModuleConfig, index: number) => {
    const { id, props } = moduleConfig;

    if (!(id in MODULE_REGISTRY)) {
      console.error(`Unknown module ID: ${id}. Check MODULE_REGISTRY.`);
      return (
        <div key={`${id}-${index}`} className="p-4 bg-red-900/20 border border-red-400/50 rounded-lg">
          <div className="text-red-300 text-sm">
            Unknown module: {id}
          </div>
        </div>
      );
    }

    const Component = MODULE_REGISTRY[id];
    let enrichedProps = { ...props };

    // Enrich props based on module type
    switch (id) {
      case 'ConsciousnessComputingPanel':
        enrichedProps = {
          ...enrichedProps,
          awareness,
          suggestions,
          onNewSession,
          loading
        };
        break;

      case 'ReflectionJournal':
        enrichedProps = {
          ...enrichedProps,
          onSave: onSaveReflection
        };
        break;

      case 'WelcomePioneerBanner':
        // Banner uses mostly its configured props
        break;

      default:
        // Unknown module type - use props as-is
        break;
    }

    return (
      <div key={`${id}-${index}`} data-module={id} data-region={moduleConfig.region}>
        <Component {...enrichedProps} />
      </div>
    );
  };

  // Render a region's modules
  const renderRegion = (regionName: string, modules: ExperienceModuleConfig[]) => {
    if (!modules || modules.length === 0) return null;

    const regionClasses = {
      top: 'order-1',
      center: 'order-2 flex-1',
      bottom: 'order-3',
      sidebar: 'order-4 w-full lg:w-1/3'
    };

    return (
      <div
        key={regionName}
        className={`
          w-full space-y-6
          ${regionClasses[regionName as keyof typeof regionClasses] || ''}
        `}
        data-region={regionName}
      >
        {modules.map(renderModule)}
      </div>
    );
  };

  return (
    <div className={`
      min-h-screen flex flex-col space-y-6 p-6
      ${className}
    `}>
      {/* Render regions in order */}
      {renderRegion('top', modulesByRegion.top)}

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        <div className="flex-1 flex flex-col space-y-6">
          {renderRegion('center', modulesByRegion.center)}
          {renderRegion('bottom', modulesByRegion.bottom)}
        </div>

        {modulesByRegion.sidebar && (
          <div className="lg:w-1/3">
            {renderRegion('sidebar', modulesByRegion.sidebar)}
          </div>
        )}
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded border border-white/20 max-w-xs">
          <div className="font-medium mb-1">Layout Debug</div>
          <div>Modules: {modules.length}</div>
          <div>Regions: {Object.keys(modulesByRegion).join(', ')}</div>
          <div>Awareness: {awareness ? `L${awareness.level} (${Math.round(awareness.confidence * 100)}%)` : 'None'}</div>
          <div>Suggestions: {suggestions?.length || 0}</div>
        </div>
      )}
    </div>
  );
};

export default ExperienceLayout;