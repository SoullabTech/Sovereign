'use client';

import { createClientComponentClient } from '@/lib/supabase';

export interface OnboardingData {
  explorerId: string;
  explorerName: string;
  elementalResonance?: string;
  userIntention?: string;
  orientationFeedback?: string;
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = createClientComponentClient();

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, beta_onboarded_at')
      .eq('id', data.explorerId)
      .single();

    if (existingUser?.beta_onboarded_at) {
      console.log('✅ User already onboarded');
      return { success: true, user: existingUser };
    }

    const userData = {
      id: data.explorerId,
      sacred_name: data.explorerName,
      user_intention: data.userIntention || 'Exploring consciousness',
      beta_onboarded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'id' })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      throw userError;
    }

    const { data: agent, error: agentError } = await supabase
      .from('oracle_agents')
      .upsert({
        user_id: data.explorerId,
        name: 'Maia',
        archetype: 'sacred_guide',
        personality_config: {
          voice_style: 'contemplative',
          wisdom_tradition: 'universal',
          communication_depth: 'soul_level',
          memory_integration: 'holistic',
          elemental_resonance: data.elementalResonance || 'aether'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (agentError) {
      console.error('Error creating oracle agent:', agentError);
    }

    const { error: prefsError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: data.explorerId,
        tone: 70,
        style: 'auto',
        theme: 'dark',
        voice_enabled: true,
        voice_speed: 0.95,
        show_thinking: true,
        auto_play_voice: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (prefsError) {
      console.error('Error creating preferences:', prefsError);
    }

    localStorage.setItem('betaOnboardingComplete', 'true');
    localStorage.setItem('explorerId', data.explorerId);
    localStorage.setItem('explorerName', data.explorerName);

    if ('vibrate' in navigator) {
      navigator.vibrate([0, 20, 40, 30, 60, 40, 80, 50]);
    }

    console.log('✅ Onboarding complete:', user);

    return { success: true, user, agent };

  } catch (error) {
    console.error('Onboarding error:', error);

    localStorage.setItem('betaOnboardingComplete', 'true');
    localStorage.setItem('explorerId', data.explorerId);
    localStorage.setItem('explorerName', data.explorerName);

    return { success: false, error };
  }
}

export async function checkOnboardingStatus(explorerId: string): Promise<boolean> {
  const localOnboarded = localStorage.getItem('betaOnboardingComplete') === 'true';

  if (!explorerId) {
    return false;
  }

  try {
    const supabase = createClientComponentClient();
    const { data: user } = await supabase
      .from('users')
      .select('beta_onboarded_at')
      .eq('id', explorerId)
      .single();

    if (user?.beta_onboarded_at) {
      localStorage.setItem('betaOnboardingComplete', 'true');
      return true;
    }

    return localOnboarded;
  } catch (error) {
    console.log('Could not check Supabase, using localStorage');
    return localOnboarded;
  }
}

export async function getUserData(explorerId: string) {
  if (!explorerId) return null;

  try {
    const supabase = createClientComponentClient();

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', explorerId)
      .single();

    const { data: agent } = await supabase
      .from('oracle_agents')
      .select('*')
      .eq('user_id', explorerId)
      .single();

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', explorerId)
      .single();

    return { user, agent, preferences: prefs };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}