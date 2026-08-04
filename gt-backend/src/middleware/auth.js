import { verifyAccess } from '../utils/tokens.js'
import { sendFail } from '../utils/apiResponse.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return sendFail(res, 'Unauthorized', 401)
  }

  try {
    const payload = verifyAccess(token)
    req.user = { id: payload.id, role: payload.role }
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
