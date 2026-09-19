---
name: word-data-level-field
description: 词库 JSON 缺少 level 字段的问题和解决方案
metadata:
  type: project
---

# 词库 JSON 无 level 字段

N5~N1 的 JSON 文件中每个单词条目**没有 `level` 字段**，数据按文件名分了类但代码里 `w.level === 'N5'` 永远不成立。

**修复：** `api/vocabulary.ts` 的 `getAllWords()` 中通过 `Object.entries()` 获取文件路径，用正则 `/\\/(N[1-5])\\.json$/i` 提取级别，然后 `{ ...word, level }` 注入。同时加了缓存避免每次重建 16k+ 对象。

**教科书不同：** 教科书 JSON 文件**自己带了** `source`/`textbook`/`textbookLevel`/`unit` 字段，加载层直接读，不靠文件名推断（v2.6.1 起文件放在 `textbook/level-N/` 子目录下，但级别仍以字段为准）。

**How to apply:** 后续添加新词库时，**优先在 JSON 内写入级别字段**（教科书就是这么做的），只有像 JLPT 那样历史数据已经按文件名分好类、又不值得回写 16k 条时，才在加载层用路径正则注入。相关：[[v2.6.1-plan]]
