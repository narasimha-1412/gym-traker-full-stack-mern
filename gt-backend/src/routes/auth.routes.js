import { Router } from 'express'
import { login, refresh, logout, me } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { loginBody } from '../validators/auth.validators.js'

const router = Router()

router.post('/login', validate(loginBody), login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router
