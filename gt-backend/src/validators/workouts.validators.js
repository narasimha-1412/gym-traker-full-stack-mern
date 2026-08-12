import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const splitIdParams = z.object({ splitId: objectId }).strict()
export const workoutIdParams = z.object({ id: objectId }).strict()

export const workoutTitleBody = z
  .object({
    title: z.string().trim().min(1).max(80),
  })
  .strict()

export const workoutUpdateBody = z
  .object({
    title: z.string().trim().min(1).max(80).optional(),
    done: z.boolean().optional(),
  })
  .strict()
  .refine(data => data.title !== undefined || data.done !== undefined, {
    message: 'Provide title and/or done',
  })
