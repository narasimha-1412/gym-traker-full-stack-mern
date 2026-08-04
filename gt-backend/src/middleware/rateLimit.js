import rateLimit from 'express-rate-limit'
import { sendFail } from '../utils/apiResponse.js'

function rateLimitHandler(req, res) {
  return sendFail(res, 'Too many requests, try again later', 429)
}

/** Strict limit for login — slows password guessing. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
})

/** Softer limit for user list/search — stops spam while allowing typing. */
export const listUsersLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
})
