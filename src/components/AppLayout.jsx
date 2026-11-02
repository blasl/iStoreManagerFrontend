import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, LogOut, Receipt, Smartphone } from 'lucide-react'
import { useAuth } from '../context/useAuth'

const NAV = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/inventario', label: 'Inventario', icon: Smartphone },
  { to: '/ventas', label: 'Ventas', icon: Receipt },
]

const topLink = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
  }`

const bottomLink = ({ isActive }) =>
  `flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${
    isActive ? 'text-indigo-600' : 'text-slate-500'
  }`

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">iStoreManager</span>
            </div>
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={topLink}>
                  {label}
                </NavLink>
              ))}
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

      <main className="mx-auto max-w-6xl px-4 py-6 pb-[calc(6rem_+_env(safe-area-inset-bottom))] md:pb-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={bottomLink}>
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}