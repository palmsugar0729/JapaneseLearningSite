<template>
  <view class="container">
    <!-- 顶部切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 设置模式 -->
    <view v-if="activeTab === 'setup'">
      <view class="card">
        <text class="section-title">练习设置</text>
        <view class="setting-row flex-between">
          <text>级别</text>
          <picker :range="levelOptions" :value="levelIndex" @change="onLevelChange">
            <text>{{ levelOptions[levelIndex] }}</text>
          </picker>
        </view>
        <view class="setting-row flex-between">
          <text>题型</text>
          <picker :range="typeOptions" :value="typeIndex" @change="onTypeChange">
            <text>{{ typeOptions[typeIndex] }}</text>
          </picker>
        </view>
        <view class="setting-row flex-between">
          <text>题目数量</text>
          <picker :range="countOptions" :value="countIndex" @change="onCountChange">
            <text>{{ countOptions[countIndex] }} 题</text>
          </picker>
        </view>
        <view class="btn btn-primary mt-lg" @click="startExercise">开始练习</view>
      </view>

      <view class="card" @click="activeTab = 'wrong'">
        <view class="flex-between">
          <text>错题本</text>
          <text class="text-primary">{{ wrongCount }} 题</text>
        </view>
      </view>
    </view>

    <!-- 答题模式 -->
    <view v-if="activeTab === 'quiz'">
      <view class="card">
        <view class="flex-between mb-base">
          <text class="text-sm text-secondary">第 {{ currentQ + 1 }} / {{ totalQ }} 题</text>
          <text class="text-sm text-secondary">{{ elapsed }}s</text>
        </view>
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
          <text>{{ opt }}</text>
        </view>
      </view>

      <view v-if="answered" class="card card-tinted">
        <text class="text-sm">{{ currentExercise?.explanation }}</text>
      </view>

      <view class="btn btn-primary mt-lg" v-if="answered" @click="nextQuestion">
        {{ currentQ + 1 >= totalQ ? '查看结果' : '下一题' }}
      </view>
    </view>

    <!-- 结果模式 -->
    <view v-if="activeTab === 'result'">
      <view class="card flex-center" style="flex-direction: column">
        <text class="result-score">{{ correctCount }} / {{ totalQ }}</text>
        <text class="text-lg mt-sm">正确率 {{ accuracy }}%</text>
        <text class="text-sm text-secondary mt-sm">用时 {{ totalTime }}s</text>
      </view>
      <view class="btn btn-primary" @click="activeTab = 'setup'">再来一次</view>
      <view class="btn btn-outline mt-base" @click="activeTab = 'setup'">返回</view>
    </view>

    <!-- 错题本模式 -->
    <view v-if="activeTab === 'wrong'">
      <view class="card" v-if="wrongCount === 0">
        <view class="empty-state">
          <text class="empty-icon">📋</text>
          <text>错题本是空的，继续努力！</text>
        </view>
      </view>
      <view v-else>
        <view class="card">
          <text>错题回顾 — 开发中</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getWrongList, getWrongCount } from '@/composables/useExerciseProgress'
import type { Exercise } from '@/types/japanese'

const tabs = [
  { key: 'setup', label: '练习' },
  { key: 'quiz', label: '答题' },
  { key: 'result', label: '结果' },
  { key: 'wrong', label: '错题本' },
]

const activeTab = ref('setup')
const levelOptions = ['N5', 'N4', 'N3', 'N2', 'N1', '全部']
const typeOptions = ['选择题', '翻译题', '混合']
const countOptions = [5, 10, 15, 20]

const levelIndex = ref(5)
const typeIndex = ref(2)
const countIndex = ref(1)

const currentQ = ref(0)
const totalQ = ref(0)
const correctCount = ref(0)
const elapsed = ref(0)
const answered = ref(false)
const selectedOption = ref(-1)
const exercises = ref<Exercise[]>([])
const startTime = ref(0)
let timer: any = null

const letters = ['A', 'B', 'C', 'D']
const wrongCount = computed(() => getWrongCount())

const currentExercise = computed(() => exercises.value[currentQ.value])
const totalTime = computed(() => Math.floor((Date.now() - startTime.value) / 1000))
const accuracy = computed(() => {
  if (totalQ.value === 0) return 0
  return Math.round((correctCount.value / totalQ.value) * 100)
})

function onLevelChange(e: any) { levelIndex.value = e.detail.value }
function onTypeChange(e: any) { typeIndex.value = e.detail.value }
function onCountChange(e: any) { countIndex.value = e.detail.value }

function startExercise() {
  // TODO: 加载真实练习题
  totalQ.value = countOptions[countIndex.value]
  currentQ.value = 0
  correctCount.value = 0
  answered.value = false
  selectedOption.value = -1
  startTime.value = Date.now()
  activeTab.value = 'quiz'

  timer = setInterval(() => {
    elapsed.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

function selectOption(i: number) {
  if (answered.value) return
  answered.value = true
  selectedOption.value = i
  if (currentExercise.value && i === currentExercise.value.answer) {
    correctCount.value++
  }
}

function nextQuestion() {
  if (currentQ.value + 1 >= totalQ.value) {
    clearInterval(timer)
    activeTab.value = 'result'
  } else {
    currentQ.value++
    answered.value = false
    selectedOption.value = -1
  }
}

function optionClass(i: number) {
  if (!answered.value) return ''
  if (i === currentExercise.value?.answer) return 'option-correct'
  if (i === selectedOption.value) return 'option-wrong'
  return ''
}
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
  margin-bottom: 24rpx;
  display: block;
}

.setting-row {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx;

  &:last-child {
    border-bottom: none;
  }
}

.question-text {
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.8;
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
}

.option-correct {
  background: rgba(39, 174, 96, 0.1);
  border: 2rpx solid #27ae60;
}

.option-wrong {
  background: rgba(231, 76, 60, 0.1);
  border: 2rpx solid #e74c3c;
}

.result-score {
  font-size: 72rpx;
  font-weight: 700;
  color: #A3C1AD;
}
</style>
