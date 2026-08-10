<template>
  <view class="container">
    <!-- 顶部切换栏 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- Dashboard 模式 -->
    <view v-if="activeTab === 'dashboard'">
      <view class="card">
        <text class="section-title">级别进度</text>
        <view v-for="lp in levelProgress" :key="lp.level" class="level-row">
          <view class="flex-between mb-sm">
            <text class="tag tag-level">{{ lp.level }}</text>
            <text class="text-sm text-secondary">{{ lp.mastered }} / {{ lp.total }}</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPct(lp) + '%' }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 复习模式 -->
    <view v-if="activeTab === 'review'">
      <view v-if="currentWord" class="card" style="min-height: 400rpx">
        <view class="flex-center" style="flex-direction: column; height: 100%">
          <text class="word-main">{{ showingAnswer ? currentWord.reading : currentWord.word }}</text>
          <text v-if="showingAnswer" class="word-meaning mt-base">{{ currentWord.meaning }}</text>
          <text v-if="showingAnswer && currentWord.example" class="word-example mt-sm text-secondary">
            {{ currentWord.example }}
          </text>
          <text class="tap-hint mt-lg text-secondary">
            {{ showingAnswer ? '' : '点击卡片查看答案' }}
          </text>
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

      <view v-if="!currentWord" class="empty-state">
        <text class="empty-icon">🎉</text>
        <text>今日复习完成！</text>
      </view>
    </view>

    <!-- 浏览模式 -->
    <view v-if="activeTab === 'browse'">
      <view class="card">
        <text>单词浏览 — 开发中</text>
      </view>
    </view>

    <!-- 统计模式 -->
    <view v-if="activeTab === 'stats'">
      <view class="card">
        <text>学习统计 — 开发中</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getTodayQueue, submitReview } from '@/composables/useSRS'
import { getLevelProgress } from '@/composables/useSRS'
import type { Word, ReviewQuality } from '@/types/japanese'

const tabs = [
  { key: 'dashboard', label: '概览' },
  { key: 'review', label: '复习' },
  { key: 'browse', label: '浏览' },
  { key: 'stats', label: '统计' },
]

const activeTab = ref('dashboard')
const showingAnswer = ref(false)
const currentIndex = ref(0)
const queue = ref<Word[]>([])
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allWords = ref<Word[]>([])

const levelProgress = computed(() => getLevelProgress(allWords.value))

const currentWord = computed(() => {
  if (currentIndex.value >= queue.value.length) return null
  return queue.value[currentIndex.value]
})

function progressPct(lp: { mastered: number; total: number }): number {
  if (lp.total === 0) return 0
  return Math.round((lp.mastered / lp.total) * 100)
}

function goReview() {
  const { reviews, newWords } = getTodayQueue(allWords.value)
  queue.value = [...reviews, ...newWords]
  currentIndex.value = 0
  showingAnswer.value = false
  activeTab.value = 'review'
}

function feedback(quality: ReviewQuality) {
  if (!currentWord.value) return
  submitReview(currentWord.value.id, quality)
  showingAnswer.value = false
  currentIndex.value++
}

// 点击卡片翻卡
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
  margin-bottom: 24rpx;
  display: block;
}

.level-row {
  margin-bottom: 20rpx;
}

.progress-bar {
  height: 12rpx;
  background: #eee;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #A3C1AD;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.word-main {
  font-size: 56rpx;
  font-weight: 700;
  color: #2c3e50;
}

.word-meaning {
  font-size: 32rpx;
  color: #666;
}

.word-example {
  font-size: 26rpx;
  text-align: center;
  padding: 0 32rpx;
}

.tap-hint {
  font-size: 24rpx;
}

.flex-1 {
  flex: 1;
}
</style>
