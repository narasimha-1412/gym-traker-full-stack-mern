import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const listUsersBody = z
  .object({
    search: z.string().trim().max(100).default(''),
  })
  .strict()

export const createUserBody = z
  .object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254),
    password: z.string().min(4).max(128),
  })
  .strict()

export const userIdParams = z
  .object({
    id: objectId,
  })
  .strict()
