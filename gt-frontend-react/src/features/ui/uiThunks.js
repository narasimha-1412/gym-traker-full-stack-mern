import { loaderShown, loaderHidden, confirmOpened, confirmClosed } from './uiSlice'

export async function withLoader(dispatch, fn, ms = 700) {
  dispatch(loaderShown())
  try {
    await new Promise(r => setTimeout(r, ms))
    return await fn()
  } finally {
    dispatch(loaderHidden())
  }
}

let pendingResolve = null

export const confirm = opts => dispatch =>
  new Promise(resolve => {
    pendingResolve = resolve
    dispatch(confirmOpened({ title: 'Are you sure?', ...opts }))
  })

export const settleConfirm = ok => dispatch => {
  dispatch(confirmClosed())
  pendingResolve?.(!!ok)
  pendingResolve = null
}
