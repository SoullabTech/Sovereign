'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Clears all local auth state and redirects to sign-in.
 * Hitting this page is safe to do from any browser tab.
 */
export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all known auth keys from localStorage
    try {
      localStorage.removeItem('beta_user');
      localStorage.removeItem('memberId');
    } catch {
      // localStorage unavailable — continue to redirect anyway
    }

    // Clear the maia_member_id cookie (server-side auth)
    document.cookie = 'maia_member_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

    router.replace('/signin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <p className="text-slate-400 text-sm">Signing out…</p>
    </div>
  );
}
