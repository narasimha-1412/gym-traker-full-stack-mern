import { routes } from './base/apiRoutes'
import { getAPIResponse, postAPIResponse, patchAPIResponse } from './base/api'

export const login = (email, password) =>
  postAPIResponse(routes.auth.login, { email, password })

export const refresh = () => postAPIResponse(routes.auth.refresh)

export const logout = () => postAPIResponse(routes.auth.logout)

export const me = () => getAPIResponse(routes.auth.me)

export const updateProfile = body => patchAPIResponse(routes.auth.me, body)

export const changePassword = body => postAPIResponse(routes.auth.password, body)
