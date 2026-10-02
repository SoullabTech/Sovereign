import { type R21ThreadPolicy } from '@r2-1/contract';
const illegal: R21ThreadPolicy = { persistentThread: true, custodyShape: 'SINGLE_ACT', historyPolicy: 'NONE', priorTurnCount: 0, providerHistory: [], continuationAuthorized: true };
void illegal;
