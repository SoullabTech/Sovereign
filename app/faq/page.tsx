'use client';

import { FAQSection } from '@/components/onboarding/FAQSection';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackOnboarding } from '@/lib/onboarding/telemetry';
import { apiFetch } from '@/lib/http/apiBase';

export default function FAQPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Explorer');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const userData = JSON.parse(betaUser);
        if (userData.onboarded) {
          router.replace('/maia');
          return;
        }
        if (userData.name) setUserName(userData.name);
        if (userData.id) setMemberId(userData.id);
      }
    } catch {
      // Use defaults
    }
    trackOnboarding({ event: 'faq_started', path: '/faq' });
    setIsLoading(false);
  }, [router]);

  const handleComplete = async () => {
    trackOnboarding({ event: 'faq_completed', memberId, path: '/faq' });

    // Persist progress server-side so resuming from a different device works
    try {
      await apiFetch('/api/members/progress', {
        method: 'POST',
        body: JSON.stringify({ step: 'onboarding' }),
      });
    } catch {
      // Non-fatal — continue regardless
    }

    router.push('/onboarding');
  };

  if (isLoading) return null;

  return (
    <FAQSection
      userName={userName}
      onComplete={handleComplete}
    />
  );
}
