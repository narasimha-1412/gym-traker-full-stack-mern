import bcrypt from 'bcryptjs'
import { connectDB } from '../config/db.js'
import { User } from '../models/User.js'
import { DEFAULT_PASSWORD } from '../controllers/users.controller.js'

const ADMIN_EMAIL = 'narasimha@gymtrakio.com'
const ADMIN_NAME = 'Narasimha'

async function seedAdmin() {
  await connectDB()

  const existing = await User.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`)
    process.exit(0)
  }

  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    role: 'admin',
    status: 'active',
  })

  console.log(`Admin created: ${ADMIN_EMAIL} / ${DEFAULT_PASSWORD}`)
  process.exit(0)
}

seedAdmin().catch(err => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
