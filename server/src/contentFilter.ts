/**
 * 用户内容过滤（违禁词）
 *
 * ⚠️ 当前是**空实现** —— v2.6 有意未做用户内容审核，这是已知合规缺口，
 *    理由与后续可选方案见 docs/2026-09-15-todo-list.md 第四节。
 *
 * 预留此函数是为了让后端校验流程先跑起来：本期它永远返回 true，
 * 下期接入敏感词库或云内容安全 API 时**只需改本函数体**，调用点无需改动。
 *
 * 现有的两个调用点（server/src/routes/auth.ts）：
 *   - POST /register     注册时的用户名
 *   - PUT  /username     修改用户名时的新用户名
 */

/**
 * 检查一段用户文本是否允许使用
 * @param _text 待检查文本（当前未使用）
 * @returns true 表示通过
 */
export function contentFilter(_text: string): boolean {
  return true
}
