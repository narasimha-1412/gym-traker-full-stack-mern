import { configureStore } from '@reduxjs/toolkit'
import { injectStore } from '@/api/client'
import auth from '@/features/auth/authSlice'
import ui from '@/features/ui/uiSlice'
import dashboard from '@/features/dashboard/dashboardSlice'
import workout from '@/features/workout/workoutSlice'
import settings from '@/features/settings/settingsSlice'
import users from '@/features/users/usersSlice'

export const store = configureStore({
  reducer: { auth, ui, dashboard, workout, settings, users },
})

injectStore(store)
