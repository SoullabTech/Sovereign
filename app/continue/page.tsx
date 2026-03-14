'use client';

// /continue is a friendly alias for /resume
// Use either URL in support emails, banners, or error states

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContinuePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/resume');
  }, [router]);
  return null;
}
