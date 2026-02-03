'use client';

import { FAQSection } from '@/components/onboarding/FAQSection';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FAQPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Explorer');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already completed full onboarding
    try {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const userData = JSON.parse(betaUser);
        if (userData.onboarded) {
          // Already fully onboarded, go to main app
          router.replace('/maia');
          return;
        }
        if (userData.name) {
          setUserName(userData.name);
        }
      }
    } catch (e) {
      // Use default name
    }
    setIsLoading(false);
  }, [router]);

  const handleComplete = () => {
    // After FAQ, go to disposable pixel process
    router.push('/onboarding');
  };

  if (isLoading) {
    return null;
  }

  return (
    <FAQSection
      userName={userName}
      onComplete={handleComplete}
    />
  );
}