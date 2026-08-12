import { z } from 'zod'

const limit = z.coerce.number().int().min(1).max(100)

export const updateConfigBody = z
  .object({
    maxSplits: limit,
    maxWorkoutsPerSplit: limit,
    maxExercisesPerWorkout: limit,
  })
  .strict()
