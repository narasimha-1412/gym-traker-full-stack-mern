import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export default function GuestRoute() {
  const loggedIn = useAppSelector(s => s.auth.loggedIn)
  if (loggedIn) return <Navigate to="/" replace />
  return <Outlet />
}
