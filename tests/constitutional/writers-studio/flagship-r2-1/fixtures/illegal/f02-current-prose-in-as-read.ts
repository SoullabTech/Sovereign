import { type AuthorizedAsReadObject } from '@r2-1/contract';
declare const base: AuthorizedAsReadObject;
const illegal: AuthorizedAsReadObject = { ...base, now: { text: 'current' } };
void illegal;
