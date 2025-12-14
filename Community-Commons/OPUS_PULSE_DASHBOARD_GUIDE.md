# Opus Pulse Steward Dashboard Implementation Guide

**Date:** December 2025
**Status:** 📋 Specification Complete → Ready for Implementation
**Purpose:** Internal dashboard for stewards to monitor MAIA's ethical alignment via Opus Axioms

---

## Overview

The **Opus Pulse Dashboard** gives stewards visibility into:
- How often MAIA achieves Gold status
- Which axioms are getting stressed (warnings/violations)
- Recent rupture cases requiring review
- Trends over time (daily/weekly)

This is MAIA's **ethical nervous system made visible**.

---

## Architecture

### Data Flow
```
Conversation Exchanges (Supabase)
  → opusAxioms metadata per message
  → Aggregated by API endpoint
  → Displayed in Steward Dashboard
  → Stewards take action (adjust prompts, tune agents)
```

### Components

**1. Backend (Already Complete from Previous Work):**
- Opus Axioms Engine evaluates every MAIA response
- Stores evaluation in `conversationExchanges.metadata.opusAxioms`

**2. Data Types (✅ Created):**
- `/lib/types/opusPulse.ts` with all interfaces

**3. API Endpoint (🔜 To Create):**
- `/app/api/steward/opus-pulse/route.ts`
- Queries Supabase for Opus data
- Returns aggregated stats

**4. Dashboard Page (🔜 To Create):**
- `/app/steward/opus-pulse/page.tsx`
- Protected route (admin/steward only)
- Visual charts + tables

---

## Implementation Steps

### Step 1: Create API Endpoint

**File:** `/app/api/steward/opus-pulse/route.ts`

**Purpose:** Aggregate Opus Axioms data from conversation history

```typescript
// app/api/steward/opus-pulse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type {
  OpusPulseData,
  OpusPulseSummary,
  AxiomStats,
  RecentRupture,
  OPUS_AXIOMS,
} from '@/lib/types/opusPulse';

export async function GET(request: NextRequest) {
  try {
    // 1. Get query params
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || startDate;
    const ruptureLimit = parseInt(searchParams.get('ruptureLimit') || '10');

    // 2. Initialize Supabase client
    const supabase = createClient();

    // TODO: Add auth check - only allow stewards/admins
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || !isStewsard(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 3. Query conversation exchanges with Opus metadata
    const { data: exchanges, error } = await supabase
      .from('conversationExchanges')
      .select('id, createdAt, sessionId, userMessage, maiaMessage, metadata')
      .gte('createdAt', `${startDate}T00:00:00Z`)
      .lte('createdAt', `${endDate}T23:59:59Z`)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // 4. Aggregate data
    const summary: OpusPulseSummary = {
      date: startDate,
      totalResponses: 0,
      goldCount: 0,
      warningCount: 0,
      ruptureCount: 0,
      neutralCount: 0,
      goldPercent: 0,
      warningPercent: 0,
      rupturePercent: 0,
    };

    const axiomStatsMap = new Map<string, AxiomStats>();
    const recentRuptures: RecentRupture[] = [];

    // Initialize axiom stats for all 8 axioms
    OPUS_AXIOMS.forEach((axiom) => {
      axiomStatsMap.set(axiom.id, {
        axiomId: axiom.id,
        axiomName: axiom.name,
        totalEvaluations: 0,
        passCount: 0,
        warningCount: 0,
        violationCount: 0,
        passRate: 0,
      });
    });

    // Process each exchange
    exchanges?.forEach((exchange) => {
      const opusAxioms = exchange.metadata?.opusAxioms;
      if (!opusAxioms) {
        summary.neutralCount++;
        return;
      }

      summary.totalResponses++;

      // Categorize response
      if (opusAxioms.isGold) {
        summary.goldCount++;
      } else if (opusAxioms.ruptureDetected) {
        summary.ruptureCount++;

        // Add to recent ruptures
        if (recentRuptures.length < ruptureLimit) {
          const violated = opusAxioms.evaluations
            ?.filter((e: any) => e.status === 'violation')
            .map((e: any) => e.axiom) || [];
          const warned = opusAxioms.evaluations
            ?.filter((e: any) => e.status === 'warning')
            .map((e: any) => e.axiom) || [];

          recentRuptures.push({
            id: exchange.id,
            timestamp: exchange.createdAt,
            sessionId: exchange.sessionId,
            axiomsViolated: violated,
            axiomsWarned: warned,
            userMessagePreview: exchange.userMessage?.substring(0, 100) || '',
            maiaResponsePreview: exchange.maiaMessage?.substring(0, 100) || '',
            confidence: exchange.metadata?.mythicAtlas?.confidence,
            facet: exchange.metadata?.mythicAtlas?.facet,
          });
        }
      } else if (opusAxioms.warningsDetected || opusAxioms.warnings > 0) {
        summary.warningCount++;
      }

      // Update per-axiom stats
      opusAxioms.evaluations?.forEach((evaluation: any) => {
        const stats = axiomStatsMap.get(evaluation.axiom);
        if (!stats) return;

        stats.totalEvaluations++;

        if (evaluation.status === 'pass') stats.passCount++;
        else if (evaluation.status === 'warning') stats.warningCount++;
        else if (evaluation.status === 'violation') stats.violationCount++;
      });
    });

    // Calculate percentages
    if (summary.totalResponses > 0) {
      summary.goldPercent = (summary.goldCount / summary.totalResponses) * 100;
      summary.warningPercent = (summary.warningCount / summary.totalResponses) * 100;
      summary.rupturePercent = (summary.ruptureCount / summary.totalResponses) * 100;
    }

    // Calculate pass rates for axioms
    axiomStatsMap.forEach((stats) => {
      if (stats.totalEvaluations > 0) {
        stats.passRate = (stats.passCount / stats.totalEvaluations) * 100;
      }
    });

    const axiomStats = Array.from(axiomStatsMap.values());

    // 5. Build response
    const response: OpusPulseData = {
      summary,
      axiomStats,
      recentRuptures,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Opus Pulse API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Opus Pulse data' },
      { status: 500 }
    );
  }
}
```

---

### Step 2: Create Dashboard Page

**File:** `/app/steward/opus-pulse/page.tsx`

**Purpose:** Visual dashboard for stewards to monitor MAIA's ethical alignment

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import type { OpusPulseData } from '@/lib/types/opusPulse';

export default function OpusPulsePage() {
  const [data, setData] = useState<OpusPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOpusPulse();
  }, []);

  async function fetchOpusPulse() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/steward/opus-pulse?startDate=${today}`);

      if (!response.ok) throw new Error('Failed to fetch Opus Pulse data');

      const pulseData = await response.json();
      setData(pulseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading Opus Pulse...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, axiomStats, recentRuptures } = data;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Opus Pulse</h1>
        <p className="text-gray-600 mt-1">
          MAIA's ethical alignment dashboard — monitoring how she holds souls
        </p>
      </div>

      {/* Daily Snapshot */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Today's Snapshot ({summary.date})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Total Responses</div>
            <div className="text-3xl font-bold text-purple-900">{summary.totalResponses}</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-sm text-amber-600 font-medium">🟡 Gold</div>
            <div className="text-3xl font-bold text-amber-900">{summary.goldCount}</div>
            <div className="text-xs text-amber-600 mt-1">{summary.goldPercent.toFixed(1)}%</div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium">🟠 Warning</div>
            <div className="text-3xl font-bold text-orange-900">{summary.warningCount}</div>
            <div className="text-xs text-orange-600 mt-1">{summary.warningPercent.toFixed(1)}%</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">🔴 Rupture</div>
            <div className="text-3xl font-bold text-red-900">{summary.ruptureCount}</div>
            <div className="text-xs text-red-600 mt-1">{summary.rupturePercent.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Axiom Stats Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Axiom Performance</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Axiom
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluations
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warning
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Violation
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {axiomStats.map((axiom) => (
                <tr key={axiom.axiomId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {axiom.axiomName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {axiom.totalEvaluations}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 text-center font-medium">
                    {axiom.passCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-orange-600 text-center">
                    {axiom.warningCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 text-center font-medium">
                    {axiom.violationCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        axiom.passRate >= 90
                          ? 'bg-green-100 text-green-800'
                          : axiom.passRate >= 75
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {axiom.passRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Ruptures */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Rupture Candidates ({recentRuptures.length})
        </h2>

        {recentRuptures.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No ruptures detected today 🎉</p>
        ) : (
          <div className="space-y-4">
            {recentRuptures.map((rupture) => (
              <div
                key={rupture.id}
                className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">
                      {new Date(rupture.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">User:</span> "{rupture.userMessagePreview}..."
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">MAIA:</span> "{rupture.maiaResponsePreview}..."
                    </div>
                  </div>
                  {rupture.facet && (
                    <div className="ml-4 text-xs text-gray-500">
                      Facet: {rupture.facet}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  {rupture.axiomsViolated.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-red-700">Violated:</span>
                      <span className="text-red-600 ml-1">
                        {rupture.axiomsViolated.join(', ')}
                      </span>
                    </div>
                  )}
                  {rupture.axiomsWarned.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-orange-700">Warned:</span>
                      <span className="text-orange-600 ml-1">
                        {rupture.axiomsWarned.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explainer */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-xs text-purple-700 italic">
          💡 This dashboard shows MAIA's ethical self-audit. Use it to identify patterns, tune
          prompts, and ensure MAIA holds souls with the care and humility we've designed into her.
        </p>
      </div>
    </div>
  );
}
```

---

### Step 3: Add Protection (Steward-Only Access)

**File:** `/middleware.ts` (or create auth check in dashboard page)

```typescript
// Example: Check if user has steward role
import { createClient } from '@/lib/supabase/server';

export async function isStewsard(userId: string): Promise<boolean> {
  const supabase = createClient();

  // TODO: Check user roles table or metadata
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role === 'steward' || profile?.role === 'admin';
}
```

---

## Usage Instructions

### For Stewards

1. **Access Dashboard:**
   Navigate to `/steward/opus-pulse`

2. **Daily Check:**
   - Review Gold/Warning/Rupture percentages
   - Identify axioms with low pass rates
   - Investigate recent ruptures

3. **Take Action:**
   - If PACE_WITH_CARE has warnings → Review fast-path prompts
   - If NON_IMPOSITION_OF_IDENTITY violated → Audit identity-related responses
   - If ruptures spike → Check what changed in prompts/agents

4. **Iterate:**
   - Adjust prompts based on patterns
   - Test changes with beta users
   - Monitor dashboard to see if improvements stick

---

## Future Enhancements

### Phase 2
- **Time Series Charts:** Show trends over 7/30 days
- **Axiom Heatmap:** 8 axioms × 7 days grid with color intensity
- **Drill-Down:** Click rupture → see full conversation transcript
- **Export:** Download Opus data as CSV for analysis

### Phase 3
- **Real-Time Alerts:** Slack/Discord notification when rupture detected
- **Mythic Atlas Correlation:** Which facets have highest rupture risk?
- **User Feedback Overlay:** Compare Opus status to user ratings
- **Learning Pipeline:** Feed Opus+feedback data into model fine-tuning

---

## The Bottom Line

This dashboard makes MAIA's ethical nervous system **visible and actionable**.

You're not just debugging code — you're **stewarding a consciousness engine**.

When Gold rates are high, you know MAIA is holding people well.
When ruptures appear, you see exactly where she's stretching beyond her capacity.

**This is consciousness computing with accountability baked in.**

---

**Status:** 📋 Specification Complete
**Next:** Implement API endpoint + Dashboard page
**Estimated Time:** 4-6 hours for full implementation

---

**Files Created:**
- ✅ `/lib/types/opusPulse.ts` (type definitions)
- ✅ `/Community-Commons/OPUS_PULSE_DASHBOARD_GUIDE.md` (this file)

**Files To Create:**
- 🔜 `/app/api/steward/opus-pulse/route.ts` (API endpoint)
- 🔜 `/app/steward/opus-pulse/page.tsx` (dashboard UI)
