/**
 * SRS (Spaced Repetition System) 组合式函数
 * 实现简化版 SM-2 算法
 */

import { ref } from 'vue'
import type { Word, WordProgress, LearningStats, LevelProgress, JLPTLevel } from '../types/japanese'
import { storage } from '../utils/storage'
import { getToken, api } from '../api/client'
import { shuffleArray, pickRandom } from '../utils/shuffle'

const STORAGE_KEY = 'srs-progress'
const STORAGE_KEY_STATS = 'srs-stats'

/** SM-2 算法参数 */
const MIN_EF = 1.3
const INITIAL_EF = 2.5
export const MAX_NEW_PER_DAY = 10

/** 用户反馈质量映射 */
export type ReviewQuality = 'known' | 'vague' | 'unknown'

const qualityMap: Record<ReviewQuality, number> = {
  known: 5,
  vague: 3,
  unknown: 0,
}

// ========== 本地状态 ==========

const progressMap = ref<Record<string, WordProgress>>({})
const stats = ref<Partial<LearningStats>>({})
/** 今日已学新词 ID 集合，用于限制每日新词上限 */
const todayNewSet = ref<Set<string>>(new Set())
let _initialized = false

/** 获取当日日期字符串 */
function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

/** 重置今日新词计数（跨天自动清） */
function resetTodayNewIfNeeded(): void {
  const today = todayStr()
  if (stats.value.lastStudyDate !== today) {
    todayNewSet.value = new Set()
  }
}

// ========== 存储操作（双模式：API + localStorage 兜底） ==========

async function saveAll(): Promise<void> {
  if (getToken()) {
    await api.put('/progress/srs', { progress: progressMap.value, stats: stats.value })
  } else {
    storage.set(STORAGE_KEY, progressMap.value)
    storage.set(STORAGE_KEY_STATS, stats.value)
  }
}

// ========== 初始化 ==========

/** 从服务器加载 SRS 数据（登录后调用） */
export async function initSRSFromServer(): Promise<void> {
  if (_initialized) return
  try {
    const data = await api.get<{ progress: Record<string, WordProgress>; stats: Partial<LearningStats> }>('/progress/srs')
    progressMap.value = data.progress || {}
    stats.value = data.stats || {}
  } catch (e) {
    console.warn('[useSRS] Failed to load from server, using local storage:', e)
    progressMap.value = storage.get<Record<string, WordProgress>>(STORAGE_KEY) || {}
    stats.value = storage.get<Partial<LearningStats>>(STORAGE_KEY_STATS) || {}
  }
  _initialized = true
}

/** 重置初始化状态（登出时调用） */
export function resetSRSInit(): void {
  _initialized = false
  progressMap.value = {}
  stats.value = {}
}

// ========== SM-2 算法核心 ==========

/**
 * 计算新的间隔和 EF
 * @param progress 当前进度
 * @param quality 用户反馈质量 (0-5)
 * @returns 更新后的进度
 */
function calculateSM2(progress: WordProgress, quality: number): WordProgress {
  let { ef, repetitions, interval } = progress

  // 计算新的 EF
  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (ef < MIN_EF) ef = MIN_EF

  // 计算新的间隔和重复次数
  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * ef)
    }
  }

  const today = new Date()
  const nextReview = new Date(today)
  nextReview.setDate(today.getDate() + interval)

  return {
    ...progress,
    ef,
    repetitions,
    interval,
    nextReview: nextReview.toISOString().split('T')[0],
    lastReviewed: today.toISOString().split('T')[0],
    totalReviews: progress.totalReviews + 1,
  }
}

// ========== 公共 API ==========

/**
 * 提交复习反馈
 * @param wordId 单词 ID
 * @param quality 用户反馈
 */
export async function submitReview(wordId: string, quality: ReviewQuality): Promise<void> {
  resetTodayNewIfNeeded()
  const q = qualityMap[quality]
  const existing = progressMap.value[wordId]

  if (existing) {
    progressMap.value[wordId] = calculateSM2(existing, q)
  } else {
    // 新单词首次复习，计入今日新词
    todayNewSet.value.add(wordId)
    const today = new Date().toISOString().split('T')[0]
    progressMap.value[wordId] = calculateSM2(
      {
        wordId,
        ef: INITIAL_EF,
        repetitions: 0,
        interval: 0,
        nextReview: today,
        lastReviewed: today,
        totalReviews: 0,
      },
      q
    )
  }

  updateStatsAfterReview()
  await saveAll()
}

/**
 * 获取今日需要复习的单词
 * @param allWords 所有单词列表
 * @param level 可选，按级别筛选
 * @param shuffle 是否随机打乱，默认 true
 * @returns 今日待复习的单词列表（随机顺序）
 */
export function getTodayReviews(allWords: Word[], level?: JLPTLevel | 'all', shuffle = true): Word[] {
  const today = new Date().toISOString().split('T')[0]

  let words = allWords.filter((word) => {
    const progress = progressMap.value[word.id]
    if (!progress) return false
    return progress.nextReview <= today
  })

  // 按级别筛选
  if (level && level !== 'all') {
    words = words.filter((w) => w.level === level)
  }

  return shuffle ? shuffleArray(words) : words
}

/**
 * 获取新单词（未学习过的），随机抽取
 * @param allWords 所有单词列表
 * @param count 数量上限
 * @param level 可选，按级别筛选
 * @returns 随机抽取的新单词列表
 */
export function getNewWords(allWords: Word[], count: number = MAX_NEW_PER_DAY, level?: JLPTLevel | 'all'): Word[] {
  resetTodayNewIfNeeded()

  // 今日剩余新词配额
  const remaining = Math.max(0, MAX_NEW_PER_DAY - todayNewSet.value.size)
  const actualCount = Math.min(count, remaining)

  if (actualCount <= 0) return []

  let candidates = allWords.filter((word) => !progressMap.value[word.id])

  // 按级别筛选
  if (level && level !== 'all') {
    candidates = candidates.filter((w) => w.level === level)
  }

  return pickRandom(candidates, actualCount)
}

/** 获取今日已学新词数 */
export function getTodayNewCount(): number {
  resetTodayNewIfNeeded()
  return todayNewSet.value.size
}

/**
 * 获取今日学习队列（复习 + 新词），均随机打乱且支持级别筛选
 * @param allWords 所有单词列表
 * @param newWordCount 新词数量上限
 * @param level 可选，按级别筛选（默认 'all' 表示所有级别）
 * @returns [复习单词, 新单词]
 */
export function getTodayQueue(
  allWords: Word[],
  newWordCount: number = MAX_NEW_PER_DAY,
  level?: JLPTLevel | 'all'
): { reviews: Word[]; newWords: Word[] } {
  return {
    reviews: getTodayReviews(allWords, level),
    newWords: getNewWords(allWords, newWordCount, level),
  }
}

/**
 * 获取单词学习状态
 * @param wordId 单词 ID
 */
export function getWordStatus(wordId: string): 'new' | 'learning' | 'mastered' {
  const progress = progressMap.value[wordId]
  if (!progress) return 'new'
  if (progress.repetitions >= 3) return 'mastered'
  return 'learning'
}

/**
 * 获取单词进度
 * @param wordId 单词 ID
 */
export function getWordProgress(wordId: string): WordProgress | undefined {
  return progressMap.value[wordId]
}

/**
 * 获取所有单词的学习进度（用于统计图表等）
 */
export function getAllProgress(): Record<string, WordProgress> {
  return { ...progressMap.value }
}

/**
 * 获取学习统计
 * @param allWords 所有单词列表
 */
export function getStats(allWords: Word[]): LearningStats {
  const today = new Date().toISOString().split('T')[0]
  const lastStudy = stats.value.lastStudyDate

  // 计算连续天数
  let streakDays = stats.value.streakDays || 0
  if (lastStudy) {
    const lastDate = new Date(lastStudy)
    const todayDate = new Date(today)
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      // 昨天学了，连续天数保持
    } else if (diffDays > 1) {
      // 断链了，重置
      streakDays = 0
    }
  }

  const mastered = allWords.filter((w) => getWordStatus(w.id) === 'mastered').length
  const learning = allWords.filter((w) => getWordStatus(w.id) === 'learning').length
  const newWords = allWords.filter((w) => getWordStatus(w.id) === 'new').length

  return {
    totalWords: allWords.length,
    masteredWords: mastered,
    learningWords: learning,
    newWords: newWords,
    todayReviews: getTodayReviews(allWords, undefined, false).length,
    streakDays,
    lastStudyDate: lastStudy || '',
  }
}

/**
 * 获取各级别进度
 * @param allWords 所有单词列表
 */
export function getLevelProgress(allWords: Word[]): LevelProgress[] {
  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

  return levels.map((level) => {
    const words = allWords.filter((w) => w.level === level)
    return {
      level,
      total: words.length,
      mastered: words.filter((w) => getWordStatus(w.id) === 'mastered').length,
      learning: words.filter((w) => getWordStatus(w.id) === 'learning').length,
      new: words.filter((w) => getWordStatus(w.id) === 'new').length,
    }
  })
}

/**
 * 重置某个单词的进度
 * @param wordId 单词 ID
 */
export function resetWordProgress(wordId: string): void {
  delete progressMap.value[wordId]
  saveAll()
}

/**
 * 重置所有学习进度（谨慎使用）
 */
export async function resetAllProgress(): Promise<void> {
  progressMap.value = {}
  stats.value = {}
  if (getToken()) {
    await api.put('/progress/srs', { progress: {}, stats: {} })
  } else {
    storage.remove(STORAGE_KEY)
    storage.remove(STORAGE_KEY_STATS)
  }
}

// ========== 内部函数 ==========

function updateStatsAfterReview(): void {
  const today = new Date().toISOString().split('T')[0]
  const lastStudy = stats.value.lastStudyDate

  if (lastStudy !== today) {
    // 今天第一次学习
    let streakDays = stats.value.streakDays || 0
    if (lastStudy) {
      const lastDate = new Date(lastStudy)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        streakDays += 1
      } else if (diffDays > 1) {
        streakDays = 1
      }
    } else {
      streakDays = 1
    }

    stats.value = {
      ...stats.value,
      lastStudyDate: today,
      streakDays,
    }
    saveAll()
  }
}
