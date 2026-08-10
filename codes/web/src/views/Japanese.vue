<template>
  <div class="container">
    <h1 class="title">日语学习</h1>

    <!-- 今日概览 -->
    <div class="overview-section">
      <p class="greeting">{{ greeting }}，今日学习计划已就绪！</p>

      <div class="overview-cards">
        <div class="overview-card">
          <div class="overview-icon">📚</div>
          <div class="overview-number">{{ todayReviewCount }}</div>
          <div class="overview-label">今日待复习单词</div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">✏️</div>
          <div class="overview-number">{{ todayExerciseCount }}</div>
          <div class="overview-label">推荐练习题</div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">🔥</div>
          <div class="overview-number">{{ streakDays }}</div>
          <div class="overview-label">连续学习(天)</div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-links">
      <div class="link-card vocabulary" @click="goTo('/word')">
        <div class="link-icon">📝</div>
        <div class="link-content">
          <h3>背单词</h3>
          <p>使用 SRS 间隔重复算法，高效记忆日语单词</p>
        </div>
        <div class="link-arrow">→</div>
      </div>

      <div class="link-card exercise" @click="goTo('/exercise')">
        <div class="link-icon">✏️</div>
        <div class="link-content">
          <h3>刷题练习</h3>
          <p>语法选择、翻译题，按 JLPT 级别针对性练习</p>
        </div>
        <div class="link-arrow">→</div>
      </div>
    </div>

    <!-- 最近动态 -->
    <div v-if="recentActivity.length > 0" class="activity-section">
      <h3>📈 最近学习动态</h3>
      <div class="activity-list">
        <div
          v-for="(activity, i) in recentActivity"
          :key="i"
          class="activity-item"
        >
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-text">{{ activity.text }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAllWords } from '../api/vocabulary'
import { getAllExercises } from '../api/exercise'
import { getTodayQueue, getStats } from '../composables/useSRS'
import { getRecentSessions } from '../composables/useExerciseProgress'

const router = useRouter()
const allWords = ref(getAllWords())

// ========== 计算属性 ==========

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const todayReviewCount = computed(() => {
  const queue = getTodayQueue(allWords.value)
  return queue.reviews.length + queue.newWords.length
})

const todayExerciseCount = computed(() => {
  // 返回 N5 题目数量作为推荐值
  return getAllExercises().filter((ex) => ex.level === 'N5').length
})

const streakDays = computed(() => {
  return getStats(allWords.value).streakDays
})

const recentActivity = computed(() => {
  const activities: { icon: string; text: string }[] = []

  // 最近练习记录
  const sessions = getRecentSessions(3)
  if (sessions.length > 0) {
    const latest = sessions[0]
    const accuracy = Math.round((latest.correct / latest.total) * 100)
    activities.push({
      icon: '✏️',
      text: `最近练习正确率 ${accuracy}%（${latest.correct}/${latest.total}）`,
    })
  }

  // 最近复习情况
  const stats = getStats(allWords.value)
  if (stats.masteredWords > 0) {
    activities.push({
      icon: '📚',
      text: `已累计掌握 ${stats.masteredWords} 个单词`,
    })
  }

  // 连续学习天数
  if (stats.streakDays > 0) {
    activities.push({
      icon: '🔥',
      text: `连续学习 ${stats.streakDays} 天，继续保持！`,
    })
  }

  return activities
})

// ========== 方法 ==========

function goTo(path: string) {
  router.push(path)
}

</script>

<style scoped lang="scss">
@use "sass:color";

$primary: #a3c1ad;
$primary-dark: color.adjust($primary, $lightness: -10%);
$text-main: #2c3e50;
$bg-glass: rgba(255, 255, 255, 0.75);
$shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
}

.title {
  margin-bottom: 20px;
  font-size: 28px;
}

// ========== 概览区 ==========

.overview-section {
  margin-bottom: 24px;
}

.greeting {
  font-size: 16px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.overview-card {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 16px 8px;
  text-align: center;
  box-shadow: $shadow;

  .overview-icon {
    font-size: 28px;
    margin-bottom: 6px;
  }

  .overview-number {
    font-size: 24px;
    font-weight: bold;
    color: $primary-dark;
    margin-bottom: 2px;
  }

  .overview-label {
    font-size: 12px;
    opacity: 0.7;
  }
}

// ========== 快捷入口 ==========

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: $shadow;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }

  .link-icon {
    font-size: 36px;
    flex-shrink: 0;
  }

  .link-content {
    flex: 1;

    h3 {
      font-size: 18px;
      margin-bottom: 4px;
    }

    p {
      font-size: 13px;
      opacity: 0.7;
      line-height: 1.4;
    }
  }

  .link-arrow {
    font-size: 24px;
    opacity: 0.4;
    transition: all 0.2s ease;
  }

  &:hover .link-arrow {
    opacity: 0.8;
    transform: translateX(4px);
  }

  &.vocabulary {
    border-left: 4px solid #6bcb77;
  }

  &.exercise {
    border-left: 4px solid #4d96ff;
  }
}

// ========== 最近动态 ==========

.activity-section {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: $shadow;

  h3 {
    margin-bottom: 12px;
    font-size: 16px;
  }
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;

  .activity-icon {
    font-size: 20px;
  }

  .activity-text {
    font-size: 14px;
    opacity: 0.85;
  }
}


// ========== 响应式 ==========

@media (min-width: 600px) {
  .overview-cards {
    gap: 16px;
  }

  .overview-card {
    padding: 20px;

    .overview-number {
      font-size: 32px;
    }

    .overview-label {
      font-size: 14px;
    }
  }

  .quick-links {
    flex-direction: row;

    .link-card {
      flex: 1;
    }
  }
}
</style>
