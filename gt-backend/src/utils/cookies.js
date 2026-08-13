import { env } from '../config/env.js'

export const REFRESH_COOKIE = 'refreshToken'

const refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000

/** Shared cookie options — httpOnly; Secure + SameSite=None in prod (cross-origin SPA). */
const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/api/auth',
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    ...cookieOptions,
    maxAge: refreshMaxAgeMs,
  })
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions)
}
