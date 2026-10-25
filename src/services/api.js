import axios from 'axios'
import { tokenStorage } from '../utils/tokenStorage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// If the token is expired/invalid, clear it and send the user to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const isCredentialsRoute = url.includes('/auth/login') || url.includes('/auth/register')

    if ((status === 401 || status === 403) && !isCredentialsRoute) {
      tokenStorage.remove()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api