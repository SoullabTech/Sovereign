'use client';

// Both /signup and /signin render the same front door — email + one-time code
// primary, biometric return, Google/Apple secondary, password recovery.
// See components/auth/UnifiedAuth.tsx.
import UnifiedAuth from '@/components/auth/UnifiedAuth';

export default function SignupPage() {
  return <UnifiedAuth mode="signup" />;
}
