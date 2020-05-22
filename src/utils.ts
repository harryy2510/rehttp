const stringify = (params: Record<string, string | number | Array<string | number>>) =>
  Object.keys(params)
    .map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key]?.toString())}`
    })
    .join('&')
const removeSlash = (e: string) => e.replace(/\/+/g, '/').replace(/\/+$/, '')
export const urlJoin = (
  _baseUrl?: string,
  _url?: string,
  _params?: Record<string, string | number | Array<string | number>>
) => {
  let url = (!_url?.startsWith('http') ? removeSlash(_baseUrl || '') : '') + '/' + removeSlash(_url || '')
  if (!url.startsWith('http') && !url.startsWith('/')) {
    url = `/${url}`
  }
  if (_params && Object.keys(_params).length) {
    url += `?${stringify(_params)}`
  }
  return url
}
