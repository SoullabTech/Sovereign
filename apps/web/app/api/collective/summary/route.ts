/**
 * GET /api/collective/summary
 * 
 * Returns a complete dashboard summary with phenomenological language.
 * Combines snapshot, patterns, and timing data into a unified response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CollectiveIntelligence, collective, Logger } from '@/lib/stubs/CollectiveIntelligence';

export const dynamic = 'force-dynamic';

// Stub collective intelligence - Using imported collective instead
// Removed local stub definition
// Temporarily stub out backend imports that are excluded from build
// import { CollectiveIntelligence } from '../../../../backend/src/ain/collective/CollectiveIntelligence';
// import { CollectiveDashboardService } from '../../../../backend/src/services/CollectiveDashboardService';
// import { LanguageMappingService } from '../../../../backend/src/services/LanguageMappingService';

// Initialize services (stubbed)
const dashboardService = {
  getSnapshot: async (params: any) => ({ 
    coherence: { value: 0.75, trend: 'steady', delta: 0 },
    topThemes: [] as Array<{ name: string; label: string; strength: number }>,
    shadowSignals: [] as Array<{ pattern: string; strength: number; recommendation: string }>
  }),
  getPatterns: async (params: any) => ({ items: [] as Array<{ id: string; description: string; strength: number }> }),
  getTiming: async (params: any) => ({ windows: [] as Array<{ phase: string; window: string; practices?: string[]; description: string; confidence: number }> })
};

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const expertMode = searchParams.get('expert') === 'true';
    
    // Get data from dashboard service
    const [snapshot, patterns, timing] = await Promise.all([
      dashboardService.getSnapshot({ window: '7d', expert: expertMode }),
      dashboardService.getPatterns({ window: '7d', expert: expertMode, limit: 5 }),
      dashboardService.getTiming({ horizon: '7d', expert: expertMode })
    ]);

    // Transform to unified dashboard format
    const coherenceTone = generateCoherenceTone(snapshot.coherence.value, snapshot.topThemes);
    
    const themes = snapshot.topThemes.map((theme, index) => ({
      id: `theme-${index}`,
      label: theme.name,
      momentum: theme.strength * 0.8, // Convert strength to momentum
      ...(expertMode ? { _internal: { code: `theme-${index}`, score: theme.strength } } : {})
    }));

    const emerging = patterns.items
      .filter(p => p.strength > 0.7) // Use strength as proxy for rising patterns
      .map(pattern => ({
        id: pattern.id,
        label: pattern.description,
        description: pattern.description,
        momentum: pattern.strength,
        ...(expertMode ? {
          _internal: {
            archetypes: extractArchetypes(pattern),
            elements: extractElements(pattern),
            confidence: pattern.strength
          }
        } : {})
      }));

    const shadowWeather = snapshot.shadowSignals.map((signal, index) => ({
      id: `shadow-${index}`,
      title: extractShadowTitle(signal.pattern),
      prompt: signal.pattern,
      practice: signal.recommendation,
      ...(expertMode ? {
        _internal: {
          pattern: signal.pattern,
          intensity: signal.strength
        }
      } : {})
    }));

    const windows = timing.windows.map((window, index) => ({
      id: `window-${index}`,
      label: window.phase,
      start: window.window,
      end: window.window,
      note: window.practices?.[0] || window.description,
      ...(expertMode ? {
        _internal: {
          windowScore: window.confidence
        }
      } : {})
    }));

    const practices = generatePractices(snapshot, patterns);

    // Build response
    const response = {
      coherence: {
        score: snapshot.coherence.value,
        tone: coherenceTone
      },
      themes,
      emerging,
      shadowWeather,
      windows,
      practices,
      expert: expertMode
    };

    // Return with cache headers
    const res = NextResponse.json(response);
    res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.headers.set('Content-Type', 'application/json');
    
    return res;

  } catch (error) {
    console.error('Error in /api/collective/summary:', error);
    
    // Return graceful fallback
    const fallback = {
      coherence: {
        score: 50,
        tone: 'Today feels steady. Focus on simple, grounding practices.'
      },
      themes: [],
      emerging: [],
      shadowWeather: [],
      windows: [],
      practices: [
        {
          id: 'default-1',
          label: 'Three deep breaths',
          description: 'Pause wherever you are. Three slow, deep breaths.',
          durationMin: 1
        }
      ],
      expert: false
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}

// Helper functions

function generateCoherenceTone(score: number, themes: any[]): string {
  if (score > 80) {
    return `Beautiful alignment today. ${themes[0]?.label || 'Clarity'} is strongly present.`;
  } else if (score > 60) {
    return `Steady energy building. ${themes[0]?.label || 'Focus'} and ${themes[1]?.label || 'grounding'} are available.`;
  } else if (score > 40) {
    return `Today feels tender. Small steps and self-compassion are key.`;
  } else {
    return `The field is scattered. Return to basics: breath, water, rest.`;
  }
}

function extractShadowTitle(label: string): string {
  // Extract the first part of the shadow observation
  const parts = label.split('.');
  return parts[0] || 'Notice what arises';
}

function extractArchetypes(pattern: any): string[] {
  if (!pattern.id) return [];
  if (pattern.id.includes('trickster')) return ['Trickster'];
  if (pattern.id.includes('mother')) return ['Mother'];
  if (pattern.id.includes('sage')) return ['Sage'];
  if (pattern.id.includes('warrior')) return ['Warrior'];
  return [];
}

function extractElements(pattern: any): string[] {
  if (!pattern.id) return [];
  if (pattern.id.includes('fire')) return ['Fire'];
  if (pattern.id.includes('water')) return ['Water'];
  if (pattern.id.includes('earth')) return ['Earth'];
  if (pattern.id.includes('air')) return ['Air'];
  if (pattern.id.includes('aether')) return ['Aether'];
  return [];
}

function generatePractices(snapshot: any, patterns: any): any[] {
  const practices = [];
  
  // Based on dominant themes
  if (snapshot.topThemes.some((t: any) => t.label.includes('courage'))) {
    practices.push({
      id: 'practice-courage',
      label: 'One brave sentence',
      description: 'Write or speak one true thing you\'ve been avoiding.',
      durationMin: 5
    });
  }
  
  if (snapshot.topThemes.some((t: any) => t.label.includes('emotional'))) {
    practices.push({
      id: 'practice-emotion',
      label: 'Feel for 60 seconds',
      description: 'Set a timer. Let yourself feel whatever is present.',
      durationMin: 1
    });
  }
  
  if (snapshot.topThemes.some((t: any) => t.label.includes('grounding'))) {
    practices.push({
      id: 'practice-ground',
      label: 'Barefoot on earth',
      description: 'Stand barefoot on grass or soil for a few minutes.',
      durationMin: 3
    });
  }
  
  // Default practice if none match
  if (practices.length === 0) {
    practices.push({
      id: 'practice-default',
      label: 'Three deep breaths',
      description: 'Wherever you are, pause for three slow breaths.',
      durationMin: 1
    });
  }
  
  return practices.slice(0, 3); // Limit to 3 practices
}