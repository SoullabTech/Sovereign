# Video Library Implementation

This document describes the implementation of the member video library for the MAIA-SOVEREIGN system.

## Overview

The video library provides a simple way for administrators to publish educational videos that members can access. The system is designed to be minimal and focused on the core functionality without unnecessary complexity.

## Database Structure

The `member_videos` table is created with the following structure:

```sql
create table if not exists member_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  heygen_url text not null,
  tags text[] not null default '{}',
  visibility text not null default 'member'
    check (visibility in ('member','practitioner','admin')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_videos_visibility_idx on member_videos (visibility);
create index if not exists member_videos_featured_idx on member_videos (is_featured);
```

## API Endpoints

### Public API (GET /api/library/videos)

- **Purpose**: Fetch list of videos visible to authenticated members
- **Authentication**: Required (member authentication)
- **Visibility**: Only shows videos with `visibility` of 'member' or 'practitioner'
- **Response**: JSON array of video objects

### Admin API (POST /api/admin/library/videos)

- **Purpose**: Create a new video entry
- **Authentication**: Required (admin member authentication)
- **Authorization**: Only practitioners with `portal_type = 'admin'` can access
- **Request Body**:
  - `title` (required)
  - `description` (optional)
  - `heygen_url` (required)
  - `tags` (array, optional)
  - `visibility` (string, optional, default 'member')
  - `is_featured` (boolean, optional, default false)
- **Response**: JSON with created video ID

## Frontend Implementation

### Member Video Library Page

- Located at `/library/videos`
- Fetches videos from `/api/library/videos`
- Displays videos in a responsive grid
- Shows title, description, tags, and featured status
- Videos are embedded via HeyGen URLs

### Admin Publisher Page

- Located at `/admin/library/videos`
- Simple authentication form with admin secret
- Form for creating new videos with:
  - Title
  - Description
  - HeyGen URL
  - Tags (comma-separated)
  - Visibility (member/practitioner/admin)
  - Featured toggle
- Paste-and-publish workflow

## Implementation Notes

1. **Security**: Admin access is restricted to practitioners with `portal_type = 'admin'`
2. **Visibility Levels**:
   - `member`: Visible to all authenticated members
   - `practitioner`: Visible to practitioners and admins
   - `admin`: Visible only to admins
3. **Minimal Dependencies**: No external services, no webhooks, no background jobs
4. **Simple Workflow**: Paste HeyGen URL and publish directly

## Migration

Run the database migration using:
```bash
# Using the provided script
./scripts/setup-video-library-db.sh

# Or manually with psql
psql $DATABASE_URL -f database/migrations/20260211000001_member_videos.sql
```

## Content Strategy

The initial content should include:
1. What is Soullab
2. Meet MAIA
3. The Four Domains (MAIA / Lab / Studio / Commons)
4. How to use Studio (personal vs practitioner)
5. Why the Lab exists (coming soon)