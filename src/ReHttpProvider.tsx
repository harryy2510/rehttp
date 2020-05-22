import React from 'react'
import { ReRequest } from './useReHttp'

export interface ReHttpProviderProps {
  baseUrl?: string
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  params?: Record<string, string | number | Array<string | number>>
  headers?: Record<string, string>

  onRequest?: (data: ReRequest) => Promise<void>
  onResponse?: (data: any, response: Response) => Promise<void>
  onError?: (error: any) => Promise<void>
  onComplete?: (dataOrError: any, response?: Response) => Promise<void>
  transformError?: (data: any) => Promise<any>
  transformResponse?: (data: any, response: Response) => Promise<any>
  transformRequest?: (data: ReRequest) => Promise<ReRequest>
  lazy?: boolean
}

export const ReHttpContext = React.createContext<ReHttpProviderProps>({})
export const useReHttpContext = () => React.useContext(ReHttpContext)

const ReHttpProvider: React.FC<ReHttpProviderProps> = ({ children, ...props }) => {
  return <ReHttpContext.Provider value={props}>{children}</ReHttpContext.Provider>
}

export default ReHttpProvider
