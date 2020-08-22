import React from 'react'
import { CacheObject, ReHttpOptions, ReHttpRequest, ReHttpResponse } from './useReHttp'
import { global } from './utils'

export interface CacheAdapter<TData = any> {
  ttl: number
  size: number
  get: (requestKey: string) => Promise<CacheObject<TData> | undefined>
  set: (requestKey: string, response: ReHttpResponse<TData>) => Promise<CacheObject<TData>>
  has: (requestKey: string) => Promise<boolean>
  delete: (requestKey: string) => Promise<boolean>
  clear: () => Promise<void>
}

export interface ReHttpProviderProps extends Omit<ReHttpOptions, 'noCache'> {
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  headers?: Record<string, string>
  params?: Record<string, string | number | Array<string | number>>
  baseUrl?: string

  onRequest?: (data: ReHttpRequest) => Promise<void>
  onResponse?: (data: any, response: ReHttpResponse) => Promise<void>
  onError?: (error: any) => Promise<void>
  onComplete?: (dataOrError: any, response?: ReHttpResponse) => Promise<void>
  cacheAdapter?: CacheAdapter
  cacheMethods?: Array<ReHttpRequest['method']>
}

export const ReHttpContext = React.createContext<ReHttpProviderProps>({})
export const useReHttpContext = () => React.useContext(ReHttpContext)

const ReHttpProvider: React.FC<ReHttpProviderProps> = ({ children, ...props }) => {
  React.useEffect(() => {
    if (typeof global !== 'undefined') {
      global.reHttpConfig = props
    }
  }, [props])
  return <ReHttpContext.Provider value={props}>{children}</ReHttpContext.Provider>
}

ReHttpProvider.defaultProps = {
  cacheMethods: ['GET']
}

export default ReHttpProvider
