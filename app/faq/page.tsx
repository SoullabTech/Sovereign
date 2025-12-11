'use client';

import { FAQSection } from '@/components/onboarding/FAQSection';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FAQPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Explorer');

  useEffect(() => {
    // Get user name if available
    try {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const userData = JSON.parse(betaUser);
        if (userData.name) {
          setUserName(userData.name);
        }
      }
    } catch (e) {
      // Use default name
    }
  }, []);

  const handleComplete = () => {
    // After FAQ, go to disposable pixel process
    router.push('/onboarding');
  };

  return (
    <FAQSection
      userName={userName}
      onComplete={handleComplete}
    />
  );
}