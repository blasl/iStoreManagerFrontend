export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error.response) return 'Cannot reach the server. Is the backend running?'
  const data = error.response.data
  if (typeof data === 'string' && data) return data
  return data?.message || data?.error || fallback
}