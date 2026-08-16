<template>
  <view class="card">
    <text class="section-title">学习热力图（近 12 周）</text>

    <view class="heatmap">
      <view class="heatmap-row" v-for="row in rows" :key="row.day">
        <text class="day-label">{{ dayLabels[row.day] }}</text>
        <view class="cells">
          <view
            v-for="(cell, i) in row.cells"
            :key="i"
            class="cell"
            :style="{ background: heatColor(cell.count) }"
          ></view>
        </view>
      </view>
    </view>

    <view class="legend">
      <text class="legend-text">少</text>
      <view
        v-for="(c, i) in legendColors"
        :key="i"
        class="legend-cell"
        :style="{ background: c }"
      ></view>
      <text class="legend-text">多</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  getCombinedDailyActivity,
  toHeatmapData,
} from '@/composables/useStudyHistory'

const dayLabels = ['日', '一', '二', '三', '四', '五', '六']
const legendColors = ['#ebedf0', '#d3e4d5', '#a3c1ad', '#7fa88d', '#5a9a6f']

const cells = computed(() => toHeatmapData(getCombinedDailyActivity(84), 12))

/** 按星期分行（0=周日），列=周 */
const rows = computed(() => {
  const result: { day: number; cells: { count: number; date: string }[] }[] = []
  for (let day = 0; day < 7; day++) {
    result.push({
      day,
      cells: cells.value
        .filter((c) => c.weekDay === day)
        .sort((a, b) => a.weekIndex - b.weekIndex),
    })
  }
  return result
})

function heatColor(count: number): string {
  if (count === 0) return legendColors[0]
  if (count <= 2) return legendColors[1]
  if (count <= 5) return legendColors[2]
  if (count <= 10) return legendColors[3]
  return legendColors[4]
}
</script>

<style lang="scss" scoped>
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.heatmap {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.heatmap-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.day-label {
  width: 40rpx;
  font-size: 20rpx;
  color: #999;
  flex-shrink: 0;
}

.cells {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 6rpx;
}

.cell {
  flex: 1;
  height: 24rpx;
  border-radius: 4rpx;
}

.legend {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 6rpx;
  margin-top: 16rpx;
}

.legend-cell {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;
}

.legend-text {
  font-size: 20rpx;
  color: #999;
}
</style>
