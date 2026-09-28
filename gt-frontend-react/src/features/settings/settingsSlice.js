import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { updateProfile, changePassword as changePasswordRequest } from '@/api/auth'
import { getConfig, updateConfig } from '@/api/configs'
import { bulkImportSplits } from '@/api/splits'
import { setAccessToken } from '@/api/accessToken'
import { getData, apiMessage } from '@/api/envelope'
import { withLoader, confirm } from '@/features/ui/uiThunks'
import { snack } from '@/features/ui/uiSlice'
import {
  profileUpdated,
  limitsChanged,
  selectLimits,
  selectIsAdmin,
  selectUser,
  tokenRefreshed,
  logout,
  sessionCleared,
  login,
} from '@/features/auth/authSlice'
import { clearDashboard } from '@/features/dashboard/dashboardSlice'

export const BULK_IMPORT_PROMPT = `You convert a gym training plan into JSON for GymTrakio.

OUTPUT RULES:
- Reply with ONLY valid JSON. No markdown, no commentary.
- Use EXACTLY this shape and these property names (no extras):

{
  "splits": [
    {
      "title": "string",
      "workouts": [
        {
          "title": "string",
          "exercises": [
            {
              "name": "string",
              "weight": "string",
              "weightUnit": "kg" | "lb",
              "description": "string"
            }
          ]
        }
      ]
    }
  ]
}

FIELD RULES:
- title, name: required, 1–80 characters
- weight: string only (e.g. "60" or "60.5" or ""). Never a number type.
- weightUnit: MUST be exactly "kg" or "lb". Nothing else (not "lbs", "KG", "pounds").
- description: optional notes/sets/reps as one string, max 500 chars, or ""
- Do NOT include: id, done, userId, splitId, workoutId, dates, sets[], reps as separate fields
- Do NOT invent splits/workouts/exercises that are not in the user's text
- If weight unit is unclear, use "kg"
- If weight is missing, use ""
- Empty workouts arrays are allowed
- Group days under one split when the user describes one program
- Split titles must be unique in the JSON and must not match an existing split
- Workout and exercise names may repeat
- Prefer one split object per program; put all training days under its workouts array

USER PLAN:
<<<paste your training notes here>>>`

const emptyPw = () => ({ current: '', next: '', confirm: '' })

export const enterSettings = createAsyncThunk(
  'settings/enter',
  (_, { dispatch, getState, rejectWithValue }) =>
    withLoader(dispatch, async () => {
      try {
        const user = selectUser(getState())
        const data = getData(await getConfig())
        dispatch(limitsChanged(data.config))
        return {
          profile: { name: user.name, email: user.email },
          limits: data.config,
        }
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not load settings')))
        return rejectWithValue()
      }
    })
)

export const loadSettingsConfigs = createAsyncThunk(
  'settings/loadConfigs',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = getData(await getConfig())
      dispatch(limitsChanged(data.config))
      return data.config
    } catch (err) {
      dispatch(snack.error(apiMessage(err, 'Could not load settings')))
      return rejectWithValue()
    }
  }
)

export const saveProfile = createAsyncThunk(
  'settings/saveProfile',
  (nameInput, { dispatch, getState, rejectWithValue }) => {
    const name = nameInput?.trim() || ''
    if (!name) {
      dispatch(snack.warning('Username is required'))
      return rejectWithValue()
    }
    if (name.length < 2) {
      dispatch(snack.warning('Username must be at least 2 characters'))
      return rejectWithValue()
    }
    if (name === selectUser(getState()).name) {
      dispatch(snack.warning('No changes to save'))
      return rejectWithValue()
    }

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await updateProfile({ name }))
        dispatch(profileUpdated({ name: data.user.name }))
        dispatch(snack.success('Profile updated'))
        return { name: data.user.name, email: data.user.email }
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not update profile')))
        return rejectWithValue()
      }
    })
  }
)

export const saveConfigs = createAsyncThunk(
  'settings/saveConfigs',
  (configs, { dispatch, getState, rejectWithValue }) => {
    if (!selectIsAdmin(getState())) {
      dispatch(snack.error('Only admins can update configs'))
      return rejectWithValue()
    }

    const next = {
      maxSplits: configs.maxSplits,
      maxWorkoutsPerSplit: configs.maxWorkoutsPerSplit,
      maxExercisesPerWorkout: configs.maxExercisesPerWorkout,
    }
    const current = selectLimits(getState())
    const same =
      Number(next.maxSplits) === current.maxSplits &&
      Number(next.maxWorkoutsPerSplit) === current.maxWorkoutsPerSplit &&
      Number(next.maxExercisesPerWorkout) === current.maxExercisesPerWorkout

    if (same) {
      dispatch(snack.warning('No changes to save'))
      return rejectWithValue()
    }

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await updateConfig(next))
        dispatch(limitsChanged(data.config))
        dispatch(snack.success('Configs updated'))
        return data.config
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not update configs')))
        return rejectWithValue()
      }
    })
  }
)

export const changePassword = createAsyncThunk(
  'settings/changePassword',
  (pw, { dispatch, rejectWithValue }) => {
    const { current, next, confirm: confirmPw } = pw

    if (!current || !next || !confirmPw) {
      dispatch(snack.warning('Fill in all password fields'))
      return rejectWithValue()
    }
    if (next !== confirmPw) {
      dispatch(snack.error('Passwords do not match'))
      return rejectWithValue()
    }
    if (next.length < 4) {
      dispatch(snack.warning('Password must be at least 4 characters'))
      return rejectWithValue()
    }
    if (next === current) {
      dispatch(snack.warning('New password must be different'))
      return rejectWithValue()
    }

    return withLoader(dispatch, async () => {
      try {
        const data = getData(
          await changePasswordRequest({
            currentPassword: current,
            newPassword: next,
          })
        )
        setAccessToken(data.accessToken)
        dispatch(tokenRefreshed(data.accessToken))
        dispatch(snack.success('Password updated'))
        return true
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not update password')))
        return rejectWithValue()
      }
    })
  }
)

export const logoutFromSettings = createAsyncThunk(
  'settings/logout',
  async (_, { dispatch, rejectWithValue }) => {
    const ok = await dispatch(
      confirm({
        title: 'Log out?',
        message: "You'll need to sign in again to continue tracking.",
        confirmLabel: 'Log out',
      })
    )
    if (!ok) return rejectWithValue()

    return withLoader(dispatch, async () => {
      dispatch(clearDashboard())
      await dispatch(logout())
      dispatch(snack.info('Logged out'))
      return true
    })
  }
)

export const copyBulkPrompt = createAsyncThunk(
  'settings/copyBulkPrompt',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await navigator.clipboard.writeText(BULK_IMPORT_PROMPT)
      dispatch(snack.success('Prompt copied'))
      return true
    } catch {
      dispatch(snack.error('Could not copy prompt'))
      return rejectWithValue()
    }
  }
)

export const submitBulkImport = createAsyncThunk(
  'settings/submitBulkImport',
  (rawJson, { dispatch, rejectWithValue }) => {
    const raw = rawJson?.trim() || ''
    if (!raw) {
      dispatch(snack.warning('Paste JSON first'))
      return rejectWithValue()
    }

    let body
    try {
      body = JSON.parse(raw)
    } catch {
      dispatch(snack.warning('Invalid JSON'))
      return rejectWithValue()
    }

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await bulkImportSplits(body))
        const c = data.created || {}
        dispatch(
          snack.success(
            `Added ${c.splits || 0} splits, ${c.workouts || 0} workouts, ${c.exercises || 0} exercises`
          )
        )
        return true
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not import plan')))
        return rejectWithValue()
      }
    })
  }
)

const initialState = {
  profile: { name: '', email: '' },
  pw: emptyPw(),
  configs: {
    maxSplits: 20,
    maxWorkoutsPerSplit: 20,
    maxExercisesPerWorkout: 20,
  },
  bulkJson: '',
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    profileFormSet(state, { payload }) {
      state.profile = { ...state.profile, ...payload }
    },
    pwFormSet(state, { payload }) {
      state.pw = { ...state.pw, ...payload }
    },
    pwFormReset(state) {
      state.pw = emptyPw()
    },
    configsFormSet(state, { payload }) {
      state.configs = { ...state.configs, ...payload }
    },
    configsFromLimits(state, { payload }) {
      state.configs = {
        maxSplits: payload.maxSplits,
        maxWorkoutsPerSplit: payload.maxWorkoutsPerSplit,
        maxExercisesPerWorkout: payload.maxExercisesPerWorkout,
      }
    },
    bulkJsonSet(state, { payload }) {
      state.bulkJson = payload
    },
    syncProfileFromUser(state, { payload }) {
      state.profile = { name: payload.name, email: payload.email }
    },
    resetSettingsForm: () => initialState,
  },
  extraReducers: b => {
    b.addCase(enterSettings.fulfilled, (s, { payload }) => {
      s.profile = payload.profile
      s.pw = emptyPw()
      if (payload.limits) {
        s.configs = {
          maxSplits: payload.limits.maxSplits ?? s.configs.maxSplits,
          maxWorkoutsPerSplit: payload.limits.maxWorkoutsPerSplit ?? s.configs.maxWorkoutsPerSplit,
          maxExercisesPerWorkout:
            payload.limits.maxExercisesPerWorkout ?? s.configs.maxExercisesPerWorkout,
        }
      }
    })
    b.addCase(loadSettingsConfigs.fulfilled, (s, { payload }) => {
      s.configs = {
        maxSplits: payload.maxSplits,
        maxWorkoutsPerSplit: payload.maxWorkoutsPerSplit,
        maxExercisesPerWorkout: payload.maxExercisesPerWorkout,
      }
    })
    b.addCase(saveProfile.fulfilled, (s, { payload }) => {
      s.profile = payload
    })
    b.addCase(saveConfigs.fulfilled, (s, { payload }) => {
      s.configs = {
        maxSplits: payload.maxSplits,
        maxWorkoutsPerSplit: payload.maxWorkoutsPerSplit,
        maxExercisesPerWorkout: payload.maxExercisesPerWorkout,
      }
    })
    b.addCase(changePassword.fulfilled, s => {
      s.pw = emptyPw()
    })
    b.addCase(submitBulkImport.fulfilled, s => {
      s.bulkJson = ''
    })
    b.addCase(sessionCleared, () => initialState)
    b.addCase(logout.fulfilled, () => initialState)
    b.addCase(login.fulfilled, () => initialState)
  },
})

export const {
  profileFormSet,
  pwFormSet,
  pwFormReset,
  configsFormSet,
  configsFromLimits,
  bulkJsonSet,
  syncProfileFromUser,
  resetSettingsForm,
} = settingsSlice.actions

export default settingsSlice.reducer
