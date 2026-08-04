import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signAccess(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    env.accessSecret,
    { expiresIn: env.accessExpires }
  )
}

export function signRefresh(user) {
  return jwt.sign(
    { id: user._id.toString(), type: 'refresh' },
    env.refreshSecret,
    { expiresIn: env.refreshExpires }
  )
}

export function verifyAccess(token) {
  return jwt.verify(token, env.accessSecret)
}

export function verifyRefresh(token) {
  const payload = jwt.verify(token, env.refreshSecret)
  if (payload.type !== 'refresh') {
    throw new Error('Invalid refresh token')
  }
  return payload
}
