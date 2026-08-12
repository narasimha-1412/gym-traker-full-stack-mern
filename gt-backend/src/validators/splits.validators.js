import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const splitIdParams = z.object({ id: objectId }).strict()

export const splitTitleBody = z
  .object({
    title: z.string().trim().min(1).max(80),
  })
  .strict()
