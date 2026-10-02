import { type AuthorizedAsReadObject } from '@r2-1/contract';
declare const base: Omit<AuthorizedAsReadObject, 'posture'>;
const illegal: AuthorizedAsReadObject = base;
void illegal;
