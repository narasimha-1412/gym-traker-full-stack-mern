import { Router } from 'express'
import {
  listSplits,
  createSplit,
  renameSplit,
  deleteSplit,
  activateSplit,
} from '../controllers/splits.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { splitIdParams, splitTitleBody } from '../validators/splits.validators.js'

const router = Router()

router.use(requireAuth)

router.get('/', listSplits)
router.post('/', validate(splitTitleBody), createSplit)
router.patch('/:id', validate(splitIdParams, 'params'), validate(splitTitleBody), renameSplit)
router.delete('/:id', validate(splitIdParams, 'params'), deleteSplit)
router.post('/:id/activate', validate(splitIdParams, 'params'), activateSplit)

export default router
