'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type {
  Petal,
  PetalInteraction,
  SacredCheckIn,
  OracleJournalEntry,
  WildPetalDraw,
  OracleProfile,
  Element,
  EnergyState,
  Mood,
  InteractionType,
  EntryType
} from '@/lib/types/oracle';

// Hook for managing Oracle profile
export function useOracleProfile(userId?: string) {
  const [profile, setProfile] = useState<OracleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !supabase) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('oracle_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (!data) {
          // Create default profile if none exists
          const { data: newProfile, error: createError } = await supabase
            .from('oracle_profiles')
            .insert({
              user_id: userId,
              current_energy_state: 'emerging',
              preferred_voice: 'oracle',
              auto_play_voice: true
            })
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = useCallback(async (updates: Partial<OracleProfile>) => {
    if (!userId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('oracle_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId]);

  return { profile, loading, error, updateProfile };
}

// Hook for tracking petal interactions
export function usePetalInteractions() {
  const [interactions, setInteractions] = useState<PetalInteraction[]>([]);
  const [loading, setLoading] = useState(false);

  const trackInteraction = useCallback(async (
    petal: Petal,
    interactionType: InteractionType = 'click',
    voicePlayed: boolean = false
  ) => {
    if (!supabase) {
      console.log('Supabase not configured, skipping interaction tracking');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, skipping interaction tracking');
        return;
      }

      const { data, error } = await supabase
        .from('petal_interactions')
        .insert({
          user_id: user.id,
          petal_id: petal.id,
          element: petal.element,
          petal_number: petal.number,
          petal_name: petal.name,
          petal_state: petal.state,
          message: petal.message,
          voice_played: voicePlayed,
          interaction_type: interactionType
        })
        .select()
        .single();

      if (error) throw error;
      
      setInteractions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error tracking petal interaction:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentInteractions = useCallback(async (limit: number = 10) => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('petal_interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setInteractions(data || []);
    } catch (err) {
      console.error('Error fetching interactions:', err);
    }
  }, []);

  return { interactions, loading, trackInteraction, fetchRecentInteractions };
}

// Hook for sacred check-ins
export function useSacredCheckIn() {
  const [checkIns, setCheckIns] = useState<SacredCheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  const saveCheckIn = useCallback(async (
    mood: Mood,
    symbol: string,
    notes?: string
  ) => {
    if (!supabase) {
      console.log('Supabase not configured, skipping check-in');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, skipping check-in');
        return;
      }

      const { data, error } = await supabase
        .from('sacred_checkins')
        .insert({
          user_id: user.id,
          mood,
          symbol,
          notes
        })
        .select()
        .single();

      if (error) throw error;
      
      setCheckIns(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error saving check-in:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodayCheckIns = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('sacred_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCheckIns(data || []);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
    }
  }, []);

  return { checkIns, loading, saveCheckIn, fetchTodayCheckIns };
}

// Hook for journal entries
export function useOracleJournal() {
  const [entries, setEntries] = useState<OracleJournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const saveJournalEntry = useCallback(async (
    content: string,
    entryType: EntryType = 'free_form',
    options?: {
      title?: string;
      element?: Element;
      petalInteractionId?: string;
      checkinId?: string;
      tags?: string[];
      voiceContext?: string;
    }
  ) => {
    if (!supabase) {
      console.log('Supabase not configured, skipping journal save');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, skipping journal save');
        return;
      }

      const { data, error } = await supabase
        .from('oracle_journal_entries')
        .insert({
          user_id: user.id,
          content,
          entry_type: entryType,
          title: options?.title,
          element: options?.element,
          petal_interaction_id: options?.petalInteractionId,
          checkin_id: options?.checkinId,
          tags: options?.tags,
          voice_context: options?.voiceContext,
          is_private: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setEntries(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error saving journal entry:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentEntries = useCallback(async (limit: number = 20) => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('oracle_journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
    }
  }, []);

  return { entries, loading, saveJournalEntry, fetchRecentEntries };
}

// Hook for wild petal draws
export function useWildPetalDraws() {
  const [draws, setDraws] = useState<WildPetalDraw[]>([]);
  const [loading, setLoading] = useState(false);

  const saveWildDraw = useCallback(async (
    petal: Petal,
    voicePlayed: boolean = false
  ) => {
    if (!supabase) {
      console.log('Supabase not configured, skipping wild draw save');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, skipping wild draw save');
        return;
      }

      const { data, error } = await supabase
        .from('wild_petal_draws')
        .insert({
          user_id: user.id,
          petal_id: petal.id,
          element: petal.element,
          petal_name: petal.name,
          message: petal.message,
          voice_played: voicePlayed
        })
        .select()
        .single();

      if (error) throw error;
      
      setDraws(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error saving wild draw:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { draws, loading, saveWildDraw };
}