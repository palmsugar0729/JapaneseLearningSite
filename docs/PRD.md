# JapaneseLearning — 产品需求文档（PRD）

> 项目：JapaneseLearning（日语学习独立应用）
> 版本：v2.6.1（教科书词库换代，✅ 已部署，待浏览器验收）
> 日期：2026-09-19
> 上一版本：v2.6（✅ 已上线 2026-09-15）
>
> 迭代清单见 [[2026-09-15-todo-list]]，需求原文见 [[needs]]。

---

## 1. 项目概述

**JapaneseLearning** 是一款独立的日语学习工具，提供 Web SPA 体验。核心功能：

- **单词卡 SRS 系统** — 基于 SM-2 间隔重复算法，覆盖 N5~N1 共 16,427 词
- **练习题库** — 语法选择 / 翻译 / 语法词填空 / 读音练习，支持级别筛选和错题本
- **学习仪表盘** — 今日概览、快捷入口、学习动态

技术栈：Vue 3 + TypeScript + Vite + SCSS；Express + SQLite 后端提供账号与进度同步，未登录时自动降级为 `localStorage` 兜底。

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
| 题型：语法选择 `choice` / 翻译 `translation` | ✅ |
| 题型：语法词填空 `fill` / 读音练习 `reading`（输入框作答） | ✅ v2.6 ¹ |
| 题型：未来开放（禁用占位） | ✅ v2.6 |
| 输入题判分归一化（全角→半角、片假名→平假名、多答案匹配） | ✅ v2.6 |

> ¹ 代码与判分逻辑已就绪并通过单元测试，但**题库尚无 `fill` / `reading` 数据**，实际答题流程待数据补齐后验证。数据格式见 [[2026-09-15-todo-list]] 第五节。

### 2.3 学习仪表盘 ✅

| 功能 | 状态 |
|------|------|
| 今日概览卡片（待复习/推荐练习/连续天数） | ✅ |
| 快捷入口（背单词/刷题） | ✅ |
| 最近学习动态 | ✅ |
| 今日学习任务卡片（复习+新词进度） | ✅ v2.3 |
| 每日新词硬上限（10个/天，跨天重置） | ✅ v2.3 |
| 任务完成状态展示 | ✅ v2.3 |

### 2.4 教科书单词系统 ✅ v2.3 / v2.6.1

| 功能 | 状态 |
|------|------|
| 按「级别 + 单元」两级组织单词 | ✅ v2.6.1 |
| 单元进度显示（已学/总数） | ✅ |
| Dashboard 教科书/JLPT 词库切换 | ✅ |
| Dashboard + 浏览模式 LEVEL 选择（LEVEL 1、LEVEL 2…） | ✅ v2.6.1 |
| 级别进度统计按词库分开（JLPT / 教科书两套） | ✅ v2.6.1 |
| ~~新编日语教程1 第1~4课数据~~ → LEVEL 1 全 16 课（920 词） | ✅ v2.6.1 |

> **文件组织**：`content/japanese/textbook/level-N/unit-NN.json`，按级别分目录，加第二本书时平级放 `level-2/` 即可，界面上的 LEVEL 按钮自动生成。
> **单词 ID**：`tb{级别}-{课}-{序号}`，如 `tb1-01-001`。
> ⚠️ **单元标题没有数据源**：早先代码里硬编码过 16 条课次标题，核对后发现只有前 6 课与本课生词吻合、第 7~16 课零重合，判定为凭空生成，**已删除**。需要标题只能从书上抄。

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
| 本期暂停迭代（Web 端先上线给学生试用，反馈后再跟进） | ⏸ v2.6 |

### 2.9 备案合规与页脚 ✅ v2.6

| 功能 | 状态 |
|------|------|
| 公安备案号（沪公网安备31011302009700号）加入 footer | ✅ v2.6 |
| 公安备案图标（`public/beian.png`，「图标 + 文案」链接） | ✅ v2.6 |
| 工信部 ICP 号（沪ICP备2026043380号-1）保留并列 | ✅ v2.6 |
| 隐私政策页 `/privacy`（公开，无需登录） | ✅ v2.6 ¹ |
| 联系我们页 `/contact`（公开，`palmsugar0729@foxmail.com`） | ✅ v2.6 |
| 页脚访问量统计（busuanzi 布丁统计） | ✅ v2.6 |
| 页脚三栏布局：左 政策链接 / 中 备案号 / 右 访问统计 | ✅ v2.6 |
| 页脚配色：半透明深色底 + 奶白字（对比度 6.66~7.06:1） | ✅ v2.6 |

> ¹ 隐私政策按本站**实际收集的数据**起草（用户名、密码哈希、微信 openid、学习进度、错题记录、busuanzi 统计、localStorage）；运营者说明写为「由个人开发者运营」并附 ICP 备案号（个人备案主体为真名，不以页面直陈，备案号即官方可查主体的标识）。

### 2.10 用户中心 ✅ v2.6

| 功能 | 状态 |
|------|------|
| 账号信息展示（用户名 / 用户 ID） | ✅ v2.6 |
| 修改用户名（改后重新签发 JWT） | ✅ v2.6 |
| 修改密码（校验旧密码 + 新强度规则） | ✅ v2.6 |
| 微信登录用户（无密码）明确提示不支持改密码 | ✅ v2.6 |
| 退出登录入口 | ✅ v2.6 |
| 学习统计查看 | ⏸ 后期 |
| ~~占位页「即将上线」（v2.6 起替换为真实功能）~~ | ✅ v2.3 |

### 2.11 账号校验规则 ✅ v2.6

后端 `server/src/validation.ts` 为**唯一定义处**，前端 `codes/web/src/utils/validation.ts` 镜像同一份规则与文案。

| 规则 | 旧 | v2.6 起 |
|------|-----|---------|
| 用户名长度 | 2~30 | **5~32** |
| 用户名字符集 | 不限制 | **汉字/假名/字母/数字/`_`/`-`**，禁空格与标点 |
| 密码长度 | ≥4 | **≥8** |
| 密码复杂度 | 无 | **数字/小写/大写/特殊字符 四类中至少三类** |
| 违禁词汇过滤 | 无 | ⚠️ **本期不做**，仅预留 `contentFilter` 调用点 |

> ⚠️ 存量用户不回溯校验，规则仅在**注册**与**改密码/改名**时生效。后端规则改严后小程序注册会同步变严（同一接口）。

### 2.12 首页入口 ✅ v2.6

| 功能 | 状态 |
|------|------|
| 三入口卡片：日语学习（→`/word`）/ 刷题（→`/exercise`）/ 未来开放（禁用） | ✅ v2.6 |
| ~~两入口卡片（日语学习 + 未来开放）~~ | ✅ v2.3 |

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
| 存储 | SQLite（后端）/ localStorage（兜底）双模式，经 `storage.ts` 与 `api/client.ts` 封装 |
| 后端 | Express + better-sqlite3 + JWT |
| 算法 | SM-2 间隔重复 + Fisher-Yates 洗牌 |
| 统计 | ECharts（Web）/ 原生 view（小程序）；访问量 busuanzi |

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
  // ↓ 教科书单词专有（source === 'textbook' 时才有）
  textbook?: string    // 教材名，展示用，如 "LEVEL 1"
  textbookLevel?: number // 教材级别，1 = LEVEL 1，筛选用
  unit?: number        // 单元/课次
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
/** v2.6 起：choice/translation 为选项作答，fill/reading 为输入框作答 */
type ExerciseType = 'choice' | 'translation' | 'fill' | 'reading'

interface Exercise {
  id: string
  type: ExerciseType
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  question: string
  options?: string[]      // 选项作答题型使用
  answer: number | string[]  // 选项题为索引，输入题为可接受答案数组
  explanation: string
}
```

> **输入题判分**：用户输入与 `answer[]` 逐项归一化后比对，归一化含全角→半角、去空白、片假名→平假名、字母小写化；与任一项相等即判对。
> 「未来开放」是禁用的 UI 占位，**不是** `ExerciseType` 的成员。

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
├── docs/                  # 产品文档（PRD、开发日志、迭代清单、部署指南）
├── assets/                # 设计素材 & 截图（design / bug / reference）
├── notes/                 # 开发笔记 & 踩坑记录
├── memory/                # AI 会话记忆（决策、合规缺口）
├── codes/
│   ├── web/               # Web SPA（Vue 3 + Vite，本版本主线）
│   │   ├── public/        # 静态资源直出（icon.png、beian.png）
│   │   ├── dist/          # 构建产物（部署到 nginx 的 web root）
│   │   └── src/
│   │       ├── types/     # TypeScript 类型定义（japanese.ts）
│   │       ├── utils/     # storage、洗牌、校验规则、输入题判分
│   │       ├── api/       # 后端 HTTP 客户端 + 数据加载
│   │       ├── composables/ # useSRS、useExerciseProgress
│   │       ├── views/     # Welcome、Vocabulary、Exercise、UserCenter、
│   │       │              #   Login、Register、Privacy、Contact
│   │       ├── components/ # 可复用组件
│   │       ├── content/   # 静态数据（单词 JSON、练习 JSON）
│   │       ├── styles/    # 全局样式（theme.scss 定义主题色）
│   │       └── router/    # 路由配置
│   └── miniprogram/       # uni-app 微信小程序（v2.6 暂缓）
├── server/                # Express + SQLite 后端（PM2 守护，端口 3001）
│   └── src/
│       ├── index.ts       # 入口
│       ├── db.ts          # 数据库与迁移
│       ├── auth.ts        # JWT 签发与鉴权中间件
│       ├── validation.ts  # 用户名/密码校验规则（唯一定义处）
│       ├── contentFilter.ts # 违禁词过滤（当前为空实现）
│       └── routes/        # auth.ts（注册/登录/改名/改密码）、progress.ts
├── nginx-jplearning.conf  # nginx 站点配置（服务器上的副本）
├── AGENTS.md              # AI 开发指南
├── MEMORY.md              # 记忆索引
└── README.md
```

> 部署形态：`codes/web/dist` 由 nginx 静态托管，`/api` 反代到 PM2 守护的 `japanese-api`（127.0.0.1:3001）。

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

#### 教科书词库

| 级别 | 课数 | 单词数 | 文件 |
|------|------|--------|------|
| LEVEL 1 | 16 | 920 | `codes/web/src/content/japanese/textbook/level-1/unit-01~16.json` |
| **合计** | | **920** | |

> 数据来源为人工整理的 Excel 词表（列：日语 / 读音 / 声调 / 词性 / 中文意思），**无例句数据**（`example` 与 `exampleTranslation` 均为空字符串）。
> ⚠️ 词性的外层方括号已剥掉（`[名]` → `名`），与 JLPT 词库写法保持一致。
> ⚠️ 有 32 条寒暄语（こんにちは 等）在来源表中没有词性，留空；界面按空值不渲染标签。

### 4.2 练习题

当前仅 demo 数据（**10 道**），存放于 `codes/web/src/content/japanese/exercise/exercises.json`。

| 题型 | 数量 | 状态 |
|------|------|------|
| `choice` 语法选择 | 少量 | ✅ |
| `translation` 翻译 | 少量 | ✅ |
| `fill` 语法词填空 | 0 | 🔜 待提供数据（格式见 [[2026-09-15-todo-list]] 第五节） |
| `reading` 读音练习 | 0 | 🔜 待提供数据 |

> 题库由人工整理，后续将持续补充。

---

## 5. 待完成（后续迭代）

### 短期（v2.6 · 见 [[2026-09-15-todo-list]]）
- [x] 公安备案号 + 图标加入 footer
- [x] 隐私政策 / 联系我们页
- [x] 页脚访问量统计（busuanzi）
- [x] 首页改为三入口卡片
- [x] 刷题新增题型：语法词填空 / 读音练习（输入作答）+ 未来开放占位
- [x] 用户中心：修改用户名 / 修改密码
- [x] 注册校验强化（用户名 5~32、密码 ≥8 且四类含三类）
- [ ] **练习题库数据补充**（`fill` / `reading` 数据待人工整理，格式见 [[2026-09-15-todo-list]] 第五节）
- [x] 隐私政策运营者说明（2026-09-16：写「由个人开发者运营」+ ICP 备案号，不直陈真名）
- [ ] 语音播放（TTS）

### 中期
- [x] uni-app 微信小程序适配（v2.4~v2.5：项目初始化、核心模块迁移、页面功能完善、统计图表、微信登录接口）
- [x] 服务器部署上线（2026-08-13：Nginx + PM2 + DNS，`jplearning.palmsugar.cn` 可访问）
- [x] 域名备案（ICP 已通过 2026-09-04，备案号 沪ICP备2026043380号）
- [x] SSL 证书（certbot HTTPS 2026-09-04）
- [x] 公安联网备案（已通过，备案号 沪公网安备31011302009700号）
- [ ] ⏸ **小程序上线（暂缓）**：Web 端先落地并给学生试用、收集反馈后再跟进，含切正式域名 + 合法域名配置 + 提审发布

### 长期
- [ ] 用户内容审核机制（违禁词过滤，见 [[2026-09-15-todo-list]] 第四节）
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
| v2.6 | 2026-09-15 | ✅ 已上线：备案合规页脚、首页三入口、刷题新增 2 题型、用户中心、注册校验强化；小程序暂缓 |
| v2.6.1 | 2026-09-19 | 教科书词库换代：LEVEL 1 全 16 课（920 词）、按级别分目录、前端 LEVEL 选择、进度统计拆成 JLPT/教科书两套、清旧进度迁移 |

### v2.6.1 变更（2026-09-19，已部署，待验收）

- 教科书词库由「4 课 / 175 词」换成「LEVEL 1 · 16 课 / 920 词」，文件改为 `textbook/level-N/unit-NN.json` 分级别目录
- `Word` 新增 `textbookLevel` 字段；加载层新增 `getTextbookLevels()` / `getTextbookLevelName()`，`getTextbookWords(level)` / `getTextbookUnits(level)` / `getWordsByUnit(level, unit)` 改签名
- Dashboard 与浏览模式新增 **LEVEL 选择**
- 级别进度统计**拆成两套**（JLPT 的 N5~N1 与教科书的 LEVEL）——原先教科书词 `level` 全是 `N5`，920 词混进 N5 会让进度条从 `12/601` 失真成 `12/1521`
- 删除代码里硬编码的 16 条单元标题（核对后判定为凭空生成，见 2.4 节）
- 服务端一次性迁移清掉旧 `tb1-*` SRS 进度（ID 复用但内容不同）
- 空词性/空声调不再渲染空标签
- 顺带修复：浏览模式切到 JLPT 词库时，隐藏的单元筛选仍在生效导致空列表

### v2.6 变更（已上线 2026-09-15）
- 公安备案号 + 公安备案图标 + 隐私政策 + 联系我们 + 访问统计（busuanzi）进 footer
- footer 改为三栏（左政策链接 / 中备案号 / 右统计），配色改为半透明深色底 + 奶白字（对比度 1.46:1 → 6.66~7.06:1）
- 首页入口由 2 张卡改为 3 张（日语学习 / 刷题 / 未来开放）
- 题型扩展 `fill`（语法词填空，输入作答）、`reading`（读音练习，输入作答）、未来开放占位；判分做归一化（全角→半角、片假名→平假名、去空白、小写、多答案匹配）
- 用户中心从占位页改为真实功能：修改用户名（重签 JWT）、修改密码、退出登录
- 注册校验强化：用户名 5~32 + 字符集白名单；密码 ≥8 且四类含三类；规则集中定义于 `server/src/validation.ts`
- 顺带修复两个既有缺陷：导航栏用户名刷新即消失（用户信息未持久化）、`App.vue` 用户状态非响应式
- ⚠️ 违禁词过滤本期不做，仅预留 `contentFilter` 调用点（已知合规缺口）
- 本期仅 Web 端，小程序暂缓至试用反馈后
- ⏳ 遗留：`fill` / `reading` 题库数据未整理（隐私政策运营者说明已于 2026-09-16 补齐）

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
