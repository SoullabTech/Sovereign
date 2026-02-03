export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
=======

export const revalidate = false;
import { personalOracleAgent } from '../../_backend/src/agents/PersonalOracleAgent';
import { EnhancedMemoryRetrieval } from '../../_backend/src/services/memory/EnhancedMemoryRetrieval';
import { MemoryStore } from '../../_backend/src/services/memory/MemoryStore';
import { LlamaService } from '../../_backend/src/services/memory/LlamaService';
import { logger } from '../../_backend/src/utils/logger';

// Skip during static export (Capacitor builds)
>>>>>>> ecstatic-brown

/**
 * Oracle Memory Stats API - Temporarily unavailable
 * Memory services are being migrated from legacy backend
 */

export async function GET(request: NextRequest) {
<<<<<<< HEAD
  return NextResponse.json(
    { ok: false, error: 'Memory stats temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
=======
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
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
>>>>>>> ecstatic-brown
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Memory service temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}
