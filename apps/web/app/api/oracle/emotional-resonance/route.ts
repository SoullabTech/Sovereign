import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { Memory, EmotionalState, EmotionalTrend } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { content, userId, source = 'text' } = await request.json();
    
    if (!content || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing content or userId' 
      }, { status: 400 });
    }

    // Analyze emotional dimensions using simple heuristics
    const emotionalState = analyzeEmotionalDimensions(content);
    
    // Store in memory system (simplified implementation)
    const resonanceData: EmotionalState = {
      ...emotionalState,
      timestamp: new Date().toISOString(),
      source,
      content_preview: content.slice(0, 100)
    };

    return NextResponse.json({
      success: true,
      emotional_state: resonanceData,
      summary: generateEmotionalSummary(emotionalState)
    });

  } catch (error) {
    console.error('Emotional resonance analysis error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze emotional resonance' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeframe = searchParams.get('timeframe') || 'week';
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing userId' 
      }, { status: 400 });
    }

    // Get memories with emotional data from our unified API
    const memoryResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/memory/list?userId=${userId}&type=all&limit=100`);
    const memoryData = await memoryResponse.json();
    
    if (!memoryData.success || !memoryData.memories) {
      return NextResponse.json({
        success: true,
        trends: [],
        current_state: null,
        message: "No memories found"
      });
    }

    const memories: Memory[] = memoryData.memories.filter((m: any) => m.emotion);
    
    if (memories.length === 0) {
      // Fallback to demo data if no emotional memories exist
      const trends = generateEmotionalTrends(timeframe as 'day' | 'week' | 'month');
      return NextResponse.json({
        success: true,
        trends,
        current_state: {
          valence: 0.3,
          arousal: 0.6,
          dominance: 0.7,
          insight: "Your emotional resonance shows balanced energy. Start journaling to track deeper patterns."
        }
      });
    }

    // Group by day and calculate real trends
    const dailyGroups: { [key: string]: Memory[] } = {};
    memories.forEach((memory: Memory) => {
      const date = new Date(memory.created_at).toISOString().split('T')[0];
      if (!dailyGroups[date]) dailyGroups[date] = [];
      dailyGroups[date].push(memory);
    });

    const trends = Object.entries(dailyGroups).map(([date, dayMemories]) => ({
      date,
      avg_valence: dayMemories.reduce((sum: number, m: Memory) => sum + (m.emotion?.valence || 0), 0) / dayMemories.length,
      avg_arousal: dayMemories.reduce((sum: number, m: Memory) => sum + (m.emotion?.arousal || 0), 0) / dayMemories.length,
      avg_dominance: dayMemories.reduce((sum: number, m: Memory) => sum + (m.emotion?.dominance || 0), 0) / dayMemories.length,
      entry_count: dayMemories.length
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate current state from recent memories
    const recentMemories = memories.slice(0, 10);
    const currentValence = recentMemories.reduce((sum: number, m: Memory) => sum + (m.emotion?.valence || 0), 0) / recentMemories.length;
    const currentArousal = recentMemories.reduce((sum: number, m: Memory) => sum + (m.emotion?.arousal || 0), 0) / recentMemories.length;
    const currentDominance = recentMemories.reduce((sum: number, m: Memory) => sum + (m.emotion?.dominance || 0), 0) / recentMemories.length;

    const insight = generateRealEmotionalInsight(currentValence, currentArousal, currentDominance, recentMemories);
    
    return NextResponse.json({
      success: true,
      trends,
      current_state: {
        valence: currentValence,
        arousal: currentArousal,
        dominance: currentDominance,
        insight
      }
    });

  } catch (error) {
    console.error('Error fetching emotional trends:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch emotional trends' 
    }, { status: 500 });
  }
}

function analyzeEmotionalDimensions(content: string): Omit<EmotionalState, 'timestamp' | 'source' | 'content_preview'> {
  const text = content.toLowerCase();
  
  // Valence analysis (positive/negative sentiment)
  const positiveWords = ['happy', 'joy', 'love', 'grateful', 'amazing', 'wonderful', 'excited', 'peaceful', 'calm', 'hope'];
  const negativeWords = ['sad', 'angry', 'frustrated', 'difficult', 'challenging', 'worried', 'stressed', 'fear', 'pain', 'loss'];
  
  let valenceScore = 0;
  positiveWords.forEach(word => {
    if (text.includes(word)) valenceScore += 0.2;
  });
  negativeWords.forEach(word => {
    if (text.includes(word)) valenceScore -= 0.2;
  });
  
  // Arousal analysis (energy level)
  const highArousalWords = ['excited', 'energetic', 'passionate', 'intense', 'overwhelming', 'rushing', 'urgent', 'powerful'];
  const lowArousalWords = ['calm', 'peaceful', 'quiet', 'still', 'gentle', 'slow', 'relaxed', 'serene'];
  
  let arousalScore = 0.5; // Default neutral
  highArousalWords.forEach(word => {
    if (text.includes(word)) arousalScore += 0.15;
  });
  lowArousalWords.forEach(word => {
    if (text.includes(word)) arousalScore -= 0.15;
  });
  
  // Dominance analysis (control/agency)
  const dominantWords = ['control', 'decide', 'choose', 'lead', 'strong', 'confident', 'determined', 'will'];
  const submissiveWords = ['helpless', 'overwhelmed', 'confused', 'lost', 'uncertain', 'weak', 'dependent'];
  
  let dominanceScore = 0.5; // Default neutral
  dominantWords.forEach(word => {
    if (text.includes(word)) dominanceScore += 0.15;
  });
  submissiveWords.forEach(word => {
    if (text.includes(word)) dominanceScore -= 0.15;
  });
  
  return {
    valence: Math.max(-1, Math.min(1, valenceScore)),
    arousal: Math.max(0, Math.min(1, arousalScore)),
    dominance: Math.max(0, Math.min(1, dominanceScore))
  };
}

function generateEmotionalSummary(emotional: Omit<EmotionalState, 'timestamp' | 'source' | 'content_preview'>): string {
  const { valence, arousal, dominance } = emotional;
  
  let summary = "";
  
  // Valence interpretation
  if (valence > 0.3) {
    summary += "positive energy, ";
  } else if (valence < -0.3) {
    summary += "processing challenges, ";
  } else {
    summary += "emotional balance, ";
  }
  
  // Arousal interpretation
  if (arousal > 0.7) {
    summary += "high vitality, ";
  } else if (arousal < 0.3) {
    summary += "calm presence, ";
  } else {
    summary += "steady energy, ";
  }
  
  // Dominance interpretation
  if (dominance > 0.7) {
    summary += "strong agency";
  } else if (dominance < 0.3) {
    summary += "seeking guidance";
  } else {
    summary += "balanced empowerment";
  }
  
  return summary.charAt(0).toUpperCase() + summary.slice(1);
}

function generateEmotionalTrends(timeframe: 'day' | 'week' | 'month'): EmotionalTrend[] {
  const now = new Date();
  const trends: EmotionalTrend[] = [];
  
  let days = 7;
  if (timeframe === 'day') days = 1;
  if (timeframe === 'month') days = 30;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic emotional progression
    const baseValence = 0.2 + (Math.sin(i * 0.3) * 0.3);
    const baseArousal = 0.5 + (Math.cos(i * 0.2) * 0.2);
    const baseDominance = 0.6 + (Math.sin(i * 0.1) * 0.2);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      avg_valence: Math.max(-1, Math.min(1, baseValence + (Math.random() - 0.5) * 0.2)),
      avg_arousal: Math.max(0, Math.min(1, baseArousal + (Math.random() - 0.5) * 0.2)),
      avg_dominance: Math.max(0, Math.min(1, baseDominance + (Math.random() - 0.5) * 0.2)),
      entry_count: Math.floor(Math.random() * 5) + 1
    });
  }
  
  return trends;
}

function generateRealEmotionalInsight(valence: number, arousal: number, dominance: number, recentMemories: Memory[]): string {
  // Extract common energy signatures from real memories
  const signatures = recentMemories.map(m => m.emotion?.energySignature).filter((sig): sig is string => Boolean(sig));
  const signatureCounts = signatures.reduce((acc: Record<string, number>, sig: string) => {
    acc[sig] = (acc[sig] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dominantSignature = Object.keys(signatureCounts).sort((a, b) => signatureCounts[b] - signatureCounts[a])[0];

  // Generate contextual insights based on actual patterns
  if (valence > 0.3 && arousal > 0.6 && dominance > 0.6) {
    return `I sense radiant empowerment flowing through your recent expressions. Your ${dominantSignature || 'vibrant'} energy suggests you&apos;re in a powerful creative and transformative phase.`;
  }
  
  if (valence > 0.2 && arousal < 0.4 && dominance > 0.5) {
    return `Your recent reflections carry a beautiful groundedness. This ${dominantSignature || 'calm'} presence speaks to deep inner stability and integrated wisdom.`;
  }
  
  if (valence < -0.2 && dominance < 0.4) {
    return `Your inner landscape shows authentic vulnerability and openness to growth. This ${dominantSignature || 'receptive'} space often precedes meaningful breakthroughs.`;
  }
  
  if (arousal > 0.7) {
    return `There&apos;s high activation and aliveness in your emotional field. Your ${dominantSignature || 'intense'} energy suggests important life processes are moving through you.`;
  }
  
  if (dominance > 0.7) {
    return `I feel strong personal agency and clarity emerging in your expressions. Your ${dominantSignature || 'empowered'} stance shows authentic self-leadership.`;
  }
  
  if (valence < -0.1 && arousal > 0.5) {
    return `You're processing challenges with remarkable aliveness. This ${dominantSignature || 'activated'} energy often leads to important growth and resilience.`;
  }
  
  return `Your emotional resonance shows ${dominantSignature || 'balanced'} energy patterns. There's a natural organic rhythm in your inner weather - trust your process.`;
}