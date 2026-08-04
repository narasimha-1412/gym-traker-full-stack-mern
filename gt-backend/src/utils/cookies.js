import { env } from '../config/env.js'

export const REFRESH_COOKIE = 'refreshToken'

const refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: refreshMaxAgeMs,
  })
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/api/auth',
  })
}
