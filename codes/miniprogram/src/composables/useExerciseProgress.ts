/**
 * 练习进度组合式函数
 * 管理错题本和练习历史
 * 双模式：API（登录后）→ 服务器 SQLite / localStorage（未登录）→ 浏览器
 */

import { ref } from 'vue'
import type { ExerciseSession } from '../types/japanese'
import { storage } from '../utils/storage'
import { getToken, api } from '../api/client'

const STORAGE_KEY_WRONG = 'exercise-wrong'
const STORAGE_KEY_HISTORY = 'exercise-history'

// ========== 本地状态 ==========

const wrongSet = ref<Set<string>>(new Set())
const history = ref<ExerciseSession[]>([])
let _initialized = false

// ========== 存储操作（双模式） ==========

async function saveAll(): Promise<void> {
  if (getToken()) {
    await api.put('/progress/exercise', { wrong: Array.from(wrongSet.value), history: history.value })
  } else {
    storage.set(STORAGE_KEY_WRONG, Array.from(wrongSet.value))
    storage.set(STORAGE_KEY_HISTORY, history.value)
  }
}

// ========== 初始化 ==========

/** 从服务器加载练习数据（登录后调用） */
export async function initExerciseFromServer(): Promise<void> {
  if (_initialized) return
  try {
    const data = await api.get<{ wrong: string[]; history: ExerciseSession[] }>('/progress/exercise')
    wrongSet.value = new Set(data.wrong || [])
    history.value = data.history || []
  } catch (e) {
    console.warn('[useExerciseProgress] Failed to load from server, using local storage:', e)
    wrongSet.value = new Set(storage.get<string[]>(STORAGE_KEY_WRONG) || [])
    history.value = storage.get<ExerciseSession[]>(STORAGE_KEY_HISTORY) || []
  }
  _initialized = true
}

/** 重置初始化状态（登出时调用） */
export function resetExerciseInit(): void {
  _initialized = false
  wrongSet.value = new Set()
  history.value = []
}

// ========== 公共 API ==========

/** 记录答题结果 */
export async function recordAnswer(exerciseId: string, isCorrect: boolean): Promise<void> {
  if (isCorrect) {
    wrongSet.value.delete(exerciseId)
  } else {
    wrongSet.value.add(exerciseId)
  }
  await saveAll()
}

/** 获取错题 ID 列表 */
export function getWrongList(): string[] {
  return Array.from(wrongSet.value)
}

/** 判断某题是否在错题本中 */
export function isWrong(exerciseId: string): boolean {
  return wrongSet.value.has(exerciseId)
}

/** 从错题本中移除 */
export async function removeFromWrong(exerciseId: string): Promise<void> {
  wrongSet.value.delete(exerciseId)
  await saveAll()
}

/** 清空错题本 */
export async function clearWrongList(): Promise<void> {
  wrongSet.value.clear()
  await saveAll()
}

/** 保存一次练习记录 */
export async function saveSession(session: ExerciseSession): Promise<void> {
  history.value.unshift(session)
  if (history.value.length > 50) {
    history.value = history.value.slice(0, 50)
  }
  await saveAll()
}

/** 获取练习历史 */
export function getHistory(): ExerciseSession[] {
  return history.value
}

/** 获取最近 N 次练习记录 */
export function getRecentSessions(count: number = 5): ExerciseSession[] {
  return history.value.slice(0, count)
}

/** 获取最近练习的正确率 */
export function getRecentAccuracy(count: number = 5): number {
  const sessions = history.value.slice(0, count)
  if (sessions.length === 0) return 0
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0)
  const totalQuestions = sessions.reduce((sum, s) => sum + s.total, 0)
  return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
}

/** 获取错题数量 */
export function getWrongCount(): number {
  return wrongSet.value.size
}

/** 重置所有练习进度 */
export async function resetAllExerciseProgress(): Promise<void> {
  wrongSet.value.clear()
  history.value = []
  if (getToken()) {
    await api.put('/progress/exercise', { wrong: [], history: [] })
  } else {
    storage.remove(STORAGE_KEY_WRONG)
    storage.remove(STORAGE_KEY_HISTORY)
  }
}
