import { LogOut } from 'lucide-react'
import { useAuth } from '../context/useAuth'

export default function Inventory() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-xl font-bold text-slate-800">Inventory (placeholder)</h1>
        <p className="text-slate-600 mt-2">
          Logged in as <strong>{user.email}</strong> (id: {user.id})
        </p>
        <button onClick={logout}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  )
}