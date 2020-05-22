const stringify = (params: Record<string, string | number | Array<string | number>>) =>
  Object.keys(params)
    .map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key]?.toString())}`
    })
    .join('&')
const removeSlash = (e: string) => e.replace(/\/+/g, '/').replace(/\/+$/, '')
export const urlJoin = (...args: any) => {
  const params = args.find((e: any) => typeof e === 'object' && e)
  let url: string = args
    .filter((e: any) => typeof e === 'string' && e)
    .map(removeSlash)
    .join('/')
  if (!url.startsWith('http') && !url.startsWith('/')) {
    url = `/${url}`
  }
  if (params && Object.keys(params).length) {
    url += `?${stringify(params)}`
  }
  return url
}
