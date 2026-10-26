import { Outlet } from 'react-router-dom'
import { LogOut, Smartphone } from 'lucide-react'
import { useAuth } from '../context/useAuth'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Smartphone className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">iStoreManager</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[220px] truncate text-sm text-slate-500 sm:inline">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Salir
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