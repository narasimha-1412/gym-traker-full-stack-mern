# IronLog — Gym Tracker Frontend

Vue 3 + Vuetify + Pinia + Vue Router mobile-first UI for IronLog.

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

## Conventions

### Pages

- Each screen lives under `src/pages/<pageName>/`
- Page file name: `<PageName>Page.vue` (e.g. `LoginPage.vue`)
- Pages own layout for that screen and wire up the matching store
- Navigation uses Vue Router (`src/router/index.js`); helpers live on `app.store.js`

### Components

- Shared / reusable UI lives flat under `src/components/` (e.g. `AppSnackbar.vue`, `AppLoader.vue`, `AppConfirm.vue`)
- Page-specific components live next to their page under `src/pages/<pageName>/` (e.g. `pages/dashboard/RoutineCard.vue`)
- Do not create per-page folders under `components/`

### Networks (API layer)

Call chain: **store → `*.services.js` → `base/api.js` → `base/appAxios.js` → backend**.

- `src/networks/base/appAxios.js` — Axios instance (`withCredentials`, Bearer access token, refresh-on-401)
- `src/networks/base/accessToken.js` — in-memory access token (not localStorage)
- `src/networks/base/api.js` — thin `get` / `post` / `put` / `patch` / `delete` wrappers
- `src/networks/base/apiRoutes.js` — path constants and builders only (no HTTP)
- `src/networks/auth.services.js` / `users.services.js` — named functions (route + method + payload)
- Paths live only in `apiRoutes.js`; HTTP only in services; loading / snackbars stay in stores
- Pages stay presentational; do not call Axios from Vue components
- `src/networks/base/envelope.js` — unwrap `{ success, data }` responses; `apiMessage()` for errors
- Backend returns `{ success, data }` on success and `{ success: false, message, errors? }` on error; stores unwrap via `getData(res)`

### Stores

- File name pattern: `<name>.store.js` (e.g. `login.store.js`)
- Export: `use<Name>Store` via Pinia `defineStore` (options API: `state` / `getters` / `actions`)
- **One store per page** for that page’s data and actions
- `app.store.js` holds shared app state (auth session, access token, user, weight unit, navigation)
- `snackbar.store.js` holds global toast notifications (success / error / warning / info)
- `loader.store.js` holds the global overlay loader (`wrap()` around async work)
- `confirm.store.js` holds the shared confirm dialog (`ask()` → promise)
- Keep data logic in stores; keep pages presentational where possible

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
- Used for: delete routine, delete exercise, reset progress, log out

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
    │   └── users.services.js
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
    │   │   └── RoutineCard.vue
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
| `/workout/:routineId` | `workout`   | `WorkoutPage`   | Auth       |
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

- **Auth**: login via `auth.services` → `POST /api/auth/login`; access token in memory; refresh cookie via `withCredentials`; bootstrap uses refresh + `/me`; logout clears cookie + session
- **Users** (`/users`, admin): `users.services` list/create/toggle status/reset password against `/api/users`; email auto-generated from name as camelCase `@ironlog.com` (e.g. `Tony Stark` → `tonyStark@ironlog.com`); default password `IronLog123`; list/search via one call `POST /api/users/list` body `{ search }` (empty string = all; debounced 300ms, spinner in list while loading); per-user ⋮ menu for reset password / enable-disable
- **Dashboard** (`/`): routines list, progress ring, add / rename / delete routine, reset progress (still local mock)
- **Workout**: exercises CRUD, mark done, weight unit from settings (still local mock)
- **Settings**: profile (username, kg/lb) local; change password mock until API; log out hits API
