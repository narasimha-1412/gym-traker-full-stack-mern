import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function newSessionId() {
  return crypto.randomUUID()
}

export function signAccess(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      sid: user.sessionId,
    },
    env.accessSecret,
    { expiresIn: env.accessExpires }
  )
}

export function signRefresh(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      type: 'refresh',
      sid: user.sessionId,
    },
    env.refreshSecret,
    { expiresIn: env.refreshExpires }
  )
}

export function verifyAccess(token) {
  const payload = jwt.verify(token, env.accessSecret)
  if (!payload.sid) {
    throw new Error('Invalid access token')
  }
  return payload
}

export function verifyRefresh(token) {
  const payload = jwt.verify(token, env.refreshSecret)
  if (payload.type !== 'refresh' || !payload.sid) {
    throw new Error('Invalid refresh token')
  }
  return payload
}

/** True when JWT sid matches the user's current session. */
export function isActiveSession(user, sid) {
  return Boolean(user?.sessionId && sid && user.sessionId === sid)
}
