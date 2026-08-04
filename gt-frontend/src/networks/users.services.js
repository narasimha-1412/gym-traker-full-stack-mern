import { routes } from './base/apiRoutes'
import { getAPIResponse, postAPIResponse, patchAPIResponse } from './base/api'

export const listUsers = ({ search = '' } = {}) =>
  postAPIResponse(routes.users.list, { search: search.trim() })

export const createUser = body => postAPIResponse(routes.users.create, body)

export const toggleStatus = id => patchAPIResponse(routes.users.status(id))

export const resetPassword = id => postAPIResponse(routes.users.resetPassword(id))
