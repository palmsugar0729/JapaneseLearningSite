/**
 * uni-app 存储封装层
 * 微信小程序使用 uni.getStorageSync / uni.setStorageSync
 * H5 端 uni 内部调用 localStorage
 */

const PREFIX = 'jl:'

export const storage = {
  get<T>(key: string): T | null {
    try {
      const value = uni.getStorageSync(PREFIX + key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },

  set(key: string, value: unknown): void {
    try {
      uni.setStorageSync(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },

  remove(key: string): void {
    try {
      uni.removeStorageSync(PREFIX + key)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  },

  clear(): void {
    try {
      const { keys } = uni.getStorageInfoSync()
      keys
        .filter((k: string) => k.startsWith(PREFIX))
        .forEach((k: string) => uni.removeStorageSync(k))
    } catch (e) {
      console.error('Storage clear error:', e)
    }
  },
}
