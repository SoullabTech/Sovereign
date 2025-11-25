'use client';

import { useEffect } from 'react';
import { initSafariFixes } from '@/lib/utils/safari-button-fix-complete';

export default function SafariButtonFix() {
  useEffect(() => {
    // Initialize Safari fixes when component mounts
    initSafariFixes();

    // Cleanup function (mutation observer is handled internally)
    return () => {
      // The mutation observer is handled by initSafariFixes
      console.log('🔧 [Safari Fix] Component unmounted');
    };
  }, []);

  // This component renders nothing
  return null;
}