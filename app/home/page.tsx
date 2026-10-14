import {HomeThreshold} from './HomeThreshold';
import {HomeAccountGate} from './HomeAccountGate';
import {getCurrentSession} from '@/lib/auth/serverSessions';

export const dynamic = 'force-dynamic';

/**
 * Home is always a neutral server document. A verified cookie identifies the
 * member to the server, but it cannot attest to browser-local account state.
 * Even /home?entry=... never server-renders a name, Work or other private data.
 */
export default async function HomePage() {
  const session=await getCurrentSession();
  if (!session) return <HomeThreshold />;
  return <HomeAccountGate destination="home" />;
}
