import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { env } from './config/env.js'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler } from './middleware/errorHandler.js'
import apiRoutes from './routes/index.js'

const app = express()

// Render (and similar hosts) terminate TLS at a proxy; needed for Secure cookies
app.set('trust proxy', 1)

const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

function isAllowedOrigin(origin) {
  // Non-browser tools (curl / Postman) often send no Origin
  if (!origin) return true
  if (env.corsOrigins.includes(origin)) return true
  if (!env.isProd && localhostOrigin.test(origin)) return true
  return false
}

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true)
      }
      callback(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json({ limit: '32kb' }))
app.use(requestLogger)

app.use('/api', apiRoutes)

app.use(errorHandler)

export default app
