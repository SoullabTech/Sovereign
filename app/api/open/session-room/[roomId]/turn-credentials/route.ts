import { createRoomRuntimeService, createTurnHandlers } from '@/lib/encounters/roomRuntime';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = createTurnHandlers({ service: createRoomRuntimeService() }).GET;
