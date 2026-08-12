import { Router } from 'express'
import { getConfig, updateConfig } from '../controllers/configs.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { updateConfigBody } from '../validators/configs.validators.js'

const router = Router()

router.get('/', requireAuth, getConfig)
router.patch('/', requireAuth, requireAdmin, validate(updateConfigBody), updateConfig)

export default router
