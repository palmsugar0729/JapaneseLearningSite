<template>
  <div class="container">
    <!-- ========== 练习设置页 ========== -->
    <div v-if="mode === 'setup'" class="setup-mode">
      <h1 class="title">刷题练习</h1>

      <div class="notice-banner">
        🚧 题库正在建设中，当前仅有少量示例题目。更多题目敬请期待！
      </div>

      <div class="setup-card">
        <div class="setup-item">
          <label>级别</label>
          <div class="option-group">
            <button
              v-for="lv in levelOptions"
              :key="lv.value"
              :class="{ active: settings.level === lv.value }"
              @click="settings.level = lv.value"
            >
              {{ lv.label }}
            </button>
          </div>
        </div>

        <div class="setup-item">
          <label>题型</label>
          <div class="option-group">
            <button
              v-for="tp in typeOptions"
              :key="tp.value"
              :class="{ active: settings.type === tp.value }"
              @click="settings.type = tp.value"
            >
              {{ tp.label }}
            </button>
          </div>
        </div>

        <div class="setup-item">
          <label>题数</label>
          <div class="option-group">
            <button
              v-for="c in countOptions"
              :key="c"
              :class="{ active: settings.count === c }"
              @click="settings.count = c"
            >
              {{ c === 0 ? '全部' : c }}
            </button>
          </div>
        </div>

        <div class="setup-info">
          题库中有 <strong>{{ availableCount }}</strong> 道符合条件的题目
        </div>

        <button class="btn-primary" :disabled="availableCount === 0" @click="startExercise">
          开始练习
        </button>
      </div>

      <!-- 错题本入口 -->
      <div v-if="wrongCount > 0" class="wrong-book">
        <button class="btn-wrong" @click="startWrongExercise">
          📝 错题重练 ({{ wrongCount }})
        </button>
      </div>
    </div>

    <!-- ========== 答题模式 ========== -->
    <div v-else-if="mode === 'quiz'" class="quiz-mode">
      <div class="quiz-header">
        <button class="btn-back" @click="mode = 'setup'">← 退出</button>
        <div class="quiz-progress">{{ currentIndex + 1 }} / {{ exerciseList.length }}</div>
        <div class="quiz-timer">{{ formatTime(elapsedTime) }}</div>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${((currentIndex + 1) / exerciseList.length) * 100}%` }"
        />
      </div>

      <!-- 题目卡片 -->
      <div class="question-card">
        <div class="question-type">{{ typeLabel[currentExercise.type] }}</div>

        <div class="question-text">{{ currentExercise.question }}</div>

        <!-- 选项 -->
        <div class="options">
          <button
            v-for="(opt, i) in currentExercise.options"
            :key="i"
            class="option-btn"
            :class="{
              selected: selectedAnswer === i,
              correct: showAnswer && i === currentExercise.answer,
              wrong: showAnswer && selectedAnswer === i && i !== currentExercise.answer,
            }"
            :disabled="showAnswer"
            @click="selectAnswer(i)"
          >
            <span class="option-label">{{ ['A', 'B', 'C', 'D'][i] }}</span>
            <span class="option-text">{{ opt }}</span>
          </button>
        </div>
      </div>

      <!-- 答案解析（显示答案后） -->
      <div v-if="showAnswer" class="answer-section">
        <div class="answer-result" :class="isCorrect ? 'correct' : 'wrong'">
          {{ isCorrect ? '✅ 正确！' : '❌ 错误' }}
        </div>
        <div class="explanation">
          <strong>解析：</strong>{{ currentExercise.explanation }}
        </div>
        <button class="btn-primary" @click="nextQuestion">
          {{ isLast ? '查看结果' : '下一题' }}
        </button>
      </div>

      <!-- 提交按钮 -->
      <button
        v-else
        class="btn-primary"
        :disabled="selectedAnswer === null"
        @click="submitAnswer"
      >
        提交答案
      </button>
    </div>

    <!-- ========== 结果页 ========== -->
    <div v-else-if="mode === 'result'" class="result-mode">
      <h2>练习完成！</h2>

      <div class="result-score">
        <div class="score-number">{{ accuracy }}%</div>
        <div class="score-detail">
          {{ correctCount }} / {{ exerciseList.length }} 正确
        </div>
        <div class="score-time">⏱️ 用时 {{ formatTime(elapsedTime) }}</div>
      </div>

      <!-- 错题列表 -->
      <div v-if="wrongAnswers.length > 0" class="wrong-list">
        <h3>错题回顾</h3>
        <div v-for="(item, i) in wrongAnswers" :key="i" class="wrong-item">
          <div class="wrong-question">{{ i + 1 }}. {{ item.exercise.question }}</div>
          <div class="wrong-answer">
            正确答案：{{ item.exercise.options[item.exercise.answer] }}
          </div>
          <div class="wrong-explanation">{{ item.exercise.explanation }}</div>
        </div>
      </div>

      <div v-else class="perfect">🎉 全对！太棒了！</div>

      <div class="result-actions">
        <button class="btn-primary" @click="mode = 'setup'">
          再来一组
        </button>
        <button
          v-if="wrongAnswers.length > 0"
          class="btn-secondary"
          @click="startWrongExercise"
        >
          错题重练
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Exercise, JLPTLevel, ExerciseType } from '../types/japanese'
import {
  getExercisesByLevelAndType,
  shuffleExercises,
  getExerciseById,
} from '../api/exercise'
import {
  recordAnswer,
  getWrongList,
  getWrongCount,
  saveSession,
} from '../composables/useExerciseProgress'

// ========== 状态 ==========

type QuizMode = 'setup' | 'quiz' | 'result'

const mode = ref<QuizMode>('setup')

const settings = ref({
  level: 'mixed' as JLPTLevel | 'mixed',
  type: 'mixed' as ExerciseType | 'mixed',
  count: 10,
})

const exerciseList = ref<Exercise[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const showAnswer = ref(false)
const correctCount = ref(0)
const wrongAnswers = ref<{ exercise: Exercise; selected: number }[]>([])
const startTime = ref(0)
const elapsedTime = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

// ========== 选项配置 ==========

const levelOptions = [
  { value: 'mixed' as const, label: '混合' },
  { value: 'N5' as const, label: 'N5' },
  { value: 'N4' as const, label: 'N4' },
  { value: 'N3' as const, label: 'N3' },
  { value: 'N2' as const, label: 'N2' },
  { value: 'N1' as const, label: 'N1' },
]

const typeOptions = [
  { value: 'mixed' as const, label: '混合' },
  { value: 'choice' as const, label: '语法选择' },
  { value: 'translation' as const, label: '翻译' },
]

const countOptions = [5, 10, 20, 0]

const typeLabel: Record<ExerciseType, string> = {
  choice: '语法选择',
  translation: '翻译',
}

// ========== 计算属性 ==========

const availableCount = computed(() => {
  return getExercisesByLevelAndType(
    settings.value.level,
    settings.value.type
  ).length
})

const currentExercise = computed(() => exerciseList.value[currentIndex.value])

const isCorrect = computed(() => {
  return selectedAnswer.value === currentExercise.value?.answer
})

const isLast = computed(() => {
  return currentIndex.value >= exerciseList.value.length - 1
})

const accuracy = computed(() => {
  if (exerciseList.value.length === 0) return 0
  return Math.round((correctCount.value / exerciseList.value.length) * 100)
})

const wrongCount = computed(() => getWrongCount())

// ========== 方法 ==========

function startExercise() {
  let exercises = getExercisesByLevelAndType(
    settings.value.level,
    settings.value.type
  )

  if (exercises.length === 0) return

  exercises = shuffleExercises(exercises)

  if (settings.value.count > 0) {
    exercises = exercises.slice(0, settings.value.count)
  }

  exerciseList.value = exercises
  currentIndex.value = 0
  selectedAnswer.value = null
  showAnswer.value = false
  correctCount.value = 0
  wrongAnswers.value = []
  startTime.value = Date.now()
  elapsedTime.value = 0
  mode.value = 'quiz'

  // 启动计时器
  timerInterval = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

function startWrongExercise() {
  const wrongIds = getWrongList()
  if (wrongIds.length === 0) return

  const exercises = wrongIds
    .map((id) => getExerciseById(id))
    .filter((ex): ex is Exercise => ex !== undefined)

  if (exercises.length === 0) return

  exerciseList.value = shuffleExercises(exercises)
  currentIndex.value = 0
  selectedAnswer.value = null
  showAnswer.value = false
  correctCount.value = 0
  wrongAnswers.value = []
  startTime.value = Date.now()
  elapsedTime.value = 0
  mode.value = 'quiz'

  timerInterval = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

function selectAnswer(index: number) {
  if (showAnswer.value) return
  selectedAnswer.value = index
}

function submitAnswer() {
  if (selectedAnswer.value === null) return

  const exercise = currentExercise.value
  const isRight = selectedAnswer.value === exercise.answer

  showAnswer.value = true

  if (isRight) {
    correctCount.value++
  } else {
    wrongAnswers.value.push({
      exercise,
      selected: selectedAnswer.value,
    })
  }

  // 记录到错题本（异步保存，不阻塞 UI）
  recordAnswer(exercise.id, isRight).catch((e) => console.error('[exercise] record error:', e))
}

function nextQuestion() {
  if (isLast.value) {
    finishExercise()
  } else {
    currentIndex.value++
    selectedAnswer.value = null
    showAnswer.value = false
  }
}

function finishExercise() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  // 保存练习记录（异步，不阻塞 UI）
  saveSession({
    date: new Date().toISOString(),
    total: exerciseList.value.length,
    correct: correctCount.value,
    duration: elapsedTime.value,
    level: settings.value.level,
    type: settings.value.type,
  })

  mode.value = 'result'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ========== 生命周期 ==========

onMounted(() => {
  // 组件挂载时无特殊操作
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped lang="scss">
@use "sass:color";

$primary: #a3c1ad;
$primary-dark: color.adjust($primary, $lightness: -10%);
$text-main: #2c3e50;
$bg-glass: rgba(255, 255, 255, 0.75);
$shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px;
}

.title {
  text-align: center;
  margin-bottom: 16px;
  font-size: 28px;
}

.notice-banner {
  background: rgba(255, 217, 61, 0.15);
  border: 1px solid rgba(255, 217, 61, 0.3);
  border-radius: 10px;
  padding: 10px 16px;
  text-align: center;
  font-size: 13px;
  margin-bottom: 20px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

// ========== 设置页 ==========

.setup-card {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: $shadow;
  margin-bottom: 16px;
}

.setup-item {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 10px;
    opacity: 0.8;
  }
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.8);
    }

    &.active {
      background: $primary;
      color: white;
      border-color: $primary;
      box-shadow: 0 2px 8px rgba(163, 193, 173, 0.4);
    }
  }
}

.setup-info {
  text-align: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
}

.wrong-book {
  text-align: center;
}

.btn-wrong {
  padding: 12px 24px;
  border-radius: 999px;
  border: none;
  background: #ff6b6b;
  color: white;
  cursor: pointer;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
  }
}

// ========== 按钮 ==========

.btn-primary {
  width: 100%;
  padding: 14px 24px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  background: linear-gradient(135deg, color.adjust($primary, $lightness: 6%), $primary-dark);
  color: $text-main;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: $bg-glass;
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.btn-back {
  background: transparent;
  border: none;
  color: $text-main;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 0;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
}

// ========== 答题模式 ==========

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.quiz-progress {
  font-size: 14px;
  opacity: 0.6;
}

.quiz-timer {
  font-size: 14px;
  font-family: monospace;
  opacity: 0.7;
}

.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary, $primary-dark);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.question-card {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: $shadow;
}

.question-type {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(163, 193, 173, 0.25);
  font-size: 13px;
  margin-bottom: 12px;
}

.question-text {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 20px;
  white-space: pre-line;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.8);
    transform: translateX(4px);
  }

  &.selected {
    border-color: $primary;
    background: rgba(163, 193, 173, 0.15);
  }

  &.correct {
    border-color: #6bcb77;
    background: rgba(107, 203, 119, 0.15);
  }

  &.wrong {
    border-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.15);
  }

  &:disabled {
    cursor: default;
  }
}

.option-label {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  font-size: 13px;
  font-weight: bold;
  flex-shrink: 0;
}

.option-text {
  font-size: 15px;
  line-height: 1.4;
}

// ========== 答案解析 ==========

.answer-section {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: $shadow;
  margin-bottom: 16px;

  .answer-result {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 12px;

    &.correct {
      color: #6bcb77;
    }

    &.wrong {
      color: #ff6b6b;
    }
  }

  .explanation {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 10px;
  }
}

// ========== 结果页 ==========

.result-mode {
  text-align: center;
  padding: 20px 0;

  h2 {
    margin-bottom: 24px;
  }
}

.result-score {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: $shadow;

  .score-number {
    font-size: 56px;
    font-weight: bold;
    color: $primary-dark;
    margin-bottom: 8px;
  }

  .score-detail {
    font-size: 16px;
    opacity: 0.8;
    margin-bottom: 8px;
  }

  .score-time {
    font-size: 14px;
    opacity: 0.6;
  }
}

.wrong-list {
  text-align: left;
  margin-bottom: 24px;

  h3 {
    text-align: center;
    margin-bottom: 16px;
  }
}

.wrong-item {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .wrong-question {
    font-size: 15px;
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .wrong-answer {
    color: #6bcb77;
    font-weight: 500;
    margin-bottom: 4px;
    font-size: 14px;
  }

  .wrong-explanation {
    font-size: 13px;
    opacity: 0.7;
    line-height: 1.5;
  }
}

.perfect {
  font-size: 20px;
  margin-bottom: 24px;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ========== 响应式 ==========

@media (min-width: 600px) {
  .result-actions {
    flex-direction: row;
    justify-content: center;

    .btn-primary,
    .btn-secondary {
      width: auto;
      min-width: 160px;
    }
  }
}
</style>
