# IronLog — Gym Tracker Frontend

Vue 3 + Vuetify + Pinia + Vue Router mobile-first UI for IronLog.

Auth and data flows are simulated with a shared loader until a real API is wired.

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

Vite is configured with `server.host: true` so the container is reachable at `http://localhost:5173`.

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

### Stores

- File name pattern: `<name>.store.js` (e.g. `login.store.js`)
- Export: `use<Name>Store` via Pinia `defineStore` (options API: `state` / `getters` / `actions`)
- **One store per page** for that page’s data and actions
- `app.store.js` holds shared app state (auth session, user, weight unit, navigation helpers)
- `snackbar.store.js` holds global toast notifications (success / error / warning / info)
- `loader.store.js` holds the global overlay loader (`wrap()` simulates async work)
- `confirm.store.js` holds the shared confirm dialog (`ask()` → promise)
- Keep data logic in stores; keep pages presentational where possible

### Routing

- Router: `src/router/index.js` (history mode)
- Auth routes require `app.loggedIn`; guest routes (`/login`) redirect when already logged in
- Admin routes (`/users`) require `app.isAdmin`
- Navigate via `app.goLogin()`, `app.goDashboard()`, `app.openWorkout(id)`, etc. (or `router.push`)

### Snackbars

- Use `useSnackbarStore()` from any store/page: `success()`, `error()`, `warning()`, `info()`
- UI: `components/AppSnackbar.vue` — top-right, mounted once in `App.vue`
- Show on create / edit / delete / validation warnings

### Loader

- Use `useLoaderStore().wrap(fn)` around async/simulated actions
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
├── README.md
└── src/
    ├── App.vue
    ├── main.js
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

- **Auth**: login only (admin creates users); default password `IronLog123`
- **Users** (`/users`, admin): create user, copy default password / email, reset password (snack — use default), enable/disable (disabled users cannot log in)
- **Dashboard** (`/`): routines list, progress ring, add / rename / delete routine, reset progress
- **Workout**: exercises CRUD, mark done, weight unit from settings
- **Settings**: profile (username, kg/lb), change password (new + confirm, mock until API), log out
