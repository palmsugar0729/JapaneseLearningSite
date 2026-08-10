<template>
  <div class="chart-wrapper">
    <h4 class="chart-title">📈 练习正确率趋势（近 30 天）</h4>
    <v-chart v-if="hasData" :option="option" :autoresize="true" class="chart" />
    <div v-else class="empty-tip">还没有练习数据，去做几道题吧！</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { AccuracyTrend } from '../../composables/useStudyHistory'

use([LineChart, TooltipComponent, GridComponent, CanvasRenderer])

const props = defineProps<{
  trend: AccuracyTrend[]
}>()

const hasData = computed(() => props.trend.some((d) => d.total > 0))

const option = computed(() => {
  const dates = props.trend.map((d) => d.date.slice(5)) // MM-DD
  const accuracies = props.trend.map((d) => (d.total > 0 ? d.accuracy : null))

  return {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: { data: number | null; axisValue: string }[]) => {
        const val = params[0]?.data
        if (val === null || val === undefined) return `${params[0]?.axisValue}<br/>无数据`
        return `${params[0]?.axisValue}<br/>正确率: ${val}%`
      },
    },
    grid: {
      left: 10,
      right: 20,
      top: 20,
      bottom: 20,
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLabel: {
        fontSize: 11,
        interval: Math.floor(dates.length / 6),
      },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: 'value' as const,
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: { color: 'rgba(0,0,0,0.06)' },
      },
    },
    series: [
      {
        type: 'line' as const,
        data: accuracies,
        smooth: true,
        connectNulls: false,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#6bcb77', width: 2 },
        itemStyle: { color: '#6bcb77' },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(107,203,119,0.25)' },
              { offset: 1, color: 'rgba(107,203,119,0.02)' },
            ],
          },
        },
        markLine: {
          silent: true,
          data: [
            {
              yAxis: 60,
              lineStyle: { color: 'rgba(0,0,0,0.15)', type: 'dashed' as const },
              label: { formatter: '60%', fontSize: 10 },
            },
          ],
        },
      },
    ],
  }
})
</script>

<style scoped lang="scss">
.chart-wrapper {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 16px;
  margin-bottom: 8px;
}

.chart {
  height: 240px;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  opacity: 0.5;
  font-size: 14px;
}
</style>
