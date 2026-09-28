import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { setAccessToken } from '@/api/accessToken'
import { login as loginRequest, refresh, me, logout as logoutRequest } from '@/api/auth'
import { getConfig } from '@/api/configs'
import { getData, apiMessage } from '@/api/envelope'
import { defaultLimits, normalizeLimits } from '@/utils/limits'
import { withLoader } from '@/features/ui/uiThunks'
import { snack } from '@/features/ui/uiSlice'

const emptyUser = () => ({
  name: '',
  email: '',
  avatar: '',
  role: 'user',
  status: 'active',
  activeSplitId: null,
})

async function fetchLimits() {
  try {
    return normalizeLimits(getData(await getConfig()).config)
  } catch {
    return defaultLimits()
  }
}

export const bootstrap = createAsyncThunk('auth/bootstrap', async () => {
  try {
    const { accessToken } = getData(await refresh())
    setAccessToken(accessToken)
    const { user } = getData(await me())
    return { user, accessToken, limits: await fetchLimits() }
  } catch (err) {
    setAccessToken(null)
    throw err
  }
})

export const login = createAsyncThunk(
  'auth/login',
  ({ email, password }, { dispatch, rejectWithValue }) => {
    const trimmed = email?.trim() || ''
    if (!trimmed || !password?.trim()) {
      dispatch(snack.error('Enter a valid email and password'))
      return rejectWithValue()
    }
    if (!trimmed.includes('@')) {
      dispatch(snack.error('Invalid login details'))
      return rejectWithValue()
    }

    return withLoader(dispatch, async () => {
      try {
        const { user, accessToken } = getData(await loginRequest(trimmed, password))
        setAccessToken(accessToken)
        const limits = await fetchLimits()
        dispatch(snack.success('Welcome back'))
        return { user, accessToken, limits }
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Invalid login details')))
        return rejectWithValue()
      }
    })
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutRequest()
  } catch {
    // still clear local session
  }
  setAccessToken(null)
})

const initialState = {
  loggedIn: false,
  accessToken: null,
  bootstrapped: false,
  user: emptyUser(),
  limits: defaultLimits(),
}

function startSession(state, { user, accessToken, limits }) {
  state.loggedIn = true
  state.accessToken = accessToken
  state.user = {
    ...emptyUser(),
    ...user,
    avatar: (user.name || '').charAt(0).toUpperCase(),
  }
  state.limits = limits
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    tokenRefreshed(state, { payload }) {
      state.accessToken = payload
    },
    sessionCleared: state => ({ ...initialState, bootstrapped: state.bootstrapped }),
    activeSplitChanged(state, { payload }) {
      state.user.activeSplitId = payload || null
    },
    limitsChanged(state, { payload }) {
      state.limits = normalizeLimits(payload)
    },
    profileUpdated(state, { payload: { name } }) {
      const trimmed = name?.trim() || ''
      if (trimmed) {
        state.user.name = trimmed
        state.user.avatar = trimmed.charAt(0).toUpperCase()
      }
    },
  },
  extraReducers: b => {
    b.addCase(bootstrap.fulfilled, (state, { payload }) => {
      startSession(state, payload)
      state.bootstrapped = true
    })
    b.addCase(bootstrap.rejected, () => ({ ...initialState, bootstrapped: true }))
    b.addCase(login.fulfilled, (state, { payload }) => startSession(state, payload))
    b.addCase(logout.fulfilled, state => ({
      ...initialState,
      bootstrapped: state.bootstrapped,
    }))
  },
})

export const { tokenRefreshed, sessionCleared, activeSplitChanged, limitsChanged, profileUpdated } =
  authSlice.actions

export const selectUser = s => s.auth.user
export const selectLoggedIn = s => s.auth.loggedIn
export const selectIsAdmin = s => s.auth.user.role === 'admin'
export const selectLimits = s => s.auth.limits

export default authSlice.reducer
