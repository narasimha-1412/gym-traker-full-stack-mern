import { sendFail } from '../utils/apiResponse.js'

function formatIssues(error) {
  return error.issues.map(issue => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }))
}

/** Validate req.body (default) or another req key, e.g. 'params'. */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      return sendFail(res, 'Validation failed', 400, formatIssues(result.error))
    }
    req[source] = result.data
    next()
  }
}
