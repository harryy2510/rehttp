import React from 'react'
import useReHttp, { ReHttpOptions, ReHttpRequest, ReHttpReturn } from './useReHttp'

export interface ReHttpProps<TData = any, TError = any> extends ReHttpOptions<TData, TError>, Partial<ReHttpRequest> {
  children: (renderProps: ReHttpReturn<TData, TError>) => React.ReactElement | null
}

const ReHttp = <TData, TError>({
  children,
  method,
  url,
  headers,
  params,
  body,
  ...options
}: ReHttpProps<TData, TError>): React.ReactElement | null => {
  const request = { method, url, headers, params, body }
  const renderProps = useReHttp<TData, TError>(request, options)
  return children(renderProps)
}

export default ReHttp
