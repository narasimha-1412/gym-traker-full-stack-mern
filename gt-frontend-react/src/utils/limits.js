const LIMIT_MIN = 1
const LIMIT_MAX = 100

export function defaultLimits() {
  return {
    maxSplits: 20,
    maxWorkoutsPerSplit: 20,
    maxExercisesPerWorkout: 20,
  }
}

export function normalizeLimit(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, Math.round(n)))
}

export function normalizeLimits(input = {}) {
  const defaults = defaultLimits()
  return {
    maxSplits: normalizeLimit(input.maxSplits, defaults.maxSplits),
    maxWorkoutsPerSplit: normalizeLimit(input.maxWorkoutsPerSplit, defaults.maxWorkoutsPerSplit),
    maxExercisesPerWorkout: normalizeLimit(
      input.maxExercisesPerWorkout,
      defaults.maxExercisesPerWorkout
    ),
  }
}
