import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Split } from '../models/Split.js'
import { Workout } from '../models/Workout.js'
import { Exercise } from '../models/Exercise.js'
import { sendSuccess, sendFail } from '../utils/apiResponse.js'

export const DEFAULT_PASSWORD = 'GymTrakio123'

export async function listUsers(req, res, next) {
  try {
    const search = req.body.search
    const filter = {}

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [{ name: regex }, { email: regex }]
    }

    const users = await User.find(filter).sort({ createdAt: 1 })
    sendSuccess(res, { users: users.map(u => u.toSafeJSON()) })
  } catch (err) {
    next(err)
  }
}

export async function createUser(req, res, next) {
  try {
    const name = req.body.name
    const email = req.body.email.toLowerCase()
    const password = req.body.password || DEFAULT_PASSWORD

    const exists = await User.findOne({ email })
    if (exists) {
      return sendFail(res, 'Email already exists', 409, [
        { field: 'email', message: 'Email already exists' },
      ])
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'user',
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

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return sendFail(res, 'User not found', 404)
    }
    if (user.role === 'admin') {
      return sendFail(res, 'Cannot delete an admin account', 400)
    }
    if (user._id.toString() === req.user.id) {
      return sendFail(res, 'You cannot delete your own account', 400)
    }

    const userId = user._id
    await Exercise.deleteMany({ userId })
    await Workout.deleteMany({ userId })
    await Split.deleteMany({ userId })
    await user.deleteOne()

    sendSuccess(res, null)
  } catch (err) {
    next(err)
  }
}
