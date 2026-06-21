---
name: word-data-level-field
description: 词库 JSON 缺少 level 字段的问题和解决方案
metadata:
  type: project
---

# 词库 JSON 无 level 字段

N5~N1 的 JSON 文件中每个单词条目**没有 `level` 字段**，数据按文件名分了类但代码里 `w.level === 'N5'` 永远不成立。

**修复：** `api/vocabulary.ts` 的 `getAllWords()` 中通过 `Object.entries()` 获取文件路径，用正则 `/\\/(N[1-5])\\.json$/i` 提取级别，然后 `{ ...word, level }` 注入。同时加了缓存避免每次重建 16k+ 对象。

**教科书同理：** 教科书 JSON 文件本身已经包含 `source`/`textbook`/`unit` 字段，直接加载即可。

**How to apply:** 后续添加新词库时，要么在 JSON 内写入 `level` 字段，要么在加载层注入。
