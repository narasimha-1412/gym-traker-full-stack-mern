export const routes = {
  auth: {
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  users: {
    list: '/api/users/list',
    create: '/api/users',
    status: id => `/api/users/${id}/status`,
    resetPassword: id => `/api/users/${id}/reset-password`,
  },
}
