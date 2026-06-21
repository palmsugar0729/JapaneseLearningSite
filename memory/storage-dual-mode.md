---
name: storage-dual-mode
description: 数据存储双模式设计决策
metadata:
  type: project
---

# 双模式存储设计

用户登录后数据存 SQLite（通过 API），未登录时自动回退到 localStorage。

**Why:** 尚未部署服务器时本地也能用，登录后支持多用户数据隔离。后面切 MySQL 只需换数据库驱动。

**实现：** `api/client.ts` 中 `_token` 是 Vue `ref`（响应式），composables 中写操作通过 API + 内存缓存同步，读操作直接走内存缓存（同步）。

**关键教训：** 初次实现时 `_token` 是普通 JS 变量，导致 Vue `computed` 无法追踪变化，退出登录后 UI 不更新。改为 `ref` 解决。

**How to apply:** 新增数据存储功能时遵循此模式。
