import { z } from 'zod'

export const loginBody = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict()

export const updateProfileBody = z
  .object({
    name: z.string().trim().min(2).max(80),
    weightUnit: z.enum(['kg', 'lb']),
  })
  .strict()

export const changePasswordBody = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(128),
  })
  .strict()
  .refine(data => data.newPassword !== data.currentPassword, {
    message: 'New password must be different',
    path: ['newPassword'],
  })
