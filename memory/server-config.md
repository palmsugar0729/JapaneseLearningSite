---
name: server-config
description: 腾讯云轻量服务器配置信息
metadata:
  type: project
---

# 腾讯云轻量服务器

**配置：** 4 核 4GB 内存 40GB SSD

**当前状态：** 之前跑 龙虾（Lobster）项目，计划重装系统

**计划用途：** JapaneseLearning 后端服务器，后续也跑 龙虾中枢 + Obsidian 同步

**重装方案：** Ubuntu 22.04 LTS（或 24.04 LTS），可选装宝塔面板方便管理

**域名：** 已申请，备案上线前一个月再提交

**部署清单：**
- Node.js 18/20 LTS
- Nginx 反向代理（API 子域 → localhost:3001）
- PM2 进程管理（自动重启、开机启动）
- SSL 证书（腾讯云免费证书 / Let's Encrypt）
- Git 拉取 + 部署脚本
- 防火墙：只开 22/80/443

**开发阶段：** 用 IP + 端口直连测试，微信开发者工具关掉域名校验
