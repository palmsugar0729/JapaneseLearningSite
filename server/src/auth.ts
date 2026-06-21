import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'japanese-learning-dev-secret'
const JWT_EXPIRES_IN = '7d'

export interface TokenPayload {
  userId: number
  username: string
}

/** 签发 JWT */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/** 验证 JWT 中间件 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未登录' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    ;(req as any).user = decoded
    next()
  } catch {
    res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}
