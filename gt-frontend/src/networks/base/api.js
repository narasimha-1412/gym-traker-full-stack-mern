import { appAxios } from './appAxios'

export const getAPIResponse = (url, config) => appAxios.get(url, config)
export const postAPIResponse = (url, body, config) => appAxios.post(url, body, config)
export const putAPIResponse = (url, body, config) => appAxios.put(url, body, config)
export const patchAPIResponse = (url, body, config) => appAxios.patch(url, body, config)
export const deleteAPIResponse = (url, config) => appAxios.delete(url, config)
