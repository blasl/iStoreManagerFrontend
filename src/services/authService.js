import api from './api'

export const authService = {
  login: async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data // { token }
  },
  register: async ({ email, password }) => {
    const { data } = await api.post('/auth/register', { email, password })
    return data // { token }
  },
  me: async () => {
    const { data } = await api.get('/auth/me')
    return data // { id, email, name }
  },
}