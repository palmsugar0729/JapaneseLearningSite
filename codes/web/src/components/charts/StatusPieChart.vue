<template>
  <div class="chart-wrapper">
    <h4 class="chart-title">🍩 学习状态分布</h4>
    <v-chart :option="option" :autoresize="true" class="chart" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { LearningStats } from '../../types/japanese'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  stats: LearningStats
}>()

const option = computed(() => ({
  tooltip: {
    trigger: 'item' as const,
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    bottom: 0,
    textStyle: { fontSize: 12 },
  },
  series: [
    {
      type: 'pie' as const,
      radius: ['50%', '74%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 3,
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      data: [
        {
          value: props.stats.masteredWords,
          name: '已掌握',
          itemStyle: { color: '#6bcb77' },
        },
        {
          value: props.stats.learningWords,
          name: '学习中',
          itemStyle: { color: '#ffd93d' },
        },
        {
          value: props.stats.newWords,
          name: '未学',
          itemStyle: { color: 'rgba(0,0,0,0.1)' },
        },
      ],
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
  height: 100%;
}

.chart-title {
  font-size: 16px;
  margin-bottom: 8px;
}

.chart {
  height: 240px;
}
</style>
