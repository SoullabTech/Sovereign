/**
 * Profile Memory Layer - Stub Implementation
 * TODO: Replace with actual user profile/traits retrieval from Mem0 or user database
 */

import { MemoryResult, MemoryLayer } from './types';

export const profileMemory: MemoryLayer = {
  async fetch(query: string, userId: string, options?: any): Promise<MemoryResult[]> {
    // Simulate profile database lookup
    await new Promise(resolve => setTimeout(resolve, 75));

    // Mock user profiles based on common archetypes
    const mockProfiles = {
      'seeker': {
        archetype: 'Seeker',
        element: 'Air',
        traits: ['curious', 'questioning', 'philosophical'],
        preferences: 'values depth over surface conversation'
      },
      'creator': {
        archetype: 'Creator',
        element: 'Fire', 
        traits: ['innovative', 'expressive', 'passionate'],
        preferences: 'responds well to creative challenges'
      },
      'nurturer': {
        archetype: 'Nurturer',
        element: 'Water',
        traits: ['empathetic', 'supportive', 'intuitive'],
        preferences: 'appreciates emotional resonance'
      },
      'builder': {
        archetype: 'Builder',
        element: 'Earth',
        traits: ['practical', 'methodical', 'grounded'],
        preferences: 'values concrete steps and real-world application'
      }
    };

    // Simple hash to consistent archetype (in real implementation, this would be stored)
    const userHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const archetypeKeys = Object.keys(mockProfiles);
    const selectedArchetype = archetypeKeys[userHash % archetypeKeys.length];
    const profile = mockProfiles[selectedArchetype as keyof typeof mockProfiles];

    const profileContent = `User profile: ${profile.archetype} archetype with ${profile.element} element. Key traits: ${profile.traits.join(', ')}. ${profile.preferences}.`;

    return [{
      content: profileContent,
      relevance: 0.8,
      tokens: Math.ceil(profileContent.length / 4),
      source: 'profile',
      metadata: {
        timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), // 1 week ago (profile creation)
        id: `profile_${userId}`,
        tags: [profile.archetype.toLowerCase(), profile.element.toLowerCase(), ...profile.traits],
        type: 'user_profile'
      }
    }];
  }
};