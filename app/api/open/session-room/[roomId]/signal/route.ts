import { createRoomRuntimeService, createSignalHandlers } from '@/lib/encounters/roomRuntime';
import { createSignalRelay } from '@/lib/webrtc/signalRelay';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const handlers = createSignalHandlers({ service: createRoomRuntimeService(), relay: createSignalRelay() });
export const GET = handlers.GET;
export const POST = handlers.POST;
