import { ReHttpProviderProps } from './ReHttpProvider'
import { ReHttpOptions, ReHttpRequest, ReHttpReturn } from './useReHttp'
import { fetchOrCache, generateRequest } from './utils'

export const executeReHttpRequest = async <TData = any, TError = any>(
  globalConfig: ReHttpProviderProps,
  input: Partial<ReHttpRequest>,
  options?: ReHttpOptions<TData, TError>,
  executeInput?: Partial<ReHttpRequest>
): Promise<Omit<ReHttpReturn<TData, TError>, 'execute'>> => {
  let reRequest = generateRequest(globalConfig, input, executeInput)
  if (globalConfig.transformRequest) {
    reRequest = await globalConfig.transformRequest(reRequest)
  }
  if (options?.transformRequest) {
    reRequest = await options.transformRequest(reRequest)
  }
  await globalConfig.onRequest?.(reRequest)
  try {
    let { data, httpResponse, cached } = await fetchOrCache<TData>(
      reRequest,
      globalConfig.cacheAdapter,
      options?.noCache
    )
    if (globalConfig.transformResponse) {
      data = await globalConfig.transformResponse(data, httpResponse)
      httpResponse.data = data
    }
    await globalConfig.onResponse?.(data, httpResponse)
    await globalConfig.onComplete?.(data, httpResponse)
    if (options?.transformResponse) {
      data = await options.transformResponse(data, httpResponse)
    }
    return { data, response: httpResponse, cached, error: null, loading: false, isRequestInFlight: false }
  } catch (error) {
    await globalConfig.onError?.(error)
    await globalConfig.onComplete?.(error)
    return { data: null, response: null, error, loading: false, isRequestInFlight: false, cached: null }
  }
}

const reHttpInstance = async <TData = any, TError = any>(
  input: Partial<ReHttpRequest>,
  options?: ReHttpOptions<TData, TError>
): Promise<ReHttpReturn<TData, TError>> => {
  const globalConfig = (typeof window !== 'undefined' && window.reHttpConfig) || {}
  const execute = (executeInput?: Partial<ReHttpRequest>) =>
    executeReHttpRequest<TData, TError>(globalConfig, input, options, executeInput)
  const response = await execute()
  if (response.error) {
    return Promise.reject(response)
  }
  return { ...response, execute }
}

export default reHttpInstance
