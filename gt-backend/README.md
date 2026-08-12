# GymTrakio — Gym Tracker Backend

Node + Express + MongoDB Atlas API for GymTrakio.

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
| `JWT_ACCESS_EXPIRES` | No       | `15m`   | Access token lifetime           |
| `JWT_REFRESH_EXPIRES`| No       | `7d`    | Refresh token lifetime          |
| `PORT`               | No       | `5000`  | HTTP server port                |
| `NODE_ENV`           | No       | —       | Set to `production` in prod     |
| `CORS_ORIGINS`       | Prod yes | —       | Comma-separated allowed frontend origins |

Example:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/gym-tracker?retryWrites=true&w=majority
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
# production example:
# NODE_ENV=production
# CORS_ORIGINS=https://app.example.com
```

Never commit `.env`.

## Conventions

### Entry points

- `src/server.js` — connect DB, then listen
- `src/app.js` — Express app (Helmet, CORS + credentials, cookies, JSON limit, logger, routes, errors)

### Config

- `src/config/env.js` — load and validate env vars
- `src/config/db.js` — Mongoose / Atlas connection

### Layers

| Folder             | Role                                |
| ------------------ | ----------------------------------- |
| `src/models/`      | Mongoose schemas                    |
| `src/controllers/` | Request handlers                    |
| `src/routes/`      | Express routers                     |
| `src/middleware/`  | Shared middleware (auth, validate, errors, …) |
| `src/validators/`  | Zod schemas per feature (request shape) |
| `src/utils/`       | Tokens, cookies, API response helpers |
| `src/scripts/`     | One-off scripts (seed)              |

- Keep route files thin; put logic in controllers
- One model file per collection (e.g. `User.js`)
- Mount API routes under `/api` from `routes/index.js`

### Request validation (Zod)

- Schemas live in `src/validators/`
- `validate(schema)` / `validate(schema, 'params')` in `src/middleware/validate.js` runs **before** the controller
- `.strict()` rejects unknown fields (stops clients injecting extra keys like `role`)
- On failure → `{ success: false, message: "Validation failed", errors: [{ field, message }] }`
- Controllers assume `req.body` / `req.params` are already cleaned

### Rate limiting

- `src/middleware/rateLimit.js` — per-IP limits via `express-rate-limit`
- `POST /api/auth/login` — 20 requests / 15 minutes
- `POST /api/auth/refresh` — 60 requests / 15 minutes
- `POST /api/auth/password` — 10 requests / 15 minutes
- `POST /api/splits/bulk` — 10 requests / 15 minutes
- `POST /api/users/list` — 60 requests / 1 minute
- Over limit → `429` with `{ success: false, message: "Too many requests, try again later" }`

### HTTP hardening

- **Helmet** — sets common security headers (e.g. `X-Content-Type-Options`, frame guards)
### CORS & cookies

- **Dev**: `localhost` / `127.0.0.1` (any port) allowed; optional `CORS_ORIGINS`
- **Prod** (`NODE_ENV=production`): `CORS_ORIGINS` required — only those origins + no-Origin tools
- Refresh cookie: `httpOnly`; `secure` + `sameSite: 'strict'` in production; `path: /api/auth`

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
    │   ├── User.js
    │   ├── Split.js
    │   ├── Workout.js
    │   ├── Exercise.js
    │   └── AppConfig.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── users.controller.js
    │   ├── splits.controller.js
    │   ├── workouts.controller.js
    │   ├── exercises.controller.js
    │   └── configs.controller.js
    ├── validators/
    │   ├── auth.validators.js
    │   ├── users.validators.js
    │   ├── splits.validators.js
    │   ├── workouts.validators.js
    │   ├── exercises.validators.js
    │   └── configs.validators.js
    ├── routes/
    │   ├── index.js
    │   ├── auth.routes.js
    │   ├── users.routes.js
    │   ├── splits.routes.js
    │   ├── workouts.routes.js
    │   ├── exercises.routes.js
    │   └── configs.routes.js
    ├── utils/
    │   ├── tokens.js
    │   ├── cookies.js
    │   └── apiResponse.js
    ├── scripts/
    │   └── seedAdmin.js
    └── middleware/
        ├── requestLogger.js
        ├── errorHandler.js
        ├── validate.js
        ├── rateLimit.js
        └── auth.js
```

## API routes

| Method | Path | Access | Success `data` |
| ------ | ---- | ------ | -------------- |
| `POST` | `/api/auth/login` | Public | `{ accessToken, user }` + refresh cookie |
| `POST` | `/api/auth/refresh` | Refresh cookie | `{ accessToken }` (rotates cookie) |
| `POST` | `/api/auth/logout` | Public | `null` — clears `sessionId` + refresh cookie |
| `GET` | `/api/auth/me` | Bearer access | `{ user }` |
| `PATCH` | `/api/auth/me` | Bearer access | `{ user }` — body `{ name }` |
| `POST` | `/api/auth/password` | Bearer access | `{ accessToken }` — body `{ currentPassword, newPassword }`; rotates session |
| `POST` | `/api/users/list` | Admin | `{ users: [...] }` — body `{ search }` (empty = all; matches name/email) |
| `POST` | `/api/users` | Admin | `{ user }` — body `{ name, email, password }` (password required, min 4) |
| `PATCH` | `/api/users/:id/status` | Admin | `{ user }` |
| `POST` | `/api/users/:id/reset-password` | Admin | `{ message }` — sets password to `GymTrakio123`, clears `sessionId` |
| `DELETE` | `/api/users/:id` | Admin | `null` (cascades splits/workouts/exercises; cannot delete admin or self) |
| `GET` | `/api/splits` | Auth | `{ splits: [{ …, workoutCount }] }` |
| `POST` | `/api/splits` | Auth | `{ split, activeSplitId }` — body `{ title }`; unique title per user; enforces max splits; first split becomes active |
| `POST` | `/api/splits/bulk` | Auth | `{ created: { splits, workouts, exercises } }` — body `{ splits: [{ title, workouts?: [{ title, exercises?: […] }] }] }` (max 20/20/20); rejects existing split titles; create-only; no activeSplit change |
| `PATCH` | `/api/splits/:id` | Auth | `{ split }` — body `{ title }`; unique title per user |
| `DELETE` | `/api/splits/:id` | Auth | `{ activeSplitId }` — cascades workouts/exercises; reassigns active if needed |
| `POST` | `/api/splits/:id/activate` | Auth | `{ activeSplitId, split }` |
| `GET` | `/api/splits/:splitId/workouts` | Auth | `{ workouts: [{ …, exerciseCount }] }` |
| `POST` | `/api/splits/:splitId/workouts` | Auth | `{ workout }` — body `{ title }`; enforces max workouts per split |
| `POST` | `/api/splits/:splitId/workouts/reset` | Auth | `null` — unmarks all workouts and exercises in split |
| `PATCH` | `/api/workouts/:id` | Auth | `{ workout }` — body `{ title?`, `done? }` |
| `DELETE` | `/api/workouts/:id` | Auth | `null` — cascades exercises |
| `GET` | `/api/workouts/:workoutId/exercises` | Auth | `{ exercises: [...] }` |
| `POST` | `/api/workouts/:workoutId/exercises` | Auth | `{ exercise }` — body `{ name, weight?, weightUnit?, description? }`; enforces max exercises per workout |
| `PATCH` | `/api/exercises/:id` | Auth | `{ exercise }` — body `{ name?`, `weight?`, `weightUnit?`, `description?`, `done? }` |
| `DELETE` | `/api/exercises/:id` | Auth | `null` |
| `GET` | `/api/configs` | Auth | `{ config }` — global create limits |
| `PATCH` | `/api/configs` | Admin | `{ config }` — body `{ maxSplits, maxWorkoutsPerSplit, maxExercisesPerWorkout }` (1–100) |

## Feature notes

- **DB**: MongoDB Atlas via Mongoose; success logged as `MongoDB connected`
- **CORS**: Dev allows localhost; prod requires `CORS_ORIGINS` allowlist; `credentials: true`
- **Cookies**: Refresh token `httpOnly`; prod uses `secure` + `sameSite: 'strict'`
- **Logging**: Each request logs `METHOD url status duration`; 4xx/5xx use `console.error`; unhandled errors log message + stack (5xx)
- **Auth**: Access JWT (default **15m**, Bearer); refresh JWT in `httpOnly` cookie `refreshToken` (default **7d**, path `/api/auth`). **Single session per user** via `User.sessionId` (`sid` in both tokens): new login replaces `sessionId` and invalidates other devices; logout sets `sessionId` to `null`; `requireAuth` and refresh both check `sid`
- **Users**: `role` `admin` \| `user`; `status` `active` \| `disabled`; `activeSplitId` (ObjectId \| null) — user’s current training split; password hashed with bcrypt; list via `POST /api/users/list` with `{ search }` (empty returns all; otherwise case-insensitive match on name or email); create always sets `role: 'user'` (not accepted from client); delete cascades that user’s splits/workouts/exercises and blocks admin/self
- **Profile**: `PATCH /api/auth/me` updates own `name` only
- **Password**: `POST /api/auth/password` requires current password; new password min 4 chars; rotates `sessionId` and returns new access + refresh cookie (other devices signed out)
- **Training models** (Split → Workout → Exercise): **Splits**, **Workouts**, and **Exercises** APIs implemented. Exercise stores `weight` + `weightUnit` (`kg` | `lb`, default `kg`) per exercise. `User.activeSplitId` refs `Split`. `AppConfig` singleton holds global create limits (`maxSplits`, `maxWorkoutsPerSplit`, `maxExercisesPerWorkout`; default 20 each, range 1–100); ensured on server boot via `AppConfig.ensureDefaults()`. **Configs API**: `GET /api/configs` (any auth user), `PATCH /api/configs` (admin). Creates enforce limits; deletes cascade children; delete split reassigns `activeSplitId`. **Bulk import** `POST /api/splits/bulk`: create-only; Zod caps 20 splits / 20 workouts / 20 exercises; rejects if any split title already exists (case-insensitive); creates listed workouts/exercises (duplicate workout/exercise names allowed); empty `workouts`/`exercises` arrays allowed; if any limit would be exceeded → add nothing; does not change `activeSplitId`; transactional write. Split titles are unique per user on create/rename. Reset progress unmarks all workouts and exercises in the split.
- **Validation**: Zod on login / list / create / profile / password / `:id` params; unknown body keys rejected; create user requires `password` (min 4); admin reset password sets `GymTrakio123` and clears `sessionId`
- **Rate limits**: login 20/15min; refresh 60/15min; change password 10/15min; bulk import 10/15min; users list 60/min (per IP)
- **HTTP hardening**: Helmet security headers; JSON body max `32kb` (413 if larger); prod 500s return generic message only
- **Seed**: `npm run seed:admin` → admin user (see `seedAdmin.js`)
