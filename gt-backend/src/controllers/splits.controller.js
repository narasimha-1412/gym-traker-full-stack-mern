import { Split } from '../models/Split.js'
import { Workout } from '../models/Workout.js'
import { Exercise } from '../models/Exercise.js'
import { User } from '../models/User.js'
import { AppConfig } from '../models/AppConfig.js'
import { sendSuccess, sendFail } from '../utils/apiResponse.js'

async function findOwnedSplit(id, userId) {
  return Split.findOne({ _id: id, userId })
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
    const split = await findOwnedSplit(req.params.id, req.user.id)
    if (!split) return sendFail(res, 'Split not found', 404)

    split.title = req.body.title
    await split.save()

    sendSuccess(res, {
      split: {
        ...split.toSafeJSON(),
        workoutCount: await Workout.countDocuments({ splitId: split._id, userId: req.user.id }),
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
