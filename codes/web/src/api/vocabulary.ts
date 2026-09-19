/**
 * 单词数据加载模块
 * 使用 import.meta.glob 在构建时加载 JSON 数据
 * 根据文件名自动注入 JLPT 级别（如 N5.json → level: 'N5'）
 */

import type { Word, JLPTLevel } from '../types/japanese'

// ========== JLPT 词库 ==========

const wordModules = import.meta.glob<{ default: Omit<Word, 'level'>[] }>(
  '../content/japanese/words/*.json',
  { eager: true }
)

function extractLevelFromPath(path: string): JLPTLevel | null {
  const match = path.match(/\/(N[1-5])\.json$/i)
  return match ? (match[1].toUpperCase() as JLPTLevel) : null
}

let _wordCache: Word[] | null = null

/** 获取所有 JLPT 单词（自动注入 level 字段） */
export function getAllWords(): Word[] {
  if (_wordCache) return _wordCache

  const words: Word[] = []
  for (const [path, module] of Object.entries(wordModules)) {
    const level = extractLevelFromPath(path)
    if (!level) {
      console.warn(`[vocabulary] Cannot extract level from path: ${path}`)
      continue
    }
    if (module.default && Array.isArray(module.default)) {
      for (const word of module.default) {
        words.push({ ...word, level, source: 'jlpt' } as Word)
      }
    }
  }
  _wordCache = words
  return words
}

// ========== 教科书词库 ==========

// 文件按级别分目录：textbook/level-1/unit-01.json …
const textbookModules = import.meta.glob<{ default: Word[] }>(
  '../content/japanese/textbook/**/*.json',
  { eager: true }
)

let _textbookCache: Word[] | null = null

/** 获取所有教科书单词；传入 level 则只返回该 LEVEL 的单词 */
export function getTextbookWords(level?: number): Word[] {
  if (!_textbookCache) {
    const words: Word[] = []
    for (const [, module] of Object.entries(textbookModules)) {
      if (module.default && Array.isArray(module.default)) {
        words.push(...module.default)
      }
    }
    _textbookCache = words
  }
  if (level === undefined) return _textbookCache
  return _textbookCache.filter((w) => w.textbookLevel === level)
}

/** 获取所有教科书级别（LEVEL 1、LEVEL 2…），升序 */
export function getTextbookLevels(): number[] {
  const levels = new Set<number>()
  for (const w of getTextbookWords()) {
    if (w.textbookLevel !== undefined) levels.add(w.textbookLevel)
  }
  return Array.from(levels).sort((a, b) => a - b)
}

/** 获取级别的展示名，如 1 → "LEVEL 1"（取自数据里的 textbook 字段） */
export function getTextbookLevelName(level: number): string {
  const sample = getTextbookWords(level)[0]
  return sample?.textbook || `LEVEL ${level}`
}

/** 获取某级别下的所有单元号，升序 */
export function getTextbookUnits(level: number): number[] {
  const units = new Set<number>()
  for (const w of getTextbookWords(level)) {
    if (w.unit !== undefined) units.add(w.unit)
  }
  return Array.from(units).sort((a, b) => a - b)
}

// ========== 综合查询 ==========

/** 获取所有学习单词（JLPT + 教科书） */
export function getAllStudyWords(): Word[] {
  return [...getAllWords(), ...getTextbookWords()]
}

/** 按 JLPT 级别获取单词 */
export function getWordsByLevel(level: JLPTLevel): Word[] {
  return getAllWords().filter((word) => word.level === level)
}

/** 按教科书级别 + 单元获取单词 */
export function getWordsByUnit(level: number, unit: number): Word[] {
  return getTextbookWords(level).filter((w) => w.unit === unit)
}

/** 获取所有 JLPT 级别列表 */
export function getAllLevels(): JLPTLevel[] {
  return ['N5', 'N4', 'N3', 'N2', 'N1']
}

/** 搜索单词（在所有词库中搜索） */
export function searchWords(keyword: string): Word[] {
  const lower = keyword.toLowerCase().trim()
  if (!lower) return []

  return getAllStudyWords().filter(
    (word) =>
      word.word.includes(lower) ||
      word.reading.includes(lower) ||
      word.meaning.includes(lower) ||
      word.word.includes(keyword) ||
      word.reading.includes(keyword)
  )
}

/** 根据 ID 获取单词 */
export function getWordById(id: string): Word | undefined {
  return getAllStudyWords().find((word) => word.id === id)
}

/** 清除所有缓存 */
export function clearWordCache(): void {
  _wordCache = null
  _textbookCache = null
}
