import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  listExercises,
  createExercise,
  updateExercise,
  deleteExercise as deleteExerciseRequest,
} from '@/api/exercises'
import { getData, apiMessage } from '@/api/envelope'
import { withLoader, confirm } from '@/features/ui/uiThunks'
import { snack } from '@/features/ui/uiSlice'
import { selectLimits, sessionCleared, logout, login } from '@/features/auth/authSlice'
import { findWorkoutAcrossSplits, loadDashboard } from '@/features/dashboard/dashboardSlice'

export function sanitizeWeight(value) {
  const cleaned = String(value ?? '').replace(/[^\d.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  return rest.length ? `${whole}.${rest.join('')}` : whole
}

export const loadDraft = createAsyncThunk(
  'workout/loadDraft',
  async (id, { dispatch, getState, rejectWithValue }) => {
    return withLoader(dispatch, async () => {
      try {
        if (!getState().dashboard.loaded) {
          const result = await dispatch(loadDashboard())
          if (loadDashboard.rejected.match(result)) {
            return rejectWithValue()
          }
        }
        const workout = await findWorkoutAcrossSplits(getState, id)
        if (!workout) return rejectWithValue()

        const data = getData(await listExercises(id))
        return {
          id: workout.id,
          title: workout.title,
          done: !!workout.done,
          exercises: data.exercises || [],
        }
      } catch {
        return rejectWithValue()
      }
    })
  }
)

export const toggleExercise = createAsyncThunk(
  'workout/toggleExercise',
  (exId, { dispatch, getState, rejectWithValue }) => {
    const ex = getState().workout.draft?.exercises.find(e => e.id === exId)
    if (!ex) return rejectWithValue()

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await updateExercise(exId, { done: !ex.done }))
        dispatch(
          snack.success(data.exercise.done ? `"${ex.name}" marked done` : `"${ex.name}" unmarked`)
        )
        return data.exercise
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not update exercise')))
        return rejectWithValue()
      }
    })
  }
)

export const saveExercise = createAsyncThunk(
  'workout/saveExercise',
  ({ mode, form }, { dispatch, getState, rejectWithValue }) => {
    const draft = getState().workout.draft
    if (!draft || !form?.name?.trim()) {
      dispatch(snack.warning('Exercise name is required'))
      return rejectWithValue()
    }

    if (mode !== 'edit') {
      const { maxExercisesPerWorkout } = selectLimits(getState())
      if (draft.exercises.length >= maxExercisesPerWorkout) {
        dispatch(snack.warning(`Exercise limit reached (${maxExercisesPerWorkout})`))
        return rejectWithValue()
      }
    }

    const weight = sanitizeWeight(form.weight)
    const body = {
      name: form.name.trim(),
      weight,
      weightUnit: form.weightUnit === 'lb' ? 'lb' : 'kg',
      description: form.description || '',
    }

    return withLoader(dispatch, async () => {
      try {
        if (mode === 'edit') {
          const data = getData(await updateExercise(form.id, body))
          dispatch(snack.success('Exercise updated'))
          return { mode: 'edit', exercise: data.exercise }
        }
        const data = getData(await createExercise(draft.id, body))
        dispatch(snack.success('Exercise added'))
        return { mode: 'add', exercise: data.exercise }
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not save exercise')))
        return rejectWithValue()
      }
    })
  }
)

export const deleteExercise = createAsyncThunk(
  'workout/deleteExercise',
  async (exId, { dispatch, getState, rejectWithValue }) => {
    const draft = getState().workout.draft
    if (!draft) return rejectWithValue()
    const name = draft.exercises.find(e => e.id === exId)?.name

    const ok = await dispatch(
      confirm({
        title: 'Delete exercise?',
        message: name
          ? `"${name}" will be removed from this workout.`
          : 'This exercise will be removed from this workout.',
        confirmLabel: 'Delete',
      })
    )
    if (!ok) return rejectWithValue()

    return withLoader(dispatch, async () => {
      try {
        getData(await deleteExerciseRequest(exId))
        dispatch(snack.success(name ? `"${name}" deleted` : 'Exercise deleted'))
        return exId
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not delete exercise')))
        return rejectWithValue()
      }
    })
  }
)

const initialState = { draft: null }

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    clearDraft: state => {
      state.draft = null
    },
  },
  extraReducers: b => {
    b.addCase(loadDraft.fulfilled, (s, { payload }) => {
      s.draft = payload
    })
    b.addCase(loadDraft.rejected, s => {
      s.draft = null
    })
    b.addCase(toggleExercise.fulfilled, (s, { payload }) => {
      const ex = s.draft?.exercises.find(e => e.id === payload.id)
      if (ex) Object.assign(ex, payload)
    })
    b.addCase(saveExercise.fulfilled, (s, { payload }) => {
      if (!s.draft) return
      if (payload.mode === 'edit') {
        const ex = s.draft.exercises.find(e => e.id === payload.exercise.id)
        if (ex) Object.assign(ex, payload.exercise)
      } else {
        s.draft.exercises.push(payload.exercise)
      }
    })
    b.addCase(deleteExercise.fulfilled, (s, { payload: exId }) => {
      if (!s.draft) return
      s.draft.exercises = s.draft.exercises.filter(e => e.id !== exId)
    })
    b.addCase(sessionCleared, () => initialState)
    b.addCase(logout.fulfilled, () => initialState)
    b.addCase(login.fulfilled, () => initialState)
  },
})

export const { clearDraft } = workoutSlice.actions
export const selectDraft = s => s.workout.draft
export default workoutSlice.reducer
