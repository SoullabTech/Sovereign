"use client";

import { SoullabChatInterface } from '../../components/SoullabChatInterface';
import { useEffect, useState } from 'react';

export default function SoullabPage() {
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    // Get or create user ID for this session
    let storedUserId = localStorage.getItem('soullab_user_id');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('soullab_user_id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  if (!userId) {
    return (
      <div className="min-h-screen  from-slate-900 via-amber-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-200">Initializing your personal Oracle...</p>
        </div>
      </div>
    );
  }

  return <SoullabChatInterface userId={userId} />;
}