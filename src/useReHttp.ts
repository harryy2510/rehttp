import React from 'react'
import { CacheAdapter, ReHttpProviderProps, useReHttpContext } from './ReHttpProvider'
import { generateResponse, urlJoin } from './utils'

export interface CacheObject<TData = any> {
  accessCount: number
  lastAccessedAt: string | null
  createdAt: string
  updatedAt: string | null
  response: ReHttpResponse<TData>
}

export interface ReHttpRequest {
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  url: string
  headers: Record<string, string>
  params: Record<string, string | number | Array<string | number>>
  body: any
}

export interface ReHttpResponse<TData = any>
  extends Pick<Response, 'headers' | 'ok' | 'redirected' | 'status' | 'statusText' | 'type' | 'url'> {
  data: TData
}

export interface ReHttpReturn<TData = any, TError = any> {
  response: ReHttpResponse<TData> | null
  data: TData | null
  loading: boolean
  error: TError | null
  execute: (input?: Partial<ReHttpRequest>) => Promise<TData | TError>
  isRequestInFlight: boolean
  cached: CacheObject<TData> | null
}

export interface ReHttpProps<TData = any, TError = any> {
  transformError?: (data: any) => Promise<TError>
  transformResponse?: (data: any, response: ReHttpResponse) => Promise<TData>
  transformRequest?: (data: ReHttpRequest) => Promise<ReHttpRequest>
  lazy?: boolean
  noCache?: boolean
}

const getReHttpRequest = (
  contextValues: ReHttpProviderProps,
  input: Partial<ReHttpRequest>,
  executeInput?: Partial<ReHttpRequest>
): ReHttpRequest => {
  const params = {
    ...(contextValues.params || {}),
    ...(input.params || {}),
    ...(executeInput?.params || {})
  }
  const url = urlJoin(contextValues.baseUrl, executeInput?.url || input.url, params)
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(contextValues.headers || {}),
    ...(input.headers || {}),
    ...(executeInput?.headers || {})
  }
  const body = executeInput?.body || input.body
  const method = executeInput?.method || input.method || contextValues?.method || 'GET'
  return { params, url, headers, body, method }
}

const fetchOrCache = async <TData = any>(
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

const useReHttp = <TData = any, TError = any>(
  input: Partial<ReHttpRequest>,
  options?: ReHttpProps<TData, TError>
): ReHttpReturn<TData> => {
  const contextValues = useReHttpContext()
  const lazy = Boolean(options?.lazy ?? contextValues.lazy)
  const [response, setResponse] = React.useState<Omit<ReHttpReturn<TData, TError>, 'execute'>>({
    loading: !lazy,
    error: null,
    data: null,
    response: null,
    isRequestInFlight: !lazy,
    cached: null
  })
  const execute: ReHttpReturn<TData, TError>['execute'] = async executeInput => {
    !response.isRequestInFlight &&
      setResponse(res => ({ ...res, loading: !(res.data || res.error), isRequestInFlight: true }))
    let reRequest = getReHttpRequest(contextValues, input, executeInput)
    if (contextValues.transformRequest) {
      reRequest = await contextValues.transformRequest(reRequest)
    }
    if (options?.transformRequest) {
      reRequest = await options.transformRequest(reRequest)
    }
    await contextValues?.onRequest?.(reRequest)
    try {
      let { data, httpResponse, cached } = await fetchOrCache<TData>(
        reRequest,
        contextValues.cacheAdapter,
        options?.noCache
      )
      if (contextValues.transformResponse) {
        data = await contextValues.transformResponse(data, httpResponse)
        httpResponse.data = data
      }
      await contextValues?.onResponse?.(data, httpResponse)
      await contextValues?.onComplete?.(data, httpResponse)
      if (options?.transformResponse) {
        data = await options.transformResponse(data, httpResponse)
      }
      setResponse({ data, response: httpResponse, cached, error: null, loading: false, isRequestInFlight: false })
      return data
    } catch (error) {
      await contextValues?.onError?.(error)
      await contextValues?.onComplete?.(error)
      setResponse({ data: null, response: null, error, loading: false, isRequestInFlight: false, cached: null })
      return error
    }
  }
  React.useEffect(() => {
    if (!lazy) {
      execute()
    }
  }, [])
  return {
    ...response,
    execute
  }
}
export default useReHttp
