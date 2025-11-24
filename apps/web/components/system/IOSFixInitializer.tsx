'use client';

import { useEffect } from 'react';
import { initIOSFixes } from '../../utils/ios-fixes';

export default function IOSFixInitializer() {
  useEffect(() => {
    initIOSFixes();
  }, []);

  return null; // This component doesn't render anything
}