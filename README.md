# JapaneseLearning — 日语学习工具

基于 Vue 3 + TypeScript 的日语学习应用，支持 **Web SPA** + **微信小程序** 双端。内置 SM-2 间隔重复算法、用户系统、教科书同步。

## 功能

- **📝 SRS 单词卡** — SM-2 间隔重复算法，N5~N1 共 16,427 词，支持级别筛选
- **📖 教科书同步** — 按教科书单元组织单词，支持进度追踪（新编日语教程1）
- **✏️ 练习题库** — 语法选择 + 翻译题，错题本 + 级别筛选
- **📊 学习统计** — 热力图、掌握率柱状图、正确率趋势等 ECharts 图表
- **👤 用户系统** — 注册/登录 + 微信登录，多用户数据隔离，SQLite 持久化
- **📱 微信小程序** — uni-app 开发，一套代码双端运行

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

## 项目结构

```
JapaneseLearning/
├── server/              # Express + SQLite 后端
│   └── src/
│       ├── index.ts     # 服务入口 (port 3001)
│       ├── db.ts        # SQLite 数据库
│       ├── auth.ts      # JWT 认证
│       └── routes/      # API 路由
├── codes/               # 前端
│   ├── web/             # Web 版 (Vue 3 + Vite SPA)
│   │   └── src/
│   │       ├── views/       # 页面组件
│   │       ├── components/  # 图表组件
│   │       ├── composables/ # SRS、练习进度、图表数据
│   │       ├── api/         # 数据加载 + HTTP 客户端
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
- [数据格式模板](codes/web/src/content/japanese/DATA_TEMPLATE.md)
- [AI 开发指南](AGENTS.md)
