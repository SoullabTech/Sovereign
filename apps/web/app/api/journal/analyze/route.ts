import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { JournalingMode, JournalingResponse } from '@/lib/journaling/JournalingPrompts';
import { JournalSoulprintIntegration } from '@/lib/soulprint/JournalSoulprintIntegration';
import { mem0 } from '@/lib/memory/mem0';
import { sentimentService } from '@/lib/safety/sentiment';
import { soulIndex } from '@/lib/vectors/soulIndex';
import { claudeBridge } from '@/lib/ai/ClaudeBridge';
import { AfferentStreamGenerator } from '@/lib/ain/AfferentStreamGenerator';
import { maiaRealtimeMonitor } from '@/lib/monitoring/MaiaRealtimeMonitor';
import { maiaMonitoring } from '@/lib/beta/MaiaMonitoring';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const sessionId = `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { entry, mode, userId, soulprint } = await req.json();
    const requestUserId = userId || 'demo-user';

    if (!entry || typeof entry !== 'string') {
      return NextResponse.json(
        { error: 'Journal entry is required and must be a string' },
        { status: 400 }
      );
    }

    if (!mode || !['free', 'dream', 'emotional', 'shadow', 'direction'].includes(mode)) {
      return NextResponse.json(
        { error: 'Valid journaling mode is required' },
        { status: 400 }
      );
    }

    // 📊 Start monitoring session
    maiaRealtimeMonitor.startSession(sessionId);

    const analysis = await sentimentService.analyzeWithModeration(entry);

    if (analysis.moderation.alert) {
      return NextResponse.json({
        success: true,
        needsSupport: true,
        supportMessage: analysis.moderation.alertMessage,
        resources: sentimentService.getCrisisResources()
      });
    }

    let recentSymbols: string[] = [];
    let recentArchetypes: string[] = [];
    let sessionCount = 0;

    if (userId && soulprint) {
      recentSymbols = soulprint.dominantSymbols?.slice(0, 5) || [];
      recentArchetypes = soulprint.dominantArchetypes?.slice(0, 3) || [];
      sessionCount = soulprint.journalCount || 0;
    }

    try {
      const analysisResult = await claudeBridge.analyzeEntry({
        entry,
        mode: mode as JournalingMode,
        userId,
        previousContext: {
          recentSymbols,
          recentArchetypes,
          sessionCount
        }
      });

      const journalingResponse: JournalingResponse = {
        symbols: analysisResult.symbols,
        archetypes: analysisResult.archetypes,
        emotionalTone: analysisResult.emotionalTone,
        reflection: analysisResult.reflection,
        prompt: analysisResult.prompt,
        closing: analysisResult.closing,
        transformationScore: analysisResult.transformationScore
      };

      // 📊 Track symbolic analysis
      maiaRealtimeMonitor.trackSymbolicAnalysis({
        sessionId,
        userId: requestUserId,
        timestamp: new Date(),
        symbolsDetected: journalingResponse.symbols || [],
        archetypesDetected: journalingResponse.archetypes || [],
        emotionalTone: journalingResponse.emotionalTone || 'neutral',
        patternQuality: (journalingResponse.transformationScore || 5) / 10,
        crossSessionLinks: recentSymbols.filter(s =>
          journalingResponse.symbols?.includes(s)
        )
      });

      // 📊 Track memory and pattern recognition
      if (requestUserId !== 'demo-user') {
        maiaMonitoring.trackMemoryRecall(requestUserId, {
          themes: [mode],
          symbols: recentSymbols,
          goals: []
        });

        if (journalingResponse.archetypes && journalingResponse.archetypes.length > 0) {
          maiaMonitoring.trackArchetypeDetection(
            requestUserId,
            journalingResponse.archetypes[0],
            mode === 'shadow'
          );
        }

        // Track breakthrough moments (high transformation score)
        if (journalingResponse.transformationScore && journalingResponse.transformationScore >= 8) {
          maiaMonitoring.trackBreakthrough(
            requestUserId,
            `High transformation in ${mode} journaling`,
            `Symbols: ${journalingResponse.symbols?.join(', ')}`
          );
        }
      }

      if (userId) {
        try {
          await JournalSoulprintIntegration.updateSoulprintFromJournal(
            userId,
            mode as JournalingMode,
            journalingResponse
          );

          await mem0.appendMemory(userId, {
            type: 'symbol',
            content: entry,
            metadata: {
              symbol: journalingResponse.symbols[0],
              archetype: journalingResponse.archetypes[0],
              emotion: journalingResponse.emotionalTone,
              intensity: analysis.sentiment.intensity,
              context: mode
            },
            source: 'journal'
          });

          const journalEntry = {
            id: `journal_${Date.now()}`,
            userId,
            mode: mode as JournalingMode,
            entry,
            reflection: journalingResponse,
            timestamp: new Date().toISOString()
          };

          await soulIndex.indexJournalEntry(journalEntry as any);

        } catch (integrationError) {
          console.error('Integration update failed (non-critical):', integrationError);
        }
      }

      try {
        const stream = await AfferentStreamGenerator.generateFromJournalEntry(
          requestUserId,
          sessionId,
          mode as JournalingMode,
          entry,
          journalingResponse
        );

        console.log('Generated afferent stream for AIN field:', {
          consciousness: stream.consciousnessLevel,
          evolution: stream.evolutionVelocity,
          integration: stream.integrationDepth
        });

        // 📊 Track field intelligence
        maiaMonitoring.trackFieldIntelligence(requestUserId, {
          interventionType: 'journal_analysis',
          fieldResonance: stream.integrationDepth,
          emergenceSource: 'symbolic_literacy',
          sacredThreshold: stream.consciousnessLevel
        });
      } catch (ainError) {
        console.error('Failed to generate AIN stream (non-critical):', ainError);
      }

      // 📊 Track API health
      maiaMonitoring.trackApiHealth(requestUserId, {
        responseTimeMs: Date.now() - startTime,
        contextPayloadComplete: true,
        memoryInjectionSuccess: recentSymbols.length > 0,
        claudePromptQuality: 'excellent'
      });

      // 📊 End monitoring session
      maiaRealtimeMonitor.endSession(sessionId);

      return NextResponse.json({
        success: true,
        mode,
        entry,
        reflection: journalingResponse,
        sentiment: analysis.sentiment,
        maiaTone: analysis.maiaTone,
        timestamp: new Date().toISOString()
      });

    } catch (apiError) {
      console.error('AI API error:', apiError);

      // 📊 Track API failure
      const requestUserId = userId || 'demo-user';
      maiaMonitoring.trackApiHealth(requestUserId, {
        responseTimeMs: Date.now() - startTime,
        contextPayloadComplete: false,
        memoryInjectionSuccess: false,
        claudePromptQuality: 'poor'
      });

      const fallbackResponse: JournalingResponse = {
        symbols: ['threshold', 'mirror'],
        archetypes: ['Seeker'],
        emotionalTone: 'reflective',
        reflection: "I hear the depth in what you've shared. There's something important here that's asking to be seen.",
        prompt: "What part of this feels most alive for you right now?",
        closing: "Thank you for trusting this space with your words. I'm here with you."
      };

      // 📊 Track fallback symbolic analysis
      maiaRealtimeMonitor.trackSymbolicAnalysis({
        sessionId,
        userId: requestUserId,
        timestamp: new Date(),
        symbolsDetected: fallbackResponse.symbols || [],
        archetypesDetected: fallbackResponse.archetypes || [],
        emotionalTone: 'reflective',
        patternQuality: 0.3, // Lower quality for fallback
        crossSessionLinks: []
      });

      maiaRealtimeMonitor.endSession(sessionId);

      return NextResponse.json({
        success: true,
        mode,
        entry,
        reflection: fallbackResponse,
        timestamp: new Date().toISOString(),
        fallback: true
      });
    }

  } catch (error) {
    console.error('Journal analysis error:', error);

    // 📊 End session on error
    maiaRealtimeMonitor.endSession(sessionId);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}