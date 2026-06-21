import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { signToken } from '../auth.js'

const router = Router()

router.post('/register', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' })
      return
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: '参数格式错误' })
      return
    }

    if (username.length < 2 || username.length > 30) {
      res.status(400).json({ error: '用户名长度2-30个字符' })
      return
    }

    if (password.length < 4) {
      res.status(400).json({ error: '密码至少4个字符' })
      return
    }

    // 检查用户名是否已存在
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (existing) {
      res.status(409).json({ error: '用户名已存在' })
      return
    }

    const passwordHash = bcrypt.hashSync(password, 10)
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash)

    const token = signToken({ userId: Number(result.lastInsertRowid), username })

    res.status(201).json({
      token,
      user: { id: Number(result.lastInsertRowid), username },
    })
  } catch (err) {
    console.error('[register]', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' })
      return
    }

    const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username) as
      | { id: number; username: string; password_hash: string }
      | undefined

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: '用户名或密码错误' })
      return
    }

    const token = signToken({ userId: user.id, username: user.username })

    res.json({
      token,
      user: { id: user.id, username: user.username },
    })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
