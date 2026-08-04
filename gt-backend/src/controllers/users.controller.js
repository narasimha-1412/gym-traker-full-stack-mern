import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'

export const DEFAULT_PASSWORD = 'IronLog123'

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: 1 })
    res.json(users.map(u => u.toSafeJSON()))
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
      return res.status(400).json({ message: 'Fill in name and email' })
    }
    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Enter a valid email' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(409).json({ message: 'Email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      status: 'active',
    })

    res.status(201).json(user.toSafeJSON())
  } catch (err) {
    next(err)
  }
}

export async function toggleStatus(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot disable an admin account' })
    }
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot disable your own account' })
    }

    user.status = user.status === 'active' ? 'disabled' : 'active'
    await user.save()

    res.json(user.toSafeJSON())
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.password = await bcrypt.hash(DEFAULT_PASSWORD, 10)
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    next(err)
  }
}
