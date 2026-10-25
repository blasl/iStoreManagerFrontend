import api from './api'

export const saleService = {
  getAll: async () => (await api.get('/sales')).data,
  register: async (phoneId, salePrice) =>
    (await api.post(`/sales/phone/${phoneId}`, { salePrice })).data,
}