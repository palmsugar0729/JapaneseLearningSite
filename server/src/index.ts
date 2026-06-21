import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import progressRoutes from './routes/progress.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/progress', progressRoutes)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[server] running at http://localhost:${PORT}`)
})
