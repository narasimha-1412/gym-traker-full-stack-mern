import { routes } from './routes'
import { getAPIResponse, patchAPIResponse } from './http'

export const getConfig = () => getAPIResponse(routes.configs.root)

export const updateConfig = body => patchAPIResponse(routes.configs.root, body)
