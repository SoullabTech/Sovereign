'use client';

import { useEffect } from 'react';

export default function SigninPage() {
  useEffect(() => {
    // Redirect to the existing luxurious retreat signin
    window.location.href = '/soul-gateway';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 flex items-center justify-center">
      <div className="text-amber-300">Redirecting to signin...</div>
    </div>
  );
}