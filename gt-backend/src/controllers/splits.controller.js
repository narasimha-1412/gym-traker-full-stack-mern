import mongoose from 'mongoose'
import { Split } from '../models/Split.js'
import { Workout } from '../models/Workout.js'
import { Exercise } from '../models/Exercise.js'
import { User } from '../models/User.js'
import { AppConfig } from '../models/AppConfig.js'
import { sendSuccess, sendFail } from '../utils/apiResponse.js'

const norm = s => String(s).trim().toLowerCase()

async function findOwnedSplit(id, userId) {
  return Split.findOne({ _id: id, userId })
}

async function findSplitByTitle(userId, title, excludeId = null) {
  const splits = await Split.find({ userId })
  const key = norm(title)
  return splits.find(s => norm(s.title) === key && (!excludeId || !s._id.equals(excludeId))) || null
}

export async function listSplits(req, res, next) {
  try {
    const userId = req.user.id
    const splits = await Split.find({ userId }).sort({ createdAt: 1 })
    const items = await Promise.all(
      splits.map(async s => ({
        ...s.toSafeJSON(),
        workoutCount: await Workout.countDocuments({ splitId: s._id, userId }),
      }))
    )
    sendSuccess(res, { splits: items })
  } catch (err) {
    next(err)
  }
}

export async function createSplit(req, res, next) {
  try {
    const userId = req.user.id
    const title = req.body.title
    const config = await AppConfig.ensureDefaults()
    const count = await Split.countDocuments({ userId })

    if (count >= config.maxSplits) {
      return sendFail(res, `Split limit reached (${config.maxSplits})`)
    }

    const titleTaken = await findSplitByTitle(userId, title)
    if (titleTaken) return sendFail(res, `Split "${title}" already exists`)

    const split = await Split.create({ userId, title })
    const user = await User.findById(userId)
    if (user && !user.activeSplitId) {
      user.activeSplitId = split._id
      await user.save()
    }

    sendSuccess(
      res,
      {
        split: { ...split.toSafeJSON(), workoutCount: 0 },
        activeSplitId: user?.activeSplitId?.toString() ?? null,
      },
      201
    )
  } catch (err) {
    next(err)
  }
}

export async function renameSplit(req, res, next) {
  try {
    const userId = req.user.id
    const split = await findOwnedSplit(req.params.id, userId)
    if (!split) return sendFail(res, 'Split not found', 404)

    const title = req.body.title
    const titleTaken = await findSplitByTitle(userId, title, split._id)
    if (titleTaken) return sendFail(res, `Split "${title}" already exists`)

    split.title = title
    await split.save()

    sendSuccess(res, {
      split: {
        ...split.toSafeJSON(),
        workoutCount: await Workout.countDocuments({ splitId: split._id, userId }),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteSplit(req, res, next) {
  try {
    const userId = req.user.id
    const split = await findOwnedSplit(req.params.id, userId)
    if (!split) return sendFail(res, 'Split not found', 404)

    const workouts = await Workout.find({ splitId: split._id, userId }).select('_id')
    const workoutIds = workouts.map(w => w._id)
    if (workoutIds.length) {
      await Exercise.deleteMany({ workoutId: { $in: workoutIds }, userId })
      await Workout.deleteMany({ splitId: split._id, userId })
    }
    await split.deleteOne()

    const user = await User.findById(userId)
    let activeSplitId = user?.activeSplitId?.toString() ?? null
    if (user && activeSplitId === split._id.toString()) {
      const next = await Split.findOne({ userId }).sort({ createdAt: 1 })
      user.activeSplitId = next?._id ?? null
      await user.save()
      activeSplitId = user.activeSplitId?.toString() ?? null
    }

    sendSuccess(res, { activeSplitId })
  } catch (err) {
    next(err)
  }
}

export async function activateSplit(req, res, next) {
  try {
    const split = await findOwnedSplit(req.params.id, req.user.id)
    if (!split) return sendFail(res, 'Split not found', 404)

    await User.findByIdAndUpdate(req.user.id, { activeSplitId: split._id })
    sendSuccess(res, { activeSplitId: split._id.toString(), split: split.toSafeJSON() })
  } catch (err) {
    next(err)
  }
}

/** Create-only splits → workouts → exercises. Rejects existing split titles. */
export async function bulkImport(req, res, next) {
  try {
    const userId = req.user.id
    const incoming = req.body.splits
    const config = await AppConfig.ensureDefaults()

    const seenSplits = new Set()
    for (const s of incoming) {
      const sKey = norm(s.title)
      if (seenSplits.has(sKey)) {
        return sendFail(res, `Duplicate split "${s.title}" in import`)
      }
      seenSplits.add(sKey)
    }

    const splits = await Split.find({ userId })
    const splitMap = new Map(splits.map(s => [norm(s.title), s]))

    for (const s of incoming) {
      if (splitMap.has(norm(s.title))) {
        return sendFail(res, `Split "${s.title}" already exists`)
      }
    }

    if (splits.length + incoming.length > config.maxSplits) {
      return sendFail(res, `Split limit reached (${config.maxSplits})`)
    }

    const createSplits = []
    const createWorkouts = []
    const createExercises = []

    for (const s of incoming) {
      const sKey = norm(s.title)
      if (s.workouts.length > config.maxWorkoutsPerSplit) {
        return sendFail(
          res,
          `Workout limit reached for split "${s.title}" (${config.maxWorkoutsPerSplit})`
        )
      }

      createSplits.push({ title: s.title })

      for (let wIndex = 0; wIndex < s.workouts.length; wIndex += 1) {
        const w = s.workouts[wIndex]
        if (w.exercises.length > config.maxExercisesPerWorkout) {
          return sendFail(
            res,
            `Exercise limit reached for workout "${w.title}" (${config.maxExercisesPerWorkout})`
          )
        }
        const workoutRef = `${sKey}::${wIndex}`
        createWorkouts.push({ splitKey: sKey, title: w.title, workoutRef })
        for (const e of w.exercises) {
          createExercises.push({
            workoutRef,
            name: e.name,
            weight: e.weight ?? '',
            weightUnit: e.weightUnit ?? 'kg',
            description: e.description ?? '',
          })
        }
      }
    }

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const splitIdByKey = new Map()
      for (const row of createSplits) {
        const [doc] = await Split.create([{ userId, title: row.title }], { session })
        splitIdByKey.set(norm(row.title), doc._id)
      }

      const workoutIdByRef = new Map()
      for (const row of createWorkouts) {
        const splitId = splitIdByKey.get(row.splitKey)
        const [doc] = await Workout.create(
          [{ userId, splitId, title: row.title }],
          { session }
        )
        workoutIdByRef.set(row.workoutRef, doc._id)
      }

      for (const row of createExercises) {
        await Exercise.create(
          [
            {
              userId,
              workoutId: workoutIdByRef.get(row.workoutRef),
              name: row.name,
              weight: row.weight,
              weightUnit: row.weightUnit,
              description: row.description,
            },
          ],
          { session }
        )
      }

      await session.commitTransaction()
    } catch (err) {
      await session.abortTransaction()
      throw err
    } finally {
      session.endSession()
    }

    sendSuccess(
      res,
      {
        created: {
          splits: createSplits.length,
          workouts: createWorkouts.length,
          exercises: createExercises.length,
        },
      },
      201
    )
  } catch (err) {
    next(err)
  }
}
