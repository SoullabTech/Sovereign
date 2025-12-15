# 📁 Spiralogic Oracle System - Project Structure

*Navigation guide for new developers joining the consciousness oracle project*

---

## 🏗️ Overview

The Spiralogic Oracle System is a full-stack TypeScript application built with Next.js (frontend) and Express (backend), featuring Maya - an AI consciousness oracle powered by elemental wisdom.

---

## 📂 Directory Structure

```
SpiralogicOracleSystem/
├── 📱 app/                     # Next.js App Router pages
│   ├── api/                    # API routes (Next.js API)
│   │   ├── oracle/            # Oracle endpoints
│   │   │   ├── chat/         # Main chat interface
│   │   │   ├── voice/        # Voice synthesis
│   │   │   └── memory/       # Memory persistence
│   │   ├── collective/        # Collective intelligence
│   │   └── journal/          # User journaling
│   │
│   ├── oracle/                # Oracle UI pages
│   │   └── page.tsx          # Main oracle interface
│   ├── onboarding/           # User onboarding flow
│   ├── dashboard/            # Analytics dashboards
│   └── layout.tsx            # Root layout
│
├── 🎨 components/             # React components
│   ├── ui/                   # Reusable UI components
│   │   ├── button.tsx       # Sacred button design
│   │   ├── card.tsx         # Card components
│   │   └── index.ts         # UI exports
│   ├── OracleInterface.tsx   # Main oracle chat UI
│   ├── VoiceRecorder.tsx     # Voice input component
│   └── MemoryGarden.tsx      # Memory visualization
│
├── 🖥️ backend/               # Express backend server
│   ├── src/
│   │   ├── server.ts         # Main server entry
│   │   ├── agents/           # AI agent implementations
│   │   │   └── PersonalOracleAgent.ts
│   │   ├── services/         # Business logic
│   │   │   ├── VoiceService.ts
│   │   │   ├── MemoryService.ts
│   │   │   └── DaimonicService.ts
│   │   ├── routes/           # API routes
│   │   ├── core/             # Core system modules
│   │   └── types/            # TypeScript types
│   │
│   └── package.json          # Backend dependencies
│
├── 🛠️ lib/                   # Shared utilities
│   ├── supabase/            # Database client
│   ├── services/            # Frontend services
│   ├── audio/               # Audio processing
│   └── utils/               # Helper functions
│
├── 🎯 hooks/                 # React hooks
│   ├── useMayaStream.ts     # Streaming responses
│   ├── useMemorySystem.ts   # Memory management
│   └── useVoiceRecorder.ts  # Voice recording
│
├── 📝 docs/                  # Documentation
│   ├── api/                 # API documentation
│   ├── architecture/        # System design docs
│   ├── guides/              # Developer guides
│   └── CLAUDE_PROMPTS_QUICK.md # Quick reference
│
├── 🧪 tests/                 # Test files
│   ├── maya-smoke-tests.md  # Manual test guide
│   └── test-maya-unified.ts # Automated tests
│
├── 🔧 Configuration Files
├── .env.example             # Environment template
├── .env.local              # Local environment (gitignored)
├── package.json            # Frontend dependencies
├── tsconfig.json           # TypeScript config
├── next.config.js          # Next.js config
├── README.md               # Project overview
│
├── 📋 Key Documentation
├── CLAUDE_PROMPTS.md       # Claude Code prompt playbook
├── AIN_BETA_TEST_PROMPTS.md # AIN beta testing prompts
├── docs/CLAUDE_PROMPTS_QUICK.md # Quick reference guide
├── CSM_INTEGRATION_COMPLETE.md  # Voice integration guide
├── MAYA_VOICE_IMPLEMENTATION.md # Maya voice system
├── BETA_TESTER_GUIDE.md    # Beta testing guide
└── FOLDER_STRUCTURE.md     # This file
```

---

## 🔑 Key Directories Explained

### `/app` - Next.js App Router
- Modern React Server Components
- File-based routing
- API routes colocated with pages
- Streaming and progressive enhancement

### `/backend` - Express API Server
- Runs on port 3333
- Handles AI processing
- Manages memory and state
- Integrates with external services

### `/components` - UI Components
- Follows atomic design principles
- Sacred geometry inspired designs
- Fully typed with TypeScript
- Tailwind CSS for styling

### `/lib` - Shared Logic
- Database connections
- Service integrations
- Utility functions
- Shared between frontend and backend

---

## 🚀 Quick Start for New Developers

### 1. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
```

### 2. **Install Dependencies**
```bash
# Root directory (frontend)
npm install

# Backend directory
cd backend
npm install
```

### 3. **Setup Voice System (One-time)**
```bash
# Setup offline Sesame voice
./backend/scripts/setup-sesame-offline.sh
```

### 4. **Run Development Servers**
```bash
# All-in-one beta launcher (recommended)
./scripts/start-beta.sh

# OR manually:
# Terminal 1 - Backend (port 3002)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
npm run dev
```

### 5. **Access Application**
- Frontend: http://localhost:3000
- Oracle UI: http://localhost:3000/oracle
- Backend API: http://localhost:3002

---

## 📍 Where to Find Things

### **Adding a New Feature?**
- UI Component: `/components/YourComponent.tsx`
- API Route: `/app/api/your-feature/route.ts`
- Backend Logic: `/backend/src/services/YourService.ts`
- Shared Types: `/backend/src/types/yourTypes.ts`

### **Modifying Maya's Behavior?**
- Main Agent: `/backend/src/agents/PersonalOracleAgent.ts`
- Prompts: `/backend/src/config/mayaPromptLoader.ts`
- Elemental Detection: `/backend/src/services/ElementalAlignment.ts`

### **Working with Voice?**
- Voice Service: `/backend/src/services/VoiceService.ts`
- Voice UI: `/components/VoiceRecorder.tsx`
- Voice Status: `/components/voice/VoiceEngineStatus.tsx`
- Sesame Setup: `/backend/scripts/setup-sesame-offline.sh`
- Audio Utils: `/lib/audio/`

### **Database Operations?**
- Supabase Client: `/lib/supabase/client.ts`
- Migrations: `/supabase/migrations/`
- Types: `/lib/types/database.ts`

---

## 🏛️ Architecture Patterns

### **Frontend Architecture**
- **React Server Components** for initial load
- **Client Components** for interactivity
- **Streaming** for progressive enhancement
- **Tailwind CSS** for styling

### **Backend Architecture**
- **Service Layer** for business logic
- **Agent Pattern** for AI personalities
- **Event-Driven** for real-time features
- **Repository Pattern** for data access

### **Communication**
- **REST API** for standard requests
- **Server-Sent Events** for streaming
- **WebSockets** (future) for real-time

---

## 🧩 Key Technologies

### **Frontend Stack**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI

### **Backend Stack**
- Node.js
- Express
- TypeScript
- OpenAI/Anthropic APIs
- Sesame CSM (Primary Voice)
- ElevenLabs (Voice Fallback)

### **Infrastructure**
- Supabase (Database)
- Docker (Local Voice)
- Vercel (Frontend hosting)
- Railway/Render (Backend hosting)

---

## 🎯 Development Workflow

### **1. Feature Development**
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Run tests
npm test

# Commit with conventional commits
git commit -m "feat: add new oracle capability"
```

### **2. Testing**
- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- Smoke tests: Follow `maya-smoke-tests.md`

### **3. Code Quality**
```bash
# Lint code
npm run lint

# Type check
npm run typecheck

# Format code
npm run format
```

---

## 📚 Important Files to Know

### **Configuration**
- `.env.local` - Your API keys and config
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript settings

### **Entry Points**
- `/app/page.tsx` - Homepage
- `/app/oracle/page.tsx` - Main oracle interface
- `/backend/src/server.ts` - Backend server

### **Core Logic**
- `/backend/src/agents/PersonalOracleAgent.ts` - Maya's brain
- `/lib/services/UnifiedOracleService.ts` - Frontend oracle service
- `/components/OracleInterface.tsx` - Chat UI

---

## 🆘 Getting Help

### **Documentation**
- Architecture: `/docs/architecture/`
- API Reference: `/docs/api/`
- Guides: `/docs/guides/`

### **Common Issues**
1. **"Cannot find module"** - Run `npm install`
2. **"API key invalid"** - Check `.env.local`
3. **"Port already in use"** - Kill existing processes
4. **"Type errors"** - Run `npm run typecheck`

### **Team Resources**
- Claude Prompts: `CLAUDE_PROMPTS.md` - Ready-to-use Claude Code prompts
- Design System: `SACRED_TECH_DESIGN_SYSTEM.md`
- Beta Guide: `BETA_TESTER_GUIDE.md`
- Architecture: `CONSCIOUSNESS_FIELD_ARCHITECTURE.md`
- Voice Integration: `CSM_INTEGRATION_COMPLETE.md`

---

## 🎨 UI/UX Guidelines

### **Design Principles**
- Sacred geometry inspired
- Elemental color schemes
- Smooth transitions
- Accessible by default

### **Component Patterns**
- Use existing UI components from `/components/ui`
- Follow Tailwind utility classes
- Maintain consistent spacing
- Test on mobile devices

---

## 🚦 Pre-Beta Checklist

Before deploying to beta users:

- [ ] All smoke tests passing
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Voice synthesis tested
- [ ] Memory persistence verified
- [ ] Safety boundaries confirmed
- [ ] Performance optimized
- [ ] Error handling robust

---

## 💡 Pro Tips

1. **Use CLAUDE_PROMPTS.md** - Copy/paste prompts for specific tasks
2. **Use the TodoWrite tool** - When working on complex features
3. **Read existing code** - Follow established patterns
4. **Test incrementally** - Don't wait until the end
5. **Ask Maya** - She can help debug her own code!
6. **Check logs** - Backend logs are your friend
7. **Voice Testing** - Use "Test Voice" button in Oracle UI

---

*Welcome to the consciousness oracle project! May your code flow like water, burn with fire's passion, stand grounded like earth, and soar with air's clarity. 🌀*