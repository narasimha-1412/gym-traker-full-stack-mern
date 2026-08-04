import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { sendSuccess, sendFail } from '../utils/apiResponse.js'

export const DEFAULT_PASSWORD = 'IronLog123'

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: 1 })
    sendSuccess(res, { users: users.map(u => u.toSafeJSON()) })
  } catch (err) {
    next(err)
  }
}

export async function createUser(req, res, next) {
  try {
    const name = (req.body.name || '').trim()
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password || DEFAULT_PASSWORD
    const role = req.body.role === 'admin' ? 'admin' : 'user'

    if (!name || !email) {
      return sendFail(res, 'Fill in name and email', 400)
    }
    if (!email.includes('@')) {
      return sendFail(res, 'Enter a valid email', 400)
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return sendFail(res, 'Email already exists', 409, [{ field: 'email', message: 'Email already exists' }])
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      status: 'active',
    })

    sendSuccess(res, { user: user.toSafeJSON() }, 201)
  } catch (err) {
    next(err)
  }
}

export async function toggleStatus(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return sendFail(res, 'User not found', 404)
    }
    if (user.role === 'admin') {
      return sendFail(res, 'Cannot disable an admin account', 400)
    }
    if (user._id.toString() === req.user.id) {
      return sendFail(res, 'You cannot disable your own account', 400)
    }

    user.status = user.status === 'active' ? 'disabled' : 'active'
    await user.save()

    sendSuccess(res, { user: user.toSafeJSON() })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return sendFail(res, 'User not found', 404)
    }

    user.password = await bcrypt.hash(DEFAULT_PASSWORD, 10)
    await user.save()

    sendSuccess(res, { message: 'Password reset successfully' })
  } catch (err) {
    next(err)
  }
}
