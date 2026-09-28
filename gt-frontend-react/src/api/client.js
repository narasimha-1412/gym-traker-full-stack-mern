import axios from 'axios'
import { getAccessToken, setAccessToken } from './accessToken'
import { routes } from './routes'
import { tokenRefreshed, sessionCleared } from '@/features/auth/authSlice'

let store = null

export const injectStore = s => {
  store = s
}

export const appAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
})

appAxios.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing = null

appAxios.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (!original || err.response?.status !== 401 || original._retry) {
      return Promise.reject(err)
    }

    const url = original.url || ''
    if (url.includes(routes.auth.login) || url.includes(routes.auth.refresh)) {
      return Promise.reject(err)
    }

    original._retry = true

    try {
      refreshing ??= appAxios.post(routes.auth.refresh).finally(() => {
        refreshing = null
      })
      const { data } = await refreshing
      const payload = data?.success ? data.data : data
      setAccessToken(payload.accessToken)
      store?.dispatch(tokenRefreshed(payload.accessToken))

      original.headers = original.headers || {}
      original.headers.Authorization = `Bearer ${payload.accessToken}`
      return appAxios(original)
    } catch (refreshErr) {
      setAccessToken(null)
      store?.dispatch(sessionCleared())
      return Promise.reject(refreshErr)
    }
  }
)

export default appAxios
