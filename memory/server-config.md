---
name: server-config
description: 腾讯云轻量服务器配置信息
metadata:
  type: project
---

# 腾讯云轻量服务器

**配置：** 4 核 4GB 内存 40GB SSD

**当前状态：** 已部署 JapaneseLearning 后端（2026-08-13 完成）

**IP：** 124.221.0.238
**实例 ID：** lhins-keecg7lu
**系统：** Ubuntu 24.04 LTS

**域名：** palmsugar.cn，子域名 `jplearning.palmsugar.cn` → 已解析到服务器 IP

**代码路径：** `/opt/japanese-learning/JapaneseLearningSite/`
**数据库：** `/opt/japanese-learning/JapaneseLearningSite/server/data/japanese.db`

**已部署：**
- Node.js 20 + nvm
- PM2（进程名 `japanese-api`，开机自启）
- Nginx 反向代理（80 → localhost:3001）
- Express 后端（PM2 守护，稳定 online）
- DNS 解析已配置

**待办：**
- 备案（上线前一个月提交）
- SSL 证书（备案通过后，certbot + Let's Encrypt）
- 小程序端 API 地址换成正式域名（当前是 `localhost:3001`）
- 微信登录：`/api/auth/wx-login` 接口已实现（2026-08-16），待配 `WX_APPID`/`WX_SECRET` 环境变量

**部署指南：** [[docs/服务器部署指南]]，见项目 `docs/服务器部署指南.md`
