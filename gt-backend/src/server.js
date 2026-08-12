import app from './app.js'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { AppConfig } from './models/AppConfig.js'

async function start() {
  await connectDB()
  await AppConfig.ensureDefaults()
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`)
  })
}

start().catch(err => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})
