import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectIsAdmin, sessionCleared } from './authSlice'
import { setAccessToken } from '@/api/accessToken'

export default function ProtectedRoute({ admin = false }) {
  const dispatch = useAppDispatch()
  const { loggedIn, user } = useAppSelector(s => s.auth)
  const isAdmin = useAppSelector(selectIsAdmin)
  const disabled = loggedIn && user.status === 'disabled'

  useEffect(() => {
    if (disabled) {
      setAccessToken(null)
      dispatch(sessionCleared())
    }
  }, [disabled, dispatch])

  if (!loggedIn || disabled) return <Navigate to="/login" replace />
  if (admin && !isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
