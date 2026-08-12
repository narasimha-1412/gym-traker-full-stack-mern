import { Router } from 'express'
import {
  listExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../controllers/exercises.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  workoutIdParams,
  exerciseIdParams,
  exerciseCreateBody,
  exerciseUpdateBody,
} from '../validators/exercises.validators.js'

const router = Router()

router.use(requireAuth)

router.get('/workouts/:workoutId/exercises', validate(workoutIdParams, 'params'), listExercises)
router.post(
  '/workouts/:workoutId/exercises',
  validate(workoutIdParams, 'params'),
  validate(exerciseCreateBody),
  createExercise
)
router.patch(
  '/exercises/:id',
  validate(exerciseIdParams, 'params'),
  validate(exerciseUpdateBody),
  updateExercise
)
router.delete('/exercises/:id', validate(exerciseIdParams, 'params'), deleteExercise)

export default router
