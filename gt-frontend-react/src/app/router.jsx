import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import GuestRoute from '@/features/auth/GuestRoute'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import WorkoutPage from '@/features/workout/WorkoutPage'
import SettingsPage from '@/features/settings/SettingsPage'
import UsersPage from '@/features/users/UsersPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workout/:workoutId" element={<WorkoutPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route element={<ProtectedRoute admin />}>
        <Route path="/users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
