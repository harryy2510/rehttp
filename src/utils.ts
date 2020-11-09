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
  keysToCopy.forEach(key => {
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
  const credentials = executeInput?.credentials || input.credentials || globalConfig.credentials
  return { params, url, headers, body, method, credentials }
}

export const fetchOrCache = async <TData = any>(
  reRequest: ReHttpRequest,
  cacheAdapter?: CacheAdapter<TData>,
  cacheMethods?: Array<ReHttpRequest['method']>,
  noCache?: boolean
) => {
  let data: TData
  let httpResponse: ReHttpResponse<TData>
  let cached: CacheObject<TData> | null = null
  const checkCache = cacheMethods?.includes(reRequest.method) && !noCache
  if (checkCache && (await cacheAdapter?.has(reRequest.url))) {
    cached = (await cacheAdapter?.get(reRequest.url))!
    httpResponse = cached.response
    data = httpResponse.data
  } else {
    const fetchResponse = await fetch(reRequest.url, {
      body: reRequest.body,
      headers: reRequest.headers,
      method: reRequest.method,
      credentials: reRequest.credentials
    })
    data = await fetchResponse.json()
    httpResponse = generateResponse<TData>(fetchResponse, data)
    await cacheAdapter?.set(reRequest.url, httpResponse)
  }
  return { data, httpResponse, cached }
}

export const global = ((): { reHttpConfig: ReHttpProviderProps } | undefined => {
  if (typeof globalThis !== 'undefined') {
    return globalThis as any
  }
  if (typeof global !== 'undefined') {
    return global as any
  }
  if (typeof window !== 'undefined') {
    return window as any
  }
  return undefined
})()
