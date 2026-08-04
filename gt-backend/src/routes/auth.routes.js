import { Router } from 'express'
import {
  login,
  refresh,
  logout,
  me,
  updateMe,
  changePassword,
} from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  loginBody,
  updateProfileBody,
  changePasswordBody,
} from '../validators/auth.validators.js'
import { loginLimiter, changePasswordLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.post('/login', loginLimiter, validate(loginBody), login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', requireAuth, me)
router.patch('/me', requireAuth, validate(updateProfileBody), updateMe)
router.post(
  '/password',
  requireAuth,
  changePasswordLimiter,
  validate(changePasswordBody),
  changePassword
)

export default router
