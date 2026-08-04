import { sendFail } from '../utils/apiResponse.js'

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  console.error(`${req.method} ${req.originalUrl} ${status} — ${message}`)
  if (err.stack) {
    console.error(err.stack)
  }

  if (res.headersSent) {
    return next(err)
  }

  sendFail(res, message, status)
}
