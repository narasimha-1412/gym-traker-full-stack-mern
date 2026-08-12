import { routes } from './base/apiRoutes'
import { getAPIResponse, postAPIResponse, patchAPIResponse, deleteAPIResponse } from './base/api'

export const listExercises = workoutId => getAPIResponse(routes.exercises.list(workoutId))

export const createExercise = (workoutId, body) =>
  postAPIResponse(routes.exercises.create(workoutId), body)

export const updateExercise = (id, body) => patchAPIResponse(routes.exercises.one(id), body)

export const deleteExercise = id => deleteAPIResponse(routes.exercises.one(id))
