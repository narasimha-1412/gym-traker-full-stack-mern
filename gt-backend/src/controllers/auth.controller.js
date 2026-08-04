import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { signAccess, signRefresh, verifyRefresh } from '../utils/tokens.js'
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE } from '../utils/cookies.js'
import { sendSuccess, sendFail } from '../utils/apiResponse.js'

export async function login(req, res, next) {
  try {
    const email = req.body.email.trim().toLowerCase()
    const password = req.body.password

    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendFail(res, 'Invalid login details', 401)
    }

    if (user.status === 'disabled') {
      return sendFail(res, 'Account disabled', 403)
    }

    const accessToken = signAccess(user)
    setRefreshCookie(res, signRefresh(user))

    sendSuccess(res, { accessToken, user: user.toSafeJSON() })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE]
    if (!token) {
      return sendFail(res, 'Unauthorized', 401)
    }

    let payload
    try {
      payload = verifyRefresh(token)
    } catch {
      clearRefreshCookie(res)
      return sendFail(res, 'Unauthorized', 401)
    }

    const user = await User.findById(payload.id)
    if (!user || user.status === 'disabled') {
      clearRefreshCookie(res)
      return sendFail(res, 'Unauthorized', 401)
    }

    setRefreshCookie(res, signRefresh(user))
    sendSuccess(res, { accessToken: signAccess(user) })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    clearRefreshCookie(res)
    sendSuccess(res, null)
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user || user.status === 'disabled') {
      return sendFail(res, 'Unauthorized', 401)
    }
    sendSuccess(res, { user: user.toSafeJSON() })
  } catch (err) {
    next(err)
  }
}
