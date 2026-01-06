# Async Embeddings Deployment Appendix

## Render + Docker with a Separate Worker Service

This appendix describes deploying MAIA with **two services**:

1. **Web service** (Next.js API + UI)
2. **Worker service** (embedding queue consumer)

Both connect to the same Postgres database and (optionally) the same Ollama endpoint.

---

## 0) What this solves

* Web requests remain fast: **note save never waits on embeddings**
* Embeddings are generated independently by a worker, so:

  * worker can restart without affecting the web app
  * you can scale worker separately from web
  * backlog can rise briefly without breaking UX

---

## 1) Required assumptions

### You have:

* A Postgres database reachable from Render:

  * Render Postgres, Neon, Supabase Postgres, or self-hosted Postgres.
* Your migrations applied, including:

  * `case_memory_chunks` table with `vector(768)`
  * `embedding_jobs` queue table

### You need:

* An embeddings provider reachable from the worker:

  * **Option A (recommended for Render):** remote Ollama endpoint (hosted VM / node)
  * **Option B:** a containerized Ollama service (not ideal on Render; GPU + persistence constraints)
  * **Option C:** switch to a hosted embeddings provider (not sovereignty aligned; not recommended here)

**Important:** Render's web+worker containers can't "see" your laptop's Ollama at `localhost:11434`. "localhost" in Render means the container itself.

---

## 2) Environment variables (both services)

Set these in Render for both services.

### Must-have

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/maia_consciousness
MAIA_EMBEDDINGS_MODE=queue
```

### Ollama embeddings (worker must be able to reach this URL)

```bash
OLLAMA_BASE_URL=https://YOUR-OLLAMA-HOST:11434
OLLAMA_EMBED_MODEL=nomic-embed-text
```

### Optional tuning

```bash
EMBEDDING_MAX_ATTEMPTS=5
EMBEDDING_POLL_MS=400
EMBEDDING_BATCH_SIZE=1
```

If you add batch-claim later, `EMBEDDING_BATCH_SIZE` becomes meaningful.

---

## 3) Recommended topology on Render

### Service A: Web (Next.js)

* Type: **Web Service**
* Build command:

  * `npm install && npm run build`
* Start command:

  * `npm run start`
    *(or your existing render start command)*

### Service B: Worker (Embedding Worker)

* Type: **Background Worker**
* Build command:

  * `npm install && npm run build` *(if needed; or just install)*
* Start command (tsx):

  * `npx tsx scripts/embedding_worker.ts`

If your repo uses `ts-node` instead of `tsx`, substitute accordingly.

---

## 4) Docker approach (single repo, two processes)

There are two clean patterns:

### Pattern 1 (recommended): same Docker image, different start commands

Build one image. Use it for both Render services:

* Web uses `npm run start`
* Worker uses `npx tsx scripts/embedding_worker.ts`

This keeps dependencies consistent.

### Pattern 2: separate images

Only needed if you want a thinner worker image.

---

## 5) Example Dockerfile (works for both web + worker)

**`Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-bullseye AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build (Next, TS, etc.)
RUN npm run build

ENV NODE_ENV=production

# Render will override CMD per-service.
CMD ["npm", "run", "start"]
```

### Render settings

* Web service Start Command:

  * `npm run start`
* Worker service Start Command:

  * `npx tsx scripts/embedding_worker.ts`

If `tsx` isn't in prod deps, add it to `dependencies` (not devDependencies) or use `node dist/...` if you compile scripts.

---

## 6) Worker start command variants

### If `tsx` is available

```bash
npx tsx scripts/embedding_worker.ts
```

### If scripts are compiled to JS

If you build scripts into `dist/scripts/embedding_worker.js`:

```bash
node dist/scripts/embedding_worker.js
```

### If you want explicit env injected

```bash
MAIA_EMBEDDINGS_MODE=queue node dist/scripts/embedding_worker.js
```

(Usually Render handles env injection globally.)

---

## 7) Worker health + restart behavior

Render background workers:

* restart automatically on crash
* show logs in Render UI

### Best practice: "crash fast" on missing env

At worker startup:

* validate `DATABASE_URL`
* validate `OLLAMA_BASE_URL`
* validate embed model configured

If missing, exit non-zero so Render restarts after you fix env.

---

## 8) Common production pitfalls

### Pitfall A: Worker cannot reach Ollama

Symptom:

* jobs pile up (`pending` increases)
* worker logs show fetch failures / timeouts

Fix:

* ensure `OLLAMA_BASE_URL` is a public/reachable URL from Render
* if Ollama is behind a private network, create a tunnel or host it publicly on your node (secured)
* confirm from a Render shell or local test:

  * `curl https://YOUR-OLLAMA-HOST:11434/api/tags`

### Pitfall B: Postgres isn't reachable

Symptom:

* worker dies at boot
* errors like "connection refused" or auth failures

Fix:

* confirm DATABASE_URL is correct
* if using Render Postgres, use their internal URL
* if using external DB, ensure allowlist includes Render egress IPs (if required)

### Pitfall C: "vector(768)" mismatch

Symptom:

* embeddings insert fails
* type errors in db logs

Fix:

* confirm embed model is `nomic-embed-text`
* confirm `case_memory_chunks.embedding vector(768)`

---

## 9) Minimal verification procedure (Render)

After deployment:

### 1) Confirm web backlog endpoint works

```bash
curl -s https://YOUR-WEB-SERVICE/api/embeddings/backlog | cat
# {"ok":true,"pending":0}
```

### 2) Create a note in UI

Backlog should rise briefly (or stay low if worker is fast).

### 3) Confirm worker logs show processing

Look in Render Worker logs:

* "claimed job"
* "embedded chunk"
* "marked done"

### 4) Confirm backlog drains

Call backlog endpoint again:

* pending returns to 0

---

## 10) Recommended secure setup for remote Ollama

If you host Ollama on a VM/node:

### Baseline security

* Put Ollama behind:

  * nginx reverse proxy
  * basic auth or mTLS (preferred)
  * IP allowlist to Render egress if feasible

At minimum: don't expose an unauthenticated Ollama instance to the public internet.

---

## 11) Optional: scale worker horizontally

To increase throughput, you can scale the worker count:

* Render: run multiple worker instances
* Concurrency safety is provided by `FOR UPDATE SKIP LOCKED`

Rule of thumb:

* Start with 1 worker
* Add more if backlog persists under typical load

---

## 12) Optional: Add a "status breakdown" endpoint

Upgrade backlog endpoint to return counts by status (`pending`, `processing`, `error`, `done`) to make ops easier.

---

## 13) Render service definitions (human-readable)

### Web Service

* Name: `maia-web`
* Type: Web Service
* Docker: Yes
* Start: `npm run start`
* Env:

  * `DATABASE_URL`
  * `MAIA_EMBEDDINGS_MODE=queue`
  * (optional) `OLLAMA_BASE_URL` not required unless web does embeddings in sync mode anywhere else

### Worker Service

* Name: `maia-embed-worker`
* Type: Background Worker
* Docker: Yes
* Start: `npx tsx scripts/embedding_worker.ts`
* Env:

  * `DATABASE_URL`
  * `MAIA_EMBEDDINGS_MODE=queue`
  * `OLLAMA_BASE_URL`
  * `OLLAMA_EMBED_MODEL=nomic-embed-text`

---

## 14) Decision note: where should Ollama live?

### Best sovereignty + reliability

* Ollama on your **own node** (VM/metal) with stable storage and CPU/GPU
* Render worker calls it over the network

### Why not Ollama on Render?

* persistence and model storage are awkward
* GPU support is limited / expensive
* cold starts are painful

---

## 15) Quick "Copy/Paste" worker commands

**Worker start command:**

```bash
npx tsx scripts/embedding_worker.ts
```

**Backlog check:**

```bash
curl -s https://YOUR-WEB-SERVICE/api/embeddings/backlog | cat
```
