/**
 * 学习历史数据计算
 * 从 SRS 进度和练习历史中提取时间序列数据，供图表使用
 */

import { getAllProgress } from './useSRS'
import { getHistory } from './useExerciseProgress'

// ========== 每日复习活动 ==========

/** 单日活动数据 */
export interface DailyActivity {
  date: string
  reviews: number
  exercises: number
}

/**
 * 获取每日学习活动汇总（复习 + 练习）
 * 从所有单词的 lastReviewed 和练习历史中按日期聚合
 */
export function getCombinedDailyActivity(days: number = 84): DailyActivity[] {
  const dateMap = new Map<string, { reviews: number; exercises: number }>()

  // 复习活动：遍历所有进度记录，按 lastReviewed 聚合
  const allProgress = getAllProgress()
  for (const progress of Object.values(allProgress)) {
    const date = progress.lastReviewed
    if (!date) continue
    const entry = dateMap.get(date) || { reviews: 0, exercises: 0 }
    entry.reviews++
    dateMap.set(date, entry)
  }

  // 练习活动：遍历练习历史
  const history = getHistory()
  for (const session of history) {
    const date = session.date.split('T')[0]
    const entry = dateMap.get(date) || { reviews: 0, exercises: 0 }
    entry.exercises += session.total
    dateMap.set(date, entry)
  }

  // 生成日期范围内的完整数据
  const result: DailyActivity[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const data = dateMap.get(dateStr)
    result.push({
      date: dateStr,
      reviews: data?.reviews || 0,
      exercises: data?.exercises || 0,
    })
  }

  return result
}

// ========== 练习正确率趋势 ==========

/** 正确率趋势数据点 */
export interface AccuracyTrend {
  date: string
  accuracy: number
  total: number
}

/**
 * 获取练习正确率趋势
 * @param days 统计最近多少天
 */
export function getAccuracyTrend(days: number = 30): AccuracyTrend[] {
  const history = getHistory()

  // 按日期聚合并计算正确率
  const dateMap = new Map<string, { correct: number; total: number }>()
  for (const session of history) {
    const date = session.date.split('T')[0]
    const entry = dateMap.get(date) || { correct: 0, total: 0 }
    entry.correct += session.correct
    entry.total += session.total
    dateMap.set(date, entry)
  }

  // 生成日期范围内的数据
  const result: AccuracyTrend[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const data = dateMap.get(dateStr)
    result.push({
      date: dateStr,
      accuracy: data ? Math.round((data.correct / data.total) * 100) : 0,
      total: data?.total || 0,
    })
  }

  return result
}

// ========== EF 分布 ==========

/** EF 分布区间 */
export interface EFDistribution {
  range: string
  count: number
}

/**
 * 获取简易度系数分布
 */
export function getEFDistribution(): EFDistribution[] {
  const allProgress = getAllProgress()
  const ranges = [
    { min: 1.3, max: 1.5, label: '1.3-1.5' },
    { min: 1.5, max: 2.0, label: '1.5-2.0' },
    { min: 2.0, max: 2.5, label: '2.0-2.5' },
    { min: 2.5, max: 3.0, label: '2.5-3.0' },
    { min: 3.0, max: Infinity, label: '3.0+' },
  ]

  return ranges.map((r) => {
    const count = Object.values(allProgress).filter(
      (p) => p.ef >= r.min && p.ef < r.max
    ).length
    return { range: r.label, count }
  })
}

// ========== 热力图数据转换 ==========

/** 热力图单元格 */
export interface HeatmapCell {
  date: string
  weekDay: number // 0=周日
  weekIndex: number // 第几周
  count: number
}

/**
 * 将每日活动数据转为热力图格式（GitHub 风格）
 * 列=周, 行=星期几
 */
export function toHeatmapData(
  dailyActivity: DailyActivity[],
  maxWeeks: number = 12
): HeatmapCell[] {
  const today = new Date()
  const cells: HeatmapCell[] = []

  // 从今天往前推 maxWeeks 周
  const totalDays = maxWeeks * 7
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const weekIndex = Math.floor((totalDays - 1 - i) / 7)
    const weekDay = d.getDay()

    const activity = dailyActivity.find((a) => a.date === dateStr)
    const count = activity ? activity.reviews + activity.exercises : 0

    cells.push({ date: dateStr, weekDay, weekIndex, count })
  }

  return cells
}
