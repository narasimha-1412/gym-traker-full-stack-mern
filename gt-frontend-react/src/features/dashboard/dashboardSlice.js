import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import {
  listSplits,
  createSplit,
  renameSplit as renameSplitRequest,
  deleteSplit as deleteSplitRequest,
  activateSplit,
} from '@/api/splits'
import {
  listWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout as deleteWorkoutRequest,
  resetWorkouts,
} from '@/api/workouts'
import { getData, apiMessage } from '@/api/envelope'
import { withLoader, confirm } from '@/features/ui/uiThunks'
import { snack } from '@/features/ui/uiSlice'
import {
  activeSplitChanged,
  sessionCleared,
  logout,
  login,
  selectLimits,
} from '@/features/auth/authSlice'

const initialState = {
  splits: [],
  workouts: [],
  activeSplitId: null,
  loaded: false,
}

export const loadDashboard = createAsyncThunk(
  'dashboard/load',
  (_, { dispatch, getState, rejectWithValue }) =>
    withLoader(dispatch, async () => {
      try {
        const { splits = [] } = getData(await listSplits())
        let activeSplitId = getState().auth.user.activeSplitId || splits[0]?.id || null
        if (activeSplitId && !splits.some(s => s.id === activeSplitId)) {
          activeSplitId = splits[0]?.id || null
          dispatch(activeSplitChanged(activeSplitId))
        }
        const workouts = activeSplitId
          ? getData(await listWorkouts(activeSplitId)).workouts || []
          : []
        return { splits, workouts, activeSplitId }
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not load training data')))
        return rejectWithValue()
      }
    })
)

export const setActiveSplit = createAsyncThunk(
  'dashboard/setActiveSplit',
  (id, { dispatch, getState, rejectWithValue }) => {
    const split = getState().dashboard.splits.find(s => s.id === id)
    if (!split) return rejectWithValue()
    if (split.id === getState().dashboard.activeSplitId) return { same: true, split }

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await activateSplit(id))
        dispatch(activeSplitChanged(data.activeSplitId))
        const workouts = data.activeSplitId
          ? getData(await listWorkouts(data.activeSplitId)).workouts || []
          : []
        dispatch(snack.success(`Switched to ${split.title}`))
        return { activeSplitId: data.activeSplitId, workouts, same: false }
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not switch split')))
        return rejectWithValue()
      }
    })
  }
)

export const addSplit = createAsyncThunk(
  'dashboard/addSplit',
  (title, { dispatch, getState, rejectWithValue }) => {
    const name = title?.trim()
    if (!name) {
      dispatch(snack.warning('Enter a split name'))
      return rejectWithValue()
    }

    const { maxSplits } = selectLimits(getState())
    if (getState().dashboard.splits.length >= maxSplits) {
      dispatch(snack.warning(`Split limit reached (${maxSplits})`))
      return rejectWithValue()
    }

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await createSplit({ title: name }))
        if (data.activeSplitId) dispatch(activeSplitChanged(data.activeSplitId))
        dispatch(snack.success(`Split "${name}" created`))
        return data
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not create split')))
        return rejectWithValue()
      }
    })
  }
)

export const addWorkout = createAsyncThunk(
  'dashboard/addWorkout',
  (title, { dispatch, getState, rejectWithValue }) => {
    const { activeSplitId, splits, workouts } = getState().dashboard
    const split = splits.find(s => s.id === activeSplitId)
    if (!split) {
      dispatch(snack.warning('Create a split first'))
      return rejectWithValue('need-split')
    }

    const name = title?.trim()
    if (!name) {
      dispatch(snack.warning('Enter a workout title'))
      return rejectWithValue()
    }

    const { maxWorkoutsPerSplit } = selectLimits(getState())
    if (workouts.length >= maxWorkoutsPerSplit) {
      dispatch(snack.warning(`Workout limit reached (${maxWorkoutsPerSplit})`))
      return rejectWithValue()
    }

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await createWorkout(split.id, { title: name }))
        dispatch(snack.success(`Workout "${name}" created`))
        return data.workout
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not create workout')))
        return rejectWithValue()
      }
    })
  }
)

export const renameWorkout = createAsyncThunk(
  'dashboard/renameWorkout',
  ({ id, title }, { dispatch, getState, rejectWithValue }) => {
    const name = title?.trim()
    if (!name) {
      dispatch(snack.warning('Enter a workout title'))
      return rejectWithValue()
    }
    if (!getState().dashboard.workouts.find(w => w.id === id)) return rejectWithValue()

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await updateWorkout(id, { title: name }))
        dispatch(snack.success('Workout renamed'))
        return data.workout
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not rename workout')))
        return rejectWithValue()
      }
    })
  }
)

export const renameSplit = createAsyncThunk(
  'dashboard/renameSplit',
  ({ id, title }, { dispatch, getState, rejectWithValue }) => {
    const name = title?.trim()
    if (!name) {
      dispatch(snack.warning('Enter a split name'))
      return rejectWithValue()
    }
    if (!getState().dashboard.splits.find(s => s.id === id)) return rejectWithValue()

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await renameSplitRequest(id, { title: name }))
        dispatch(snack.success('Split renamed'))
        return data.split
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not rename split')))
        return rejectWithValue()
      }
    })
  }
)

export const toggleWorkout = createAsyncThunk(
  'dashboard/toggleWorkout',
  (id, { dispatch, getState, rejectWithValue }) => {
    const w = getState().dashboard.workouts.find(x => x.id === id)
    if (!w) return rejectWithValue()

    return withLoader(dispatch, async () => {
      try {
        const { workout } = getData(await updateWorkout(id, { done: !w.done }))
        dispatch(snack.success(workout.done ? `"${w.title}" marked done` : `"${w.title}" unmarked`))
        return workout
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not update workout')))
        return rejectWithValue()
      }
    })
  }
)

export const deleteWorkout = createAsyncThunk(
  'dashboard/deleteWorkout',
  async (id, { dispatch, getState, rejectWithValue }) => {
    const w = getState().dashboard.workouts.find(x => x.id === id)
    if (!w) return rejectWithValue()

    const ok = await dispatch(
      confirm({
        title: 'Delete workout?',
        message: `"${w.title}" and its exercises will be removed.`,
        confirmLabel: 'Delete',
      })
    )
    if (!ok) return rejectWithValue()

    return withLoader(dispatch, async () => {
      try {
        getData(await deleteWorkoutRequest(id))
        dispatch(snack.success(`"${w.title}" deleted`))
        return id
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not delete workout')))
        return rejectWithValue()
      }
    })
  }
)

export const deleteSplit = createAsyncThunk(
  'dashboard/deleteSplit',
  async (id, { dispatch, getState, rejectWithValue }) => {
    const s = getState().dashboard.splits.find(x => x.id === id)
    if (!s) return rejectWithValue()

    const ok = await dispatch(
      confirm({
        title: 'Delete split?',
        message: `"${s.title}" and all its workouts will be removed.`,
        confirmLabel: 'Delete',
      })
    )
    if (!ok) return rejectWithValue()

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await deleteSplitRequest(id))
        dispatch(activeSplitChanged(data.activeSplitId))
        const workouts = data.activeSplitId
          ? getData(await listWorkouts(data.activeSplitId)).workouts || []
          : []
        dispatch(snack.success(`"${s.title}" deleted`))
        return { id, activeSplitId: data.activeSplitId, workouts }
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not delete split')))
        return rejectWithValue()
      }
    })
  }
)

export const resetProgress = createAsyncThunk(
  'dashboard/resetProgress',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const { splits, activeSplitId, workouts } = getState().dashboard
    const split = splits.find(s => s.id === activeSplitId)
    if (!split) {
      dispatch(snack.info('Create a split first'))
      return rejectWithValue()
    }

    const done = workouts.filter(w => w.done).length
    if (!done) {
      dispatch(snack.info('Progress is already clear'))
      return rejectWithValue()
    }

    const ok = await dispatch(
      confirm({
        title: 'Reset progress?',
        message: `All completed workouts and exercises in "${split.title}" will be unmarked.`,
        confirmLabel: 'Reset',
      })
    )
    if (!ok) return rejectWithValue()

    return withLoader(dispatch, async () => {
      try {
        getData(await resetWorkouts(split.id))
        dispatch(snack.success('Progress reset'))
        return true
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not reset progress')))
        return rejectWithValue()
      }
    })
  }
)

export const openWorkout = createAsyncThunk('dashboard/openWorkout', (id, { dispatch }) =>
  withLoader(dispatch, async () => id)
)

export async function findWorkoutAcrossSplits(getState, id) {
  const { workouts, splits, activeSplitId } = getState().dashboard
  const local = workouts.find(w => w.id === id)
  if (local) return local

  for (const split of splits) {
    if (split.id === activeSplitId) continue
    const data = getData(await listWorkouts(split.id))
    const found = (data.workouts || []).find(w => w.id === id)
    if (found) return found
  }
  return null
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: () => initialState,
  },
  extraReducers: b => {
    b.addCase(loadDashboard.fulfilled, (s, { payload }) => {
      if (!payload) return
      Object.assign(s, payload, { loaded: true })
    })
    b.addCase(setActiveSplit.fulfilled, (s, { payload }) => {
      if (payload.same) return
      s.activeSplitId = payload.activeSplitId
      s.workouts = payload.workouts
    })
    b.addCase(addSplit.fulfilled, (s, { payload }) => {
      s.splits.push(payload.split)
      if (payload.activeSplitId) {
        s.activeSplitId = payload.activeSplitId
        if (payload.activeSplitId === payload.split.id) s.workouts = []
      }
    })
    b.addCase(addWorkout.fulfilled, (s, { payload }) => {
      s.workouts.push(payload)
      const split = s.splits.find(x => x.id === s.activeSplitId)
      if (split) split.workoutCount = (split.workoutCount || 0) + 1
    })
    b.addCase(renameWorkout.fulfilled, (s, { payload }) => {
      const i = s.workouts.findIndex(w => w.id === payload.id)
      if (i >= 0) s.workouts[i] = payload
    })
    b.addCase(renameSplit.fulfilled, (s, { payload }) => {
      const i = s.splits.findIndex(x => x.id === payload.id)
      if (i >= 0) s.splits[i] = payload
    })
    b.addCase(toggleWorkout.fulfilled, (s, { payload }) => {
      const i = s.workouts.findIndex(w => w.id === payload.id)
      if (i >= 0) s.workouts[i] = payload
    })
    b.addCase(deleteWorkout.fulfilled, (s, { payload: id }) => {
      s.workouts = s.workouts.filter(w => w.id !== id)
      const split = s.splits.find(x => x.id === s.activeSplitId)
      if (split) split.workoutCount = Math.max(0, (split.workoutCount || 1) - 1)
    })
    b.addCase(deleteSplit.fulfilled, (s, { payload }) => {
      s.splits = s.splits.filter(item => item.id !== payload.id)
      s.activeSplitId = payload.activeSplitId
      s.workouts = payload.workouts
    })
    b.addCase(resetProgress.fulfilled, s => {
      s.workouts.forEach(w => {
        w.done = false
      })
    })
    b.addCase(sessionCleared, () => initialState)
    b.addCase(logout.fulfilled, () => initialState)
    b.addCase(login.fulfilled, () => initialState)
  },
})

export const { clearDashboard } = dashboardSlice.actions

export const selectSplits = s => s.dashboard.splits
export const selectWorkouts = s => s.dashboard.workouts
export const selectActiveSplitId = s => s.dashboard.activeSplitId
export const selectActiveSplit = s =>
  s.dashboard.splits.find(x => x.id === s.dashboard.activeSplitId) || null

export const selectProgress = createSelector([selectWorkouts], workouts => {
  const total = workouts.length
  const done = workouts.filter(w => w.done).length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
})

export default dashboardSlice.reducer
