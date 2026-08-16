<template>
  <view class="container">
    <view class="header">
      <text class="greeting">こんにちは</text>
      <text class="subtitle">今日も一緒に勉強しましょう</text>
    </view>

    <!-- 今日概览 -->
    <view class="card stats-row">
      <view class="stat-item" v-for="s in statsCards" :key="s.label">
        <text class="stat-num">{{ s.value }}</text>
        <text class="stat-label">{{ s.label }}</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="flex-row" style="gap: 24rpx">
      <view class="card quick-card" @click="goWord">
        <text class="quick-icon">📝</text>
        <text class="quick-text">背单词</text>
      </view>
      <view class="card quick-card" @click="goExercise">
        <text class="quick-icon">✏️</text>
        <text class="quick-text">刷题</text>
      </view>
    </view>

    <!-- 今日任务 -->
    <view class="card">
      <text class="section-title">今日任务</text>
      <view class="task-item flex-between" v-if="todayReviews > 0">
        <text>待复习单词</text>
        <text class="text-primary">{{ todayReviews }} 个</text>
      </view>
      <view class="task-item flex-between">
        <text>新词学习</text>
        <text class="text-primary">{{ todayNewRemaining }} / {{ maxNewPerDay }} 个</text>
      </view>
      <view class="empty-state" v-if="todayReviews === 0 && todayNewRemaining === 0">
        <text class="empty-icon">🎉</text>
        <text>今日任务已完成！</text>
      </view>
      <view
        v-if="todayReviews > 0 || todayNewRemaining > 0"
        class="btn btn-primary mt-base"
        @click="goWord"
      >
        <text>开始学习</text>
      </view>
    </view>

    <!-- 最近动态 -->
    <view class="card">
      <text class="section-title">学习动态</text>
      <view v-if="recentSessions.length === 0" class="empty-state">
        <text>还没有学习记录，开始学习吧～</text>
      </view>
      <view v-for="s in recentSessions" :key="s.date" class="activity-item">
        <text>{{ s.date }}</text>
        <text>练习 {{ s.total }} 题，正确率 {{ s.correctRate }}%</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  getTodayReviews as srsTodayReviews,
  getTodayNewCount,
  getStats,
  MAX_NEW_PER_DAY,
} from '@/composables/useSRS'
import { getRecentSessions } from '@/composables/useExerciseProgress'
import { getAllStudyWords } from '@/api/vocabulary'
import type { Word } from '@/types/japanese'

// 加载全部学习单词（JLPT + 教科书，开发期本地词库）
const allWords = ref<Word[]>(getAllStudyWords())

const stats = computed(() => getStats(allWords.value))

const todayReviews = computed(() => srsTodayReviews(allWords.value, undefined, false).length)
const todayNewCount = computed(() => getTodayNewCount())
const todayNewRemaining = computed(() => Math.max(0, MAX_NEW_PER_DAY - todayNewCount.value))
const maxNewPerDay = MAX_NEW_PER_DAY

const statsCards = computed(() => [
  { label: '待复习', value: todayReviews.value },
  { label: '新词配额', value: todayNewRemaining.value },
  { label: '连续天数', value: stats.value.streakDays },
  { label: '已掌握', value: stats.value.masteredWords },
])

const recentSessions = computed(() => {
  return getRecentSessions(5).map((s) => ({
    ...s,
    correctRate: Math.round((s.correct / s.total) * 100),
  }))
})

// word / exercise 是 tabBar 页面，必须用 switchTab
const goWord = () => uni.switchTab({ url: '/pages/word/word' })
const goExercise = () => uni.switchTab({ url: '/pages/exercise/exercise' })
</script>

<style lang="scss" scoped>
.header {
  padding: 48rpx 0 32rpx;
  text-align: center;
}

.greeting {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  color: #A3C1AD;
  margin-bottom: 8rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #999;
}

.stats-row {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 44rpx;
  font-weight: 700;
  color: #A3C1AD;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.quick-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36rpx 0;
}

.quick-icon {
  font-size: 56rpx;
  margin-bottom: 12rpx;
}

.quick-text {
  font-size: 28rpx;
  font-weight: 500;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.task-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx;

  &:last-child {
    border-bottom: none;
  }
}

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  font-size: 26rpx;
  color: #666;
}
</style>
