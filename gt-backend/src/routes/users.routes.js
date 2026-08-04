import { Router } from 'express'
import {
  listUsers,
  createUser,
  toggleStatus,
  resetPassword,
} from '../controllers/users.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  listUsersBody,
  createUserBody,
  userIdParams,
} from '../validators/users.validators.js'

const router = Router()

router.use(requireAuth, requireAdmin)

router.post('/list', validate(listUsersBody), listUsers)
router.post('/', validate(createUserBody), createUser)
router.patch('/:id/status', validate(userIdParams, 'params'), toggleStatus)
router.post('/:id/reset-password', validate(userIdParams, 'params'), resetPassword)

export default router
