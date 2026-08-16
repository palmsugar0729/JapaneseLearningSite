<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { getToken } from '@/api/client'
import { initSRSFromServer } from '@/composables/useSRS'
import { initExerciseFromServer } from '@/composables/useExerciseProgress'

onLaunch(() => {
  console.log('[JapaneseLearning] App Launch')

  // 已登录时恢复服务端学习进度（失败自动回退本地存储）
  if (getToken()) {
    initSRSFromServer().catch((e) => console.warn('[App] initSRSFromServer:', e))
    initExerciseFromServer().catch((e) => console.warn('[App] initExerciseFromServer:', e))
  }
})

onShow(() => {
  console.log('[JapaneseLearning] App Show')
})

onHide(() => {
  console.log('[JapaneseLearning] App Hide')
})
</script>

<style lang="scss">
@import '@/styles/theme.scss';
@import '@/styles/global.scss';
</style>
