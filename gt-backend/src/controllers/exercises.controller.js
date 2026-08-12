import { Workout } from '../models/Workout.js'
import { Exercise } from '../models/Exercise.js'
import { AppConfig } from '../models/AppConfig.js'
import { sendSuccess, sendFail } from '../utils/apiResponse.js'

async function findOwnedWorkout(id, userId) {
  return Workout.findOne({ _id: id, userId })
}

async function findOwnedExercise(id, userId) {
  return Exercise.findOne({ _id: id, userId })
}

export async function listExercises(req, res, next) {
  try {
    const userId = req.user.id
    const workout = await findOwnedWorkout(req.params.workoutId, userId)
    if (!workout) return sendFail(res, 'Workout not found', 404)

    const exercises = await Exercise.find({ workoutId: workout._id, userId }).sort({
      createdAt: 1,
    })
    sendSuccess(res, { exercises: exercises.map(e => e.toSafeJSON()) })
  } catch (err) {
    next(err)
  }
}

export async function createExercise(req, res, next) {
  try {
    const userId = req.user.id
    const workout = await findOwnedWorkout(req.params.workoutId, userId)
    if (!workout) return sendFail(res, 'Workout not found', 404)

    const config = await AppConfig.ensureDefaults()
    const count = await Exercise.countDocuments({ workoutId: workout._id, userId })
    if (count >= config.maxExercisesPerWorkout) {
      return sendFail(res, `Exercise limit reached (${config.maxExercisesPerWorkout})`)
    }

    const exercise = await Exercise.create({
      userId,
      workoutId: workout._id,
      name: req.body.name,
      weight: req.body.weight ?? '',
      description: req.body.description ?? '',
    })

    sendSuccess(res, { exercise: exercise.toSafeJSON() }, 201)
  } catch (err) {
    next(err)
  }
}

export async function updateExercise(req, res, next) {
  try {
    const exercise = await findOwnedExercise(req.params.id, req.user.id)
    if (!exercise) return sendFail(res, 'Exercise not found', 404)

    if (req.body.name !== undefined) exercise.name = req.body.name
    if (req.body.weight !== undefined) exercise.weight = req.body.weight
    if (req.body.description !== undefined) exercise.description = req.body.description
    if (req.body.done !== undefined) exercise.done = req.body.done
    await exercise.save()

    sendSuccess(res, { exercise: exercise.toSafeJSON() })
  } catch (err) {
    next(err)
  }
}

export async function deleteExercise(req, res, next) {
  try {
    const exercise = await findOwnedExercise(req.params.id, req.user.id)
    if (!exercise) return sendFail(res, 'Exercise not found', 404)

    await exercise.deleteOne()
    sendSuccess(res, null)
  } catch (err) {
    next(err)
  }
}
