# JapaneseLearning — 日语学习工具

基于 Vue 3 + TypeScript 的日语学习应用，支持 **Web SPA** + **微信小程序** 双端。内置 SM-2 间隔重复算法、用户系统、教科书同步。

## 功能

- **📝 SRS 单词卡** — SM-2 间隔重复算法，N5~N1 共 16,427 词，支持级别筛选
- **📖 教科书同步** — 按教科书单元组织单词，支持进度追踪（新编日语教程1）
- **✏️ 练习题库** — 语法选择 / 翻译 / 语法词填空 / 读音练习，错题本 + 级别筛选（后两类为输入框作答，判分做全角/假名归一化）
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

```bash
# 前端：本地构建 → 上传 dist → 替换 web root
cd codes/web && npm run build
tar czf /tmp/dist.tgz dist && scp /tmp/dist.tgz jplearning:/tmp/
# 服务器：备份旧 dist 后解包替换

# 后端：上传改动的 src 文件 → 重启进程
scp server/src/... jplearning:/tmp/
sudo env PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH pm2 restart japanese-api
```

> 详细步骤与故障排查见 [服务器部署指南](docs/服务器部署指南.md)。

## 项目结构

```
JapaneseLearning/
├── server/              # Express + SQLite 后端
│   └── src/
│       ├── index.ts     # 服务入口 (port 3001)
│       ├── db.ts        # SQLite 数据库与迁移
│       ├── auth.ts      # JWT 认证
│       ├── validation.ts    # 用户名/密码校验规则（唯一定义处，前端镜像同一份）
│       ├── contentFilter.ts # 违禁词过滤（当前为空实现，已知合规缺口）
│       └── routes/      # API 路由（auth：注册/登录/改名/改密码，progress）
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
│   │       ├── content/     # 单词 JSON、练习数据
│   │       └── router/      # 路由配置
│   └── miniprogram/     # 微信小程序版 (uni-app Vue 3)
│       └── src/
│           ├── pages/       # 页面（index/word/exercise/login/user）
│           ├── components/  # 图表组件（原生 view）
│           ├── composables/ # SRS、练习进度、图表数据
│           ├── api/         # uni.request 客户端
│           ├── types/       # TypeScript 类型
│           └── content/     # 开发期词库（N5 + 教科书）
├── docs/                # 产品文档
├── assets/              # 设计素材
├── AGENTS.md            # AI 开发指南
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

- [产品需求文档 (PRD)](docs/PRD.md)
- [开发日志](docs/开发日志.md)
- [v2.6 迭代待办清单](docs/2026-09-15-todo-list.md)
- [需求原文](docs/needs.md)
- [服务器部署指南](docs/服务器部署指南.md)
- [数据格式模板](codes/web/src/content/japanese/DATA_TEMPLATE.md)
- [AI 开发指南](AGENTS.md)
