<template>
  <div class="chart-wrapper">
    <h4 class="chart-title">📊 各级别掌握情况</h4>
    <v-chart :option="option" :autoresize="true" class="chart" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { LevelProgress } from '../../types/japanese'

use([BarChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  levelProgress: LevelProgress[]
}>()

const option = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: { type: 'shadow' as const },
    formatter: (params: { seriesName: string; value: number; color: string; axisValue?: string }[]) => {
      let html = params[0]?.axisValue || params[0]?.seriesName || ''
      let total = 0
      for (const p of params) {
        html += `<br/><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px"></span>${p.seriesName}: ${p.value}`
        total += p.value
      }
      html += `<br/>总计: ${total}`
      return html
    },
  },
  legend: {
    bottom: 0,
    data: ['已掌握', '学习中', '未学'],
    textStyle: { fontSize: 12 },
  },
  grid: {
    left: 10,
    right: 20,
    top: 10,
    bottom: 40,
    containLabel: true,
  },
  xAxis: {
    type: 'category' as const,
    data: props.levelProgress.map((lp) => lp.level),
    axisLabel: { fontWeight: 'bold', fontSize: 13 },
  },
  yAxis: {
    type: 'value' as const,
    splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
  },
  series: [
    {
      name: '已掌握',
      type: 'bar' as const,
      stack: 'total',
      data: props.levelProgress.map((lp) => lp.mastered),
      itemStyle: { color: '#6bcb77', borderRadius: [0, 0, 0, 0] },
      emphasis: { focus: 'series' as const },
    },
    {
      name: '学习中',
      type: 'bar' as const,
      stack: 'total',
      data: props.levelProgress.map((lp) => lp.learning),
      itemStyle: { color: '#ffd93d' },
      emphasis: { focus: 'series' as const },
    },
    {
      name: '未学',
      type: 'bar' as const,
      stack: 'total',
      data: props.levelProgress.map((lp) => lp.new),
      itemStyle: {
        color: 'rgba(0,0,0,0.08)',
        borderRadius: [6, 6, 0, 0],
      },
      emphasis: { focus: 'series' as const },
    },
  ],
}))
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
  height: 260px;
}
</style>
