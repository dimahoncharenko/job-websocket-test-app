# Websocket project

A full-stack wellness onboarding application demonstrating two job-processing patterns — real-time **WebSocket** updates and **HTTP polling** — backed by a Node.js/Express + PostgreSQL server and a Next.js frontend.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│  Onboarding flow (3 steps)                              │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐     │
│  │ WishPage │→ │WeightPage│→ │      JobPage       │     │
│  └──────────┘  └──────────┘  ├────────────────────┤     │
│                              │ WebSocket mode     │     │
│                              │ HTTP polling mode  │     │
│                              └────────────────────┘     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP (REST) + WebSocket (ws://)
┌────────────────────▼────────────────────────────────────┐
│                Express + WS Server (:4000)              │
│  POST /jobs          – create job                       │
│  POST /jobs/:id      – start job (HTTP path)            │
│  GET  /jobs/:id      – poll job status                  │
│  WS   proceed-job    – start job (WebSocket event)      │
│  WS   job-progress   – real-time progress events        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│        PostgreSQL  –  jobs table                        │
│   id · status · progress · created_at                   │
└─────────────────────────────────────────────────────────┘
```

---

## Application Flow

### Step 1 — Wish selection

The user picks a main goal from a predefined list (e.g. a fitness objective).

### Step 2 — Weight input

The user enters current and target weight. The unit can be toggled between **kg** and **lbs**.

### Step 3 — Job processing

The user launches the job in one of two modes:

#### WebSocket mode

1. Frontend creates a job via `POST /jobs` (status: `queued`).
2. Opens a WebSocket connection to the backend.
3. Sends `{ event: "proceed-job", jobId }`.
4. Server transitions the job to `processing` and runs a 7-step pipeline (~17 s total).
5. Each completed step emits a `job-progress` event with updated `status` and `progress` (0–100 %).
6. Frontend displays a circular SVG progress ring with a smooth animated counter. Respects `prefers-reduced-motion` — disables animation when set.
7. If the socket closes mid-job the server marks it as `failed`.

#### HTTP polling mode

1. Frontend creates a job via `POST /jobs`.
2. Calls `POST /jobs/:id` to start processing.
3. Polls `GET /jobs/:id` every **1.5 s** until `status` is `done` or `failed`.
4. Frontend shows an indeterminate progress bar during polling.

**Job status states:** `idle → queued → processing → done / failed`

On failure, clicking **Try again** resets to the `idle` state (launch screen) without navigating away from the job page.

---

## Job Processing Pipeline (server-side)

Seven sequential steps, each simulating real async work:

| #   | Description               | Delay     |
| --- | ------------------------- | --------- |
| 1   | Spinning up the engines   | 800 ms    |
| 2   | Data preprocessed         | 1 200 ms  |
| 3   | Running integrity checks  | 1 000 ms  |
| 4   | Crunching the numbers     | 10 800 ms |
| 5   | Webhook notified          | 900 ms    |
| 6   | Cleaning up the workspace | 600 ms    |
| 7   | Job finished              | 500 ms    |

Progress is calculated as `(completedSteps / totalSteps) * 100` and persisted to the database after every step.

---

## Tech Stack

| Layer    | Technology                                           |
| -------- | ---------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4    |
| Backend  | Node.js, Express 4, `ws` 8, TypeScript               |
| Database | PostgreSQL (single `jobs` table)                     |
| Testing  | Vitest + React Testing Library (both workspaces)     |
| CI       | GitHub Actions — tests on PR, manual deploy workflow |
| Hosting  | Firebase Hosting (frontend) · Render (backend)       |

---

## Environment Variables

**Frontend** — `frontend/.env.development` (local dev):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

**Frontend** — `frontend/.env.production` (used by `next build`):

```
NEXT_PUBLIC_API_URL=https://<render-service-backend-url>
NEXT_PUBLIC_WS_URL=wss://<render-service-backend-url>
```

**Backend** (`server/.env`):

```
PORT=4000
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://<firebase-hosting-url>
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL instance running and accessible via `DATABASE_URL`

### Backend

```bash
cd server
npm install
npm run dev     # hot-reload via tsx watch
# or
npm run build && npm run start   # production
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000 — uses .env.development
# or
npm run build && npm run start   # uses .env.production
```

### Running tests

```bash
cd server   && npm test
cd frontend && npm test
```

---

## Deployment

### Backend — Render

The backend is deployed as a **Web Service** on [Render](https://render.com).

Required environment variables in Render dashboard:

| Variable       | Value                                                 |
| -------------- | ----------------------------------------------------- |
| `PORT`         | set automatically by Render                           |
| `DATABASE_URL` | connection string to a PostgreSQL instance            |
| `CORS_ORIGIN`  | Firebase Hosting URL (e.g. `https://project.web.app`) |

Build command: `npm install && npm run build`  
Start command: `npm run start`

### Frontend — Firebase Hosting

The frontend is a static export deployed to [Firebase Hosting](https://firebase.google.com/docs/hosting).

**Manual deploy:**

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

**CI/CD (GitHub Actions):**

The workflow at `.github/workflows/deploy-frontend.yml` can be triggered manually from the GitHub Actions tab. It requires the following repository secrets:

| Secret                | Value                                           |
| --------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `https://<render-service-backend-url>`          |
| `NEXT_PUBLIC_WS_URL`  | `wss://<render-service-backend-url>`            |
| `FIREBASE_TOKEN`      | obtained by running `firebase login:ci` locally |

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS jobs (
  id         SERIAL PRIMARY KEY,
  status     VARCHAR(20)  NOT NULL DEFAULT 'queued',
  progress   INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

The table is created automatically on server start if it does not exist.

---

## Project Structure

```
project-structure/
├── frontend/
│   └── src/
│       ├── app/                      # Next.js app router
│       ├── components/               # Shared UI (ThemeButton, WeightInput, Testimonial)
│       ├── modules/
│       │   └── onboarding/
│       │       ├── pages/            # WishPage, WeightPage, JobPage
│       │       ├── components/       # JobProcessingWebSocket, JobProcessingHTTP, …
│       │       ├── hooks/            # useJobRunner, useWeightForm, useWishSelection
│       │       └── context/          # JobStatusContext
│       └── services/
│           └── jobs.ts               # Jobs HTTP service
└── server/
    └── src/
        ├── index.ts                  # Express + WebSocket server bootstrap
        ├── apis/jobs.ts              # HTTP route handlers
        ├── providers/
        │   ├── db.ts                 # PostgreSQL pool & schema init
        │   └── ws.ts                 # WebSocket connection handler
        ├── services/
        │   ├── jobs.ts               # Jobs CRUD & runJob orchestration
        │   └── ws-handlers.ts        # WebSocket event handlers
        └── workers/process-job/
            ├── index.ts              # Pipeline executor
            └── steps.ts              # Step definitions
```
