'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Holoflower } from '@/components/ui/Holoflower';
import styles from './maia-threshold.module.css';

interface MaiaThresholdLinkProps {
  variant?: 'mark' | 'invitation';
}

export function MaiaThresholdLink({ variant = 'mark' }: MaiaThresholdLinkProps = {}) {
  const router = useRouter();
  const [crossing, setCrossing] = useState(false);

  useEffect(() => {
    if (!crossing) return;
    const id = window.setTimeout(() => router.push('/maia/encounter?from=home'), 760);
    return () => window.clearTimeout(id);
  }, [crossing, router]);

  // A navigation invitation, not a microphone or an in-House composer.
  const enterMaia = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push('/maia/encounter?from=home');
      return;
    }
    setCrossing(true);
  };

  return (
    <>
      {variant === 'invitation' ? (
        <button type="button" className={styles.talkInvitation} onClick={enterMaia}
          disabled={crossing} aria-busy={crossing}
          aria-label="Open MAIA to speak or type" title="Opens your MAIA conversation">
          <span>Speak or type…</span>
          <svg className={styles.voiceMark} viewBox="0 0 28 28" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
            <path d="M4 11v6 M9 6v16 M14 2v24 M19 6v16 M24 11v6" />
          </svg>
        </button>
      ) : (
      <button type="button" className={styles.entry} onClick={enterMaia} aria-label="Enter MAIA">
        <Holoflower size="md" animate={false} glowIntensity="low" theme="dark" crisp />
        <span><strong>MAIA</strong><small>Enter encounter</small></span>
      </button>
      )}
      {crossing && <div className={styles.crossing} aria-hidden="true"><div className={styles.bloom}><Holoflower size="xxl" animate glowIntensity="medium" theme="dark" /></div></div>}
    </>
  );
}
