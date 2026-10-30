import api from './api'

export const expenseService = {
  getByPhone: async (phoneId) => (await api.get(`/expenses/phone/${phoneId}`)).data,
  add: async (phoneId, { concept, amount }) =>
    (await api.post(`/expenses/phone/${phoneId}`, { concept, amount })).data,
  remove: async (expenseId) => {
    await api.delete(`/expenses/${expenseId}`)
  },
}