import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { authService } from '../services/authService'
import { tokenStorage } from '../utils/tokenStorage'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while checking an existing token

  const fetchUser = useCallback(async () => {
    const data = await authService.me()
    setUser(data)
    return data
  }, [])

  // On app load: if a token exists, validate it and load the user
  useEffect(() => {
    if (!tokenStorage.get()) {
      setLoading(false)
      return
    }
    fetchUser()
      .catch(() => {
        tokenStorage.remove()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [fetchUser])

  const authenticate = useCallback(
    async (requestFn, credentials) => {
      const { token } = await requestFn(credentials)
      tokenStorage.set(token)
      try {
        return await fetchUser()
      } catch (err) {
        tokenStorage.remove()
        throw err
      }
    },
    [fetchUser]
  )

  const login = useCallback((creds) => authenticate(authService.login, creds), [authenticate])
  const register = useCallback((creds) => authenticate(authService.register, creds), [authenticate])

  const logout = useCallback(() => {
    tokenStorage.remove()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, register, logout }),
    [user, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}