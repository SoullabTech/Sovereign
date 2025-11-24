/**
 * All Users Usage API
 *
 * GET /api/admin/usage/users
 * Returns usage statistics for all users
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    console.log(`📊 [ADMIN] Fetching all users usage`);

    // Get all quotas with usage stats
    const { data: quotas, error: quotaError } = await supabase
      .from('user_usage_quotas')
      .select('*')
      .order('current_daily_cost_cents', { ascending: false });

    if (quotaError) {
      console.error('❌ [ADMIN] Error fetching quotas:', quotaError);
      return NextResponse.json(
        { error: 'Failed to fetch user quotas', details: quotaError.message },
        { status: 500 }
      );
    }

    // Get recent activity for each user
    const { data: recentActivity, error: activityError } = await supabase
      .from('user_usage_logs')
      .select('user_id, created_at')
      .order('created_at', { ascending: false });

    if (activityError) {
      console.error('❌ [ADMIN] Error fetching activity:', activityError);
      return NextResponse.json(
        { error: 'Failed to fetch user activity', details: activityError.message },
        { status: 500 }
      );
    }

    // Build user activity map
    const activityMap = new Map();
    recentActivity?.forEach((activity: any) => {
      if (!activityMap.has(activity.user_id)) {
        activityMap.set(activity.user_id, activity.created_at);
      }
    });

    // Get total requests per user
    const { data: requestCounts, error: countError } = await supabase
      .from('user_usage_logs')
      .select('user_id, total_cost')
      .order('user_id');

    if (countError) {
      console.error('❌ [ADMIN] Error fetching request counts:', countError);
    }

    // Aggregate by user
    const userStats = new Map();
    requestCounts?.forEach((log: any) => {
      if (!userStats.has(log.user_id)) {
        userStats.set(log.user_id, { requests: 0, totalCost: 0 });
      }
      const stats = userStats.get(log.user_id);
      stats.requests++;
      stats.totalCost += log.total_cost || 0;
    });

    // Combine data
    const users = quotas?.map((quota: any) => ({
      userId: quota.user_id,
      userName: quota.user_name,
      tier: quota.user_tier,
      isActive: quota.is_active,
      isBlocked: quota.is_blocked,
      blockReason: quota.block_reason,
      dailyMessages: {
        current: quota.current_daily_messages,
        limit: quota.daily_message_limit,
        percentage: (quota.current_daily_messages / quota.daily_message_limit * 100).toFixed(1) + '%'
      },
      dailyTokens: {
        current: quota.current_daily_tokens,
        limit: quota.daily_token_limit,
        percentage: (quota.current_daily_tokens / quota.daily_token_limit * 100).toFixed(1) + '%'
      },
      dailyCost: {
        current: (quota.current_daily_cost_cents / 100).toFixed(4),
        limit: '0.50',
        percentage: (quota.current_daily_cost_cents / 50 * 100).toFixed(1) + '%'
      },
      totalRequests: userStats.get(quota.user_id)?.requests || 0,
      totalCostUSD: ((userStats.get(quota.user_id)?.totalCost || 0) / 100).toFixed(4),
      lastActive: activityMap.get(quota.user_id) || quota.last_reset_at,
      lastResetAt: quota.last_reset_at,
      createdAt: quota.created_at
    })) || [];

    return NextResponse.json({
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.isActive).length,
      blockedUsers: users.filter((u: any) => u.isBlocked).length,
      users
    });

  } catch (error) {
    console.error('❌ [ADMIN] Error fetching all users:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch all users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
