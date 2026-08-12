import { routes } from './base/apiRoutes'
import { getAPIResponse, postAPIResponse, patchAPIResponse, deleteAPIResponse } from './base/api'

export const listSplits = () => getAPIResponse(routes.splits.list)

export const createSplit = body => postAPIResponse(routes.splits.create, body)

export const renameSplit = (id, body) => patchAPIResponse(routes.splits.one(id), body)

export const deleteSplit = id => deleteAPIResponse(routes.splits.one(id))

export const activateSplit = id => postAPIResponse(routes.splits.activate(id))
