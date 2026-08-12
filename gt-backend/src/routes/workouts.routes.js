import { Router } from 'express'
import {
  listWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  resetWorkouts,
} from '../controllers/workouts.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  splitIdParams,
  workoutIdParams,
  workoutTitleBody,
  workoutUpdateBody,
} from '../validators/workouts.validators.js'

const router = Router()

router.use(requireAuth)

router.get('/splits/:splitId/workouts', validate(splitIdParams, 'params'), listWorkouts)
router.post(
  '/splits/:splitId/workouts',
  validate(splitIdParams, 'params'),
  validate(workoutTitleBody),
  createWorkout
)
router.post(
  '/splits/:splitId/workouts/reset',
  validate(splitIdParams, 'params'),
  resetWorkouts
)
router.patch(
  '/workouts/:id',
  validate(workoutIdParams, 'params'),
  validate(workoutUpdateBody),
  updateWorkout
)
router.delete('/workouts/:id', validate(workoutIdParams, 'params'), deleteWorkout)

export default router
