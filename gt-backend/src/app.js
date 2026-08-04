import express from 'express'
import cors from 'cors'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

app.use(
  cors({
    origin(origin, callback) {
      // No Origin (curl, Postman, same-origin) or any localhost / 127.0.0.1 port
      if (!origin || localhostOrigin.test(origin)) {
        return callback(null, true)
      }
      callback(new Error(`CORS blocked: ${origin}`))
    },
  })
)
app.use(express.json())
app.use(requestLogger)

// Mount routes here (before errorHandler)

app.use(errorHandler)

export default app
