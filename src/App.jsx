import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Inventory from './pages/Inventory'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Inventory />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}