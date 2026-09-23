import { type ResponseEnvelope } from '@r2-1/contract';
declare const base: Omit<ResponseEnvelope, 'durableEffect'>;
const illegal: ResponseEnvelope = { ...base, durableEffect: 'REVISE_READING' };
void illegal;
