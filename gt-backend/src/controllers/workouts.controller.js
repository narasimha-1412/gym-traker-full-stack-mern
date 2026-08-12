import { Split } from '../models/Split.js'
import { Workout } from '../models/Workout.js'
import { Exercise } from '../models/Exercise.js'
import { AppConfig } from '../models/AppConfig.js'
import { sendSuccess, sendFail } from '../utils/apiResponse.js'

async function findOwnedSplit(splitId, userId) {
  return Split.findOne({ _id: splitId, userId })
}

async function findOwnedWorkout(id, userId) {
  return Workout.findOne({ _id: id, userId })
}

async function withExerciseCount(workout, userId) {
  return {
    ...workout.toSafeJSON(),
    exerciseCount: await Exercise.countDocuments({ workoutId: workout._id, userId }),
  }
}

export async function listWorkouts(req, res, next) {
  try {
    const userId = req.user.id
    const split = await findOwnedSplit(req.params.splitId, userId)
    if (!split) return sendFail(res, 'Split not found', 404)

    const workouts = await Workout.find({ splitId: split._id, userId }).sort({ createdAt: 1 })
    const items = await Promise.all(workouts.map(w => withExerciseCount(w, userId)))
    sendSuccess(res, { workouts: items })
  } catch (err) {
    next(err)
  }
}

export async function createWorkout(req, res, next) {
  try {
    const userId = req.user.id
    const split = await findOwnedSplit(req.params.splitId, userId)
    if (!split) return sendFail(res, 'Split not found', 404)

    const config = await AppConfig.ensureDefaults()
    const count = await Workout.countDocuments({ splitId: split._id, userId })
    if (count >= config.maxWorkoutsPerSplit) {
      return sendFail(res, `Workout limit reached (${config.maxWorkoutsPerSplit})`)
    }

    const workout = await Workout.create({
      userId,
      splitId: split._id,
      title: req.body.title,
    })

    sendSuccess(res, { workout: { ...workout.toSafeJSON(), exerciseCount: 0 } }, 201)
  } catch (err) {
    next(err)
  }
}

export async function updateWorkout(req, res, next) {
  try {
    const userId = req.user.id
    const workout = await findOwnedWorkout(req.params.id, userId)
    if (!workout) return sendFail(res, 'Workout not found', 404)

    if (req.body.title !== undefined) workout.title = req.body.title
    if (req.body.done !== undefined) workout.done = req.body.done
    await workout.save()

    sendSuccess(res, { workout: await withExerciseCount(workout, userId) })
  } catch (err) {
    next(err)
  }
}

export async function deleteWorkout(req, res, next) {
  try {
    const userId = req.user.id
    const workout = await findOwnedWorkout(req.params.id, userId)
    if (!workout) return sendFail(res, 'Workout not found', 404)

    await Exercise.deleteMany({ workoutId: workout._id, userId })
    await workout.deleteOne()

    sendSuccess(res, null)
  } catch (err) {
    next(err)
  }
}

export async function resetWorkouts(req, res, next) {
  try {
    const userId = req.user.id
    const split = await findOwnedSplit(req.params.splitId, userId)
    if (!split) return sendFail(res, 'Split not found', 404)

    await Workout.updateMany({ splitId: split._id, userId }, { done: false })
    sendSuccess(res, null)
  } catch (err) {
    next(err)
  }
}
