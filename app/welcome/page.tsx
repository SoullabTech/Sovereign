"use client";

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function WelcomePage() {
  useEffect(() => {
    // Redirect to the canonical welcome-back page
    window.location.href = '/welcome-back';
  }, []);

  // Also trigger server-side redirect
  redirect('/welcome-back');
}