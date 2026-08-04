import { verifyAccess } from '../utils/tokens.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const payload = verifyAccess(token)
    req.user = { id: payload.id, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  next()
}
