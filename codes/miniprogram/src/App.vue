<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('[JapaneseLearning] App Launch')
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
