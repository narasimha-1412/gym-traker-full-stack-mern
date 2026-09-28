import { routes } from './routes'
import { postAPIResponse, patchAPIResponse, deleteAPIResponse } from './http'

export const listUsers = ({ search = '' } = {}) =>
  postAPIResponse(routes.users.list, { search: search.trim().slice(0, 100) })

export const createUser = body => postAPIResponse(routes.users.create, body)

export const toggleStatus = id => patchAPIResponse(routes.users.status(id))

export const resetPassword = id => postAPIResponse(routes.users.resetPassword(id))

export const deleteUser = id => deleteAPIResponse(routes.users.one(id))
