# GymTrakio — Gym Tracker Frontend

Vue 3 + Vuetify + Pinia + Vue Router mobile-first UI for GymTrakio.

Auth talks to the Express API: access JWT in memory, refresh JWT in an httpOnly cookie.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Formatting

Root Prettier config (`.prettierrc.json`) applies to this app. Format from the monorepo root:

```bash
npm run format
```

## Docker

From the parent folder (`gym-traker-full-stack-mern`):

```bash
docker compose up --build
docker compose watch
docker compose down
```

Vite is configured with `server.host: true` so the container is reachable at `http://localhost:5173`. Compose sets `VITE_API_URL` for the web service.

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL` (default `http://localhost:5000`)
3. Ensure the backend is running and seeded (`npm run seed:admin` in `gt-backend`)

### Environment

| Variable       | Required | Default                 | Description        |
| -------------- | -------- | ----------------------- | ------------------ |
| `VITE_API_URL` | No       | `http://localhost:5000` | Backend API origin |

In production, the page origin must be listed in the API’s `CORS_ORIGINS`, and `VITE_API_URL` must point at that API (HTTPS). Auth uses cookies (`withCredentials`), so CORS cannot be `*`.

## Conventions

### Pages

- Each screen lives under `src/pages/<pageName>/`
- Page file name: `<PageName>Page.vue` (e.g. `LoginPage.vue`)
- Pages own layout for that screen and wire up the matching store
- Navigation uses Vue Router (`src/router/index.js`); helpers live on `app.store.js`

### Components

- Shared / reusable UI lives flat under `src/components/` (e.g. `AppSnackbar.vue`, `AppLoader.vue`, `AppConfirm.vue`)
- Page-specific components live next to their page under `src/pages/<pageName>/` (e.g. `pages/dashboard/WorkoutCard.vue`)
- Do not create per-page folders under `components/`

### Networks (API layer)

Call chain: **store → `*.services.js` → `base/api.js` → `base/appAxios.js` → backend**.

- `src/networks/base/appAxios.js` — Axios instance (`withCredentials`, Bearer access token, refresh-on-401)
- `src/networks/base/accessToken.js` — in-memory access token (not localStorage)
- `src/networks/base/api.js` — thin `get` / `post` / `put` / `patch` / `delete` wrappers
- `src/networks/base/apiRoutes.js` — path constants and builders only (no HTTP)
- `src/networks/auth.services.js` / `users.services.js` / `configs.services.js` / `splits.services.js` / `workouts.services.js` / `exercises.services.js` — named functions (route + method + payload)
- Paths live only in `apiRoutes.js`; HTTP only in services; loading / snackbars stay in stores
- Pages stay presentational; do not call Axios from Vue components
- `src/networks/base/envelope.js` — unwrap `{ success, data }` responses; `apiMessage()` for errors
- Backend returns `{ success, data }` on success and `{ success: false, message, errors? }` on error; stores unwrap via `getData(res)`
- `apiMessage(err)` surfaces Zod field errors, rate-limit (`429`), and oversized body (`413`) for snackbars
- Search text is capped at 100 chars client-side to match API validation
- Create user sends only `{ name, email, password }` — never `role` (server forces `user`)

### Stores

- File name pattern: `<name>.store.js` (e.g. `login.store.js`)
- Export: `use<Name>Store` via Pinia `defineStore` (options API: `state` / `actions`; prefer simple action helpers over getters)
- **One store per page** for that page’s data and actions
- `app.store.js` holds shared app state (auth session, access token, user, create limits, navigation)
- `snackbar.store.js` holds global toast notifications (success / error / warning / info)
- `loader.store.js` holds the global overlay loader (`wrap()` around async work)
- `confirm.store.js` holds the shared confirm dialog (`ask()` → promise)
- Keep **domain data and mutations** in stores (plus loader / snackbar / confirm around them)
- Keep **UI chrome** in pages: tabs, dialog open/form fields, password visibility, accordion expand
- Prefer plain functions (`getActiveSplit()`, `isAdmin()`) over getters when reading derived values

### Routing

- Router: `src/router/index.js` (history mode)
- App bootstraps session (`refresh` + `/me`) in `main.js` before mounting
- Auth routes require `app.loggedIn`; guest routes (`/login`) redirect when already logged in
- Admin routes (`/users`) require `app.isAdmin`
- Navigate via `app.goLogin()`, `app.goDashboard()`, `app.openWorkout(id)`, etc. (or `router.push`)

### Snackbars

- Use `useSnackbarStore()` from any store/page: `success()`, `error()`, `warning()`, `info()`
- UI: `components/AppSnackbar.vue` — top-right, mounted once in `App.vue`
- Show on create / edit / delete / validation warnings

### Loader

- Use `useLoaderStore().wrap(fn)` around async actions
- UI: `components/AppLoader.vue` — mounted once in `App.vue`
- Skip the loader on validation failures

### Confirm dialogs

- Use `useConfirmStore().ask({ title, message, confirmLabel })` before destructive actions
- Returns a boolean; cancel / dismiss → `false`
- UI: `components/AppConfirm.vue` — mounted once in `App.vue`
- Used for: delete workout, delete exercise, delete user, reset progress, log out

### Vue SFC order

Always: `script` → `template` → `styles`

### Styles

- Design tokens: `src/styles/_variables.scss`
- Auto-injected into every SCSS block via Vite (`@use "@/styles/variables" as *`)
- Prefer token variables (`$bg`, `$surface`, `$blue`, …) over hardcoded colors
- Class names: kebab-case; one root class per component

### README

**When needed, make sure to update this file** — project structure, routes, page ↔ store map, or feature notes whenever those change (new/removed page, store, component, or folder rename).

## Project structure

```
gt-frontend/
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile
├── .dockerignore
├── .env.example
├── README.md
└── src/
    ├── App.vue
    ├── main.js
    ├── networks/
    │   ├── base/
    │   │   ├── appAxios.js
    │   │   ├── accessToken.js
    │   │   ├── api.js
    │   │   ├── apiRoutes.js
    │   │   └── envelope.js
    │   ├── auth.services.js
    │   ├── users.services.js
    │   ├── configs.services.js
    │   ├── splits.services.js
    │   ├── workouts.services.js
    │   └── exercises.services.js
    ├── assets/
    ├── plugins/
    │   └── vuetify.js
    ├── router/
    │   └── index.js
    ├── styles/
    │   └── _variables.scss
    ├── stores/
    │   ├── app.store.js
    │   ├── snackbar.store.js
    │   ├── loader.store.js
    │   ├── confirm.store.js
    │   ├── login.store.js
    │   ├── dashboard.store.js
    │   ├── workout.store.js
    │   ├── settings.store.js
    │   └── users.store.js
    ├── pages/
    │   ├── login/
    │   │   └── LoginPage.vue
    │   ├── dashboard/
    │   │   ├── DashboardPage.vue
    │   │   ├── ProgressRing.vue
    │   │   ├── WorkoutCard.vue
    │   │   └── SplitCard.vue
    │   ├── workout/
    │   │   └── WorkoutPage.vue
    │   ├── settings/
    │   │   └── SettingsPage.vue
    │   └── users/
    │       └── UsersPage.vue
    └── components/
        ├── AppSnackbar.vue
        ├── AppLoader.vue
        └── AppConfirm.vue
```

## Routes

| Path                  | Name        | Page            | Access     |
| --------------------- | ----------- | --------------- | ---------- |
| `/login`              | `login`     | `LoginPage`     | Guest      |
| `/`                   | `dashboard` | `DashboardPage` | Auth       |
| `/workout/:workoutId` | `workout`   | `WorkoutPage`   | Auth       |
| `/settings`           | `settings`  | `SettingsPage`  | Auth       |
| `/users`              | `users`     | `UsersPage`     | Auth+Admin |

Unknown paths redirect to `/`.

## Page ↔ store map

| Page                      | Store                |
| ------------------------- | -------------------- |
| `pages/login`             | `login.store.js`     |
| `pages/dashboard`         | `dashboard.store.js` |
| `pages/workout`           | `workout.store.js`   |
| `pages/settings`          | `settings.store.js`  |
| `pages/users`             | `users.store.js`     |
| App shell / session / nav | `app.store.js`       |
| Global toasts             | `snackbar.store.js`  |
| Global loader             | `loader.store.js`    |
| Confirm dialogs           | `confirm.store.js`   |

## Feature notes

- **Auth**: login via `auth.services` → `POST /api/auth/login`; access token in memory; refresh cookie via `withCredentials`; bootstrap uses refresh + `/me`; logout clears cookie + session. Backend enforces **one active session** (`sessionId`); a second login or logout invalidates other tabs/devices (401 → local session cleared)
- **Users** (`/users`, admin): `users.services` list/create/toggle status/reset password/delete against `/api/users`; email auto-generated from name as camelCase `@gymtrakio.com` (e.g. `Tony Stark` → `tonyStark@gymtrakio.com`); create requires password (min 4; form prefilled with `GymTrakio123`); admin reset sets `GymTrakio123` and clears that user’s session; list/search via one call `POST /api/users/list` body `{ search }` (empty string = all; debounced 300ms, spinner in list while loading); per-user ⋮ menu for reset password / enable-disable / delete (non-admins only; confirm before delete)
- **Dashboard** (`/`): tabs for **Workouts** (default) and **Splits**; progress ring shows active split name + workout completion for that split only; Splits tab uses radio selection for active split (switch snackbar + jump to Workouts); FAB / rename / delete for name-only create-edit on the current tab; workouts scoped to the active split via `/api/splits` + `/api/splits/:id/workouts`; reset progress unmarks all workouts and exercises in the active split. Domain terms: **Split → Workout → Exercise**
- **Workout** (`/workout/:workoutId`): exercises CRUD under a workout via `/api/workouts/:id/exercises`, mark done; each exercise has its own `weight` + `weightUnit` (`kg`/`lb`) set in the create/edit dialog
- **Settings**: profile via `PATCH /api/auth/me` (`name` only); change password via `POST /api/auth/password` (current + new, min 4); log out hits API; admin-only **Configs** tab reads/writes global create limits via `GET/PATCH /api/configs` (max splits, workouts per split, exercises per workout; default 20 each, clamp 1–100); create actions also blocked client-side when at limit without deleting existing items. **Bulk add splits** on Profile: dialog with AI prompt copy + JSON paste → `POST /api/splits/bulk` (rejects existing split names; create-only; Zod max 20/20/20; rate-limited; limits abort entire import; active split unchanged)
- **Limits**: values live on `app.store.limits` (loaded from `/api/configs` on bootstrap/login/settings); backend enforces on create
