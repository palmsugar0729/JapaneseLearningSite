<template>
  <div class="chart-wrapper">
    <h4 class="chart-title">📅 学习热力图（近 12 周）</h4>
    <v-chart :option="option" :autoresize="true" class="chart" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import {
  TooltipComponent,
  VisualMapComponent,
  CalendarComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { DailyActivity } from '../../composables/useStudyHistory'

use([HeatmapChart, TooltipComponent, VisualMapComponent, CalendarComponent, CanvasRenderer])

const props = defineProps<{
  dailyActivity: DailyActivity[]
}>()

const option = computed(() => {
  // 取最近 84 天（12 周）的数据
  const data = props.dailyActivity.slice(-84)

  const seriesData = data.map((d) => {
    const total = d.reviews + d.exercises
    return total > 0 ? [d.date, total] : [d.date, 0]
  })

  const maxCount = Math.max(...data.map((d) => d.reviews + d.exercises), 1)

  const today = new Date()
  const endDate = today.toISOString().split('T')[0]
  const start = new Date(today)
  start.setDate(start.getDate() - 83)
  const startDate = start.toISOString().split('T')[0]

  return {
    tooltip: {
      position: 'top',
      formatter: (params: { data: [string, number] }) => {
        const [date, _count] = params.data
        // 计算当日复习数和练习数
        const day = data.find((d) => d.date === date)
        const reviews = day?.reviews || 0
        const exercises = day?.exercises || 0
        return `${date}<br/>📝 复习 ${reviews} 词 &nbsp; ✏️ 练习 ${exercises} 题`
      },
    },
    visualMap: {
      min: 0,
      max: maxCount,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      pieces: [
        { min: 0, max: 0, color: '#ebedf0' },
        { min: 1, max: Math.max(1, Math.ceil(maxCount * 0.25)), color: '#c6e48b' },
        { min: Math.ceil(maxCount * 0.25) + 1, max: Math.ceil(maxCount * 0.5), color: '#7bc96f' },
        { min: Math.ceil(maxCount * 0.5) + 1, max: Math.ceil(maxCount * 0.75), color: '#239a3b' },
        { min: Math.ceil(maxCount * 0.75) + 1, max: maxCount, color: '#196127' },
      ],
    },
    calendar: {
      top: 20,
      left: 30,
      right: 20,
      cellSize: ['auto', 14],
      range: [startDate, endDate],
      splitLine: { show: false },
      itemStyle: {
        borderWidth: 3,
        borderColor: '#fff',
        borderRadius: 3,
      },
      dayLabel: {
        firstDay: 1,
        nameMap: ['日', '一', '二', '三', '四', '五', '六'],
      },
      monthLabel: {
        nameMap: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: seriesData,
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
  height: 200px;
}
</style>
