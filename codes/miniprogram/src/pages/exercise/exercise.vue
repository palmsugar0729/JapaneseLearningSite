<template>
  <view class="container">
    <!-- 顶部切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- ========== 设置模式 ========== -->
    <view v-if="activeTab === 'setup'">
      <view class="card notice">
        <text>🚧 题库正在建设中，当前仅有少量示例题目</text>
      </view>

      <view class="card">
        <text class="section-title">练习设置</text>
        <view class="setting-row flex-between">
          <text>级别</text>
          <picker :range="levelLabels" :value="levelIndex" @change="onLevelChange">
            <text class="picker-value">{{ levelLabels[levelIndex] }}</text>
          </picker>
        </view>
        <view class="setting-row flex-between">
          <text>题型</text>
          <picker :range="typeLabels" :value="typeIndex" @change="onTypeChange">
            <text class="picker-value">{{ typeLabels[typeIndex] }}</text>
          </picker>
        </view>
        <view class="setting-row flex-between">
          <text>题目数量</text>
          <picker :range="countOptions" :value="countIndex" @change="onCountChange">
            <text class="picker-value">{{ countOptions[countIndex] }} 题</text>
          </picker>
        </view>

        <view class="setup-info">
          <text>题库中有 {{ availableCount }} 道符合条件的题目</text>
        </view>

        <view
          class="btn btn-primary"
          :class="{ disabled: availableCount === 0 }"
          @click="startExercise"
        >
          <text>开始练习</text>
        </view>
      </view>

      <view class="card flex-between" v-if="wrongCount > 0" @click="startWrongExercise">
        <text>📝 错题本</text>
        <text class="text-primary">{{ wrongCount }} 题</text>
      </view>
    </view>

    <!-- ========== 答题模式 ========== -->
    <view v-if="activeTab === 'quiz'">
      <view class="flex-between mb-base">
        <text class="text-sm text-secondary" @click="exitQuiz">退出</text>
        <text class="text-sm text-secondary">第 {{ currentQ + 1 }} / {{ totalQ }} 题</text>
        <text class="text-sm text-secondary">{{ formatTime(elapsed) }}</text>
      </view>

      <view class="progress-bar mb-base">
        <view class="progress-fill" :style="{ width: progressPct + '%' }"></view>
      </view>

      <view class="card">
        <text class="type-tag">{{ typeLabel }}</text>
        <text class="question-text">{{ currentExercise?.question }}</text>
      </view>

      <view class="options">
        <view
          v-for="(opt, i) in currentExercise?.options || []"
          :key="i"
          class="card option-item"
          :class="optionClass(i)"
          @click="selectOption(i)"
        >
          <text class="option-letter">{{ letters[i] }}</text>
          <text class="option-text">{{ opt }}</text>
        </view>
      </view>

      <!-- 答案解析 -->
      <view v-if="answered" class="card card-tinted">
        <text class="answer-result" :class="isCorrect ? 'correct' : 'wrong'">
          {{ isCorrect ? '✅ 正确！' : '❌ 错误' }}
        </text>
        <text class="explanation">解析：{{ currentExercise?.explanation }}</text>
        <view class="btn btn-primary mt-base" @click="nextQuestion">
          <text>{{ currentQ + 1 >= totalQ ? '查看结果' : '下一题' }}</text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view
        v-else
        class="btn btn-primary mt-lg"
        :class="{ disabled: selectedOption === -1 }"
        @click="submitAnswer"
      >
        <text>提交答案</text>
      </view>
    </view>

    <!-- ========== 结果模式 ========== -->
    <view v-if="activeTab === 'result'">
      <view class="card flex-center" style="flex-direction: column">
        <text class="result-score">{{ accuracy }}%</text>
        <text class="text-lg mt-sm">{{ correctCount }} / {{ totalQ }} 正确</text>
        <text class="text-sm text-secondary mt-sm">⏱️ 用时 {{ formatTime(totalTime) }}</text>
      </view>

      <!-- 错题回顾 -->
      <view v-if="wrongAnswers.length > 0" class="card">
        <text class="section-title">错题回顾</text>
        <view v-for="(item, i) in wrongAnswers" :key="i" class="wrong-item">
          <text class="wrong-q">{{ i + 1 }}. {{ item.exercise.question }}</text>
          <text class="wrong-a">正确答案：{{ item.exercise.options[item.exercise.answer] }}</text>
          <text class="wrong-e">{{ item.exercise.explanation }}</text>
        </view>
      </view>

      <view v-else class="card flex-center">
        <text class="empty-icon">🎉</text>
        <text>全对！太棒了！</text>
      </view>

      <view class="btn btn-primary" @click="activeTab = 'setup'">
        <text>再来一组</text>
      </view>
      <view
        v-if="wrongAnswers.length > 0"
        class="btn btn-outline mt-base"
        @click="startWrongExercise"
      >
        <text>错题重练</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import type { Exercise, JLPTLevel, ExerciseType } from '@/types/japanese'
import {
  getExercisesByLevelAndType,
  shuffleExercises,
  getExerciseById,
} from '@/api/exercise'
import {
  recordAnswer,
  getWrongList,
  getWrongCount,
  saveSession,
} from '@/composables/useExerciseProgress'

const tabs = [
  { key: 'setup', label: '练习' },
  { key: 'quiz', label: '答题' },
  { key: 'result', label: '结果' },
]

const activeTab = ref('setup')

// ========== 设置 ==========
const levelOptions = [
  { value: 'mixed' as const, label: '全部' },
  { value: 'N5' as const, label: 'N5' },
  { value: 'N4' as const, label: 'N4' },
  { value: 'N3' as const, label: 'N3' },
  { value: 'N2' as const, label: 'N2' },
  { value: 'N1' as const, label: 'N1' },
]
const typeOptions = [
  { value: 'mixed' as const, label: '混合' },
  { value: 'choice' as const, label: '选择题' },
  { value: 'translation' as const, label: '翻译题' },
]
const countOptions = [5, 10, 15, 20]

const levelLabels = levelOptions.map((o) => o.label)
const typeLabels = typeOptions.map((o) => o.label)

const levelIndex = ref(0)
const typeIndex = ref(0)
const countIndex = ref(1)

const settings = computed(() => ({
  level: levelOptions[levelIndex.value].value,
  type: typeOptions[typeIndex.value].value,
  count: countOptions[countIndex.value],
}))

const availableCount = computed(() => {
  return getExercisesByLevelAndType(settings.value.level, settings.value.type).length
})

// ========== 答题状态 ==========
const exercises = ref<Exercise[]>([])
const currentQ = ref(0)
const totalQ = ref(0)
const correctCount = ref(0)
const wrongAnswers = ref<{ exercise: Exercise; selected: number }[]>([])
const selectedOption = ref(-1)
const answered = ref(false)
const startTime = ref(0)
const elapsed = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const letters = ['A', 'B', 'C', 'D']

const wrongCount = computed(() => getWrongCount())

const currentExercise = computed(() => exercises.value[currentQ.value])
const isCorrect = computed(() => selectedOption.value === currentExercise.value?.answer)
const progressPct = computed(() => {
  if (totalQ.value === 0) return 0
  return Math.round(((currentQ.value + 1) / totalQ.value) * 100)
})
const totalTime = computed(() => Math.floor((Date.now() - startTime.value) / 1000))
const accuracy = computed(() => {
  if (totalQ.value === 0) return 0
  return Math.round((correctCount.value / totalQ.value) * 100)
})
const typeLabel = computed(() => {
  return currentExercise.value?.type === 'translation' ? '翻译' : '语法选择'
})

// ========== 设置交互 ==========
function onLevelChange(e: any) { levelIndex.value = Number(e.detail.value) }
function onTypeChange(e: any) { typeIndex.value = Number(e.detail.value) }
function onCountChange(e: any) { countIndex.value = Number(e.detail.value) }

// ========== 答题流程 ==========

function startTimer() {
  stopTimer()
  startTime.value = Date.now()
  elapsed.value = 0
  timer = setInterval(() => {
    elapsed.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function resetQuizState(list: Exercise[]) {
  exercises.value = list
  totalQ.value = list.length
  currentQ.value = 0
  correctCount.value = 0
  wrongAnswers.value = []
  selectedOption.value = -1
  answered.value = false
}

function startExercise() {
  if (availableCount.value === 0) return

  let list = getExercisesByLevelAndType(settings.value.level, settings.value.type)
  list = shuffleExercises(list, settings.value.count)

  resetQuizState(list)
  startTimer()
  activeTab.value = 'quiz'
}

function startWrongExercise() {
  const wrongIds = getWrongList()
  if (wrongIds.length === 0) return

  const list = wrongIds
    .map((id) => getExerciseById(id))
    .filter((ex): ex is Exercise => ex !== undefined)

  if (list.length === 0) return

  resetQuizState(shuffleExercises(list))
  startTimer()
  activeTab.value = 'quiz'
}

function selectOption(i: number) {
  if (answered.value) return
  selectedOption.value = i
}

function submitAnswer() {
  if (selectedOption.value === -1 || answered.value) return
  const exercise = currentExercise.value
  if (!exercise) return

  answered.value = true

  if (isCorrect.value) {
    correctCount.value++
  } else {
    wrongAnswers.value.push({ exercise, selected: selectedOption.value })
  }

  // 记录错题（异步，不阻塞 UI）
  recordAnswer(exercise.id, isCorrect.value).catch((e) =>
    console.error('[exercise] record error:', e)
  )
}

function nextQuestion() {
  if (currentQ.value + 1 >= totalQ.value) {
    finishExercise()
  } else {
    currentQ.value++
    selectedOption.value = -1
    answered.value = false
  }
}

function finishExercise() {
  stopTimer()

  // 保存练习记录（异步，不阻塞 UI）
  saveSession({
    date: new Date().toISOString(),
    total: totalQ.value,
    correct: correctCount.value,
    duration: totalTime.value,
    level: settings.value.level as JLPTLevel | 'mixed',
    type: settings.value.type as ExerciseType | 'mixed',
  }).catch((e) => console.error('[exercise] save session error:', e))

  activeTab.value = 'result'
}

function exitQuiz() {
  stopTimer()
  activeTab.value = 'setup'
}

function switchTab(key: string) {
  // 答题中不允许直接切 tab，避免状态丢失
  if (activeTab.value === 'quiz' && key !== 'quiz') return
  activeTab.value = key
}

function optionClass(i: number) {
  if (!answered.value) return ''
  if (i === currentExercise.value?.answer) return 'option-correct'
  if (i === selectedOption.value) return 'option-wrong'
  return ''
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

onUnload(() => {
  stopTimer()
})
</script>

<style lang="scss" scoped>
.tab-bar {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  border-radius: 12rpx;
  color: #666;

  &.active {
    background: #A3C1AD;
    color: #fff;
    font-weight: 500;
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.notice {
  background: rgba(243, 156, 18, 0.1);
  border: 1rpx solid rgba(243, 156, 18, 0.25);
  font-size: 26rpx;
  color: #b9770e;
  text-align: center;
}

.setting-row {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx;

  &:last-child {
    border-bottom: none;
  }
}

.picker-value {
  color: #A3C1AD;
  font-weight: 500;
}

.setup-info {
  text-align: center;
  padding: 16rpx;
  background: #f7f7f7;
  border-radius: 10rpx;
  margin: 20rpx 0;
  font-size: 26rpx;
  color: #888;
}

.btn.disabled {
  opacity: 0.5;
}

/* 答题 */
.progress-bar {
  height: 8rpx;
  background: #eee;
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #A3C1AD;
  border-radius: 999rpx;
  transition: width 0.3s;
}

.type-tag {
  display: inline-block;
  padding: 4rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(163, 193, 173, 0.2);
  color: #5A9A6F;
  font-size: 24rpx;
  margin-bottom: 16rpx;
}

.question-text {
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.8;
  white-space: pre-line;
}

.options {
  margin-top: 24rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  margin-bottom: 16rpx;
  font-size: 30rpx;
}

.option-letter {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-weight: 600;
  font-size: 24rpx;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  line-height: 1.5;
}

.option-correct {
  background: rgba(39, 174, 96, 0.1);
  border: 2rpx solid #27ae60;
}

.option-wrong {
  background: rgba(231, 76, 60, 0.1);
  border: 2rpx solid #e74c3c;
}

.answer-result {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16rpx;

  &.correct {
    color: #27ae60;
  }
  &.wrong {
    color: #e74c3c;
  }
}

.explanation {
  display: block;
  font-size: 26rpx;
  line-height: 1.6;
  color: #555;
}

/* 结果 */
.result-score {
  font-size: 88rpx;
  font-weight: 700;
  color: #A3C1AD;
}

.empty-icon {
  font-size: 72rpx;
  margin-bottom: 16rpx;
}

.wrong-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.wrong-q {
  display: block;
  font-size: 28rpx;
  line-height: 1.5;
  margin-bottom: 8rpx;
}

.wrong-a {
  display: block;
  font-size: 26rpx;
  color: #27ae60;
  margin-bottom: 4rpx;
}

.wrong-e {
  display: block;
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}
</style>
