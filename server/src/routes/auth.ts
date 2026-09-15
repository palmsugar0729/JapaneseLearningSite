import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { signToken, authMiddleware, type TokenPayload } from '../auth.js'
import { validateUsername, validatePassword } from '../validation.js'
import { contentFilter } from '../contentFilter.js'

// 微信小程序登录配置（通过服务器环境变量注入，不进代码库）
const WX_APPID = process.env.WX_APPID || ''
const WX_SECRET = process.env.WX_SECRET || ''

interface WxSessionResp {
  openid?: string
  session_key?: string
  errcode?: number
  errmsg?: string
}

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

    const usernameError = validateUsername(username)
    if (usernameError) {
      res.status(400).json({ error: usernameError })
      return
    }

    // 违禁词检查（当前 contentFilter 是空实现，见 contentFilter.ts）
    if (!contentFilter(username)) {
      res.status(400).json({ error: '用户名包含违规内容' })
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      res.status(400).json({ error: passwordError })
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

// ========== 用户中心：修改用户名 / 修改密码 ==========

/** PUT /username —— 修改用户名，成功后重新签发 token */
router.put('/username', authMiddleware, (req: Request, res: Response) => {
  try {
    const current = (req as any).user as TokenPayload
    const { username } = req.body

    const usernameError = validateUsername(username)
    if (usernameError) {
      res.status(400).json({ error: usernameError })
      return
    }

    if (!contentFilter(username)) {
      res.status(400).json({ error: '用户名包含违规内容' })
      return
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as
      | { id: number }
      | undefined

    if (existing && existing.id !== current.userId) {
      res.status(409).json({ error: '用户名已存在' })
      return
    }

    // 改成同名时无需写库，但依然要重签 token（旧 token 可能已过期）
    if (!existing) {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, current.userId)
    }

    // token 里带着 username，不重签的话前端导航栏会一直显示旧名字
    const token = signToken({ userId: current.userId, username })

    res.json({
      token,
      user: { id: current.userId, username },
    })
  } catch (err) {
    console.error('[update-username]', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/** PUT /password —— 修改密码，需校验原密码与新密码强度 */
router.put('/password', authMiddleware, (req: Request, res: Response) => {
  try {
    const current = (req as any).user as TokenPayload
    const { oldPassword, newPassword } = req.body

    if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
      res.status(400).json({ error: '参数格式错误' })
      return
    }

    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(current.userId) as
      | { password_hash: string }
      | undefined

    if (!row) {
      res.status(404).json({ error: '用户不存在' })
      return
    }

    // 微信登录创建的用户没有密码，此时 password_hash 为空字符串
    if (!row.password_hash) {
      res.status(400).json({ error: '当前账号由微信登录创建，暂不支持在此修改密码' })
      return
    }

    if (!bcrypt.compareSync(oldPassword, row.password_hash)) {
      res.status(400).json({ error: '当前密码不正确' })
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      res.status(400).json({ error: passwordError })
      return
    }

    if (oldPassword === newPassword) {
      res.status(400).json({ error: '新密码不能与当前密码相同' })
      return
    }

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
      bcrypt.hashSync(newPassword, 10),
      current.userId
    )

    res.json({ ok: true })
  } catch (err) {
    console.error('[update-password]', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ========== 微信小程序一键登录 ==========

router.post('/wx-login', async (req: Request, res: Response) => {
  try {
    const { code } = req.body

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: '缺少登录 code' })
      return
    }

    if (!WX_APPID || !WX_SECRET) {
      res.status(500).json({ error: '服务器未配置微信登录（WX_APPID / WX_SECRET）' })
      return
    }

    // code 换 openid
    const url =
      'https://api.weixin.qq.com/sns/jscode2session' +
      `?appid=${encodeURIComponent(WX_APPID)}` +
      `&secret=${encodeURIComponent(WX_SECRET)}` +
      `&js_code=${encodeURIComponent(code)}` +
      '&grant_type=authorization_code'

    const resp = await fetch(url)
    const data = (await resp.json()) as WxSessionResp

    if (!data.openid) {
      console.error('[wx-login] jscode2session failed:', data)
      res.status(401).json({ error: `微信登录失败：${data.errmsg || '无效 code'}` })
      return
    }

    const openid = data.openid

    // 查已有微信用户
    const existing = db
      .prepare('SELECT id, username, openid FROM users WHERE openid = ?')
      .get(openid) as { id: number; username: string; openid: string } | undefined

    let userId: number
    let username: string

    if (existing) {
      userId = existing.id
      username = existing.username
    } else {
      // 新建用户：自动生成用户名，密码留空（微信用户无密码）
      username = `wx_${openid.slice(-12)}`
      const result = db
        .prepare('INSERT INTO users (username, password_hash, openid) VALUES (?, ?, ?)')
        .run(username, '', openid)
      userId = Number(result.lastInsertRowid)
    }

    const token = signToken({ userId, username })
    res.json({ token, user: { id: userId, username, openid } })
  } catch (err) {
    console.error('[wx-login]', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
