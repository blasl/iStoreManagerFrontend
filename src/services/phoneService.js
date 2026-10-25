import api from './api'

export const phoneService = {
  getAll: async () => (await api.get('/phones')).data,
  getActive: async () => (await api.get('/phones/active')).data,
  getStock: async () => (await api.get('/phones/stock')).data,
  create: async (phone) => (await api.post('/phones', phone)).data,
  update: async (id, phone) => (await api.put(`/phones/${id}`, phone)).data,
  remove: async (id) => { await api.delete(`/phones/${id}`) },
}