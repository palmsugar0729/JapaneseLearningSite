import { Router, type Request, type Response } from 'express'
import db from '../db.js'
import { authMiddleware, type TokenPayload } from '../auth.js'

const router = Router()

// 所有 progress 路由都需要登录
router.use(authMiddleware)

function getUserId(req: Request): number {
  return (req as any).user.userId
}

// ========== SRS 进度 ==========

/** 获取 SRS 进度 */
router.get('/srs', (req: Request, res: Response) => {
  const userId = getUserId(req)

  const progressRows = db
    .prepare('SELECT * FROM srs_progress WHERE user_id = ?')
    .all(userId) as any[]

  const progress: Record<string, any> = {}
  for (const row of progressRows) {
    progress[row.word_id] = {
      wordId: row.word_id,
      ef: row.ef,
      repetitions: row.repetitions,
      interval: row.interval_days,
      nextReview: row.next_review || '',
      lastReviewed: row.last_reviewed || '',
      totalReviews: row.total_reviews,
    }
  }

  const statsRow = db
    .prepare('SELECT * FROM srs_stats WHERE user_id = ?')
    .get(userId) as any

  res.json({
    progress,
    stats: statsRow
      ? { lastStudyDate: statsRow.last_study_date || '', streakDays: statsRow.streak_days }
      : {},
  })
})

/** 保存 SRS 进度 */
router.put('/srs', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const { progress, stats } = req.body

  const upsertProgress = db.prepare(`
    INSERT INTO srs_progress (user_id, word_id, ef, repetitions, interval_days, next_review, last_reviewed, total_reviews)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, word_id) DO UPDATE SET
      ef = excluded.ef,
      repetitions = excluded.repetitions,
      interval_days = excluded.interval_days,
      next_review = excluded.next_review,
      last_reviewed = excluded.last_reviewed,
      total_reviews = excluded.total_reviews
  `)

  const deleteProgress = db.prepare('DELETE FROM srs_progress WHERE user_id = ? AND word_id = ?')

  // 同步进度：前端传来的所有 key，删掉不存在的，更新存在的
  const existingKeys = new Set(
    (db.prepare('SELECT word_id FROM srs_progress WHERE user_id = ?').all(userId) as any[]).map(
      (r: any) => r.word_id
    )
  )

  const incomingKeys = new Set(Object.keys(progress || {}))

  const transaction = db.transaction(() => {
    // 删掉前端不再有的
    for (const key of existingKeys) {
      if (!incomingKeys.has(key)) {
        deleteProgress.run(userId, key)
      }
    }
    // 插入或更新
    for (const key of incomingKeys) {
      const p = progress[key]
      upsertProgress.run(userId, key, p.ef, p.repetitions, p.interval, p.nextReview, p.lastReviewed, p.totalReviews)
    }

    // 更新 stats
    if (stats) {
      db.prepare(`
        INSERT INTO srs_stats (user_id, last_study_date, streak_days)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          last_study_date = excluded.last_study_date,
          streak_days = excluded.streak_days
      `).run(userId, stats.lastStudyDate || '', stats.streakDays || 0)
    }
  })

  transaction()
  res.json({ ok: true })
})

// ========== 练习进度 ==========

/** 获取练习进度 */
router.get('/exercise', (req: Request, res: Response) => {
  const userId = getUserId(req)

  const wrongRows = db
    .prepare('SELECT exercise_id FROM exercise_wrong WHERE user_id = ?')
    .all(userId) as any[]

  const historyRows = db
    .prepare('SELECT * FROM exercise_history WHERE user_id = ? ORDER BY date DESC LIMIT 50')
    .all(userId) as any[]

  res.json({
    wrong: wrongRows.map((r: any) => r.exercise_id),
    history: historyRows.map((r: any) => ({
      date: r.date,
      total: r.total,
      correct: r.correct,
      duration: r.duration,
      level: r.level,
      type: r.type,
    })),
  })
})

/** 保存练习进度 */
router.put('/exercise', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const { wrong, history } = req.body

  const insertWrong = db.prepare(
    'INSERT OR IGNORE INTO exercise_wrong (user_id, exercise_id) VALUES (?, ?)'
  )
  const deleteWrong = db.prepare(
    'DELETE FROM exercise_wrong WHERE user_id = ? AND exercise_id = ?'
  )

  const insertHistory = db.prepare(`
    INSERT INTO exercise_history (user_id, date, total, correct, duration, level, type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const transaction = db.transaction(() => {
    // 全量替换错题
    db.prepare('DELETE FROM exercise_wrong WHERE user_id = ?').run(userId)
    for (const id of wrong || []) {
      insertWrong.run(userId, id)
    }

    // 全量替换历史
    db.prepare('DELETE FROM exercise_history WHERE user_id = ?').run(userId)
    for (const h of history || []) {
      insertHistory.run(userId, h.date, h.total, h.correct, h.duration, h.level, h.type)
    }
  })

  transaction()
  res.json({ ok: true })
})

export default router
