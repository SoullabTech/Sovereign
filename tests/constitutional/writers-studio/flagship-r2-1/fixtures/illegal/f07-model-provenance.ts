import { type ResponseEnvelope } from '@r2-1/contract';
declare const base: Omit<ResponseEnvelope, 'provenanceAuthority'>;
const illegal: ResponseEnvelope = { ...base, provenanceAuthority: 'MODEL' };
void illegal;
