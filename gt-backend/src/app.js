import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler } from './middleware/errorHandler.js'
import apiRoutes from './routes/index.js'

const app = express()

const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

app.use(
  cors({
    origin(origin, callback) {
      // No Origin (curl, Postman) or any localhost / 127.0.0.1 port
      if (!origin || localhostOrigin.test(origin)) {
        return callback(null, true)
      }
      callback(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json())
app.use(requestLogger)

app.use('/api', apiRoutes)

app.use(errorHandler)

export default app
