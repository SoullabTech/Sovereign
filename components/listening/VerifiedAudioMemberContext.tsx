'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

/**
 * Minimum browser-web identity receipt shared by audio-owning member rooms.
 *
 * The value is produced only by AuthenticatedListeningBoundary after the
 * existing /api/members/session endpoint validates a current server session.
 * It is lifecycle authority (mount, member-change, revoke), never a request
 * header, persistence key, analytics field, or substitute for route auth.
 */
const VerifiedAudioMemberContext = createContext<string | null>(null);

export function VerifiedAudioMemberProvider({
  memberKey,
  children,
}: {
  memberKey: string | null;
  children: ReactNode;
}) {
  return (
    <VerifiedAudioMemberContext.Provider value={memberKey}>
      {children}
    </VerifiedAudioMemberContext.Provider>
  );
}

export function useVerifiedAudioMemberKey(): string | null {
  return useContext(VerifiedAudioMemberContext);
}
