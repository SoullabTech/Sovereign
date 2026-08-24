'use client';

// Unified with /signup as of 2026-06-04: there is one front door, not a
// password-first signin plus a separate signup. Email + one-time code is the
// default action; biometric is the return path; Google/Apple secondary;
// password is recovery. All of it lives in the shared component so the two
// routes can never drift apart again. See components/auth/UnifiedAuth.tsx.
import UnifiedAuth from '@/components/auth/UnifiedAuth';

export default function SigninPage() {
  return <UnifiedAuth intent="returning" />;
}
