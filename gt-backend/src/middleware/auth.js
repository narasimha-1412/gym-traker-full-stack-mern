import { User } from '../models/User.js'
import { verifyAccess, isActiveSession } from '../utils/tokens.js'
import { sendFail } from '../utils/apiResponse.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return sendFail(res, 'Unauthorized', 401)
  }

  try {
    const payload = verifyAccess(token)
    const user = await User.findById(payload.id).select('sessionId status role')

    if (!user || user.status === 'disabled' || !isActiveSession(user, payload.sid)) {
      return sendFail(res, 'Unauthorized', 401)
    }

    req.user = { id: payload.id, role: user.role }
    next()
  } catch {
    return sendFail(res, 'Unauthorized', 401)
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return sendFail(res, 'Forbidden', 403)
  }
  next()
}
