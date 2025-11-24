import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Temporarily stub out backend imports that are excluded from build
// import { memoryStore } from "../../../../backend/src/services/memory/MemoryStore";
// import { llamaService } from "../../../../backend/src/services/memory/LlamaService";
// import { logger } from "../../../../backend/src/utils/logger";
import path from "path";

// Stub logger
const logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, data?: any) => console.error(message, data),
  warn: (message: string, data?: any) => console.warn(message, data)
};

// Stub memory store
const memoryStore = {
  isInitialized: false,
  init: async (dbPath: string) => {},
  getJournalEntries: async (userId: string, limit: number) => [],
  getUploads: async (userId: string, limit: number) => [],
  getVoiceNotes: async (userId: string, limit: number) => []
};

// Stub llama service
const llamaService = {
  isInitialized: false,
  init: async () => {}
};

// Simple archetype detection service
class ArchetypeService {
  async analyzeText(text: string): Promise<{ archetype: string; confidence: number; symbol: string }[]> {
    if (!text || text.trim().length < 10) return [];
    
    const textLower = text.toLowerCase();
    const results: { archetype: string; confidence: number; symbol: string }[] = [];
    
    // Hero patterns
    if (textLower.match(/\b(challenge|overcome|fight|courage|brave|strong|victory|quest|journey|battle)\b/g)) {
      const matches = textLower.match(/\b(challenge|overcome|fight|courage|brave|strong|victory|quest|journey|battle)\b/g)?.length || 0;
      results.push({ archetype: 'Hero', confidence: Math.min(matches * 0.2, 1), symbol: '⚔️' });
    }
    
    // Sage patterns  
    if (textLower.match(/\b(learn|understand|wisdom|knowledge|realize|discover|insight|truth|study|teach)\b/g)) {
      const matches = textLower.match(/\b(learn|understand|wisdom|knowledge|realize|discover|insight|truth|study|teach)\b/g)?.length || 0;
      results.push({ archetype: 'Sage', confidence: Math.min(matches * 0.2, 1), symbol: '🧙‍♀️' });
    }
    
    // Shadow patterns
    if (textLower.match(/\b(fear|avoid|dark|hidden|struggle|difficult|pain|resist|deny|shame)\b/g)) {
      const matches = textLower.match(/\b(fear|avoid|dark|hidden|struggle|difficult|pain|resist|deny|shame)\b/g)?.length || 0;
      results.push({ archetype: 'Shadow', confidence: Math.min(matches * 0.25, 1), symbol: '🕳️' });
    }
    
    // Lover patterns
    if (textLower.match(/\b(love|heart|relationship|connect|beauty|passion|intimate|care|feel|emotion)\b/g)) {
      const matches = textLower.match(/\b(love|heart|relationship|connect|beauty|passion|intimate|care|feel|emotion)\b/g)?.length || 0;
      results.push({ archetype: 'Lover', confidence: Math.min(matches * 0.2, 1), symbol: '❤️' });
    }
    
    // Seeker patterns
    if (textLower.match(/\b(search|find|explore|purpose|meaning|question|wonder|journey|path|seek)\b/g)) {
      const matches = textLower.match(/\b(search|find|explore|purpose|meaning|question|wonder|journey|path|seek)\b/g)?.length || 0;
      results.push({ archetype: 'Seeker', confidence: Math.min(matches * 0.2, 1), symbol: '🧭' });
    }
    
    // Creator patterns
    if (textLower.match(/\b(create|build|make|design|art|express|imagine|innovate|craft|write)\b/g)) {
      const matches = textLower.match(/\b(create|build|make|design|art|express|imagine|innovate|craft|write)\b/g)?.length || 0;
      results.push({ archetype: 'Creator', confidence: Math.min(matches * 0.2, 1), symbol: '🎨' });
    }
    
    // Return top 2 archetypes with confidence > 0.1
    return results
      .filter(r => r.confidence > 0.1)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);
  }
}

const archetypeService = new ArchetypeService();

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const filter = req.nextUrl.searchParams.get("type") || "all"; // "journal" | "upload" | "voice" | "all"
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    
    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required" 
      }, { status: 400 });
    }

    // Initialize memory services
    const dbPath = process.env.MEMORY_DB_PATH || path.join(process.cwd(), 'data', 'soullab.sqlite');
    if (!memoryStore.isInitialized) {
      await memoryStore.init(dbPath);
    }
    if (!llamaService.isInitialized) {
      await llamaService.init();
    }

    // Pull memories by type
    const memories: any[] = [];
    
    if (filter === "all" || filter === "journal") {
      const journals = await memoryStore.getJournalEntries(userId, limit);
      memories.push(...journals.map((j: any) => ({
        id: `journal_${j.id}`,
        type: 'journal',
        title: j.title,
        content: j.content,
        preview: j.content?.slice(0, 200),
        metadata: {
          mood: j.mood,
          tags: j.tags?.split(',').filter(Boolean) || []
        },
        createdAt: j.created_at
      })));
    }
    
    if (filter === "all" || filter === "upload") {
      const uploads = await memoryStore.getUploads(userId, limit);
      memories.push(...uploads.map((u: any) => ({
        id: `upload_${u.id}`,
        type: 'upload',
        title: u.filename,
        content: u.extracted_content,
        preview: u.summary || u.extracted_content?.slice(0, 200),
        metadata: {
          filename: u.filename,
          fileType: u.file_type,
          ...JSON.parse(u.metadata || '{}')
        },
        createdAt: u.created_at
      })));
    }
    
    if (filter === "all" || filter === "voice") {
      const voiceNotes = await memoryStore.getVoiceNotes(userId, limit);
      memories.push(...voiceNotes.map((v: any) => ({
        id: `voice_${v.id}`,
        type: 'voice',
        title: `Voice Note (${Math.ceil((v.duration_seconds || 0) / 60)}min)`,
        content: v.transcript,
        preview: v.transcript?.slice(0, 200),
        metadata: {
          duration: v.duration_seconds,
          audioUrl: v.audio_path ? `/api/voice/audio/${v.id}` : null
        },
        createdAt: v.created_at
      })));
    }

    // Sort by creation time (newest first)
    memories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Enrich with archetypal insights and emotional analysis
    const enrichedMemories = await Promise.all(
      memories.map(async (memory) => {
        try {
          if (memory.type === "journal" || memory.type === "voice") {
            const textToAnalyze = memory.content || '';
            if (textToAnalyze.trim()) {
              // Analyze archetypes
              const insights = await archetypeService.analyzeText(textToAnalyze);
              
              // Analyze emotions
              const emotionResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/emotion/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: textToAnalyze,
                  userId: userId
                })
              });
              
              let emotion = null;
              if (emotionResponse.ok) {
                const emotionData = await emotionResponse.json();
                if (emotionData.success && emotionData.text) {
                  emotion = {
                    valence: emotionData.text.valence,
                    arousal: emotionData.text.arousal,
                    dominance: emotionData.text.dominance,
                    energySignature: emotionData.text.energySignature,
                    primaryEmotion: emotionData.text.emotions[0] || null
                  };
                }
              }
              
              return { ...memory, insights, emotion };
            }
          }
        } catch (err) {
          logger.warn(`Failed to analyze memory ${memory.id}:`, err);
        }
        
        return { ...memory, insights: [], emotion: null };
      })
    );

    logger.info("Unified memory fetch completed", {
      userId: userId.substring(0, 8) + '...',
      filter,
      totalMemories: enrichedMemories.length,
      withInsights: enrichedMemories.filter(m => m.insights?.length > 0).length
    });

    return NextResponse.json({
      success: true,
      memories: enrichedMemories,
      totalCount: enrichedMemories.length,
      filter
    });
  } catch (err: any) {
    logger.error("Unified memory fetch error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}