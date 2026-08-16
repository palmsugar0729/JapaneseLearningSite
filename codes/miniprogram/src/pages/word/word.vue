<template>
  <view class="container">
    <!-- 顶部切换栏 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- ========== Dashboard 概览 ========== -->
    <view v-if="activeTab === 'dashboard'">
      <!-- 词库来源选择 -->
      <view class="card">
        <text class="section-title">选择词库</text>
        <view class="chip-row">
          <view
            class="chip"
            :class="{ active: studySource === 'textbook' }"
            @click="selectSource('textbook')"
          >
            <text>📖 教科书</text>
          </view>
          <view
            class="chip"
            :class="{ active: studySource === 'jlpt' }"
            @click="selectSource('jlpt')"
          >
            <text>📚 JLPT词库</text>
          </view>
        </view>
      </view>

      <!-- 级别/单元选择 -->
      <view class="card">
        <text class="section-title">{{ studySource === 'textbook' ? '选择单元' : '选择复习级别' }}</text>

        <!-- JLPT 级别 -->
        <view v-if="studySource !== 'textbook'" class="chip-row wrap">
          <view
            v-for="lv in levelOptions"
            :key="lv.value"
            class="chip"
            :class="{ active: selectedLevel === lv.value }"
            @click="selectedLevel = lv.value"
          >
            <text>{{ lv.label }}</text>
            <text class="chip-badge">{{ lv.count > 0 ? lv.count : '无' }}</text>
          </view>
        </view>

        <!-- 教科书单元 -->
        <view v-if="studySource === 'textbook'" class="chip-row wrap">
          <view
            v-for="u in unitOptions"
            :key="u.value"
            class="chip"
            :class="{ active: selectedUnit === u.value }"
            @click="selectedUnit = u.value"
          >
            <text>{{ u.label }}</text>
            <text class="chip-badge">{{ u.learned > 0 ? u.learned + '/' : '' }}{{ u.total }}</text>
          </view>
        </view>
      </view>

      <!-- 今日任务 -->
      <view class="card">
        <text class="section-title">今日任务</text>
        <view class="task-item flex-between">
          <text>待复习</text>
          <text class="text-primary">{{ todayReviewsCount }} 个</text>
        </view>
        <view class="task-item flex-between">
          <text>新词</text>
          <text class="text-primary">{{ todayNewCount }} 个</text>
        </view>
        <view v-if="todayTotal === 0" class="empty-state">
          <text class="empty-icon">🎉</text>
          <text>今日任务已完成！</text>
        </view>
        <view
          v-else
          class="btn btn-primary mt-base"
          @click="startReview"
        >
          <text>开始学习 ({{ todayTotal }})</text>
        </view>
      </view>
    </view>

    <!-- ========== 复习模式 ========== -->
    <view v-if="activeTab === 'review'">
      <!-- 队列为空 -->
      <view v-if="reviewQueue.length === 0" class="card">
        <view class="empty-state">
          <text class="empty-icon">🎉</text>
          <text>今日没有待复习的单词</text>
          <text class="empty-hint">去「概览」选择词库开始学习新词吧</text>
        </view>
      </view>

      <!-- 本轮完成 -->
      <view v-else-if="currentIndex >= reviewQueue.length" class="card">
        <view class="empty-state">
          <text class="empty-icon">🎉</text>
          <text>本轮完成！共复习 {{ reviewQueue.length }} 个单词</text>
          <view class="btn btn-primary mt-base" @click="activeTab = 'dashboard'">
            <text>返回概览</text>
          </view>
        </view>
      </view>

      <!-- 单词卡片 -->
      <template v-else>
        <view class="flex-between mb-base">
          <text class="text-sm text-secondary">{{ currentIndex + 1 }} / {{ reviewQueue.length }}</text>
          <text class="text-sm text-secondary" @click="activeTab = 'dashboard'">退出</text>
        </view>

        <view class="card flashcard" @click="onCardTap">
          <view class="flex-center" style="flex-direction: column">
            <text class="word-main">{{ showingAnswer ? currentWord?.reading : currentWord?.word }}</text>
            <text v-if="showingAnswer" class="word-meaning mt-base">{{ currentWord?.meaning }}</text>

            <view v-if="showingAnswer && currentWord?.type" class="word-meta mt-sm">
              <text class="tag tag-level">{{ currentWord?.type }}</text>
              <text v-if="currentWord?.accent" class="tag tag-level">声调 {{ currentWord?.accent }}</text>
            </view>

            <view v-if="showingAnswer && currentWord?.example" class="word-example mt-base">
              <text class="example-ja">{{ currentWord?.example }}</text>
              <text v-if="currentWord?.exampleTranslation" class="example-zh">{{ currentWord?.exampleTranslation }}</text>
            </view>

            <text v-if="!showingAnswer" class="tap-hint mt-lg text-secondary">点击卡片查看答案</text>
          </view>
        </view>

        <view v-if="showingAnswer" class="flex-row" style="gap: 16rpx; margin-top: 24rpx">
          <view class="card btn btn-ghost flex-1 flex-center" @click="feedback('unknown')">
            <text>😰 不认识</text>
          </view>
          <view class="card btn btn-outline flex-1 flex-center" @click="feedback('vague')">
            <text>🤔 模糊</text>
          </view>
          <view class="card btn btn-primary flex-1 flex-center" @click="feedback('known')">
            <text>😊 认识</text>
          </view>
        </view>
      </template>
    </view>

    <!-- ========== 浏览模式 ========== -->
    <view v-if="activeTab === 'browse'">
      <view class="card">
        <text class="section-title">筛选</text>
        <view class="chip-row wrap">
          <view
            v-for="opt in browseSourceOptions"
            :key="opt.value"
            class="chip"
            :class="{ active: browseSource === opt.value }"
            @click="browseSource = opt.value"
          >
            <text>{{ opt.label }}</text>
          </view>
        </view>

        <view v-if="browseSource !== 'textbook'" class="chip-row wrap mt-sm">
          <view
            v-for="opt in browseLevelOptions"
            :key="opt.value"
            class="chip"
            :class="{ active: browseLevel === opt.value }"
            @click="browseLevel = opt.value"
          >
            <text>{{ opt.label }}</text>
          </view>
        </view>

        <view v-if="browseSource !== 'jlpt'" class="chip-row wrap mt-sm">
          <view
            v-for="opt in browseUnitOptions"
            :key="opt.value"
            class="chip"
            :class="{ active: browseUnit === opt.value }"
            @click="browseUnit = opt.value"
          >
            <text>{{ opt.label }}</text>
          </view>
        </view>

        <view class="chip-row wrap mt-sm">
          <view
            v-for="opt in browseStatusOptions"
            :key="opt.value"
            class="chip"
            :class="{ active: browseStatus === opt.value }"
            @click="browseStatus = opt.value"
          >
            <text>{{ opt.label }}</text>
          </view>
        </view>

        <input
          class="search-input mt-base"
          v-model="searchKeyword"
          placeholder="搜索单词、读音、意思..."
          placeholder-style="color: #ccc"
        />
      </view>

      <view v-if="browseWords.length === 0" class="card">
        <view class="empty-state">
          <text class="empty-icon">🔍</text>
          <text>没有符合条件的单词</text>
        </view>
      </view>

      <view
        v-for="w in browseWords"
        :key="w.id"
        class="card word-item"
        :class="'status-' + w.status"
      >
        <view class="flex-between">
          <view class="word-left">
            <text class="word-name">{{ w.word }}</text>
            <text class="word-reading">{{ w.reading }}</text>
          </view>
          <text class="tag tag-status" :class="'status-' + w.status">{{ statusText[w.status] }}</text>
        </view>
        <text class="word-meaning-sm">{{ w.meaning }}</text>
        <view class="word-tags mt-sm">
          <text class="tag tag-level">{{ w.level }}</text>
          <text class="tag tag-level">{{ w.type }}</text>
          <text v-if="w.source === 'textbook'" class="tag tag-level">第{{ w.unit }}课</text>
        </view>
      </view>
    </view>

    <!-- ========== 统计模式 ========== -->
    <view v-if="activeTab === 'stats'">
      <view class="card stats-grid">
        <view class="stat-box" v-for="s in statBoxes" :key="s.name">
          <text class="stat-value">{{ s.value }}</text>
          <text class="stat-name">{{ s.name }}</text>
        </view>
      </view>

      <!-- 学习状态占比 -->
      <view class="card">
        <text class="section-title">学习状态占比</text>
        <view class="status-bar">
          <view
            v-for="s in statusSegments"
            :key="s.label"
            class="status-seg"
            :style="{ width: s.pct + '%', background: s.color }"
          ></view>
        </view>
        <view class="status-legend">
          <view v-for="s in statusSegments" :key="s.label" class="legend-item">
            <view class="legend-dot" :style="{ background: s.color }"></view>
            <text class="legend-text">{{ s.label }} {{ s.value }}</text>
          </view>
        </view>
      </view>

      <!-- 图表 -->
      <StudyHeatmap />
      <AccuracyTrendChart />

      <view class="card">
        <text class="section-title">各级别详情</text>
        <view class="level-table">
          <view class="level-row header-row">
            <text class="col level">级别</text>
            <text class="col">总数</text>
            <text class="col">掌握</text>
            <text class="col">学习中</text>
            <text class="col">未学</text>
            <text class="col">掌握率</text>
          </view>
          <view class="level-row" v-for="lp in levelProgress" :key="lp.level">
            <text class="col level">{{ lp.level }}</text>
            <text class="col">{{ lp.total }}</text>
            <text class="col">{{ lp.mastered }}</text>
            <text class="col">{{ lp.learning }}</text>
            <text class="col">{{ lp.new }}</text>
            <text class="col">{{ lp.total > 0 ? Math.round((lp.mastered / lp.total) * 100) : 0 }}%</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Word, JLPTLevel } from '@/types/japanese'
import {
  getAllWords,
  getAllLevels,
  getTextbookWords,
  getTextbookUnits,
  getAllStudyWords,
} from '@/api/vocabulary'
import {
  getTodayQueue,
  getStats,
  getLevelProgress,
  getWordStatus,
  submitReview,
  MAX_NEW_PER_DAY,
  type ReviewQuality,
} from '@/composables/useSRS'
import { shuffleArray } from '@/utils/shuffle'
import StudyHeatmap from '@/components/charts/StudyHeatmap.vue'
import AccuracyTrendChart from '@/components/charts/AccuracyTrendChart.vue'

type ReviewLevel = 'all' | JLPTLevel

const tabs = [
  { key: 'dashboard', label: '概览' },
  { key: 'review', label: '复习' },
  { key: 'browse', label: '浏览' },
  { key: 'stats', label: '统计' },
]

const activeTab = ref('dashboard')

// ========== 单词数据 ==========
const allWords = ref<Word[]>(getAllStudyWords())
const levels = getAllLevels()

// ========== 复习状态 ==========
const reviewQueue = ref<Word[]>([])
const currentIndex = ref(0)
const showingAnswer = ref(false)

// ========== Dashboard：词库 + 级别/单元 ==========
const studySource = ref<'textbook' | 'jlpt'>('textbook')
const selectedLevel = ref<ReviewLevel>('all')
const selectedUnit = ref(1)

const statusText: Record<string, string> = {
  new: '未学',
  learning: '学习中',
  mastered: '已掌握',
}

// ========== 计算属性 ==========

const stats = computed(() => getStats(allWords.value))
const levelProgress = computed(() => getLevelProgress(allWords.value))

/** 当前激活词库 */
const activeWordPool = computed(() => {
  if (studySource.value === 'jlpt') return getAllWords()
  return getTextbookWords()
})

const levelOptions = computed(() => {
  const pool = activeWordPool.value
  const options: { value: ReviewLevel; label: string; count: number }[] = [
    {
      value: 'all',
      label: '全部',
      count:
        getTodayQueue(pool, MAX_NEW_PER_DAY, undefined).reviews.length +
        getTodayQueue(pool, MAX_NEW_PER_DAY, undefined).newWords.length,
    },
  ]
  for (const lv of levels) {
    const queue = getTodayQueue(pool, MAX_NEW_PER_DAY, lv)
    options.push({
      value: lv,
      label: lv,
      count: queue.reviews.length + queue.newWords.length,
    })
  }
  return options
})

const unitOptions = computed(() => {
  const units = getTextbookUnits()
  const all = getTextbookWords()
  const allLearned = all.filter((w) => getWordStatus(w.id) !== 'new').length
  return [
    { value: 0, label: '全部单元', total: all.length, learned: allLearned },
    ...units.map((u) => {
      const unitWords = getTextbookWords().filter((w) => w.unit === u.unit)
      const learned = unitWords.filter((w) => getWordStatus(w.id) !== 'new').length
      return { value: u.unit, label: `第${u.unit}课`, total: unitWords.length, learned }
    }),
  ]
})

/** 今日队列（依据当前词库/级别/单元） */
const todayQueue = computed(() => {
  const pool = activeWordPool.value
  if (studySource.value === 'textbook' && selectedUnit.value > 0) {
    return getTodayQueue(pool.filter((w) => w.unit === selectedUnit.value), MAX_NEW_PER_DAY, undefined)
  }
  return getTodayQueue(pool, MAX_NEW_PER_DAY, selectedLevel.value === 'all' ? undefined : selectedLevel.value)
})

const todayReviewsCount = computed(() => todayQueue.value.reviews.length)
const todayNewCount = computed(() => todayQueue.value.newWords.length)
const todayTotal = computed(() => todayReviewsCount.value + todayNewCount.value)

const currentWord = computed(() => {
  if (currentIndex.value < reviewQueue.value.length) return reviewQueue.value[currentIndex.value]
  return undefined
})

// ========== 浏览筛选 ==========
const browseSource = ref<'all' | 'jlpt' | 'textbook'>('all')
const browseLevel = ref<'all' | JLPTLevel>('all')
const browseUnit = ref(0)
const browseStatus = ref<'all' | 'new' | 'learning' | 'mastered'>('all')
const searchKeyword = ref('')

const browseSourceOptions = [
  { value: 'all' as const, label: '全部' },
  { value: 'jlpt' as const, label: 'JLPT词库' },
  { value: 'textbook' as const, label: '教科书' },
]
const browseLevelOptions = [
  { value: 'all' as const, label: '全部级别' },
  ...levels.map((lv) => ({ value: lv, label: lv })),
]
const browseUnitOptions = [
  { value: 0, label: '全部单元' },
  ...getTextbookUnits().map((u) => ({ value: u.unit, label: `第${u.unit}课` })),
]
const browseStatusOptions = [
  { value: 'all' as const, label: '全部状态' },
  { value: 'new' as const, label: '未学' },
  { value: 'learning' as const, label: '学习中' },
  { value: 'mastered' as const, label: '已掌握' },
]

const browseWords = computed(() => {
  let result = allWords.value

  if (browseSource.value === 'jlpt') {
    result = result.filter((w) => !w.source || w.source === 'jlpt')
  } else if (browseSource.value === 'textbook') {
    result = result.filter((w) => w.source === 'textbook')
  }

  if (browseUnit.value > 0) {
    result = result.filter((w) => w.unit === browseUnit.value)
  }

  if (browseLevel.value !== 'all') {
    result = result.filter((w) => w.level === browseLevel.value)
  }

  if (browseStatus.value !== 'all') {
    result = result.filter((w) => getWordStatus(w.id) === browseStatus.value)
  }

  const kw = searchKeyword.value.trim()
  if (kw) {
    result = result.filter(
      (w) => w.word.includes(kw) || w.reading.includes(kw) || w.meaning.includes(kw)
    )
  }

  return result.map((w) => ({ ...w, status: getWordStatus(w.id) }))
})

// ========== 统计 ==========
const statusSegments = computed(() => {
  const total = stats.value.totalWords
  const segs = [
    { label: '已掌握', value: stats.value.masteredWords, color: '#27ae60' },
    { label: '学习中', value: stats.value.learningWords, color: '#f39c12' },
    { label: '未学习', value: stats.value.newWords, color: '#ccc' },
  ]
  return segs.map((s) => ({
    ...s,
    pct: total > 0 ? Math.round((s.value / total) * 100) : 0,
  }))
})

const statBoxes = computed(() => [
  { name: '总单词数', value: stats.value.totalWords },
  { name: '已掌握', value: stats.value.masteredWords },
  { name: '学习中', value: stats.value.learningWords },
  { name: '未学习', value: stats.value.newWords },
  { name: '连续学习(天)', value: stats.value.streakDays },
  {
    name: '总掌握率',
    value:
      stats.value.totalWords > 0
        ? Math.round((stats.value.masteredWords / stats.value.totalWords) * 100) + '%'
        : '0%',
  },
])

// ========== 方法 ==========

function selectSource(source: 'textbook' | 'jlpt') {
  studySource.value = source
  if (source === 'textbook') {
    selectedUnit.value = 1
  } else {
    selectedLevel.value = 'all'
  }
}

function switchTab(key: string) {
  activeTab.value = key
  // 直接切到「复习」时，用当前词库构建默认队列
  if (key === 'review' && reviewQueue.value.length === 0) {
    buildReviewQueue()
  }
}

function buildReviewQueue() {
  const queue = todayQueue.value
  reviewQueue.value = shuffleArray([...queue.reviews, ...queue.newWords])
  currentIndex.value = 0
  showingAnswer.value = false
}

function startReview() {
  buildReviewQueue()
  activeTab.value = 'review'
}

function feedback(quality: ReviewQuality) {
  if (!currentWord.value) return
  submitReview(currentWord.value.id, quality).catch((e) => console.error('[review] save error:', e))
  showingAnswer.value = false
  currentIndex.value++
}

function onCardTap() {
  if (showingAnswer.value) return
  showingAnswer.value = true
}
</script>

<style lang="scss" scoped>
.tab-bar {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  border-radius: 12rpx;
  color: #666;

  &.active {
    background: #A3C1AD;
    color: #fff;
    font-weight: 500;
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

/* 词库/级别选择 chip */
.chip-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.chip {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  border: 2rpx solid #e5e5e5;
  background: #fafafa;
  font-size: 26rpx;
  color: #555;

  &.active {
    background: #A3C1AD;
    border-color: #A3C1AD;
    color: #fff;
    font-weight: 500;
  }
}

.chip-badge {
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.08);
}

.chip.active .chip-badge {
  background: rgba(255, 255, 255, 0.3);
}

/* 任务 */
.task-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx;

  &:last-child {
    border-bottom: none;
  }
}

/* 复习卡片 */
.flashcard {
  min-height: 440rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
}

.word-main {
  font-size: 64rpx;
  font-weight: 700;
  color: #2c3e50;
}

.word-meaning {
  font-size: 32rpx;
  color: #666;
}

.word-meta {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
}

.word-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 0 24rpx;
}

.example-ja {
  font-size: 26rpx;
  text-align: center;
  color: #444;
}

.example-zh {
  font-size: 24rpx;
  text-align: center;
  color: #999;
}

.tap-hint {
  font-size: 24rpx;
}

.empty-hint {
  font-size: 24rpx;
  margin-top: 8rpx;
}

/* 浏览列表 */
.search-input {
  width: 100%;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.word-item {
  &.status-mastered {
    border-left: 6rpx solid #27ae60;
  }
  &.status-learning {
    border-left: 6rpx solid #f39c12;
  }
  &.status-new {
    border-left: 6rpx solid #ccc;
  }
}

.word-left {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 12rpx;
}

.word-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #2c3e50;
}

.word-reading {
  font-size: 26rpx;
  color: #A3C1AD;
}

.word-meaning-sm {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
}

.word-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  display: inline-block;
  padding: 2rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  background: #eee;
  color: #666;

  &-status {
    &.status-new {
      background: rgba(150, 150, 150, 0.15);
      color: #888;
    }
    &.status-learning {
      background: rgba(243, 156, 18, 0.15);
      color: #e67e22;
    }
    &.status-mastered {
      background: rgba(39, 174, 96, 0.15);
      color: #27ae60;
    }
  }
}

/* 统计 */
.stats-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 8rpx 0;
}

.stat-box {
  width: 33.33%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #A3C1AD;
}

.stat-name {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.status-bar {
  display: flex;
  flex-direction: row;
  height: 24rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f5f5f5;
}

.status-seg {
  height: 100%;
  transition: width 0.3s;
}

.status-legend {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
  margin-top: 16rpx;
}

.legend-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.legend-text {
  font-size: 24rpx;
  color: #666;
}

.level-table {
  display: flex;
  flex-direction: column;
}

.level-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 26rpx;

  &:last-child {
    border-bottom: none;
  }

  &.header-row {
    font-weight: 600;
    color: #999;
  }
}

.col {
  flex: 1;
  text-align: center;

  &.level {
    flex: 0 0 80rpx;
    font-weight: 600;
  }
}

.flex-1 {
  flex: 1;
}
</style>
