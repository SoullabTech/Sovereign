import { NextRequest, NextResponse } from 'next/server';
import { personalOracleAgent } from '../../../agents/PersonalOracleAgent';
import { EnhancedMemoryRetrieval } from '../../../services/memory/EnhancedMemoryRetrieval';
import { MemoryStore } from '../../../services/memory/MemoryStore';
import { LlamaService } from '../../../services/memory/LlamaService';
import { logger } from '../../../utils/logger';

/**
 * GET /api/oracle/memory/stats
 * Get user's memory statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Initialize services
    const memoryStore = new MemoryStore();
    const llamaService = new LlamaService();
    await memoryStore.init('./soullab.sqlite');
    await llamaService.init();
    
    const memoryRetrieval = new EnhancedMemoryRetrieval(llamaService, memoryStore);

    // Get memory statistics
    const stats = await memoryRetrieval.getMemoryStats(userId);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        ...stats,
        formattedOldest: stats.oldestMemory?.toLocaleDateString(),
        formattedNewest: stats.newestMemory?.toLocaleDateString()
      }
    });

  } catch (error) {
    logger.error('Failed to get memory statistics', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/oracle/memory/search
 * Search user's memories
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query, limit = 10 } = body;

    if (!userId || !query) {
      return NextResponse.json(
        { error: 'userId and query are required' },
        { status: 400 }
      );
    }

    // Initialize services
    const memoryStore = new MemoryStore();
    const llamaService = new LlamaService();
    await memoryStore.init('./soullab.sqlite');
    await llamaService.init();
    
    const memoryRetrieval = new EnhancedMemoryRetrieval(llamaService, memoryStore);

    // Search memories
    const memoryContext = await memoryRetrieval.retrieveMemoryContext(
      userId,
      query,
      limit
    );

    return NextResponse.json({
      success: true,
      data: {
        query,
        hasResults: memoryContext.hasRelevantMemories,
        memories: memoryContext.memories,
        formattedContext: memoryContext.formattedContext,
        totalFound: memoryContext.memories.length
      }
    });

  } catch (error) {
    logger.error('Failed to search memories', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}