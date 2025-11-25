import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { IntakeService } from '../services/intakeService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PersonalizationData {
  name: string;
  pronouns?: string;
  focusAreas?: string[];
  spiritualPractices?: string[];
  elementalBalance?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  dominantElement?: string;
  natalChart?: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
  };
  archetypes?: string[];
  currentThemes?: string[];
}

export function usePersonalization() {
  const [personalization, setPersonalization] = useState<PersonalizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersonalization();
  }, []);

  const loadPersonalization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Load intake data
      const { data: intake } = await supabase
        .from('beta_intake')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!intake) {
        setIsLoading(false);
        return;
      }

      // Load natal chart if available
      const { data: natalChart } = await supabase
        .from('natal_charts')
        .select('sun_sign, moon_sign, rising_sign, dominant_element, elemental_balance')
        .eq('user_id', user.id)
        .single();

      // Analyze focus areas for elemental insights
      const insights = intake.focus_areas 
        ? IntakeService.analyzeFocusAreas(intake.focus_areas)
        : null;

      // Build personalization object
      const personalData: PersonalizationData = {
        name: intake.name || 'friend',
        pronouns: intake.pronouns,
        focusAreas: intake.focus_areas,
        spiritualPractices: intake.spiritual_practices,
        elementalBalance: natalChart?.elemental_balance || insights?.elementalBalance,
        dominantElement: natalChart?.dominant_element || insights?.dominantElement,
        archetypes: intake.archetype_connections,
        currentThemes: intake.focus_areas
      };

      if (natalChart) {
        personalData.natalChart = {
          sunSign: natalChart.sun_sign,
          moonSign: natalChart.moon_sign,
          risingSign: natalChart.rising_sign
        };
      }

      setPersonalization(personalData);
      setIsLoading(false);

      // Trigger natal chart calculation if we have birth data but no chart
      if (intake.birth_date && !natalChart) {
        IntakeService.calculateNatalChart(user.id, {
          date: intake.birth_date,
          time: intake.birth_time,
          place: intake.birth_place_city
        });
      }
    } catch (error) {
      console.error('Error loading personalization:', error);
      setIsLoading(false);
    }
  };

  const updatePersonalization = async (updates: Partial<PersonalizationData>) => {
    if (!personalization) return;

    setPersonalization({
      ...personalization,
      ...updates
    });

    // Optionally save updates to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('beta_intake')
          .update({
            focus_areas: updates.focusAreas,
            spiritual_practices: updates.spiritualPractices,
            archetype_connections: updates.archetypes
          })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating personalization:', error);
    }
  };

  const getGreetingContext = () => {
    if (!personalization) return null;

    const hour = new Date().getHours();
    const context = {
      timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night',
      name: personalization.name,
      dominantElement: personalization.dominantElement,
      currentFocus: personalization.focusAreas?.[0],
      astrology: personalization.natalChart
    };

    return context;
  };

  const getElementalGuidance = () => {
    if (!personalization?.dominantElement) return null;

    const guidance: Record<string, string> = {
      fire: "I notice you've been working with transformation and will",
      water: "Our conversations have been exploring emotional depths",
      earth: "You've been focused on grounding and manifestation",
      air: "We've been navigating ideas and mental clarity"
    };

    return guidance[personalization.dominantElement];
  };

  return {
    personalization,
    isLoading,
    updatePersonalization,
    getGreetingContext,
    getElementalGuidance
  };
}