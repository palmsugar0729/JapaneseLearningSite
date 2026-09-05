# JapaneseLearning — 产品需求文档（PRD）

> 项目：JapaneseLearning（日语学习独立应用）
> 版本：v2.5
> 日期：2026-08-16
> 上一版本：v2.4（2026-08-10）

---

## 1. 项目概述

**JapaneseLearning** 是一款独立的日语学习工具，提供 Web SPA 体验。核心功能：

- **单词卡 SRS 系统** — 基于 SM-2 间隔重复算法，覆盖 N5~N1 共 16,427 词
- **练习题库** — 语法选择 + 翻译题，支持级别筛选和错题本
- **学习仪表盘** — 今日概览、快捷入口、学习动态

技术栈：Vue 3 + TypeScript + Vite + SCSS，数据通过 `localStorage` 持久化。

---

## 2. 当前功能清单

### 2.1 单词卡 SRS 系统 ✅

| 功能 | 状态 |
|------|------|
| Dashboard 概览（今日待复习/新词/连续天数/级别进度） | ✅ |
| 今日复习模式（翻卡交互 + 认识/模糊/不认识反馈） | ✅ |
| SM-2 算法（ef/repetitions/interval/nextReview） | ✅ |
| 单词浏览模式（级别/状态筛选 + 关键词搜索） | ✅ |
| 学习统计页（总览 + 各级别详情表） | ✅ |
| JLPT 级别筛选复习（N5~N1/全部） | ✅ |
| Fisher-Yates 随机打乱复习队列 | ✅ |

### 2.2 练习题库 ✅

| 功能 | 状态 |
|------|------|
| 练习设置页（级别/题型/题数选择） | ✅ |
| 答题模式（选择 → 提交 → 解析 → 下一题） | ✅ |
| 结果页（正确率/用时/错题回顾） | ✅ |
| 错题本（自动记录 + 错题重练） | ✅ |
| 练习历史记录 | ✅ |
| Fisher-Yates 随机抽题 | ✅ |

### 2.3 学习仪表盘 ✅

| 功能 | 状态 |
|------|------|
| 今日概览卡片（待复习/推荐练习/连续天数） | ✅ |
| 快捷入口（背单词/刷题） | ✅ |
| 最近学习动态 | ✅ |
| 今日学习任务卡片（复习+新词进度） | ✅ v2.3 |
| 每日新词硬上限（10个/天，跨天重置） | ✅ v2.3 |
| 任务完成状态展示 | ✅ v2.3 |

### 2.4 教科书单词系统 ✅ v2.3

| 功能 | 状态 |
|------|------|
| 按教科书单元组织单词 | ✅ |
| 单元进度显示（已学/总数） | ✅ |
| Dashboard 教科书/JLPT 词库切换 | ✅ |
| 新编日语教程1 第1~4课数据 | ✅ |

### 2.5 用户系统 ✅ v2.3

| 功能 | 状态 |
|------|------|
| 注册/登录/登出 | ✅ |
| JWT 认证 | ✅ |
| SQLite 数据持久化 | ✅ |
| 双模式：API 模式 + localStorage 兜底 | ✅ |
| Express 后端 (port 3001) | ✅ |
| 微信登录（`uni.login` → code → openid → JWT） | ✅ v2.5 |

### 2.6 学习统计图表 ✅ v2.3

| 功能 | 状态 |
|------|------|
| 学习热力图（近 12 周） | ✅ |
| 级别掌握堆叠柱状图 | ✅ |
| 学习状态环图 | ✅ |
| 练习正确率趋势折线 | ✅ |

### 2.7 欢迎页 ✅ v2.3

| 功能 | 状态 |
|------|------|
| 简洁着陆页 + 模块入口 | ✅ |
| 顶部导航栏（sticky，始终可见） | ✅ |

### 2.8 微信小程序 ✅ v2.5

| 功能 | 状态 |
|------|------|
| uni-app 项目（Vue 3 + TS + Vite） | ✅ v2.4 |
| 首页概览（4 项统计卡片） | ✅ v2.5 |
| 单词页（词库/单元选择、复习翻卡、浏览筛选搜索、统计） | ✅ v2.5 |
| 练习页（抽题答题、错题本重练、结果页错题回顾） | ✅ v2.5 |
| 登录/注册/微信登录 + 用户信息持久化 | ✅ v2.5 |
| 统计图表（原生 view 热力图/正确率趋势/状态占比） | ✅ v2.5 |

---

## 3. 技术规格

### 3.1 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 语言 | TypeScript（严格模式） |
| 构建 | Vite |
| 路由 | Vue Router 4 |
| 样式 | SCSS（玻璃拟态风格） |
| 存储 | localStorage（通过 `storage.ts` 封装） |
| 算法 | SM-2 间隔重复 + Fisher-Yates 洗牌 |

### 3.2 数据结构

#### 单词（Word）
```typescript
interface Word {
  id: string           // "n5-001"
  word: string         // 日语单词
  reading: string      // 读音（假名）
  meaning: string      // 中文意思
  type: string         // 词性
  accent: string       // 声调
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  example: string      // 例句（日文）
  exampleTranslation: string // 例句翻译
}
```

#### 学习进度（WordProgress）
```typescript
interface WordProgress {
  wordId: string
  ef: number           // 简易度系数，初始 2.5
  repetitions: number  // 连续成功次数
  interval: number     // 间隔天数
  nextReview: string   // ISO 日期
  lastReviewed: string
  totalReviews: number
}
```

#### 练习题（Exercise）
```typescript
interface Exercise {
  id: string
  type: 'choice' | 'translation'
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  question: string
  options: string[]
  answer: number       // 正确选项索引
  explanation: string
}
```

### 3.3 SM-2 算法

```
if quality < 3:
  repetitions = 0, interval = 1
else:
  repetitions += 1
  if repetitions == 1: interval = 1
  if repetitions == 2: interval = 6
  else: interval = round(interval * ef)

ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
ef = max(ef, 1.3)
```

反馈质量映射：认识=5, 模糊=3, 不认识=0。每日新词上限：10。

### 3.4 目录结构

```
JapaneseLearning/
├── docs/              # 产品文档
│   └── PRD.md
├── assets/            # 设计素材 & 截图
│   ├── design/        # 效果图、UI 参考
│   ├── bug/           # 测试报错截图
│   └── reference/     # 参考图、灵感收集
├── notes/             # 开发笔记 & 踩坑记录
├── codes/             # 源代码（独立 Vue 3 项目）
│   └── src/
│       ├── types/     # TypeScript 类型定义
│       ├── utils/     # storage 封装、洗牌算法
│       ├── api/       # 单词、练习数据加载
│       ├── composables/ # useSRS、useExerciseProgress
│       ├── views/     # Japanese、Vocabulary、Exercise
│       ├── components/ # 可复用组件
│       ├── content/   # 静态数据（单词 JSON、练习 JSON）
│       ├── styles/    # 全局样式
│       └── router/    # 路由配置
├── AGENTS.md          # AI 开发指南
└── README.md
```

---

## 4. 数据

### 4.1 词库

| 级别 | 单词数 | 文件 |
|------|--------|------|
| N5 | 601 | `codes/src/content/japanese/words/N5.json` |
| N4 | 1,229 | `codes/src/content/japanese/words/N4.json` |
| N3 | 1,026 | `codes/src/content/japanese/words/N3.json` |
| N2 | 4,386 | `codes/src/content/japanese/words/N2.json` |
| N1 | 9,185 | `codes/src/content/japanese/words/N1.json` |
| **合计** | **16,427** | |

### 4.2 练习题

当前仅 demo 数据（约 10 道），存放于 `codes/src/content/japanese/exercise/exercises.json`。

---

## 5. 待完成（后续迭代）

### 短期
- [ ] 练习题库数据补充（当前仅 10 道 demo）
- [ ] 语音播放（TTS）

### 中期
- [x] uni-app 微信小程序适配（v2.4~v2.5：项目初始化、核心模块迁移、页面功能完善、统计图表、微信登录接口）
- [x] 服务器部署上线（2026-08-13：Nginx + PM2 + DNS，`jplearning.palmsugar.cn` 可访问）
- [x] 域名备案（ICP 已通过 2026-09-04，备案号 沪ICP备2026043380号）
- [x] SSL 证书（certbot HTTPS 2026-09-04）

### 长期
- [ ] 跨设备同步优化
- [ ] 移动端交互优化

---

## 6. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v2.0 | 2026-06-05 | 初始设计：SRS 单词卡 + 练习题库 + 仪表盘 |
| v2.1 | 2026-06-21 | 级别筛选复习、Fisher-Yates 随机打乱、全级别词库补充 |
| v2.2 | 2026-06-21 | 独立应用重构：移除旧博客文章系统、存储前缀更新、文档重写 |
| v2.3 | 2026-06-21 | 用户系统+SQLite后端、学习统计图表、教科书单词系统、欢迎页+导航栏、每日新词上限、今日任务卡片 |
| v2.4 | 2026-08-10 | uni-app 微信小程序项目初始化、目录重构 web/miniprogram 分离、核心模块双端迁移、微信登录方案、服务器部署指南 |
| v2.5 | 2026-08-16 | 小程序页面功能完善（词库选择/复习/浏览/统计+图表）、微信登录接口、用户信息持久化 |
| v2.5.1 | 2026-09-05 | 上线后稳定性修复：背单词页无限重渲染崩溃、nginx gzip 压缩（首屏提速）、logo 回首页 |

### v2.3 详细变更
- 用户注册/登录/登出，JWT 认证
- Express + SQLite 后端，双模式存储（API / localStorage 兜底）
- ECharts 学习统计图表（热力图、柱状图、环图、折线图）
- 教科书单词系统：按单元组织，支持进度追踪
- 新编日语教程1 第1~4课数据导入
- 简洁欢迎页 + sticky 顶部导航栏
- 每日新词硬上限 10 个，今日任务卡片 + 完成状态
- 教科书词库默认优先，浏览模式支持来源/单元筛选
- PRD 重写为独立应用
- 项目从 palmsugar-lab 子模块拆分为独立应用
- 移除文章阅读系统（`JPAritcleCard`、`JapaneseDetail`、`api/japanese.ts`）
- 存储前缀 `palmsugar-lab:` → `japanese-learning:`
- 移除旧 `exercise_demo.json`（已被 `exercises.json` 取代）
- 移除 `marked` 依赖
- 清理路由，移除文章详情页路由

---

## 7. 附录

### 7.1 参考资料
- [SM-2 算法原文](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Anki 文档](https://docs.ankiweb.net/)
- [uni-app 文档](https://uniapp.dcloud.net.cn/)

### 7.2 术语表

| 术语 | 说明 |
|------|------|
| SRS | Spaced Repetition System，间隔重复系统 |
| SM-2 | SuperMemo-2，一种间隔重复算法 |
| EF | Easiness Factor，简易度系数 |
| JLPT | Japanese Language Proficiency Test，日本语能力测试 |
| N5~N1 | JLPT 级别，N5 最低，N1 最高 |
