export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({ success: true, data })
}

export function sendFail(res, message, status = 400, errors = null) {
  const body = { success: false, message }
  if (errors) body.errors = errors
  return res.status(status).json(body)
}
