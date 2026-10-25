import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'


export default function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}