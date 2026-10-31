import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import type { RebuildEditorialThread } from './editorialCollaboration';

/**
 * Presentation-only stale-response refusal, NOT provider cancellation or
 * durable member authorization. No URL, account, Source or server authority is
 * derived from these client-observed values.
 */
export interface EditorialResponseTicket {
  readonly scope: string;
  readonly generation: number;
  readonly threadId: string;
  readonly workId: string;
  readonly sectionId: string;
}

export function mayPublishEditorialResponse(
  ticket: EditorialResponseTicket,
  current: {
    scope: string;
    generation: number;
    posture: CurrentPostureRead;
  },
  thread: Pick<RebuildEditorialThread, 'threadId' | 'workId' | 'targetSectionId'> | null,
): boolean {
  return Boolean(
    ticket.scope && ticket.workId && ticket.sectionId && ticket.threadId
    && Number.isSafeInteger(ticket.generation)
    && current.scope === ticket.scope
    && current.generation === ticket.generation
    && current.posture.resolved && !current.posture.sanctuary
    && thread?.threadId === ticket.threadId
    && thread?.workId === ticket.workId
    && thread?.targetSectionId === ticket.sectionId
  );
}
