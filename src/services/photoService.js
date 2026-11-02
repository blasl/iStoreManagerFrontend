import api from './api'

export const photoService = {
  list: async (phoneId) => (await api.get(`/phones/${phoneId}/photos`)).data,

  upload: async (phoneId, file) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post(`/phones/${phoneId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  reorder: async (phoneId, photoIds) =>
    (await api.put(`/phones/${phoneId}/photos/order`, { photoIds })).data,

  remove: async (phoneId, photoId) => {
    await api.delete(`/phones/${phoneId}/photos/${photoId}`)
  },
}