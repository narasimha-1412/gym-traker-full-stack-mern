# GymTrakio

A mobile-first gym workout tracker. Plan training **splits**, add **workouts** and **exercises** to each, mark them done as you train, and track progress from the dashboard.

**Live demo (Vue):** https://gymtrakio-web.onrender.com/

> Hosted on Render's free tier — the first request after idle may take ~30–60 seconds while the API wakes up.

## Features

- Splits → workouts → exercises (weight, unit, notes) with done/progress tracking and cycle reset
- Bulk import of splits with nested workouts and exercises
- Admin panel: manage users, enable/disable accounts, reset passwords, set global create limits
- Secure auth: short-lived JWT access token in memory + rotating httpOnly refresh cookie, single active session per user
- API hardening: Zod validation, per-route rate limiting, Helmet, strict CORS

## Tech stack

| Layer    | Tech                                                                       |
| -------- | -------------------------------------------------------------------------- |
| Frontend | Vue 3, Vuetify, Pinia, Vue Router, Axios, Vite (`gt-frontend`)             |
| Frontend | React, MUI, Redux Toolkit, React Router, Axios, Vite (`gt-frontend-react`) |
| Backend  | Node.js, Express 5, MongoDB (Mongoose), JWT, Zod                           |
| DevOps   | Docker, Docker Compose, Render                                             |

## Project structure

```
gym-traker-full-stack-mern/
├── gt-backend/         # Express REST API
├── gt-frontend/        # Vue 3 SPA
├── gt-frontend-react/  # React SPA (same API)
└── compose.yaml        # Runs API + both frontends with Docker
```

## Run locally

```bash
# 1. Configure the backend
cp gt-backend/.env.example gt-backend/.env   # set MONGODB_URI and JWT secrets

# 2. Start all apps
docker compose up --build

# 3. Create the default admin (once)
cd gt-backend && npm install && npm run seed:admin
```

Vue: http://localhost:5173 · React: http://localhost:5174 · API: http://localhost:5000

Both frontends talk to the same API. In production, add each SPA origin to the API’s `CORS_ORIGINS` (comma-separated).

See [gt-backend/README.md](gt-backend/README.md), [gt-frontend/README.md](gt-frontend/README.md), and [gt-frontend-react/README.md](gt-frontend-react/README.md) for routes, env vars and conventions.
