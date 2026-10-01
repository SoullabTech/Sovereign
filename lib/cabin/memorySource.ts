import type { DevelopmentalMemorySnapshot } from '../maia/types/memoryOrchestrator';
import type { CabinLocalStore } from './localStore';

type PriorExchangeSnapshot = {
  session_id: string;
  role: 'user' | 'assistant';
  created_at: Date;
  content: string;
};

export type CabinMemoryLayerStatus = 'ok' | 'empty' | 'error';

export type CabinMemorySource = {
  recentTurns: ReturnType<CabinLocalStore['getRecentTurns']>;
  conversational: PriorExchangeSnapshot[];
  developmental: DevelopmentalMemorySnapshot[];
  health: {
    recentTurns: CabinMemoryLayerStatus;
    conversational: CabinMemoryLayerStatus;
    developmental: CabinMemoryLayerStatus;
  };
  localizedLayers: readonly [
    'recentTurns',
    'conversational',
    'developmental',
  ];
};

function statusForCount(count: number): CabinMemoryLayerStatus {
  return count > 0 ? 'ok' : 'empty';
}

export function readCabinMemorySource(
  store: CabinLocalStore,
  memberId: string,
  currentSessionId: string | null,
): CabinMemorySource {
  const recentTurns = store.getRecentTurns(memberId, 12);
  const priorTurns = store.getPriorCrossSessionTurns(
    memberId,
    currentSessionId,
    6,
  );
  const developmentalRows = store.listDevelopmentalMemories(memberId, 3);

  const conversational: PriorExchangeSnapshot[] = priorTurns.map((turn) => ({
    session_id: turn.sessionId ?? '',
    role: turn.role,
    created_at: new Date(turn.createdAt),
    content: turn.content,
  }));

  const developmental: DevelopmentalMemorySnapshot[] =
    developmentalRows.map((memory) => ({
      id: memory.id,
      memory_type: memory.memoryType,
      facet_code: memory.facetCode,
      significance: memory.significance,
      formed_at: new Date(memory.formedAt),
      directional_cue: memory.contentText,
    }));

  return {
    recentTurns,
    conversational,
    developmental,
    health: {
      recentTurns: statusForCount(recentTurns.length),
      conversational: statusForCount(conversational.length),
      developmental: statusForCount(developmental.length),
    },
    localizedLayers: [
      'recentTurns',
      'conversational',
      'developmental',
    ] as const,
  };
}
