import { CacheAdapter } from '../ReHttpProvider'
import { CacheObject, ReHttpResponse } from '../useReHttp'

export const isCacheObjectValid = <TData = any>(cacheObject: CacheObject<TData>, ttl: number) => {
  const cacheTime = new Date(cacheObject.createdAt).valueOf()
  const currentTime = new Date().valueOf()
  return currentTime - cacheTime < ttl
}

export class InMemoryAdapter<TData = any> implements CacheAdapter<TData> {
  ttl: number = 300000
  size: number = 50
  private cacheStore: Map<string, CacheObject<TData>> = new Map<string, CacheObject<TData>>()

  constructor(options?: { ttl?: number; size?: number }) {
    if (options?.ttl) {
      this.ttl = options?.ttl
    }
    if (options?.size) {
      this.size = options?.size
    }
  }

  clear = async (): Promise<void> => {
    return this.cacheStore.clear()
  }

  delete = async (requestKey: string): Promise<boolean> => {
    return this.cacheStore.delete(requestKey)
  }

  get = async (requestKey: string): Promise<CacheObject<TData> | undefined> => {
    if (await this.has(requestKey)) {
      const cacheObject = this.cacheStore.get(requestKey)!
      cacheObject.accessCount += 1
      cacheObject.lastAccessedAt = new Date().toISOString()
      return { ...cacheObject }
    }
    return undefined
  }

  has = async (requestKey: string): Promise<boolean> => {
    if (this.cacheStore.has(requestKey)) {
      const cacheObject = this.cacheStore.get(requestKey)!
      if (isCacheObjectValid(cacheObject, this.ttl)) {
        return true
      }
      await this.delete(requestKey)
    }
    return false
  }

  set = async (requestKey: string, response: ReHttpResponse<TData>): Promise<CacheObject<TData>> => {
    if (this.cacheStore.size >= this.size) {
      const keyToRemove = this.cacheStore.values().next().value
      await this.delete(keyToRemove)
    }
    const exist = await this.has(requestKey)
    const cacheObject: CacheObject<TData> = exist
      ? {
          ...this.cacheStore.get(requestKey)!,
          updatedAt: new Date().toISOString(),
          response
        }
      : {
          response,
          accessCount: 0,
          updatedAt: null,
          lastAccessedAt: null,
          createdAt: new Date().toISOString()
        }
    this.cacheStore.set(requestKey, cacheObject)
    return { ...cacheObject }
  }
}

export default InMemoryAdapter
