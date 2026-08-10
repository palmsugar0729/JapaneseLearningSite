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

const textbookModules = import.meta.glob<{ default: Word[] }>(
  '../content/japanese/textbook/*.json',
  { eager: true }
)

let _textbookCache: Word[] | null = null

/** 获取所有教科书单词 */
export function getTextbookWords(): Word[] {
  if (_textbookCache) return _textbookCache

  const words: Word[] = []
  for (const [, module] of Object.entries(textbookModules)) {
    if (module.default && Array.isArray(module.default)) {
      words.push(...module.default)
    }
  }
  _textbookCache = words
  return words
}

/** 获取教科书所有单元号及标题 */
export function getTextbookUnits(): { unit: number; title: string }[] {
  // 按照教材实际课次标题
  const unitTitles: Record<number, string> = {
    1: 'わたしは留学生です',
    2: 'これは家族の写真です',
    3: '自習室は５階にあります',
    4: 'ギョーザは８個で５００円です',
    5: '今朝７時に起きました',
    6: '週末は何をしますか',
    7: 'ここで写真を撮ってもいいですか',
    8: '温泉に入りたいです',
    9: 'おいしそうですね',
    10: '食事の時は、はしを使います',
    11: '私は中国語が話せます',
    12: '天気はどうでしょうか',
    13: '一度食べてみてください',
    14: '田中さんに頼まれたらいいですよ',
    15: '日本語の本が読めるようになりました',
    16: 'もう少しがんばってみます',
  }

  const existingUnits = new Set(
    getTextbookWords().map((w) => w.unit).filter((u): u is number => u !== undefined)
  )

  return Array.from(existingUnits)
    .sort((a, b) => a - b)
    .map((unit) => ({
      unit,
      title: unitTitles[unit] || `第${unit}课`,
    }))
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

/** 按教科书单元获取单词 */
export function getWordsByUnit(unit: number): Word[] {
  return getTextbookWords().filter((w) => w.unit === unit)
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
