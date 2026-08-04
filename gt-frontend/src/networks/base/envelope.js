export function apiMessage(err, fallback) {
  return err.response?.data?.message || fallback
}

export function getData(res) {
  if (res?.data?.success) return res.data.data
  throw res
}
