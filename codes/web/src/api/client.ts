/**
 * API HTTP 客户端
 * 后端启动后通过此模块通信，未登录时使用 localStorage 兜底
 */

import { ref } from 'vue'

// 同域相对路径：开发时由 Vite proxy 转发到本地后端，生产时由 Nginx 反代到后端
const API_BASE = '/api'

// 响应式状态，Vue computed 可以追踪变化
const _token = ref<string | null>(localStorage.getItem('japanese-learning:token'))

export function getToken(): string | null {
  return _token.value
}

export function setToken(token: string | null): void {
  _token.value = token
  if (token) {
    localStorage.setItem('japanese-learning:token', token)
  } else {
    localStorage.removeItem('japanese-learning:token')
  }
}

export interface UserInfo {
  id: number
  username: string
}

const _user = ref<UserInfo | null>(null)

export function getUser(): UserInfo | null {
  return _user.value
}

export function setUser(user: UserInfo | null): void {
  _user.value = user
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = _token.value
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
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
