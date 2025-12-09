# MAIA Database Sovereignty Plan
## Goal: Replace Supabase with Self-Hosted PostgreSQL Stack

### 🎯 **Recommended Architecture: PostgreSQL + Drizzle + Redis**

This combination provides:
- **PostgreSQL 16**: ACID compliance, vector extensions, full-text search
- **Drizzle**: Lightning-fast TypeScript ORM with SQL-like syntax
- **Redis 7**: Real-time features, caching, sessions
- **Custom Auth**: JWT-based authentication service

### 🏗️ **Migration Strategy**

#### **Phase 1: Infrastructure Setup**

```yaml
# docker-compose.sovereignty.yml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: maia_sovereign
      POSTGRES_USER: maia
      POSTGRES_PASSWORD: ${MAIA_DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

#### **Phase 2: Schema Migration**

```sql
-- /database/init/01_extensions.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- /database/init/02_schema.sql
-- User Profiles
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  account_type TEXT NOT NULL DEFAULT 'user',
  professional_type TEXT,
  current_state TEXT NOT NULL DEFAULT 'balanced',
  stress_level INTEGER DEFAULT 5 CHECK (stress_level BETWEEN 1 AND 10),
  energy_level INTEGER DEFAULT 5 CHECK (energy_level BETWEEN 1 AND 10),
  integration_stage TEXT,
  community_visibility TEXT DEFAULT 'supportive',
  professional_support_consent BOOLEAN DEFAULT FALSE,
  research_participation_consent BOOLEAN DEFAULT FALSE,
  professional_credentials JSONB,
  verified_professional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domain Profiles (Consciousness development tracking)
CREATE TABLE domain_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  current_level INTEGER DEFAULT 1,
  development_stage TEXT,
  strengths TEXT[],
  growth_edges TEXT[],
  practices_engaged TEXT[],
  last_assessment_date TIMESTAMP WITH TIME ZONE,
  assessment_responses JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

-- Spiral Progress (12-Phase Spiralogic tracking)
CREATE TABLE spiral_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  depth INTEGER DEFAULT 1,
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 12),
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  previous_visits INTEGER DEFAULT 0,
  integration_quality REAL DEFAULT 0.5 CHECK (integration_quality BETWEEN 0 AND 1),
  real_world_application TEXT,
  struggles_encountered TEXT,
  ordinary_moments TEXT,
  community_validated BOOLEAN DEFAULT FALSE,
  validated_by UUID,
  validation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Journeys (Real-world application tracking)
CREATE TABLE integration_journeys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  insight_content TEXT NOT NULL,
  content_source TEXT,
  real_world_applications TEXT[],
  challenges_encountered TEXT[],
  adaptations_made TEXT[],
  timeframe TEXT,
  ongoing_practice BOOLEAN DEFAULT FALSE,
  integration_evidence TEXT,
  journey_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Embodied Wisdom (Somatic awareness tracking)
CREATE TABLE embodied_wisdom (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('recognition', 'struggle', 'practice')),
  title TEXT NOT NULL,
  description TEXT,
  -- Recognition-specific fields
  somatic_awareness TEXT,
  physical_practice TEXT,
  body_wisdom TEXT,
  -- Struggle-specific fields
  struggle_details TEXT,
  lessons_learned TEXT,
  ongoing_challenges TEXT,
  humility_developed TEXT,
  -- Practice-specific fields
  moment_description TEXT,
  awareness_quality REAL,
  practice_applied TEXT,
  humanness_acknowledged TEXT,
  practice_name TEXT,
  frequency TEXT,
  consistency_rating REAL,
  maintained_days INTEGER,
  embodiment_quality REAL,
  validated BOOLEAN DEFAULT FALSE,
  validation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bypassing Detection (Spiritual bypassing prevention)
CREATE TABLE bypassing_detections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  trigger_events TEXT[],
  behavior_indicators TEXT[],
  pattern_frequency TEXT,
  intervention_recommended BOOLEAN DEFAULT FALSE,
  professional_referral_suggested BOOLEAN DEFAULT FALSE,
  addressed BOOLEAN DEFAULT FALSE,
  addressed_date TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  detected_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Gates (Content unlock system)
CREATE TABLE integration_gates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  content_to_unlock TEXT NOT NULL,
  gate_type TEXT NOT NULL,
  minimum_integration_days INTEGER DEFAULT 7,
  requirements JSONB,
  real_world_application_required BOOLEAN DEFAULT TRUE,
  community_validation_required BOOLEAN DEFAULT FALSE,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_date TIMESTAMP WITH TIME ZONE,
  bypass_attempts INTEGER DEFAULT 0,
  last_bypass_attempt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Interactions (Peer support system)
CREATE TABLE community_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  content TEXT NOT NULL,
  context JSONB,
  target_user_id UUID REFERENCES user_profiles(user_id),
  group_context TEXT,
  visibility TEXT DEFAULT 'supportive' CHECK (visibility IN ('private', 'supportive', 'open')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Connections (Verified practitioner network)
CREATE TABLE professional_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  professional_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL,
  initiated_by UUID NOT NULL,
  connection_reason TEXT,
  platform_integration_consent BOOLEAN DEFAULT FALSE,
  data_sharing_level TEXT DEFAULT 'minimal' CHECK (data_sharing_level IN ('minimal', 'basic', 'comprehensive')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, professional_id)
);

-- Content Interactions (Usage tracking)
CREATE TABLE content_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_title TEXT,
  elemental_association TEXT,
  access_granted BOOLEAN DEFAULT TRUE,
  access_denied_reason TEXT,
  integration_requirements_met BOOLEAN DEFAULT FALSE,
  time_spent_minutes INTEGER DEFAULT 0,
  completion_percentage REAL DEFAULT 0,
  grounding_prompts_delivered INTEGER DEFAULT 0,
  bypassing_warnings_given INTEGER DEFAULT 0,
  reality_checks_prompted INTEGER DEFAULT 0,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Analytics (Anonymized metrics)
CREATE TABLE platform_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_hash TEXT NOT NULL, -- SHA-256 of user_id for anonymization
  cohort_identifier TEXT,
  integration_effectiveness_score REAL,
  bypassing_reduction_score REAL,
  community_health_contribution REAL,
  long_term_development_trend JSONB,
  session_data JSONB,
  content_interaction_patterns JSONB,
  community_participation_patterns JSONB,
  professional_support_utilization JSONB,
  self_reported_wellbeing_change REAL,
  integration_quality_improvement REAL,
  research_consent BOOLEAN DEFAULT FALSE,
  data_retention_end_date TIMESTAMP WITH TIME ZONE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reflection Gaps (Integration timing system)
CREATE TABLE reflection_gaps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  minimum_duration_hours INTEGER DEFAULT 24,
  reflection_prompts TEXT[],
  reality_check_questions TEXT[],
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'completed', 'overridden')),
  reflection_responses JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_domain_profiles_user_id ON domain_profiles(user_id);
CREATE INDEX idx_spiral_progress_user_id ON spiral_progress(user_id);
CREATE INDEX idx_spiral_progress_theme_phase ON spiral_progress(theme, phase);
CREATE INDEX idx_integration_journeys_user_id ON integration_journeys(user_id);
CREATE INDEX idx_embodied_wisdom_user_id_type ON embodied_wisdom(user_id, type);
CREATE INDEX idx_bypassing_detections_user_id ON bypassing_detections(user_id);
CREATE INDEX idx_integration_gates_user_id ON integration_gates(user_id);
CREATE INDEX idx_community_interactions_user_id ON community_interactions(user_id);
CREATE INDEX idx_professional_connections_user_id ON professional_connections(user_id);
CREATE INDEX idx_content_interactions_user_id ON content_interactions(user_id);
CREATE INDEX idx_platform_analytics_user_hash ON platform_analytics(user_hash);
CREATE INDEX idx_reflection_gaps_user_id ON reflection_gaps(user_id);

-- Full-text search indexes
CREATE INDEX idx_embodied_wisdom_content_search ON embodied_wisdom USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_integration_journeys_search ON integration_journeys USING gin(to_tsvector('english', insight_content));
```

#### **Phase 3: Drizzle ORM Setup**

```typescript
// /database/schema.ts
import { pgTable, text, uuid, integer, boolean, timestamp, real, jsonb, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique(),
  displayName: text('display_name'),
  bio: text('bio'),
  accountType: text('account_type').notNull().default('user'),
  professionalType: text('professional_type'),
  currentState: text('current_state').notNull().default('balanced'),
  stressLevel: integer('stress_level').default(5),
  energyLevel: integer('energy_level').default(5),
  integrationStage: text('integration_stage'),
  communityVisibility: text('community_visibility').default('supportive'),
  professionalSupportConsent: boolean('professional_support_consent').default(false),
  researchParticipationConsent: boolean('research_participation_consent').default(false),
  professionalCredentials: jsonb('professional_credentials'),
  verifiedProfessional: boolean('verified_professional').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastActive: timestamp('last_active', { withTimezone: true }).defaultNow(),
});

export const domainProfiles = pgTable('domain_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => userProfiles.userId, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  currentLevel: integer('current_level').default(1),
  developmentStage: text('development_stage'),
  strengths: text('strengths').array(),
  growthEdges: text('growth_edges').array(),
  practicesEngaged: text('practices_engaged').array(),
  lastAssessmentDate: timestamp('last_assessment_date', { withTimezone: true }),
  assessmentResponses: jsonb('assessment_responses'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const spiralProgress = pgTable('spiral_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => userProfiles.userId, { onDelete: 'cascade' }),
  theme: text('theme').notNull(),
  depth: integer('depth').default(1),
  phase: integer('phase').notNull(),
  visitDate: timestamp('visit_date', { withTimezone: true }).defaultNow(),
  previousVisits: integer('previous_visits').default(0),
  integrationQuality: real('integration_quality').default(0.5),
  realWorldApplication: text('real_world_application'),
  strugglesEncountered: text('struggles_encountered'),
  ordinaryMoments: text('ordinary_moments'),
  communityValidated: boolean('community_validated').default(false),
  validatedBy: uuid('validated_by'),
  validationDate: timestamp('validation_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ... continue with other tables

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  domainProfiles: many(domainProfiles),
  spiralProgress: many(spiralProgress),
  integrationJourneys: many(integrationJourneys),
  embodiedWisdom: many(embodiedWisdom),
  // ... other relations
}));
```

#### **Phase 4: Data Migration Service**

```typescript
// /database/migration.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import * as schema from './schema';

export class DataMigrationService {
  private supabase;
  private db;

  constructor() {
    // Supabase source
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // PostgreSQL target
    const connection = postgres(process.env.DATABASE_URL!);
    this.db = drizzle(connection, { schema });
  }

  async migrateUserProfiles() {
    console.log('🔄 Migrating user profiles...');

    const { data: profiles, error } = await this.supabase
      .from('user_profiles')
      .select('*');

    if (error) throw error;

    for (const profile of profiles) {
      await this.db.insert(schema.userProfiles).values({
        userId: profile.user_id,
        displayName: profile.display_name,
        bio: profile.bio,
        accountType: profile.account_type,
        professionalType: profile.professional_type,
        currentState: profile.current_state,
        stressLevel: profile.stress_level,
        energyLevel: profile.energy_level,
        integrationStage: profile.integration_stage,
        communityVisibility: profile.community_visibility,
        professionalSupportConsent: profile.professional_support_consent,
        researchParticipationConsent: profile.research_participation_consent,
        professionalCredentials: profile.professional_credentials,
        verifiedProfessional: profile.verified_professional,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
        lastActive: new Date(profile.last_active),
      }).onConflictDoNothing();
    }

    console.log(`✅ Migrated ${profiles.length} user profiles`);
  }

  async migrateDomainProfiles() {
    console.log('🔄 Migrating domain profiles...');

    const { data: profiles, error } = await this.supabase
      .from('domain_profiles')
      .select('*');

    if (error) throw error;

    for (const profile of profiles) {
      await this.db.insert(schema.domainProfiles).values({
        userId: profile.user_id,
        domain: profile.domain,
        currentLevel: profile.current_level,
        developmentStage: profile.development_stage,
        strengths: profile.strengths,
        growthEdges: profile.growth_edges,
        practicesEngaged: profile.practices_engaged,
        lastAssessmentDate: profile.last_assessment_date ? new Date(profile.last_assessment_date) : null,
        assessmentResponses: profile.assessment_responses,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
      }).onConflictDoNothing();
    }

    console.log(`✅ Migrated ${profiles.length} domain profiles`);
  }

  // ... continue with other tables

  async runFullMigration() {
    try {
      await this.migrateUserProfiles();
      await this.migrateDomainProfiles();
      await this.migrateSpiralProgress();
      await this.migrateIntegrationJourneys();
      await this.migrateEmbodiedWisdom();
      await this.migrateBypassingDetections();
      await this.migrateIntegrationGates();
      await this.migrateCommunityInteractions();
      await this.migrateProfessionalConnections();
      await this.migrateContentInteractions();
      await this.migratePlatformAnalytics();
      await this.migrateReflectionGaps();

      console.log('🎉 Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

// CLI script
if (require.main === module) {
  const migrator = new DataMigrationService();
  migrator.runFullMigration().catch(console.error);
}
```

### 🔧 **Implementation Timeline**

#### **Week 1: Infrastructure**
- Set up PostgreSQL + Redis Docker stack
- Create database schema and migrations
- Set up Drizzle ORM with TypeScript

#### **Week 2: Data Migration**
- Build data migration tools
- Test migration with sample data
- Run full production migration

#### **Week 3: Application Updates**
- Replace Supabase integration service with Drizzle
- Implement custom authentication service
- Add real-time features with Redis

#### **Week 4: Testing & Deployment**
- Comprehensive testing of all features
- Performance optimization
- Production deployment and monitoring

### 🚀 **Benefits of This Approach**

- **Complete Sovereignty**: No external dependencies
- **Performance**: Direct PostgreSQL access + Redis caching
- **Flexibility**: Full control over schema and queries
- **Type Safety**: End-to-end TypeScript with Drizzle
- **Scalability**: Horizontal scaling with PostgreSQL read replicas
- **Cost Reduction**: Eliminate Supabase hosting costs

### 💰 **Estimated Costs**
- **Current Supabase**: ~$25-100/month depending on usage
- **Self-hosted**: ~$20-40/month for VPS + domain
- **Annual Savings**: $60-720/year

This plan gives you complete database sovereignty while maintaining all existing functionality and improving performance.