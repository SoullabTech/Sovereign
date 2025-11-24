import { NextRequest, NextResponse } from 'next/server';
import { CollectiveNarrativeService } from '@/lib/services/CollectiveNarrativeService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const timeframe = url.searchParams.get('timeframe') || '30d';
    
    // Generate realistic collective data based on timeframe
    const currentDate = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
    
    // Simulate collective archetypal distribution with temporal patterns
    const baseDistribution = {
      Hero: 0.18,
      Sage: 0.16,
      Creator: 0.19,
      Lover: 0.17,
      Seeker: 0.15,
      Shadow: 0.15
    };
    
    // Add seasonal and temporal variations
    const now = new Date();
    const monthOfYear = now.getMonth();
    const hourOfDay = now.getHours();
    
    // Seasonal archetypal shifts
    const seasonalModifiers = {
      Hero: Math.sin(monthOfYear * Math.PI / 6) * 0.05,
      Sage: Math.cos(monthOfYear * Math.PI / 6) * 0.04,
      Creator: Math.sin((monthOfYear + 3) * Math.PI / 6) * 0.06,
      Lover: Math.cos((monthOfYear + 6) * Math.PI / 6) * 0.05,
      Seeker: Math.sin((monthOfYear + 9) * Math.PI / 6) * 0.04,
      Shadow: Math.cos((monthOfYear + 12) * Math.PI / 6) * 0.03
    };
    
    // Calculate total encounters (simulated based on user base growth)
    const totalEncounters = Math.floor(1200 + (days * 15) + Math.random() * 200);
    
    // Generate archetype distribution with modifiers
    const archetypeDistribution: Record<string, number> = {};
    Object.entries(baseDistribution).forEach(([archetype, baseRate]) => {
      const modifier = seasonalModifiers[archetype as keyof typeof seasonalModifiers] || 0;
      const adjustedRate = Math.max(0.05, baseRate + modifier);
      archetypeDistribution[archetype] = Math.floor(totalEncounters * adjustedRate);
    });
    
    // Generate collective heatmap (7 days x 24 hours)
    const collectiveHeatmap: number[][] = [];
    for (let day = 0; day < 7; day++) {
      const dayData: number[] = [];
      for (let hour = 0; hour < 24; hour++) {
        // Peak hours: 7-9am (morning reflection), 7-10pm (evening integration)
        let baseIntensity = 0.2;
        if (hour >= 7 && hour <= 9) baseIntensity += 0.4; // Morning peak
        if (hour >= 19 && hour <= 22) baseIntensity += 0.5; // Evening peak
        if (day === 0 || day === 6) baseIntensity *= 0.8; // Weekend adjustment
        
        // Add some randomness and archetypal influences
        const intensity = Math.min(1.0, baseIntensity + (Math.random() * 0.3 - 0.15));
        dayData.push(Math.max(0.05, intensity));
      }
      collectiveHeatmap.push(dayData);
    }
    
    // Generate recent collective patterns with mythic language
    const recentPatterns = [
      "The Shadow stirs at twilight - 23% increase in shadow work during evening hours",
      "Hero's Journey intensifies - breakthrough patterns emerging in morning sessions",
      "Collective Creator awakening - 18% surge in artistic and innovative encounters",
      "Sage wisdom flows stronger - integration insights reaching new depths",
      "Lover archetype blooms - heart-opening experiences spreading through the field",
      "Seeker energy peaks - questions of purpose echoing across consciousness"
    ];
    
    // Shuffle and take 3-4 patterns
    const selectedPatterns = recentPatterns
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 2));
    
    // Calculate growth trends
    const growthTrends = {
      totalGrowthRate: '+12%',
      dominantArchetype: Object.entries(archetypeDistribution)
        .sort(([,a], [,b]) => b - a)[0][0],
      emergingArchetype: 'Creator', // Based on recent surge
      integrationRate: '78%'
    };
    
    // Weekly/monthly insights (moved before use)
    const temporalInsights = {
      peakDays: ['Tuesday', 'Thursday', 'Sunday'],
      peakHours: ['8am-9am', '7pm-9pm'],
      quietPeriods: ['3am-6am', '12pm-2pm'],
      weekendPattern: 'Integration-focused',
      weekdayPattern: 'Breakthrough-oriented'
    };
    
    // Generate enhanced oracle narrative
    const narrativeService = CollectiveNarrativeService.getInstance();
    const statsData = {
      timeframe,
      totalEncounters,
      archetypeDistribution,
      collectiveHeatmap,
      recentPatterns: selectedPatterns,
      growthTrends,
      mythicNarrative: '', // Will be replaced
      temporalInsights,
      generatedAt: new Date().toISOString()
    };
    
    const oracleNarrative = narrativeService.generateOracleNarrative(statsData);
    const seasonalNarrative = narrativeService.generateSeasonalNarrative();
    
    // temporalInsights already defined above, removing duplicate
    
    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        totalEncounters,
        archetypeDistribution,
        collectiveHeatmap,
        recentPatterns: selectedPatterns,
        growthTrends,
        mythicNarrative: oracleNarrative.fullNarrative,
        oracleNarrative,
        seasonalNarrative,
        temporalInsights,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Collective evolution API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch collective evolution data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

