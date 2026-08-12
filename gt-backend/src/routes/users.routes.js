import { Router } from 'express'
import {
  listUsers,
  createUser,
  toggleStatus,
  resetPassword,
  deleteUser,
} from '../controllers/users.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  listUsersBody,
  createUserBody,
  userIdParams,
} from '../validators/users.validators.js'
import { listUsersLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.use(requireAuth, requireAdmin)

router.post('/list', listUsersLimiter, validate(listUsersBody), listUsers)
router.post('/', validate(createUserBody), createUser)
router.patch('/:id/status', validate(userIdParams, 'params'), toggleStatus)
router.post('/:id/reset-password', validate(userIdParams, 'params'), resetPassword)
router.delete('/:id', validate(userIdParams, 'params'), deleteUser)

export default router
