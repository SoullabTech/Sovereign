# CLAUDE.md - Sovereign/MAIA Project Guide

This file provides guidance for Claude Code when working on this repository.

## Project Overview

**Sovereign** (also known as **MAIA** - the Spiralogic Oracle System) is an AI-powered coaching and archetypal reflection platform. It combines conversational AI with symbolic/archetypal analysis for personal transformation and consciousness exploration.

### Core Concepts
- **Elemental System**: Five elements (Fire, Water, Earth, Air, Aether) that inform AI mentor personalities and user archetypal profiles
- **Soulprint**: A dynamic profile that tracks user's psychological/spiritual patterns over time
- **Spiralogic**: A spiral-based system mapping archetypal patterns and transformational journeys
- **Voice-First Journaling**: Real-time voice interaction with symbolic analysis
- **Oracle System**: AI-powered archetypal guidance and reflection

## Repository Structure

```
Sovereign/
├── apps/web/              # Next.js 14 frontend (App Router)
│   ├── app/               # Next.js app directory (pages, API routes)
│   ├── components/        # React components
│   ├── lib/               # Frontend libraries & services
│   ├── hooks/             # React hooks
│   └── types/             # TypeScript type definitions
│
├── app/api/backend/       # Express + TypeScript backend
│   └── src/
│       ├── agents/        # AI agent implementations
│       ├── ain/           # AIN (Artificial Intelligence Network) modules
│       ├── core/          # Core system logic
│       ├── lib/           # Backend utilities
│       ├── oracle/        # Oracle system components
│       ├── services/      # Business logic services
│       └── routes/        # API route handlers
│
├── components/            # Shared components
├── hooks/                 # Shared hooks
└── package.json           # Monorepo root config
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Express, TypeScript
- **Database**: Supabase (PostgreSQL), Prisma ORM
- **AI/ML**: OpenAI, Anthropic Claude, Deepgram (voice)
- **State**: Zustand, React Query
- **Storage**: Supabase, Redis (caching), Qdrant (vectors)
- **Testing**: Jest, Storybook, Newman (API tests)

## Development Commands

### Core Development
```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint (apps/web)
npm run typecheck        # TypeScript type checking
```

### Testing
```bash
npm run test             # Run Jest tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest with coverage
npm run test:e2e         # End-to-end tests
npm run test:oracle      # Oracle system tests
npm run test:smoke       # Smoke tests (Newman)
npm run health           # System health check
```

### MAIA-Specific
```bash
npm run maia:check       # Pre-launch checks
npm run maia:test        # MAIA test suite
npm run maya             # Awaken Maya orchestration
npm run safety:test      # Safety pipeline tests
npm run safety:demo      # Demo safety responses
```

### Field/Sovereignty
```bash
npm run field:deploy     # Activate morphogenetic field
npm run field:status     # Field status check
npm run sovereignty:test # Sovereignty tests
```

## Key Architecture Patterns

### Frontend Patterns
1. **App Router**: Pages in `apps/web/app/` using Next.js 14 conventions
2. **API Routes**: `/app/api/` for serverless functions
3. **Custom Hooks**: Feature-specific hooks in `hooks/` directories
4. **Component Structure**: Atomic design in `components/`

### Backend Patterns
1. **Service Layer**: Business logic in `src/services/`
2. **Agent System**: AI agents in `src/agents/` (PersonalOracleAgent, etc.)
3. **Oracle Core**: Archetypal processing in `src/oracle/`
4. **AIN Modules**: Network intelligence in `src/ain/`

### AI Integration
- OpenAI for primary LLM calls
- Claude for symbolic analysis and safety
- Deepgram for voice transcription
- Custom prompt engineering in `src/prompts/`

## Coding Standards

### TypeScript
- Use strict TypeScript; avoid `any` types
- Define interfaces for all data structures
- Use absolute imports with `@/` prefix when available

### React
- Functional components with hooks only
- Use `use client` directive for client components
- Colocate related files (component, types, tests)

### API Routes
- Use proper HTTP methods and status codes
- Always handle errors with try/catch
- Return consistent response shapes

### Styling
- Tailwind CSS for all styling
- Use `cn()` utility for conditional classes
- Follow elemental color system for themed components

## Important Files

- `apps/web/middleware.ts` - Auth and routing middleware
- `apps/web/lib/agents/` - AI agent implementations
- `apps/web/lib/ain/` - AIN service integrations
- `app/api/backend/src/oracle/` - Oracle core system
- `app/api/backend/src/services/` - Backend services
- `prisma/schema.prisma` - Database schema

## Environment Variables

Required environment variables (see `.env.example`):
- `OPENAI_API_KEY` - OpenAI API access
- `ANTHROPIC_API_KEY` - Claude API access
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role
- `DATABASE_URL` - PostgreSQL connection string
- `DEEPGRAM_API_KEY` - Voice transcription

## Common Tasks

### Adding a New API Endpoint
1. Create route in `apps/web/app/api/[path]/route.ts`
2. Use Next.js Route Handlers format
3. Add error handling and validation
4. Update tests if applicable

### Adding a New Component
1. Create in appropriate `components/` subdirectory
2. Include TypeScript props interface
3. Use Tailwind for styling
4. Add to Storybook if visual component

### Working with Oracle System
1. Oracle prompts in `app/api/backend/src/prompts/`
2. Oracle logic in `app/api/backend/src/oracle/`
3. Agent orchestration in `src/agents/`

### Testing Voice Features
```bash
npm run test:voice       # Voice prompt tests
./apps/web/test-voice-pipeline.sh  # Full voice pipeline
```

## Safety & Ethics

This system deals with psychological content and personal transformation. Always:
- Maintain appropriate boundaries in AI responses
- Never diagnose or provide medical/psychological advice
- Refer to safety protocols in `src/services/` for handling sensitive content
- Use the safety pipeline (`npm run safety:test`) when modifying AI prompts

## Notes

- The system uses "Maya" and "MAIA" interchangeably as the AI persona name
- Elemental associations are core to the user experience
- Voice-first interaction is a primary design goal
- Soulprint updates should be incremental, not destructive
