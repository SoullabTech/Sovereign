'use client';

// Client-only React hooks for Supabase
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// Hook for getting current user
export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user as any);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null as any);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return user;
}

// Hook for getting Supabase client
export function useSupabaseClient() {
  return supabase;
}