<template>
  <div class="container">
    <!-- ========== Dashboard 概览 ========== -->
    <div v-if="mode === 'dashboard'" class="dashboard">
      <h1 class="title">单词记忆</h1>

      <!-- 今日概览卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ stats.todayReviews }}</div>
          <div class="stat-label">今日待复习</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.newWords }}</div>
          <div class="stat-label">新单词</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.streakDays }}</div>
          <div class="stat-label">连续学习(天)</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.masteredWords }}</div>
          <div class="stat-label">已掌握</div>
        </div>
      </div>

      <!-- 级别进度：JLPT 与教科书两套词库分开统计 -->
      <div class="level-progress">
        <h3>各级别进度</h3>

        <div class="level-group-title">JLPT 词库</div>
        <div class="level-list">
          <div v-for="lp in levelProgress" :key="lp.level" class="level-item">
            <div class="level-name">{{ lp.level }}</div>
            <div class="level-bar">
              <div
                class="level-fill"
                :style="{ width: `${lp.total > 0 ? (lp.mastered / lp.total) * 100 : 0}%` }"
              />
            </div>
            <div class="level-count">{{ lp.mastered }}/{{ lp.total }}</div>
          </div>
        </div>

        <div class="level-group-title">教科书词库</div>
        <div class="level-list">
          <div v-for="tp in textbookProgress" :key="tp.level" class="level-item">
            <div class="level-name">{{ getTextbookLevelName(tp.level) }}</div>
            <div class="level-bar">
              <div
                class="level-fill"
                :style="{ width: `${tp.total > 0 ? (tp.mastered / tp.total) * 100 : 0}%` }"
              />
            </div>
            <div class="level-count">{{ tp.mastered }}/{{ tp.total }}</div>
          </div>
        </div>
      </div>

      <!-- 今日任务卡片 -->
      <div class="task-card" :class="{ done: todayTotal === 0 }">
        <div class="task-main">
          <div class="task-icon">{{ todayTotal === 0 ? '✅' : '📋' }}</div>
          <div class="task-info">
            <div class="task-title">
              {{ todayTotal === 0 ? '今日任务已完成！' : '今日学习任务' }}
            </div>
            <div class="task-detail" v-if="todayTotal > 0">
              复习 <strong>{{ todayReviewsCount }}</strong> 个 ·
              新词 <strong>{{ todayNewCount }}</strong> 个
              （今日已学 {{ getTodayNewCount() }}/{{ MAX_NEW_PER_DAY }}）
            </div>
            <div class="task-detail" v-else>
              干得漂亮！明天的任务会在零点刷新
            </div>
          </div>
        </div>
        <button
          v-if="todayTotal > 0"
          class="btn-primary task-btn"
          @click="startReview"
        >
          📝 开始{{ studySource === 'textbook' && selectedUnit > 0 ? ' 第' + selectedUnit + '课 ' : selectedLevel === 'all' ? '' : ' ' + selectedLevel + ' ' }}学习 ({{ todayTotal }})
        </button>
      </div>

      <!-- 词库来源选择 -->
      <div class="source-select">
        <h3>选择词库</h3>
        <div class="source-options">
          <button
            class="source-btn"
            :class="{ active: studySource === 'textbook' }"
            @click="studySource = 'textbook'; selectedUnit = 1"
          >
            📖 教科书
          </button>
          <button
            class="source-btn"
            :class="{ active: studySource === 'jlpt' }"
            @click="studySource = 'jlpt'; selectedLevel = 'all'"
          >
            📚 JLPT词库
          </button>
        </div>
      </div>

      <!-- 教科书 LEVEL 选择 -->
      <div v-if="studySource === 'textbook'" class="source-select">
        <h3>选择 LEVEL</h3>
        <div class="source-options">
          <button
            v-for="lv in textbookLevels"
            :key="lv"
            class="source-btn"
            :class="{ active: studyLevel === lv }"
            @click="selectStudyLevel(lv)"
          >
            📗 {{ getTextbookLevelName(lv) }}
          </button>
        </div>
      </div>

      <!-- 级别/单元选择 -->
      <div class="level-select">
        <h3>{{ studySource === 'textbook' ? '选择单元' : '选择复习级别' }}</h3>
        <!-- JLPT 级别选择 -->
        <div v-if="studySource !== 'textbook'" class="level-options">
          <button
            v-for="lv in levelOptions"
            :key="lv.value"
            class="level-btn"
            :class="{ active: selectedLevel === lv.value }"
            @click="selectedLevel = lv.value"
          >
            {{ lv.label }}
            <span class="level-badge" :class="{ empty: lv.count === 0 }">{{ lv.count > 0 ? lv.count : '无' }}</span>
          </button>
        </div>

        <!-- 教科书单元选择 -->
        <div v-if="studySource === 'textbook'" class="level-options">
          <button
            v-for="u in unitOptions"
            :key="u.value"
            class="level-btn"
            :class="{ active: selectedUnit === u.value }"
            @click="selectedUnit = u.value"
          >
            {{ u.label }}
            <span class="level-badge" :class="{ empty: u.total === u.learned }">
              {{ u.learned > 0 ? u.learned + '/' : '' }}{{ u.total }}
            </span>
          </button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button class="btn-secondary" @click="mode = 'browse'">
          📖 浏览单词
        </button>
        <button class="btn-secondary" @click="mode = 'stats'">
          📊 学习统计
        </button>
      </div>
    </div>

    <!-- ========== 今日复习模式 ========== -->
    <div v-else-if="mode === 'review'" class="review-mode">
      <div class="review-header">
        <button class="btn-back" @click="mode = 'dashboard'">← 返回</button>
        <div class="review-progress">
          {{ currentIndex + 1 }} / {{ reviewQueue.length }}
        </div>
      </div>

      <!-- 复习队列已空 -->
      <div v-if="reviewQueue.length === 0" class="review-empty">
        <h2>✅ 今日任务已完成！</h2>
        <p>没有待复习的单词，也没有新词配额了。</p>
        <button class="btn-primary" @click="mode = 'dashboard'">返回主页</button>
      </div>

      <!-- 复习队列完成 -->
      <div v-else-if="currentIndex >= reviewQueue.length" class="review-empty">
        <h2>🎉 本轮完成！</h2>
        <p>本次复习了 {{ reviewQueue.length }} 个单词。</p>
        <p class="sub-hint" v-if="getTodayNewCount() < MAX_NEW_PER_DAY">还有新词配额，可以继续</p>
        <button class="btn-primary" @click="mode = 'dashboard'">返回主页</button>
      </div>

      <!-- 单词卡片 -->
      <template v-else>
        <div class="flip_card_container">
          <div
            class="flip_card"
            :class="{ flipped: showBack }"
            @click="showBack = !showBack"
          >
            <!-- 正面：单词 -->
            <div class="face front">
              <h2 class="word-text">{{ currentWord?.word }}</h2>
              <p class="word-hint">点击翻面查看详情</p>
            </div>

            <!-- 背面：详情 -->
            <div class="face back">
              <div class="word-detail">
                <h3>{{ currentWord?.reading }}</h3>
                <p class="meaning">{{ currentWord?.meaning }}</p>
                <p class="meta">
                  <!-- 部分寒暄语来源表里没有词性/声调，空值不渲染空标签 -->
                  <span v-if="currentWord?.type" class="type">{{ currentWord.type }}</span>
                  <span v-if="currentWord?.accent" class="accent">声调 {{ currentWord.accent }}</span>
                </p>
                <div class="example">
                  <p>{{ currentWord?.example }}</p>
                  <p class="example-chn">{{ currentWord?.exampleTranslation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 反馈按钮（翻面后显示） -->
        <div v-if="showBack" class="review-actions">
          <button class="btn-unknown" @click.stop="handleReview('unknown')">
            😵 不认识
          </button>
          <button class="btn-vague" @click.stop="handleReview('vague')">
            😐 模糊
          </button>
          <button class="btn-known" @click.stop="handleReview('known')">
            😊 认识
          </button>
        </div>

        <p v-else class="flip-hint">点击卡片翻面</p>
      </template>
    </div>

    <!-- ========== 单词浏览模式 ========== -->
    <div v-else-if="mode === 'browse'" class="browse-mode">
      <div class="browse-header">
        <button class="btn-back" @click="mode = 'dashboard'">← 返回</button>
        <h2>单词浏览</h2>
      </div>

      <!-- 筛选 -->
      <div class="browse-filters">
        <div class="filter-group">
          <label>来源：</label>
          <select v-model="browseSource">
            <option value="all">全部</option>
            <option value="jlpt">JLPT词库</option>
            <option value="textbook">教科书</option>
          </select>
        </div>
        <div class="filter-group" v-if="browseSource !== 'jlpt'">
          <label>LEVEL：</label>
          <select v-model="browseTextbookLevel">
            <option :value="0">全部</option>
            <option v-for="lv in textbookLevels" :key="lv" :value="lv">
              {{ getTextbookLevelName(lv) }}
            </option>
          </select>
        </div>
        <div class="filter-group" v-if="browseSource !== 'jlpt'">
          <label>单元：</label>
          <select v-model="browseUnit">
            <option value="all">全部单元</option>
            <option v-for="opt in browseUnitOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="filter-group" v-if="browseSource !== 'textbook'">
          <label>级别：</label>
          <select v-model="browseLevel">
            <option value="all">全部</option>
            <option v-for="lv in levels" :key="lv" :value="lv">{{ lv }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>状态：</label>
          <select v-model="browseStatus">
            <option value="all">全部</option>
            <option value="new">未学</option>
            <option value="learning">学习中</option>
            <option value="mastered">已掌握</option>
          </select>
        </div>
        <div class="filter-group search">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索单词、读音、意思..."
          />
        </div>
      </div>

      <!-- 单词列表 -->
      <div class="word-list">
        <div
          v-for="word in filteredWords"
          :key="word.id"
          v-memo="[word.id, word.status]"
          class="word-item"
          :class="`status-${word.status}`"
        >
          <div class="word-main">
            <span class="word-name">{{ word.word }}</span>
            <span class="word-reading">{{ word.reading }}</span>
            <span class="word-meaning">{{ word.meaning }}</span>
          </div>
          <div class="word-tags">
            <span class="tag-level">{{ word.level }}</span>
            <span v-if="word.type" class="tag-type">{{ word.type }}</span>
            <span class="tag-status" :class="`status-${word.status}`">
              {{ statusText[word.status] }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="filteredWords.length === 0" class="empty-tip">
        没有符合条件的单词
      </div>
    </div>

    <!-- ========== 统计页 ========== -->
    <div v-else-if="mode === 'stats'" class="stats-mode">
      <div class="stats-header">
        <button class="btn-back" @click="mode = 'dashboard'">← 返回</button>
        <h2>学习统计</h2>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">{{ stats.totalWords }}</div>
          <div class="stat-name">总单词数</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ stats.masteredWords }}</div>
          <div class="stat-name">已掌握</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ stats.learningWords }}</div>
          <div class="stat-name">学习中</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ stats.newWords }}</div>
          <div class="stat-name">未学习</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ stats.streakDays }}</div>
          <div class="stat-name">连续学习(天)</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">
            {{ stats.totalWords > 0 ? Math.round((stats.masteredWords / stats.totalWords) * 100) : 0 }}%
          </div>
          <div class="stat-name">总掌握率</div>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="charts-section">
        <div class="charts-row">
          <div class="chart-col chart-col-wide">
            <LevelBarChart :level-progress="levelProgress" />
          </div>
          <div class="chart-col chart-col-narrow">
            <StatusPieChart :stats="stats" />
          </div>
        </div>

        <div class="charts-row">
          <StudyHeatmap :daily-activity="dailyActivity" />
        </div>

        <div class="charts-row">
          <AccuracyLineChart :trend="accuracyTrend" />
        </div>
      </div>

      <!-- 级别详细统计 -->
      <div class="level-stats">
        <h3>各级别详情</h3>
        <table>
          <thead>
            <tr>
              <th>级别</th>
              <th>总数</th>
              <th>已掌握</th>
              <th>学习中</th>
              <th>未学</th>
              <th>掌握率</th>
            </tr>
          </thead>
          <tbody>
            <tr class="group-row"><td colspan="6">JLPT 词库</td></tr>
            <tr v-for="lp in levelProgress" :key="lp.level">
              <td>{{ lp.level }}</td>
              <td>{{ lp.total }}</td>
              <td>{{ lp.mastered }}</td>
              <td>{{ lp.learning }}</td>
              <td>{{ lp.new }}</td>
              <td>{{ lp.total > 0 ? Math.round((lp.mastered / lp.total) * 100) : 0 }}%</td>
            </tr>
          </tbody>
          <tbody>
            <tr class="group-row"><td colspan="6">教科书词库</td></tr>
            <tr v-for="tp in textbookProgress" :key="tp.level">
              <td>{{ getTextbookLevelName(tp.level) }}</td>
              <td>{{ tp.total }}</td>
              <td>{{ tp.mastered }}</td>
              <td>{{ tp.learning }}</td>
              <td>{{ tp.new }}</td>
              <td>{{ tp.total > 0 ? Math.round((tp.mastered / tp.total) * 100) : 0 }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Word, WordWithStatus, LearningStats, LevelProgress, JLPTLevel, WordSource } from '../types/japanese'
import {
  getAllWords,
  getAllLevels,
  getTextbookWords,
  getTextbookLevels,
  getTextbookLevelName,
  getTextbookUnits,
  getAllStudyWords,
} from '../api/vocabulary'
import { shuffleArray } from '../utils/shuffle'
import {
  getTodayQueue,
  getStats,
  getLevelProgress,
  getWordStatus,
  submitReview,
  getTodayNewCount,
  MAX_NEW_PER_DAY,
  type ReviewQuality,
} from '../composables/useSRS'
import {
  getCombinedDailyActivity,
  getAccuracyTrend,
} from '../composables/useStudyHistory'
import StudyHeatmap from '../components/charts/StudyHeatmap.vue'
import LevelBarChart from '../components/charts/LevelBarChart.vue'
import StatusPieChart from '../components/charts/StatusPieChart.vue'
import AccuracyLineChart from '../components/charts/AccuracyLineChart.vue'

// ========== 状态 ==========

type ViewMode = 'dashboard' | 'review' | 'browse' | 'stats'
type ReviewLevel = 'all' | JLPTLevel

const mode = ref<ViewMode>('dashboard')
const allWords = ref<Word[]>([])
const reviewQueue = ref<Word[]>([])
const currentIndex = ref(0)
const showBack = ref(false)

// 仪表盘：词库来源 + 级别/单元选择
const studySource = ref<WordSource | 'all'>('textbook')
const selectedLevel = ref<ReviewLevel>('all')
const selectedUnit = ref<number>(1)

// 教科书级别（LEVEL 1、LEVEL 2…），当前可选级别与当前选中级别
const textbookLevels = getTextbookLevels()
const studyLevel = ref<number>(textbookLevels[0] ?? 1)

// 浏览模式筛选
const browseSource = ref<string>('all')
/** 教材 LEVEL，0 表示全部 */
const browseTextbookLevel = ref<number>(0)
/** 单元，'all' 或 "级别-单元"（如 "1-3"），跨 LEVEL 时需带级别才不歧义 */
const browseUnit = ref<string>('all')
const browseLevel = ref<string>('all')
const browseStatus = ref<string>('all')
const searchKeyword = ref('')

const levels = getAllLevels()
const statusText = {
  new: '未学',
  learning: '学习中',
  mastered: '已掌握',
}

// ========== 计算属性 ==========

const stats = computed<LearningStats>(() => {
  return getStats(allWords.value)
})

// 两套词库分开统计：N5~N1 是 JLPT 的级别维度，教科书按 LEVEL/课组织、没有这个
// 维度，混在一起会把 N5 分母撑大（920 条教科书词全被算进 N5），进度条严重失真。
const levelProgress = computed<LevelProgress[]>(() => {
  return getLevelProgress(getAllWords())
})

/** 教科书各级别进度，每个 LEVEL 一行 */
const textbookProgress = computed(() =>
  textbookLevels.map((level) => {
    const words = getTextbookWords(level)
    let mastered = 0
    let learning = 0
    let fresh = 0
    for (const w of words) {
      const status = getWordStatus(w.id)
      if (status === 'mastered') mastered++
      else if (status === 'learning') learning++
      else fresh++
    }
    return { level, total: words.length, mastered, learning, new: fresh }
  })
)

/** 当前激活的词库（根据 source 切换；教科书按选中的 LEVEL 收窄） */
const activeWordPool = computed(() => {
  if (studySource.value === 'jlpt') return getAllWords()
  if (studySource.value === 'textbook') return getTextbookWords(studyLevel.value)
  return getAllStudyWords()
})

const levelOptions = computed(() => {
  const pool = studySource.value === 'textbook' ? getTextbookWords(studyLevel.value) : getAllWords()
  const options: { value: ReviewLevel; label: string; count: number; totalWords: number }[] = [
    {
      value: 'all',
      label: '全部',
      count: getTodayQueue(pool, 10, undefined).reviews.length + getTodayQueue(pool, 10, undefined).newWords.length,
      totalWords: pool.length,
    },
  ]
  for (const lv of levels) {
    const queue = getTodayQueue(pool, 10, lv)
    options.push({
      value: lv,
      label: lv,
      count: queue.reviews.length + queue.newWords.length,
      totalWords: pool.filter((w) => w.level === lv).length,
    })
  }
  return options
})

const unitOptions = computed(() => {
  const levelWords = getTextbookWords(studyLevel.value)
  const units = getTextbookUnits(studyLevel.value)
  if (units.length === 0) return []
  const allLearned = levelWords.filter((w) => getWordStatus(w.id) !== 'new').length
  return [
    { value: 0, label: '全部单元', learned: allLearned, total: levelWords.length },
    ...units.map((unit) => {
      const unitWords = levelWords.filter((w) => w.unit === unit)
      const learned = unitWords.filter((w) => getWordStatus(w.id) !== 'new').length
      return {
        value: unit,
        label: `第${unit}课`,
        learned,
        total: unitWords.length,
      }
    }),
  ]
})

/** 浏览模式的单元选项；选了具体 LEVEL 时不重复标级别名 */
const browseUnitOptions = computed(() => {
  const levelList =
    browseTextbookLevel.value === 0 ? textbookLevels : [browseTextbookLevel.value]
  const withLevelName = levelList.length > 1
  const options: { value: string; label: string }[] = []
  for (const lv of levelList) {
    for (const unit of getTextbookUnits(lv)) {
      options.push({
        value: `${lv}-${unit}`,
        label: withLevelName ? `${getTextbookLevelName(lv)} 第${unit}课` : `第${unit}课`,
      })
    }
  }
  return options
})

const todayQueue = computed(() => {
  const pool = activeWordPool.value
  if (studySource.value === 'textbook' && selectedUnit.value > 0) {
    const unitPool = pool.filter((w) => w.unit === selectedUnit.value)
    return getTodayQueue(unitPool, 10, undefined)
  }
  return getTodayQueue(pool, 10, selectedLevel.value === 'all' ? undefined : selectedLevel.value)
})

const todayReviewsCount = computed(() => todayQueue.value.reviews.length)
const todayNewCount = computed(() => todayQueue.value.newWords.length)
const todayTotal = computed(() => todayReviewsCount.value + todayNewCount.value)

const currentWord = computed(() => {
  if (currentIndex.value < reviewQueue.value.length) {
    return reviewQueue.value[currentIndex.value]
  }
  return undefined
})

// 缓存：allWords 不变时无需重建 16k+ 对象
let _wordsWithStatusCache: WordWithStatus[] | null = null
let _wordsWithStatusAll: Word[] | null = null

const wordsWithStatus = computed<WordWithStatus[]>(() => {
  if (_wordsWithStatusCache && _wordsWithStatusAll === allWords.value) {
    return _wordsWithStatusCache
  }
  _wordsWithStatusAll = allWords.value
  _wordsWithStatusCache = allWords.value.map((word) => ({
    ...word,
    status: getWordStatus(word.id),
  }))
  return _wordsWithStatusCache
})

const filteredWords = computed(() => {
  let result = wordsWithStatus.value

  // 来源筛选
  if (browseSource.value === 'jlpt') {
    result = result.filter((w) => !w.source || w.source === 'jlpt')
  } else if (browseSource.value === 'textbook') {
    result = result.filter((w) => w.source === 'textbook')
  }

  // 教材 LEVEL 筛选
  if (browseTextbookLevel.value > 0) {
    result = result.filter((w) => w.textbookLevel === browseTextbookLevel.value)
  }

  // 单元筛选（值形如 "1-3"，需同时比对级别与单元号）
  if (browseUnit.value !== 'all') {
    const [lv, unit] = browseUnit.value.split('-').map(Number)
    result = result.filter((w) => w.textbookLevel === lv && w.unit === unit)
  }

  // 级别筛选
  if (browseLevel.value !== 'all') {
    result = result.filter((w) => w.level === browseLevel.value)
  }

  // 状态筛选
  if (browseStatus.value !== 'all') {
    result = result.filter((w) => w.status === browseStatus.value)
  }

  // 关键词搜索
  const kw = searchKeyword.value.trim()
  if (kw) {
    result = result.filter(
      (w) =>
        w.word.includes(kw) ||
        w.reading.includes(kw) ||
        w.meaning.includes(kw)
    )
  }

  return result
})

// 图表数据
const dailyActivity = computed(() => getCombinedDailyActivity(84))
const accuracyTrend = computed(() => getAccuracyTrend(30))

// ========== 监听 ==========

// 换 LEVEL 后原先选的单元可能已不存在，重置回「全部单元」
watch(browseTextbookLevel, () => {
  browseUnit.value = 'all'
})

// 切到 JLPT 词库时清掉教材筛选：下拉框虽隐藏，不重置仍会参与过滤导致空列表
watch(browseSource, (src) => {
  if (src === 'jlpt') {
    browseTextbookLevel.value = 0
    browseUnit.value = 'all'
  }
})

// ========== 方法 ==========

/** 切换教科书 LEVEL；同步把单元重置到该级别的第 1 课 */
function selectStudyLevel(level: number) {
  studyLevel.value = level
  selectedUnit.value = 1
}

function startReview() {
  let pool = activeWordPool.value
  let level: JLPTLevel | undefined = selectedLevel.value === 'all' ? undefined : selectedLevel.value

  // 教科书模式：按 unit 筛选
  if (studySource.value === 'textbook' && selectedUnit.value > 0) {
    pool = pool.filter((w) => w.unit === selectedUnit.value)
    level = undefined
  }

  const queue = getTodayQueue(pool, 10, level)
  reviewQueue.value = shuffleArray([...queue.reviews, ...queue.newWords])
  currentIndex.value = 0
  showBack.value = false
  mode.value = 'review'
}

function handleReview(quality: ReviewQuality) {
  const word = currentWord.value
  if (!word) return

  // 异步保存到后端（不阻塞 UI）
  submitReview(word.id, quality).catch((e) => console.error('[review] save error:', e))
  showBack.value = false

  // 延迟一下再进入下一题，让用户看到反馈
  setTimeout(() => {
    currentIndex.value++
  }, 300)
}

// ========== 生命周期 ==========

onMounted(() => {
  allWords.value = getAllStudyWords()
})
</script>

<style scoped lang="scss">
@use "sass:color";

$primary: #a3c1ad;
$primary-dark: color.adjust($primary, $lightness: -10%);
$text-main: #2c3e50;
$bg-glass: rgba(255, 255, 255, 0.75);
$shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
}

.title {
  text-align: center;
  margin-bottom: 24px;
  font-size: 28px;
}

// ========== Dashboard ==========

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  box-shadow: $shadow;

  .stat-number {
    font-size: 32px;
    font-weight: bold;
    color: $primary-dark;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 13px;
    opacity: 0.7;
  }
}

.level-progress {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: $shadow;

  h3 {
    margin-bottom: 12px;
    font-size: 16px;
  }
}

/* 分组小标题：JLPT 词库 / 教科书词库 */
.level-group-title {
  font-size: 13px;
  opacity: 0.6;
  margin: 16px 0 8px;

  &:first-of-type {
    margin-top: 0;
  }
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 10px;

  .level-name {
    /* min-width 让 "N5" 与 "LEVEL 1" 都能放下，不写死宽度免得长出省略号 */
    min-width: 36px;
    white-space: nowrap;
    font-size: 14px;
    font-weight: bold;
  }

  .level-bar {
    flex: 1;
    height: 10px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 999px;
    overflow: hidden;
  }

  .level-fill {
    height: 100%;
    background: linear-gradient(90deg, $primary, $primary-dark);
    border-radius: 999px;
    transition: width 0.5s ease;
  }

  .level-count {
    width: 48px;
    text-align: right;
    font-size: 12px;
    opacity: 0.7;
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.daily-limit-tip {
  text-align: center;
  font-size: 12px;
  opacity: 0.45;

  strong {
    font-weight: 600;
    opacity: 0.8;
  }
}

// ========== 今日任务卡片 ==========

.task-card {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: $shadow;

  &.done {
    background: rgba(107, 203, 119, 0.08);
    border: 1px solid rgba(107, 203, 119, 0.15);
  }
}

.task-main {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.task-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 4px;
}

.task-detail {
  font-size: 13px;
  opacity: 0.55;
  line-height: 1.5;

  strong {
    font-weight: 600;
    opacity: 0.85;
  }
}

.task-btn {
  width: 100%;
}

.source-select {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: $shadow;

  h3 {
    margin-bottom: 12px;
    font-size: 16px;
  }
}

.source-options {
  display: flex;
  gap: 10px;
}

.source-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-1px);
  }

  &.active {
    background: linear-gradient(135deg, color.adjust($primary, $lightness: 6%), $primary-dark);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(163, 193, 173, 0.4);
  }
}

.level-select {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: $shadow;

  h3 {
    margin-bottom: 12px;
    font-size: 16px;
  }
}

.level-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.level-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-1px);
  }

  &.active {
    background: linear-gradient(135deg, color.adjust($primary, $lightness: 6%), $primary-dark);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(163, 193, 173, 0.4);
  }

  .level-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.1);
    font-weight: 500;
  }

  &.active .level-badge {
    background: rgba(255, 255, 255, 0.3);
  }

  .level-badge.empty {
    opacity: 0.4;
    font-weight: 400;
  }
}

// ========== 按钮 ==========

.btn-primary,
.btn-secondary {
  padding: 14px 24px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, color.adjust($primary, $lightness: 6%), $primary-dark);
  color: $text-main;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  }
}

.btn-secondary {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  color: $text-main;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
}

.btn-back {
  background: transparent;
  border: none;
  color: $text-main;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 0;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
}

// ========== 复习模式 ==========

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.review-progress {
  font-size: 14px;
  opacity: 0.6;
}

.review-empty {
  text-align: center;
  padding: 60px 20px;

  h2 {
    margin-bottom: 12px;
  }

  p {
    margin-bottom: 16px;
    opacity: 0.7;
  }

  .sub-hint {
    font-size: 13px;
    opacity: 0.4;
  }
}

.flip_card_container {
  width: 100%;
  height: 280px;
  perspective: 1000px;
  margin-bottom: 20px;
}

.flip_card {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.6s;

  &:hover {
    transform: translateY(-4px);
  }

  &.flipped {
    transform: rotateY(180deg);
  }
}

.face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: $bg-glass;
  backdrop-filter: blur(10px);
  box-shadow: $shadow;
  backface-visibility: hidden;
}

.front {
  flex-direction: column;

  .word-text {
    font-size: 42px;
    margin-bottom: 12px;
  }

  .word-hint {
    font-size: 14px;
    opacity: 0.5;
  }
}

.back {
  transform: rotateY(180deg);

  .word-detail {
    text-align: center;

    h3 {
      font-size: 24px;
      margin-bottom: 8px;
      color: $primary-dark;
    }

    .meaning {
      font-size: 20px;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .meta {
      margin-bottom: 16px;

      span {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.05);
        font-size: 13px;
        margin: 0 4px;
      }
    }

    .example {
      p {
        font-size: 15px;
        margin-bottom: 4px;
      }

      .example-chn {
        font-size: 14px;
        opacity: 0.6;
      }
    }
  }
}

.review-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;

  button {
    padding: 12px 20px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-size: 15px;
    transition: all 0.2s ease;
    min-width: 100px;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

.btn-unknown {
  background: #ff6b6b;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn-vague {
  background: #ffd93d;
  color: $text-main;
  box-shadow: 0 4px 12px rgba(255, 217, 61, 0.3);
}

.btn-known {
  background: #6bcb77;
  color: white;
  box-shadow: 0 4px 12px rgba(107, 203, 119, 0.3);
}

.flip-hint {
  text-align: center;
  font-size: 14px;
  opacity: 0.5;
  margin-top: 8px;
}

// ========== 浏览模式 ==========

.browse-header,
.stats-header {
  margin-bottom: 20px;

  h2 {
    margin-top: 8px;
  }
}

.browse-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;

  .filter-group {
    display: flex;
    align-items: center;
    gap: 6px;

    label {
      font-size: 14px;
      opacity: 0.7;
    }

    select,
    input {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: $bg-glass;
      backdrop-filter: blur(10px);
      font-size: 14px;
      outline: none;

      &:focus {
        border-color: $primary;
      }
    }

    input {
      min-width: 200px;
    }
  }
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.word-item {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }

  .word-main {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
    flex-wrap: wrap;

    .word-name {
      font-size: 20px;
      font-weight: bold;
    }

    .word-reading {
      font-size: 15px;
      color: $primary-dark;
    }

    .word-meaning {
      font-size: 14px;
      opacity: 0.8;
    }
  }

  .word-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;

    span {
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
    }

    .tag-level {
      background: rgba(163, 193, 173, 0.25);
      color: $text-main;
    }

    .tag-type {
      background: rgba(0, 0, 0, 0.05);
    }

    .tag-status {
      &.status-new {
        background: rgba(150, 150, 150, 0.15);
      }
      &.status-learning {
        background: rgba(255, 217, 61, 0.25);
      }
      &.status-mastered {
        background: rgba(107, 203, 119, 0.25);
      }
    }
  }
}

.empty-tip {
  text-align: center;
  padding: 40px;
  opacity: 0.5;
}

// ========== 统计页 ==========

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-box {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  box-shadow: $shadow;

  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: $primary-dark;
    margin-bottom: 4px;
  }

  .stat-name {
    font-size: 13px;
    opacity: 0.7;
  }
}

.level-stats {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 16px;
  box-shadow: $shadow;

  h3 {
    margin-bottom: 12px;
    font-size: 16px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th,
    td {
      padding: 10px 8px;
      text-align: center;
    }

    th {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      font-weight: 600;
      opacity: 0.7;
    }

    td {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    /* 两组词库之间的分组行：JLPT 词库 / 教科书词库 */
    .group-row td {
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      opacity: 0.6;
      padding-top: 16px;
      border-bottom: none;
    }
  }
}

// ========== 图表布局 ==========

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.charts-row {
  display: flex;
  gap: 16px;
}

.chart-col {
  &-wide {
    flex: 2;
  }

  &-narrow {
    flex: 1;
  }
}

// ========== 响应式 ==========

@media (min-width: 600px) {
  .stats-cards {
    grid-template-columns: repeat(4, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .review-actions {
    gap: 20px;

    button {
      min-width: 120px;
      padding: 14px 28px;
      font-size: 16px;
    }
  }
}

@media (max-width: 599px) {
  .charts-row {
    flex-direction: column;
  }
}
</style>
