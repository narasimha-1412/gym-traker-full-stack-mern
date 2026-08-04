export function apiMessage(err, fallback) {
  const status = err.response?.status
  const data = err.response?.data

  if (status === 429) {
    return data?.message || 'Too many requests, try again later'
  }

  if (status === 413) {
    return data?.message || 'Request too large'
  }

  const fieldError = data?.errors?.[0]?.message
  if (fieldError) return fieldError

  return data?.message || fallback
}

export function getData(res) {
  if (res?.data?.success) return res.data.data
  throw res
}
