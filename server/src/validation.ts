/**
 * 账号校验规则（唯一权威定义）
 *
 * ⚠️ 前端 codes/web/src/utils/validation.ts 是本文件的镜像实现。
 *    修改规则时两边必须同步，错误文案保持一致，否则用户会看到不一致的提示。
 *
 * 规则来源：docs/2026-09-15-todo-list.md 第三节
 */

/** 用户名长度范围 */
export const USERNAME_MIN = 5
export const USERNAME_MAX = 32

/** 密码最短长度 */
export const PASSWORD_MIN = 8

/** 密码需满足的字符类别数（数字 / 小写 / 大写 / 特殊字符 四类中至少三类） */
export const PASSWORD_MIN_CATEGORIES = 3

/**
 * 用户名允许的字符：中日文汉字、平假名、片假名、英文字母、数字、下划线、连字符。
 * 不允许空格和标点。
 */
// 中日文汉字 一-鿿 ｜ 平假名 ぀-ゟ ｜ 片假名 ゠-ヿ
const USERNAME_PATTERN = /^[一-鿿぀-ゟ゠-ヿA-Za-z0-9_-]+$/

/** 四类字符各自的判定规则 */
const PASSWORD_CATEGORIES = [
  { name: '数字', pattern: /[0-9]/ },
  { name: '小写字母', pattern: /[a-z]/ },
  { name: '大写字母', pattern: /[A-Z]/ },
  // 可打印的 ASCII 标点：!-/ : @ [ ` { ~ 四段
  { name: '特殊字符', pattern: /[!-\/:-@\[-`{-~]/ },
]

/** 按字符计数（而非 UTF-16 码元），避免代理对字符被算成两个 */
function charLength(text: string): number {
  return Array.from(text).length
}

/**
 * 校验用户名
 * @returns 错误提示；通过则返回 null
 */
export function validateUsername(username: unknown): string | null {
  if (typeof username !== 'string' || username.length === 0) {
    return '用户名不能为空'
  }

  const len = charLength(username)
  if (len < USERNAME_MIN || len > USERNAME_MAX) {
    return `用户名长度需为 ${USERNAME_MIN}-${USERNAME_MAX} 个字符`
  }

  if (!USERNAME_PATTERN.test(username)) {
    return '用户名只能包含汉字、假名、字母、数字、下划线或连字符，不能有空格和标点'
  }

  return null
}

/**
 * 校验密码强度
 * @returns 错误提示；通过则返回 null
 */
export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.length === 0) {
    return '密码不能为空'
  }

  if (charLength(password) < PASSWORD_MIN) {
    return `密码至少 ${PASSWORD_MIN} 个字符`
  }

  const hit = PASSWORD_CATEGORIES.filter((c) => c.pattern.test(password)).length
  if (hit < PASSWORD_MIN_CATEGORIES) {
    return '密码需包含数字、小写字母、大写字母、特殊字符中的至少三种'
  }

  return null
}
