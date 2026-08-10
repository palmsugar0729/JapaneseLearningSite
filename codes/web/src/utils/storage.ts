/**
 * 存储封装层
 * 现在使用 localStorage，将来迁移 uni-app 时只需替换此文件内部实现
 */

const PREFIX = 'japanese-learning:'

export const storage = {
  /**
   * 获取存储项
   */
  get<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(PREFIX + key)
      if (value === null) return null
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },

  /**
   * 设置存储项
   */
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },

  /**
   * 移除存储项
   */
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },

  /**
   * 清空所有以 PREFIX 开头的存储项
   */
  clear(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  },
}
