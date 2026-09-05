---
name: server-config
description: 腾讯云轻量服务器配置信息
metadata:
  type: project
---

# 腾讯云轻量服务器

**配置：** 4 核 4GB 内存 40GB SSD

**当前状态：** 网页版已上线（HTTPS，2026-09-04）；后端已部署；09-05 修复背单词崩溃 + nginx gzip 提速

**IP：** 124.221.0.238
**实例 ID：** lhins-keecg7lu
**系统：** Ubuntu 24.04 LTS

**SSH 登录：** 用户 `ubuntu`（**不是 root**），密钥 `~/Downloads/jplearning.pem`，本地已配 ssh config 别名 `jplearning`，有免密 sudo。⚠️ 部署指南里写的 `root@` 是错的

**域名：** palmsugar.cn，子域名 `jplearning.palmsugar.cn` → 已解析到服务器 IP

**代码路径：** `/opt/japanese-learning/JapaneseLearningSite/`
**数据库：** `/opt/japanese-learning/JapaneseLearningSite/server/data/japanese.db`

**已部署：**
- Node.js 20 + nvm
- PM2（进程名 `japanese-api`，开机自启）
- Nginx 静态托管 + `/api` 反代（localhost:3001）+ SPA fallback + gzip 压缩 JS/CSS/JSON + `/assets` immutable 缓存
- Express 后端（PM2 守护，稳定 online）
- DNS 解析已配置

**Nginx 踩坑：** `gzip_types` 必须显式含 `application/javascript` 等，否则 JS 不压缩（nginx 默认只压 text/html）—— 2026-09-05 已修，词库 chunk 3.2MB→654KB。

**备案：** ✅ 已通过（2026-09-04），备案号 **沪ICP备2026043380号**（已加到 web footer）

**待办：**
- 公安联网备案（`www.beian.gov.cn`，进行中），通过后把「沪公网安备 XXX 号」加到 footer
- 小程序端 API 地址换成正式域名 `https://jplearning.palmsugar.cn/api`（当前是服务器 IP，测试阶段）
- 微信登录：`/api/auth/wx-login` 接口已实现（2026-08-16），待配 `WX_APPID`/`WX_SECRET` 环境变量

**部署指南：** [[docs/服务器部署指南]]，见项目 `docs/服务器部署指南.md`
