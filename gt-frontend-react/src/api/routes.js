export const routes = {
  auth: {
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    password: '/api/auth/password',
  },
  users: {
    list: '/api/users/list',
    create: '/api/users',
    status: id => `/api/users/${id}/status`,
    resetPassword: id => `/api/users/${id}/reset-password`,
    one: id => `/api/users/${id}`,
  },
  configs: {
    root: '/api/configs',
  },
  splits: {
    list: '/api/splits',
    create: '/api/splits',
    bulk: '/api/splits/bulk',
    one: id => `/api/splits/${id}`,
    activate: id => `/api/splits/${id}/activate`,
  },
  workouts: {
    list: splitId => `/api/splits/${splitId}/workouts`,
    create: splitId => `/api/splits/${splitId}/workouts`,
    reset: splitId => `/api/splits/${splitId}/workouts/reset`,
    one: id => `/api/workouts/${id}`,
  },
  exercises: {
    list: workoutId => `/api/workouts/${workoutId}/exercises`,
    create: workoutId => `/api/workouts/${workoutId}/exercises`,
    one: id => `/api/exercises/${id}`,
  },
}
