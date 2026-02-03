# 🔮 Spiralogic Oracle System

An adaptive AI-powered coaching and archetypal reflection platform built with Next.js (frontend) and Express + TypeScript (backend).

---

## 📦 Monorepo Structure

```bash
SpiralogicOracleSystem/
├── oracle-frontend/     # Next.js frontend (App Router)
└── oracle-backend/      # Express + TypeScript backend API
```

---

## 🧪 Getting Started

### 📁 Backend (`oracle-backend`)

```bash
cd oracle-backend
npm install
npm run dev
```

Server starts at `http://localhost:3001` (or as configured).

### 🌐 Frontend (`oracle-frontend`)

```bash
cd oracle-frontend
npm install
npm run dev
```

Frontend served at `http://localhost:3000`

---

## 🧙‍♀️ Key Features

- Elemental AI mentors (Fire, Water, Earth, Air, Aether)
- Dream timeline + archetypal journaling
- Real-time emotion detection + shadow prompts
- Symbolic interpretation (Tarot, Astrology)
- Modular agent system via `personalOracleAgent.ts`

---

## 🧹 Useful Scripts

```bash
# Run in either backend or frontend to remove macOS junk
npm run clean:mac
```

---

## 🔐 Environment Setup

Create a `.env` file in each directory as needed:

```bash
# oracle-backend/.env
PORT=3001
SECRET_KEY=your-secret
```

```bash
# oracle-frontend/.env.local
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

---

## 📜 License

MIT — Build wisely, share freely, honor the path ✨# Deploy trigger
