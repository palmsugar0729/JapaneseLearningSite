/**
 * Fisher-Yates (Knuth) 洗牌算法
 * 时间复杂度 O(n)，保证每种排列等概率
 */

/**
 * 返回一个新数组，元素顺序随机打乱（不修改原数组）
 * @param arr 原数组
 * @returns 打乱后的新数组
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 返回随机抽取的 N 个元素（不重复）
 * @param arr 原数组
 * @param count 抽取数量
 * @returns 随机抽取的新数组
 */
export function pickRandom<T>(arr: T[], count: number): T[] {
  if (count >= arr.length) return shuffleArray(arr)
  // 部分洗牌：只洗前 count 个
  const result = [...arr]
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (result.length - i))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result.slice(0, count)
}
