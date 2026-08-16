<template>
  <view class="container">
    <view class="card flex-center" style="flex-direction: column">
      <view class="avatar">
        <text class="avatar-text">{{ initial }}</text>
      </view>
      <text class="text-lg mt-sm">{{ user?.username || '未登录' }}</text>
      <text class="text-sm text-secondary mt-sm">{{ user?.openid ? '微信用户' : '账号用户' }}</text>
    </view>

    <view class="card">
      <view class="menu-item flex-between" @click="goPage('/pages/login/login')">
        <text>切换账号</text>
        <text class="text-secondary">›</text>
      </view>
      <view class="menu-item flex-between" @click="handleLogout">
        <text class="text-danger">退出登录</text>
        <text class="text-secondary">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getUser, setToken, setUser } from '@/api/client'
import { resetSRSInit } from '@/composables/useSRS'
import { resetExerciseInit } from '@/composables/useExerciseProgress'

const user = ref(getUser())

const initial = computed(() => {
  return user.value?.username?.charAt(0).toUpperCase() || '?'
})

function goPage(url: string) {
  uni.navigateTo({ url })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '退出后需要重新登录',
    success(res) {
      if (res.confirm) {
        setToken(null)
        setUser(null)
        resetSRSInit()
        resetExerciseInit()
        user.value = null
        uni.switchTab({ url: '/pages/index/index' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #A3C1AD;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: 600;
}

.menu-item {
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 30rpx;

  &:last-child {
    border-bottom: none;
  }
}

.text-danger {
  color: #e74c3c;
}
</style>
