# IronLog — Gym Tracker Backend

Node + Express + MongoDB Atlas API for IronLog.

Currently boots Express and connects to MongoDB Atlas (logs `MongoDB connected` on success). Routes, models, and auth come next.

## Scripts

```bash
npm install
npm run dev
npm start
```

## Docker

From the parent folder (`gym-traker-full-stack-mern`):

```bash
# ensure gt-backend/.env has MONGODB_URI
docker compose up --build
docker compose watch
docker compose down
```

See parent `compose.yaml`. This service is built from `Dockerfile` in this folder. Compose loads env from `gt-backend/.env`.

## Setup

1. Copy `.env.example` to `.env` (or create `.env` manually)
2. Set `MONGODB_URI` to your Atlas connection string
3. Run `npm run dev` (local) or use Docker from the parent folder

### Environment

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | — | MongoDB Atlas connection string |
| `PORT` | No | `5000` | HTTP server port |

Example:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/gym-tracker?retryWrites=true&w=majority
```

Never commit `.env`.

## Conventions

### Entry points

- `src/server.js` — connect DB, then listen
- `src/app.js` — Express app (middleware and routes mount here later)

### Config

- `src/config/env.js` — load and validate env vars
- `src/config/db.js` — Mongoose / Atlas connection

### Layers (when adding features)

| Folder | Role |
|--------|------|
| `src/models/` | Mongoose schemas |
| `src/controllers/` | Request handlers |
| `src/routes/` | Express routers |
| `src/middleware/` | Shared middleware (auth, errors, …) |

- Keep route files thin; put logic in controllers
- One model file per collection (e.g. `User.js`)
- Mount API routes under `/api` from a root router when routes are added

### Modules

- Use ES modules (`"type": "module"`)
- Prefer named exports for helpers; default export for the Express `app`

### README

**Update this file whenever the project structure changes** (new route, model, middleware, or folder rename).

## Project structure

```
gt-backend/
├── package.json
├── README.md
├── Dockerfile
├── .dockerignore
├── .env.example
├── .gitignore
├── .cursorignore
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── env.js
    │   └── db.js
    ├── models/
    ├── controllers/
    ├── routes/
    └── middleware/
```

## Feature notes

- **DB**: MongoDB Atlas via Mongoose; success logged as `MongoDB connected`
- **API**: Express app scaffold only — no routes yet
- **Auth / workouts**: not implemented yet (will land under `models`, `routes`, `controllers`)
