# AGENTS.md — JapaneseLearning 项目 AI 开发指南

> 本文档面向后续接手的 AI（Claude、Copilot 等），说明项目结构、开发约定和注意事项。

---

## 1. 项目概述

**JapaneseLearning** 是一个独立的日语学习 SPA。核心功能：

- **单词卡 SRS 系统** — SM-2 间隔重复算法，按 JLPT 级别（N5~N1）复习
- **练习题库** — 语法选择 + 翻译题，错题本 + 级别筛选
- **学习仪表盘** — 今日概览、快捷入口、学习动态

技术栈：Vue 3 + TypeScript + Vite + SCSS，数据通过 `localStorage`（封装为 `storage.ts`）持久化。

---

## 2. 目录结构

```
JapaneseLearning/
├── docs/                  # 产品文档区
│   └── PRD.md             # 产品需求文档
├── assets/
│   ├── design/            # 设计素材：效果图、UI参考图
│   ├── bug/               # 测试报错截图
│   └── reference/         # 参考图、灵感收集
├── notes/                 # 开发笔记：踩坑记录、技术方案
├── codes/                 # 👈 所有代码在这里（独立 Vue 项目）
│   ├── src/
│   │   ├── types/         # TypeScript 类型定义
│   │   ├── utils/         # 工具函数（storage 封装、Fisher-Yates 洗牌）
│   │   ├── api/           # 数据加载（单词、练习）
│   │   ├── composables/   # Vue 组合式函数（SRS 算法、练习进度）
│   │   ├── views/         # 页面组件（Japanese、Vocabulary、Exercise）
│   │   ├── components/    # 可复用组件
│   │   ├── content/       # 静态数据（单词 JSON、练习 JSON）
│   │   ├── styles/        # 全局样式（reset、theme、global）
│   │   └── router/        # Vue Router 路由配置
│   └── package.json
├── AGENTS.md              # 本文件
└── README.md              # 项目说明
```

---

## 3. 开发规则

### 3.1 代码区隔离
- **所有代码必须在 `codes/` 目录下**，不得在项目根目录编写代码
- `codes/` 是一个可独立运行的 Vue 3 + Vite 项目
- `cd codes && npm install && npm run dev` 即可启动

### 3.2 文档规则
- 产品文档（PRD、迭代记录、需求变更）→ `docs/`
- 设计素材、效果图 → `assets/design/`
- 测试报错截图 → `assets/bug/`
- 参考图、灵感 → `assets/reference/`
- 开发笔记、踩坑记录 → `notes/`（建议文件名用日期前缀如 `2026-06-21-fisher-yates-shuffle.md`）

### 3.3 代码引用规则
- **代码文件不得引用 `codes/` 外部的文件**
- 所有 import 路径应保持在 `codes/src/` 内部
- 路径别名 `@/` → `src/`（如需要可在 vite.config.ts 配置）

### 3.4 数据格式
- 单词 JSON 格式见 `codes/src/content/japanese/DATA_TEMPLATE.md`
- 单词 ID 格式：`{级别小写}-{序号}`，如 `n5-001`
- 练习 ID 格式：`ex-{序号}`
- 日文特殊字符注意全角/半角区分

### 3.5 SRS 算法
- 实现在 `codes/src/composables/useSRS.ts`
- 基于 SM-2 算法，反馈质量映射：known=5, vague=3, unknown=0
- 每日新词上限：10（`MAX_NEW_PER_DAY` 常量）
- 学习进度存储在 localStorage key `japanese-learning:srs-progress`

### 3.6 uni-app 兼容性
- 存储操作通过 `storage.ts` 封装，迁移时替换内部实现为 `uni.getStorageSync` / `uni.setStorageSync`
- 避免直接 DOM 操作（翻卡用 Vue `:class` + CSS、事件用模板绑定）
- 数据加载使用 `import.meta.glob`（uni-app 支持）

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

### 待完成
- [ ] 练习题库数据补充（当前仅 demo 数据）
- [ ] uni-app 微信小程序适配
- [ ] 学习统计图表（ECharts）
- [ ] 语音播放（TTS）
- [ ] 后端服务 + 跨设备同步（长期）

---

## 5. 常见操作

### 启动开发服务器
```bash
cd codes
npm install
npm run dev
```

### 添加新单词
1. 编辑 `codes/src/content/japanese/words/{N5|N4|N3|N2|N1}.json`
2. 确保 `id` 唯一、JSON 格式合法
3. 热更新生效，或重新构建

### 添加新练习
1. 编辑 `codes/src/content/japanese/exercise/exercises.json`
2. 格式见 `DATA_TEMPLATE.md`

### TypeScript 检查
```bash
cd codes
npx vue-tsc --noEmit
```

---

## 6. 注意事项

- `storage.ts` 使用 `japanese-learning:` 前缀，迁移时按需修改
- 单词数据文件很大（N1.json 约 9,185 条），构建时会全部打包，chunk 较大是正常现象
- PRD.md 包含完整的版本历史和变更记录
