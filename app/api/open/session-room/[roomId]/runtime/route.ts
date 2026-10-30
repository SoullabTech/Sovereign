import { createRoomRuntimeService, createRuntimeHandlers } from '@/lib/encounters/roomRuntime';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = createRuntimeHandlers(createRoomRuntimeService()).POST;
