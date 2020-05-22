import urlJoin, { Options } from 'proper-url-join'
import React from 'react'
import { ReHttpProviderProps, useReHttpContext } from './ReHttpProvider'

export interface ReRequest {
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  url: string
  headers: Record<string, string>
  params: Options['query']
  body: any
}

export interface ReHttpReturn<TResponse = any, TError = any> {
  response: Response | null
  data: TResponse | null
  loading: boolean
  error: TError | null
  execute: (input?: Partial<ReRequest>) => Promise<TResponse | TError>
}

export interface ReHttpProps<TResponse = any, TError = any> {
  onError?: (error: any) => Promise<void>
  onResponse?: (data: any) => Promise<void>
  onRequest?: (data: ReRequest) => Promise<void>
  transformError?: (data: any) => Promise<TError>
  transformResponse?: (data: any, response: Response) => Promise<TResponse>
  transformRequest?: (data: ReRequest) => Promise<ReRequest>

  lazy?: boolean
}

const getReRequest = (
  contextValues: ReHttpProviderProps,
  input: Partial<ReRequest>,
  executeInput?: Partial<ReRequest>
): ReRequest => {
  const params = {
    ...(contextValues.params || {}),
    ...(input.params || {}),
    ...(executeInput?.params || {})
  }
  const url = urlJoin(contextValues.baseUrl, executeInput?.url || input.url, { query: params })
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

const useReHttp = <TResponse = any, TError = any>(
  input: Partial<ReRequest>,
  options?: ReHttpProps<TResponse, TError>
): ReHttpReturn<TResponse> => {
  const contextValues = useReHttpContext()
  const lazy = Boolean(options?.lazy ?? contextValues.lazy)
  const [response, setResponse] = React.useState<Omit<ReHttpReturn<TResponse, TError>, 'execute'>>({
    loading: !lazy,
    error: null,
    data: null,
    response: null
  })
  const execute: ReHttpReturn<TResponse, TError>['execute'] = async executeInput => {
    !response.loading && setResponse(res => ({ ...res, loading: true }))
    let reRequest = getReRequest(contextValues, input, executeInput)
    if (contextValues.transformRequest) {
      reRequest = await contextValues.transformRequest(reRequest)
    }
    if (options?.transformRequest) {
      reRequest = await options.transformRequest(reRequest)
    }
    await contextValues?.onRequest?.(reRequest)
    try {
      const res = await fetch(reRequest.url, {
        body: reRequest.body,
        headers: reRequest.headers,
        method: reRequest.method
      })
      let data: TResponse = await res.json()
      if (contextValues.transformResponse) {
        data = await contextValues.transformResponse(data, res)
      }
      await contextValues?.onResponse?.(data)
      if (options?.transformResponse) {
        data = await options.transformResponse(data, res)
      }
      setResponse({ data, response: res, error: null, loading: false })
      return data
    } catch (error) {
      setResponse({ data: null, response: null, error, loading: false })
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
