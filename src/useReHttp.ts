import React from 'react'
import { executeReHttpRequest } from './reHttpInstance'
import { useReHttpContext } from './ReHttpProvider'

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
  execute: (input?: Partial<ReHttpRequest>) => Promise<Omit<ReHttpReturn<TData, TError>, 'execute'>>
  isRequestInFlight: boolean
  cached: CacheObject<TData> | null
}

export interface ReHttpOptions<TData = any, TError = any> {
  onRequest?: (data: ReHttpRequest) => Promise<void>
  onResponse?: (data: TData, response: ReHttpResponse<TData>) => Promise<void>
  onError?: (error: TError) => Promise<void>
  onComplete?: (dataOrError: any, response?: ReHttpResponse<TData>) => Promise<void>
  transformError?: (data: any) => Promise<TError>
  transformResponse?: (data: any, response: ReHttpResponse) => Promise<TData>
  transformRequest?: (data: ReHttpRequest) => Promise<ReHttpRequest>
  lazy?: boolean
  noCache?: boolean
}

const useReHttp = <TData = any, TError = any>(
  input: Partial<ReHttpRequest>,
  options?: ReHttpOptions<TData, TError>
): ReHttpReturn<TData, TError> => {
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
    const res = await executeReHttpRequest<TData, TError>(contextValues, input, options, executeInput)
    setResponse(res)
    return res
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
