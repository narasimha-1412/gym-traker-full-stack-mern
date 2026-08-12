import { Router } from 'express'
import authRoutes from './auth.routes.js'
import usersRoutes from './users.routes.js'
import splitsRoutes from './splits.routes.js'
import workoutsRoutes from './workouts.routes.js'
import exercisesRoutes from './exercises.routes.js'
import configsRoutes from './configs.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/splits', splitsRoutes)
router.use(workoutsRoutes)
router.use(exercisesRoutes)
router.use('/configs', configsRoutes)

export default router
