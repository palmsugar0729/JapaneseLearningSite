# 日语学习数据格式模板

> 本文件说明日语学习模块的数据格式，方便后续补充新的单词和练习题。

---

## 1. 单词数据

### 1.1 文件位置

```
src/content/japanese/words/
  N5.json    # N5 级别单词
  N4.json    # N4 级别单词
  N3.json    # N3 级别单词
  N2.json    # N2 级别单词
  N1.json    # N1 级别单词
```

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