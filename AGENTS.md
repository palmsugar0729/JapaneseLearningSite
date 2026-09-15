# AGENTS.md — JapaneseLearning 项目 AI 开发指南

> 本文档面向后续接手的 AI（Claude、Copilot 等），说明项目结构、开发约定和注意事项。

---

## 1. 项目概述

**JapaneseLearning** 是一款日语学习工具，支持 **Web SPA** + **微信小程序** 双端。

- **单词卡 SRS 系统** — SM-2 间隔重复算法，按 JLPT 级别（N5~N1）复习
- **练习题库** — 语法选择 + 翻译题，错题本 + 级别筛选
- **学习仪表盘** — 今日概览、快捷入口、学习动态

技术栈：uni-app (Vue 3 + TypeScript + Vite) 小程序 + Vue 3 SPA Web 版，Express + SQLite 后端。

---

## 2. 目录结构

```
JapaneseLearning/
├── docs/                  # 产品文档区
│   ├── PRD.md             # 产品需求文档
│   └── 开发日志.md
├── assets/
│   ├── design/            # 设计素材：效果图、UI参考图
│   ├── bug/               # 测试报错截图
│   └── reference/         # 参考图、灵感收集
├── notes/                 # 开发笔记：踩坑记录、技术方案
├── codes/
│   ├── web/               # 👈 Web 版 (Vue 3 + Vite SPA)
│   │   ├── src/
│   │   │   ├── types/     # TypeScript 类型定义
│   │   │   ├── utils/     # 工具函数（storage、shuffle）
│   │   │   ├── api/       # 数据加载 + HTTP 客户端
│   │   │   ├── composables/ # useSRS、useExerciseProgress、useStudyHistory
│   │   │   ├── views/     # 页面组件
│   │   │   ├── components/ # 图表等可复用组件
│   │   │   ├── content/   # 静态数据（16,427 词 JSON）
│   │   │   ├── styles/    # SCSS 样式
│   │   │   └── router/    # Vue Router 路由
│   │   └── package.json
│   └── miniprogram/       # 👈 微信小程序版 (uni-app Vue 3)
│       ├── src/
│       │   ├── types/     # 类型定义（与 web 共享）
│       │   ├── utils/     # storage（uni.xxx 适配）、shuffle
│       │   ├── api/       # client（uni.request）+ vocabulary + exercise
│       │   ├── composables/ # 与 web 共享逻辑
│       │   ├── pages/     # 页面（index, word, exercise, login, user）
│       │   ├── components/ # 可复用组件
│       │   ├── content/   # 开发阶段只放 N5 词库
│       │   └── styles/    # 小程序适配样式（无 backdrop-filter）
│       ├── pages.json     # uni-app 路由配置
│       ├── manifest.json  # 微信小程序配置
│       └── package.json
├── server/                # Express + SQLite 后端
├── memory/                # AI 持久记忆
├── AGENTS.md              # 本文件
└── README.md              # 项目说明
```

---

## 3. 开发规则

### 3.1 代码区隔离
- **所有代码必须在 `codes/` 目录下**，不得在项目根目录编写代码
- **Web 版** → `codes/web/`，独立 Vue 3 + Vite 项目：`cd codes/web && npm run dev`
- **小程序版** → `codes/miniprogram/`，uni-app 项目：`cd codes/miniprogram && npm run dev:mp-weixin`
- 两端共享相同的类型定义、SRS 算法、练习进度等核心逻辑

### 3.2 文档规则
- 产品文档（PRD、迭代记录、需求变更）→ `docs/`
- 设计素材、效果图 → `assets/design/`
- 测试报错截图 → `assets/bug/`
- 参考图、灵感 → `assets/reference/`
- 开发笔记、踩坑记录 → `notes/`（建议文件名用日期前缀如 `2026-06-21-fisher-yates-shuffle.md`）

### 3.3 代码引用规则
- **代码文件不得引用 `codes/` 外部的文件**
- 所有 import 路径应保持在 `codes/web/src/`（或 `codes/miniprogram/src/`）内部
- 路径别名 `@/` → `src/`（如需要可在 vite.config.ts 配置）

### 3.4 数据格式
- 单词 JSON 格式见 `codes/web/src/content/japanese/DATA_TEMPLATE.md`
- 单词 ID 格式：`{级别小写}-{序号}`，如 `n5-001`
- 练习 ID 格式：`ex-{序号}`
- 日文特殊字符注意全角/半角区分

### 3.5 SRS 算法
- 实现在 `codes/web/src/composables/useSRS.ts`（小程序端同构一份于 `codes/miniprogram/src/composables/useSRS.ts`）
- 基于 SM-2 算法，反馈质量映射：known=5, vague=3, unknown=0
- 每日新词上限：10（`MAX_NEW_PER_DAY` 常量）
- 学习进度存储在 localStorage key `japanese-learning:srs-progress`

### 3.6 账号校验规则（v2.6）

校验规则的**唯一定义处是 `server/src/validation.ts`**，前端在 `codes/web/src/utils/validation.ts` 镜像同一份常量、正则与错误文案，避免两端漂移。改规则时**两边都要改**。

- **用户名**：5~32 字符，仅允许 汉字/平假名/片假名/字母/数字/`_`/`-`，禁空格与标点
- **密码**：≥8 字符，数字/小写/大写/特殊字符 四类中至少三类
- **改名**：改 `username` 后必须**重新签发 JWT 返回给前端**，否则导航栏仍显示旧名
- **违禁词**：⚠️ 本期未实现，仅预留 `contentFilter(text)` 空实现于注册与改名的调用点。接入时只改函数体，不动业务代码

> 后端校验改严会**同时影响小程序注册**（走同一 `/api/auth/register` 接口）。

### 3.7 页脚与备案约定

- **两个备案号都必须展示**：工信部 ICP「沪ICP备2026043380号-1」→ `beian.miit.gov.cn`；公安联网备案「沪公网安备31011302009700号」→ `beian.mps.gov.cn`。公安备案按官方惯例配「图标 + 文案」链接，图标在 `codes/web/public/beian.png`。
- 页脚结构为三栏：**左**隐私政策·联系我们 / **中**备案号 / **右** busuanzi 访问统计。中间栏要靠左右两栏 `flex: 1` 才能真居中（只写 `space-between` 会偏）。
- ⚠️ **不要往 footer 上用亮色字压本站背景**。本站底色是浅绿渐变（`styles/theme.scss`），亮色字对比度极低（`#999` 只有 1.46:1，奶白更差只有 1.40:1）。现行方案是半透明深色底 `rgba(44,62,80,.82)` + 奶白字 `#f2f6f3`，达标 6.66~7.06:1。改配色前先算对比度。
- `/privacy`、`/contact` 是**公开路由**，不能加 `requiresAuth`（备案要求可访问）。

### 3.8 部署与环境变量

- **部署是 `scp`，不是 `git pull`** —— 服务器连不上 GitHub（已实测）。`push` 到 GitHub 与部署到服务器是**两件独立的事**。
- **目录归属决定要不要 sudo**：`server/src/`、`server/data/` 属 **root**；`codes/web/dist` 属 **ubuntu**。后端必须先传 `/tmp/` 再 `sudo cp`。
- **`pm2` 不在 ubuntu 的 PATH 里**（装在 root 的 nvm 下），必须 `sudo env PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH pm2 ...`。
- ⚠️ **验证接口别用 `http://127.0.0.1/api/health`**，会命中 nginx 80 端口那个 `return 404` 的 server 块，看起来像后端挂了。用公网域名，或直连 `:3001`。
- 🔐 **环境变量**：`PORT` / `JWT_SECRET` / `WX_APPID` / `WX_SECRET`。线上密钥放 `/root/.jplearning-secrets.env`（600，root），由 PM2 注入，**改完必须 `pm2 save`**，否则重启退回默认值。`WX_SECRET` **绝不能提交进仓库**；改 `JWT_SECRET` 会踢掉所有已登录用户（签名对不上），挑人少时做。

> 详细步骤见 [docs/服务器部署指南.md](docs/服务器部署指南.md)。

### 3.9 uni-app / 小程序
- 小程序版在 `codes/miniprogram/`，基于 uni-app (Vue 3 + Vite + TS)
- 存储通过 `storage.ts` 封装，内部使用 `uni.getStorageSync` / `uni.setStorageSync`
- 避免 `backdrop-filter`（小程序不支持），使用扁平卡片风格
- 数据加载：开发阶段用 `import.meta.glob` 加载本地 JSON（仅 N5 词库），上线后走 API 按需加载
- API 客户端使用 `uni.request` 替代 `fetch`
- Web 版不动，在 `codes/web/`

---

## 4. 当前状态

### 已完成
- [x] SRS 单词卡系统（Dashboard / 复习 / 浏览 / 统计）
- [x] 练习题库（设置 / 答题 / 结果 / 错题本）
- [x] 学习仪表盘主页
- [x] Fisher-Yates 洗牌算法
- [x] JLPT 级别筛选复习
- [x] N5~N1 全级别词库（16,427 词）
- [x] 独立应用拆分（移除旧博客文章系统）
- [x] 用户系统 + SQLite 后端 + 微信登录接口
- [x] 学习统计图表（ECharts + 小程序原生 view）
- [x] uni-app 微信小程序（页面功能已迁移）
- [x] 服务器部署上线 + ICP 备案 + SSL（`jplearning.palmsugar.cn`）
- [x] 公安联网备案（沪公网安备31011302009700号）

### v2.6（✅ 2026-09-15 已上线）
> 完整清单见 [docs/2026-09-15-todo-list.md](docs/2026-09-15-todo-list.md)

- [x] footer：公安备案号 + 图标 + 隐私政策 + 联系我们 + 访问统计（busuanzi）
- [x] 首页三入口卡片（日语学习 / 刷题 / 未来开放）
- [x] 刷题新增题型：`fill` 语法词填空、`reading` 读音练习（输入作答）+ 未来开放占位
- [x] 用户中心：修改用户名 / 修改密码
- [x] 注册校验强化（用户名 5~32、密码 ≥8 且四类含三类）
- [x] 顺带修复：导航栏用户名刷新即消失、`App.vue` 用户状态非响应式
- [ ] ⏳ 练习题库数据补充（**`fill` / `reading` 数据仍为空，新题型答题流程未被真实数据验证过**）
- [ ] ⏳ 隐私政策补备案主体名称（当前页面为可见占位 `【备案主体名称，待补充】`）
- [ ] 内容审核机制（违禁词过滤，本期未做 — 已知合规缺口）

### 待完成
- [ ] 语音播放（TTS）
- [ ] ⏸ 小程序上线（暂缓：Web 端先给学生试用，反馈后再跟进）
- [ ] 跨设备同步优化（长期）

---

## 5. 常见操作

### Web 版
```bash
cd codes/web
npm install
npm run dev          # → http://localhost:5173
```

### 微信小程序版
```bash
cd codes/miniprogram
npm install
npm run dev:mp-weixin  # 编译到 dist/build/mp-weixin/
# 用微信开发者工具导入 dist/build/mp-weixin/ 目录
```

### 后端
```bash
cd server
npm install
npm run dev          # → http://localhost:3001
```

### 添加新单词
1. 编辑 `codes/web/src/content/japanese/words/{N5|N4|N3|N2|N1}.json`
2. 确保 `id` 唯一、JSON 格式合法

### 添加新练习
1. 编辑 `codes/web/src/content/japanese/exercise/exercises.json`

---

## 6. 注意事项

- `storage.ts` 使用 `japanese-learning:` 前缀，迁移时按需修改
- 单词数据文件很大（N1.json 约 9,185 条），构建时会全部打包，chunk 较大是正常现象
- PRD.md 包含完整的版本历史和变更记录
- ⚠️ **内容审核未实现**：用户名可自定义但无违禁词过滤，`contentFilter` 是空实现。这是已知合规缺口，见 PRD「待完成 · 长期」
- 迭代待办文档命名规范：`docs/YYYY-MM-DD-todo-list.md`，需求原文放 `docs/needs.md`
- 用户中心改用户名后**必须重签 token**，否则前端导航栏用户名不同步
