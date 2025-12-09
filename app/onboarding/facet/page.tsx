'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FacetRouter from '@/components/onboarding/FacetRouter';

export default function FacetRouterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get partner context from URL params
  const institution = searchParams.get('institution');
  const context = searchParams.get('context');

  let partnerContext = 'general';
  if (institution === 'yale') {
    if (context === 'tsai') partnerContext = 'yale_tsai';
    else if (context === 'staff' || context === 'wellbeing') partnerContext = 'yale_staff';
    else if (context === 'clinical') partnerContext = 'yale_clinical';
    else if (context === 'community') partnerContext = 'yale_community';
    else partnerContext = 'yale_general';
  }

  const handleFacetComplete = (facetProfile: {
    reason: string;
    feeling: string;
    partnerContext?: string;
  }) => {
    // Store facet profile in localStorage for Sacred Soul Induction to use
    localStorage.setItem('facet_profile', JSON.stringify(facetProfile));

    console.log('✨ [Facet Router] Profile created:', facetProfile);

    // Route to Sacred Soul Induction with facet awareness
    router.push('/onboarding');
  };

  return (
    <FacetRouter
      partnerContext={partnerContext}
      onComplete={handleFacetComplete}
    />
  );
}