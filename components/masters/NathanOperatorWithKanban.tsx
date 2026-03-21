'use client';

import { useState } from 'react';
import type { MasterField } from '@/lib/masters/types';
import NathanOperator from './NathanOperator';
import FieldKanban from './FieldKanban';
import DecisionLedger from './DecisionLedger';

interface Props {
  master: MasterField;
}

type View = 'platform' | 'board' | 'decisions';

export default function NathanOperatorWithKanban({ master }: Props) {
  const [view, setView] = useState<View>('board');

  const p = master.palette;

  return (
    <div
      style={{
        backgroundColor: p.background,
        minHeight: '100vh',
        color: p.text,
      }}
    >
      {/* View toggle bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: p.background,
          borderBottom: `1px solid ${p.text}12`,
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            height: '48px',
          }}
        >
          {([
            { id: 'board' as View, label: 'Project Board' },
            { id: 'platform' as View, label: 'Platform View' },
            { id: 'decisions' as View, label: 'Decisions' },
          ] as { id: View; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                color: view === tab.id ? p.background : p.text,
                backgroundColor: view === tab.id ? p.primary : 'transparent',
                opacity: view === tab.id ? 1 : 0.45,
                fontWeight: view === tab.id ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'board' && (
        <div style={{ padding: '32px 24px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 300,
                  color: p.text,
                  margin: '0 0 6px',
                  fontFamily: 'var(--field-font-display)',
                }}
              >
                Project Board
              </h1>
              <p style={{ fontSize: '14px', color: p.text, opacity: 0.5, margin: 0 }}>
                Shared kanban for Kelly and Nathan. Drag cards between columns or use the Move menu.
              </p>
            </div>
            <FieldKanban fieldSlug="nathan" palette={p} />
          </div>
        </div>
      )}

      {view === 'platform' && <NathanOperator master={master} />}

      {view === 'decisions' && (
        <div style={{ padding: '32px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <DecisionLedger fieldSlug="nathan" palette={p} />
          </div>
        </div>
      )}
    </div>
  );
}
