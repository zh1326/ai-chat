import { Storage } from '@/utils/storage'
import CacheKey from '@/utils/cache/key'

// 缓存
class Cache {
  getToken = (): string => {
    return Storage.getItem(CacheKey.TokenKey) || ''
  }

  setToken = (value: string | null) => {
    console.log('setToken value', value)
    Storage.setItem(CacheKey.TokenKey, value)
  }

  clearToken = () => {
    Storage.removeItem(CacheKey.TokenKey)
  }

  getRefreshToken = (): string => {
    return Storage.getItem(CacheKey.RefreshTokenKey) || ''
  }

  setRefreshToken = (value: string | null) => {
    Storage.setItem(CacheKey.RefreshTokenKey, value)
  }

  getSidebarOpened = (): boolean => {
    return Storage.getItem(CacheKey.SidebarOpenedKey) || false
  }

  setSidebarOpened = (value: boolean) => {
    Storage.setItem(CacheKey.SidebarOpenedKey, value)
  }
}

export default new Cache()
