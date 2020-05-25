import { CacheAdapter, ReHttpProviderProps } from './ReHttpProvider'
import { CacheObject, ReHttpRequest, ReHttpResponse } from './useReHttp'

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

export const generateRequest = (
  globalConfig: ReHttpProviderProps,
  input: Partial<ReHttpRequest>,
  executeInput?: Partial<ReHttpRequest>
): ReHttpRequest => {
  const params = {
    ...(globalConfig.params || {}),
    ...(input.params || {}),
    ...(executeInput?.params || {})
  }
  const url = urlJoin(globalConfig.baseUrl, executeInput?.url || input.url, params)
  const headers = {
    ...(globalConfig.headers || {}),
    ...(input.headers || {}),
    ...(executeInput?.headers || {})
  }
  const body = executeInput?.body || input.body
  const method = executeInput?.method || input.method || globalConfig.method || 'GET'
  return { params, url, headers, body, method }
}

export const fetchOrCache = async <TData = any>(
  reRequest: ReHttpRequest,
  cacheAdapter?: CacheAdapter<TData>,
  noCache?: boolean
) => {
  let data: TData
  let httpResponse: ReHttpResponse<TData>
  let cached: CacheObject<TData> | null = null
  if (!noCache && (await cacheAdapter?.has(reRequest.url))) {
    cached = (await cacheAdapter?.get(reRequest.url))!
    httpResponse = cached.response
    data = httpResponse.data
  } else {
    const fetchResponse = await fetch(reRequest.url, {
      body: reRequest.body,
      headers: reRequest.headers,
      method: reRequest.method
    })
    data = await fetchResponse.json()
    httpResponse = generateResponse<TData>(fetchResponse, data)
    await cacheAdapter?.set(reRequest.url, httpResponse)
  }
  return { data, httpResponse, cached }
}
