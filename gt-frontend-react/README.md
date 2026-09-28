# GymTrakio — React Frontend

React + MUI + Redux Toolkit + React Router mobile-first UI for GymTrakio.

Talks to the same Express API as the Vue app (`gt-frontend`): access JWT in memory, refresh JWT in an httpOnly cookie.

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

Vite is configured with `server.host: true` so the container is reachable at `http://localhost:5174`. Compose sets `VITE_API_URL` for the `web-react` service.

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL` (default `http://localhost:5000`)
3. Ensure the backend is running and seeded (`npm run seed:admin` in `gt-backend`)

### Environment

| Variable       | Required | Default                 | Description        |
| -------------- | -------- | ----------------------- | ------------------ |
| `VITE_API_URL` | No       | `http://localhost:5000` | Backend API origin |

In production, the page origin must be listed in the API’s `CORS_ORIGINS`, and `VITE_API_URL` must point at that API (HTTPS). Auth uses cookies (`withCredentials`), so CORS cannot be `*`. The API sets the refresh cookie with `SameSite=None; Secure` so it is sent on cross-origin requests.

## Conventions

### Feature folders

- Each feature lives under `src/features/<name>/`
- Keep the slice, page, and feature-only components together
- Slice file: `<name>Slice.js`; selectors named `select*` and exported from the slice
- A feature imports another feature only through that slice’s exports (actions, thunks, selectors)

### App shell

- `src/app/store.js` — `configureStore` + `injectStore` for the Axios client
- `src/app/hooks.js` — typed `useAppDispatch` / `useAppSelector`
- `src/app/router.jsx` — route table with `ProtectedRoute` / `GuestRoute`
- `src/app/theme.js` — MUI dark theme (same palette as the Vue app)

### API layer

Call chain: **slice thunk → `api/*.js` → `api/http.js` → `api/client.js` → backend**.

- `src/api/client.js` — Axios instance (`withCredentials`, Bearer token, refresh-on-401 via store injection)
- `src/api/accessToken.js` — in-memory access token (not localStorage)
- `src/api/http.js` — thin get / post / put / patch / delete wrappers
- `src/api/routes.js` — path constants and builders only
- Domain modules: `auth.js`, `users.js`, `configs.js`, `splits.js`, `workouts.js`, `exercises.js`
- `src/api/envelope.js` — unwrap `{ success, data }`; `apiMessage()` for errors
- Pages stay presentational; do not call Axios from components

### State

- `createAsyncThunk` for API work; thunks own loader / snackbar / confirm; reducers only update data
- UI-only state (tabs, dialogs, form fields, password visibility) stays in component `useState`
- `features/ui/` holds snackbar, loader, and confirm (`withLoader`, `confirm`)
- `setAccessToken` is only called in thunks (or the Axios interceptor), never in reducers

### Routing

- React Router in `src/app/router.jsx`
- Static hosts: `public/_redirects` rewrites all paths to `index.html`
- Session bootstrap (`refresh` + `/me`) in `main.jsx` before the first render
- Auth routes require `loggedIn`; guest routes (`/login`) redirect when already logged in
- Admin routes (`/users`) require `role === 'admin'`
- Pages navigate with `useNavigate()`; thunks do not hold a router

### UI chrome

- `AppSnackbar` — top-right toasts
- `AppLoader` — global overlay (`withLoader`, 700ms minimum)
- `AppConfirm` — confirm dialog (`confirm()` → Promise\<boolean\>)

## Project structure

```
gt-frontend-react/
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile
├── .dockerignore
├── .env.example
├── README.md
├── public/
│   └── _redirects
└── src/
    ├── main.jsx
    ├── app/
    │   ├── store.js
    │   ├── hooks.js
    │   ├── router.jsx
    │   └── theme.js
    ├── api/
    │   ├── client.js
    │   ├── accessToken.js
    │   ├── http.js
    │   ├── routes.js
    │   ├── envelope.js
    │   ├── auth.js
    │   ├── users.js
    │   ├── configs.js
    │   ├── splits.js
    │   ├── workouts.js
    │   └── exercises.js
    ├── utils/
    │   └── limits.js
    └── features/
        ├── auth/
        │   ├── authSlice.js
        │   ├── LoginPage.jsx
        │   ├── ProtectedRoute.jsx
        │   └── GuestRoute.jsx
        ├── dashboard/
        │   ├── dashboardSlice.js
        │   ├── DashboardPage.jsx
        │   ├── ProgressRing.jsx
        │   ├── SplitCard.jsx
        │   └── WorkoutCard.jsx
        ├── workout/
        │   ├── workoutSlice.js
        │   └── WorkoutPage.jsx
        ├── settings/
        │   ├── settingsSlice.js
        │   └── SettingsPage.jsx
        ├── users/
        │   ├── usersSlice.js
        │   └── UsersPage.jsx
        └── ui/
            ├── uiSlice.js
            ├── uiThunks.js
            ├── AppSnackbar.jsx
            ├── AppLoader.jsx
            └── AppConfirm.jsx
```

## Routes

| Path                  | Page            | Access     |
| --------------------- | --------------- | ---------- |
| `/login`              | `LoginPage`     | Guest      |
| `/`                   | `DashboardPage` | Auth       |
| `/workout/:workoutId` | `WorkoutPage`   | Auth       |
| `/settings`           | `SettingsPage`  | Auth       |
| `/users`              | `UsersPage`     | Auth+Admin |

Unknown paths redirect to `/`.

## Feature notes

- **Auth**: login via `api/auth` → `POST /api/auth/login`; access token in memory; refresh cookie via `withCredentials`; bootstrap uses refresh + `/me`; logout clears cookie + session. Backend enforces **one active session**; a second login invalidates other tabs (401 → `sessionCleared`)
- **Users** (`/users`, admin): list/create/toggle status/reset password/delete; email auto-generated from name as camelCase `@gymtrakio.com`; create password min 4 (default `GymTrakio123`); search debounced 300ms
- **Dashboard** (`/`): Workouts / Splits tabs; progress ring for the active split; FAB / rename / delete; reset progress unmarks workouts and exercises in the active split
- **Workout** (`/workout/:workoutId`): exercise CRUD with weight + `kg`/`lb`
- **Settings**: profile, password, admin configs, bulk JSON import, logout confirm
- **Limits**: on `auth.limits` (from `/api/configs`); enforced client-side on create and by the API
