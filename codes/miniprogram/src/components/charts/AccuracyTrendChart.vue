<template>
  <view class="card">
    <text class="section-title">练习正确率趋势（近 30 天）</text>

    <view v-if="hasData" class="trend">
      <view class="bar-col" v-for="(t, i) in trend" :key="i">
        <view class="bar-wrap">
          <view
            class="bar"
            :style="{ height: (t.total > 0 ? Math.max(t.accuracy, 4) : 2) + '%' }"
          ></view>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">📊</text>
      <text>还没有练习记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAccuracyTrend } from '@/composables/useStudyHistory'

const trend = computed(() => getAccuracyTrend(30))
const hasData = computed(() => trend.value.some((t) => t.total > 0))
</script>

<style lang="scss" scoped>
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.trend {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 4rpx;
  height: 240rpx;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.bar-wrap {
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 100%;
  background: #A3C1AD;
  border-radius: 4rpx 4rpx 0 0;
  min-height: 4rpx;
  transition: height 0.3s;
}
</style>
