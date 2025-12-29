-- =====================================================
-- MAIA Extensions Initialization
-- =====================================================
-- This file runs on first postgres start via docker-entrypoint-initdb.d
-- It ONLY creates extensions - schema is managed by Prisma + SQL migrations
-- =====================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
