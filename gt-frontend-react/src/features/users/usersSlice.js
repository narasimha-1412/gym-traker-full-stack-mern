import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  listUsers,
  createUser,
  toggleStatus as toggleStatusRequest,
  resetPassword as resetPasswordRequest,
  deleteUser as deleteUserRequest,
} from '@/api/users'
import { getData, apiMessage } from '@/api/envelope'
import { withLoader, confirm } from '@/features/ui/uiThunks'
import { snack } from '@/features/ui/uiSlice'
import { selectUser, sessionCleared, logout, login } from '@/features/auth/authSlice'

export const DEFAULT_PASSWORD = 'GymTrakio123'
export const EMAIL_DOMAIN = 'gymtrakio.com'

const SEARCH_DEBOUNCE_MS = 300
let searchTimer = null

export function nameToEmailLocal(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''

  return parts
    .map((part, i) => {
      const lower = part.toLowerCase()
      if (i === 0) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

export function emailFromName(name) {
  const local = nameToEmailLocal(name)
  return local ? `${local}@${EMAIL_DOMAIN}` : ''
}

export const fetchUsers = createAsyncThunk(
  'users/fetchList',
  async ({ quiet = false } = {}, { dispatch, getState, rejectWithValue }) => {
    const run = async () => {
      try {
        const data = getData(await listUsers({ search: getState().users.search }))
        return data.users
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not load users')))
        return rejectWithValue()
      }
    }

    if (quiet) return run()
    return withLoader(dispatch, run)
  }
)

export const setUserSearch = value => dispatch => {
  dispatch(searchChanged(value ?? ''))
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    dispatch(fetchUsers({ quiet: true }))
  }, SEARCH_DEBOUNCE_MS)
}

export const clearUserSearch = () => dispatch => {
  dispatch(searchChanged(''))
  clearTimeout(searchTimer)
  dispatch(fetchUsers({ quiet: true }))
}

export const createUserAction = createAsyncThunk(
  'users/create',
  (_, { dispatch, getState, rejectWithValue }) => {
    const { name: rawName, password } = getState().users
    const name = rawName.trim()
    const email = emailFromName(name)

    if (!name) {
      dispatch(snack.error('Enter a name'))
      return rejectWithValue()
    }
    if (!email) {
      dispatch(snack.error('Could not generate email from name'))
      return rejectWithValue()
    }
    if (!password || password.length < 4) {
      dispatch(snack.warning('Password must be at least 4 characters'))
      return rejectWithValue()
    }

    return withLoader(dispatch, async () => {
      try {
        await createUser({ name, email, password })
        dispatch(snack.success('User created'))
        await dispatch(fetchUsers({ quiet: true }))
        return true
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not create user')))
        return rejectWithValue()
      }
    })
  }
)

export const toggleUserStatus = createAsyncThunk(
  'users/toggleStatus',
  (id, { dispatch, getState, rejectWithValue }) => {
    const user = getState().users.list.find(u => u.id === id)
    if (!user || user.role === 'admin') return rejectWithValue()

    if (user.email === selectUser(getState()).email) {
      dispatch(snack.warning('You cannot disable your own account'))
      return rejectWithValue()
    }

    return withLoader(dispatch, async () => {
      try {
        const data = getData(await toggleStatusRequest(id))
        dispatch(snack.success(data.user.status === 'active' ? 'User enabled' : 'User disabled'))
        return data.user
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not update user')))
        return rejectWithValue()
      }
    })
  }
)

export const resetUserPassword = createAsyncThunk(
  'users/resetPassword',
  (id, { dispatch, rejectWithValue }) =>
    withLoader(dispatch, async () => {
      try {
        await resetPasswordRequest(id)
        dispatch(snack.success('Password reset successfully'))
        return true
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not reset password')))
        return rejectWithValue()
      }
    })
)

export const deleteUserAction = createAsyncThunk(
  'users/delete',
  async (id, { dispatch, getState, rejectWithValue }) => {
    const user = getState().users.list.find(u => u.id === id)
    if (!user || user.role === 'admin') return rejectWithValue()

    if (user.email === selectUser(getState()).email) {
      dispatch(snack.warning('You cannot delete your own account'))
      return rejectWithValue()
    }

    const ok = await dispatch(
      confirm({
        title: 'Delete user?',
        message: `"${user.name}" and all their training data will be permanently removed.`,
        confirmLabel: 'Delete',
      })
    )
    if (!ok) return rejectWithValue()

    return withLoader(dispatch, async () => {
      try {
        getData(await deleteUserRequest(id))
        dispatch(snack.success(`"${user.name}" deleted`))
        return id
      } catch (err) {
        dispatch(snack.error(apiMessage(err, 'Could not delete user')))
        return rejectWithValue()
      }
    })
  }
)

export const copyText = createAsyncThunk(
  'users/copyText',
  async ({ text, successMsg, emptyMsg }, { dispatch, rejectWithValue }) => {
    if (!text) {
      if (emptyMsg) dispatch(snack.error(emptyMsg))
      return rejectWithValue()
    }
    try {
      await navigator.clipboard.writeText(text)
      dispatch(snack.success(successMsg))
      return true
    } catch {
      dispatch(
        snack.error(
          successMsg.includes('password') ? 'Could not copy password' : 'Could not copy email'
        )
      )
      return rejectWithValue()
    }
  }
)

const initialState = {
  name: '',
  password: DEFAULT_PASSWORD,
  list: [],
  search: '',
  searching: false,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    createFormSet(state, { payload }) {
      Object.assign(state, payload)
    },
    searchChanged(state, { payload }) {
      state.search = payload
    },
    resetCreateForm(state) {
      state.name = ''
      state.password = DEFAULT_PASSWORD
    },
  },
  extraReducers: b => {
    b.addCase(fetchUsers.pending, (s, action) => {
      if (action.meta.arg?.quiet) s.searching = true
    })
    b.addCase(fetchUsers.fulfilled, (s, { payload }) => {
      s.list = payload || []
      s.searching = false
    })
    b.addCase(fetchUsers.rejected, s => {
      s.searching = false
    })
    b.addCase(createUserAction.fulfilled, s => {
      s.name = ''
      s.password = DEFAULT_PASSWORD
    })
    b.addCase(toggleUserStatus.fulfilled, (s, { payload }) => {
      const idx = s.list.findIndex(u => u.id === payload.id)
      if (idx !== -1) s.list[idx] = payload
    })
    b.addCase(deleteUserAction.fulfilled, (s, { payload: id }) => {
      s.list = s.list.filter(u => u.id !== id)
    })
    b.addCase(sessionCleared, () => initialState)
    b.addCase(logout.fulfilled, () => initialState)
    b.addCase(login.fulfilled, () => initialState)
  },
})

export const { createFormSet, searchChanged, resetCreateForm } = usersSlice.actions
export const selectGeneratedEmail = s => emailFromName(s.users.name)
export default usersSlice.reducer
