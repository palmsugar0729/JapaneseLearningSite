/**
 * API HTTP 客户端 (uni-app 版)
 * 使用 uni.request 替代 fetch，兼容微信小程序 + H5
 */

import { ref } from 'vue'

// 开发阶段用本地 + IP 直连，上线后换成正式域名
const API_BASE = 'http://localhost:3001/api'

// 响应式 token 状态
const _token = ref<string | null>(uni.getStorageSync('jl:token') || null)

export function getToken(): string | null {
  return _token.value
}

export function setToken(token: string | null): void {
  _token.value = token
  if (token) {
    uni.setStorageSync('jl:token', token)
  } else {
    uni.removeStorageSync('jl:token')
  }
}

export interface UserInfo {
  id: number
  username: string
  /** 微信 openid（小程序登录用户） */
  openid?: string
}

function loadStoredUser(): UserInfo | null {
  try {
    const raw = uni.getStorageSync('jl:user')
    if (!raw) return null
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

const _user = ref<UserInfo | null>(loadStoredUser())

export function getUser(): UserInfo | null {
  return _user.value
}

export function setUser(user: UserInfo | null): void {
  _user.value = user
  if (user) {
    uni.setStorageSync('jl:user', JSON.stringify(user))
  } else {
    uni.removeStorageSync('jl:user')
  }
}

function request<T>(method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    const token = _token.value
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    uni.request({
      url: `${API_BASE}${path}`,
      method,
      header,
      data: body as Record<string, any>,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T)
        } else {
          const err = (res.data as any)?.error || `HTTP ${res.statusCode}`
          reject(new Error(err))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'))
      },
    })
  })
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path)
  },
  put<T>(path: string, data: unknown): Promise<T> {
    return request<T>('PUT', path, data)
  },
  post<T>(path: string, data: unknown): Promise<T> {
    return request<T>('POST', path, data)
  },
}
