import { env } from '../config/env.js'
import { sendFail } from '../utils/apiResponse.js'

export function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err.type === 'entity.too.large') {
    status = 413
    message = 'Request body too large'
  }

  console.error(`${req.method} ${req.originalUrl} ${status} — ${message}`)
  if (err.stack && status >= 500) {
    console.error(err.stack)
  }

  if (res.headersSent) {
    return next(err)
  }

  // Don't leak internal details to clients in production
  if (status >= 500 && env.isProd) {
    message = 'Internal Server Error'
  }

  sendFail(res, message, status)
}
