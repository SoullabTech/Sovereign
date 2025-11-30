"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  CompatibilityReport,
  initializeBrowserCompatibility
} from '@/lib/utils/browser-compatibility';

interface BrowserCompatibilityContextType {
  report: CompatibilityReport | null;
  isLegacy: boolean;
  warnings: string[];
  recommendations: string[];
  isLoading: boolean;
}

const BrowserCompatibilityContext = createContext<BrowserCompatibilityContextType>({
  report: null,
  isLegacy: false,
  warnings: [],
  recommendations: [],
  isLoading: true,
});

export function BrowserCompatibilityProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize browser compatibility on client side only
    if (typeof window !== 'undefined') {
      try {
        const compatibilityReport = initializeBrowserCompatibility();
        setReport(compatibilityReport);
      } catch (error) {
        console.error('Failed to initialize browser compatibility:', error);
        // Create fallback report for degraded functionality
        setReport({
          browser: {
            name: 'unknown',
            version: '0',
            engine: 'unknown',
            platform: 'unknown',
            isLegacy: true,
            supportLevel: 'minimal'
          },
          features: {
            webapi: false,
            css: false,
            javascript: false,
            audio: false,
            storage: false,
            pwa: false
          },
          warnings: ['Browser compatibility check failed'],
          recommendations: ['Please try refreshing the page or using a different browser']
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const contextValue: BrowserCompatibilityContextType = {
    report,
    isLegacy: report?.browser.isLegacy || false,
    warnings: report?.warnings || [],
    recommendations: report?.recommendations || [],
    isLoading,
  };

  return (
    <BrowserCompatibilityContext.Provider value={contextValue}>
      {children}
    </BrowserCompatibilityContext.Provider>
  );
}

export function useBrowserCompatibility(): BrowserCompatibilityContextType {
  const context = useContext(BrowserCompatibilityContext);
  if (context === undefined) {
    throw new Error('useBrowserCompatibility must be used within a BrowserCompatibilityProvider');
  }
  return context;
}

/**
 * Hook for conditional rendering based on feature support
 */
export function useFeatureSupport() {
  const { report } = useBrowserCompatibility();

  return {
    hasAudioSupport: report?.features.audio || false,
    hasPWASupport: report?.features.pwa || false,
    hasModernCSS: report?.features.css || false,
    hasWebAPISupport: report?.features.webapi || false,
    hasStorageSupport: report?.features.storage || false,
    hasModernJS: report?.features.javascript || false,
  };
}

/**
 * Component for showing browser compatibility warnings
 */
export function BrowserCompatibilityBanner() {
  const { warnings, recommendations, isLegacy, isLoading } = useBrowserCompatibility();

  // Don't show banner if loading or no warnings
  if (isLoading || warnings.length === 0) {
    return null;
  }

  // Only show for legacy browsers or serious compatibility issues
  const shouldShow = isLegacy || warnings.some(warning =>
    warning.includes('not supported') ||
    warning.includes('outdated') ||
    warning.includes('failed')
  );

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            Browser Compatibility Notice
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <ul className="list-disc pl-5 space-y-1">
              {warnings.slice(0, 2).map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            {recommendations.length > 0 && (
              <p className="mt-2 font-medium">
                Recommendation: {recommendations[0]}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Component for graceful feature degradation
 */
export function FeatureWrapper({
  feature,
  children,
  fallback
}: {
  feature: keyof CompatibilityReport['features'];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { report } = useBrowserCompatibility();

  if (!report) {
    return <>{fallback || children}</>;
  }

  const isSupported = report.features[feature];

  if (!isSupported && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}