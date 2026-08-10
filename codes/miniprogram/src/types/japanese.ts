/**
 * 日语学习模块统一类型定义
 */

// ========== 单词相关 ==========

/** JLPT 级别 */
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

/** 学习来源 */
export type WordSource = 'jlpt' | 'textbook'

/** 单词数据 */
export interface Word {
  /** 唯一标识，如 "n5-001" */
  id: string
  /** 日语单词 */
  word: string
  /** 读音（假名） */
  reading: string
  /** 中文意思 */
  meaning: string
  /** 词性 */
  type: string
  /** 声调标记 */
  accent: string
  /** JLPT 级别 */
  level: JLPTLevel
  /** 例句（日文） */
  example: string
  /** 例句翻译 */
  exampleTranslation: string
  /** 来源：jlpt（词库） 或 textbook（教科书） */
  source?: WordSource
  /** 教科书名称 */
  textbook?: string
  /** 教科书单元/课次 */
  unit?: number
}

/** 单词学习进度 */
export interface WordProgress {
  /** 对应单词 ID */
  wordId: string
  /** 简易度系数 (easiness factor)，初始 2.5 */
  ef: number
  /** 连续答对次数 */
  repetitions: number
  /** 间隔天数 */
  interval: number
  /** 下次复习日期 (ISO 字符串) */
  nextReview: string
  /** 上次复习日期 (ISO 字符串) */
  lastReviewed: string
  /** 总复习次数 */
  totalReviews: number
}

/** 单词学习状态（用于 UI 展示） */
export type WordStatus = 'new' | 'learning' | 'mastered'

/** 带状态的单词（用于浏览模式） */
export interface WordWithStatus extends Word {
  status: WordStatus
  progress?: WordProgress
}

// ========== 练习相关 ==========

/** 练习题类型 */
export type ExerciseType = 'choice' | 'translation'

/** 练习题数据 */
export interface Exercise {
  /** 唯一标识，如 "ex-001" */
  id: string
  /** 题型 */
  type: ExerciseType
  /** JLPT 级别 */
  level: JLPTLevel
  /** 题目 */
  question: string
  /** 选项 */
  options: string[]
  /** 正确选项索引 */
  answer: number
  /** 解析 */
  explanation: string
}

/** 练习记录 */
export interface ExerciseRecord {
  /** 题目 ID */
  exerciseId: string
  /** 是否答错 */
  isWrong: boolean
  /** 答题日期 (ISO 字符串) */
  answeredAt: string
}

/** 练习历史（单次练习） */
export interface ExerciseSession {
  /** 练习日期 */
  date: string
  /** 总题数 */
  total: number
  /** 正确数 */
  correct: number
  /** 用时（秒） */
  duration: number
  /** 级别 */
  level: JLPTLevel | 'mixed'
  /** 题型 */
  type: ExerciseType | 'mixed'
}

// ========== 统计相关 ==========

/** 学习统计 */
export interface LearningStats {
  /** 总单词数 */
  totalWords: number
  /** 已掌握单词数 */
  masteredWords: number
  /** 学习中单词数 */
  learningWords: number
  /** 新单词数 */
  newWords: number
  /** 今日待复习数 */
  todayReviews: number
  /** 连续学习天数 */
  streakDays: number
  /** 最后学习日期 */
  lastStudyDate: string
}

/** 级别进度 */
export interface LevelProgress {
  level: JLPTLevel
  total: number
  mastered: number
  learning: number
  new: number
}

/** 教科书单元进度 */
export interface UnitProgress {
  unit: number
  title: string
  total: number
  mastered: number
  learning: number
  new: number
}
