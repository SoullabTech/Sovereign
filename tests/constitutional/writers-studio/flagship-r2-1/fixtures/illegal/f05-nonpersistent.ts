import { type R21ThreadPolicy } from '@r2-1/contract';
const illegal: R21ThreadPolicy = { persistentThread: false, custodyShape: 'TRANSIENT', historyPolicy: 'NONE', priorTurnCount: 0, providerHistory: [], continuationAuthorized: false };
void illegal;
