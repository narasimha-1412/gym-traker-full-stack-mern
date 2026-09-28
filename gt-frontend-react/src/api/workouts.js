import { routes } from './routes'
import { getAPIResponse, postAPIResponse, patchAPIResponse, deleteAPIResponse } from './http'

export const listWorkouts = splitId => getAPIResponse(routes.workouts.list(splitId))

export const createWorkout = (splitId, body) =>
  postAPIResponse(routes.workouts.create(splitId), body)

export const resetWorkouts = splitId => postAPIResponse(routes.workouts.reset(splitId))

export const updateWorkout = (id, body) => patchAPIResponse(routes.workouts.one(id), body)

export const deleteWorkout = id => deleteAPIResponse(routes.workouts.one(id))
