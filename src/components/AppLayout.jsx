import { NavLink, Outlet } from 'react-router-dom'
import { LogOut, Smartphone } from 'lucide-react'
import { useAuth } from '../context/useAuth'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <span className="hidden font-bold text-slate-800 sm:inline">iStoreManager</span>
            </div>
            <nav className="flex items-center gap-1">
              <NavLink to="/" end className={linkClass}>
                Inventario
              </NavLink>
              <NavLink to="/ventas" className={linkClass}>
                Ventas
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[220px] truncate text-sm text-slate-500 md:inline">{user?.email}</span>
            <button
              type="button"
              onClick={logout}
              aria-label="Salir"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}