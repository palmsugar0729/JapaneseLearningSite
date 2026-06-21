---
name: daily-new-word-limit
description: 每日新词上限的设计
metadata:
  type: project
---

# 每日新词上限

`MAX_NEW_PER_DAY = 10`，全天硬上限，不是每次调用 10 个。

**实现：** `useSRS.ts` 中维护 `todayNewSet`（`ref<Set<string>>`），`submitReview` 首次遇到某单词时加入集合。`getNewWords` 计算剩余配额 `MAX_NEW_PER_DAY - todayNewSet.size`，配额用完返回空数组。`resetTodayNewIfNeeded()` 在跨天时清空集合。

**Why:** 初始实现只限制每次调用返回 10 个，用户返回 Dashboard 再点击又能再拿 10 个，一天能学无限新词，违背 SM-2 设计原则。

**How to apply:** 如需调整上限，修改 `MAX_NEW_PER_DAY` 常量（export 的，UI 可引用显示）。
