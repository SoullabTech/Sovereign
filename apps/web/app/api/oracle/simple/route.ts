import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { memoryStore } from "@/backend/src/services/memory/MemoryStore";
// Temporarily stub out backend imports that are excluded from build
// import { llamaService } from "@/backend/src/services/memory/LlamaService";
import path from "path";


// Stub memory store
const memoryStore = {
  isInitialized: false,
  init: async (dbPath: string) => {},
  getMemories: async (userId: string, limit: number) => [],
  getJournalEntries: async (userId: string, limit: number) => [],
  getUploads: async (userId: string, limit: number) => [],
  getVoiceNotes: async (userId: string, limit: number) => [],
  getVoiceNote: async (id: string) => null,
  saveVoiceNote: async (data: any) => ({ id: Date.now().toString(), ...data }),
  createMemory: async (data: any) => ({ id: Date.now().toString(), ...data })
};

// Stub llama service
const llamaService = {
  isInitialized: false,
  init: async () => {},
  process: async (text: string) => ({ processed: text }),
  processVoice: async (audio: any) => ({ transcript: 'Voice processing not available in beta' })
};
// Simple Oracle chat without DI complexity for Soullab beta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message } = body;
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // For now, skip memory initialization due to sqlite3 issues in Next.js
    // In production, this would use a proper database or edge-compatible solution
    let memoryContext = "";

    // Simple Maya Oracle response for beta testing
    const responses = [
      "I hear you. What feels most important to explore right now?",
      "That sounds significant. How does this connect to what you've been journaling about?",
      "There's wisdom in what you're sharing. What would feel most supportive?",
      "I'm here with you. What would you like to understand more deeply?",
      "Thank you for trusting me with this. What feels alive in you right now?",
      "I sense there's more here. What wants to emerge?",
    ];

    // Simple response selection based on message content
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    // Add some contextual awareness
    if (message.toLowerCase().includes('journal')) {
      response = "I see you've been journaling. That's a powerful practice. What themes are emerging for you?";
    } else if (message.toLowerCase().includes('file') || message.toLowerCase().includes('upload')) {
      response = "Thank you for sharing that with me. How does this material relate to your current journey?";
    } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('stuck')) {
      response = "I'm here to support you. Sometimes when we feel stuck, it's an invitation to pause and listen deeper. What's wanting your attention?";
    }

    // If we have memory context, enhance the response
    if (memoryContext) {
      response = response + "\n\nI remember from our previous conversations and your shared content that this connects to your journey.";
    }

    // In production, this would store interactions in the memory system
    // For now, we'll just log them

    return NextResponse.json({
      text: response,
      meta: {
        oracleStage: 'structured_guide',
        relationshipMetrics: {
          trustLevel: 0.3,
          sessionCount: 1
        }
      }
    });
    
  } catch (error) {
    console.error('Oracle chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}