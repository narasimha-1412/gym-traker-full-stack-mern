import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const splitIdParams = z.object({ id: objectId }).strict()

export const splitTitleBody = z
  .object({
    title: z.string().trim().min(1).max(80),
  })
  .strict()

const bulkExercise = z
  .object({
    name: z.string().trim().min(1).max(80),
    weight: z.string().trim().max(32).optional().default(''),
    weightUnit: z.enum(['kg', 'lb']).optional().default('kg'),
    description: z.string().trim().max(500).optional().default(''),
  })
  .strict()

const bulkWorkout = z
  .object({
    title: z.string().trim().min(1).max(80),
    exercises: z.array(bulkExercise).max(100).optional().default([]),
  })
  .strict()

const bulkSplit = z
  .object({
    title: z.string().trim().min(1).max(80),
    workouts: z.array(bulkWorkout).max(100).optional().default([]),
  })
  .strict()

export const bulkImportBody = z
  .object({
    splits: z.array(bulkSplit).min(1).max(100),
  })
  .strict()
