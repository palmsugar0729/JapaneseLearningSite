# JapaneseLearning — 日语学习工具

基于 Vue 3 + TypeScript 的日语学习应用，支持 **Web SPA** + **微信小程序** 双端。内置 SM-2 间隔重复算法、用户系统、教科书同步。

## 功能

- **📝 SRS 单词卡** — SM-2 间隔重复算法，N5~N1 共 16,427 词，支持级别筛选
- **📖 教科书词库** — 按「教材 LEVEL + 单元」组织，支持进度追踪。当前 LEVEL 1（新编日语教程1）全 16 课 920 词；前端可选 LEVEL，`level-2~4` 目录已就绪，数据到位即用
- **✏️ 练习题库** — 语法选择 / 翻译 / 语法词填空 / 读音练习，错题本 + 级别筛选（后两类为输入框作答，判分做全角/假名归一化）。⚠️ 当前仅 10 题，且后两类**尚无数据**
- **📊 学习统计** — 热力图、掌握率柱状图、正确率趋势等 ECharts 图表
- **👤 用户系统** — 注册/登录 + 微信登录，多用户数据隔离，SQLite 持久化；支持修改用户名（重签 JWT）与修改密码
- **📱 微信小程序** — uni-app 开发，一套代码双端运行（当前暂缓，Web 端优先）
- **🧾 备案合规** — footer 展示 ICP + 公安备案号（含公安图标），含隐私政策、联系我们、busuanzi 访问量统计

## 快速开始

```bash
# 后端
cd server && npm install && npm run dev    # → http://localhost:3001

# Web 版
cd codes/web && npm install && npm run dev # → http://localhost:5173

# 微信小程序版
cd codes/miniprogram && npm install && npm run dev:mp-weixin
# → 用微信开发者工具导入 dist/build/mp-weixin/
```

不启动后端也可使用——自动回退到 localStorage 模式。

## 部署

线上地址 `https://jplearning.palmsugar.cn`（nginx 静态托管 `codes/web/dist`，`/api` 反代到 PM2 守护的 `japanese-api`）。

> ⚠️ **服务器连不上 GitHub，不能用 `git pull` 部署**，一律走 `scp`。`push` 到 GitHub 和部署到服务器是两件独立的事。

```bash
# 前端：本地构建 → 打包上传 → 服务器上换掉旧 dist（dist 属 ubuntu，无需 sudo）
cd codes/web && npm run build
tar czf /tmp/jp-dist.tgz dist && scp /tmp/jp-dist.tgz jplearning:/tmp/

# 后端：server/src 属 root，必须先传 /tmp 再 sudo cp
scp server/src/routes/auth.ts jplearning:/tmp/
ssh jplearning 'sudo cp /tmp/auth.ts /opt/japanese-learning/JapaneseLearningSite/server/src/routes/auth.ts'
ssh jplearning 'sudo env PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH pm2 restart japanese-api'
```

判断部署成功：新接口返回 **401/400 而不是 404**（404 = 路由没注册上，文件没传对）。

> 🗄️ **数据库备份**：线上库跑在 WAL 模式，**绝不能直接 `cp` 主库文件**（数据压在 `-wal` 里，`cp` 拿到的是不完整快照）。用 `server/scripts/backup-db.mjs`，线上已挂 cron 每天 03:17，产出在 `/opt/japanese-learning/backups/`（留 14 份）。细节见 [AGENTS.md](AGENTS.md) 3.10。

> 完整流程、回滚、环境变量与故障排查见 [服务器部署指南](docs/服务器部署指南.md)。

## 环境变量

后端可选环境变量：`PORT`、`JWT_SECRET`、`WX_APPID`、`WX_SECRET`。

线上不落 `.env` 文件（依赖里也没有 `dotenv`），密钥统一放 `/root/.jplearning-secrets.env`（600，root），由 PM2 注入进程环境：

```bash
set -a; . /root/.jplearning-secrets.env; set +a
sudo env PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH pm2 restart japanese-api --update-env
sudo env PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH pm2 save   # 不 save，重启后会丢
```

⚠️ 改 `JWT_SECRET` 会让**所有已登录用户掉线**（签名对不上），要挑没人用的时候做。`WX_SECRET` **绝不能提交进仓库**。

## 项目结构

```
JapaneseLearning/
├── server/              # Express + SQLite 后端
│   ├── src/
│   │   ├── index.ts     # 服务入口 (port 3001)
│   │   ├── db.ts        # SQLite 数据库与迁移
│   │   ├── auth.ts      # JWT 认证
│   │   ├── validation.ts    # 用户名/密码校验规则（唯一定义处，前端镜像同一份）
│   │   ├── contentFilter.ts # 违禁词过滤（当前为空实现，已知合规缺口）
│   │   └── routes/      # API 路由（auth：注册/登录/改名/改密码，progress）
│   └── scripts/         # 运维脚本：backup-db.mjs（数据库备份，线上 cron 每天跑）
├── codes/               # 前端
│   ├── web/             # Web 版 (Vue 3 + Vite SPA)
│   │   ├── public/          # 静态直出资源（icon.png、beian.png）
│   │   └── src/
│   │       ├── views/       # 页面组件（含 Privacy、Contact 公开页）
│   │       ├── components/  # 图表组件
│   │       ├── composables/ # SRS、练习进度、图表数据
│   │       ├── api/         # 数据加载 + HTTP 客户端
│   │       ├── utils/       # 校验规则、输入题判分归一化
│   │       ├── types/       # TypeScript 类型
│   │       ├── content/     # 词库：JLPT (words/) + 教科书 (textbook/level-N/)；练习数据
│   │       └── router/      # 路由配置
│   └── miniprogram/     # 微信小程序版 (uni-app Vue 3)
│       └── src/
│           ├── pages/       # 页面（index/word/exercise/login/user）
│           ├── components/  # 图表组件（原生 view）
│           ├── composables/ # SRS、练习进度、图表数据
│           ├── api/         # uni.request 客户端
│           ├── types/       # TypeScript 类型
│           └── content/     # 开发期词库（N5 + 教科书）
├── docs/                # 产品文档（PRD / 开发日志 / 迭代清单 / 部署指南）
├── assets/              # 设计素材（design / bug / reference）
├── notes/               # 开发笔记 & 踩坑记录
├── memory/              # 会话记忆（决策、服务器配置、协作偏好）+ 索引在 MEMORY.md
├── nginx-jplearning.conf # nginx 站点配置（服务器上的副本）
├── AGENTS.md            # AI 开发指南
├── MEMORY.md            # 记忆索引
└── README.md
```

## 技术栈

| 层面 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) |
| 语言 | TypeScript |
| 构建 | Vite |
| 路由 | Vue Router 4 |
| 样式 | SCSS (玻璃拟态) |
| 图表 | ECharts + vue-echarts（小程序端为原生 view） |
| 后端 | Express + better-sqlite3 |
| 认证 | JWT (jsonwebtoken) |
| 存储 | SQLite / localStorage 双模式 |
| 算法 | SM-2 间隔重复 + Fisher-Yates 洗牌 |

## 文档

- [产品需求文档 (PRD)](docs/PRD.md) — 功能清单、数据结构、版本历史
- [开发日志](docs/开发日志.md) — 按日期记录完成事项、决策与踩坑
- [v2.6 迭代清单](docs/2026-09-15-todo-list.md) — 需求→决策对照、新题型数据格式、验收清单
- [需求原文](docs/needs.md)
- [服务器部署指南](docs/服务器部署指南.md) — **部署前必读**（含 PM2/权限/nginx 的坑）
- [数据格式模板](codes/web/src/content/japanese/DATA_TEMPLATE.md)
- [AI 开发指南](AGENTS.md) — 代码约定、页脚与备案约定、当前状态
- 历史批次：[2026-08-16 迭代](docs/2026-08-16-todo-list.md) · [2026-09-04 上线](docs/2026-09-04-上线todo-list.md) · [网页版上线步骤](docs/2026-09-04-网页版上线步骤.md)
