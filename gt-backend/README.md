# IronLog — Gym Tracker Backend

Node + Express + MongoDB Atlas API for IronLog.

Currently boots Express and connects to MongoDB Atlas (logs `MongoDB connected` on success). Routes, models, and auth come next.

## Scripts

```bash
npm install
npm run dev
npm start
```

## Formatting

Root Prettier config (`.prettierrc.json`) applies to this app. Format from the monorepo root:

```bash
npm run format
```

## Docker

From the parent folder (`gym-traker-full-stack-mern`):

```bash
# ensure gt-backend/.env has MONGODB_URI
docker compose up --build
docker compose watch
docker compose logs -f api
docker compose down
```

`docker compose logs -f api` streams request and error logs from the API container. Without Docker, logs appear in the terminal running `npm run dev`.

See parent `compose.yaml`. This service is built from `Dockerfile` in this folder. Compose loads env from `gt-backend/.env`.

## Setup

1. Copy `.env.example` to `.env` (or create `.env` manually)
2. Set `MONGODB_URI` to your Atlas connection string
3. Run `npm run dev` (local) or use Docker from the parent folder

### Environment

| Variable      | Required | Default | Description                     |
| ------------- | -------- | ------- | ------------------------------- |
| `MONGODB_URI` | Yes      | —       | MongoDB Atlas connection string |
| `PORT`        | No       | `5000`  | HTTP server port                |

Example:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/gym-tracker?retryWrites=true&w=majority
```

Never commit `.env`.

## Conventions

### Entry points

- `src/server.js` — connect DB, then listen
- `src/app.js` — Express app (CORS, JSON body, request logger, error handler)

### Config

- `src/config/env.js` — load and validate env vars
- `src/config/db.js` — Mongoose / Atlas connection

### Layers (when adding features)

| Folder             | Role                                |
| ------------------ | ----------------------------------- |
| `src/models/`      | Mongoose schemas                    |
| `src/controllers/` | Request handlers                    |
| `src/routes/`      | Express routers                     |
| `src/middleware/`  | Shared middleware (auth, errors, …) |

- Keep route files thin; put logic in controllers
- One model file per collection (e.g. `User.js`)
- Mount API routes under `/api` from a root router when routes are added

### Modules

- Use ES modules (`"type": "module"`)
- Prefer named exports for helpers; default export for the Express `app`

### README

**When needed, make sure to update this file** — project structure, env vars, conventions, or feature notes whenever those change (new/removed route, model, middleware, or folder rename).

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
        ├── requestLogger.js
        └── errorHandler.js
```

## Feature notes

- **DB**: MongoDB Atlas via Mongoose; success logged as `MongoDB connected`
- **API**: Express scaffold — CORS + JSON body parser + request/error logging; no routes yet
- **CORS**: Allows requests with no Origin, or from `localhost` / `127.0.0.1` on any port
- **Logging**: Each request logs `METHOD url status duration`; 4xx/5xx use `console.error`; unhandled errors log message + stack
- **Auth / workouts**: not implemented yet (will land under `models`, `routes`, `controllers`)
