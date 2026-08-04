import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { signAccess, signRefresh, verifyRefresh } from '../utils/tokens.js'
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE } from '../utils/cookies.js'

export async function login(req, res, next) {
  try {
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password || ''

    if (!email || !password) {
      return res.status(400).json({ message: 'Enter a valid email and password' })
    }

    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid login details' })
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ message: 'Account disabled' })
    }

    const accessToken = signAccess(user)
    setRefreshCookie(res, signRefresh(user))

    res.json({ accessToken, user: user.toSafeJSON() })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    let payload
    try {
      payload = verifyRefresh(token)
    } catch {
      clearRefreshCookie(res)
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await User.findById(payload.id)
    if (!user || user.status === 'disabled') {
      clearRefreshCookie(res)
      return res.status(401).json({ message: 'Unauthorized' })
    }

    setRefreshCookie(res, signRefresh(user))
    res.json({ accessToken: signAccess(user) })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    clearRefreshCookie(res)
    res.json({ message: 'ok' })
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user || user.status === 'disabled') {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    res.json({ user: user.toSafeJSON() })
  } catch (err) {
    next(err)
  }
}
