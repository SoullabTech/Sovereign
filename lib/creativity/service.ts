// Creativity Section - Core Service
// Mathematics of Creativity - Database Operations

import { query, queryOne, transaction } from '@/lib/db/postgres';
import type {
  CreativeAttempt,
  CreateAttemptInput,
  UpdateAttemptInput,
  AttemptStats,
  StreakInfo,
  PracticeStreak,
  CreativityJourney,
  MemberAchievement,
  SkillDomain,
} from './types';

// Row types for database queries
interface AttemptRow {
  id: string;
  member_id: string;
  created_at: Date;
  updated_at: Date;
  type: string;
  content_text: string | null;
  content_voice_url: string | null;
  content_image_url: string | null;
  status: string;
  quality_rating: number | null;
  outlier_score: number;
  is_outlier: boolean;
  outlier_reasons: string[];
  view_count: number;
  edit_count: number;
  total_time_spent: number;
  engagement_score: number;
}

interface StreakRow {
  member_id: string;
  current_streak: number;
  longest_streak: number;
  last_practice_date: Date | null;
  streak_minimum_minutes: number;
  updated_at: Date;
}

interface JourneyRow {
  member_id: string;
  current_stage: number;
  completed_stages: number[];
  unlocked_features: string[];
  last_stage_change: Date;
  created_at: Date;
}

interface SkillDomainRow {
  id: string;
  member_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  display_order: number;
  created_at: Date;
}

// Transform database row to typed object
function rowToAttempt(row: AttemptRow): CreativeAttempt {
  return {
    id: row.id,
    memberId: row.member_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    type: row.type as CreativeAttempt['type'],
    contentText: row.content_text,
    contentVoiceUrl: row.content_voice_url,
    contentImageUrl: row.content_image_url,
    status: row.status as CreativeAttempt['status'],
    qualityRating: row.quality_rating,
    outlierScore: row.outlier_score,
    isOutlier: row.is_outlier,
    outlierReasons: row.outlier_reasons || [],
    viewCount: row.view_count,
    editCount: row.edit_count,
    totalTimeSpent: row.total_time_spent,
    engagementScore: row.engagement_score,
  };
}

// ============================================================================
// CREATIVE ATTEMPTS (Law of Large Numbers)
// ============================================================================

export async function createAttempt(input: CreateAttemptInput): Promise<CreativeAttempt> {
  const { memberId, type = 'idea', contentText, contentVoiceUrl, contentImageUrl } = input;

  const result = await query<AttemptRow>(
    `INSERT INTO creative_attempts (member_id, type, content_text, content_voice_url, content_image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [memberId, type, contentText || null, contentVoiceUrl || null, contentImageUrl || null]
  );

  const attempt = rowToAttempt(result.rows[0]);

  // Check for achievements after creating attempt
  await checkAttemptAchievements(memberId);

  return attempt;
}

export async function getAttempt(id: string): Promise<CreativeAttempt | null> {
  const row = await queryOne<AttemptRow>(
    `SELECT * FROM creative_attempts WHERE id = $1`,
    [id]
  );

  return row ? rowToAttempt(row) : null;
}

export async function getAttemptsByMember(
  memberId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: string;
    type?: string;
    outliersOnly?: boolean;
  } = {}
): Promise<CreativeAttempt[]> {
  const { limit = 50, offset = 0, status, type, outliersOnly } = options;

  let sql = `SELECT * FROM creative_attempts WHERE member_id = $1`;
  const params: any[] = [memberId];
  let paramIndex = 2;

  if (status) {
    sql += ` AND status = $${paramIndex++}`;
    params.push(status);
  }

  if (type) {
    sql += ` AND type = $${paramIndex++}`;
    params.push(type);
  }

  if (outliersOnly) {
    sql += ` AND is_outlier = TRUE`;
  }

  sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  params.push(limit, offset);

  const result = await query<AttemptRow>(sql, params);
  return result.rows.map(rowToAttempt);
}

export async function updateAttempt(
  id: string,
  updates: UpdateAttemptInput
): Promise<CreativeAttempt | null> {
  const setClauses: string[] = [];
  const params: any[] = [id];
  let paramIndex = 2;

  if (updates.contentText !== undefined) {
    setClauses.push(`content_text = $${paramIndex++}`);
    params.push(updates.contentText);
  }

  if (updates.contentVoiceUrl !== undefined) {
    setClauses.push(`content_voice_url = $${paramIndex++}`);
    params.push(updates.contentVoiceUrl);
  }

  if (updates.contentImageUrl !== undefined) {
    setClauses.push(`content_image_url = $${paramIndex++}`);
    params.push(updates.contentImageUrl);
  }

  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramIndex++}`);
    params.push(updates.status);
  }

  if (updates.qualityRating !== undefined) {
    setClauses.push(`quality_rating = $${paramIndex++}`);
    params.push(updates.qualityRating);
  }

  // Always increment edit count on update
  setClauses.push(`edit_count = edit_count + 1`);

  if (setClauses.length === 0) return getAttempt(id);

  const sql = `
    UPDATE creative_attempts
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query<AttemptRow>(sql, params);
  return result.rows[0] ? rowToAttempt(result.rows[0]) : null;
}

export async function deleteAttempt(id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM creative_attempts WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============================================================================
// ATTEMPT STATS (Dashboard)
// ============================================================================

export async function getAttemptStats(memberId: string): Promise<AttemptStats> {
  const result = await queryOne<{
    total_attempts: string;
    today_attempts: string;
    week_attempts: string;
    outlier_count: string;
    avg_quality: string | null;
  }>(
    `SELECT
      COUNT(*) as total_attempts,
      COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_attempts,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_attempts,
      COUNT(*) FILTER (WHERE is_outlier = TRUE) as outlier_count,
      AVG(quality_rating) FILTER (WHERE quality_rating IS NOT NULL) as avg_quality
    FROM creative_attempts
    WHERE member_id = $1`,
    [memberId]
  );

  return {
    totalAttempts: parseInt(result?.total_attempts || '0'),
    todayAttempts: parseInt(result?.today_attempts || '0'),
    thisWeekAttempts: parseInt(result?.week_attempts || '0'),
    outlierCount: parseInt(result?.outlier_count || '0'),
    averageQualityRating: result?.avg_quality ? parseFloat(result.avg_quality) : null,
  };
}

// ============================================================================
// PRACTICE STREAKS (Exponential Growth)
// ============================================================================

export async function getOrCreateStreak(memberId: string): Promise<PracticeStreak> {
  // Try to get existing streak
  let row = await queryOne<StreakRow>(
    `SELECT * FROM practice_streaks WHERE member_id = $1`,
    [memberId]
  );

  // Create if doesn't exist
  if (!row) {
    const result = await query<StreakRow>(
      `INSERT INTO practice_streaks (member_id) VALUES ($1) RETURNING *`,
      [memberId]
    );
    row = result.rows[0];
  }

  return {
    memberId: row.member_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastPracticeDate: row.last_practice_date,
    streakMinimumMinutes: row.streak_minimum_minutes,
    updatedAt: row.updated_at,
  };
}

export async function updateStreak(memberId: string): Promise<PracticeStreak> {
  const today = new Date().toISOString().split('T')[0];

  return transaction(async (client) => {
    // Get current streak
    const streakResult = await client.query<StreakRow>(
      `SELECT * FROM practice_streaks WHERE member_id = $1 FOR UPDATE`,
      [memberId]
    );

    let streak = streakResult.rows[0];

    if (!streak) {
      // Create new streak
      const insertResult = await client.query<StreakRow>(
        `INSERT INTO practice_streaks (member_id, current_streak, last_practice_date)
         VALUES ($1, 1, $2)
         RETURNING *`,
        [memberId, today]
      );
      return {
        memberId: insertResult.rows[0].member_id,
        currentStreak: 1,
        longestStreak: 1,
        lastPracticeDate: new Date(today),
        streakMinimumMinutes: 15,
        updatedAt: insertResult.rows[0].updated_at,
      };
    }

    const lastDate = streak.last_practice_date
      ? new Date(streak.last_practice_date).toISOString().split('T')[0]
      : null;

    let newStreak = streak.current_streak;
    let newLongest = streak.longest_streak;

    if (lastDate === today) {
      // Already practiced today, no change needed
      return {
        memberId: streak.member_id,
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        lastPracticeDate: streak.last_practice_date,
        streakMinimumMinutes: streak.streak_minimum_minutes,
        updatedAt: streak.updated_at,
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      // Continuing streak
      newStreak = streak.current_streak + 1;
      if (newStreak > newLongest) {
        newLongest = newStreak;
      }
    } else {
      // Streak broken, start fresh
      newStreak = 1;
    }

    const updateResult = await client.query<StreakRow>(
      `UPDATE practice_streaks
       SET current_streak = $2, longest_streak = $3, last_practice_date = $4
       WHERE member_id = $1
       RETURNING *`,
      [memberId, newStreak, newLongest, today]
    );

    // Check for streak achievements
    await checkStreakAchievements(memberId, newStreak);

    return {
      memberId: updateResult.rows[0].member_id,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastPracticeDate: new Date(today),
      streakMinimumMinutes: updateResult.rows[0].streak_minimum_minutes,
      updatedAt: updateResult.rows[0].updated_at,
    };
  });
}

export async function getStreakInfo(memberId: string): Promise<StreakInfo> {
  const streak = await getOrCreateStreak(memberId);

  // Check if streak is at risk (no practice today and it's after 6 PM)
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const lastDate = streak.lastPracticeDate
    ? new Date(streak.lastPracticeDate).toISOString().split('T')[0]
    : null;

  const atRisk = streak.currentStreak > 0 && lastDate !== today && now.getHours() >= 18;

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastPracticeDate: streak.lastPracticeDate,
    atRisk,
  };
}

// ============================================================================
// CREATIVITY JOURNEY (Progressive Unlock)
// ============================================================================

export async function getOrCreateJourney(memberId: string): Promise<CreativityJourney> {
  let row = await queryOne<JourneyRow>(
    `SELECT * FROM creativity_journeys WHERE member_id = $1`,
    [memberId]
  );

  if (!row) {
    const result = await query<JourneyRow>(
      `INSERT INTO creativity_journeys (member_id) VALUES ($1) RETURNING *`,
      [memberId]
    );
    row = result.rows[0];
  }

  return {
    memberId: row.member_id,
    currentStage: row.current_stage,
    completedStages: row.completed_stages || [1],
    unlockedFeatures: row.unlocked_features || ['capture', 'attempt_count'],
    lastStageChange: row.last_stage_change,
    createdAt: row.created_at,
  };
}

export async function advanceJourney(
  memberId: string,
  newStage: number,
  newFeatures: string[]
): Promise<CreativityJourney> {
  const result = await query<JourneyRow>(
    `UPDATE creativity_journeys
     SET current_stage = $2,
         completed_stages = array_append(completed_stages, $2),
         unlocked_features = unlocked_features || $3::text[],
         last_stage_change = NOW()
     WHERE member_id = $1
     RETURNING *`,
    [memberId, newStage, newFeatures]
  );

  return {
    memberId: result.rows[0].member_id,
    currentStage: result.rows[0].current_stage,
    completedStages: result.rows[0].completed_stages,
    unlockedFeatures: result.rows[0].unlocked_features,
    lastStageChange: result.rows[0].last_stage_change,
    createdAt: result.rows[0].created_at,
  };
}

// ============================================================================
// SKILL DOMAINS
// ============================================================================

export async function getSkillDomains(memberId?: string): Promise<SkillDomain[]> {
  // Get both system defaults (member_id IS NULL) and member-specific domains
  const result = await query<SkillDomainRow>(
    `SELECT * FROM skill_domains
     WHERE member_id IS NULL OR member_id = $1
     ORDER BY display_order, name`,
    [memberId || null]
  );

  return result.rows.map((row) => ({
    id: row.id,
    memberId: row.member_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  }));
}

export async function createSkillDomain(
  memberId: string,
  name: string,
  icon?: string,
  color?: string
): Promise<SkillDomain> {
  const result = await query<SkillDomainRow>(
    `INSERT INTO skill_domains (member_id, name, icon, color)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [memberId, name, icon || null, color || null]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    memberId: row.member_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

async function checkAttemptAchievements(memberId: string): Promise<void> {
  const stats = await getAttemptStats(memberId);
  const milestones = [10, 50, 100, 500, 1000, 5000, 10000];

  for (const milestone of milestones) {
    if (stats.totalAttempts >= milestone) {
      await grantAchievementIfNew(memberId, 'attempt_count', `attempts_${milestone}`);
    }
  }
}

async function checkStreakAchievements(memberId: string, streakDays: number): Promise<void> {
  const milestones = [7, 14, 30, 60, 100, 365];

  for (const milestone of milestones) {
    if (streakDays >= milestone) {
      await grantAchievementIfNew(memberId, 'streak', `streak_${milestone}`);
    }
  }
}

async function grantAchievementIfNew(
  memberId: string,
  achievementType: string,
  achievementKey: string
): Promise<MemberAchievement | null> {
  // Use ON CONFLICT to avoid race conditions
  const result = await query<{
    id: string;
    member_id: string;
    achievement_type: string;
    achievement_key: string;
    earned_at: Date;
  }>(
    `INSERT INTO member_achievements (member_id, achievement_type, achievement_key)
     VALUES ($1, $2, $3)
     ON CONFLICT (member_id, achievement_key) DO NOTHING
     RETURNING *`,
    [memberId, achievementType, achievementKey]
  );

  if (result.rows[0]) {
    return {
      id: result.rows[0].id,
      memberId: result.rows[0].member_id,
      achievementType: result.rows[0].achievement_type as MemberAchievement['achievementType'],
      achievementKey: result.rows[0].achievement_key,
      earnedAt: result.rows[0].earned_at,
    };
  }

  return null;
}

export async function getMemberAchievements(memberId: string): Promise<MemberAchievement[]> {
  const result = await query<{
    id: string;
    member_id: string;
    achievement_type: string;
    achievement_key: string;
    earned_at: Date;
  }>(
    `SELECT * FROM member_achievements WHERE member_id = $1 ORDER BY earned_at DESC`,
    [memberId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    memberId: row.member_id,
    achievementType: row.achievement_type as MemberAchievement['achievementType'],
    achievementKey: row.achievement_key,
    earnedAt: row.earned_at,
  }));
}

// ============================================================================
// ENGAGEMENT TRACKING
// ============================================================================

export async function trackEvent(
  attemptId: string,
  memberId: string,
  eventType: string,
  valueInt?: number
): Promise<void> {
  await query(
    `INSERT INTO creative_attempt_events (attempt_id, member_id, event_type, value_int)
     VALUES ($1, $2, $3, $4)`,
    [attemptId, memberId, eventType, valueInt || null]
  );

  // Update attempt metrics based on event type
  if (eventType === 'view') {
    await query(
      `UPDATE creative_attempts SET view_count = view_count + 1 WHERE id = $1`,
      [attemptId]
    );
  } else if (eventType === 'time_spent' && valueInt) {
    await query(
      `UPDATE creative_attempts SET total_time_spent = total_time_spent + $2 WHERE id = $1`,
      [attemptId, valueInt]
    );
  }
}
