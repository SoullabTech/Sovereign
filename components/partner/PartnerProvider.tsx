'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { PartnerContext, usePartnerDetection, usePartnerTheme, createPartnerContextValue } from '../../lib/partner/usePartnerConfig';
import { getPartnerConfig } from '../../lib/partner/partner-config';

interface PartnerProviderProps {
  children: ReactNode;
  forcedPartner?: string; // For testing or explicit partner selection
}

export function PartnerProvider({ children, forcedPartner }: PartnerProviderProps) {
  const detectedPartner = usePartnerDetection();
  const partnerSlug = forcedPartner || detectedPartner;
  const [contextValue, setContextValue] = useState(() => createPartnerContextValue(partnerSlug));

  // Update context when partner changes
  useEffect(() => {
    setContextValue(createPartnerContextValue(partnerSlug));
  }, [partnerSlug]);

  // Apply partner theme
  const partnerConfig = partnerSlug ? getPartnerConfig(partnerSlug) : null;
  usePartnerTheme(partnerConfig);

  // Update document title for partner
  useEffect(() => {
    if (partnerConfig && typeof document !== 'undefined') {
      const originalTitle = document.title;
      document.title = `${partnerConfig.onboarding.organizationName} - Consciousness Computing`;

      return () => {
        document.title = originalTitle;
      };
    }
  }, [partnerConfig]);

  return (
    <PartnerContext.Provider value={contextValue}>
      <div className={partnerConfig ? 'partner-themed' : ''}>
        {children}
      </div>
    </PartnerContext.Provider>
  );
}