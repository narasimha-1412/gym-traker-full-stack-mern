import { routes } from './base/apiRoutes'
import { getAPIResponse, patchAPIResponse } from './base/api'

export const getConfig = () => getAPIResponse(routes.configs.root)

export const updateConfig = body => patchAPIResponse(routes.configs.root, body)
