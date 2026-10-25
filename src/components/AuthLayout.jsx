import { Smartphone } from 'lucide-react'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-3">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}