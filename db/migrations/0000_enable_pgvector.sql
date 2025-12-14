-- Enable pgvector extension for vector similarity search
-- This must run before any migrations that use the vector type

CREATE EXTENSION IF NOT EXISTS vector;
