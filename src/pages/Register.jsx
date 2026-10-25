import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import FormInput from '../components/FormInput'
import { useAuth } from '../context/useAuth'
import { getErrorMessage } from '../utils/getErrorMessage'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')

    setSubmitting(true)
    try {
      await register({ email: form.email, password: form.password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create the account. The email may already be in use.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking your iPhone profits">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Email" icon={Mail} type="email" name="email"
          value={form.email} onChange={handleChange} required autoComplete="email" />
        <FormInput label="Password" icon={Lock} type="password" name="password"
          value={form.password} onChange={handleChange} required autoComplete="new-password" />
        <FormInput label="Confirm password" icon={Lock} type="password" name="confirm"
          value={form.confirm} onChange={handleChange} required autoComplete="new-password" />

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5
                     text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}