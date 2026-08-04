import dotenv from 'dotenv'

dotenv.config()

const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`)
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpires: process.env.JWT_ACCESS_EXPIRES || '2m',
  refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  isProd: process.env.NODE_ENV === 'production',
}
