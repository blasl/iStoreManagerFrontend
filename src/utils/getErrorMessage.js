export function getErrorMessage(error, fallback = 'Algo salió mal. Inténtalo de nuevo.') {
  if (!error.response) return 'Error de red: no se pudo conectar con el servidor.'
  const data = error.response.data
  if (typeof data === 'string' && data) return data
  return data?.message || data?.error || fallback
}