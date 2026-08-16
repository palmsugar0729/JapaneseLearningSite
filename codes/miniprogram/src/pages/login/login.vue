<template>
  <view class="container">
    <view class="header">
      <text class="title">日语学习</text>
      <text class="subtitle">Japanese Learning</text>
    </view>

    <view class="card">
      <!-- 微信一键登录（小程序端） -->
      <!-- #ifdef MP-WEIXIN -->
      <view class="btn btn-primary" @click="wxLogin">
        <text>微信一键登录</text>
      </view>
      <!-- #endif -->

      <!-- 账号密码登录（H5+小程序通用） -->
      <view class="divider">
        <text class="divider-text">或使用账号登录</text>
      </view>

      <view class="form-group">
        <text class="form-label">用户名</text>
        <input
          class="form-input"
          v-model="username"
          placeholder="请输入用户名"
          placeholder-style="color: #ccc"
        />
      </view>

      <view class="form-group">
        <text class="form-label">密码</text>
        <input
          class="form-input"
          v-model="password"
          type="password"
          placeholder="请输入密码"
          placeholder-style="color: #ccc"
        />
      </view>

      <view class="btn btn-primary mt-lg" @click="handleLogin">
        <text>{{ loading ? '登录中...' : '登录' }}</text>
      </view>

      <view class="flex-center mt-base">
        <text class="text-sm text-secondary">还没有账号？</text>
        <text class="text-sm text-primary" @click="goRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api, setToken, setUser } from '@/api/client'
import { initSRSFromServer } from '@/composables/useSRS'
import { initExerciseFromServer } from '@/composables/useExerciseProgress'

const username = ref('')
const password = ref('')
const loading = ref(false)

// 登录成功后拉取服务端学习进度（失败自动回退本地存储）
function loadServerProgress() {
  initSRSFromServer().catch((e) => console.warn('[login] initSRS:', e))
  initExerciseFromServer().catch((e) => console.warn('[login] initExercise:', e))
}

async function handleLogin() {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await api.post<{ token: string; user: { id: number; username: string } }>(
      '/auth/login',
      { username: username.value, password: password.value }
    )
    setToken(res.token)
    setUser(res.user)
    loadServerProgress()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1000)
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// #ifdef MP-WEIXIN
async function wxLogin() {
  try {
    const loginRes = await uni.login({ provider: 'weixin' })
    const res = await api.post<{ token: string; user: { id: number; username: string } }>(
      '/auth/wx-login',
      { code: loginRes.code }
    )
    setToken(res.token)
    setUser(res.user)
    loadServerProgress()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1000)
  } catch (e: any) {
    uni.showToast({ title: e.message || '微信登录失败', icon: 'none' })
  }
}
// #endif

function goRegister() {
  uni.navigateTo({ url: '/pages/login/register' })
}
</script>

<style lang="scss" scoped>
.header {
  padding: 80rpx 0 48rpx;
  text-align: center;
}

.title {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  color: #A3C1AD;
  margin-bottom: 8rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #999;
}

.divider {
  display: flex;
  align-items: center;
  margin: 32rpx 0;
  color: #ccc;
  font-size: 24rpx;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1rpx;
    background: #eee;
  }
}

.divider-text {
  padding: 0 24rpx;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 12rpx;
  color: #666;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}
</style>
