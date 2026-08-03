import dotenv from 'dotenv'

dotenv.config()

if (!process.env.MONGODB_URI) {
  throw new Error('Missing required env var: MONGODB_URI')
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
}
