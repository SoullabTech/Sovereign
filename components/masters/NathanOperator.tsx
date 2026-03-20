'use client';

import { useState } from 'react';
import type { MasterField } from '@/lib/masters/types';
import {
  PLATFORM_BUILDS,
  ROADMAP,
  OPEN_DECISIONS,
  RECENT_INNOVATIONS,
  type BuildStatus,
} from '@/lib/masters/nathan-platform';

interface NathanOperatorProps {
  master: MasterField;
}

type Tab = 'builds' | 'roadmap' | 'decisions' | 'innovations';

const STATUS_LABELS: Record<BuildStatus, string> = {
  live: 'Live',
  'in-progress': 'In Progress',
  planned: 'Planned',
  blocked: 'Blocked',
};

const STATUS_COLORS: Record<BuildStatus, string> = {
  live: '#6FCF97',
  'in-progress': '#F2C94C',
  planned: '#828282',
  blocked: '#EB5757',
};

const HORIZON_LABELS = {
  now: 'Now',
  next: 'Next',
  later: 'Later',
};

export default function NathanOperator({ master }: NathanOperatorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('builds');

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'builds', label: 'Builds', count: PLATFORM_BUILDS.length },
    { id: 'roadmap', label: 'Roadmap', count: ROADMAP.length },
    { id: 'decisions', label: 'Open Decisions', count: OPEN_DECISIONS.length },
    { id: 'innovations', label: 'Innovations', count: RECENT_INNOVATIONS.length },
  ];

  const liveCount = PLATFORM_BUILDS.filter((b) => b.status === 'live').length;
  const inProgressCount = PLATFORM_BUILDS.filter((b) => b.status === 'in-progress').length;

  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{
        backgroundColor: master.palette.background,
        color: master.palette.text,
        fontFamily: 'var(--field-font-body)',
      }}
    >
      <div className="max-w-4xl mx-auto">

        {/* Soullab Branding Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/holoflower-amber.png"
              alt="Soullab"
              className="w-8 h-8 object-contain opacity-80"
            />
            <span
              className="text-xs tracking-widest uppercase opacity-50"
              style={{ color: master.palette.primary, letterSpacing: '0.2em' }}
            >
              Soullab
            </span>
          </div>
          <a
            href={`/fields/${master.slug}`}
            className="text-xs opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: master.palette.text }}
          >
            {master.shortName}&apos;s Field
          </a>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl font-light mb-3"
            style={{ fontFamily: 'var(--field-font-display)', color: master.palette.text }}
          >
            Platform View
          </h1>
          <p className="text-base opacity-60 max-w-xl leading-relaxed">
            Current build state, roadmap, open architectural decisions, and recent innovations.
            This is what is actually happening inside Soullab.
          </p>
        </div>

        {/* Status Bar */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 p-4 rounded-lg"
          style={{ backgroundColor: `${master.palette.text}06`, border: `1px solid ${master.palette.text}12` }}
        >
          <div className="text-center">
            <div className="text-2xl font-light" style={{ color: STATUS_COLORS.live }}>
              {liveCount}
            </div>
            <div className="text-xs opacity-50 mt-1">Live</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light" style={{ color: STATUS_COLORS['in-progress'] }}>
              {inProgressCount}
            </div>
            <div className="text-xs opacity-50 mt-1">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light" style={{ color: STATUS_COLORS.planned }}>
              {ROADMAP.filter((r) => r.status === 'planned').length}
            </div>
            <div className="text-xs opacity-50 mt-1">Planned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light" style={{ color: master.palette.primary }}>
              {OPEN_DECISIONS.length}
            </div>
            <div className="text-xs opacity-50 mt-1">Open Decisions</div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-lg"
          style={{ backgroundColor: `${master.palette.text}08` }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 px-3 rounded text-sm transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? master.palette.primary : 'transparent',
                color: activeTab === tab.id ? master.palette.background : master.palette.text,
                opacity: activeTab === tab.id ? 1 : 0.6,
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 opacity-60 text-xs">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* BUILDS TAB */}
        {activeTab === 'builds' && (
          <div className="space-y-3">
            {(['live', 'in-progress', 'planned', 'blocked'] as BuildStatus[]).map((status) => {
              const items = PLATFORM_BUILDS.filter((b) => b.status === status);
              if (!items.length) return null;
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[status] }}
                    />
                    <span className="text-xs font-medium tracking-widest uppercase opacity-50">
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  <div className="space-y-2 ml-4">
                    {items.map((build) => (
                      <div
                        key={build.id}
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: `${master.palette.text}06`,
                          border: `1px solid ${master.palette.text}10`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h3 className="text-sm font-medium">{build.name}</h3>
                          <span
                            className="text-xs px-2 py-0.5 rounded shrink-0"
                            style={{
                              backgroundColor: `${STATUS_COLORS[build.status]}18`,
                              color: STATUS_COLORS[build.status],
                            }}
                          >
                            {build.category}
                          </span>
                        </div>
                        <p className="text-sm opacity-55 leading-relaxed">{build.description}</p>
                        {build.shippedAt && (
                          <p className="text-xs opacity-30 mt-2">Shipped {build.shippedAt}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {(['now', 'next', 'later'] as const).map((horizon) => {
              const items = ROADMAP.filter((r) => r.horizon === horizon);
              if (!items.length) return null;
              return (
                <div key={horizon}>
                  <div className="text-xs font-medium tracking-widest uppercase opacity-40 mb-3">
                    {HORIZON_LABELS[horizon]}
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: `${master.palette.text}06`,
                          border: `1px solid ${master.palette.text}10`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <span
                            className="text-xs px-2 py-0.5 rounded shrink-0"
                            style={{
                              backgroundColor: `${STATUS_COLORS[item.status]}18`,
                              color: STATUS_COLORS[item.status],
                            }}
                          >
                            {STATUS_LABELS[item.status]}
                          </span>
                        </div>
                        <p className="text-sm opacity-55 leading-relaxed mb-2">
                          {item.description}
                        </p>
                        <div
                          className="text-xs opacity-50 pl-3 leading-relaxed"
                          style={{ borderLeft: `2px solid ${master.palette.primary}40` }}
                        >
                          Why: {item.why}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* OPEN DECISIONS TAB */}
        {activeTab === 'decisions' && (
          <div className="space-y-4">
            <p className="text-sm opacity-50 mb-4 leading-relaxed">
              These are real structural questions with no settled answer yet.
              Each one has options on the table. Where they land will shape the next 12 months.
            </p>
            {OPEN_DECISIONS.map((decision) => (
              <div
                key={decision.id}
                className="p-5 rounded-lg"
                style={{
                  backgroundColor: `${master.palette.text}06`,
                  border: `1px solid ${master.palette.primary}25`,
                }}
              >
                <h3 className="text-sm font-medium mb-3" style={{ color: master.palette.text }}>
                  {decision.question}
                </h3>
                <p className="text-sm opacity-55 leading-relaxed mb-3">{decision.context}</p>
                <div
                  className="text-xs opacity-50 pl-3 leading-relaxed mb-4"
                  style={{ borderLeft: `2px solid #EB575760` }}
                >
                  Constraint: {decision.constraint}
                </div>
                <div className="space-y-1">
                  {decision.options.map((opt, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm opacity-60">
                      <span style={{ color: master.palette.primary }} className="shrink-0 mt-0.5">
                        →
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
                {decision.blocking && (
                  <div className="mt-3 text-xs opacity-40">
                    Blocking: {decision.blocking}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* INNOVATIONS TAB */}
        {activeTab === 'innovations' && (
          <div className="space-y-3">
            {RECENT_INNOVATIONS.map((innovation) => (
              <div
                key={innovation.id}
                className="p-5 rounded-lg"
                style={{
                  backgroundColor: `${master.palette.text}06`,
                  border: `1px solid ${master.palette.text}10`,
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-sm font-medium">{innovation.name}</h3>
                  <span className="text-xs opacity-30 shrink-0">{innovation.shippedAt}</span>
                </div>
                <p className="text-sm opacity-55 leading-relaxed mb-3">
                  {innovation.description}
                </p>
                <div
                  className="text-xs opacity-60 pl-3 leading-relaxed"
                  style={{ borderLeft: `2px solid ${master.palette.primary}50` }}
                >
                  Why it matters: {innovation.significance}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer nav */}
        <div
          className="mt-12 pt-8 flex gap-6 text-sm opacity-40 border-t"
          style={{ borderColor: `${master.palette.text}15` }}
        >
          <a href={`/fields/${master.slug}/studio`} className="hover:opacity-70 transition-opacity">
            Studio
          </a>
          <a href={`/fields/${master.slug}/systems`} className="hover:opacity-70 transition-opacity">
            Systems Layer
          </a>
          <a href={`/fields/${master.slug}`} className="hover:opacity-70 transition-opacity">
            Field Home
          </a>
        </div>
      </div>
    </div>
  );
}
