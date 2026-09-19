#!/usr/bin/env node
/**
 * 线上数据库备份
 *
 * ⚠️ 库跑在 WAL 模式，直接 `cp japanese.db` 拿到的是**不完整快照**
 *    （数据大部分还在 -wal 文件里，主库文件平时只有几 KB）。
 *    这里用 SQLite 官方在线备份 API（better-sqlite3 的 db.backup()），
 *    产出的是一个已 checkpoint 的完整单文件，且备份期间不阻塞线上写入。
 *
 * 用法：
 *   node server/scripts/backup-db.mjs
 *
 * 环境变量（都有默认值，一般不用传）：
 *   JPLEARNING_DB          源库路径，默认 server/data/japanese.db
 *   JPLEARNING_BACKUP_DIR  备份目录，默认 /opt/japanese-learning/backups
 *   JPLEARNING_BACKUP_KEEP 保留份数，默认 14
 *
 * 备份完会**校验**：跑 PRAGMA integrity_check 并数一下 users / srs_progress
 * 的行数。校验不过就删掉这个文件并非零退出 —— 宁可不留，也不留一个坏的
 * 让人误以为有退路。
 */
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_DIR = path.join(__dirname, '..')

const DB_PATH = process.env.JPLEARNING_DB || path.join(SERVER_DIR, 'data', 'japanese.db')
const BACKUP_DIR = process.env.JPLEARNING_BACKUP_DIR || '/opt/japanese-learning/backups'
const KEEP = Number(process.env.JPLEARNING_BACKUP_KEEP || 14)

/** 本地时间戳，形如 20260919-201500（文件名按字典序排即时间序） */
function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  )
}

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

/** 备份文件名校验：japanese-<stamp>.db */
const BACKUP_RE = /^japanese-\d{8}-\d{6}\.db$/

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    log(`[错误] 源库不存在：${DB_PATH}`)
    return 1
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true })

  const dest = path.join(BACKUP_DIR, `japanese-${stamp()}.db`)
  const src = new Database(DB_PATH, { readonly: true })

  try {
    await src.backup(dest)
  } catch (e) {
    log(`[错误] 备份失败：${e.message}`)
    src.close()
    return 1
  }
  src.close()

  // ---- 校验：坏备份比没备份更危险，因为它会让人以为有退路 ----
  // 顺带把备份从 WAL 转成 DELETE 日志模式：备份文件不需要 WAL，不转的话
  // 打开校验就会在旁边生成 -wal/-shm 副文件，而轮转只认 .db，会越堆越多。
  // 转完 SQLite 自己会把副文件收掉，备份成为干净的单文件。
  // （线上库恢复后仍会被 db.ts 的 journal_mode=WAL 重新设成 WAL，不受影响。）
  let users
  let srsRows
  try {
    const check = new Database(dest)
    const integrity = check.prepare('PRAGMA integrity_check').get()
    const verdict = Object.values(integrity)[0]
    if (verdict !== 'ok') throw new Error(`integrity_check 返回 ${verdict}`)
    users = check.prepare('SELECT COUNT(*) c FROM users').get().c
    srsRows = check.prepare('SELECT COUNT(*) c FROM srs_progress').get().c
    check.pragma('journal_mode = DELETE')
    check.close()
  } catch (e) {
    fs.rmSync(dest, { force: true })
    log(`[错误] 备份校验失败，已删除该文件：${e.message}`)
    return 1
  }

  const sizeKB = Math.round(fs.statSync(dest).size / 1024)
  log(`[完成] ${dest}  ${sizeKB}KB  用户 ${users} 个 / SRS 进度 ${srsRows} 行`)

  // ---- 轮转：只留最近 KEEP 份 ----
  const expired = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => BACKUP_RE.test(f))
    .sort()
    .slice(0, -KEEP)

  if (expired.length) {
    // 连同 -wal/-shm 副文件一起删（正常不该有，防的是异常中断留下的残留）
    const all = fs.readdirSync(BACKUP_DIR)
    const doomed = new Set(expired)
    for (const base of expired) {
      for (const f of all) if (f.startsWith(`${base}-`)) doomed.add(f)
    }
    for (const f of doomed) {
      fs.rmSync(path.join(BACKUP_DIR, f), { force: true })
      log(`[轮转] 删除过期备份 ${f}`)
    }
  }

  return 0
}

main().then(
  (code) => process.exit(code),
  (e) => {
    log(`[错误] 未捕获异常：${e?.stack || e}`)
    process.exit(1)
  }
)
