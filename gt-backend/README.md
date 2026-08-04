# IronLog — Gym Tracker Backend

Node + Express + MongoDB Atlas API for IronLog.

Boots Express, connects to MongoDB Atlas, and exposes auth + users APIs (JWT access token + httpOnly refresh cookie).

## Scripts

```bash
npm install
npm run dev
npm start
npm run seed:admin
```

## Formatting

Root Prettier config (`.prettierrc.json`) applies to this app. Format from the monorepo root:

```bash
npm run format
```

## Docker

From the parent folder (`gym-traker-full-stack-mern`):

```bash
# ensure gt-backend/.env has MONGODB_URI + JWT secrets
docker compose up --build
docker compose watch
docker compose logs -f api
docker compose down
```

`docker compose logs -f api` streams request and error logs from the API container. Without Docker, logs appear in the terminal running `npm run dev`.

See parent `compose.yaml`. This service is built from `Dockerfile` in this folder. Compose loads env from `gt-backend/.env`.

## Setup

1. Copy `.env.example` to `.env` (or create `.env` manually)
2. Set `MONGODB_URI` and JWT secrets
3. Run `npm run seed:admin` once to create the default admin
4. Run `npm run dev` (local) or use Docker from the parent folder

### Environment

| Variable             | Required | Default | Description                     |
| -------------------- | -------- | ------- | ------------------------------- |
| `MONGODB_URI`        | Yes      | —       | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET`  | Yes      | —       | Secret for access JWTs          |
| `JWT_REFRESH_SECRET` | Yes      | —       | Secret for refresh JWTs         |
| `JWT_ACCESS_EXPIRES` | No       | `2m`    | Access token lifetime           |
| `JWT_REFRESH_EXPIRES`| No       | `7d`    | Refresh token lifetime          |
| `PORT`               | No       | `5000`  | HTTP server port                |

Example:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/gym-tracker?retryWrites=true&w=majority
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRES=2m
JWT_REFRESH_EXPIRES=7d
```

Never commit `.env`.

## Conventions

### Entry points

- `src/server.js` — connect DB, then listen
- `src/app.js` — Express app (CORS + credentials, cookies, JSON, logger, routes, errors)

### Config

- `src/config/env.js` — load and validate env vars
- `src/config/db.js` — Mongoose / Atlas connection

### Layers

| Folder             | Role                                |
| ------------------ | ----------------------------------- |
| `src/models/`      | Mongoose schemas                    |
| `src/controllers/` | Request handlers                    |
| `src/routes/`      | Express routers                     |
| `src/middleware/`  | Shared middleware (auth, errors, …) |
| `src/utils/`       | Tokens, cookies, API response helpers |
| `src/scripts/`     | One-off scripts (seed)              |

- Keep route files thin; put logic in controllers
- One model file per collection (e.g. `User.js`)
- Mount API routes under `/api` from `routes/index.js`

### API response envelope

All JSON responses use a consistent envelope:

**Success**
```json
{ "success": true, "data": { ... } }
```

**Error**
```json
{ "success": false, "message": "Human-readable error", "errors": [{ "field": "email", "message": "..." }] }
```

Helpers live in `src/utils/apiResponse.js` (`sendSuccess`, `sendFail`). HTTP status codes still reflect the outcome (200, 201, 400, 401, 403, 404, 409, 500). `errors` is optional on failure responses.

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
    │   └── User.js
    ├── controllers/
    │   ├── auth.controller.js
    │   └── users.controller.js
    ├── routes/
    │   ├── index.js
    │   ├── auth.routes.js
    │   └── users.routes.js
    ├── utils/
    │   ├── tokens.js
    │   ├── cookies.js
    │   └── apiResponse.js
    ├── scripts/
    │   └── seedAdmin.js
    └── middleware/
        ├── requestLogger.js
        ├── errorHandler.js
        └── auth.js
```

## API routes

| Method | Path | Access | Success `data` |
| ------ | ---- | ------ | -------------- |
| `POST` | `/api/auth/login` | Public | `{ accessToken, user }` + refresh cookie |
| `POST` | `/api/auth/refresh` | Refresh cookie | `{ accessToken }` (rotates cookie) |
| `POST` | `/api/auth/logout` | Public | `null` (clears refresh cookie) |
| `GET` | `/api/auth/me` | Bearer access | `{ user }` |
| `GET` | `/api/users` | Admin | `{ users: [...] }` |
| `POST` | `/api/users` | Admin | `{ user }` (default password `IronLog123`) |
| `PATCH` | `/api/users/:id/status` | Admin | `{ user }` |
| `POST` | `/api/users/:id/reset-password` | Admin | `{ message }` |

## Feature notes

- **DB**: MongoDB Atlas via Mongoose; success logged as `MongoDB connected`
- **CORS**: Allows no Origin or `localhost` / `127.0.0.1` (any port); `credentials: true` for refresh cookies
- **Logging**: Each request logs `METHOD url status duration`; 4xx/5xx use `console.error`; unhandled errors log message + stack
- **Auth**: Access JWT (default 2m, send as `Authorization: Bearer`); refresh JWT in `httpOnly` cookie `refreshToken` (path `/api/auth`)
- **Users**: `role` `admin` \| `user`; `status` `active` \| `disabled`; password hashed with bcrypt
- **Seed**: `npm run seed:admin` → `alex@rivera.com` / `IronLog123` (admin)
- **Workouts**: not implemented yet
