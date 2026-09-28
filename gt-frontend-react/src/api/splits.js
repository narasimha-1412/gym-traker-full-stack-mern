import { routes } from './routes'
import { getAPIResponse, postAPIResponse, patchAPIResponse, deleteAPIResponse } from './http'

export const listSplits = () => getAPIResponse(routes.splits.list)

export const createSplit = body => postAPIResponse(routes.splits.create, body)

export const renameSplit = (id, body) => patchAPIResponse(routes.splits.one(id), body)

export const deleteSplit = id => deleteAPIResponse(routes.splits.one(id))

export const activateSplit = id => postAPIResponse(routes.splits.activate(id))

export const bulkImportSplits = body => postAPIResponse(routes.splits.bulk, body)
