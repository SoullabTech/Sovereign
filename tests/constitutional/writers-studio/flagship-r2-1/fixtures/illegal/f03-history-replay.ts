import { type R21ThreadPolicy } from '@r2-1/contract';
const illegal: R21ThreadPolicy = { persistentThread: true, custodyShape: 'SINGLE_ACT', historyPolicy: 'ALL', priorTurnCount: 2, providerHistory: ['prior'], continuationAuthorized: false };
void illegal;
