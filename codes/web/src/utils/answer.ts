/**
 * 输入型练习题（语法词填空 / 读音练习）的答案归一化与判分
 *
 * 判分规则见 docs/2026-09-15-todo-list.md 第 5.4 节。
 */

import type { Exercise, ExerciseType } from '../types/japanese'

/** 输入作答的题型（其余为选项作答） */
export function isInputExerciseType(type: ExerciseType): boolean {
  return type === 'fill' || type === 'reading'
}

/**
 * 归一化答案文本，用于宽松比对
 *
 * 1. 全角字符 → 半角
 * 2. 片假名 → 平假名
 * 3. 去掉所有空白字符
 * 4. 英文字母统一小写
 */
export function normalizeAnswer(text: string): string {
  return text
    // 全角英数记号 → 半角
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    // 片假名 → 平假名（长音符 ー 不在区间内，保持不变）
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    // 去掉所有空白（含全角空格）
    .replace(/\s+/g, '')
    .toLowerCase()
}

/** 取出某道题可接受的答案列表 */
export function acceptedAnswers(exercise: Exercise): string[] {
  if (Array.isArray(exercise.answer)) {
    return exercise.answer
  }
  // 选项作答：把正确选项的文本当作可接受答案
  const options = exercise.options ?? []
  return options[exercise.answer] !== undefined ? [options[exercise.answer]] : []
}

/** 判断输入题的用户输入是否正确 */
export function checkInputAnswer(exercise: Exercise, userInput: string): boolean {
  const normalized = normalizeAnswer(userInput)
  if (!normalized) return false
  return acceptedAnswers(exercise).some((a) => normalizeAnswer(a) === normalized)
}

/** 题目正确答案的展示文本 */
export function correctAnswerText(exercise: Exercise): string {
  return acceptedAnswers(exercise).join(' / ')
}
