import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import FormInput from '../components/FormInput'
import { useAuth } from '../context/useAuth'
import { getErrorMessage } from '../utils/getErrorMessage'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.status === 401 || err.response?.status === 403
        ? 'Correo o contraseña incorrectos.'
        : getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Bienvenido de nuevo" subtitle="Inicia sesión para gestionar tu inventario">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Correo electrónico" icon={Mail} type="email" name="email"
          value={form.email} onChange={handleChange} required autoComplete="email" />
        <FormInput label="Contraseña" icon={Lock} type="password" name="password"
          value={form.password} onChange={handleChange} required autoComplete="current-password" />

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5
                     text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Iniciar sesión
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        ¿No tenes cuenta? / Registrate{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:underline">Register</Link>
      </p>
    </AuthLayout>
  )
}