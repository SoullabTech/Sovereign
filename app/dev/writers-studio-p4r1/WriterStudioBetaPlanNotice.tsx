'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import './writerBetaPlan.css';

type BetaPlanReply = {
  plan?: string;
  pilotEligible?: boolean;
  complimentary?: boolean;
  paymentEnabled?: boolean;
};

/**
 * An informative badge, never an access gate. Pilot inclusion is resolved on
 * the server, not from beta=1, a client account label, or a paid-tier guess.
 * It is absent while loading, signed out, rejected or offline.
 */
export default function WriterStudioBetaPlanNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let current = true;
    void apiFetch('/api/sovereign/writers-studio/plan', { method: 'GET' })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<BetaPlanReply>;
      })
      .then((body) => {
        if (current) setShow(
          body?.plan === 'pro' &&
          body?.pilotEligible === true &&
          body?.complimentary === true &&
          body?.paymentEnabled === false
        );
      })
      .catch(() => { if (current) setShow(false); });
    return () => { current = false; };
  }, []);

  if (!show) return null;
  return (
    <aside className="ws-beta-pro-notice" aria-label="Writer’s Studio beta plan">
      <details>
        <summary>Studio Pro · Beta</summary>
        <div className="ws-beta-pro-notice-body">
          <strong>Your beta Studio access is complimentary.</strong>
          <p>You can explore every currently approved Pro room, including Develop, Write and Review. Your writing always remains yours.</p>
          <p>Features still awaiting independent security or source-custody approval remain held for everyone.</p>
        </div>
      </details>
    </aside>
  );
}
