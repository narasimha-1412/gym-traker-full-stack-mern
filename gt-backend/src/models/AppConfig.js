import mongoose from 'mongoose'

const LIMIT_MIN = 1
const LIMIT_MAX = 100

const clampLimit = (value, fallback) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, Math.round(n)))
}

const appConfigSchema = new mongoose.Schema(
  {
    maxSplits: { type: Number, default: 20, min: LIMIT_MIN, max: LIMIT_MAX },
    maxWorkoutsPerSplit: { type: Number, default: 20, min: LIMIT_MIN, max: LIMIT_MAX },
    maxExercisesPerWorkout: { type: Number, default: 20, min: LIMIT_MIN, max: LIMIT_MAX },
  },
  { timestamps: true }
)

appConfigSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    maxSplits: this.maxSplits,
    maxWorkoutsPerSplit: this.maxWorkoutsPerSplit,
    maxExercisesPerWorkout: this.maxExercisesPerWorkout,
  }
}

appConfigSchema.statics.normalizeLimits = function normalizeLimits(input = {}) {
  return {
    maxSplits: clampLimit(input.maxSplits, 20),
    maxWorkoutsPerSplit: clampLimit(input.maxWorkoutsPerSplit, 20),
    maxExercisesPerWorkout: clampLimit(input.maxExercisesPerWorkout, 20),
  }
}

/** Ensure a single AppConfig document exists (global limits). */
appConfigSchema.statics.ensureDefaults = async function ensureDefaults() {
  let config = await this.findOne()
  if (!config) {
    config = await this.create({})
  }
  return config
}

export const AppConfig = mongoose.model('AppConfig', appConfigSchema)
