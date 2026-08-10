/**
 * 练习题数据加载模块
 */

import type { Exercise, JLPTLevel, ExerciseType } from '../types/japanese'
import { shuffleArray } from '../utils/shuffle'

// 加载所有练习数据
const exerciseModules = import.meta.glob<{ default: Exercise[] }>(
  '../content/japanese/exercise/*.json',
  { eager: true }
)

/**
 * 获取所有练习题
 */
export function getAllExercises(): Exercise[] {
  const exercises: Exercise[] = []
  for (const module of Object.values(exerciseModules)) {
    if (module.default && Array.isArray(module.default)) {
      exercises.push(...module.default)
    }
  }
  return exercises
}

/**
 * 按级别筛选练习题
 * @param level JLPT 级别
 */
export function getExercisesByLevel(level: JLPTLevel): Exercise[] {
  return getAllExercises().filter((ex) => ex.level === level)
}

/**
 * 按题型筛选练习题
 * @param type 题型
 */
export function getExercisesByType(type: ExerciseType): Exercise[] {
  return getAllExercises().filter((ex) => ex.type === type)
}

/**
 * 按级别和题型筛选练习题
 * @param level JLPT 级别
 * @param type 题型
 */
export function getExercisesByLevelAndType(
  level: JLPTLevel | 'mixed',
  type: ExerciseType | 'mixed'
): Exercise[] {
  let result = getAllExercises()

  if (level !== 'mixed') {
    result = result.filter((ex) => ex.level === level)
  }

  if (type !== 'mixed') {
    result = result.filter((ex) => ex.type === type)
  }

  return result
}

/**
 * 随机抽取指定数量的题目（Fisher-Yates 洗牌）
 * @param exercises 题目池
 * @param count 数量，不传则全部打乱
 */
export function shuffleExercises(exercises: Exercise[], count?: number): Exercise[] {
  const shuffled = shuffleArray(exercises)
  return count ? shuffled.slice(0, count) : shuffled
}

/**
 * 根据 ID 获取题目
 * @param id 题目 ID
 */
export function getExerciseById(id: string): Exercise | undefined {
  return getAllExercises().find((ex) => ex.id === id)
}

/**
 * 获取所有可用的级别列表（有数据的级别）
 */
export function getAvailableLevels(): JLPTLevel[] {
  const levels = new Set<JLPTLevel>()
  getAllExercises().forEach((ex) => levels.add(ex.level))
  return ['N5', 'N4', 'N3', 'N2', 'N1'].filter(
    (l) => levels.has(l as JLPTLevel)
  ) as JLPTLevel[]
}
