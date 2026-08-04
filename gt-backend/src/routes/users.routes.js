import { Router } from 'express'
import {
  listUsers,
  createUser,
  toggleStatus,
  resetPassword,
} from '../controllers/users.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth, requireAdmin)

router.post('/list', listUsers)
router.post('/', createUser)
router.patch('/:id/status', toggleStatus)
router.post('/:id/reset-password', resetPassword)

export default router
