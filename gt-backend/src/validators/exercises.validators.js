import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const workoutIdParams = z.object({ workoutId: objectId }).strict()
export const exerciseIdParams = z.object({ id: objectId }).strict()

export const exerciseCreateBody = z
  .object({
    name: z.string().trim().min(1).max(80),
    weight: z.string().trim().max(32).optional().default(''),
    weightUnit: z.enum(['kg', 'lb']).optional().default('kg'),
    description: z.string().trim().max(500).optional().default(''),
  })
  .strict()

export const exerciseUpdateBody = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    weight: z.string().trim().max(32).optional(),
    weightUnit: z.enum(['kg', 'lb']).optional(),
    description: z.string().trim().max(500).optional(),
    done: z.boolean().optional(),
  })
  .strict()
  .refine(
    data =>
      data.name !== undefined ||
      data.weight !== undefined ||
      data.weightUnit !== undefined ||
      data.description !== undefined ||
      data.done !== undefined,
    { message: 'Provide at least one field to update' }
  )
