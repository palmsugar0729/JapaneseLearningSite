# 日语学习数据格式模板

> 本文件说明日语学习模块的数据格式，方便后续补充新的单词和练习题。

---

## 1. 单词数据

### 1.1 文件位置

**两套词库，维度不同，互不相干：**

```
src/content/japanese/
├── words/                    # JLPT 词库（维度：JLPT 级别 N5~N1）
│   ├── N5.json
│   ├── N4.json
│   ├── N3.json
│   ├── N2.json
│   └── N1.json
└── textbook/                 # 教科书词库（维度：教材 LEVEL + 单元）
    ├── level-1/
    │   ├── unit-01.json
    │   └── … unit-16.json
    ├── level-2/              # 第二本书放这里，加文件即可，无需改代码
    ├── level-3/
    └── level-4/
```

⚠️ **不要混着统计。** `N5~N1` 是 JLPT 的维度；教科书单词的 `level` 字段虽然也填 `N5`，但那只是**难度参考**，它不属于 JLPT 词库。级别进度卡片和统计页详情表都已拆成两组。

### 1.2 文件格式

每个文件是一个 JSON 数组，数组元素为单词对象：

```json
[
  {
    "id": "n5-001",
    "word": "間",
    "reading": "あいだ",
    "meaning": "期间",
    "type": "N",
    "accent": "◎",
    "level": "N5",
    "example": "この間どこへ行きましたか。",
    "exampleTranslation": "前几天你去了哪里？"
  }
]
```

### 1.3 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识，建议格式：`{级别}-{序号}`，如 `n5-001` |
| `word` | string | ✅ | 日语单词（汉字/假名/混合） |
| `reading` | string | ✅ | 读音（平假名或片假名） |
| `meaning` | string | ✅ | 中文意思 |
| `type` | string | ✅ | 词性简写：`N`(名词)、`V`(动词)、`Adj`(形容词)、`Adv`(副词) 等 |
| `accent` | string | ✅ | 声调标记，如 `◎`(平板)、`①`(头高)、`②`(中高) |
| `level` | string | ✅ | JLPT 级别：`N5`、`N4`、`N3`、`N2`、`N1` |
| `example` | string | ❌ | 例句（日文），建议填写 |
| `exampleTranslation` | string | ❌ | 例句翻译，建议填写 |

### 1.4 添加新单词步骤

1. 找到对应级别的 JSON 文件（如 `N5.json`）
2. 在数组末尾添加新的单词对象
3. 确保 `id` 唯一，建议按序号递增
4. 保存文件，重新构建项目即可生效

---

### 1.5 教科书单词数据

数据来源是人工校对过的 Excel 词表，用脚本导入，**不要手写 JSON**。

#### 导入流程

```
docs/vocabulary_files/LEVEL N/UNIT M.xlsx   ← 人工校对的词表
        ↓  python codes/import_textbook_excel.py <N>
src/content/japanese/textbook/level-N/unit-MM.json
```

Excel 第 1 行是表头，列顺序固定：**日语 | 读音 | 声调 | 词性 | 中文意思**
（这个格式由上游的 `codes/build_vocab_excel.py` 从 OCR 结果生成）

```bash
python codes/import_textbook_excel.py 1 --dry-run   # 先校验，不写文件
python codes/import_textbook_excel.py 1             # 正式导入 LEVEL 1
```

#### 字段说明

比 JLPT 单词多出 4 个教科书专有字段：

```json
{
  "id": "tb1-01-001",
  "word": "私",
  "reading": "わたし",
  "meaning": "我",
  "type": "代",
  "accent": "⓪",
  "level": "N5",
  "example": "",
  "exampleTranslation": "",
  "source": "textbook",
  "textbook": "LEVEL 1",
  "textbookLevel": 1,
  "unit": 1
}
```

| 字段 | 说明 |
|------|------|
| `id` | `tb{级别}-{单元}-{序号}`，由脚本生成 |
| `level` | **难度参考**，默认 `N5`，不参与 JLPT 级别统计 |
| `source` | 固定 `"textbook"` |
| `textbook` | 教材展示名，界面上显示的就是它 |
| `textbookLevel` | 教材级别（1 = LEVEL 1），按级别筛选用 |
| `unit` | 单元/课次 |
| `example` / `exampleTranslation` | 来源词表**没有例句**，保持空字符串 |

#### 加一本新教材

1. 把词表放进 `docs/vocabulary_files/LEVEL <新级别>/`
2. `python codes/import_textbook_excel.py <新级别>`
3. 完成——前端 LEVEL 按钮、级别进度分组、单元列表**全部自动生成**，不用改任何代码

#### ⚠️ 改词条会让学习进度错位

学习进度按 `word_id` 存（服务端 `srs_progress` 表 / 前端 localStorage）。**改动已有词条的内容或 ID，会让「已学过」标记跑到别的词上。**

v2.6.1 教科书词库换代（4 课 → 16 课）时，是靠 `server/src/db.ts` 里的一次性迁移 + `meta` 表标记位清的旧进度——因为新旧 ID 形态完全一样（都是 `tb1-0N-*`），**没法用 SQL 模式匹配区分**，只能靠标记位。下次换代照这个做法来。

---

## 2. 练习题数据

### 2.1 文件位置

```
src/content/japanese/exercise/
  exercises.json    # 所有练习题
```

### 2.2 文件格式

一个 JSON 数组，数组元素为题目对象：

```json
[
  {
    "id": "ex-001",
    "type": "choice",
    "level": "N5",
    "question": "それでは、日本語（　　　）練習を始めましょう。",
    "options": ["を", "で", "の", "は"],
    "answer": 2,
    "explanation": "对「練習」这个词的具体说明，日语的练习。"
  },
  {
    "id": "ex-002",
    "type": "translation",
    "level": "N5",
    "question": "明日、図書館へ行きます。",
    "options": ["明天去图书馆。", "昨天去了图书馆。", "今天不去图书馆。", "明天不去图书馆。"],
    "answer": 0,
    "explanation": "「明日」是明天，「行きます」是去。"
  }
]
```

### 2.3 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识，建议格式：`ex-{序号}` |
| `type` | string | ✅ | 题型：`choice`(语法选择) 或 `translation`(翻译) |
| `level` | string | ✅ | JLPT 级别：`N5`、`N4`、`N3`、`N2`、`N1` |
| `question` | string | ✅ | 题目内容 |
| `options` | string[] | ✅ | 选项数组，4 个选项 |
| `answer` | number | ✅ | 正确选项的索引（从 0 开始） |
| `explanation` | string | ✅ | 答案解析 |

### 2.4 题型说明

#### 语法选择题（`type: "choice"`）

- 题目中通常有括号 `（　　　）` 表示填空位置
- 选项为助词、词形变化、词汇等
- 例：「私はパソコン（　　　）持っています。」选项：`["を", "で", "の", "は"]`

#### 翻译题（`type: "translation"`）

- 题目为日文句子
- 选项为中文翻译
- 例：「明日、図書館へ行きます。」选项：`["明天去图书馆。", ...]`

### 2.5 添加新题目步骤

1. 打开 `src/content/japanese/exercise/exercises.json`
2. 在数组末尾添加新的题目对象
3. 确保 `id` 唯一
4. `answer` 字段为正确选项在 `options` 数组中的索引（从 0 开始）
5. 保存文件，重新构建项目即可生效

---

## 3. 注意事项

### 3.1 JSON 格式

- 使用 **2 空格缩进**
- 最后一个元素后面**不加逗号**（Trailing comma）
- 确保 JSON 格式合法，可使用在线 JSON 校验工具检查

### 3.2 ID 唯一性

- 单词 ID 和题目 ID 各自独立命名空间，可以重复（如单词 `n5-001` 和题目 `ex-001`）
- 同一类型内 ID 必须唯一

### 3.3 特殊字符

- 日文中的全角括号 `（）` 与半角括号 `()` 注意区分
- 假名使用标准 Unicode，避免使用特殊字体字符

### 3.4 数据量

- 目前项目使用 `import.meta.glob` 在构建时加载全部数据
- N1.json 约 9,185 条，构建时 chunk 较大是正常现象

---

## 4. 示例数据参考

现有数据位置：
- 单词：`src/content/japanese/words/{N5,N4,N3,N2,N1}.json`
- 练习题：`src/content/japanese/exercise/exercises.json`

可参考这些文件的格式添加新数据。

---

*如有疑问，请参考现有数据文件或查阅 `docs/PRD.md` 中的数据结构定义。*