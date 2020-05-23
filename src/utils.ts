import { ReHttpResponse } from './useReHttp'

const stringify = (params: Record<string, string | number | Array<string | number>>) =>
  Object.keys(params)
    .sort()
    .map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key]?.toString())}`
    })
    .join('&')
const removeSlash = (e: string) => e.replace(/^\/+/, '').replace(/\/+$/, '')
export const urlJoin = (
  _baseUrl?: string,
  _url?: string,
  _params?: Record<string, string | number | Array<string | number>>
) => {
  const urlParts: string[] = []
  if (!_url?.startsWith('http') && _baseUrl) {
    urlParts.push(removeSlash(_baseUrl))
  }
  if (_url) {
    urlParts.push(removeSlash(_url))
  }
  let url = urlParts.join('/')
  if (!url.startsWith('http') && !url.startsWith('/')) {
    url = `/${url}`
  }
  if (_params && Object.keys(_params).length) {
    url += `?${stringify(_params)}`
  }
  return url
}
export const generateResponse = <TData = any>(res: Response, data: TData): ReHttpResponse<TData> => {
  const keysToCopy = ['headers', 'ok', 'redirected', 'status', 'statusText', 'type', 'url']
  const response = {
    data
  }
  keysToCopy.map(key => {
    response[key] = res[key]
  })
  return response as ReHttpResponse<TData>
}
