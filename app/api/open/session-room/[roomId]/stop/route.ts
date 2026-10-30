import { createRoomRuntimeService, createStopHandlers } from '@/lib/encounters/roomRuntime';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const handlers = createStopHandlers(createRoomRuntimeService());
export const POST = handlers.POST;
export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
