---
name: server-config
description: 腾讯云轻量服务器配置信息 + 部署操作要点（PM2 跑在 root、目录归属、scp 流程）
metadata:
  type: project
---

# 腾讯云轻量服务器

**配置：** 4 核 4GB 内存 40GB SSD

**当前状态：** 网页版已上线（HTTPS，2026-09-04）；v2.6 前后端已于 2026-09-15 部署并线上验证

**IP：** 124.221.0.238
**实例 ID：** lhins-keecg7lu
**系统：** Ubuntu 24.04 LTS

**SSH 登录：** 用户 `ubuntu`（**不是 root**），密钥 `~/Downloads/jplearning.pem`，本地已配 ssh config 别名 `jplearning`，有免密 sudo。⚠️ 部署指南里写的 `root@` 是错的

**域名：** palmsugar.cn，子域名 `jplearning.palmsugar.cn` → 已解析到服务器 IP

**代码路径：** `/opt/japanese-learning/JapaneseLearningSite/`
**Web root：** `/opt/japanese-learning/JapaneseLearningSite/codes/web/dist`（ubuntu 所有，可直接 scp）
**数据库：** `/opt/japanese-learning/JapaneseLearningSite/server/data/japanese.db`

---

## ⚠️ 部署操作要点（血泪，别再踩）

**1. PM2 跑在 root 下，且 `pm2` 不在 ubuntu 的 PATH 里**（连 `bash -lc` 都找不到）。必须显式指定 node 路径：

```bash
sudo env PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH pm2 list
sudo env PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH pm2 restart japanese-api
```

裸跑 `pm2` 会报 `/usr/bin/env: 'node': No such file or directory`，看起来像 pm2 没装，其实是 PATH 问题。

**2. `server/src/` 是 root 所有，`codes/web/dist` 是 ubuntu 所有。**
→ 前端可以直接 scp；后端必须先传到 `/tmp/`，再 `sudo cp` 进目标目录（并 `chown root:root` 保持权限一致）。

**3. 用 scp 部署，不要 `git pull`。** 服务器拉不到 GitHub（国内网络），本机直连 GitHub 也不通。传文件用 tar 打包再 scp，比逐个文件快且可靠。

**4. 服务器上的 git 仓库报 "dubious ownership"**（仓库是 root 所有）。要看状态得先 `sudo git config --global --add safe.directory /opt/japanese-learning/JapaneseLearningSite`。

**5. 验证接口别访问 `http://127.0.0.1/api/health`** —— nginx 的 80 端口 server 块对 `jplearning.palmsugar.cn` 是 `return 404`，用 IP/Host 直接 curl 会拿到 nginx 的 404 页面，**看起来像后端挂了，其实不是**。要从公网用 `https://jplearning.palmsugar.cn/api/health` 验证。

**6. 回滚素材：** 每次部署都留了备份 —— `server/src/routes/auth.ts.bak-<时间戳>`、`codes/web/dist.bak-<时间戳>`。

---

**已部署：**
- Node.js 20 + nvm、PM2（进程名 `japanese-api`，开机自启，restarts 计数会累积）
- Nginx 静态托管 + `/api` 反代（localhost:3001）+ SPA fallback + gzip + `/assets` immutable 缓存
- 站点配置在 `/etc/nginx/sites-available/japanese-api`（仓库里有副本 `nginx-jplearning.conf`），签名证书由 certbot 管理
- Express 后端（PM2 守护，稳定 online）

**Nginx 踩坑：** `gzip_types` 必须显式含 `application/javascript` 等，否则 JS 不压缩（nginx 默认只压 text/html）—— 2026-09-05 已修，词库 chunk 3.2MB→654KB。

**备案：** ✅ ICP 已通过（2026-09-04）备案号 **沪ICP备2026043380号-1**；✅ 公安联网备案已通过，**沪公网安备31011302009700号**。两者均已加到 web footer（公安备案另配 `beian.png` 图标）。

**待办：**
- 小程序端 API 地址换成正式域名 `https://jplearning.palmsugar.cn/api`（当前是服务器 IP，测试阶段）
- 微信登录：`/api/auth/wx-login` 接口已实现（2026-08-16），待配 `WX_APPID`/`WX_SECRET` 环境变量
- 数据库备份 crontab（部署指南第 6 节有脚本，尚未真正挂上）

---

## 本机 git push 的前提

本机 git 配了代理 `http.proxy=http://127.0.0.1:7897`（Clash 之类）。**代理没开时 `git push`/`fetch` 会失败**，直连 GitHub 也不通。报错形如 `Failed to connect to github.com port 443 via 127.0.0.1`。此时 commit 本地照常，push 交给用户手动做即可。

**部署指南：** [[docs/服务器部署指南]]，见项目 `docs/服务器部署指南.md`（⚠️ 该文档部分内容已过时：写的 `root@` 登录名和 `server_name _` 都不对，实际配置见上）
